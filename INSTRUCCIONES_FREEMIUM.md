# 📋 Instrucciones de Configuración - Sistema Freemium con Stripe

Este documento contiene todas las instrucciones para configurar y poner en funcionamiento el sistema freemium del Portal Estiba VLC.

---

## 🎯 Resumen del Sistema Implementado

Se ha integrado exitosamente el sistema freemium de la rama `v2-freemium` con todas las mejoras de la rama `test/scraper-y-notificaciones`. El sistema incluye:

### ✅ Funcionalidades Implementadas

1. **Sistema de Suscripciones con Stripe**
   - Integración completa con Stripe para pagos recurrentes
   - Precio: €9.99/mes
   - Checkout y gestión de suscripciones

2. **Bloqueo de Funcionalidades Premium**
   - 💰 **Sueldómetro**: Cálculo detallado de salarios por quincena
   - 🔮 **El Oráculo**: Predicción de probabilidades de trabajo
   - 🤖 **Chatbot IA**: Asistente inteligente con OpenAI

3. **Período de Gracia**
   - Todos los usuarios tienen acceso premium GRATUITO hasta el **1 de enero de 2026**
   - Después de esa fecha, solo usuarios con suscripción activa tendrán acceso

4. **Chatbot con OpenAI**
   - Motor de IA mejorado que puede usar OpenAI GPT-4
   - Sistema de respuestas más naturales y contextuales
   - Interfaz de configuración para API key

---

## 📦 Archivos Nuevos Añadidos

### Componentes y Servicios
```
components/
  └── FeatureLock.js         # Componente de bloqueo de features premium

services/
  ├── premium.js             # Servicio de verificación de acceso premium
  └── stripe.js              # Integración con Stripe checkout

chatbot/                     # Chatbot completo con IA
  ├── index.html
  ├── chat-app.js
  ├── ai-engine.js          # Motor IA con soporte OpenAI
  ├── pwa-data-bridge.js
  ├── voice-handler.js
  ├── supabase.js
  ├── chat-styles.css
  ├── service-worker.js
  └── manifest.json
```

### Base de Datos
```
supabase-premium-schema.sql  # Script SQL con tablas y funciones premium
```

---

## 🔧 Pasos de Configuración

### 1. Configurar Base de Datos (Supabase)

#### a) Ejecutar el Script SQL

1. Abre tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **SQL Editor**
3. Copia y pega el contenido de `supabase-premium-schema.sql`
4. Ejecuta el script completo

Esto creará:
- ✅ Tabla `usuarios_premium`
- ✅ Funciones RPC: `tiene_acceso_premium()` y `tiene_acceso_feature()`
- ✅ Función para actualizar suscripciones: `actualizar_suscripcion_desde_webhook()`
- ✅ Políticas de seguridad (RLS)
- ✅ Datos iniciales: todos los usuarios con premium gratuito hasta 01/01/2026

#### b) Verificar Creación

Ejecuta en SQL Editor:
```sql
-- Ver usuarios con premium
SELECT * FROM public.usuarios_premium LIMIT 10;

-- Ver resumen
SELECT * FROM public.v_resumen_premium;
```

---

### 2. Configurar Stripe

#### a) Obtener Claves de API

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com)
2. Crea una cuenta o inicia sesión
3. En **Developers > API keys**, copia:
   - **Publishable key** (empieza con `pk_test_...`)
   - **Secret key** (empieza con `sk_test_...`)

#### b) Crear Producto y Precio

1. En Stripe Dashboard, ve a **Products**
2. Clic en **Add product**
3. Configura:
   - **Name**: Portal Estiba VLC Premium
   - **Description**: Acceso completo a Sueldómetro, Oráculo y Chatbot IA
   - **Pricing**: €9.99 EUR / month (recurring)
4. Guarda y copia el **Price ID** (empieza con `price_...`)

#### c) Actualizar Claves en el Código

**Archivo: `services/stripe.js`**

Reemplaza la clave en línea ~12:
```javascript
const publishableKey = 'TU_STRIPE_PUBLISHABLE_KEY_AQUI';
```

**Archivo: `services/stripe.js`**

Reemplaza el Price ID en línea ~60:
```javascript
priceId: 'TU_PRICE_ID_AQUI'
```

---

### 3. Configurar Backend para Webhooks (IMPORTANTE)

El sistema necesita un backend para:
- Crear sesiones de Stripe Checkout
- Procesar webhooks de Stripe
- Actualizar la base de datos cuando se completen pagos

**Opciones:**

#### Opción A: Usar Backend Existente (Recomendado)

Si ya tienes un backend en Vercel/Render:
1. Actualiza la URL en `services/stripe.js` línea ~58:
```javascript
const BACKEND_URL = 'https://TU-BACKEND.vercel.app';
```

#### Opción B: Crear Nuevo Backend

