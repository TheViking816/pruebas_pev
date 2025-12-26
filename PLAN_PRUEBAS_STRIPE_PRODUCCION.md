# 🧪 Plan de Pruebas - Stripe en Producción

## 📋 Objetivo

Verificar que el sistema de suscripciones Premium funciona correctamente con las claves de **PRODUCCIÓN** de Stripe.

---

## ⚠️ IMPORTANTE - Tarjetas de Test

**NO uses tarjetas reales durante estas pruebas**. Stripe permite usar tarjetas de test incluso en modo producción durante la fase de pruebas.

### Tarjetas de Test de Stripe

#### ✅ Pago Exitoso
```
Número: 4242 4242 4242 4242
Fecha: 12/25 (cualquier fecha futura)
CVC: 123 (cualquier 3 dígitos)
ZIP: 12345 (cualquier código postal)
```

#### ❌ Pago Rechazado
```
Número: 4000 0000 0000 0002
Fecha: 12/25
CVC: 123
ZIP: 12345
```

#### ⏳ Requiere Autenticación 3D Secure
```
Número: 4000 0027 6000 3184
Fecha: 12/25
CVC: 123
ZIP: 12345
```

---

## 🔬 Pruebas a Realizar

### PRUEBA 1: Verificar Configuración Básica ⚙️

**Objetivo**: Confirmar que el backend está configurado correctamente.

**Pasos**:
1. Abre el navegador
2. Ve a: `https://portalestiba-push-backend-one.vercel.app/api/stripe-webhook`

**Resultado Esperado**:
```json
{"error":"Method not allowed"}
```

**Estado**: [ ] ✅ Pasó  [ ] ❌ Falló

**Notas**:
```
_________________________________________________________________
```

---

### PRUEBA 2: Suscripción Exitosa 💳

**Objetivo**: Verificar que un usuario puede suscribirse correctamente.

**Pasos**:
1. Abre la PWA: https://portalestibavlc.netlify.app
2. Inicia sesión con una chapa de prueba (ej: 123)
3. Ve a **Info Premium** en el menú lateral
4. Click en **Suscribirme a Premium** (si visible)
5. Usa la tarjeta de test exitosa: `4242 4242 4242 4242`
6. Completa el formulario de Stripe Checkout
7. Click en **Subscribe**

**Resultados Esperados**:
- [ ] El checkout se completa sin errores
- [ ] Redirección a la app con `?payment=success`
- [ ] Mensaje de confirmación visible en la app
- [ ] Badge "⭐ PREMIUM" aparece en las funciones premium

**Verificaciones Adicionales**:

1. **En la PWA**:
   - [ ] Puedes acceder al **Sueldómetro**
   - [ ] Puedes acceder al **Oráculo**
   - [ ] Puedes acceder al **Chatbot IA**
   - [ ] Aparece botón "Abrir Portal de Gestión" activo

2. **En Stripe Dashboard**:
   - Ve a: https://dashboard.stripe.com/test/payments
   - [ ] Aparece el pago de €4.99
   - [ ] Estado: **Succeeded** (verde)
   - [ ] Metadata incluye tu chapa

3. **En Stripe Webhooks**:
   - Ve a: https://dashboard.stripe.com/test/webhooks
   - Click en tu webhook
   - [ ] Evento `checkout.session.completed` con ✓
   - [ ] Evento `customer.subscription.created` con ✓

4. **En Supabase**:
   - Ve a: https://supabase.com/dashboard/project/nvjzkggnhqtnlcqynbfb/editor
   - Abre tabla `usuarios_premium`
   - Busca tu chapa
   - [ ] `estado_suscripcion` = `'active'`
   - [ ] `periodo_fin` es una fecha futura (+1 mes)
   - [ ] `stripe_customer_id` rellenado
   - [ ] `stripe_subscription_id` rellenado

**Estado**: [ ] ✅ Pasó  [ ] ❌ Falló

**Notas**:
```
_________________________________________________________________
```

---

### PRUEBA 3: Pago Rechazado ❌

**Objetivo**: Verificar que el sistema maneja correctamente pagos rechazados.

**Pasos**:
1. Usa otra chapa de prueba (ej: 456)
2. Intenta suscribirte
3. Usa la tarjeta que falla: `4000 0000 0000 0002`
4. Intenta completar el pago

**Resultados Esperados**:
- [ ] Stripe muestra error: "Your card was declined"
- [ ] NO se crea suscripción
- [ ] NO aparece registro en Supabase
- [ ] El usuario sigue sin acceso Premium

**Estado**: [ ] ✅ Pasó  [ ] ❌ Falló

**Notas**:
```
_________________________________________________________________
```

---

### PRUEBA 4: Portal de Gestión 🏢

**Objetivo**: Verificar que los usuarios pueden gestionar su suscripción.

**Pasos**:
1. Inicia sesión con la chapa que se suscribió en PRUEBA 2
2. Ve a **Info Premium**
3. Click en **Abrir Portal de Gestión**

**Resultados Esperados**:
- [ ] Redirige al Stripe Customer Portal
- [ ] Muestra suscripción activa
- [ ] Muestra método de pago
- [ ] Permite cancelar suscripción
- [ ] Permite descargar facturas

