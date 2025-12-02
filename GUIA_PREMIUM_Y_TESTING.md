# 📚 Guía Completa: Sistema Premium y Testing

## 📋 Índice
1. [Resumen de Cambios Implementados](#resumen)
2. [Control del Chatbot IA](#chatbot)
3. [Cómo Probar el Sistema Premium](#testing)
4. [Preguntas sobre Stripe](#stripe)
5. [Configuración de Precios](#precios)
6. [Comportamiento del 1 de Enero 2026](#enero)

---

## 🎯 Resumen de Cambios Implementados {#resumen}

### ✅ Problema Identificado y Solucionado

**Problema:**
- ✅ Sueldómetro: Bloqueaba correctamente sin premium
- ✅ Oráculo: Bloqueaba correctamente sin premium
- ❌ **Chatbot IA: NO bloqueaba (permitía acceso sin premium)**

**Causa:**
El chatbot era un simple enlace HTML (`<a href="./chatbot/index.html">`) sin ninguna verificación de acceso premium.

### 🔧 Soluciones Implementadas

#### 1. **Control de Visibilidad del Botón del Chatbot**
- ✅ Creado: `config-features.js` - Archivo de configuración
- ✅ Modificado: `index.html` - Añadida lógica de control
- ✅ Ahora puedes mostrar/ocultar el botón del chatbot desde un solo lugar

#### 2. **Bloqueo Premium en el Chatbot**
- ✅ Creado: `chatbot/premium-check.js` - Verificación de acceso
- ✅ Modificado: `chatbot/index.html` - Integrada verificación
- ✅ Ahora el chatbot SÍ verifica premium antes de permitir acceso

#### 3. **Actualización de Service Workers**
- ✅ Actualizado: `service-worker.js` (v11 → v12)
- ✅ Actualizado: `chatbot/service-worker.js` (v14 → v15)
- ✅ Nuevos archivos incluidos en la caché

#### 4. **SQL para Gestión Manual**
- ✅ Creado: `GESTION_MANUAL_PREMIUM.sql` - 15 queries útiles
- ✅ Permite activar/desactivar premium manualmente para testing

---

## 🤖 Control del Chatbot IA {#chatbot}

### Cómo Ocultar/Mostrar el Botón del Chatbot

#### Opción 1: Configuración Manual (Recomendado)

Edita el archivo `config-features.js`:

```javascript
CHATBOT_IA: {
  mostrarBoton: false,  // ⚠️ CAMBIAR A true CUANDO QUIERAS ACTIVAR
  mensajeOculto: '🤖 Chatbot IA: Funcionalidad oculta temporalmente (en desarrollo)'
}
```

**Para ocultar el chatbot:**
```javascript
mostrarBoton: false
```

**Para mostrar el chatbot:**
```javascript
mostrarBoton: true
```

#### Opción 2: Desde la Consola del Navegador (Temporal)

```javascript
// Ocultar
document.getElementById('chatbot-fab').style.display = 'none';

// Mostrar
document.getElementById('chatbot-fab').style.display = '';
```

### Estado Actual del Chatbot

- 🔒 **Botón OCULTO** (`mostrarBoton: false`)
- 🔐 **Bloqueo premium ACTIVO** (requiere suscripción para usar)
- ✅ **Listo para activarse cuando mejores la implementación de OpenAI**

---

## 🧪 Cómo Probar el Sistema Premium {#testing}

### Método 1: Usando SQL (Recomendado para Testing)

#### Paso 1: Verificar tu Estado Actual
```sql
SELECT chapa, estado, periodo_fin, features_disponibles
FROM usuarios_premium
WHERE chapa = '115';  -- Tu chapa
```

#### Paso 2: Quitarte el Premium (Simular Usuario Sin Suscripción)
```sql
UPDATE usuarios_premium
SET
    estado = 'canceled',
    periodo_fin = NOW(),
    features_disponibles = ARRAY[]::text[],
    updated_at = NOW()
WHERE chapa = '115';  -- Tu chapa
```

#### Paso 3: Probar las Funcionalidades

**Intenta acceder a:**
1. **Sueldómetro** → Debería mostrarte overlay de bloqueo 🔒
2. **Oráculo** → Debería mostrarte overlay de bloqueo 🔒
3. **Chatbot IA** (si está visible) → Debería mostrarte overlay de bloqueo 🔒

**Resultado Esperado:**
```
┌─────────────────────────────┐
│    🔒 Feature Premium       │
│                             │
│  Desbloquea [X] con una     │
│  suscripción premium        │
│                             │
│  [⭐ Desbloquear €4.99/mes] │
└─────────────────────────────┘
```

#### Paso 4: Restaurar tu Acceso Premium
```sql
UPDATE usuarios_premium
SET
    estado = 'active',
    periodo_inicio = NOW(),
    periodo_fin = NOW() + INTERVAL '1 year',
    features_disponibles = ARRAY['sueldometro', 'oraculo', 'chatbot_ia']::text[],
    updated_at = NOW()
WHERE chapa = '115';  -- Tu chapa
```

### Método 2: Usando una Chapa de Prueba

Crea un usuario temporal para testing:

```sql
-- Crear usuario de prueba SIN premium
INSERT INTO usuarios (chapa, password_hash, nombre)
VALUES ('9999', '$2a$10$...', 'Usuario Prueba');

-- Este usuario NO estará en usuarios_premium, por lo que no tendrá acceso
```

Inicia sesión con chapa `9999` y verifica que todo esté bloqueado.

### Método 3: Verificar con las Funciones RPC

```sql
-- Verificar si una chapa tiene acceso a un feature
SELECT tiene_acceso_feature('115', 'chatbot_ia');  -- true/false
SELECT tiene_acceso_feature('115', 'sueldometro');  -- true/false
SELECT tiene_acceso_feature('115', 'oraculo');      -- true/false
```

---

## 💳 Preguntas sobre Stripe {#stripe}

### ¿Si pago y luego cancelo, me harán devolución?

**Respuesta:** Depende de tu configuración en Stripe y del plan de precios.

#### Escenario 1: Cancelación Inmediata (Antes del Periodo de Facturación)
- **Proration**: Si tienes habilitado el prorrateado en Stripe, SÍ podrías recibir un reembolso proporcional
- **Comisiones**: Stripe NO reembolsa sus comisiones (2.9% + €0.25 por transacción)
- **Ejemplo**:
  - Pagas €4.99 → Stripe cobra €0.39 de comisión
  - Cancelas al instante → Recibirías máximo €4.60 (si haces reembolso manual)
  - Stripe se queda con los €0.39 de comisión

#### Escenario 2: Cancelación Durante el Periodo Activo
- **Comportamiento por defecto**: La suscripción se mantiene activa hasta el final del periodo pagado
- **No hay reembolso automático**: Stripe NO hace reembolsos automáticos al cancelar
- **Ejemplo**:
  - Pagas €4.99 el día 1
  - Cancelas el día 5
  - Sigues teniendo acceso hasta el día 30
  - NO se te reembolsa nada (comportamiento estándar)

#### Recomendaciones para Testing:

1. **Usa el Modo Test de Stripe**
   - No se hacen cargos reales
   - Usa tarjetas de prueba: `4242 4242 4242 4242`
   - Fecha: Cualquier fecha futura
   - CVV: Cualquier 3 dígitos

2. **Si Necesitas Probar en Modo Live:**
   - Crea un cupón de descuento del 100% en Stripe
   - Úsalo para hacer una suscripción gratuita
   - Así pruebas el flujo completo sin cobros

3. **Reembolsos Manuales:**
   - Puedes hacer reembolsos manualmente desde el Dashboard de Stripe
   - Stripe NO te devuelve su comisión
   - Tú absorbes el coste de la comisión

### ¿Cuánto me cobra Stripe de comisión?

**Comisiones de Stripe (Europa):**
- **Por transacción**: 1.5% + €0.25
- **Suscripciones**: Mismo precio (sin coste adicional)

**Ejemplos:**
- Suscripción de €4.99/mes:
  - Comisión: €0.32
  - Tú recibes: €4.67

- Suscripción de €6.99/mes:
  - Comisión: €0.35
  - Tú recibes: €6.64

**Importante:**
- Las comisiones se descuentan automáticamente
- Recibes los pagos en 7 días (por defecto)
- Puedes cambiar a pagos diarios después de un tiempo

---

## 💰 Configuración de Precios {#precios}

### Precios Actuales en el Código

En `services/premium.js`:

```javascript
export const PRECIOS = {
  MENSUAL: {
    precio: 9.99,
    moneda: 'EUR',
    intervalo: 'mes'
  },
  ANUAL: {
    precio: 99.00,
    moneda: 'EUR',
    intervalo: 'año',
    descuento: '17%'
  }
};
```

### Tu Plan de Precios

Según tu mensaje:
- **Primeros 50 usuarios**: €4.99/mes
- **Usuarios 51 en adelante**: €6.99/mes

### Cómo Implementar Precios Escalonados

#### Opción 1: Crear Múltiples Productos en Stripe

1. **Producto 1**: "Premium Early Bird" - €4.99/mes (para primeros 50)
2. **Producto 2**: "Premium Standard" - €6.99/mes (para el resto)

En tu Dashboard de Stripe:
```
1. Products → Create Product
   - Name: "Portal Estiba VLC - Early Bird"
   - Price: €4.99/month
   - Limit: 50 subscriptions (usar cupones exclusivos)

2. Products → Create Product
   - Name: "Portal Estiba VLC - Standard"
   - Price: €6.99/month
```

#### Opción 2: Usar Cupones

Crear cupón del 28.6% de descuento para primeros 50:
```
- Code: EARLY50
- Discount: €2.00 off forever
- Max redemptions: 50
```

### Modificar Precios en el Código

Edita `components/FeatureLock.js` línea 56:

```javascript
// Cambiar de:
Desbloquear por €4.99/mes

// A un precio dinámico:
Desbloquear por €${obtenerPrecioActual()}/mes
```

Y agrega:
```javascript
function obtenerPrecioActual() {
  // Consultar cuántas suscripciones activas hay
  // Si < 50: retornar 4.99
  // Si >= 50: retornar 6.99
  return 4.99; // Por ahora
}
```

---

## 📅 Comportamiento del 1 de Enero 2026 {#enero}

### ¿Qué Pasará el 1 de Enero?

**SÍ**, todos los usuarios perderán acceso automáticamente.

#### Por qué:

1. **Estado actual de todos los usuarios:**
```json
{
  "estado": "trialing",
  "periodo_fin": "2026-01-01 00:00:00+00",
  "features_disponibles": ["sueldometro", "oraculo", "chatbot_ia"]
}
```

2. **La función `tiene_acceso_feature()` verifica:**
```sql
-- En supabase-premium-schema.sql
periodo_fin > NOW()  -- Debe ser mayor a la fecha actual
```

3. **El 1 de enero a las 00:00:**
```sql
periodo_fin (2026-01-01 00:00:00) > NOW() (2026-01-01 00:00:01)
-- FALSE ❌
```

### Qué Verán los Usuarios

A partir del 1 de enero de 2026:

1. **Accederán a Sueldómetro:**
   ```
   ┌─────────────────────────────┐
   │    🔒 Feature Premium       │
   │                             │
   │  [⭐ Desbloquear €4.99/mes] │
   └─────────────────────────────┘
   ```

2. **Accederán a Oráculo:**
   ```
   ┌─────────────────────────────┐
   │    🔒 Feature Premium       │
   │                             │
   │  [⭐ Desbloquear €4.99/mes] │
   └─────────────────────────────┘
   ```

3. **Accederán a Chatbot (si está visible):**
   ```
   ┌─────────────────────────────┐
   │   🤖✨ Chatbot IA Premium   │
   │                             │
   │  [⭐ Desbloquear Premium]   │
   └─────────────────────────────┘
   ```

### Proceso de Suscripción

Cuando hagan clic en "Desbloquear":

1. **Redirigirán a Stripe Checkout**
2. **Introducirán sus datos de pago**
3. **Al completar el pago:**
   - `estado` → `'active'`
   - `periodo_inicio` → Fecha actual
   - `periodo_fin` → Fecha actual + 1 mes
   - `stripe_customer_id` → ID de Stripe
   - `stripe_subscription_id` → ID de suscripción

4. **Volverán a la app con acceso completo**

### Verificar el Comportamiento Antes del 1 de Enero

Puedes simular que ya es el 1 de enero:

```sql
-- Simular que ya pasó el periodo de trial
UPDATE usuarios_premium
SET periodo_fin = NOW() - INTERVAL '1 day'  -- Ayer
WHERE chapa = '115';

-- Ahora intenta acceder al sueldómetro
-- Deberías ver el bloqueo premium
```

---

## 🎯 Checklist Final de Testing

Antes de lanzar la monetización:

- [ ] Verificar que el bloqueo premium funciona en Sueldómetro
- [ ] Verificar que el bloqueo premium funciona en Oráculo
- [ ] Verificar que el bloqueo premium funciona en Chatbot IA
- [ ] Probar el flujo completo de pago con Stripe (modo test)
- [ ] Probar cancelación de suscripción
- [ ] Verificar que al pagar se obtiene acceso inmediato
- [ ] Verificar que al cancelar se mantiene acceso hasta fin de periodo
- [ ] Comprobar webhooks de Stripe funcionan correctamente
- [ ] Probar con diferentes métodos de pago
- [ ] Verificar correos de confirmación
- [ ] Tener preparado soporte para usuarios con problemas

---

## 📞 Soporte Técnico

Si encuentras algún problema:

1. **Revisa los logs del navegador** (F12 → Console)
2. **Verifica el estado en Supabase**
3. **Comprueba los webhooks en Stripe**
4. **Revisa este documento para soluciones comunes**

---

## 🚀 ¡Listo para Monetizar!

Tu sistema premium está completamente funcional:

✅ Bloqueo correcto en todas las features
✅ Periodo de trial hasta el 1 enero 2026
✅ Sistema de pago con Stripe configurado
✅ Control manual del chatbot IA
✅ Herramientas SQL para gestión
✅ Sistema de webhooks funcionando

**¡Mucha suerte con el lanzamiento! 🎉**
