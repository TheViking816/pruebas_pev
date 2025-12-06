/**
 * OpenAI Assistants Manager
 * Gestiona la comunicación con los assistants de OpenAI para consultas sobre PDFs
 */

class OpenAIAssistantsManager {
  constructor() {
    // IDs de los assistants (YA CONFIGURADOS - NO NECESITAN CAMBIOS)
    this.assistants = {
      convenio: 'asst_C1RQ9CeYEAVtUjQZTnSMhKvM',          // Convenio Colectivo de la Estiba
      acuerdo_marco: 'asst_mylG8Di8ZMKKyfr3y7ksbzCf',    // V Acuerdo Marco
      guia_contratacion: 'asst_JNZZlbP7sY3A5508fVmT91cA' // Guía de Contratación
    };

    // Obtener API key de OpenAI
    // PRODUCCIÓN: La API key se configura automáticamente desde config.local.js
    // que carga antes de este script y guarda la key en localStorage
    // También puede venir de window.OPENAI_CONFIG si config.local.js acabó de cargar
    this.apiKey = localStorage.getItem('openai_api_key') ||
                  (window.OPENAI_CONFIG && window.OPENAI_CONFIG.apiKey) ||
                  null;

    // Si se obtuvo de window.OPENAI_CONFIG, guardar en localStorage también
    if (!localStorage.getItem('openai_api_key') && window.OPENAI_CONFIG && window.OPENAI_CONFIG.apiKey) {
      localStorage.setItem('openai_api_key', window.OPENAI_CONFIG.apiKey);
      console.log('✅ OpenAI API Key guardada en localStorage desde OPENAI_CONFIG');
    }

    // Caché de threads activos por usuario (para mantener contexto)
    this.activeThreads = new Map();

    // Log de verificación
    if (this.apiKey) {
      console.log('✅ OpenAI API Key cargada correctamente (primeros 10 caracteres):', this.apiKey.substring(0, 10) + '...');
    } else {
      console.warn('⚠️ No se encontró OpenAI API Key');
    }
  }

  /**
   * Configura la API key de OpenAI
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
    localStorage.setItem('openai_api_key', apiKey);
    console.log('✅ OpenAI API key configurada');
  }

  /**
   * Configura el ID de un assistant
   */
  setAssistantId(tipo, assistantId) {
    if (this.assistants.hasOwnProperty(tipo)) {
      this.assistants[tipo] = assistantId;
      console.log(`✅ Assistant ID configurado para ${tipo}: ${assistantId}`);
    } else {
      console.error(`❌ Tipo de assistant desconocido: ${tipo}`);
    }
  }

  /**
   * Verifica si hay API key configurada
   */
  isConfigured() {
    if (!this.apiKey) {
      console.error('❌ No hay API key de OpenAI configurada');
      return false;
    }
    return true;
  }

