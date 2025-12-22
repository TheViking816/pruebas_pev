/**
 * Configuración de Features - Portal Estiba VLC
 * Control manual de visibilidad de funcionalidades
 */

const FEATURES_CONFIG = {
  // ==========================================================================
  // CHATBOT IA - Control de visibilidad
  // ==========================================================================
  CHATBOT_IA: {
    /**
     * Controla si el botón del chatbot es visible en la PWA
     * true = mostrar botón | false = ocultar botón
     *
     * IMPORTANTE: Aunque esté visible, el chatbot seguirá requiriendo premium
     * para ser usado. Esta opción solo controla la visibilidad del botón.
     */
    mostrarBoton: true, // ⚠️ CAMBIAR A true CUANDO QUIERAS ACTIVAR EL CHATBOT

    /**
     * Mensaje que se mostrará en consola cuando el botón esté oculto
     */
    mensajeOculto: '🤖 Chatbot IA: Funcionalidad oculta temporalmente (en desarrollo)'
  },

  // ==========================================================================
  // OTRAS FEATURES (para futuro uso)
  // ==========================================================================
  SUELDOMETRO: {
    mostrarBoton: true
  },

  ORACULO: {
    mostrarBoton: true
  }
};

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
  window.FEATURES_CONFIG = FEATURES_CONFIG;
}

// Nota: Si necesitas importar este archivo como módulo ES6,
// descomenta la siguiente línea:
// export default FEATURES_CONFIG;
