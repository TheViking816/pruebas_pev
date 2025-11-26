# 📋 INSTRUCCIONES COMPLETAS - Noray Scraper + Fix Error Consola

## 🎯 Resumen de lo que tienes ahora

✅ **Servidor de scraping creado**: `noray-scraper/`
- Usa Puppeteer para bypass Cloudflare
- API REST con Express
- Listo para desplegar en Render.com (GRATIS)

✅ **Documentación del error de consola**: `FIX-ERROR-CONSOLA.md`

---

## 🚀 PASO 1: Desplegar el servidor en Render.com (GRATIS)

### 1.1 Crear cuenta en Render

Ve a https://render.com y regístrate (con GitHub es más fácil)

### 1.2 Subir código a GitHub

```bash
# Ve a la carpeta del scraper
cd noray-scraper

# Inicializar git
git init
git add .
git commit -m "Noray scraper con Puppeteer"

# Crear repo en GitHub (opción 1: con gh CLI)
gh repo create noray-scraper --public --source=. --remote=origin --push

# O (opción 2: manual)
# 1. Ve a github.com y crea un nuevo repositorio llamado "noray-scraper"
# 2. Luego:
git remote add origin https://github.com/TU_USUARIO/noray-scraper.git
git branch -M main
git push -u origin main
```

### 1.3 Configurar en Render

1. En **Render Dashboard**, clic en "New +" → "Web Service"

2. Conectar GitHub y seleccionar repositorio `noray-scraper`

3. **Configuración**:
   ```
   Name: noray-scraper
   Region: Frankfurt (o el más cercano a ti)
   Branch: main
   Root Directory: (vacío)
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free ⭐
   ```

4. Clic en **"Create Web Service"**

5. **Espera 5-10 minutos** (descarga Chromium ~300MB)

6. **Copia la URL** que te da (ej: `https://noray-scraper.onrender.com`)

### 1.4 Probar el servidor

Abre en el navegador:
```
https://TU-URL.onrender.com/api/all
```

Deberías ver:
```json
{
  "success": true,
  "demandas": {
    "08-14": { "gruas": 13, "coches": 0 },
    "14-20": { "gruas": 17, "coches": 18 },
    "20-02": { "gruas": 18, "coches": 3 }
  },
  "fijos": 103
}
```

---

## 🔧 PASO 2: Actualizar tu PWA para usar el nuevo servidor

### 2.1 Simplificar la función cargarDatosNoray

En `app.js`, **reemplaza las líneas 5913-6079** con:

