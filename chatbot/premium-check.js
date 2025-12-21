/**
 * Verificación de acceso Premium para Chatbot IA
 * Este script se carga al inicio del chatbot para verificar que el usuario tenga acceso premium
 */

// PASO 1: Ocultar TODO inmediatamente para evitar que se vea contenido sin permiso
// Guardar referencia al estilo para poder eliminarlo después
let premiumLockStyle = null;

(function ocultarContenidoInmediato() {
  // Añadir estilos inline inmediatamente
  premiumLockStyle = document.createElement('style');
  premiumLockStyle.id = 'premium-lock-style';
  premiumLockStyle.textContent = `
    #chat-container,
    .input-area,
    #quick-actions {
      display: none !important;
    }
    body {
      overflow: hidden;
    }
  `;
  document.head.appendChild(premiumLockStyle);
  console.log('🔒 [CHATBOT] Contenido oculto hasta verificar acceso premium');
})();

// PASO 2: Verificar acceso premium
(async function() {
  console.log('🔐 [CHATBOT] Iniciando verificación de acceso premium...');

  // Esperar a que Supabase esté disponible
  let retries = 0;
  const maxRetries = 50; // 5 segundos (50 x 100ms)

  while (!window.supabaseClient && retries < maxRetries) {
    await new Promise(resolve => setTimeout(resolve, 100));
    retries++;
  }

  if (!window.supabaseClient) {
    console.error('❌ [CHATBOT] Supabase no está disponible');
    mostrarBloqueo('Error al verificar acceso. Intenta recargar la página.');
    return;
  }

  // Obtener chapa del usuario
  const chapa = localStorage.getItem('currentChapa');

  if (!chapa) {
    console.warn('⚠️ [CHATBOT] No hay sesión de usuario');
    redirigirAlLogin();
    return;
  }

  console.log(`🔍 [CHATBOT] Verificando acceso premium para chapa: ${chapa}`);

  try {
    // Llamar a la función RPC de Supabase
    const { data, error } = await window.supabaseClient.rpc('tiene_acceso_feature', {
      chapa_usuario: chapa,
      nombre_feature: 'chatbot_ia'
    });

    if (error) {
      console.error('❌ [CHATBOT] Error al verificar acceso:', error);
      mostrarBloqueo('Error al verificar tu suscripción. Intenta más tarde.');
      return;
    }

    if (data !== true) {
      console.log('🔒 [CHATBOT] Usuario sin acceso premium');
      mostrarBloqueo();
    } else {
      console.log('✅ [CHATBOT] Usuario tiene acceso premium - permitiendo acceso');
      // Mostrar el contenido del chatbot
      desbloquearContenido();
    }

  } catch (error) {
    console.error('❌ [CHATBOT] Error en verificación de premium:', error);
    mostrarBloqueo('Error al verificar tu suscripción. Intenta más tarde.');
  }
})();

/**
 * Muestra overlay de bloqueo premium
 */
