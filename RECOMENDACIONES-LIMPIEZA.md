# Recomendaciones de Limpieza y Optimización

## 📋 Resumen Ejecutivo

- **sheets.js**: ✅ **ELIMINAR** - Ya no se usa, reemplazado por supabase.js
- **Google Apps Script**: ⚠️ **NO FUNCIONA** por Cloudflare - Usar entrada manual
- **app.js**: 🔧 **OPTIMIZAR** - 6838 líneas, muchas pueden simplificarse

---

## 1. ✅ ELIMINAR sheets.js

**Razón**: Tu proyecto usa `supabase.js` que expone el mismo objeto `SheetsAPI`. El archivo `sheets.js` ya no se carga en `index.html` (línea 877 usa supabase.js).

**Acción**:
```bash
rm sheets.js
```

---

## 2. ⚠️ Google Apps Script - Cloudflare lo bloquea

### Problema identificado

Cloudflare bloquea las peticiones desde Google Apps Script porque:
- Detecta el user-agent de Google como bot
- Requiere JavaScript para el challenge (Apps Script no ejecuta JS del navegador)
- No mantiene sesiones/cookies

### Resultado del test

```
HTML tiene Cloudflare: true
"Just a moment" detectado
Fijos: 0, Gruas: 0
```

### ✅ Solución Recomendada: Mantener entrada manual

La entrada manual que ya tienes implementada es la solución más simple y funciona perfectamente:
- El usuario abre las páginas (Cloudflare le deja pasar)
- Copia los datos al modal
- Los datos se guardan en localStorage durante 6 horas

### Código a simplificar en app.js

**Líneas 5913-6079**: La función `cargarDatosNoray` tiene ~166 líneas de código que intentan hacer scraping automático, pero siempre falla por Cloudflare.

**Sugerencia**: Simplificar esta función a ~50 líneas que:
1. Intente cargar datos guardados en localStorage (< 6 horas)
2. Si no hay datos válidos, muestre directamente el modal manual
3. Elimine todo el código de scraping que nunca funciona

---

## 3. 🔧 Funciones de parseo de Noray

### Funciones que mantener (por si acaso)

Aunque no funcionan actualmente, **NO ELIMINAR** estas funciones:

```javascript
// app.js:5729
function parsePrevisionDemandaHTML(html) { ... }

// app.js:5807
function parseChaperoHTML(html) { ... }
```

**Razón**: Si en el futuro:
- Implementas un proxy/scraper propio
- Noray quita Cloudflare
- Usas Puppeteer/Playwright

Estas funciones serán útiles.

---

## 4. 📝 Código simplificado sugerido para app.js

### Reemplazar líneas 5913-6079 con:

