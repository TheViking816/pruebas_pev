/**
 * Chat App - Aplicación Principal del Chatbot
 * Coordina la UI, IA, voz y datos
 */

class ChatApp {
  constructor() {
    this.aiEngine = null;
    this.voiceHandler = null;
    this.dataBridge = null;
    this.messages = [];

    // Referencias DOM
    this.elements = {
      messagesArea: null,
      messageInput: null,
      sendBtn: null,
      voiceBtn: null,
      voiceIndicator: null,
      loadingOverlay: null,
      quickActions: null,
      settingsModal: null,
      userName: null
    };

    this.isProcessing = false;

    // Imágenes de fondo del puerto (alta resolución)
    this.backgroundImages = [
      'https://i.imgur.com/93PeVLa.jpg',
      'https://i.imgur.com/zHHigVR.jpg',
      'https://i.imgur.com/oky6atz.jpg',
      'https://i.imgur.com/rnfRKl8.jpg',
      'https://i.imgur.com/lp1Uvc7.jpg',
      'https://i.imgur.com/1vBGGnt.jpg',
      'https://i.imgur.com/C7zDfuC.jpg',
      'https://i.imgur.com/pZDIoGP.jpg',
      'https://i.imgur.com/A3plzCX.jpg'
    ];
    this.currentBgIndex = 0;
  }

  /**
   * Espera a que SheetsAPI esté disponible
   */
  async waitForSheetsAPI(timeoutMs = 10000) {
    console.log('⏳ Esperando a que SheetsAPI esté disponible...');

    return new Promise((resolve) => {
      // Si ya está disponible, resolver inmediatamente
      if (window.SheetsAPI && typeof window.SheetsAPI.getJornales === 'function') {
        console.log('✅ SheetsAPI ya estaba disponible');
        resolve(true);
        return;
      }

      // Timeout de seguridad
      const timeout = setTimeout(() => {
        console.error('❌ Timeout esperando SheetsAPI');
        resolve(false);
      }, timeoutMs);

      // Escuchar el evento personalizado
      window.addEventListener('SheetsAPIReady', function handler() {
        console.log('📢 Evento SheetsAPIReady recibido');
        clearTimeout(timeout);
        window.removeEventListener('SheetsAPIReady', handler);

        // Verificar que realmente está disponible
        if (window.SheetsAPI && typeof window.SheetsAPI.getJornales === 'function') {
          console.log('✅ SheetsAPI está disponible y listo para usar');
          resolve(true);
        } else {
          console.error('❌ SheetsAPI evento recibido pero no está disponible');
          resolve(false);
        }
      }, { once: true });

      // También verificar cada 100ms por si el evento ya se disparó
      const interval = setInterval(() => {
        if (window.SheetsAPI && typeof window.SheetsAPI.getJornales === 'function') {
          console.log('✅ SheetsAPI detectado por polling');
          clearTimeout(timeout);
          clearInterval(interval);
          resolve(true);
        }
      }, 100);
    });
  }

  /**
   * Inicializa la aplicación
   */
  async initialize() {
    console.log('🚀 Inicializando Chat App...');

    // Obtener elementos DOM
    this.cacheDOM();

    // Esperar a que SheetsAPI esté disponible
    const sheetsAPIReady = await this.waitForSheetsAPI();

    if (!sheetsAPIReady) {
      this.showMessage('bot', 'Error: No se pudo cargar el sistema de datos. Por favor, recarga la página.');
      return;
    }

    // Inicializar componentes
    this.aiEngine = new AIEngine();
    this.voiceHandler = new VoiceHandler();
    this.dataBridge = new PWADataBridge();

    // Inicializar puente de datos
    const dataReady = await this.dataBridge.initialize();

    if (!dataReady) {
      this.showMessage('bot', 'Para usar el asistente, introduce tu número de chapa.');
      return;
    }

    // Inicializar motor de IA
    await this.aiEngine.initialize(this.dataBridge);

    // Configurar Groq API para mejorar las respuestas
    const groqApiKey = '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';

    // TEMPORALMENTE DESACTIVADO - Groq inventa datos (CSP, sueldómetro, etc)
    // Usar modo LOCAL hasta que el prompt esté perfecto
    if (false && groqApiKey) {
      this.aiEngine.setApiKey(groqApiKey);
      this.aiEngine.setMode('groq');
      console.log('✅ Modo GROQ habilitado (mejora respuestas con datos reales)');
    } else {
      this.aiEngine.setMode('local');
      console.log('✅ Modo LOCAL - Respuestas 100% con datos reales de Supabase');
    }

    // Cargar configuración
    this.voiceHandler.loadSettings();
    this.loadSettings();

    // Configurar event listeners
    this.setupEventListeners();

    // Mostrar nombre del usuario
    await this.displayUserName();

    // NO ocultar welcome card automáticamente
    // El usuario puede scrollear hacia abajo si quiere

    // Iniciar rotación de fondos
    this.startBackgroundRotation();

    console.log('✅ Chat App inicializado');

    // Exponer funciones de debugging globalmente
    window.chatDebug = {
      cambiarChapa: async (chapa, password) => {
        if (!password) {
          console.error('❌ Uso: chatDebug.cambiarChapa(816, "tu_contraseña")');
          return;
        }
        await this.dataBridge.cambiarChapa(chapa, password);
      },
      verChapa: () => {
        console.log('Chapa actual:', this.dataBridge.currentChapa);
        return this.dataBridge.currentChapa;
      },
      cerrarSesion: () => {
        this.dataBridge.cerrarSesion();
      }
    };

    console.log('💡 Funciones de debug disponibles:');
    console.log('  - chatDebug.cambiarChapa(816, "pass")  // Cambiar a chapa 816');
    console.log('  - chatDebug.verChapa()                 // Ver chapa actual');
    console.log('  - chatDebug.cerrarSesion()             // Cerrar sesión');
  }

