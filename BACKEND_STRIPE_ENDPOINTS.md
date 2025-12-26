# Endpoints Necesarios para el Backend de Stripe

Estos archivos deben agregarse a tu backend de Vercel en: `portalestiba-push-backend`

## 📁 Estructura de Archivos

```
portalestiba-push-backend/
├── api/
│   ├── create-checkout-session.js  ← NUEVO
│   ├── stripe-webhook.js          ← NUEVO
│   └── push/
│       └── ... (endpoints existentes)
├── package.json
└── vercel.json
```

---

## 📝 Archivo 1: `api/create-checkout-session.js`

```javascript
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
      success_url: `${process.env.FRONTEND_URL || 'https://portalestibavlc.netlify.app'}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'https://portalestibavlc.netlify.app'}?payment=cancel`,
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
```

---

## 📝 Archivo 2: `api/stripe-webhook.js`

```javascript
/**
 * Endpoint para recibir webhooks de Stripe
 * POST /api/stripe-webhook
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Cliente de Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verificar la firma del webhook
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('📥 Webhook event received:', event.type);

  try {
    // Procesar diferentes tipos de eventos
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    // Registrar webhook en la tabla stripe_webhooks
    await supabase
      .from('stripe_webhooks')
      .insert({
        stripe_event_id: event.id,
        tipo_evento: event.type,
        payload: event.data.object,
        procesado: true,
      });

    res.status(200).json({ received: true });

  } catch (error) {
    console.error('❌ Error processing webhook:', error);

    // Registrar error
    await supabase
      .from('stripe_webhooks')
      .insert({
        stripe_event_id: event.id,
        tipo_evento: event.type,
        payload: event.data.object,
        procesado: false,
        error: error.message,
      });

    res.status(500).json({ error: error.message });
  }
};

/**
 * Maneja cuando se completa un checkout
 */
async function handleCheckoutCompleted(session) {
  console.log('✅ Checkout completed:', session.id);

  const chapa = session.client_reference_id || session.metadata?.chapa;

  if (!chapa) {
    console.error('❌ No chapa found in session');
    return;
  }

  // Obtener la suscripción
  const subscription = await stripe.subscriptions.retrieve(session.subscription);

  await updateUserPremium(chapa, subscription);
}

/**
 * Maneja actualizaciones de suscripción
 */
async function handleSubscriptionUpdate(subscription) {
  console.log('🔄 Subscription updated:', subscription.id);

  const chapa = subscription.metadata?.chapa;

  if (!chapa) {
    console.error('❌ No chapa found in subscription metadata');
    return;
  }

  await updateUserPremium(chapa, subscription);
}

/**
 * Maneja cancelación de suscripción
 */
async function handleSubscriptionCanceled(subscription) {
  console.log('❌ Subscription canceled:', subscription.id);

  const chapa = subscription.metadata?.chapa;

  if (!chapa) {
    console.error('❌ No chapa found in subscription metadata');
    return;
  }

  await supabase.rpc('actualizar_suscripcion_desde_webhook', {
    p_chapa: chapa,
    p_stripe_customer_id: subscription.customer,
    p_stripe_subscription_id: subscription.id,
    p_stripe_price_id: subscription.items.data[0].price.id,
    p_estado: 'canceled',
    p_periodo_inicio: new Date(subscription.current_period_start * 1000).toISOString(),
    p_periodo_fin: new Date(subscription.current_period_end * 1000).toISOString(),
  });

  console.log('✅ Usuario premium actualizado (cancelado):', chapa);
}

/**
 * Maneja pago exitoso de factura
 */
async function handleInvoicePaymentSucceeded(invoice) {
  console.log('💰 Invoice payment succeeded:', invoice.id);

  if (!invoice.subscription) return;

  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const chapa = subscription.metadata?.chapa;

  if (!chapa) return;

  await updateUserPremium(chapa, subscription);
}

/**
 * Maneja fallo de pago de factura
 */
async function handleInvoicePaymentFailed(invoice) {
  console.log('❌ Invoice payment failed:', invoice.id);

  if (!invoice.subscription) return;

  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const chapa = subscription.metadata?.chapa;

  if (!chapa) return;

  // Actualizar estado a 'past_due'
  await supabase.rpc('actualizar_suscripcion_desde_webhook', {
    p_chapa: chapa,
    p_stripe_customer_id: subscription.customer,
    p_stripe_subscription_id: subscription.id,
    p_stripe_price_id: subscription.items.data[0].price.id,
    p_estado: 'past_due',
    p_periodo_inicio: new Date(subscription.current_period_start * 1000).toISOString(),
    p_periodo_fin: new Date(subscription.current_period_end * 1000).toISOString(),
  });

  console.log('⚠️ Usuario premium actualizado (past_due):', chapa);
}

/**
 * Actualiza el usuario premium en Supabase
 */
async function updateUserPremium(chapa, subscription) {
  const estado = subscription.status; // 'active', 'trialing', 'past_due', 'canceled'

  await supabase.rpc('actualizar_suscripcion_desde_webhook', {
    p_chapa: chapa,
    p_stripe_customer_id: subscription.customer,
    p_stripe_subscription_id: subscription.id,
    p_stripe_price_id: subscription.items.data[0].price.id,
    p_estado: estado,
    p_periodo_inicio: new Date(subscription.current_period_start * 1000).toISOString(),
    p_periodo_fin: new Date(subscription.current_period_end * 1000).toISOString(),
  });

  console.log('✅ Usuario premium actualizado en Supabase:', chapa);
}
```

