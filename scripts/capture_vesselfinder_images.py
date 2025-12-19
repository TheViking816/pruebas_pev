#!/usr/bin/env python3
from __future__ import annotations

import argparse
import os
import re
import sys
import time
import unicodedata
import urllib.parse
from io import BytesIO
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from PIL import Image
from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
from playwright.sync_api import sync_playwright


def normalize_ship_name(name: str) -> str:
    name = name.strip()
    name = unicodedata.normalize("NFKD", name)
    name = "".join(ch for ch in name if not unicodedata.combining(ch))
    name = name.lower()
    name = re.sub(r"[^a-z0-9]+", "-", name)
    name = re.sub(r"-{2,}", "-", name).strip("-")
    return name or "barco"


def _default_downloads_dir() -> Path:
    home = Path.home()
    candidates = [
        home / "Downloads",
        home / "Descargas",
        Path(os.environ.get("USERPROFILE", "")) / "Downloads",
        Path(os.environ.get("USERPROFILE", "")) / "Descargas",
    ]
    for candidate in candidates:
        if candidate and candidate.exists() and candidate.is_dir():
            return candidate
    return home


@dataclass(frozen=True)
class ShipRequest:
    raw_name: str
    normalized: str


def parse_ship_list(path: Path) -> list[ShipRequest]:
    items: list[ShipRequest] = []
    for line in path.read_text(encoding="utf-8-sig").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        # Reuse the same TXT format as el otro script: NAME | URL (se ignora aquí).
        if "|" in line:
            left, _right = line.split("|", 1)
            line = left.strip()
        items.append(ShipRequest(raw_name=line, normalized=normalize_ship_name(line)))
    return items


def _accept_cookies_if_present(page) -> None:
    # VesselFinder puede mostrar banners CMP distintos. Intentamos aceptar/cerrar si es posible.
    candidates = [
        "#onetrust-accept-btn-handler",
        "button:has-text('Accept all')",
        "button:has-text('Accept All')",
        "button:has-text('Aceptar todo')",
        "button:has-text('Aceptar')",
        "button:has-text('I agree')",
        "button:has-text('Agree')",
        "button:has-text('OK')",
        "button:has-text('Got it')",
        "[aria-label='Accept all']",
        "[aria-label='Accept']",
        "[aria-label='Close']",
        "button[aria-label='Close']",
        "button:has-text('Close')",
        "button:has-text('Cerrar')",
    ]
    for sel in candidates:
        try:
            locator = page.locator(sel).first
            if locator.count() and locator.is_visible():
                locator.click(timeout=2000)
                time.sleep(0.25)
                return
        except Exception:
            continue


def _hide_cookie_overlays(page) -> None:
    # Fallback: si el banner tapa la foto, lo ocultamos (sin interactuar con el CMP).
    try:
        page.evaluate(
            """() => {
              const selectors = [
                '#onetrust-banner-sdk',
                '#onetrust-consent-sdk',
                "iframe[id*='consent']",
                "iframe[src*='consent']",
                "iframe[src*='privacy']",
                "iframe[src*='cmp']",
                "div[id*='cookie']",
                "div[class*='cookie']",
                "div[id*='consent']",
                "div[class*='consent']",
                "section[id*='cookie']",
                "section[class*='cookie']",
                "aside[id*='cookie']",
                "aside[class*='cookie']",
                "[data-nosnippet*='cookie']",
              ];
              for (const sel of selectors) {
                document.querySelectorAll(sel).forEach((el) => {
                  el.style.setProperty('display', 'none', 'important');
                  el.style.setProperty('visibility', 'hidden', 'important');
                  el.style.setProperty('opacity', '0', 'important');
                  el.style.setProperty('pointer-events', 'none', 'important');
                });
              }

              // Heurística: ocultar overlays "grandes" (cookie/consent) por texto/posición/z-index.
              const keywords = [
                'cookie',
                'cookies',
                'consent',
                'gdpr',
                'privacy',
                'personalised',
                'personalized',
                'advertising',
                'measurement',
                'store and/or access information',
                'manage options',
                'accept all',
                'reject all',
              ];
              const hasKeywords = (text) => {
                const t = (text || '').toLowerCase();
                return keywords.some((k) => t.includes(k));
              };
              const isLarge = (r) => {
                const vw = Math.max(1, window.innerWidth);
                const vh = Math.max(1, window.innerHeight);
                return (r.width * r.height) > (vw * vh * 0.12);
              };
              const hideEl = (el) => {
                el.style.setProperty('display', 'none', 'important');
                el.style.setProperty('visibility', 'hidden', 'important');
                el.style.setProperty('opacity', '0', 'important');
                el.style.setProperty('pointer-events', 'none', 'important');
              };

              const candidates = Array.from(document.querySelectorAll('div,section,aside,dialog,iframe'));
              for (const el of candidates) {
                const style = window.getComputedStyle(el);
                if (!style) continue;
                const pos = style.position;
                if (pos !== 'fixed' && pos !== 'sticky') continue;
                const z = parseInt(style.zIndex || '0', 10);
                if (!Number.isFinite(z) || z < 1000) continue;
                const r = el.getBoundingClientRect();
                if (!isLarge(r)) continue;

                const txt = (el.tagName === 'IFRAME') ? '' : (el.innerText || el.textContent || '');
                if (hasKeywords(txt) || el.id.toLowerCase().includes('consent') || el.id.toLowerCase().includes('cookie')) {
                  hideEl(el);
                }
              }
            }"""
        )
    except Exception:
        pass


