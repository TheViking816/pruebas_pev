#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import sys
import unicodedata
import urllib.parse
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Optional


COMMONS_API = "https://commons.wikimedia.org/w/api.php"


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


def _http_get_json(url: str, timeout_s: int = 30) -> dict:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "PortalEstibaVLC/ship-image-downloader (+https://github.com/; non-browser script)",
            "Accept": "application/json",
        },
        method="GET",
    )
    with urllib.request.urlopen(req, timeout=timeout_s) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _download_file(url: str, dest: Path, timeout_s: int = 60) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "PortalEstibaVLC/ship-image-downloader (+https://github.com/; non-browser script)",
            "Accept": "*/*",
        },
        method="GET",
    )
    with urllib.request.urlopen(req, timeout=timeout_s) as resp, open(dest, "wb") as f:
        shutil.copyfileobj(resp, f)


def _guess_suffix_from_url(url: str) -> str:
    path = urllib.parse.urlparse(url).path
    suffix = Path(path).suffix.lower()
    if suffix in (".jpg", ".jpeg", ".png", ".webp"):
        return suffix
    return ".bin"


@dataclass(frozen=True)
class ShipRequest:
    raw_name: str
    normalized: str
    direct_url: Optional[str] = None


def parse_ship_list(path: Path) -> list[ShipRequest]:
    items: list[ShipRequest] = []
    for line in path.read_text(encoding="utf-8-sig").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue

        # Allow: NAME | URL (URL optional)
        direct_url: Optional[str] = None
        raw_name = line
        if "|" in line:
            left, right = line.split("|", 1)
            raw_name = left.strip()
            right = right.strip()
            if right:
                direct_url = right

        normalized = normalize_ship_name(raw_name)
        items.append(ShipRequest(raw_name=raw_name, normalized=normalized, direct_url=direct_url))
    return items


def commons_search_best_jpeg(ship_name: str, *, limit: int = 12) -> Optional[str]:
    query = f'{ship_name} ship'
    params = {
        "action": "query",
        "format": "json",
        "origin": "*",
        "list": "search",
        "srnamespace": "6",  # File:
        "srlimit": str(limit),
        "srsearch": query,
    }
    url = f"{COMMONS_API}?{urllib.parse.urlencode(params)}"
    data = _http_get_json(url)
    results = data.get("query", {}).get("search", [])
    if not results:
        return None

    pageids = [str(r["pageid"]) for r in results if "pageid" in r]
    if not pageids:
        return None

    params2 = {
        "action": "query",
        "format": "json",
        "origin": "*",
        "prop": "imageinfo",
        "pageids": "|".join(pageids),
        "iiprop": "url|mime|size",
    }
    url2 = f"{COMMONS_API}?{urllib.parse.urlencode(params2)}"
    data2 = _http_get_json(url2)

    ship_norm = normalize_ship_name(ship_name)
    tokens = [t for t in ship_norm.split("-") if len(t) >= 3]
    ship_hints = (
        "imo",
        "mmsi",
        "ship",
        "vessel",
        "tanker",
        "container",
        "containership",
        "ferry",
        "bulk",
        "port",
    )

    best_url: Optional[str] = None
    best_score = -1
    pages = data2.get("query", {}).get("pages", {})
    for page in pages.values():
        title = (page.get("title") or "").lower()
        if not title:
            continue

        if tokens:
            if not all(t in title for t in tokens):
                continue
        else:
            continue

        if len(tokens) == 1 and not any(h in title for h in ship_hints):
            # Para nombres muy cortos, evita falsos positivos (lugares, personas, etc.).
            continue

        info = (page.get("imageinfo") or [None])[0]
        if not info:
            continue
        mime = (info.get("mime") or "").lower()
        if mime not in ("image/jpeg", "image/jpg"):
            continue
        width = int(info.get("width") or 0)
        height = int(info.get("height") or 0)
        url = info.get("url")
        if not url:
            continue
        score = width * height
        if score > best_score:
            best_score = score
            best_url = url

    return best_url


