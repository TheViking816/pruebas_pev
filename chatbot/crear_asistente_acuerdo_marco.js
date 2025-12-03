/**
 * Script para crear el Assistant de OpenAI para el V Acuerdo Marco
 *
 * IMPORTANTE: Ejecutar este script UNA SOLA VEZ para crear el assistant
 *
 * Requisitos:
 * 1. Node.js instalado
 * 2. npm install openai
 * 3. Tener el PDF: BOE-A-2022-8165.pdf en la carpeta chatbot
 * 4. API Key de OpenAI
 *
 * Uso:
 * node crear_asistente_acuerdo_marco.js
 */

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// ==================================
// CONFIGURACIÓN
// ==================================

// API Key de OpenAI (reemplaza con tu key o usa variable de entorno)
const API_KEY = process.env.OPENAI_API_KEY || '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';

// Ruta al PDF del V Acuerdo Marco
const PDF_PATH = path.join(__dirname, 'BOE-A-2022-8165.pdf');

// Configuración del assistant
const ASSISTANT_CONFIG = {
  name: "V Acuerdo Marco Estiba",
  instructions: `Eres un experto en el V Acuerdo Marco Estatal del Sector de la Estiba Portuaria (BOE-A-2022-8165).

Tu función es responder preguntas sobre:
- Normativa laboral de la estiba portuaria
- Regulaciones del sector
- Derechos y obligaciones de trabajadores y empresas
- Procedimientos y protocolos
- Cualquier artículo o disposición del acuerdo

INSTRUCCIONES IMPORTANTES:
1. Responde SOLO basándote en el contenido del V Acuerdo Marco
2. Cita el artículo o sección correspondiente cuando sea posible
3. Si la pregunta no está en el documento, di claramente que no está incluida
4. Sé preciso y conciso
5. Usa un lenguaje profesional pero comprensible
6. Si hay varios artículos relevantes, menciónalos todos

Formato de respuesta:
- Empieza con la respuesta directa
- Cita el/los artículo(s) relevante(s)
- Añade contexto si es necesario
- NO inventes información que no esté en el documento`,

  model: "gpt-4o-mini",  // Modelo económico y eficiente

  tools: [{ type: "file_search" }]
};

// ==================================
// FUNCIONES
// ==================================

async function main() {
  try {
    console.log('🚀 Iniciando creación del Assistant del V Acuerdo Marco...\n');

    // 1. Verificar que existe el archivo
    if (!fs.existsSync(PDF_PATH)) {
      console.error(`❌ Error: No se encontró el archivo ${PDF_PATH}`);
      console.log('Por favor, descarga el PDF BOE-A-2022-8165.pdf y colócalo en la carpeta chatbot');
      process.exit(1);
    }

    console.log(`✅ Archivo encontrado: ${PDF_PATH}`);
    console.log(`📄 Tamaño: ${(fs.statSync(PDF_PATH).size / 1024 / 1024).toFixed(2)} MB\n`);

    // 2. Inicializar cliente de OpenAI
    const openai = new OpenAI({ apiKey: API_KEY });

    // 3. Subir el archivo a OpenAI
    console.log('📤 Subiendo PDF a OpenAI...');
    const file = await openai.files.create({
      file: fs.createReadStream(PDF_PATH),
      purpose: 'assistants'
    });

    console.log(`✅ Archivo subido con ID: ${file.id}\n`);

    // 4. Esperar un momento para que el archivo se procese
    console.log('⏳ Esperando procesamiento del archivo...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✅ Archivo listo\n');

    // 5. Crear el Assistant
    console.log('🤖 Creando Assistant...');
    const assistant = await openai.beta.assistants.create({
      ...ASSISTANT_CONFIG,
      tool_resources: {
        file_search: {
          vector_stores: [{
            file_ids: [file.id]
          }]
        }
      }
    });

    console.log('✅ Assistant creado exitosamente!\n');

    // 6. Mostrar información del assistant
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 INFORMACIÓN DEL ASSISTANT');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`ID: ${assistant.id}`);
    console.log(`Nombre: ${assistant.name}`);
    console.log(`Modelo: ${assistant.model}`);
    console.log(`Archivo: ${file.id}`);
    console.log('═══════════════════════════════════════════════════════\n');

    // 7. Guardar información en un archivo
    const infoPath = path.join(__dirname, 'assistant_acuerdo_marco_info.json');
    const info = {
      assistant_id: assistant.id,
      name: assistant.name,
      model: assistant.model,
      file_id: file.id,
      created_at: new Date().toISOString()
    };

    fs.writeFileSync(infoPath, JSON.stringify(info, null, 2));
    console.log(`💾 Información guardada en: ${infoPath}\n`);

    // 8. Instrucciones finales
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ CONFIGURACIÓN COMPLETA');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📝 SIGUIENTE PASO:');
    console.log('\nEn la consola del navegador, ejecuta:');
    console.log('\n```javascript');
    console.log(`window.OpenAIAssistants.setAssistantId('acuerdo_marco', '${assistant.id}');`);
    console.log('```');
    console.log('\n¡Listo! Ya puedes hacer preguntas sobre el V Acuerdo Marco en el chatbot.\n');

    // 9. Probar el assistant (opcional)
    console.log('🧪 ¿Quieres probar el assistant? (y/n)');

    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('', async (answer) => {
      if (answer.toLowerCase() === 'y') {
        console.log('\n🔍 Haciendo pregunta de prueba...');

        // Crear thread
        const thread = await openai.beta.threads.create();

        // Añadir mensaje
        await openai.beta.threads.messages.create(thread.id, {
          role: "user",
          content: "¿Qué es el V Acuerdo Marco y cuál es su objetivo principal?"
        });

        // Ejecutar
        const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
          assistant_id: assistant.id
        });

        // Obtener respuesta
        const messages = await openai.beta.threads.messages.list(thread.id);
        const response = messages.data[0].content[0].text.value;

        console.log('\n📝 RESPUESTA DEL ASSISTANT:');
        console.log('─────────────────────────────────────');
        console.log(response);
        console.log('─────────────────────────────────────\n');
        console.log('✅ ¡El assistant funciona correctamente!\n');
      }

      readline.close();
    });

  } catch (error) {
    console.error('\n❌ Error creando el assistant:', error.message);
    if (error.response) {
      console.error('Detalles:', error.response.data);
    }
    process.exit(1);
  }
}

// Ejecutar
main();