function mostrarBloqueo(mensajeError = null) {
  // Ocultar todo el contenido del chatbot
  const chatContainer = document.getElementById('chat-container');
  const inputArea = document.querySelector('.input-area');
  const quickActions = document.getElementById('quick-actions');
  const header = document.querySelector('.chat-header');

  if (chatContainer) chatContainer.style.display = 'none';
  if (inputArea) inputArea.style.display = 'none';
  if (quickActions) quickActions.style.display = 'none';

  // Crear overlay de bloqueo
  const overlay = document.createElement('div');
  overlay.id = 'premium-lock-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 2rem;
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    background: white;
    border-radius: 16px;
    padding: 1.5rem 1.25rem;
    max-width: 400px;
    width: 90%;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    max-height: 90vh;
    overflow-y: auto;
  `;

  if (mensajeError) {
    // Mostrar mensaje de error
    content.innerHTML = `
      <div style="font-size: 4rem; margin-bottom: 1rem;">⚠️</div>
      <h2 style="color: #1a1a2e; margin-bottom: 1rem; font-size: 1.5rem;">Error de verificación</h2>
      <p style="color: #64748b; margin-bottom: 2rem; line-height: 1.6;">${mensajeError}</p>
      <button onclick="window.location.href='../index.html'"
        style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
               color: white; border: none; padding: 1rem 2rem; border-radius: 12px;
               font-size: 1rem; font-weight: 600; cursor: pointer; width: 100%;">
        Volver al Portal
      </button>
    `;
  } else {
    // Mostrar bloqueo premium normal
    content.innerHTML = `
      <div style="font-size: 3rem; margin-bottom: 0.75rem;">🤖✨</div>
      <h2 style="color: #1a1a2e; margin-bottom: 0.5rem; font-size: 1.4rem;">Chatbot IA Premium</h2>
      <p style="color: #64748b; margin-bottom: 1rem; line-height: 1.5; font-size: 0.9rem;">
        El asistente virtual inteligente está disponible solo para usuarios premium.
      </p>

      <div style="background: #f8fafc; padding: 1rem; border-radius: 10px; margin-bottom: 1rem; text-align: left;">
        <p style="font-weight: 600; color: #1a1a2e; margin-bottom: 0.5rem; font-size: 0.9rem;">✨ Con Premium obtienes:</p>
        <ul style="color: #64748b; list-style: none; padding: 0; margin: 0; font-size: 0.85rem;">
          <li style="padding: 0.25rem 0;">✅ Asistente IA conversacional avanzado</li>
          <li style="padding: 0.25rem 0;">✅ Acceso completo al Sueldómetro</li>
          <li style="padding: 0.25rem 0;">✅ Predicciones del Oráculo</li>
          <li style="padding: 0.25rem 0;">✅ Soporte prioritario</li>
        </ul>
      </div>

      <button onclick="redirigirAPasarelaPago()"
        style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
               color: white; border: none; padding: 0.875rem 1.5rem; border-radius: 10px;
               font-size: 1rem; font-weight: 600; cursor: pointer; width: 100%;
               box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3); margin-bottom: 0.75rem;">
        ⭐ Desbloquear Premium
      </button>

      <button onclick="window.location.href='../index.html'"
        style="background: transparent; color: #64748b; border: 2px solid #e2e8f0;
               padding: 0.625rem 1.5rem; border-radius: 10px; font-size: 0.9rem;
               font-weight: 600; cursor: pointer; width: 100%;">
        Volver al Portal
      </button>
    `;
  }

  overlay.appendChild(content);
  document.body.appendChild(overlay);
}

/**
 * Desbloquea el contenido del chatbot (usuario con acceso premium)
 */
function desbloquearContenido() {
  console.log('🔓 [CHATBOT] Desbloqueando contenido...');

  // IMPORTANTE: Eliminar el <style> tag que oculta el contenido con !important
  if (premiumLockStyle && premiumLockStyle.parentNode) {
    premiumLockStyle.parentNode.removeChild(premiumLockStyle);
    console.log('🗑️ [CHATBOT] Estilos de bloqueo eliminados');
  }

  // Mostrar el contenido del chatbot (por si acaso)
  const chatContainer = document.getElementById('chat-container');
  const inputArea = document.querySelector('.input-area');
  const quickActions = document.getElementById('quick-actions');

  if (chatContainer) chatContainer.style.display = '';
  if (inputArea) inputArea.style.display = '';
  if (quickActions) quickActions.style.display = '';

  // Permitir scroll
  document.body.style.overflow = '';

  console.log('✅ [CHATBOT] Contenido desbloqueado');
}

/**
 * Redirige al login de la PWA principal
 */
function redirigirAlLogin() {
  console.log('🔄 [CHATBOT] Redirigiendo al login...');
  setTimeout(() => {
    window.location.href = '../index.html';
  }, 1000);
}


/**
 * Redirige a la pasarela de pago de Stripe
 */
async function redirigirAPasarelaPago() {
  const chapa = localStorage.getItem('currentChapa');
  if (!chapa) {
    console.error('❌ No hay chapa en localStorage');
    alert('Error: No se pudo obtener tu información de usuario');
    return;
  }

  try {
    console.log('🔄 Redirigiendo a pasarela de pago...');

    // Importar dinámicamente el servicio de Stripe desde la app principal
    const { redirectToCheckout } = await import('../services/stripe.js');
    await redirectToCheckout(chapa);

  } catch (error) {
    console.error('❌ Error al redirigir a pasarela:', error);
    alert('Error al procesar el pago. Por favor, intenta de nuevo.');
  }
}
