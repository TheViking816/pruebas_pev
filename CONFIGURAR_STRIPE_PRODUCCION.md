# 🚀 Configuración de Stripe en PRODUCCIÓN

## 📋 Resumen de cambios

Este documento describe cómo configurar las claves de **PRODUCCIÓN** de Stripe en el backend de Vercel.

**IMPORTANTE**: El frontend ya está actualizado con las claves de producción. Solo falta configurar el backend en Vercel.

---

## ✅ Cambios YA REALIZADOS en el Frontend

Los siguientes archivos ya han sido actualizados con las claves de producción:

### `services/stripe.js`
- ✅ Clave publicable actualizada: `pk_live_51SVcFLFaw8romGYaiRfEKdpLBmzDqQCk8gC6vxfgKb0cwj8FuLyHlzCc0I2B6NElTDyy8eAltkcAitQFy2oEa5Lu00KvkmZ2RY`
- ✅ ID de precio actualizado: `price_1ShUsJFaw8romGYaKSImR29Z`

---

## 🔧 Configuración PENDIENTE en Vercel

Necesitas actualizar las **variables de entorno** en Vercel con las claves de producción.

### Paso 1: Acceder a Vercel Dashboard

1. Ve a: https://vercel.com/dashboard
2. Selecciona el proyecto: `portalestiba-push-backend-one`
3. Click en **Settings** (⚙️)
4. Click en **Environment Variables** en el menú lateral

### Paso 2: Actualizar las variables de entorno

Actualiza o añade las siguientes variables:

#### `STRIPE_SECRET_KEY`
```
sk_live_[TU_CLAVE_SECRETA_AQUI]
```
⚠️ **NUNCA** escribas la clave completa en archivos de código o documentación

#### `STRIPE_WEBHOOK_SECRET`
```
whsec_[TU_WEBHOOK_SECRET_DE_PRODUCCION]
```
⚠️ **IMPORTANTE**: Este valor lo obtienes de Stripe Dashboard > Developers > Webhooks después de crear el webhook de producción (ver Paso 3).

#### Otras variables (verificar que existan):
```
SUPABASE_URL=https://nvjzkggnhqtnlcqynbfb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[tu_service_role_key]
FRONTEND_URL=https://portalestibavlc.netlify.app
```

### Paso 3: Configurar Webhook en Stripe (PRODUCCIÓN)

1. Ve a: https://dashboard.stripe.com/webhooks
2. Asegúrate de estar en **modo LIVE** (no TEST)
3. Click en **Add endpoint**
4. Configuración:
   - **Endpoint URL**: `https://portalestiba-push-backend-one.vercel.app/api/stripe-webhook`
   - **Description**: `Portal Estiba VLC - Production Webhook`
   - **Events to send**: Selecciona:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
5. Click en **Add endpoint**
6. **IMPORTANTE**: Copia el **Signing secret** (empieza con `whsec_...`)
7. Pega ese valor en la variable `STRIPE_WEBHOOK_SECRET` en Vercel (del Paso 2)

### Paso 4: Hacer Redeploy

Después de actualizar las variables de entorno:

1. En Vercel Dashboard, ve a **Deployments**
2. Click en el último deployment
3. Click en el botón **⋯** (tres puntos)
4. Click en **Redeploy**
5. Confirma el redeploy

---

## 📊 Claves de Producción - Referencia Rápida

### Claves de Stripe
```
Clave Publicable (Frontend):
pk_live_51SVcFLFaw8romGYaiRfEKdpLBmzDqQCk8gC6vxfgKb0cwj8FuLyHlzCc0I2B6NElTDyy8eAltkcAitQFy2oEa5Lu00KvkmZ2RY

Clave Secreta (Backend):
[CONFIGURAR EN VERCEL - NO ESCRIBIR AQUÍ]

ID del Producto:
prod_TeoVhr5WSF77F3

ID del Precio (€4.99/mes):
price_1ShUsJFaw8romGYaKSImR29Z
```

---

## ✅ Verificación - Checklist

Marca cuando completes cada paso:

- [ ] Variables de entorno actualizadas en Vercel
- [ ] Webhook de producción configurado en Stripe Dashboard
- [ ] Webhook secret copiado a Vercel (`STRIPE_WEBHOOK_SECRET`)
- [ ] Redeploy realizado en Vercel
- [ ] Verificación de endpoints (ver siguiente sección)

