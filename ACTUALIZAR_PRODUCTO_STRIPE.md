# 🛠️ Actualizar Descripción del Producto en Stripe

## Problema Actual

La descripción del producto en Stripe dice:
> "Acceso completo a Sueldómetro, Oráculo y Chatbot IA"

Pero **falta mencionar el Buscador Histórico**.

---

## ✅ Solución

### Opción 1: Actualizar desde Stripe Dashboard (Recomendado)

1. **Ve a Stripe Dashboard**: https://dashboard.stripe.com

2. **Ve a Products (Productos)**:
   - En el menú lateral: **Product catalog** > **Products**
   - O directamente: https://dashboard.stripe.com/products

3. **Busca tu producto**:
   - Debería llamarse algo como: "Portal Estiba VLC Premium" o similar
   - Haz clic en el producto

4. **Editar la descripción**:
   - Haz clic en el botón de **"..."** (3 puntos) o **"Edit"**
   - Busca el campo **"Description"**
   - Cámbialo a:
     ```
     Acceso completo a Sueldómetro, Oráculo, Chatbot IA y Buscador Histórico
     ```

5. **Guardar**:
   - Haz clic en **"Save product"** o **"Update product"**

---

### Opción 2: Crear un Nuevo Producto (Si quieres empezar de cero)

Si prefieres crear un producto nuevo con toda la información correcta:

1. **Ve a Products** > **Add product**

2. **Rellena los campos**:
   - **Name**: Portal Estiba VLC Premium
   - **Description**: Acceso completo a Sueldómetro, Oráculo, Chatbot IA y Buscador Histórico
   - **Price**: 4.99 EUR
   - **Billing period**: Monthly (Mensual)
   - **Recurring**: ✅ (sí)

3. **Guardar y copiar el Price ID**:
   - Copia el nuevo **Price ID** (empieza con `price_...`)

4. **Actualizar el Price ID en el código**:
   - Ve a `services/stripe.js` línea 48
   - Reemplaza el `priceId` antiguo por el nuevo

---

## 📋 Verificar el Estado de la Suscripción

Sobre el problema de "incomplete" de la chapa 816:

1. **Ve a Stripe Dashboard**: https://dashboard.stripe.com

2. **Ve a Subscriptions**:
   - En el menú lateral: **Payments** > **Subscriptions**
   - O busca directamente: `sub_1ShDDJFApc6nOGEvAMlwAzcA`

3. **Verificar el estado**:
   - ¿Qué estado aparece en Stripe?
     - Si dice **"Active"** → El problema está solo en Supabase (ejecuta el SQL de corrección)
     - Si dice **"Incomplete"** → El pago no se procesó correctamente

4. **Si el estado es "Incomplete" en Stripe**:
   - Mira la sección "Events" de la suscripción
   - Busca si hay algún error de pago
   - Posibles causas:
     - Tarjeta rechazada
     - Autenticación 3D Secure pendiente
     - Pago pendiente de confirmación

5. **Soluciones si está "Incomplete"**:
   - **Opción A**: Cancela esa suscripción y crea una nueva
   - **Opción B**: Intenta completar el pago desde Stripe Dashboard
   - **Opción C**: Si es de prueba, usa la tarjeta de prueba: `4242 4242 4242 4242`

---

## 🔍 Verificar Webhooks

También verifica que los webhooks de Stripe estén configurados:

1. **Ve a Developers** > **Webhooks**:
   - https://dashboard.stripe.com/webhooks

2. **Verifica que existe el webhook**:
   - URL: `https://portalestiba-push-backend-one.vercel.app/api/stripe-webhook`
   - Estado: **Enabled** (Habilitado)

3. **Eventos que debe escuchar**:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

4. **Ver eventos recientes**:
   - Haz clic en el webhook
   - Ve a la pestaña "Events"
   - Busca eventos de hoy relacionados con `sub_1ShDDJFApc6nOGEvAMlwAzcA`
   - ¿Hay algún error (❌ Failed)?
     - Si hay errores, haz clic en ellos para ver los detalles
     - Los errores comunes son:
       - Webhook endpoint no responde (verifica que el backend esté activo)
       - Error 500 del backend (hay un bug en el código)

---

## 🎯 Resumen de Pasos

### Para corregir TODO:

1. ✅ **Ejecutar el SQL** en Supabase (archivo `CORREGIR_WEBHOOK_Y_FEATURES.sql`):
   - Esto actualiza la función RPC para incluir todas las features
   - Corrige la chapa 816 cambiando estado a "active" y añadiendo buscador_historico

2. ✅ **Actualizar descripción del producto en Stripe**:
   - Añadir "Buscador Histórico" a la descripción

3. ✅ **Verificar estado de la suscripción en Stripe**:
   - Si está "incomplete", investigar por qué el pago no se completó

4. ✅ **Probar de nuevo**:
   - Inicia sesión con chapa 816
   - Ve a "Sueldómetro" o "Oráculo"
   - Debería funcionar sin pedir Premium

---

## 📞 Si sigue sin funcionar

Si después de hacer todo esto sigue sin funcionar:

1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console"
3. Busca mensajes que contengan:
   - "Premium"
   - "acceso"
   - "feature"
4. Copia esos mensajes y revísalos

O ejecuta esto en la consola:

```javascript
// Ver si tiene acceso
const chapa = localStorage.getItem('currentChapa');
console.log('Chapa actual:', chapa);

// Importar la función de verificación
import('./services/premium.js').then(module => {
  module.tienePremium(chapa).then(result => {
    console.log('¿Tiene Premium?', result);
  });

  module.tieneAccesoFeature(chapa, 'sueldometro').then(result => {
    console.log('¿Tiene acceso a Sueldómetro?', result);
  });
});
```

---

**Última actualización:** 22/12/2024
