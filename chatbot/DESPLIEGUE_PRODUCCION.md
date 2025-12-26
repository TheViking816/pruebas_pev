# 🚀 Guía de Despliegue en Producción

## ✅ YA ESTÁ LISTO - Opción 1 Implementada

**El chatbot ya está configurado para producción con la Opción 1 (API key hardcodeada).**

**Los usuarios NO necesitan configurar NADA. Todo funciona automáticamente.**

---

## 📦 Pasos para Desplegar

### 1. Verifica que Todo Funciona

Antes de desplegar, prueba todo localmente:

```bash
# Abre el chatbot local
# Prueba estas preguntas SIN configurar nada:

✅ ¿Qué días son festivos?
✅ ¿A cuánto está la barra de destrinca laborable 20 a 02?
✅ ¿Cuántas chapas disponibles hay hoy?
✅ ¿Cuántos días de vacaciones tengo?
✅ ¿Qué es el V Acuerdo Marco?
```

Si todo funciona sin configurar API key, **estás listo para producción**.

---

### 2. Sube los Archivos Modificados

Sube estos archivos a tu servidor:

```
chatbot/
├── openai-assistants.js  ✅ (v4 - con API key hardcodeada)
├── ai-engine.js          ✅ (v17 - con nuevos handlers)
├── index.html            ✅ (actualizado con nuevas versiones)
└── (resto de archivos sin cambios)
```

---

### 3. Limpia Caché

Después de subir, limpia el caché:

**Opción A: Versión cache-busting (Ya implementado)**
Los archivos ya tienen `?v=X` en la URL, el navegador descargará automáticamente.

**Opción B: Forzar recarga en usuarios**
Añade un mensaje en tu PWA: "Actualización disponible - Recarga la página"

---

### 4. Prueba en Producción

1. Abre tu chatbot en producción
2. **NO configures nada** (ni API key ni assistant IDs)
3. Haz las mismas preguntas de prueba
4. Debe funcionar automáticamente

---

## ⚙️ Configuración Actual (Opción 1)

### ✅ Assistant IDs (Hardcodeados)
```javascript
convenio: 'asst_C1RQ9CeYEAVtUjQZTnSMhKvM'
acuerdo_marco: 'asst_mylG8Di8ZMKKyfr3y7ksbzCf'
```

### ✅ API Key (Hardcodeada)
```javascript
this.apiKey = 'sk-proj-FufMyMs...';
```

### ✅ Funciones que Funcionan Automáticamente
- Festivos
- Tarifas de trinca/destrinca
- Tarifas de jornales
- Chapas disponibles
- Convenio Colectivo
- V Acuerdo Marco

---

## 🔒 Seguridad - Opción 1

### ⚠️ Riesgos:
1. **Cualquiera puede ver tu API key** (mirando el código fuente)
2. **Sin control de costos por usuario**
3. **Alguien podría abusar de la key**

### ✅ Mitigaciones:

#### 1. Crea una API Key Dedicada en OpenAI

1. Ve a https://platform.openai.com/api-keys
2. Crea una **nueva key** llamada "Portal Estiba VLC - Producción"
3. Configura **límites de gasto**:
   - Límite mensual: $50 (ajusta según tu uso)
   - Límite diario: $10

#### 2. Configura la Nueva Key

Reemplaza la key en `openai-assistants.js` línea 17-18:

```javascript
this.apiKey = localStorage.getItem('openai_api_key') ||
              'sk-proj-TU-NUEVA-KEY-AQUI';
```

#### 3. Monitorea Uso en OpenAI

Ve a https://platform.openai.com/usage y revisa:
- Número de consultas diarias
- Costo diario
- Picos inusuales

#### 4. Rota la Key Periódicamente

Cada 3-6 meses:
1. Crea una nueva key
2. Actualiza el código
3. Elimina la key antigua

---

## 💰 Estimación de Costos (Opción 1)

### Por 100 Usuarios/Día:

#### Consultas Básicas (95% del uso):
- Festivos, tarifas, chapas
- **Costo: $0** (lee de Supabase)

#### Consultas de PDFs (5% del uso):
- Convenio, V Acuerdo Marco
- ~10 consultas/día
- **Costo: ~$0.15/día = $4.50/mes**

### Total Estimado: **$5-10/mes**

---

## 🚀 Opción 2: Backend Proxy (MÁS SEGURO)

Si prefieres mayor seguridad, implementa un backend:

### Ventajas:
- ✅ API key **NUNCA** se expone
- ✅ Control de costos por usuario
- ✅ Logs centralizados
- ✅ Rate limiting

### Desventajas:
- ⏱️ Requiere backend (Node.js/Express)
- ⏱️ 1-2 horas de implementación

---

### Implementación Backend (Opción 2)

#### 1. Crea `server/chatbot-proxy.js`