```javascript
// Función para cargar datos desde Noray (usando servidor de scraping)
window.cargarDatosNoray = async function() {
  var btnCargar = document.getElementById('btn-cargar-noray');
  var statusDiv = document.getElementById('noray-status');

  if (btnCargar) {
    btnCargar.disabled = true;
    btnCargar.innerHTML = '<span class="loading-spinner"></span> Cargando...';
  }

  try {
    // URL de tu servidor en Render
    var url = 'https://TU-URL.onrender.com/api/all'; // 👈 REEMPLAZA ESTO

    console.log('🔍 Obteniendo datos de Noray desde servidor de scraping...');

    var response = await fetch(url);
    var data = await response.json();

    console.log('✅ Respuesta del servidor:', data);

    if (data.success) {
      // Aplicar datos al formulario
      aplicarDatosNorayAlFormulario({
        fijos: data.fijos,
        gruas0814: data.demandas['08-14'].gruas,
        coches0814: data.demandas['08-14'].coches,
        gruas1420: data.demandas['14-20'].gruas,
        coches1420: data.demandas['14-20'].coches,
        gruas2002: data.demandas['20-02'].gruas,
        coches2002: data.demandas['20-02'].coches,
        timestamp: Date.now()
      });

      // Guardar en localStorage
      localStorage.setItem('noray_datos_manual', JSON.stringify({
        fijos: data.fijos,
        gruas0814: data.demandas['08-14'].gruas,
        coches0814: data.demandas['08-14'].coches,
        gruas1420: data.demandas['14-20'].gruas,
        coches1420: data.demandas['14-20'].coches,
        gruas2002: data.demandas['20-02'].gruas,
        coches2002: data.demandas['20-02'].coches,
        timestamp: Date.now()
      }));

      if (statusDiv) {
        var horaStr = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        statusDiv.innerHTML = '<span style="color: #10b981;">✅ Datos cargados ' + horaStr + '</span>';
        statusDiv.style.display = 'block';
      }

      console.log('✅ Datos aplicados:', data);

    } else {
      throw new Error(data.error || 'Error desconocido');
    }

  } catch (error) {
    console.error('❌ Error cargando datos de Noray:', error);

    // Fallback: intentar cargar datos guardados
    var datosGuardados = localStorage.getItem('noray_datos_manual');
    if (datosGuardados) {
      var saved = JSON.parse(datosGuardados);
      if (Date.now() - saved.timestamp < 6 * 60 * 60 * 1000) {
        console.log('📁 Usando datos guardados (fallback)');
        aplicarDatosNorayAlFormulario(saved);

        if (statusDiv) {
          statusDiv.innerHTML = '<span style="color: #f59e0b;">⚠️ Usando datos guardados (servidor no disponible)</span>';
          statusDiv.style.display = 'block';
        }
        return;
      }
    }

    // Si no hay fallback, mostrar modal manual
    if (statusDiv) {
      statusDiv.innerHTML = '<span style="color: #ef4444;">❌ Error al cargar. Introduce datos manualmente.</span>';
      statusDiv.style.display = 'block';
    }
    mostrarModalCargarNoray();

  } finally {
    if (btnCargar) {
      btnCargar.disabled = false;
      btnCargar.innerHTML = 'Cargar datos Noray';
    }
  }
};

// Función auxiliar para aplicar datos al formulario (añadir DESPUÉS de cargarDatosNoray)
function aplicarDatosNorayAlFormulario(datos) {
  var fijosInput = document.getElementById('calc-fijos');
  if (fijosInput && datos.fijos !== undefined) fijosInput.value = datos.fijos;

  var gruas1 = document.getElementById('calc-gruas-1');
  var coches1 = document.getElementById('calc-coches-1');
  if (gruas1 && datos.gruas0814 !== undefined) gruas1.value = datos.gruas0814;
  if (coches1 && datos.coches0814 !== undefined) coches1.value = datos.coches0814;

  var gruas2 = document.getElementById('calc-gruas-2');
  var coches2 = document.getElementById('calc-coches-2');
  if (gruas2 && datos.gruas1420 !== undefined) gruas2.value = datos.gruas1420;
  if (coches2 && datos.coches1420 !== undefined) coches2.value = datos.coches1420;

  var gruas3 = document.getElementById('calc-gruas-3');
  var coches3 = document.getElementById('calc-coches-3');
  if (gruas3 && datos.gruas2002 !== undefined) gruas3.value = datos.gruas2002;
  if (coches3 && datos.coches2002 !== undefined) coches3.value = datos.coches2002;
}
```

**IMPORTANTE**: Reemplaza `'https://TU-URL.onrender.com/api/all'` con la URL real que te dio Render.

---

## 🐛 PASO 3: Fix del error de consola

Añade esto al **inicio de app.js** (después de las constantes, antes de `initializeApp`):

```javascript
// Suprimir errores de extensiones del navegador de terceros
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('message channel closed')) {
    event.preventDefault();
    console.warn('⚠️ Error de extensión del navegador (ignorado):', event.reason.message);
  }
});
```

---

## ✅ PASO 4: Probar

1. **Abre tu PWA**
2. **Ve al Oráculo**
3. **Haz clic en "Cargar datos Noray"**
4. **Debería cargar automáticamente** (primera vez tarda ~30s si el servidor estaba dormido)

---

## ⚠️ Notas importantes

### Render.com plan gratuito

- ✅ **750 horas/mes** (más que suficiente)
- ⚠️ **Duerme después de 15 min** sin uso
  - Primera petición tarda ~30 segundos (despertar)
  - Peticiones siguientes: 3-5 segundos
- **Solución opcional**: Crear cron job que haga ping cada 10 min (ver más abajo)

### Keep-alive opcional (evitar que duerma)

Si quieres que el servidor esté siempre despierto:

1. Ve a https://cron-job.org (gratis)
2. Crea una tarea que haga GET a tu URL cada 10 minutos:
   ```
   https://TU-URL.onrender.com/
   ```

---

## 🎉 ¡Listo!

Ahora tienes:
- ✅ Scraping automático de Noray (bypass Cloudflare)
- ✅ Servidor gratuito en Render.com
- ✅ Fallback a datos guardados si el servidor falla
- ✅ Modal manual como último recurso
- ✅ Error de consola suprimido

---

## 🆘 Troubleshooting

**Problema**: Primera carga tarda mucho
- **Causa**: Servidor estaba dormido
- **Solución**: Espera 30s, es normal

**Problema**: Error CORS
- **Causa**: Ya está configurado en server.js
- **Solución**: Verifica que la URL sea correcta

**Problema**: Datos salen en 0
- **Causa**: Noray puede estar caído o cambiaron el HTML
- **Solución**: Revisa logs en Render Dashboard

**Problema**: Build falla en Render
- **Causa**: Chromium tarda en descargarse
- **Solución**: Espera 10 minutos completos

---

**¿Dudas?** Revisa los logs en Render Dashboard (pestaña "Logs")
