/**
 * Endpoint para crear sesiones de Stripe Checkout
 * POST /api/create-checkout-session
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { chapa, priceId } = req.body;

    if (!chapa || !priceId) {
      return res.status(400).json({
        error: 'Missing required fields: chapa, priceId'
      });
    }

    console.log('Creating checkout session for:', { chapa, priceId });

    // Crear sesión de Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: `${process.env.FRONTEND_URL || 'https://portal-estiba-vlc.vercel.app'}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'https://portal-estiba-vlc.vercel.app'}?payment=cancel`,
      client_reference_id: chapa,
      metadata: {
        chapa: chapa,
      },
      subscription_data: {
        metadata: {
          chapa: chapa,
        },
      },
    });

    console.log('✅ Checkout session created:', session.id);

    res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    res.status(500).json({
      error: error.message,
      type: error.type,
    });
  }
};
