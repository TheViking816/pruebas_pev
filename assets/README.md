# 🚨 IMPORTANTE: Logo de la Aplicación

## ⚠️ El logo NO se está mostrando porque falta el archivo

### 📝 INSTRUCCIONES PASO A PASO:

## Opción A: Guardar el Logo Localmente (RECOMENDADO)

1. **Descarga el logo** de la imagen que te pasé (la grúa con contenedor y texto "Portal EstibaVLC")
2. **Guárdalo** con el nombre exacto: `logo.png`
3. **Colócalo** en esta carpeta (`assets/`)
4. La ruta completa debe ser: `PortalEstibaVLC/assets/logo.png`
5. **Recarga la página** - ¡El logo debería aparecer!

## Opción B: Usar Imgur (Alternativa)

Si prefieres usar Imgur:

1. Sube el logo a Imgur
2. **HAZ CLIC DERECHO en la imagen** → "Copiar dirección de imagen"
3. La URL CORRECTA debe verse así: `https://i.imgur.com/XXXXXX.png`
   - ✅ Correcto: `https://i.imgur.com/abc123.png` (con la "i")
   - ❌ Incorrecto: `https://imgur.com/a/abc123` (sin la "i", es un álbum)
4. Reemplaza en `index.html`:
   - Línea 38: Cambia `assets/logo.png` por tu URL
   - Línea 132: Cambia `assets/logo.png` por tu URL

## ℹ️ Especificaciones del Logo:

- **Formato**: PNG (preferible con fondo transparente)
- **Nombre del archivo**: `logo.png` (exactamente así)
- **Ubicación**: Carpeta `assets/`
- **Tamaño recomendado**: 512x512 px o superior
- **Proporciones**: Cuadrado (1:1)

## 🔍 Verificación:

El logo aparece en 2 lugares:
- ✅ Header (arriba a la izquierda) - 60x60px
- ✅ Pantalla de login - 120x120px

Si no ves el logo, verás el favicon por defecto como respaldo.

---

**Nota**: El código ya está actualizado con un sistema de fallback. Si no encuentra `assets/logo.png`, mostrará el favicon como respaldo.
