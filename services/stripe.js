/**
 * Servicio de Stripe - Frontend
 * Maneja Checkout y suscripciones
 */

// Cargar Stripe
let stripe = null;

const PRICE_IDS = {
  mensual: 'price_1ShUsJFaw8romGYaKSImR29Z',
  anual: 'price_1Shc9sFaw8romGYaAdQia54L'
};

/**
 * Inicializa Stripe
 */
export function initStripe() {
  if (!stripe) {
    // Clave publicable de PRODUCCIÓN de Stripe
    const publishableKey = 'pk_live_51SVcFLFaw8romGYaiRfEKdpLBmzDqQCk8gC6vxfgKb0cwj8FuLyHlzCc0I2B6NElTDyy8eAltkcAitQFy2oEa5Lu00KvkmZ2RY';

    if (!window.Stripe) {
      console.error('❌ Stripe SDK no cargado. Asegúrate de incluir <script src="https://js.stripe.com/v3/"></script>');
      throw new Error('Stripe SDK no disponible');
    }

    stripe = window.Stripe(publishableKey);
    console.log('✅ Stripe inicializado con key:', publishableKey.substring(0, 20) + '...');
  }
  return stripe;
}

/**
 * Redirige a Stripe Checkout para suscripción
 */
export async function redirectToCheckout(chapa, priceId = PRICE_IDS.mensual) {
  try {
    const stripeInstance = initStripe();

    // URL del backend (Vercel)
    const BACKEND_URL = 'https://portalestiba-push-backend-one.vercel.app';

    console.log('🔄 Creando sesión de checkout para chapa:', chapa);

    // Crear sesión de checkout en backend
    const response = await fetch(`${BACKEND_URL}/api/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chapa: chapa,
        priceId: priceId
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend error: ${response.status} - ${errorText}`);
    }

    const session = await response.json();

    if (session.error) {
      throw new Error(session.error);
    }

    console.log('✅ Sesión creada:', session.sessionId);

    // Redirigir a Stripe Checkout
    const result = await stripeInstance.redirectToCheckout({
      sessionId: session.sessionId,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

  } catch (error) {
    console.error('❌ Error COMPLETO en checkout:', error);
    console.error('Stack trace:', error.stack);
    console.error('Error message:', error.message);
    alert(`Error al procesar el pago: ${error.message}\n\nRevisa la consola (F12) para más detalles.`);
  }
}

/**
 * Redirige al portal de gestión de suscripción
 */
export async function redirectToCustomerPortal(chapa) {
  try {
    // URL del backend (Vercel)
    const BACKEND_URL = 'https://portalestiba-push-backend-one.vercel.app';

    console.log('🔄 Abriendo portal de gestión para chapa:', chapa);

    const response = await fetch(`${BACKEND_URL}/api/create-portal-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chapa }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend error: ${response.status} - ${errorText}`);
    }

    const session = await response.json();

    if (session.error) {
      throw new Error(session.error);
    }

    console.log('✅ Portal session creada, redirigiendo...');

    // Redirigir al portal de cliente
    window.location.href = session.url;

  } catch (error) {
    console.error('❌ Error abriendo portal:', error);
    alert(`Error al abrir el portal de gestión: ${error.message}\n\nAsegúrate de tener una suscripción activa.`);
  }
}
