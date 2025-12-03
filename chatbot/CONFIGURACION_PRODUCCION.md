# 🚀 Configuración para Producción

## ⚠️ IMPORTANTE: Los Usuarios NO Configuran Nada

**Respuesta corta:** NO, los usuarios NO necesitan configurar nada. Todo se configura UNA SOLA VEZ por ti.

---

## 🔐 Cómo Funciona en Producción

### Para las Funciones Básicas (Ya Funcionan):
✅ **Festivos** - Funciona automáticamente
✅ **Tarifas** - Lee de Supabase automáticamente
✅ **Chapas disponibles** - Lee de Supabase automáticamente

**Los usuarios solo abren el chatbot y preguntan. TODO funciona automáticamente.**

---

### Para Consultas de PDFs (Convenio/Acuerdo Marco):

Tienes **2 opciones**:

## 📋 Opción 1: Backend Proxy (RECOMENDADO - Más Seguro)

### Configuración:
1. Crea un endpoint en tu backend
2. La API key se guarda en el servidor (variable de entorno)
3. Los usuarios NUNCA ven la API key

### Implementación:

#### 1. Crea un archivo en tu backend: `chatbot-proxy.js`

```javascript
// Backend - Node.js/Express
const express = require('express');
const OpenAI = require('openai');
const router = express.Router();

// API Key SOLO en el servidor (variable de entorno)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// IDs de assistants (configurados una vez)
const ASSISTANTS = {
  convenio: 'asst_C1RQ9CeYEAVtUjQZTnSMhKvM',
  acuerdo_marco: 'asst_xyQBcacmQK6FXykITNfC1DYz'
};

router.post('/api/chatbot/consultar', async (req, res) => {
  try {
    const { tipo, pregunta, userId } = req.body;

    // Validar tipo
    if (!['convenio', 'acuerdo_marco'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo inválido' });
    }

    const assistantId = ASSISTANTS[tipo];

    // Crear thread
    const thread = await openai.beta.threads.create();

    // Añadir mensaje
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: pregunta
    });

    // Ejecutar assistant
    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistantId
    });

    // Obtener respuesta
    const messages = await openai.beta.threads.messages.list(thread.id);
    const respuesta = messages.data[0].content[0].text.value;

    res.json({ respuesta });

  } catch (error) {
    console.error('Error consultando assistant:', error);
    res.status(500).json({ error: 'Error al consultar documento' });
  }
});

module.exports = router;
```

#### 2. Modifica `openai-assistants.js` para usar el backend:

```javascript
// En openai-assistants.js, cambiar el método consultarAssistant:

async consultarAssistant(tipo, pregunta, userId = 'default') {
  try {
    // MODO PRODUCCIÓN: Llamar al backend
    const response = await fetch('/api/chatbot/consultar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tipo,
        pregunta,
        userId
      })
    });

    if (!response.ok) {
      throw new Error('Error en el servidor');
    }

    const data = await response.json();
    return data.respuesta;

  } catch (error) {
    console.error('❌ Error consultando assistant:', error);
    return '❌ Error al comunicarse con el servidor.';
  }
}
```

### Ventajas:
- ✅ **Máxima seguridad** - API key nunca se expone
- ✅ **Control de costos** - Puedes limitar uso por usuario
- ✅ **Los usuarios NO configuran nada**
- ✅ **Logs centralizados** - Ves todas las consultas

---

## 📋 Opción 2: API Key Hardcodeada (Solo Testing)

### Solo si NO tienes backend

Configura la API key UNA VEZ en el código:

```javascript
// En openai-assistants.js, línea 18:

constructor() {
  this.assistants = {
    convenio: 'asst_C1RQ9CeYEAVtUjQZTnSMhKvM',
    acuerdo_marco: 'asst_xyQBcacmQK6FXykITNfC1DYz'
  };

  // ⚠️ API key hardcodeada (SOLO PARA TESTING)
  this.apiKey = 'sk-proj-tu-key-aqui';
}
```

### Desventajas:
- ❌ **MUY INSEGURO** - Cualquiera puede ver tu API key
- ❌ **Sin control de costos** - Pueden abusar
- ❌ **No recomendado para producción**

---

## 🎯 Configuración Recomendada PASO A PASO

### 1. Configura los Assistant IDs (UNA SOLA VEZ)

En `openai-assistants.js`, línea 10-13:

```javascript
this.assistants = {
  convenio: 'asst_C1RQ9CeYEAVtUjQZTnSMhKvM',         // ✅ YA LO TIENES
  acuerdo_marco: 'asst_xyQBcacmQK6FXykITNfC1DYz'    // ✅ RECIÉN CREADO
};
```

### 2. Si tienes backend (RECOMENDADO):

1. Crea el endpoint `/api/chatbot/consultar` (código arriba)
2. Añade la API key como variable de entorno:
   ```bash
   export OPENAI_API_KEY=sk-proj-tu-key-aqui
   ```
3. Modifica `openai-assistants.js` para usar el backend
4. **¡LISTO!** Los usuarios solo usan el chatbot

### 3. Si NO tienes backend:

1. Hardcodea la API key en `openai-assistants.js`
2. **IMPORTANTE:** Usa rate limiting en el cliente
3. Considera cambiar a backend más adelante

---

## 📊 ¿Qué Configuran los Usuarios?

### Respuesta: **NADA**

Los usuarios solo:
1. Abren el chatbot
2. Hacen preguntas
3. Reciben respuestas

**TODO está pre-configurado por ti.**

---

## 🧪 Probar en Producción

### 1. Funciones Básicas (Ya funcionan):
```
Abre el chatbot → Pregunta: "¿Qué días son festivos?"
```
✅ Debe funcionar sin configurar nada

### 2. Convenio/Acuerdo Marco:

#### Si usas backend:
```
Abre el chatbot → Pregunta: "¿Cuántos días de vacaciones tengo?"
```
✅ Debe funcionar automáticamente

#### Si usas API key hardcodeada:
```
Abre el chatbot → Consola (F12) → Ejecuta:
window.OpenAIAssistants.setApiKey('tu-key');
```
Luego pregunta: "¿Cuántos días de vacaciones tengo?"

---

## 💰 Costos en Producción

### Por Usuario/Mes (estimado):
- **Consultas básicas** (festivos, tarifas): **Gratis** (lee de Supabase)
- **10 preguntas sobre PDFs**: **~$0.15**
- **50 preguntas sobre PDFs**: **~$0.75**
- **100 preguntas sobre PDFs**: **~$1.50**

### Protección de Costos:
Si usas backend, puedes:
- Limitar a 10 preguntas/día por usuario
- Cachear respuestas comunes
- Bloquear preguntas abusivas

---

## 📝 Resumen Final

### Para Producción:
1. **Opción A (Recomendado):** Crea endpoint en backend → Los usuarios NO configuran nada
2. **Opción B (Testing):** Hardcodea API key → Los usuarios NO configuran nada

### Los IDs de Assistants ya los tienes:
- ✅ Convenio: `asst_C1RQ9CeYEAVtUjQZTnSMhKvM`
- ✅ Acuerdo Marco: `asst_xyQBcacmQK6FXykITNfC1DYz`

### Los usuarios:
- ✅ **NO** necesitan API key
- ✅ **NO** necesitan configurar nada
- ✅ **SOLO** usan el chatbot normalmente

---

## 🚀 Siguiente Paso

**Decide qué opción usar:**
- ¿Tienes backend? → Usa Opción 1 (más seguro)
- ¿NO tienes backend? → Usa Opción 2 (menos seguro pero funciona)

**¿Quieres que te ayude a implementar el backend?** 🤖