def _pick_best_result_link(page, ship_name: str) -> Optional[str]:
    ship_norm = normalize_ship_name(ship_name)
    tokens = [t for t in ship_norm.split("-") if t]

    # Estrategia:
    # 1) Buscar enlaces que parezcan de "vessel details".
    # 2) Preferir el que contenga todos los tokens del nombre.
    # 3) Si no, coger el primero disponible.
    links = page.locator("a[href*='/vessels/details/']")
    try:
        count = links.count()
    except Exception:
        return None
    if count == 0:
        return None

    best_href = None
    best_score = -1
    for i in range(min(count, 30)):
        a = links.nth(i)
        try:
            href = a.get_attribute("href") or ""
            text = (a.inner_text() or "").strip().lower()
        except Exception:
            continue
        haystack = f"{href} {text}"
        score = 0
        for t in tokens:
            if t in haystack:
                score += 1
        if score > best_score:
            best_score = score
            best_href = href

    return best_href


def _find_main_photo_locator(page):
    # Elegimos la imagen “principal” con heurística en el DOM.
    try:
        best = page.evaluate(
            """() => {
              const badClosestSelectors = [
                '#onetrust-banner-sdk',
                '#onetrust-consent-sdk',
                "[id*='cookie']",
                "[class*='cookie']",
                "[id*='consent']",
                "[class*='consent']",
                "[id*='cmp']",
                "[class*='cmp']",
              ];
              const badRegex = /(sprite|icon|logo|avatar|flag|ads|doubleclick|googlesyndication|onetrust|consent|cookie)/i;
              const preferRegex = /(vesselfinder|vessel|ship|photos?)/i;

              const isVisible = (el) => {
                const style = window.getComputedStyle(el);
                if (!style || style.display === 'none' || style.visibility === 'hidden') return false;
                if (parseFloat(style.opacity || '1') === 0) return false;
                const r = el.getBoundingClientRect();
                if (r.width < 220 || r.height < 140) return false;
                // Debe estar al menos parcialmente en viewport
                if (r.bottom < 0 || r.right < 0 || r.top > (window.innerHeight + 50) || r.left > (window.innerWidth + 50)) return false;
                return true;
              };

              const isBad = (img) => {
                if (badRegex.test(img.src || '')) return true;
                for (const sel of badClosestSelectors) {
                  if (img.closest(sel)) return true;
                }
                return false;
              };

              let best = null;
              let bestScore = -1;
              for (const img of Array.from(document.images)) {
                if (!img.src) continue;
                if (!isVisible(img)) continue;
                if (isBad(img)) continue;

                const r = img.getBoundingClientRect();
                const area = r.width * r.height;
                const natural = (img.naturalWidth || 0) * (img.naturalHeight || 0);
                let score = Math.max(area, natural);

                // Preferimos JPG/PNG “reales”
                if (/\\.(jpe?g|png)(\\?.*)?$/i.test(img.src)) score *= 1.15;
                // Preferimos URLs relacionadas con vessel/ship
                if (preferRegex.test(img.src) || preferRegex.test(img.alt || '')) score *= 1.25;
                // Penaliza imágenes demasiado “cuadradas” (muchos iconos)
                const ratio = r.width / Math.max(1, r.height);
                if (ratio < 0.9 || ratio > 3.5) score *= 0.9;

                if (score > bestScore) {
                  bestScore = score;
                  best = { src: img.currentSrc || img.src, alt: img.alt || '' };
                }
              }
              return best;
            }"""
        )
    except Exception:
        best = None

    if not best or not best.get("src"):
        return None

    src = best["src"]
    escaped = src.replace("\\", "\\\\").replace('"', '\\"')
    loc = page.locator(f'img[src="{escaped}"]').first
    try:
        if loc.count() and loc.is_visible():
            return loc
    except Exception:
        return None
    # Fallback: contains match (por si el navegador cambia currentSrc)
    try:
        src_path = urllib.parse.urlparse(src).path
        base = Path(src_path).name
        if base:
            loc2 = page.locator(f'img[src*="{base}"]').first
            if loc2.count() and loc2.is_visible():
                return loc2
    except Exception:
        pass
    return None