  /**
   * Cachea referencias DOM
   */
  cacheDOM() {
    this.elements.messagesArea = document.getElementById('messages-area');
    this.elements.messageInput = document.getElementById('message-input');
    this.elements.sendBtn = document.getElementById('send-btn');
    this.elements.voiceBtn = document.getElementById('voice-btn');
    this.elements.voiceIndicator = document.getElementById('voice-indicator');
    this.elements.loadingOverlay = document.getElementById('loading-overlay');
    this.elements.quickActions = document.getElementById('quick-actions');
    this.elements.settingsModal = document.getElementById('settings-modal');
    this.elements.userName = document.getElementById('user-name');
  }

  /**
   * Configura event listeners
   */
  setupEventListeners() {
    // Enviar mensaje
    this.elements.sendBtn.addEventListener('click', () => this.sendMessage());

    this.elements.messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Auto-resize textarea
    this.elements.messageInput.addEventListener('input', (e) => {
      e.target.style.height = 'auto';
      e.target.style.height = e.target.scrollHeight + 'px';
    });

    // Voz
    this.elements.voiceBtn.addEventListener('click', () => this.toggleVoice());

    // Quick actions
    const chips = document.querySelectorAll('.chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const action = chip.dataset.action;
        this.handleQuickAction(action);
      });
    });

    // Examples clickables
    const examplesList = document.querySelectorAll('.examples-list li');
    examplesList.forEach(example => {
      example.addEventListener('click', () => {
        const text = example.textContent.replace(/["]/g, '');
        this.elements.messageInput.value = text;
        this.sendMessage();
      });
    });

    // Settings
    document.getElementById('settings-btn').addEventListener('click', () => {
      this.elements.settingsModal.classList.remove('hidden');
    });

    document.getElementById('close-settings').addEventListener('click', () => {
      this.elements.settingsModal.classList.add('hidden');
    });

    // Voice response toggle
    document.getElementById('voice-response-toggle').addEventListener('change', (e) => {
      this.voiceHandler.toggleVoice(e.target.checked);
    });

    // Quick actions toggle
    document.getElementById('quick-actions-toggle').addEventListener('change', (e) => {
      this.elements.quickActions.style.display = e.target.checked ? 'flex' : 'none';
      localStorage.setItem('quick_actions_enabled', e.target.checked ? '1' : '0');
    });

    // AI mode select
    document.getElementById('ai-mode-select').addEventListener('change', (e) => {
      const mode = e.target.value;
      this.aiEngine.setMode(mode);

      // Mostrar/ocultar sección de API key
      const apiKeySection = document.getElementById('api-key-section');
      apiKeySection.style.display = (mode === 'groq' || mode === 'openai') ? 'block' : 'none';
    });

    // Save API key
    document.getElementById('save-api-key').addEventListener('click', () => {
      const apiKey = document.getElementById('api-key-input').value;
      if (apiKey) {
        this.aiEngine.setApiKey(apiKey);
        alert('API Key guardada correctamente');
      }
    });

    // Back button
    document.getElementById('back-btn').addEventListener('click', () => {
      window.location.href = '../index.html';
    });
  }

  /**
   * Muestra el nombre del usuario
   */
  async displayUserName() {
    const nombre = await this.dataBridge.getNombreUsuario();
    if (this.elements.userName) {
      this.elements.userName.textContent = nombre;
    }
  }

  /**
   * Envía un mensaje
   */
  async sendMessage() {
    const text = this.elements.messageInput.value.trim();

    if (!text || this.isProcessing) {
      return;
    }

    // Prevenir doble envío - marcar como procesando ANTES de limpiar
    this.isProcessing = true;

    // Limpiar input
    this.elements.messageInput.value = '';
    this.elements.messageInput.style.height = 'auto';

    // Mostrar mensaje del usuario
    this.showMessage('user', text);

    // Procesar mensaje
    await this.processUserMessage(text);
  }

  /**
   * Procesa el mensaje del usuario con la IA
   */
  async processUserMessage(text) {
    this.showLoading(true);

    try {
      // Verificar que el motor de IA está listo
      if (!this.aiEngine) {
        throw new Error('Motor de IA no inicializado');
      }

      // Verificar que el puente de datos está listo
      if (!this.dataBridge || !this.dataBridge.currentChapa) {
        this.showLoading(false);
        this.showMessage('bot', 'Por favor, introduce tu chapa para continuar.');
        this.isProcessing = false;
        return;
      }

      // Procesar con IA
      console.log('🤖 Procesando mensaje con IA:', text);
      const response = await this.aiEngine.processMessage(text);

      console.log('📥 Respuesta de IA:', response);

      this.showLoading(false);

      // Verificar que hay respuesta
      if (!response || !response.text) {
        this.showMessage('bot', 'Lo siento, no pude generar una respuesta.');
        return;
      }

      // Mostrar respuesta
      this.showMessage('bot', response.text, response.data);

      // Ejecutar acción si existe
      if (response.action) {
        await this.executeAction(response.action);
      }

      // Leer respuesta en voz alta si está habilitado
      if (this.voiceHandler.voiceEnabled) {
        this.voiceHandler.speak(response.text);
      }

    } catch (error) {
      console.error('❌ Error procesando mensaje:', error);
      this.showLoading(false);
      this.showMessage('bot', `Lo siento, ocurrió un error: ${error.message}`);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Muestra un mensaje en el chat
   */
  showMessage(sender, text, data = null) {
    console.log(`💬 showMessage: sender=${sender}, text=${text.substring(0, 50)}...`);

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.textContent = sender === 'user' ? '👤' : '🤖';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    bubbleDiv.innerHTML = this.formatMessage(text);

    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });

    contentDiv.appendChild(bubbleDiv);

    // Añadir tarjeta de datos si existe
    if (data) {
      const dataCard = this.createDataCard(data);
      contentDiv.appendChild(dataCard);
    }

    contentDiv.appendChild(timeDiv);

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);

    this.elements.messagesArea.appendChild(messageDiv);

    console.log(`✅ Mensaje añadido al DOM. Total mensajes en área: ${this.elements.messagesArea.children.length}`);

    // Scroll al final
    this.scrollToBottom();

    // Guardar en historial
    this.messages.push({ sender, text, data, timestamp: Date.now() });
  }

  /**
   * Crea una tarjeta de datos
   */
  createDataCard(data) {
    const card = document.createElement('div');
    card.className = 'data-card';

    if (data.type === 'posicion') {
      card.innerHTML = `
        <h4>Tu Posición</h4>
        <div class="value">${data.posicion}</div>
        <div class="label">Posición en censo</div>
        ${data.laborable ? `
          <div class="data-grid">
            <div class="data-item">
              <div class="value">${data.laborable}</div>
              <div class="label">Hasta puerta laborable</div>
            </div>
            ${data.festiva ? `
              <div class="data-item">
                <div class="value">${data.festiva}</div>
                <div class="label">Hasta puerta festiva</div>
              </div>
            ` : ''}
          </div>
        ` : ''}
      `;
    }

    if (data.type === 'jornales') {
      card.innerHTML = `
        <h4>${data.quincena}</h4>
        <div class="value">${data.total}</div>
        <div class="label">Jornales trabajados</div>
      `;
    }

    if (data.type === 'salario') {
      card.innerHTML = `
        <h4>${data.quincena}</h4>
        <div class="data-grid">
          <div class="data-item">
            <div class="value">${data.bruto}€</div>
            <div class="label">Bruto estimado</div>
          </div>
          <div class="data-item">
            <div class="value">${data.neto}€</div>
            <div class="label">Neto estimado</div>
          </div>
        </div>
      `;
    }

    if (data.type === 'contratacion') {
      card.innerHTML = `
        <h4>Tu Contratación de Hoy</h4>
        <div class="data-grid">
          <div class="data-item">
            <div class="value">${data.empresa}</div>
            <div class="label">Empresa</div>
          </div>
          <div class="data-item">
            <div class="value">${data.puesto}</div>
            <div class="label">Puesto</div>
          </div>
        </div>
        <div class="label" style="margin-top: 0.75rem;">Jornada: ${data.jornada} | Buque: ${data.buque}</div>
      `;
    }

    if (data.type === 'puertas') {
      let puertasHTML = `
        <div style="text-align: center; margin-bottom: 1rem; padding: 0.75rem; background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); border-radius: 12px; color: white;">
          <h4 style="margin: 0; font-size: 1.1rem; font-weight: 600;">🚪 Puertas del Día</h4>
        </div>
        <div style="display: grid; gap: 0.75rem;">
      `;

      data.puertas.forEach(p => {
        // Determinar emoji y color según la jornada
        let emoji = '🕐';
        let colorAccent = '#0ea5e9';
        const jornada = p.jornada.toLowerCase();

        if (jornada.includes('02-08')) {
          emoji = '🌙';
          colorAccent = '#6366f1'; // Púrpura
        } else if (jornada.includes('08-14')) {
          emoji = '☀️';
          colorAccent = '#f59e0b'; // Amarillo
        } else if (jornada.includes('14-20')) {
          emoji = '🌤️';
          colorAccent = '#ec4899'; // Rosa
        } else if (jornada.includes('20-02')) {
          emoji = '🌆';
          colorAccent = '#8b5cf6'; // Morado
        } else if (jornada.includes('festivo')) {
          emoji = '🎉';
          colorAccent = '#10b981'; // Verde
        }

        puertasHTML += `
          <div style="
            border: 2px solid ${colorAccent}20;
            border-left: 4px solid ${colorAccent};
            border-radius: 10px;
            padding: 0.875rem;
            background: linear-gradient(135deg, ${colorAccent}08 0%, transparent 100%);
            transition: all 0.3s ease;
          ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <div style="font-weight: 600; font-size: 1rem; color: #0f172a; display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 1.25rem;">${emoji}</span>
                <span>${p.jornada}</span>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.5rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem; background: white; padding: 0.5rem; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <span style="font-size: 1rem;">📍</span>
                <div style="flex: 1;">
                  <div style="font-size: 0.7rem; color: #64748b; font-weight: 500;">SP</div>
                  <div style="font-size: 1.1rem; font-weight: 700; color: ${colorAccent};">${p.sp || '-'}</div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 0.5rem; background: white; padding: 0.5rem; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <span style="font-size: 1rem;">⚓</span>
                <div style="flex: 1;">
                  <div style="font-size: 0.7rem; color: #64748b; font-weight: 500;">OC</div>
                  <div style="font-size: 1.1rem; font-weight: 700; color: ${colorAccent};">${p.oc || '-'}</div>
                </div>
              </div>
            </div>
          </div>
        `;
      });

      puertasHTML += `</div>`;
      card.innerHTML = puertasHTML;
    }

    return card;
  }

  /**
   * Formatea el mensaje (markdown simple)
   */
  formatMessage(text) {
    // Negrita
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Saltos de línea
    text = text.replace(/\n/g, '<br>');

    return text;
  }

  /**
   * Ejecuta una acción
   */
  async executeAction(action) {
    if (action.type === 'open_link') {
      window.open(action.url, '_blank');
    }

    if (action.type === 'navigate_pwa') {
      console.log('Navegar a:', action.page);

      // Usar rutas relativas para mantener la sesión
      // El hash debe coincidir con data-page del nav en index.html
      let targetUrl = '../index.html';

      if (action.page === 'calculadora' || action.page === 'oraculo') {
        // La pestaña se llama "calculadora" en el HTML pero muestra "El Oráculo"
        targetUrl = '../index.html?page=calculadora';
      } else if (action.page === 'jornales') {
        targetUrl = '../index.html?page=jornales';
      } else if (action.page === 'sueldometro') {
        targetUrl = '../index.html?page=sueldometro';
      } else if (action.page === 'puertas') {
        targetUrl = '../index.html?page=puertas';
      }

      // Navegar en la misma ventana para mantener la sesión
      window.location.href = targetUrl;
    }
  }

  /**
   * Maneja las acciones rápidas
   */
  handleQuickAction(action) {
    const actionMap = {
      'cuando-trabajo': '¿Cuándo voy a trabajar?',
      'posicion': '¿A cuántas posiciones estoy?',
      'jornales': '¿Cuántos jornales llevo esta quincena?',
      'salario': '¿Cuánto llevo ganado esta quincena?',
      'donde-trabajo': '¿Dónde trabajo hoy?',
      'no-disponible': 'Ábreme el formulario de no disponibilidad'
    };

    const text = actionMap[action];
    if (text) {
      this.elements.messageInput.value = text;
      this.sendMessage();
    }
  }

  /**
   * Alterna el reconocimiento de voz
   */
  toggleVoice() {
    if (!this.voiceHandler.isRecognitionAvailable()) {
      alert('Tu navegador no soporta reconocimiento de voz. Prueba con Chrome o Edge.');
      return;
    }

    if (this.voiceHandler.isListening) {
      // Detener
      this.voiceHandler.stopListening();
      this.elements.voiceBtn.classList.remove('active');
      this.elements.voiceIndicator.classList.add('hidden');
    } else {
      // Iniciar
      this.elements.voiceBtn.classList.add('active');
      this.elements.voiceIndicator.classList.remove('hidden');

      this.voiceHandler.startListening(
        (transcript, confidence) => {
          // Éxito
          this.elements.voiceBtn.classList.remove('active');
          this.elements.voiceIndicator.classList.add('hidden');
          this.elements.messageInput.value = transcript;
          this.sendMessage();
        },
        (error) => {
          // Error
          this.elements.voiceBtn.classList.remove('active');
          this.elements.voiceIndicator.classList.add('hidden');
          this.showMessage('bot', `Error de voz: ${error}`);
        }
      );
    }
  }

  /**
   * Muestra/oculta el overlay de carga
   */
  showLoading(show) {
    if (show) {
      this.elements.loadingOverlay.classList.remove('hidden');
    } else {
      this.elements.loadingOverlay.classList.add('hidden');
    }
  }

  /**
   * Scroll al final del chat
   */
  scrollToBottom() {
    const container = document.getElementById('chat-container');
    setTimeout(() => {
      container.scrollTop = container.scrollHeight;
    }, 100);
  }

  /**
   * Carga la configuración guardada
   */
  loadSettings() {
    // Voice response
    const voiceEnabled = localStorage.getItem('voice_enabled');
    if (voiceEnabled !== null) {
      document.getElementById('voice-response-toggle').checked = (voiceEnabled === '1');
    }

    // Quick actions
    const quickActionsEnabled = localStorage.getItem('quick_actions_enabled');
    if (quickActionsEnabled !== null) {
      const enabled = (quickActionsEnabled === '1');
      document.getElementById('quick-actions-toggle').checked = enabled;
      this.elements.quickActions.style.display = enabled ? 'flex' : 'none';
    }

    // AI mode
    const aiMode = localStorage.getItem('ai_mode');
    if (aiMode) {
      document.getElementById('ai-mode-select').value = aiMode;

      // Mostrar/ocultar sección de API key según el modo
      const apiKeySection = document.getElementById('api-key-section');
      apiKeySection.style.display = (aiMode === 'groq' || aiMode === 'openai') ? 'block' : 'none';
    }

    // API key
    const apiKey = localStorage.getItem('ai_api_key');
    if (apiKey) {
      document.getElementById('api-key-input').value = apiKey;
    }
  }

  /**
   * Inicia la rotación automática de imágenes de fondo
   */
  startBackgroundRotation() {
    // Precargar todas las imágenes para evitar parpadeos negros
    this.preloadBackgroundImages();

    // Cambiar imagen cada 30 segundos
    setInterval(() => {
      this.currentBgIndex = (this.currentBgIndex + 1) % this.backgroundImages.length;
      const newImage = this.backgroundImages[this.currentBgIndex];
      document.documentElement.style.setProperty('--bg-image', `url('${newImage}')`);
      console.log(`🖼️ Cambiando fondo a imagen ${this.currentBgIndex + 1}/${this.backgroundImages.length}`);
    }, 30000);

    // Aplicar la primera imagen inmediatamente
    document.documentElement.style.setProperty('--bg-image', `url('${this.backgroundImages[0]}')`);
  }

  /**
   * Precarga todas las imágenes de fondo para evitar parpadeos negros
   */
  preloadBackgroundImages() {
    this.backgroundImages.forEach((src, index) => {
      const img = new Image();
      img.src = src;
      img.onload = () => console.log(`📷 Imagen ${index + 1}/${this.backgroundImages.length} precargada`);
      img.onerror = () => console.warn(`⚠️ Error cargando imagen ${index + 1}: ${src}`);
    });
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
  const app = new ChatApp();
  await app.initialize();

  // Hacer accesible globalmente para debug
  window.chatApp = app;
});
