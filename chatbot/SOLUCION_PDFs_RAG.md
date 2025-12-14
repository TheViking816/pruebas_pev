# 📚 Solución para PDFs del Chatbot - RAG (Retrieval Augmented Generation)

## 🎯 Problema

Tienes 4 PDFs grandes que el chatbot debe conocer:
1. **Convenio Colectivo de la Estiba**
2. **V Acuerdo Marco**
3. **Guía de Contratación**
4. **Calendario de Pagos 2025**

**NO** podemos leerlos directamente en el chatbot porque:
- Son muy largos (miles de líneas)
- Causarían errores de memoria
- Serían muy lentos de procesar

## ✅ Solución: RAG con OpenAI

**RAG** = Retrieval Augmented Generation (Generación Aumentada con Recuperación)

Es la técnica estándar para que un chatbot responda preguntas sobre documentos largos.

---

## 🔧 Cómo Funciona RAG

```
Usuario pregunta: "¿Cuándo cobro esta quincena?"
       ↓
1. Buscar en el PDF las partes relevantes (embeddings)
       ↓
2. Extraer solo los párrafos relevantes
       ↓
3. Enviar a OpenAI: "Responde esta pregunta usando este contexto: [párrafos]"
       ↓
Respuesta del chatbot: "Cobrarás entre el 5 y el 7 de enero"
```

---

## 📦 Implementación - Opción 1: Supabase + pgvector (RECOMENDADO)

### Ventajas:
- ✅ Ya tienes Supabase
- ✅ Gratuito (plan free)
- ✅ Búsqueda vectorial rápida
- ✅ Escalable

### Pasos:

#### 1. Procesar los PDFs (hacer UNA VEZ, offline)

Usa un script de Python para:

```python
# instalar: pip install openai pypdf2 supabase

import openai
from PyPDF2 import PdfReader
from supabase import create_client

# 1. Leer PDF
pdf = PdfReader('Convenio de la Estiba del Puerto de Valencia.pdf')
text = ""
for page in pdf.pages:
    text += page.extract_text()

# 2. Dividir en chunks (fragmentos) de 500-1000 palabras
chunks = split_into_chunks(text, max_words=500)

# 3. Crear embeddings con OpenAI
openai.api_key = "tu-api-key"
for chunk in chunks:
    embedding = openai.Embedding.create(
        input=chunk,
        model="text-embedding-3-small"  # Modelo barato: $0.02 por 1M tokens
    )['data'][0]['embedding']

    # 4. Guardar en Supabase
    supabase.table('pdf_embeddings').insert({
        'documento': 'convenio_estiba',
        'texto': chunk,
        'embedding': embedding
    }).execute()
```

**Costo estimado:**
- 4 PDFs × 100 páginas × 500 palabras/chunk = ~400 chunks
- Embeddings: $0.02 por 1M tokens → **~$0.05 total** (una sola vez)

#### 2. Crear tabla en Supabase

```sql
-- Habilitar extensión de vectores
CREATE EXTENSION IF NOT EXISTS vector;

-- Crear tabla
CREATE TABLE pdf_embeddings (
  id BIGSERIAL PRIMARY KEY,
  documento TEXT NOT NULL,           -- 'convenio_estiba', 'acuerdo_marco', etc.
  texto TEXT NOT NULL,               -- Contenido del chunk
  embedding vector(1536),            -- Vector de OpenAI (1536 dimensiones)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsqueda rápida
CREATE INDEX ON pdf_embeddings USING ivfflat (embedding vector_cosine_ops);
```

#### 3. Buscar y responder (en el chatbot)