---

## 🧪 Verificación de que todo funciona

### 1. Verificar que el backend está activo

Abre en tu navegador:
```
https://portalestiba-push-backend-one.vercel.app/api/stripe-webhook
```

**Respuesta esperada**:
```json
{"error":"Method not allowed"}
```
✅ Si ves esto, el endpoint está activo (es correcto, solo acepta POST)

### 2. Verificar en Stripe Dashboard

1. Ve a: https://dashboard.stripe.com/webhooks
2. Busca tu webhook: `https://portalestiba-push-backend-one.vercel.app/api/stripe-webhook`
3. Debería mostrar: **✓ Enabled** en verde

### 3. Hacer una suscripción de prueba

⚠️ **IMPORTANTE**: Usa tarjetas de TEST de Stripe para no hacer cargos reales durante las pruebas.

**Tarjetas de test de Stripe**:
```
Tarjeta exitosa:
Número: 4242 4242 4242 4242
Fecha: Cualquier fecha futura (ej: 12/25)
CVC: Cualquier 3 dígitos (ej: 123)
ZIP: Cualquier código postal (ej: 12345)

Tarjeta que falla:
Número: 4000 0000 0000 0002
```

**Pasos para probar**:

1. Abre la PWA: https://portalestibavlc.netlify.app
2. Inicia sesión con tu chapa
3. Ve a **Info Premium**
4. Verifica que veas el mensaje de prueba gratis hasta 2026
5. Click en **Suscribirme a Premium** (si está visible)
6. Usa una tarjeta de TEST
7. Completa el pago

**Verificaciones después del pago**:

- [ ] El pago se completa sin errores
- [ ] Recibes el email de confirmación de Stripe
- [ ] En la app aparece que tienes acceso Premium
- [ ] Puedes acceder al Sueldómetro y Oráculo
- [ ] En Stripe Dashboard > Payments ves el pago registrado
- [ ] En Stripe Dashboard > Webhooks ves los eventos con ✓

---

## 🔍 Debugging - Si algo falla

### El pago no se procesa

1. **Revisa la consola del navegador** (F12):
   - ¿Hay errores de red?
   - ¿Aparece error de Stripe?

2. **Revisa los logs de Vercel**:
   - Ve a: https://vercel.com/[tu-usuario]/portalestiba-push-backend-one/logs
   - Busca errores en `/api/create-checkout-session`

### El webhook no se ejecuta

1. **Revisa Stripe Dashboard > Webhooks**:
   - Click en tu webhook
   - Ve a la pestaña **Events**
   - ¿Aparecen eventos?
   - ¿Están en verde (✓) o rojo (✗)?

2. **Si están en rojo**:
   - Click en el evento fallido
   - Revisa el **Response**
   - Verifica que `STRIPE_WEBHOOK_SECRET` esté correctamente configurado en Vercel

3. **Revisa los logs de Vercel**:
   - Ve a: https://vercel.com/[tu-usuario]/portalestiba-push-backend-one/logs
   - Busca errores en `/api/stripe-webhook`

### El usuario no aparece como Premium

1. **Revisa Supabase**:
   - Ve a: https://supabase.com/dashboard/project/nvjzkggnhqtnlcqynbfb
   - Abre la tabla `usuarios_premium`
   - Busca tu chapa
   - Verifica que:
     - `estado_suscripcion` sea `'active'`
     - `periodo_fin` sea una fecha futura
     - `stripe_customer_id` y `stripe_subscription_id` estén rellenados

2. **Si no aparece**:
   - El webhook probablemente no se ejecutó correctamente
   - Sigue los pasos de "El webhook no se ejecuta"

---

## 📞 Contacto de Soporte

Si encuentras problemas:

1. Revisa primero esta guía de debugging
2. Revisa los logs de Vercel y Stripe Dashboard
3. Verifica que todas las variables de entorno estén correctas
4. Si persiste el problema, contacta con soporte técnico con:
   - Capturas de pantalla del error
   - Logs de Vercel
   - ID de la sesión de Stripe (si lo tienes)

---

**Última actualización**: 2025-12-23
**Modo**: PRODUCCIÓN (Live Keys)
