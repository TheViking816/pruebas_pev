# 🚀 Configurar API Key en Producción

## ❌ Problema
En local funciona porque tienes `config.local.js`, pero al subir a GitHub este archivo NO se sube (está en `.gitignore` por seguridad).

Cuando despliegas a producción, el chatbot no encuentra la API key y falla:
```
Uncaught ReferenceError: process is not defined
```

---

## ✅ Solución: 3 Opciones

### **Opción 1: Subir config.local.js Manualmente al Servidor (MÁS FÁCIL)**

#### Pasos:
1. **Abre tu servidor** (FTP, SSH, cPanel, etc.)
2. **Ve a la carpeta** `chatbot/`
3. **Sube el archivo** `config.local.js` desde tu local al servidor
4. **Listo** - El chatbot funcionará automáticamente

**Ventaja:** Simple, rápido, seguro (el archivo solo está en tu local y en el servidor)

**Desventaja:** Cada vez que hagas deploy desde cero, tendrás que volver a subir el archivo

---

### **Opción 2: Crear config.local.js Directamente en el Servidor**

#### Pasos:
1. **Accede al servidor** vía SSH, cPanel File Manager, o FTP
2. **Crea el archivo** `chatbot/config.local.js` con este contenido:

```javascript
/**
 * Configuración PRODUCCIÓN - NO SE SUBE A GIT
 */
window.OPENAI_CONFIG = {
  apiKey: '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'
};

// Configurar automáticamente
if (window.OPENAI_CONFIG.apiKey) {
  localStorage.setItem('openai_api_key', window.OPENAI_CONFIG.apiKey);
  console.log('✅ OpenAI API Key configurada automáticamente');
}
```

3. **Guarda el archivo** y recarga el chatbot
4. **Listo**

---

### **Opción 3: Script de Deployment Automático**

Si usas GitHub Actions, Netlify, Vercel, etc., puedes crear una variable de entorno y generar el archivo automáticamente.

#### GitHub Actions Example:
```yaml
# .github/workflows/deploy.yml
- name: Create config.local.js
  run: |
    echo "window.OPENAI_CONFIG = { apiKey: '${{ secrets.OPENAI_API_KEY }}' };" > chatbot/config.local.js
    echo "if (window.OPENAI_CONFIG.apiKey) { localStorage.setItem('openai_api_key', window.OPENAI_CONFIG.apiKey); }" >> chatbot/config.local.js
```

**Necesitas:**
1. Crear un Secret en GitHub: `Settings > Secrets > OPENAI_API_KEY`
2. Añadir el workflow que genere el archivo en cada deploy

---

## 🔍 Verificar que Funciona en Producción

1. **Abre el chatbot** en producción
2. **Abre la consola** (F12)
3. **Busca este mensaje:**
   ```
   ✅ OpenAI API Key configurada automáticamente
   ✅ OpenAI Assistants Manager cargado
   ```
4. **Prueba una pregunta PDF:**
   - "¿Qué dice el Convenio Colectivo sobre las vacaciones?"
   - "¿Cuándo se contrata la jornada de 02-08?"

Si ves las respuestas del PDF → **¡Funcionó!** ✅

---

## 📋 Checklist Producción

- [ ] Error de `process.env` arreglado (ya está)
- [ ] `config.local.js` creado en el servidor de producción
- [ ] Chatbot recargado con Ctrl+Shift+R
- [ ] Consola muestra "✅ OpenAI API Key configurada"
- [ ] Preguntas PDF funcionan correctamente

---

## ⚙️ Recomendación

**Para la mayoría de casos: Usa Opción 1 o 2** (subir/crear el archivo manualmente).

Es simple, seguro, y solo lo haces una vez. Después, cada vez que hagas push, el archivo seguirá estando en el servidor.

**Si tienes CI/CD automatizado: Usa Opción 3** (deploy automático con secrets).
