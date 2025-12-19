# Descarga automática de imágenes de barcos

Este repo espera imágenes en `assets/barcos/` con el nombre normalizado (minúsculas, espacios→guiones, sin acentos), por ejemplo: `MSC POSITANO` → `msc-positano.jpg`.

## Opción recomendada (sin “scraping”): Wikimedia Commons

El script `scripts/download_ship_images.py` busca imágenes en Wikimedia Commons (licencias libres) y:
1) descarga a tu carpeta de Descargas y
2) mueve el fichero final a `assets/barcos/`.

### 1) Edita la lista
Añade barcos en `scripts/ships.txt` (una línea por barco).

Formato opcional por línea si quieres forzar una imagen concreta:
`NOMBRE DEL BARCO | URL_DIRECTA`

### 2) Ejecuta
Desde la raíz del proyecto:

```bash
python scripts/download_ship_images.py
```

Notas:
- Si un barco no existe en Commons, el script lo marca como `FAIL`. En ese caso, usa `NOMBRE | URL_DIRECTA`.
- Por defecto no sobrescribe; usa `--overwrite` si quieres reemplazar imágenes.

## Sobre Google Imágenes

Automatizar descargas desde Google Imágenes suele implicar “scraping” y puede incumplir sus términos. Si necesitas 100% automático con resultados de Google/Bing, lo correcto es usar una API oficial (requiere clave) o pegar URLs directas en el TXT.

## Bot con capturas desde VesselFinder (Playwright)

Si prefieres un flujo “poner nombres y listo”, hay un bot que abre VesselFinder, entra a la ficha del barco y guarda una **captura JPG** de la foto principal en `assets/barcos/`:

1) Instala dependencias:
```bash
python -m pip install -r scripts/requirements.txt
python -m playwright install chromium
```

2) Edita `scripts/ships.txt` (solo nombres; el bot ignora `| URL`).

3) Ejecuta:
```bash
python scripts/capture_vesselfinder_images.py --overwrite
```

Si VesselFinder te muestra un captcha o banner raro, prueba:
`python scripts/capture_vesselfinder_images.py --headful --pause-on-fail`