def _find_main_photo_src(page) -> Optional[str]:
    try:
        best = page.evaluate(
            """() => {
              const badRegex = /(sprite|icon|logo|avatar|flag|ads|doubleclick|googlesyndication|onetrust|consent|cookie)/i;
              const preferRegex = /(vesselfinder|vessel|ship|photos?)/i;

              const isVisible = (el) => {
                const style = window.getComputedStyle(el);
                if (!style || style.display === 'none' || style.visibility === 'hidden') return false;
                if (parseFloat(style.opacity || '1') === 0) return false;
                const r = el.getBoundingClientRect();
                if (r.width < 220 || r.height < 140) return false;
                if (r.bottom < 0 || r.right < 0 || r.top > (window.innerHeight + 50) || r.left > (window.innerWidth + 50)) return false;
                return true;
              };

              let bestSrc = null;
              let bestScore = -1;
              for (const img of Array.from(document.images)) {
                if (!img.src) continue;
                if (!isVisible(img)) continue;
                if (badRegex.test(img.src || '')) continue;

                const r = img.getBoundingClientRect();
                const area = r.width * r.height;
                const natural = (img.naturalWidth || 0) * (img.naturalHeight || 0);
                let score = Math.max(area, natural);

                if (/\\.(jpe?g|png)(\\?.*)?$/i.test(img.src)) score *= 1.15;
                if (preferRegex.test(img.src) || preferRegex.test(img.alt || '')) score *= 1.25;
                const ratio = r.width / Math.max(1, r.height);
                if (ratio < 0.9 || ratio > 3.5) score *= 0.9;

                if (score > bestScore) {
                  bestScore = score;
                  bestSrc = img.currentSrc || img.src;
                }
              }
              return bestSrc;
            }"""
        )
        if isinstance(best, str) and best:
            return best
    except Exception:
        return None
    return None


def _save_element_screenshot_as_jpg(locator, dest_jpg: Path, *, quality: int = 92) -> None:
    dest_jpg.parent.mkdir(parents=True, exist_ok=True)
    png_bytes = locator.screenshot(type="png")
    with Image.open(BytesIO(png_bytes)) as img:
        img = img.convert("RGB")
        img.save(dest_jpg, format="JPEG", quality=quality, optimize=True)