```javascript
// En ai-engine.js, cuando detectas pregunta sobre convenio:

async function responderConConvenio(preguntaUsuario) {
  // 1. Convertir pregunta a embedding
  const embeddingPregunta = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: preguntaUsuario
  });

  // 2. Buscar los 3 chunks más relevantes en Supabase
  const { data } = await supabase.rpc('buscar_similar', {
    query_embedding: embeddingPregunta.data[0].embedding,
    match_threshold: 0.7,
    match_count: 3
  });

  // 3. Crear contexto con los chunks encontrados
  const contexto = data.map(d => d.texto).join('\n\n');

  // 4. Enviar a OpenAI para generar respuesta
  const respuesta = await openai.chat.completions.create({
    model: "gpt-4o-mini",  // Modelo barato y bueno
    messages: [
      {
        role: "system",
        content: "Eres un asistente del Puerto de Valencia. Responde usando SOLO la información del contexto proporcionado."
      },
      {
        role: "user",
        content: `Contexto:\n${contexto}\n\nPregunta: ${preguntaUsuario}`
      }
    ]
  });

  return respuesta.choices[0].message.content;
}
```

**Costo por consulta:**
- Embedding pregunta: $0.02 / 1M tokens → **$0.000001**
- GPT-4o-mini: $0.15 / 1M tokens input → **~$0.0001** por consulta
- **Total: ~$0.0001 por pregunta** (muy barato)

#### 4. Función SQL para búsqueda (crear en Supabase)

```sql
CREATE OR REPLACE FUNCTION buscar_similar(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 3
)
RETURNS TABLE (
  id bigint,
  documento text,
  texto text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pdf_embeddings.id,
    pdf_embeddings.documento,
    pdf_embeddings.texto,
    1 - (pdf_embeddings.embedding <=> query_embedding) as similarity
  FROM pdf_embeddings
  WHERE 1 - (pdf_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY pdf_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

## 📦 Implementación - Opción 2: OpenAI Assistants API (MÁS FÁCIL)

### Ventajas:
- ✅ NO necesitas Supabase
- ✅ NO necesitas código de embeddings
- ✅ OpenAI maneja todo automáticamente
- ✅ Subes PDFs directo

### Desventajas:
- ❌ Más caro (~$0.01 por consulta vs $0.0001)
- ❌ Menos control

### Pasos:

#### 1. Subir PDFs a OpenAI (UNA VEZ)

```javascript
const OpenAI = require('openai');
const fs = require('fs');

const openai = new OpenAI({ apiKey: 'tu-api-key' });

// Subir archivo
const file = await openai.files.create({
  file: fs.createReadStream('Convenio de la Estiba del Puerto de Valencia.pdf'),
  purpose: 'assistants'
});

// Crear asistente con acceso a los archivos
const assistant = await openai.beta.assistants.create({
  name: "Asistente Puerto Valencia",
  instructions: "Eres un experto en convenios de estiba. Responde preguntas sobre el convenio colectivo.",
  model: "gpt-4o-mini",
  tools: [{ type: "file_search" }],
  tool_resources: {
    file_search: {
      vector_stores: [{
        file_ids: [file.id]  // IDs de los 4 PDFs
      }]
    }
  }
});

// Guardar ID del asistente
console.log('Assistant ID:', assistant.id);
```

#### 2. Usar en el chatbot

```javascript
// En ai-engine.js

async function responderConAsistente(pregunta) {
  const thread = await openai.beta.threads.create();

  await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: pregunta
  });

  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: "asst_XXXXX"  // Tu ID del paso 1
  });

  // Esperar respuesta
  let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
  while (runStatus.status !== 'completed') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
  }

  const messages = await openai.beta.threads.messages.list(thread.id);
  return messages.data[0].content[0].text.value;
}
```

---

## 📅 Caso Especial: Calendario de Pagos 2025

Para el calendario de pagos, como solo tiene 24 quincenas, es mejor crear una **tabla en Supabase**:

```sql
CREATE TABLE calendario_pagos (
  quincena TEXT PRIMARY KEY,           -- 'Primera quincena enero', etc.
  fecha_inicio DATE,                   -- Día marcado en amarillo
  fecha_fin DATE,                      -- Día marcado en azul
  mes INT,
  año INT DEFAULT 2025
);

INSERT INTO calendario_pagos VALUES
  ('Primera quincena enero', '2025-01-05', '2025-01-07', 1, 2025),
  ('Segunda quincena enero', '2025-01-20', '2025-01-22', 1, 2025),
  -- ... etc para las 24 quincenas
