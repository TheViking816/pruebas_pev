/**
 * Script para crear el Assistant de OpenAI para la Guía de Contratación
 *
 * IMPORTANTE: Ejecutar este script UNA SOLA VEZ para crear el assistant
 *
 * Requisitos:
 * 1. Node.js instalado
 * 2. npm install openai
 * 3. Tener el PDF: Guia de contratacion OCR-1.pdf en la carpeta chatbot
 * 4. API Key de OpenAI
 *
 * Uso:
 * node crear_asistente_guia_contratacion.js
 */

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// ==================================
// CONFIGURACIÓN
// ==================================

// API Key de OpenAI (reemplaza con tu key o usa variable de entorno)
const API_KEY = process.env.OPENAI_API_KEY || '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';

// Ruta al PDF de la Guía de Contratación
const PDF_PATH = path.join(__dirname, 'Guia de contratacion OCR-1.pdf');

// Configuración del assistant
const ASSISTANT_CONFIG = {
  name: "Guía de Contratación Puerto Valencia",
  instructions: `Eres un experto en la Guía de Contratación del Puerto de Valencia.

Tu función es responder preguntas sobre:
- Procedimientos de contratación
- Requisitos para trabajar en el puerto
- Tipos de contratos
- Documentación necesaria
- Pasos para registrarse
- Normativas de contratación
- Derechos y obligaciones en el proceso de contratación

INSTRUCCIONES IMPORTANTES:
1. Responde SOLO basándote en el contenido de la Guía de Contratación
2. Cita la sección correspondiente cuando sea posible
3. Si la pregunta no está en el documento, di claramente que no está incluida
4. Sé preciso y conciso
5. Usa un lenguaje claro y comprensible para trabajadores
6. Si hay varios pasos, enuméralos claramente

Formato de respuesta:
- Empieza con la respuesta directa
- Enumera pasos si es un procedimiento
- Menciona documentos necesarios si aplica
- Añade advertencias importantes si las hay
- NO inventes información que no esté en el documento`,

  model: "gpt-4o-mini",  // Modelo económico y eficiente

  tools: [{ type: "file_search" }]
};

// ==================================
// FUNCIONES
// ==================================

async function main() {
  try {
    console.log('🚀 Iniciando creación del Assistant de la Guía de Contratación...\n');

    // 1. Verificar que existe el archivo
    if (!fs.existsSync(PDF_PATH)) {
      console.error(`❌ Error: No se encontró el archivo ${PDF_PATH}`);
      console.log('Por favor, verifica que el archivo existe en la carpeta chatbot');
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
    const infoPath = path.join(__dirname, 'assistant_guia_contratacion_info.json');
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
    console.log('\n📝 EL ASSISTANT YA ESTÁ CONFIGURADO AUTOMÁTICAMENTE');
    console.log(`\nID del Assistant: ${assistant.id}`);
    console.log('\n¡Listo! Ya puedes hacer preguntas sobre la Guía de Contratación en el chatbot.\n');

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
          content: "¿Qué documentos necesito para registrarme en el puerto?"
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

      console.log(`\n✅ Assistant ID: ${assistant.id}`);
      console.log('Este ID ya está configurado automáticamente en el código.\n');

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