**Verificaciones Adicionales**:
- [ ] Click en "Cancel subscription"
- [ ] Confirma cancelación
- [ ] Mensaje: "Your subscription will end on [fecha]"
- [ ] En Supabase: `estado_suscripcion` cambia a `'canceled'`
- [ ] El usuario MANTIENE acceso hasta `periodo_fin`

**Estado**: [ ] ✅ Pasó  [ ] ❌ Falló

**Notas**:
```
_________________________________________________________________
```

---

### PRUEBA 5: Renovación Automática 🔄

**Objetivo**: Verificar que las suscripciones se renuevan automáticamente.

⚠️ **NOTA**: Esta prueba requiere esperar o usar la API de Stripe para simular renovación.

**Opción A - Simular con Stripe CLI** (Recomendado):

1. Instala Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Simula evento de renovación:
```bash
stripe trigger invoice.payment_succeeded
```

**Resultados Esperados**:
- [ ] Webhook recibe `invoice.payment_succeeded`
- [ ] En Supabase: `periodo_fin` se actualiza (+1 mes)
- [ ] Usuario mantiene acceso Premium

**Opción B - Esperar renovación real**:

1. Crear suscripción con tarjeta de test
2. Esperar 1 mes (o configurar intervalo de prueba en Stripe)
3. Verificar renovación automática

**Estado**: [ ] ✅ Pasó  [ ] ❌ Falló  [ ] ⏭️ Omitido

**Notas**:
```
_________________________________________________________________
```

---

### PRUEBA 6: Pago Fallido (Tarjeta Vencida) ⚠️

**Objetivo**: Verificar el comportamiento cuando falla un pago de renovación.

**Pasos**:
1. Usar tarjeta de test que falla renovaciones
2. O simular con Stripe CLI:
```bash
stripe trigger invoice.payment_failed
```

**Resultados Esperados**:
- [ ] Webhook recibe `invoice.payment_failed`
- [ ] En Supabase: `estado_suscripcion` = `'past_due'`
- [ ] Usuario pierde acceso Premium inmediatamente
- [ ] Funciones premium muestran bloqueo

**Estado**: [ ] ✅ Pasó  [ ] ❌ Falló  [ ] ⏭️ Omitido

**Notas**:
```
_________________________________________________________________
```

---

### PRUEBA 7: Funciones Premium Bloqueadas 🔒

**Objetivo**: Verificar que usuarios sin Premium no pueden acceder.

**Pasos**:
1. Usa una chapa que NO tiene Premium
2. Intenta acceder a:
   - Sueldómetro
   - Oráculo
   - Chatbot IA
   - Buscador histórico

**Resultados Esperados**:
- [ ] Muestra mensaje de bloqueo en cada función
- [ ] Botón "Suscribirme" visible
- [ ] Click redirige a Stripe Checkout

**Estado**: [ ] ✅ Pasó  [ ] ❌ Falló

**Notas**:
```
_________________________________________________________________
```

---

### PRUEBA 8: Período de Prueba Gratis 🎁

**Objetivo**: Verificar que todos los usuarios tienen acceso gratis hasta 1 enero 2026.

**Pasos**:
1. Inicia sesión con cualquier chapa (sin suscripción)
2. Ve a funciones Premium:
   - Sueldómetro
   - Oráculo
   - Chatbot

**Resultados Esperados**:
- [ ] **TODAS** las funciones Premium son accesibles
- [ ] NO pide suscripción
- [ ] Banner en "Info Premium" indica prueba gratis hasta 2026

**Verificación en código**:
- Revisar `chatbot/premium-check.js`
- Verificar que `FREE_TRIAL_END_DATE` es `2026-01-01`

**Estado**: [ ] ✅ Pasó  [ ] ❌ Falló

**Notas**:
```
_________________________________________________________________
```

---

## 📊 Resumen de Pruebas

| # | Prueba | Estado | Notas |
|---|--------|--------|-------|
| 1 | Configuración Básica | [ ] | |
| 2 | Suscripción Exitosa | [ ] | |
| 3 | Pago Rechazado | [ ] | |
| 4 | Portal de Gestión | [ ] | |
| 5 | Renovación Automática | [ ] | |
| 6 | Pago Fallido | [ ] | |
| 7 | Funciones Bloqueadas | [ ] | |
| 8 | Período Gratis | [ ] | |

**Total**: __/8 pasadas

---

## 🐛 Registro de Problemas Encontrados

### Problema 1
**Descripción**:
```
_________________________________________________________________
```

**Pasos para reproducir**:
```
_________________________________________________________________
```

**Solución aplicada**:
```
_________________________________________________________________
```

---

### Problema 2
**Descripción**:
```
_________________________________________________________________
```

**Pasos para reproducir**:
```
_________________________________________________________________
```

**Solución aplicada**:
```
_________________________________________________________________
```

---

## ✅ Sign-Off

**Pruebas completadas por**: _____________________

**Fecha**: _____________________

**Aprobado para producción**: [ ] SÍ  [ ] NO

**Firma**: _____________________

---

**Última actualización**: 2025-12-23
