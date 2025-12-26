# ✅ Migración a Stripe PRODUCCIÓN - Resumen Ejecutivo

## 🎯 Estado Actual

### ✅ COMPLETADO (Frontend)
- Clave publicable actualizada a producción: `pk_live_51SV...`
- ID de precio actualizado: `price_1ShUsJFaw8romGYaKSImR29Z` (€4.99/mes)
- Archivo actualizado: `services/stripe.js`

### ⏳ PENDIENTE (Backend en Vercel)
- Actualizar variables de entorno en Vercel
- Configurar webhook en Stripe Dashboard
- Hacer redeploy

---

## 🚀 Pasos Siguientes (Hazlo TÚ)

### 1️⃣ Configurar Vercel (5 minutos)

Ve a: https://vercel.com/dashboard → `portalestiba-push-backend-one` → Settings → Environment Variables

**Añade/actualiza estas variables**:

```env
STRIPE_SECRET_KEY=sk_live_[TU_CLAVE_GENERADA_EN_STRIPE]

STRIPE_WEBHOOK_SECRET=[OBTENDRÁS ESTO EN EL PASO 2]
```
⚠️ Usa la nueva clave que generaste después de la rotación

### 2️⃣ Configurar Webhook en Stripe (3 minutos)

Ve a: https://dashboard.stripe.com/webhooks

1. Asegúrate de estar en modo **LIVE** (no TEST)
2. Click **Add endpoint**
3. URL: `https://portalestiba-push-backend-one.vercel.app/api/stripe-webhook`
4. Eventos a escuchar:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Guardar
6. **COPIAR** el `Signing secret` (empieza con `whsec_...`)
7. Pegar ese valor en Vercel como `STRIPE_WEBHOOK_SECRET` (del paso 1)

### 3️⃣ Redeploy (1 minuto)

En Vercel:
1. Deployments → Último deployment → ⋯ (tres puntos) → Redeploy

### 4️⃣ Probar (10 minutos)

Sigue el plan de pruebas: `PLAN_PRUEBAS_STRIPE_PRODUCCION.md`

**Prueba rápida**:
1. Abre: https://portalestibavlc.netlify.app
2. Login con tu chapa
3. Info Premium → Suscribirme
4. Tarjeta: `4242 4242 4242 4242` / `12/25` / `123`
5. Verificar que funciona ✅

---

## 📚 Documentación Completa

- **Configuración detallada**: `CONFIGURAR_STRIPE_PRODUCCION.md`
- **Plan de pruebas**: `PLAN_PRUEBAS_STRIPE_PRODUCCION.md`

---

## 🆘 ¿Algo sale mal?

1. Revisa Vercel Logs: https://vercel.com/[tu-usuario]/portalestiba-push-backend-one/logs
2. Revisa Stripe Webhooks: https://dashboard.stripe.com/webhooks
3. Consulta `CONFIGURAR_STRIPE_PRODUCCION.md` sección "Debugging"

---

## 🔑 Claves de Producción (Referencia)

```
Frontend (YA configurado):
  Publicable: pk_live_51SVcFLFaw8romGYaiRfEKdpLBmzDqQCk8gC6vxfgKb0cwj8FuLyHlzCc0I2B6NElTDyy8eAltkcAitQFy2oEa5Lu00KvkmZ2RY
  Precio: price_1ShUsJFaw8romGYaKSImR29Z

Backend (TÚ configuras en Vercel):
  Secreta: sk_live_[CONFIGURAR_EN_VERCEL]
  Webhook: [obtienes de Stripe Dashboard]

Producto:
  ID: prod_TeoVhr5WSF77F3
```

---

**Tiempo total estimado**: ~20 minutos

**Creado**: 2025-12-23
