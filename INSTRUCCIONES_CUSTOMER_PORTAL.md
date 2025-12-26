# 📋 Instrucciones para Activar el Customer Portal de Stripe

## ✅ ¿Qué hemos implementado?

Ahora los usuarios pueden **gestionar su propia suscripción** de forma autónoma sin necesidad de contactarte:
- ✅ Ver facturas y descargarlas
- ✅ Actualizar método de pago
- ✅ **Cancelar la suscripción ellos mismos**
- ✅ Ver historial de pagos

---

## 🚀 Pasos para Activar (IMPORTANTE)

### 1. Subir el nuevo archivo al backend

**Archivo creado:** `BACKEND_FILES_TO_UPLOAD/api/create-portal-session.js`

**Instrucciones:**

```bash
# 1. Ve a la carpeta del backend (si ya lo tienes clonado)
cd portalestiba-push-backend-one

# O clónalo si no lo tienes
git clone https://github.com/TuUsuario/portalestiba-push-backend-one.git
cd portalestiba-push-backend-one

# 2. Copia el nuevo archivo desde BACKEND_FILES_TO_UPLOAD/api/create-portal-session.js
# a la carpeta api/ del backend

# 3. Commit y push
git add api/create-portal-session.js
git commit -m "feat: Add Stripe Customer Portal endpoint"
git push origin main
```

**Vercel hará el deploy automáticamente.**

---

### 2. Configurar el Customer Portal en Stripe Dashboard

**MUY IMPORTANTE:** Debes configurar el Customer Portal en tu cuenta de Stripe, sino el endpoint no funcionará.

#### Pasos:

1. **Ir a Stripe Dashboard**: https://dashboard.stripe.com

2. **Ve a Settings > Customer portal** (en el menú lateral izquierdo)
   - O directamente: https://dashboard.stripe.com/settings/billing/portal

3. **Activar el Customer Portal:**
   - Haz clic en **"Activate test link"** (si estás en test mode)
   - O **"Activate link"** (si estás en live mode)

4. **Configurar las opciones del portal:**

   **A) Products and prices:**
   - ✅ Marca: "Customers can switch plans" (opcional, si quieres que cambien de plan)
   - O déjalo desmarcado si solo quieres que cancelen

   **B) Subscription cancellation:**
   - ✅ **MUY IMPORTANTE:** Marca: "Customers can cancel their subscriptions"
   - Selecciona qué pasa al cancelar:
     - Recomendado: **"Cancel at end of billing period"** (mantienen acceso hasta que expire)
     - O: **"Cancel immediately"** (pierden acceso al instante)

   **C) Update payment methods:**
   - ✅ Marca: "Customers can update their payment methods"

   **D) Invoice history:**
   - ✅ Marca: "Customers can view their invoice history"

5. **Guardar cambios:**
   - Haz clic en **"Save"** al final de la página

---

### 3. Verificar que funciona

1. **Despliega el frontend** con los cambios:
   ```bash
   git add .
   git commit -m "feat: Add Customer Portal integration and updated Premium FAQ"
   git push origin main
   ```

2. **Prueba el flujo completo:**
   - Inicia sesión en la PWA con un usuario que tenga Premium activo
   - Ve a "Info Premium" en el menú lateral
   - Deberías ver un botón **"Abrir Portal de Gestión"**
   - Haz clic en el botón
   - Te redirigirá al Customer Portal de Stripe
   - Ahí podrás:
     - Ver facturas
     - Actualizar método de pago
     - **Cancelar la suscripción**

---

## 📸 Capturas de Referencia (Stripe Dashboard)

### Dónde encontrar Customer Portal Settings:

```
Stripe Dashboard
├── Settings (⚙️ icono de engranaje arriba a la derecha)
    └── Billing
        └── Customer portal
            ├── [x] Allow customers to access the customer portal
            ├── Products and prices
            │   └── [x] Customers can switch plans (opcional)
            ├── Subscription cancellation
            │   └── [x] Customers can cancel their subscriptions ✅ IMPORTANTE
            │       └── ⚫ Cancel at end of billing period (recomendado)
            ├── Update payment methods
            │   └── [x] Customers can update their payment methods
            └── Invoice history
                └── [x] Customers can view their invoice history
```

---

## ⚠️ Importante

### Diferencias entre Test Mode y Live Mode:

Si estás en **Test Mode**:
- Configura el Customer Portal en **Test Mode**
- Los usuarios de prueba podrán gestionar sus suscripciones de prueba

Si estás en **Live Mode** (producción):
- Configura el Customer Portal en **Live Mode**
- Los usuarios reales podrán gestionar sus suscripciones reales

**IMPORTANTE:** Tienes que configurar el Customer Portal en AMBOS modos si vas a usar ambos.

---

## 🔧 Troubleshooting

### Error: "Customer portal is not enabled"

**Solución:**
1. Ve a Stripe Dashboard > Settings > Customer portal
2. Asegúrate de que está activado (botón azul "Activate link")
3. Guarda los cambios

### Error: "No se encontró información de cliente en Stripe"

**Causa:** El usuario no tiene `stripe_customer_id` en la base de datos.

**Solución:**
- Esto solo pasa si el usuario nunca se ha suscrito
- Asegúrate de que el usuario tenga una suscripción activa primero

### El botón no aparece en la PWA

**Verificar:**
1. ¿El usuario tiene Premium activo? El botón solo se muestra para usuarios con suscripción
2. ¿Estás en la página "Info Premium"? El botón solo aparece en esa página
3. Abre la consola (F12) y busca mensajes como:
   - "✅ Usuario Premium detectado, mostrando botón de gestión"
   - "📋 Usuario sin Premium, ocultando botón de gestión"

---

## 📊 Resumen de lo implementado

### Frontend (index.html):
- ✅ Botón "Abrir Portal de Gestión" (solo visible para usuarios Premium)
- ✅ Script que detecta si el usuario tiene Premium y muestra el botón
- ✅ FAQ actualizado con instrucciones claras sobre cómo cancelar

### Frontend (services/stripe.js):
- ✅ Función `redirectToCustomerPortal()` que crea la sesión del portal

### Backend (api/create-portal-session.js):
- ✅ Endpoint que crea sesiones del Stripe Customer Portal
- ✅ Busca el `stripe_customer_id` en Supabase
- ✅ Redirige al usuario al portal de Stripe

---

## ✅ Checklist Final

Antes de considerar esto completado, verifica:

- [ ] Archivo `create-portal-session.js` subido al backend de Vercel
- [ ] Deploy del backend completado en Vercel
- [ ] Customer Portal activado en Stripe Dashboard
- [ ] Opciones de cancelación configuradas en Stripe
- [ ] Frontend desplegado con los cambios
- [ ] Probado con un usuario Premium (el botón aparece)
- [ ] Probado el flujo completo (clic en botón → se abre portal de Stripe)
- [ ] Verificado que se puede cancelar desde el portal

---

## 🎉 Beneficios

Con esta implementación:

1. **Autonomía del usuario**: Los usuarios pueden gestionar su suscripción sin contactarte
2. **Menos soporte**: No necesitas cancelar manualmente cada suscripción
3. **Transparencia**: Los usuarios ven todas sus facturas y pagos
4. **Profesionalismo**: Portal oficial de Stripe, seguro y confiable
5. **Facilidad de uso**: Todo desde la misma PWA, sin crear cuentas adicionales

---

**Documentación creada el 22/12/2024**
