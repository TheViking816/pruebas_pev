# ⚙️ Configuración Backend Vercel - Sistema Freemium

## 📋 Resumen

Tu backend ya está configurado en Vercel: **portalestiba-push-backend-one.vercel.app**

Los endpoints de Stripe ya están añadidos al repositorio de GitHub y Vercel los desplegará automáticamente.

---

## ✅ Endpoints Añadidos

1. **POST /api/create-checkout-session**
   - Crea sesiones de Stripe Checkout
   - URL: `https://portalestiba-push-backend-one.vercel.app/api/create-checkout-session`

2. **POST /api/stripe-webhook**
   - Procesa webhooks de Stripe
   - URL: `https://portalestiba-push-backend-one.vercel.app/api/stripe-webhook`

---

## 🔧 Variables de Entorno a Configurar

Ve a tu proyecto en Vercel: https://vercel.com/dashboard

**Settings > Environment Variables**

### Variables Nuevas a Añadir:

```
STRIPE_SECRET_KEY = sk_live_TU_SECRET_KEY_AQUI

STRIPE_WEBHOOK_SECRET = whsec_TU_WEBHOOK_SECRET_AQUI

FRONTEND_URL = https://portalestibavlc.vercel.app
```

**⚠️ IMPORTANTE**: Usa tus claves reales de Stripe (te las proporcioné en mensaje anterior).
NO las subas a GitHub, solo configúralas en el dashboard de Vercel.

### Variables que Ya Tienes (NO modificar):

```
✅ SUPABASE_URL
✅ SUPABASE_SERVICE_ROLE_KEY
✅ VAPID_PUBLIC_KEY
✅ VAPID_PRIVATE_KEY
✅ WEB_PUSH_EMAIL
✅ STRIPE_PUBLISHABLE_KEY (esta ya la tienes)
```

---

## 🚀 Pasos a Seguir

### 1. Añadir Variables de Entorno

1. Ve a https://vercel.com/dashboard
2. Selecciona proyecto: **portalestiba-push-backend-one**
3. Settings > Environment Variables
4. Añade las 3 variables nuevas (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, FRONTEND_URL)
5. **IMPORTANTE**: Selecciona **"All Environments"** para cada variable

### 2. Redeploy (Opcional)

Vercel ya hizo el deploy automáticamente cuando pusheé los archivos. Pero si quieres forzar un redeploy:

1. Ve a Deployments
2. Clic en los 3 puntos del último deployment
3. "Redeploy"

### 3. Verificar que Funcionan los Endpoints

Abre en el navegador:
```
https://portalestiba-push-backend-one.vercel.app/api/create-checkout-session
```

Deberías ver:
```json
{"error":"Method not allowed"}
```

Esto es correcto (solo acepta POST, no GET).

---

## 🔗 Webhook de Stripe

Tu webhook ya está correctamente configurado:

```
URL: https://portalestiba-push-backend-one.vercel.app/api/stripe-webhook
Signing Secret: whsec_lGVLJfgFnIShzonQS4TVW14VWhPhFZno
```

### Eventos Configurados:
- ✅ checkout.session.completed
- ✅ customer.subscription.created
- ✅ customer.subscription.updated
- ✅ customer.subscription.deleted
- ✅ invoice.payment_succeeded
- ✅ invoice.payment_failed

**PERFECTO** ✅

---

## 🧪 Testing

### Probar Checkout:

1. Abre tu PWA: https://portalestibavlc.vercel.app
2. Ve a Sueldómetro u Oráculo
3. Clic en "Desbloquear por €4.99/mes"
4. Debería redirigir a Stripe Checkout

### Probar Webhook:

1. Completa un pago de prueba en Stripe
2. Ve a Stripe Dashboard > Developers > Webhooks
3. Clic en tu webhook
4. Deberías ver eventos procesados con status 200

---

## 📁 Archivos Añadidos al Backend

```
api/
├── create-checkout-session.js  ✅ AÑADIDO
├── stripe-webhook.js           ✅ AÑADIDO
└── push/
    └── ... (tus archivos existentes)
```

---

## ❓ FAQ

**P: ¿Tengo que modificar algo más en el backend?**
R: No, los endpoints ya están pusheados a GitHub y Vercel los desplegó automáticamente.

**P: ¿Dónde configuro las variables de entorno?**
R: En Vercel Dashboard > Tu Proyecto > Settings > Environment Variables

**P: ¿Qué es FRONTEND_URL?**
R: Es la URL de tu PWA (https://portalestibavlc.vercel.app). Se usa para redirecciones después del pago.

**P: ¿El webhook ya está configurado?**
R: Sí, la URL ya está bien configurada en Stripe. Solo falta añadir las variables de entorno.

---

## ✅ Checklist

- [ ] Añadir STRIPE_SECRET_KEY en Vercel
- [ ] Añadir STRIPE_WEBHOOK_SECRET en Vercel
- [ ] Añadir FRONTEND_URL en Vercel
- [ ] Verificar que el deploy se completó
- [ ] Probar endpoint de checkout
- [ ] Hacer pago de prueba

---

¡Todo listo para empezar a monetizar! 🚀