**Necesitarás crear:**
1. Endpoint: `POST /api/create-checkout-session`
   - Crea sesión de Stripe con el Price ID
   - Devuelve el `sessionId`

2. Endpoint: `POST /api/stripe-webhook`
   - Recibe eventos de Stripe
   - Verifica signature
   - Actualiza `usuarios_premium` cuando hay nuevo pago

**Ejemplo simplificado (Node.js/Express):**

```javascript
// create-checkout-session.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/create-checkout-session', async (req, res) => {
  const { chapa, priceId } = req.body;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{
      price: priceId,
      quantity: 1,
    }],
    success_url: `${process.env.FRONTEND_URL}?payment=success`,
    cancel_url: `${process.env.FRONTEND_URL}?payment=cancel`,
    client_reference_id: chapa,
    metadata: { chapa }
  });

  res.json({ sessionId: session.id });
});
```

---

### 4. Configurar Chatbot con OpenAI (Opcional pero Recomendado)

El chatbot puede funcionar en 3 modos:
1. **LOCAL** (por defecto): Pattern matching sin API
2. **GROQ**: API gratuita (requiere conexión)
3. **OPENAI**: GPT-4 (requiere API key de pago) ⭐ **RECOMENDADO**

#### a) Obtener API Key de OpenAI

1. Ve a [platform.openai.com](https://platform.openai.com)
2. Crea cuenta y añade método de pago
3. Ve a **API Keys** y crea una nueva key
4. Copia la key (empieza con `sk-...`)

#### b) Configurar en el Chatbot

**Los usuarios pueden configurarlo desde la interfaz:**

1. Abre el chatbot: `https://tu-dominio.com/chatbot/`
2. Clic en el icono de configuración (⚙️)
3. Selecciona **Modo OpenAI**
4. Pega la API Key
5. Guarda

**O hardcodear en el código:**

Archivo: `chatbot/ai-engine.js` línea ~13:
```javascript
this.mode = 'openai'; // Cambiar de 'local' a 'openai'
this.apiKey = 'TU_OPENAI_API_KEY'; // Añadir key
```

---

### 5. Configurar Variables de Entorno (Backend)

Si usas Vercel/Render, configura estas variables:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...

# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Frontend
FRONTEND_URL=https://tu-dominio.com
```

---

### 6. Configurar Webhooks de Stripe

Para que los pagos actualicen automáticamente la base de datos:

#### a) Endpoint de Webhook

Configura tu endpoint: `https://tu-backend.vercel.app/api/stripe-webhook`

#### b) Eventos a Escuchar

En Stripe Dashboard > **Developers > Webhooks**, añade estos eventos:
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

#### c) Webhook Signature

Copia el **Signing secret** (empieza con `whsec_...`) y añádelo a tus variables de entorno como `STRIPE_WEBHOOK_SECRET`.

---

### 7. Desplegar

#### a) Subir Código

```bash
# Añadir archivos al staging
git add .

# Crear commit
git commit -m "feat: Integrar sistema freemium con Stripe

- Añadir bloqueo de features premium (Sueldómetro, Oráculo, Chatbot)
- Integrar Stripe para suscripciones mensuales
- Configurar período de gracia hasta 01/01/2026
- Integrar chatbot con soporte OpenAI API
- Crear esquema de base de datos premium completo

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Pushear a GitHub
git push origin feature/freemium-merge
```

#### b) Crear Pull Request

1. Ve a tu repositorio en GitHub
2. Verás un mensaje para crear PR desde `feature/freemium-merge`
3. Clic en **Compare & pull request**
4. Revisa cambios y crea el PR

#### c) Mergear cuando Estés Listo

Una vez revisado, mergea el PR a tu rama principal.

---

## 🎨 Personalización

### Cambiar Precio de Suscripción

1. En Stripe Dashboard, crea un nuevo precio
2. Actualiza el `priceId` en `services/stripe.js`
3. Actualiza texto en `components/FeatureLock.js` línea ~44:
```javascript
Desbloquear por €TU_PRECIO/mes
```

### Cambiar Fecha Fin de Período de Gracia

Archivo: `supabase-premium-schema.sql` línea ~151:
```sql
'2026-01-01 00:00:00+00'::TIMESTAMP WITH TIME ZONE AS periodo_fin,
```

### Añadir/Quitar Features Premium

**En base de datos:**
```sql
UPDATE public.usuarios_premium
SET features_disponibles = ARRAY['sueldometro', 'oraculo', 'chatbot_ia', 'TU_NUEVO_FEATURE'];
```

**En código (bloquear nuevo feature):**
```javascript
// En app.js, función loadTuNuevoFeature()
if (window.FeatureLock) {
  const featureLock = new window.FeatureLock('tu_nuevo_feature');
  const isBloqueado = await featureLock.bloquear('#page-tu-feature .container');
  if (isBloqueado) return;
}
```

---

## 🧪 Testing

### Probar Localmente

1. **Modo Test de Stripe:**
   - Usa las claves de test (`pk_test_...` y `sk_test_...`)
   - Tarjeta de prueba: `4242 4242 4242 4242`
   - Cualquier fecha futura y CVC

2. **Verificar Bloqueo:**
   - Crea usuario sin premium (o elimina de `usuarios_premium`)
   - Intenta acceder a Sueldómetro/Oráculo
   - Deberías ver el overlay de bloqueo

3. **Probar Chatbot:**
   - Abre `/chatbot/`
   - Configura OpenAI API key en settings
   - Haz preguntas para verificar respuestas

### Verificar en Producción

1. **Después del 01/01/2026:**
   - Los usuarios sin suscripción NO podrán acceder a features premium
   - Los usuarios con suscripción activa SÍ tendrán acceso

2. **Monitorear Webhooks:**
   - En Stripe Dashboard > **Developers > Webhooks**
   - Ver eventos recibidos y respuestas

---

## 📊 Monitoreo y Administración

### Ver Estadísticas de Premium

```sql
-- Resumen general
SELECT * FROM public.v_resumen_premium;

-- Usuarios con premium activo
SELECT chapa, estado, periodo_fin
FROM public.usuarios_premium
WHERE estado = 'active'
  AND (periodo_fin IS NULL OR periodo_fin > NOW());

-- Próximos a expirar (últimos 7 días)
SELECT chapa, periodo_fin
FROM public.usuarios_premium
WHERE periodo_fin BETWEEN NOW() AND NOW() + INTERVAL '7 days'
ORDER BY periodo_fin;
```

### Dar Premium Manual

```sql
-- Dar premium gratis a un usuario específico por 1 mes
INSERT INTO public.usuarios_premium (
  chapa, estado, periodo_inicio, periodo_fin, features_disponibles
) VALUES (
  '12345',
  'trialing',
  NOW(),
  NOW() + INTERVAL '1 month',
  ARRAY['sueldometro', 'oraculo', 'chatbot_ia']
)
ON CONFLICT (chapa) DO UPDATE SET
  estado = 'trialing',
  periodo_fin = NOW() + INTERVAL '1 month';
```

### Cancelar Suscripción Manual

```sql
UPDATE public.usuarios_premium
SET
  estado = 'canceled',
  cancelado_at = NOW()
WHERE chapa = '12345';
```

---

## 🚨 Troubleshooting

### Error: "Supabase no está inicializado"

**Solución:** Verifica que `supabase.js` se cargue antes que `services/premium.js` en `index.html`.

### Error: "Stripe SDK no disponible"

**Solución:** Verifica que el script de Stripe esté en `index.html`:
```html
<script src="https://js.stripe.com/v3/"></script>
```

### Features no se bloquean

**Solución:**
1. Verifica que `FeatureLock.js` se importe como módulo
2. Comprueba que el usuario NO esté en `usuarios_premium` o esté expirado
3. Revisa la consola del navegador para errores

### Chatbot no responde bien

**Solución:**
1. Verifica la API key de OpenAI
2. Comprueba que tengas créditos en tu cuenta OpenAI
3. Revisa la consola para errores de red
4. Prueba modo GROQ (gratuito) como alternativa

---

## 📞 Soporte

Si encuentras problemas:

1. **Revisa logs del navegador** (F12 > Console)
2. **Revisa logs de Supabase** (Dashboard > Logs)
3. **Revisa logs de Stripe** (Dashboard > Developers > Logs)
4. **Verifica variables de entorno** en tu hosting

---

## ✅ Checklist Final

Antes de poner en producción:

- [ ] Script SQL ejecutado en Supabase
- [ ] Tabla `usuarios_premium` creada y poblada
- [ ] Funciones RPC funcionando correctamente
- [ ] Claves de Stripe configuradas (Publishable Key)
- [ ] Price ID de Stripe actualizado
- [ ] Backend configurado para Checkout y Webhooks
- [ ] Webhooks de Stripe configurados correctamente
- [ ] OpenAI API key configurada (opcional)
- [ ] Código desplegado en producción
- [ ] Tests realizados con tarjeta de prueba
- [ ] Verificado bloqueo de features para usuarios sin premium
- [ ] Verificado acceso para usuarios con premium

---

## 🎉 ¡Listo!

Tu sistema freemium está configurado y listo para monetizar el Portal Estiba VLC a partir del **1 de enero de 2026**.

**Resumen de Precios:**
- 💰 Suscripción: **€9.99/mes**
- 🎁 Período de gracia: **GRATIS hasta 01/01/2026**
- ✨ Features premium: Sueldómetro, Oráculo, Chatbot IA

---

*Documentación generada el 30/11/2024*
*Sistema implementado con Claude Code*
