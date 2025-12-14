/**
 * Voice Handler - Web Speech API
 * Maneja reconocimiento y síntesis de voz
 * 100% gratuito, nativo del navegador
 */

class VoiceHandler {
  constructor() {
    // Web Speech API - Reconocimiento de voz
    this.recognition = null;
    this.isListening = false;

    // Web Speech API - Síntesis de voz
    this.synthesis = window.speechSynthesis;
    this.voiceEnabled = false; // Desactivado por defecto

    // Configuración
    this.lang = 'es-ES';
    this.continuous = false;
    this.interimResults = false;

    this.initRecognition();
  }

  /**
   * Inicializa el reconocimiento de voz
   */
  initRecognition() {
    // Verificar soporte
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('⚠️ Web Speech API no soportada en este navegador');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = this.lang;
    this.recognition.continuous = this.continuous;
    this.recognition.interimResults = this.interimResults;

    console.log('✅ Reconocimiento de voz inicializado');
  }

  /**
   * Inicia el reconocimiento de voz
   */
  startListening(onResult, onError) {
    if (!this.recognition) {
      if (onError) onError('Reconocimiento de voz no disponible');
      return;
    }

    if (this.isListening) {
      console.warn('⚠️ Ya estamos escuchando');
      return;
    }

    this.isListening = true;

    // Eventos
    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;

      console.log('🎤 Transcripción:', transcript, 'Confianza:', confidence);

      if (onResult) {
        onResult(transcript, confidence);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('❌ Error en reconocimiento de voz:', event.error);
      this.isListening = false;

      if (onError) {
        let errorMessage = 'Error en el reconocimiento de voz';

        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No se detectó ningún sonido';
            break;
          case 'audio-capture':
            errorMessage = 'No se pudo acceder al micrófono';
            break;
          case 'not-allowed':
            errorMessage = 'Permisos de micrófono denegados';
            break;
          case 'network':
            errorMessage = 'Error de conexión';
            break;
        }

        onError(errorMessage);
      }
    };

    this.recognition.onend = () => {
      console.log('🔇 Reconocimiento de voz finalizado');
      this.isListening = false;
    };

    // Iniciar
    try {
      this.recognition.start();
      console.log('🎤 Escuchando...');
    } catch (error) {
      console.error('❌ Error al iniciar reconocimiento:', error);
      this.isListening = false;
      if (onError) onError('No se pudo iniciar el micrófono');
    }
  }

  /**
   * Detiene el reconocimiento de voz
   */
  stopListening() {
    if (!this.recognition || !this.isListening) {
      return;
    }

    try {
      this.recognition.stop();
      this.isListening = false;
      console.log('🔇 Reconocimiento detenido');
    } catch (error) {
      console.error('❌ Error al detener reconocimiento:', error);
    }
  }

  /**
   * Lee un texto en voz alta
   */
  speak(text, onEnd) {
    if (!this.voiceEnabled) {
      console.log('🔇 Síntesis de voz deshabilitada');
      if (onEnd) onEnd();
      return;
    }

    if (!this.synthesis) {
      console.warn('⚠️ Síntesis de voz no disponible');
      if (onEnd) onEnd();
      return;
    }

    // Cancelar cualquier síntesis en curso
    this.synthesis.cancel();

    // Crear utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.lang;
    utterance.rate = 1.0; // Velocidad normal
    utterance.pitch = 1.0; // Tono normal
    utterance.volume = 1.0; // Volumen máximo

    // Intentar usar una voz en español si está disponible
    const voices = this.synthesis.getVoices();
    const spanishVoice = voices.find(voice =>
      voice.lang.startsWith('es-') ||
      voice.lang.startsWith('es_')
    );

    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    // Eventos
    utterance.onend = () => {
      console.log('🔊 Síntesis de voz finalizada');
      if (onEnd) onEnd();
    };

    utterance.onerror = (event) => {
      console.error('❌ Error en síntesis de voz:', event.error);
      if (onEnd) onEnd();
    };

    // Hablar
    this.synthesis.speak(utterance);
    console.log('🔊 Hablando:', text.substring(0, 50) + '...');
  }

  /**
   * Detiene la síntesis de voz
   */
  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
      console.log('🔇 Síntesis de voz detenida');
    }
  }

  /**
   * Alterna la síntesis de voz
   */
  toggleVoice(enabled) {
    this.voiceEnabled = enabled;
    localStorage.setItem('voice_enabled', enabled ? '1' : '0');
    console.log('🔊 Síntesis de voz:', enabled ? 'activada' : 'desactivada');
  }

  /**
   * Verifica si el reconocimiento de voz está disponible
   */
  isRecognitionAvailable() {
    return this.recognition !== null;
  }

  /**
   * Verifica si la síntesis de voz está disponible
   */
  isSynthesisAvailable() {
    return this.synthesis !== null;
  }

  /**
   * Carga la configuración guardada
   */
  loadSettings() {
    const voiceEnabled = localStorage.getItem('voice_enabled');
    if (voiceEnabled !== null) {
      this.voiceEnabled = voiceEnabled === '1';
    }
  }
}

// Exportar
window.VoiceHandler = VoiceHandler;