```javascript
const express = require('express');
const OpenAI = require('openai');
const router = express.Router();

// API Key SOLO en el servidor
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const ASSISTANTS = {
  convenio: 'asst_C1RQ9CeYEAVtUjQZTnSMhKvM',
  acuerdo_marco: 'asst_mylG8Di8ZMKKyfr3y7ksbzCf'
};

// Rate limiting simple (10 consultas/hora por usuario)
const userLimits = new Map();

router.post('/api/chatbot/consultar-pdf', async (req, res) => {
  try {
    const { tipo, pregunta, userId } = req.body;

    // Validar tipo
    if (!['convenio', 'acuerdo_marco'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo inválido' });
    }

    // Rate limiting
    const userKey = userId || req.ip;
    const now = Date.now();
    const userHistory = userLimits.get(userKey) || [];

    // Limpiar consultas antiguas (más de 1 hora)
    const recentQueries = userHistory.filter(t => now - t < 3600000);

    if (recentQueries.length >= 10) {
      return res.status(429).json({
        error: 'Límite de consultas alcanzado. Intenta en una hora.'
      });
    }

    // Registrar consulta
    recentQueries.push(now);
    userLimits.set(userKey, recentQueries);

    // Consultar assistant
    const assistantId = ASSISTANTS[tipo];

    const thread = await openai.beta.threads.create();

    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: pregunta
    });

    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistantId
    });

    const messages = await openai.beta.threads.messages.list(thread.id);
    const respuesta = messages.data[0].content[0].text.value;

    // Log para monitoreo
    console.log(`[Chatbot] ${userKey} consultó ${tipo}: "${pregunta.substring(0, 50)}..."`);

    res.json({ respuesta });

  } catch (error) {
    console.error('Error consultando assistant:', error);
    res.status(500).json({ error: 'Error al consultar documento' });
  }
});

module.exports = router;
```

#### 2. Registra el Router en tu App

```javascript
// En tu app.js o server.js
const chatbotProxy = require('./chatbot-proxy');
app.use(chatbotProxy);
```

#### 3. Configura Variable de Entorno

```bash
# En tu servidor
export OPENAI_API_KEY=sk-proj-tu-key-aqui
```

#### 4. Modifica `openai-assistants.js`

Cambia el método `consultarAssistant`:

```javascript
async consultarAssistant(tipo, pregunta, userId = 'default') {
  try {
    // MODO PRODUCCIÓN: Llamar al backend
    const response = await fetch('/api/chatbot/consultar-pdf', {
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
      if (response.status === 429) {
        return '⏱️ Has alcanzado el límite de consultas. Intenta de nuevo en una hora.';
      }
      throw new Error('Error en el servidor');
    }

    const data = await response.json();
    return data.respuesta;

  } catch (error) {
    console.error('❌ Error consultando assistant:', error);
    return '❌ Error al comunicarse con el servidor. Intenta de nuevo.';
  }
}
```

---

## 📊 Comparación de Opciones

| Característica | Opción 1 (Actual) | Opción 2 (Backend) |
|----------------|-------------------|-------------------|
| **Tiempo de implementación** | ✅ Ya está listo | ⏱️ 1-2 horas |
| **Seguridad** | ⚠️ Media | ✅ Alta |
| **Control de costos** | ❌ No | ✅ Sí (rate limiting) |
| **Monitoreo** | ⚠️ Solo OpenAI | ✅ Logs propios |
| **Requiere backend** | ❌ No | ✅ Sí (Node.js) |

---

## 🎯 Recomendación

### Para empezar ahora: **Opción 1** ✅
- Ya está implementado
- Funciona inmediatamente
- Costo controlable ($5-10/mes)
- Configura límites en OpenAI

### Para largo plazo: **Migrar a Opción 2**
- Cuando tengas más usuarios
- Cuando quieras más control
- Cuando el costo aumente

---

## ✅ Checklist de Despliegue

- [ ] Probado todo localmente
- [ ] Creada API key dedicada en OpenAI
- [ ] Configurados límites de gasto
- [ ] Subidos archivos a servidor
- [ ] Probado en producción
- [ ] Monitoreando uso en OpenAI
- [ ] Documentado para el equipo

---

## 📞 Monitoreo Post-Despliegue

### Día 1:
- Verifica que todo funciona
- Revisa uso en OpenAI Dashboard

### Semana 1:
- Monitorea costos diarios
- Ajusta límites si es necesario

### Mensual:
- Analiza uso por función
- Considera migrar a backend si hay muchos usuarios

---

## 🚀 ¡LISTO PARA PRODUCCIÓN!

**Tu chatbot está 100% configurado para producción con la Opción 1.**

**Solo tienes que:**
1. ✅ Crear API key dedicada con límites
2. ✅ Subir archivos al servidor
3. ✅ Probar en producción
4. ✅ Monitorear uso

**Los usuarios NO configuran nada. Todo funciona automáticamente.** 🎉

---

## ❓ FAQ

**P: ¿Los usuarios necesitan configurar algo?**
R: NO. Todo funciona automáticamente.

**P: ¿Cuánto cuesta al mes?**
R: ~$5-10 con 100 usuarios/día.

**P: ¿Es seguro exponer la API key?**
R: Con límites configurados en OpenAI, es aceptable para empezar. Para más seguridad, usa Opción 2.

**P: ¿Puedo cambiar después a Opción 2?**
R: Sí, puedes migrar cuando quieras.

**P: ¿Cómo sé si alguien está abusando?**
R: Revisa el dashboard de OpenAI diariamente. Si hay picos, crea una nueva key.
