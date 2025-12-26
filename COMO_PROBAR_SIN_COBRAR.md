# 🧪 Cómo Probar Stripe LIVE sin Hacer Cargos Reales

## ⚠️ Situación Actual

Estás en **modo LIVE (producción)** de Stripe. Esto significa:
- ✅ Las claves son reales (`pk_live_...`, `sk_live_...`)
- ❌ Las tarjetas de prueba NO funcionan
- ✅ Solo funcionan tarjetas reales
- 💰 Los cargos son REALES

---

## 🎯 Opciones para Probar

### OPCIÓN 1: Volver a Modo TEST Temporalmente (RECOMENDADO) ⭐

Esta es la opción **más segura** para probar sin riesgo.

#### Paso 1: Cambiar a claves de TEST

1. **En el código frontend** (`services/stripe.js`):
   ```javascript
   // Cambiar temporalmente a:
   const publishableKey = 'pk_test_51SVcFZFApc6nOGEvWGRDRJAIrDNCfbpyTCmDyEX7eVRE5YvwJdYOZUDIBi5sy7bPPRnSOCLl1HTV3loZyOEKtkED00Tfnaqegl';

   // Y cambiar el priceId a:
   priceId: 'price_1SglJQFApc6nOGEvpn5MyPA9'
   ```

2. **En Vercel** (Backend):
   - Variables de entorno → `STRIPE_SECRET_KEY`
   - Cambiar a: `sk_test_...` (tu clave de test vieja)

3. **Webhook de TEST**:
   - En Stripe Dashboard → Webhooks → Modo TEST
   - Usar el webhook que ya tienes configurado para test

#### Paso 2: Probar con tarjeta de test
```
Tarjeta: 4242 4242 4242 4242
Fecha: 12/26
CVC: 123
```

#### Paso 3: Volver a LIVE cuando termines
- Revertir cambios a claves `pk_live_` y `sk_live_`
- Redeploy

---

### OPCIÓN 2: Hacer un Pago Real Pequeño y Cancelar ⚠️

Si quieres probar con claves LIVE:

#### Paso 1: Hacer suscripción
- Usa tu tarjeta real
- Completa el pago de €4.99

#### Paso 2: Cancelar INMEDIATAMENTE
1. Ve al Portal de Gestión
2. Cancela la suscripción
3. **Importante**: Stripe NO reembolsa automáticamente, pero puedes:
   - Ir a Stripe Dashboard → Payments
   - Buscar el pago
   - Click "Refund"
   - Reembolsar €4.99

#### Costo: €0 (si reembolsas inmediatamente)

---

### OPCIÓN 3: Simular Eventos con Stripe CLI 🖥️

Puedes simular webhooks sin hacer pagos reales.

#### Instalar Stripe CLI
```bash
# Windows (con Scoop)
scoop install stripe

# O descargar desde:
# https://github.com/stripe/stripe-cli/releases
```

#### Simular eventos
```bash
# Login
stripe login

# Simular pago exitoso
stripe trigger checkout.session.completed

# Simular suscripción creada
stripe trigger customer.subscription.created
```

---

## 🔧 Actualización URGENTE: Corregir URL del Frontend

**IMPORTANTE**: Necesitas actualizar la URL en Vercel porque estaba configurada para Netlify.

### En Vercel (Backend)

1. Ve a: https://vercel.com/dashboard
2. Proyecto: `portalestiba-push-backend-one`
3. Settings → Environment Variables
4. **Añadir o actualizar**:
   ```
   FRONTEND_URL=https://portal-estiba-vlc.vercel.app
   ```
5. **Save**
6. **Redeploy** (Deployments → ⋯ → Redeploy)

---

## ✅ Pasos para Probar (Después de actualizar URL)

### Con Modo TEST (Recomendado)

1. Cambiar a claves TEST (ver Opción 1)
2. Hacer commit y push
3. Redeploy en Vercel (ambos proyectos)
4. Abrir: https://portal-estiba-vlc.vercel.app
5. Login con tu chapa
6. Info Premium → Suscribirme
7. Tarjeta test: `4242 4242 4242 4242`
8. Verificar que funciona
9. Volver a claves LIVE

### Con Modo LIVE (Si prefieres)

1. Actualizar `FRONTEND_URL` en Vercel
2. Redeploy backend
3. Hacer pago con tarjeta real
4. Verificar que funciona
5. Cancelar suscripción
6. Reembolsar desde Stripe Dashboard

---

## 🐛 Verificación Final

Después de actualizar URL y hacer redeploy:

1. Abrir: https://portal-estiba-vlc.vercel.app
2. Login con chapa 638
3. **Abrir consola (F12)**
4. Buscar logs `🔍 DEBUG`
5. Copiarme esos logs para diagnosticar problema de trincadores

---

**Mi Recomendación**: Usa **OPCIÓN 1** (modo TEST) para probar sin riesgo, luego vuelve a LIVE.

**Última actualización**: 2025-12-23