  /**
   * Consulta un assistant de OpenAI
   * @param {string} tipo - Tipo de assistant ('convenio' o 'acuerdo_marco')
   * @param {string} pregunta - Pregunta del usuario
   * @param {string} userId - ID del usuario (para mantener contexto)
   * @returns {Promise<string>} - Respuesta del assistant
   */
  async consultarAssistant(tipo, pregunta, userId = 'default') {
    try {
      if (!this.isConfigured()) {
        return '❌ No hay API key de OpenAI configurada. Por favor, configúrala primero.';
      }

      const assistantId = this.assistants[tipo];

      if (!assistantId) {
        return `❌ No hay assistant configurado para ${tipo}. Por favor, créalo primero con crear_asistente.js`;
      }

      console.log(`📤 Consultando assistant ${tipo}...`);

      // Crear o recuperar thread para este usuario
      let threadId = this.activeThreads.get(`${userId}_${tipo}`);

      if (!threadId) {
        // Crear nuevo thread
        const threadResponse = await fetch('https://api.openai.com/v1/threads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        });

        if (!threadResponse.ok) {
          const error = await threadResponse.text();
          console.error('❌ Error creando thread:', error);
          return '❌ Error al crear la conversación con el assistant.';
        }

        const threadData = await threadResponse.json();
        threadId = threadData.id;
        this.activeThreads.set(`${userId}_${tipo}`, threadId);
        console.log(`✅ Thread creado: ${threadId}`);
      }

      // Añadir mensaje del usuario al thread
      const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          role: 'user',
          content: pregunta
        })
      });

      if (!messageResponse.ok) {
        const error = await messageResponse.text();
        console.error('❌ Error añadiendo mensaje:', error);
        return '❌ Error al enviar tu pregunta al assistant.';
      }

      // Ejecutar el assistant
      const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          assistant_id: assistantId
        })
      });

      if (!runResponse.ok) {
        const error = await runResponse.text();
        console.error('❌ Error ejecutando run:', error);
        return '❌ Error al procesar tu pregunta.';
      }

      const runData = await runResponse.json();
      const runId = runData.id;

      console.log(`⏳ Ejecutando assistant... (run: ${runId})`);

      // Esperar a que complete (polling)
      let runStatus = 'queued';
      let attempts = 0;
      const maxAttempts = 60; // 60 segundos máximo

      while (runStatus !== 'completed' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo

        const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        });

        if (!statusResponse.ok) {
          const error = await statusResponse.text();
          console.error('❌ Error obteniendo estado:', error);
          return '❌ Error al procesar tu pregunta.';
        }

        const statusData = await statusResponse.json();
        runStatus = statusData.status;

        console.log(`⏳ Estado: ${runStatus} (intento ${attempts + 1}/${maxAttempts})`);

        if (runStatus === 'failed' || runStatus === 'cancelled' || runStatus === 'expired') {
          console.error(`❌ Run falló con estado: ${runStatus}`);
          return '❌ No pude procesar tu pregunta. Intenta de nuevo.';
        }

        attempts++;
      }

      if (runStatus !== 'completed') {
        console.error('❌ Timeout esperando respuesta del assistant');
        return '❌ La consulta está tardando demasiado. Intenta con una pregunta más específica.';
      }

      // Obtener mensajes del thread
      const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      });

      if (!messagesResponse.ok) {
        const error = await messagesResponse.text();
        console.error('❌ Error obteniendo mensajes:', error);
        return '❌ Error al obtener la respuesta.';
      }

      const messagesData = await messagesResponse.json();

      // El primer mensaje es el más reciente (la respuesta del assistant)
      const lastMessage = messagesData.data[0];

      if (!lastMessage || !lastMessage.content || lastMessage.content.length === 0) {
        console.error('❌ No se encontró respuesta en los mensajes');
        return '❌ No obtuve una respuesta válida del assistant.';
      }

      // Extraer el texto de la respuesta
      let respuestaTexto = lastMessage.content
        .filter(c => c.type === 'text')
        .map(c => c.text.value)
        .join('\n\n');

      // Limpiar referencias de source que vienen del assistant (ej: 【4:2†source】)
      respuestaTexto = respuestaTexto.replace(/【\d+:\d+†source】/g, '');

      console.log('✅ Respuesta obtenida del assistant');

      return respuestaTexto;

    } catch (error) {
      console.error('❌ Error consultando assistant:', error);
      return '❌ Error al comunicarse con el assistant. Verifica tu conexión e intenta de nuevo.';
    }
  }

  /**
   * Limpia el thread activo de un usuario (para empezar conversación nueva)
   */
  limpiarThread(tipo, userId = 'default') {
    const key = `${userId}_${tipo}`;
    if (this.activeThreads.has(key)) {
      this.activeThreads.delete(key);
      console.log(`🗑️ Thread limpiado para ${key}`);
      return true;
    }
    return false;
  }

  /**
   * Limpia todos los threads
   */
  limpiarTodosLosThreads() {
    this.activeThreads.clear();
    console.log('🗑️ Todos los threads limpiados');
  }
}

// Crear instancia global
const openAIAssistants = new OpenAIAssistantsManager();

// Exportar globalmente
if (typeof window !== 'undefined') {
  window.OpenAIAssistants = openAIAssistants;
  console.log('✅ OpenAI Assistants Manager cargado');
}