def maybe_convert_to_jpg(src_path: Path, dest_path: Path) -> None:
    if src_path.suffix.lower() in (".jpg", ".jpeg"):
        if src_path != dest_path:
            shutil.move(str(src_path), str(dest_path))
        return

    try:
        from PIL import Image  # type: ignore
    except Exception as e:  # pragma: no cover
        raise RuntimeError(
            f"No se puede convertir {src_path.name} a JPG (Pillow no está instalado): {e}"
        ) from e

    dest_path.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(src_path) as img:
        rgb = img.convert("RGB")
        rgb.save(dest_path, format="JPEG", quality=92, optimize=True)
    src_path.unlink(missing_ok=True)


def safe_move(src: Path, dest: Path, *, overwrite: bool) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists():
        if overwrite:
            dest.unlink()
        else:
            raise FileExistsError(f"Ya existe: {dest}")
    shutil.move(str(src), str(dest))


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(
        description="Descarga imágenes de barcos desde Wikimedia Commons a Descargas y las mueve a assets/barcos."
    )
    parser.add_argument(
        "--input",
        default=str(Path("scripts") / "ships.txt"),
        help="Ruta al TXT con los nombres de barcos.",
    )
    parser.add_argument(
        "--downloads-dir",
        default=None,
        help="Carpeta de Descargas (por defecto intenta ~/Downloads o ~/Descargas).",
    )
    parser.add_argument(
        "--move-to",
        default=str(Path("assets") / "barcos"),
        help="Carpeta destino final (por defecto assets/barcos).",
    )
    parser.add_argument("--overwrite", action="store_true", help="Sobrescribe imágenes existentes.")
    parser.add_argument(
        "--limit",
        type=int,
        default=12,
        help="Cuántos resultados evaluar por barco (Wikimedia Commons).",
    )
    args = parser.parse_args(argv)

    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

    project_root = Path(__file__).resolve().parents[1]
    input_path = Path(args.input)
    if not input_path.is_absolute():
        input_path = (project_root / input_path).resolve()
    if not input_path.exists():
        print(f"No existe el archivo de entrada: {input_path}", file=sys.stderr)
        return 2

    downloads_dir = Path(args.downloads_dir) if args.downloads_dir else _default_downloads_dir()
    move_to = Path(args.move_to)
    if not move_to.is_absolute():
        move_to = (project_root / move_to).resolve()
    print(f"[INFO] input={input_path}")
    print(f"[INFO] move_to={move_to}")

    requests = parse_ship_list(input_path)
    if not requests:
        print("No hay barcos en el TXT.", file=sys.stderr)
        return 2

    ok = 0
    failed: list[str] = []

    for req in requests:
        filename = f"{req.normalized}.jpg"
        temp_dest = downloads_dir / filename
        final_dest = move_to / filename

        if final_dest.exists() and not args.overwrite:
            print(f"[SKIP] {req.raw_name} -> ya existe {final_dest}")
            ok += 1
            continue

        try:
            if req.direct_url:
                image_url = req.direct_url
            else:
                image_url = commons_search_best_jpeg(req.raw_name, limit=args.limit)
                if not image_url:
                    raise RuntimeError("No se encontró JPG en Wikimedia Commons (File: namespace).")

            print(f"[GET ] {req.raw_name} -> {image_url}")

            # Download to a temporary file first
            tmp_path = downloads_dir / f"{req.normalized}.tmp{_guess_suffix_from_url(image_url)}"
            tmp_path.unlink(missing_ok=True)
            _download_file(image_url, tmp_path)

            # Ensure final is JPG (convert if needed)
            temp_dest.unlink(missing_ok=True)
            maybe_convert_to_jpg(tmp_path, temp_dest)

            safe_move(temp_dest, final_dest, overwrite=args.overwrite)
            print(f"[OK  ] {req.raw_name} -> {final_dest}")
            ok += 1
        except Exception as e:
            failed.append(f"{req.raw_name}: {e}")
            print(f"[FAIL] {req.raw_name}: {e}", file=sys.stderr)

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
