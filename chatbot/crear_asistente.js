// crear_asistente.js
const OpenAI = require('openai');
const fs = require('fs');

// 🛑 ¡IMPORTANTE! Reemplaza 'tu-api-key' por tu clave real
const openai = new OpenAI({ apiKey: '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' }); 

async function crearAsistente() {
    try {
        console.log('1. Subiendo archivo PDF...');
        // Asegúrate de que este archivo exista en tu directorio
        const file = await openai.files.create({
            file: fs.createReadStream('Convenio de la Estiba del Puerto de Valencia.pdf'),
            purpose: 'assistants'
        });
        console.log(`Archivo subido. ID del archivo: ${file.id}`);

        console.log('2. Creando el Asistente con File Search...');
        // Crear asistente con acceso al archivo subido
        const assistant = await openai.beta.assistants.create({
            name: "Asistente Puerto Valencia",
            instructions: "Eres un experto en convenios de estiba. Responde preguntas sobre el convenio colectivo, citando las fuentes del documento que te proporcioné.",
            model: "gpt-4o-mini",
            tools: [{ type: "file_search" }],
            tool_resources: {
                file_search: {
                    vector_stores: [{
                        file_ids: [file.id] // Usar el ID del archivo que acabamos de subir
                    }]
                }
            }
        });

        // 3. Guardar ID del asistente
        console.log('✅ Asistente creado exitosamente.');
        console.log('---');
        console.log('¡GUARDA ESTE ID!');
        console.log('Assistant ID:', assistant.id);
        console.log('---');

    } catch (error) {
        console.error('Ha ocurrido un error durante la creación del asistente:', error.message);
    }
}

crearAsistente();