---

## 🔧 Variables de Entorno a Añadir

En tu proyecto de Vercel, añade estas nuevas variables:

```env
STRIPE_SECRET_KEY=sk_live_TU_STRIPE_SECRET_KEY_AQUI

STRIPE_WEBHOOK_SECRET=whsec_TU_WEBHOOK_SECRET_AQUI

FRONTEND_URL=https://portalestibavlc.vercel.app
```

**IMPORTANTE**: Usa tus claves reales de Stripe que te proporcioné anteriormente. NO las subas a GitHub, solo configúralas en Vercel.

Las variables `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` ya las tienes.

---

## 📦 Actualizar `package.json`

Añade estas dependencias:

```json
{
  "dependencies": {
    "stripe": "^14.0.0",
    "@supabase/supabase-js": "^2.38.0"
  }
}
```

---

## 🚀 Pasos para Implementar

### 1. Clonar tu backend
```bash
git clone https://github.com/TheViking816/portalestiba-push-backend.git
cd portalestiba-push-backend
```

### 2. Crear los archivos

Crea los dos archivos en la carpeta `api/`:
- `api/create-checkout-session.js`
- `api/stripe-webhook.js`

### 3. Actualizar package.json

Añade las dependencias de Stripe y Supabase.

### 4. Añadir variables de entorno en Vercel

En el dashboard de Vercel:
- Settings > Environment Variables
- Añade las 3 nuevas variables

### 5. Deployar

```bash
git add api/
git commit -m "feat: Add Stripe checkout and webhook endpoints"
git push origin main
```

Vercel hará el deploy automáticamente.

### 6. Verificar endpoints

Una vez desplegado, deberías poder acceder a:
- `https://portalestiba-push-backend-one.vercel.app/api/create-checkout-session`
- `https://portalestiba-push-backend-one.vercel.app/api/stripe-webhook`

---

## ✅ Checklist Final

- [ ] Archivos creados en `api/`
- [ ] Dependencies añadidas a `package.json`
- [ ] Variables de entorno configuradas en Vercel
- [ ] Push a GitHub y deploy automático
- [ ] Webhooks configurados en Stripe Dashboard
- [ ] Tested con tarjeta de prueba

---

*Documentación creada el 30/11/2024*