def _save_image_url_as_jpg(context, image_url: str, dest_jpg: Path, *, quality: int = 92, timeout_ms: int = 45000) -> None:
    # Abre la URL de la imagen en una pestaña separada para evitar overlays (cookies/consent).
    page = context.new_page()
    try:
        page.set_default_timeout(timeout_ms)
        page.goto(image_url, wait_until="domcontentloaded")
        loc = page.locator("img").first
        loc.wait_for(state="visible", timeout=timeout_ms)
        _save_element_screenshot_as_jpg(loc, dest_jpg, quality=quality)
    finally:
        page.close()


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(
        description="Bot (Playwright) que busca barcos en VesselFinder y guarda una captura de la foto en assets/barcos."
    )
    parser.add_argument(
        "--input",
        default=str(Path("scripts") / "ships.txt"),
        help="TXT con una línea por barco (solo nombre; se ignoran URLs).",
    )
    parser.add_argument(
        "--out-dir",
        default=str(Path("assets") / "barcos"),
        help="Carpeta destino final.",
    )
    parser.add_argument("--overwrite", action="store_true", help="Sobrescribe imágenes existentes.")
    parser.add_argument(
        "--headful",
        action="store_true",
        help="Muestra el navegador (útil para depurar captchas/banners).",
    )
    parser.add_argument(
        "--pause-on-fail",
        action="store_true",
        help="Si falla un barco, deja el navegador abierto para inspección manual.",
    )
    parser.add_argument(
        "--timeout-ms",
        type=int,
        default=45000,
        help="Timeout por navegación/esperas (ms).",
    )
    args = parser.parse_args(argv)

    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

    input_path = Path(args.input)
    project_root = Path(__file__).resolve().parents[1]
    if not input_path.is_absolute():
        input_path = (project_root / input_path).resolve()
    if not input_path.exists():
        print(f"No existe el archivo de entrada: {input_path}", file=sys.stderr)
        return 2

    out_dir = Path(args.out_dir)
    if not out_dir.is_absolute():
        out_dir = (project_root / out_dir).resolve()
    print(f"[INFO] input={input_path}")
    print(f"[INFO] out_dir={out_dir}")

    requests = parse_ship_list(input_path)
    if not requests:
        print("No hay barcos en el TXT.", file=sys.stderr)
        return 2

    ok = 0
    failed: list[str] = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=not args.headful)
        context = browser.new_context(
            viewport={"width": 1400, "height": 900},
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/122.0.0.0 Safari/537.36"
            ),
        )
        page = context.new_page()
        page.set_default_timeout(args.timeout_ms)

        for req in requests:
            dest = out_dir / f"{req.normalized}.jpg"
            if dest.exists() and not args.overwrite:
                print(f"[SKIP] {req.raw_name} -> ya existe {dest}")
                ok += 1
                continue

            try:
                search_url = f"https://www.vesselfinder.com/vessels?name={urllib.parse.quote(req.raw_name)}"
                print(f"[OPEN] {req.raw_name} -> {search_url}")
                page.goto(search_url, wait_until="domcontentloaded")
                _accept_cookies_if_present(page)
                _hide_cookie_overlays(page)

                # Espera a que aparezcan resultados o algún mensaje de “no results”.
                try:
                    page.wait_for_load_state("networkidle", timeout=args.timeout_ms)
                    page.wait_for_function(
                        """() => {
                          const hasLinks = document.querySelectorAll("a[href*='/vessels/details/']").length > 0;
                          const noResults = /no results/i.test(document.body?.innerText || "");
                          return hasLinks || noResults;
                        }""",
                        timeout=args.timeout_ms,
                    )
                except PlaywrightTimeoutError:
                    raise RuntimeError("No se cargan resultados (timeout). Posible bloqueo/captcha.")

                href = _pick_best_result_link(page, req.raw_name)
                if not href:
                    raise RuntimeError("No encuentro enlaces a fichas de barcos en los resultados.")

                details_url = href if href.startswith("http") else f"https://www.vesselfinder.com{href}"
                print(f"[GO  ] {req.raw_name} -> {details_url}")
                page.goto(details_url, wait_until="domcontentloaded")
                _accept_cookies_if_present(page)
                _hide_cookie_overlays(page)

                # Espera a que cargue alguna imagen suficientemente grande.
                locator = None
                photo_src = None
                start = time.time()
                while time.time() - start < (args.timeout_ms / 1000.0):
                    _hide_cookie_overlays(page)
                    if not photo_src:
                        photo_src = _find_main_photo_src(page)
                    locator = _find_main_photo_locator(page)
                    if locator:
                        break
                    time.sleep(0.25)
                if not locator:
                    raise RuntimeError("No localizo la foto principal (o no carga).")

                _hide_cookie_overlays(page)
                if photo_src:
                    try:
                        _save_image_url_as_jpg(context, photo_src, dest, timeout_ms=args.timeout_ms)
                    except Exception:
                        _save_element_screenshot_as_jpg(locator, dest)
                else:
                    _save_element_screenshot_as_jpg(locator, dest)

                if not dest.exists() or dest.stat().st_size == 0:
                    raise RuntimeError(f"No se ha guardado el fichero esperado: {dest}")
                print(f"[OK  ] {req.raw_name} -> {dest}")
                ok += 1

            except Exception as e:
                msg = f"{req.raw_name}: {e}"
                failed.append(msg)
                print(f"[FAIL] {msg}", file=sys.stderr)
                if args.pause_on_fail:
                    print("Pausa activa: cierra el navegador para continuar...", file=sys.stderr)
                    page.pause()

        context.close()
        browser.close()

    print("")
    print(f"Completado: {ok}/{len(requests)}")
    if failed:
        print("Fallos:")
        for item in failed:
            print(f"- {item}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
