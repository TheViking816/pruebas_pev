# 🧪 Guía de Testing - Modo Real de Stripe

## ⚠️ Importante

Tu sistema está configurado en **MODO REAL** (Live Mode) de Stripe. NO puedes usar tarjetas de prueba.

---

## 💳 Opciones para Testing

### Opción 1: Crear Suscripción Real y Cancelarla

**Pasos:**

1. Usa una tarjeta REAL tuya
2. Completa el pago de €4.99
3. Inmediatamente después, cancela la suscripción:
   - Ve a Stripe Dashboard
   - Customers > Busca tu chapa
   - Subscriptions > Cancel

**Ventaja**: Pruebas el flujo completo
**Desventaja**: Pagas €4.99 (puedes reembolsarte en Stripe)

### Opción 2: Cambiar a Modo Test (Recomendado para Testing)

Si quieres hacer testing sin pagar, necesitas:

1. **Crear productos en Stripe Test Mode**
2. **Cambiar claves a modo test**
3. **Usar tarjetas de prueba**

#### Pasos Detallados:

**A) Crear Price ID en Test Mode:**

1. Ve a Stripe Dashboard
2. Cambia de **Live** a **Test** (toggle arriba a la derecha)
3. Products > Add Product
   - Name: Portal Estiba VLC Premium (TEST)
   - Price: €4.99 EUR / month
4. Copia el **Price ID** de test (empieza con `price_test_...`)

**B) Obtener claves de Test:**

1. En Stripe Dashboard (modo TEST)
2. Developers > API Keys
3. Copia:
   - Publishable key: `pk_test_...`
   - Secret key: `sk_test_...`

**C) Actualizar Código:**

```javascript
// services/stripe.js
const publishableKey = 'pk_test_TU_KEY_TEST';

// services/stripe.js línea ~48
priceId: 'price_test_TU_PRICE_ID_TEST'
```

**D) Actualizar Variables Backend:**

En Vercel > portalestiba-push-backend-one > Environment Variables:

```
STRIPE_SECRET_KEY = sk_test_TU_SECRET_TEST
STRIPE_PRICE_ID = price_test_TU_PRICE_TEST
```

**E) Usar Tarjeta de Prueba:**

```
Tarjeta: 4242 4242 4242 4242
Fecha: 12/28 (cualquier futura)
CVC: 123 (cualquiera)
```

### Opción 3: Usar Link Test (Sin implementar)

Stripe tiene un modo "Link" que permite testing sin tarjetas, pero requiere implementación adicional.

---

## 🎯 Modo Recomendado para Desarrollo

**Para desarrollo**: Usa modo TEST
**Para producción**: Vuelve a modo LIVE

---

## ✅ Verificar Estado Actual

Actualmente estás en **MODO LIVE**:
- ✅ STRIPE_SECRET_KEY empieza con `sk_live_`
- ✅ STRIPE_PUBLISHABLE_KEY empieza con `pk_live_`
- ✅ STRIPE_PRICE_ID: `price_1SZJz1ChRaIBXTncSV0nMALS`

---

## 🔄 Cómo Cambiar entre Modos

### De LIVE a TEST:

1. Cambiar claves en `services/stripe.js`
2. Cambiar variables en Vercel backend
3. Crear productos en Stripe Test Mode

### De TEST a LIVE:

1. Volver a poner claves live
2. Volver a poner variables live
3. Usar productos de Stripe Live Mode

---

## 💡 Recomendación Final

Para ahorrarte el pago de €4.99:

1. Cambia temporalmente a modo TEST
2. Haz todas las pruebas que necesites
3. Cuando estés seguro que funciona todo
4. Vuelve a modo LIVE para producción

**NO** es necesario probar en modo LIVE si el testing en TEST funciona correctamente.

---

¿Quieres que te configure el modo TEST ahora?