```javascript
// Función para cargar datos desde Noray (simplificada)
// NOTA: Cloudflare bloquea el scraping automático, por lo que siempre usará datos guardados o abrirá el modal
window.cargarDatosNoray = async function() {
  var btnCargar = document.getElementById('btn-cargar-noray');
  var statusDiv = document.getElementById('noray-status');

  if (btnCargar) {
    btnCargar.disabled = true;
    btnCargar.innerHTML = '<span class="loading-spinner"></span> Cargando...';
  }

  try {
    // Intentar cargar datos guardados localmente primero
    var datosGuardados = localStorage.getItem('noray_datos_manual');
    if (datosGuardados) {
      var saved = JSON.parse(datosGuardados);
      // Si los datos tienen menos de 6 horas, usarlos directamente
      if (Date.now() - saved.timestamp < 6 * 60 * 60 * 1000) {
        console.log('✅ Usando datos guardados localmente (menos de 6 horas)');
        aplicarDatosNorayAlFormulario(saved);

        if (statusDiv) {
          var fecha = new Date(saved.timestamp);
          var horaStr = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
          statusDiv.innerHTML = '<span style="color: #10b981;">📁 Datos guardados ' + horaStr + '</span>';
          statusDiv.style.display = 'block';
        }
        return;
      }
    }

    // Si no hay datos guardados válidos, mostrar modal para introducir datos manualmente
    console.log('⚠️ No hay datos guardados válidos. Mostrando modal para entrada manual.');
    mostrarModalCargarNoray();
    if (statusDiv) {
      statusDiv.innerHTML = '<span style="color: #f59e0b;">⚠️ Cloudflare bloquea la carga automática. Introduce los datos manualmente.</span>';
      statusDiv.style.display = 'block';
    }

  } catch (error) {
    console.error('❌ Error cargando datos de Noray:', error);
    if (statusDiv) {
      statusDiv.innerHTML = '<span style="color: #ef4444;">Error al cargar datos</span>';
      statusDiv.style.display = 'block';
    }
  } finally {
    if (btnCargar) {
      btnCargar.disabled = false;
      btnCargar.innerHTML = 'Cargar datos Noray';
    }
  }
};

// Función auxiliar para aplicar datos al formulario
function aplicarDatosNorayAlFormulario(datos) {
  // Rellenar fijos
  var fijosInput = document.getElementById('calc-fijos');
  if (fijosInput && datos.fijos !== undefined) {
    fijosInput.value = datos.fijos;
  }

  // Jornada 1: 08-14
  var gruas1 = document.getElementById('calc-gruas-1');
  var coches1 = document.getElementById('calc-coches-1');
  if (gruas1 && datos.gruas0814 !== undefined) gruas1.value = datos.gruas0814;
  if (coches1 && datos.coches0814 !== undefined) coches1.value = datos.coches0814;

  // Jornada 2: 14-20
  var gruas2 = document.getElementById('calc-gruas-2');
  var coches2 = document.getElementById('calc-coches-2');
  if (gruas2 && datos.gruas1420 !== undefined) gruas2.value = datos.gruas1420;
  if (coches2 && datos.coches1420 !== undefined) coches2.value = datos.coches1420;

  // Jornada 3: 20-02
  var gruas3 = document.getElementById('calc-gruas-3');
  var coches3 = document.getElementById('calc-coches-3');
  if (gruas3 && datos.gruas2002 !== undefined) gruas3.value = datos.gruas2002;
  if (coches3 && datos.coches2002 !== undefined) coches3.value = datos.coches2002;
}
```

**Ahorro**: ~110 líneas de código eliminadas

---

## 5. 🎯 Alternativas para el futuro (opcional)

Si quieres scraping automático en el futuro, necesitarías:

### Opción A: Servidor proxy con Puppeteer

```javascript
// Servidor Node.js (Railway, Render, Vercel)
import puppeteer from 'puppeteer';

app.get('/api/noray/prevision', async (req, res) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://noray.cpevalencia.com/PrevisionDemanda.asp');
  const html = await page.content();
  await browser.close();

  // Parsear y devolver JSON
  res.json(parseHTML(html));
});
```

**Pros**: Funciona, Cloudflare lo deja pasar
**Contras**: Requiere servidor, costo hosting

### Opción B: Browser Extension

Crear una extensión del navegador que:
- Se ejecute en el contexto del navegador del usuario
- Acceda a Noray (Cloudflare no bloquea al usuario real)
- Extraiga los datos y los envíe a la PWA

**Pros**: Sin servidor
**Contras**: Usuarios deben instalar extensión

---

## 6. 📊 Resumen de cambios propuestos

| Archivo | Acción | Razón | Ahorro |
|---------|--------|-------|--------|
| `sheets.js` | ❌ Eliminar | Reemplazado por supabase.js | -1672 líneas |
| `app.js` función `cargarDatosNoray` | ✂️ Simplificar | Cloudflare bloquea scraping | -110 líneas |
| `parsePrevisionDemandaHTML` | ✅ Mantener | Útil si implementas proxy | 0 |
| `parseChaperoHTML` | ✅ Mantener | Útil si implementas proxy | 0 |

**Total líneas eliminadas**: ~1782 líneas
**Tamaño final app.js**: ~5056 líneas (de 6838)

---

## 7. ✅ Checklist de limpieza

- [ ] Eliminar `sheets.js`
- [ ] Simplificar función `cargarDatosNoray` (líneas 5913-6079)
- [ ] Añadir función auxiliar `aplicarDatosNorayAlFormulario`
- [ ] Actualizar comentarios explicando que Cloudflare bloquea el scraping
- [ ] Probar que la entrada manual sigue funcionando
- [ ] Commit con mensaje: "Limpieza: Eliminar sheets.js y simplificar carga Noray"

---

## 8. 🚀 Próximos pasos recomendados

1. **Ahora**: Aplicar la limpieza básica (eliminar sheets.js y simplificar cargarDatosNoray)
2. **Después**: Modularizar app.js en múltiples archivos por funcionalidad
3. **Futuro**: Si necesitas scraping automático, implementar opción A (servidor proxy)

---

**Fecha**: 2025-11-25
**Versión**: 1.0