```

Luego en el chatbot:

```javascript
// Añadir intent para pagos
'fecha_pago': {
  patterns: [
    /cuándo (voy a |me van a )?cobr(o|ar|aré)/i,
    /cuándo (me )?pagan/i,
    /fecha (de )?cobro/i,
    /cuándo (es|será) (el|la) (pago|cobro)/i
  ],
  response: 'consultar_fecha_pago',
  confidence: 0.95
}

// Handler
async handleFechaPagoQuery() {
  // Calcular quincena actual
  const hoy = new Date();
  const dia = hoy.getDate();
  const mes = hoy.getMonth() + 1;
  const quincena = dia <= 15 ? 'Primera' : 'Segunda';
  const mesNombre = new Date(2025, mes - 1).toLocaleDateString('es-ES', { month: 'long' });

  // Buscar en BD
  const { data } = await supabase
    .from('calendario_pagos')
    .select('*')
    .eq('quincena', `${quincena} quincena ${mesNombre}`)
    .single();

  return {
    text: `💰 Cobrarás la ${quincena.toLowerCase()} quincena de ${mesNombre} entre el **${data.fecha_inicio}** y el **${data.fecha_fin}**`
  };
}
```

---

## 🚀 Recomendación Final

**Para empezar rápido:** Usa **Opción 2 (OpenAI Assistants)**
- Sube los 3 PDFs de convenios
- Crea la tabla de calendario_pagos
- Listo en 30 minutos

**Para producción (largo plazo):** Migra a **Opción 1 (Supabase + pgvector)**
- Más barato
- Más rápido
- Más control

---

## 💡 Lo Que TÚ Debes Hacer

### Paso 1: Decide qué opción usar
- **Rápida**: OpenAI Assistants API
- **Eficiente**: Supabase + pgvector

### Paso 2: Si usas Opción 2 (Assistants):
1. Crea cuenta OpenAI (si no tienes)
2. Copia el código de arriba para subir PDFs
3. Ejecuta el script (Node.js)
4. Guarda el `assistant_id`
5. Añádelo a `ai-engine.js`

### Paso 3: Para calendario de pagos
1. Crea la tabla `calendario_pagos` en Supabase
2. Inserta las 24 quincenas manualmente (o crea un script)
3. Añade el intent y handler que te di arriba

---

## 🔑 API Keys Necesarias

Ya tienes Supabase configurado en `chatbot/supabase.js`

Solo necesitas añadir OpenAI:

```javascript
// En ai-engine.js, añadir:
const OPENAI_API_KEY = localStorage.getItem('openai_api_key') || 'tu-key-aqui';
```

Puedes usar tu key existente que ya tienes configurada para el modo OpenAI del chatbot.

---

## 📊 Resumen de Costos

| Opción | Setup | Por consulta | 1000 consultas/mes |
|--------|-------|--------------|-------------------|
| **Supabase + pgvector** | $0.05 (una vez) | $0.0001 | $0.10/mes |
| **OpenAI Assistants** | Gratis | $0.01 | $10/mes |

---

## ❓ Preguntas Frecuentes

**P: ¿Puedo usar Groq en lugar de OpenAI?**
R: NO. Groq no tiene embeddings ni file search. Solo OpenAI o Anthropic (Claude).

**P: ¿Necesito procesar los PDFs cada vez?**
R: NO. Solo UNA VEZ. Luego están guardados en Supabase o en OpenAI.

**P: ¿El chatbot puede funcionar sin internet?**
R: NO para PDFs. Los embeddings requieren API. Pero el resto del chatbot sí puede ser local.

**P: ¿Cuánto tarda en responder?**
R: 2-5 segundos (búsqueda + OpenAI)

---

## 🎬 Próximos Pasos

1. **YO** ya implementé las funciones básicas (festivos, tarifas, chapas)
2. **TÚ** decides si quieres RAG para PDFs
3. Si decides implementarlo, sigue esta guía paso a paso
4. Si tienes dudas, pregúntame y te ayudo

¿Quieres que te prepare el código completo para la Opción 2 (Assistants)? Es la más rápida de implementar.
