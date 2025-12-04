# 🚀 Deployment Producción - Chatbot con API Key Segura

## 📋 El Problema

La API key NO puede estar en GitHub (OpenAI la detecta y bloquea).
Pero NECESITAS que esté en producción para que tus usuarios usen el chatbot.

**Solución:** La API key se inyecta durante el deployment automáticamente.

---

## ✅ Solución por Servicio de Hosting

### **1️⃣ Netlify (RECOMENDADO - Gratis y simple)**

#### Paso 1: Conecta tu repo a Netlify
1. Ve a [netlify.com](https://netlify.com)
2. "Add new site" > "Import an existing project"
3. Conecta tu repositorio de GitHub

#### Paso 2: Configura la variable de entorno
1. En tu sitio de Netlify: `Site configuration > Environment variables`
2. Click "Add a variable"
   - **Key:** `OPENAI_API_KEY`
   - **Value:** `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`
3. Save

#### Paso 3: Deploy
1. Netlify detecta automáticamente `netlify.toml`
2. Durante el build ejecuta: `node generate-config.js`
3. Esto crea `chatbot/config.local.js` con tu API key
4. **¡Listo!** Tus usuarios ya pueden usar el chatbot

**Resultado:** Cada vez que hagas push, se deployea automáticamente con la API key inyectada.

---

### **2️⃣ Vercel (También gratis y simple)**

#### Paso 1: Conecta tu repo a Vercel
1. Ve a [vercel.com](https://vercel.com)
2. "Add New" > "Project"
3. Import tu repositorio

#### Paso 2: Configura la variable de entorno
1. En tu proyecto: `Settings > Environment Variables`
2. Añade:
   - **Name:** `OPENAI_API_KEY`
   - **Value:** Tu API key
   - **Environments:** Production, Preview, Development
3. Save

#### Paso 3: Deploy
1. Vercel detecta automáticamente `vercel.json`
2. Ejecuta el build command: `node generate-config.js`
3. **¡Listo!**

---

### **3️⃣ GitHub Pages (MÁS COMPLICADO - No recomendado para esto)**

GitHub Pages no ejecuta scripts de build, así que necesitas GitHub Actions:

#### Paso 1: Configura el Secret
1. En tu repo: `Settings > Secrets and variables > Actions`
2. "New repository secret"
   - **Name:** `OPENAI_API_KEY`
   - **Value:** Tu API key

#### Paso 2: Crea el workflow

<function_calls>
<invoke name="Read">
<parameter name="file_path">C:\Users\adria\Proyectos _IA\PortalEstibaVLC\PortalEstibaVLC\.github