# 🚢 Imágenes Personalizadas de Barcos

## 📋 Cómo Funciona

El sistema ahora **detecta automáticamente** si existe una imagen personalizada para cada barco. Si la encuentra, la usa. Si no, muestra la imagen por defecto.

---

## 📝 INSTRUCCIONES PASO A PASO

### 1. Consigue la imagen del barco
- Busca una foto del barco en Google, sitios web navieros, etc.
- Formatos soportados: **JPG** (recomendado), PNG también funciona si lo renombras a .jpg

### 2. Guarda la imagen con el nombre correcto
El nombre del archivo DEBE seguir esta convención:

**REGLA:** Nombre del barco → todo en minúsculas → espacios por guiones → sin caracteres especiales

#### Ejemplos de nombres:

| Nombre del Barco | Nombre del Archivo |
|------------------|-------------------|
| MSC POSITANO | `msc-positano.jpg` |
| CMA CGM ALMAVIVA | `cma-cgm-almaviva.jpg` |
| MAERSK ESSEN | `maersk-essen.jpg` |
| ONE INNOVATION | `one-innovation.jpg` |
| EUKOR MORNING SPRINTER | `eukor-morning-sprinter.jpg` |
| HÖEGH TRAPPER | `hoegh-trapper.jpg` |
| R/E | `r-e.jpg` |
| Trincadores | `trincadores.jpg` |

### 3. Coloca la imagen en esta carpeta
Ruta: `PortalEstibaVLC/assets/barcos/[nombre-del-barco].jpg`

### 4. Recarga la página
¡La imagen del barco debería aparecer cuando expandas el desplegable!

---

## 🔍 Verificación

Cuando expandas un barco en el tablón:
- ✅ Si existe la imagen personalizada → Se muestra tu foto
- ✅ Si NO existe → Se muestra la imagen por defecto (barco genérico)

---

## 💡 Consejos

### Tamaño de las imágenes:
- **Ancho recomendado:** 800-1200px
- **Proporción:** 4:3 o 16:9 (horizontal)
- **Peso:** Máximo 500KB (comprime si es necesario)

### Calidad:
- Busca imágenes de buena resolución
- Mejor con buena iluminación
- Preferiblemente del barco completo (vista lateral)

### Conversión de nombres automática:
El sistema automáticamente:
- ❌ Convierte "MSC POSITANO"
- ✅ A "msc-positano.jpg"
- ❌ Convierte "HÖEGH Trapper"
- ✅ A "hoegh-trapper.jpg" (elimina acentos/diéresis)
- ❌ Convierte "R/E"
- ✅ A "r-e.jpg" (la barra se convierte en guión)

---

## 🤖 Automatizar con Claude Agente de Navegador

**¿Tienes muchos barcos y quieres automatizar la descarga de imágenes?**

Sí, Claude Agente de Navegador puede ayudarte! Es una herramienta separada que puede:

### Lo que puede hacer:
1. **Buscar automáticamente** imágenes de cada barco en Google
2. **Descargar** las mejores fotos
3. **Renombrarlas** correctamente según la convención
4. **Guardarlas** en esta carpeta

### Cómo usarlo:
1. Abre Claude Agente de Navegador (extensión que instalaste)
2. Dale esta instrucción:

```
Necesito que busques imágenes de estos barcos y las descargues:
- MSC POSITANO
- CMA CGM ALMAVIVA
- MAERSK ESSEN
[... lista completa de barcos]

Para cada barco:
1. Busca "[nombre del barco] ship" en Google Imágenes
2. Descarga una imagen de buena calidad (vista lateral preferiblemente)
3. Guárdala como "[nombre-normalizado].jpg" en la carpeta de descargas
4. Nombres normalizados: minúsculas, espacios por guiones, sin acentos

Por ejemplo: "MSC POSITANO" → "msc-positano.jpg"
```

3. Cuando termine, **mueve todas las imágenes** de tu carpeta de Descargas a:
   `PortalEstibaVLC/assets/barcos/`

---

## 📊 Lista de Barcos Actual

Puedes ver qué barcos aparecen actualmente en el tablón y preparar imágenes para ellos.

Para saber qué nombres de archivo necesitas:
1. Abre la consola del navegador (F12)
2. Ve al tablón
3. Los nombres de archivo esperados se muestran en la consola cuando expandes cada barco

---

## ❓ Troubleshooting

### La imagen no aparece:
1. ✅ Verifica que el nombre del archivo sea EXACTAMENTE como se indica
2. ✅ Debe estar en formato `.jpg` (no .jpeg, no .png)
3. ✅ Debe estar en la carpeta `assets/barcos/`
4. ✅ Recarga la página (Ctrl + F5 para forzar recarga)

### Conversión de nombres difícil:
Si no estás seguro del nombre correcto:
1. Abre la consola del navegador (F12)
2. Expande el barco en el tablón
3. Busca en la consola el mensaje: `"Intentando cargar: assets/barcos/[nombre].jpg"`
4. Ese es el nombre exacto que debes usar

---

**Nota:** El sistema es completamente opcional. Si no añades imágenes, seguirá funcionando con las imágenes por defecto.
