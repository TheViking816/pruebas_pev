# 🔄 Sistema de Actualización Automática de Estados Premium

## 📋 Resumen

Este script añade funcionalidad para que los estados de suscripciones se actualicen automáticamente a `expired` cuando la fecha `periodo_fin` ya pasó.

---

## ⚙️ Qué hace este sistema

### Antes (problema):
- ❌ La suscripción de chapa "9999" expiraba pero seguía mostrando `estado = 'active'`
- ❌ No sabías cuántas suscripciones reales hay activas
- ✅ La función RPC sí bloqueaba el acceso correctamente

### Después (solución):
- ✅ El campo `estado` se actualiza automáticamente a `'expired'`
- ✅ Puedes ver en Supabase cuántas suscripciones están realmente activas
- ✅ Se detectan renovaciones y cancelaciones correctamente
- ✅ Se actualiza automáticamente todos los días a las 00:05

---

## 🚀 Cómo ejecutarlo en Supabase

### Paso 1: Ir al SQL Editor

1. Ve a tu proyecto en https://supabase.com
2. Click en **SQL Editor** (menú izquierdo)
3. Click en **New query**

### Paso 2: Copiar y pegar el script

1. Abre el archivo: `supabase/migrations/actualizar_estados_premium.sql`
2. **Copia TODO el contenido** (Ctrl+A, Ctrl+C)
3. **Pega** en el SQL Editor de Supabase (Ctrl+V)

### Paso 3: Ejecutar

1. Click en **Run** (o presiona Ctrl+Enter)
2. Espera a que termine (puede tardar 5-10 segundos)

### Paso 4: Verificar que funcionó

Ejecuta esta query en el SQL Editor:

```sql
-- Ver cuántas suscripciones se actualizaron a expired
SELECT
  estado,
  COUNT(*) as total
FROM usuarios_premium
GROUP BY estado
ORDER BY estado;
```

Deberías ver algo como:

```
estado    | total
----------|------
active    | 10
trialing  | 500
expired   | 9     ← Estas son las que ya expiraron
```

---

## 📊 Nuevas funcionalidades añadidas

### 1. Función `actualizar_estados_premium_expirados()`

Actualiza manualmente todos los estados expirados:

```sql
-- Ejecutar manualmente cuando quieras
SELECT * FROM actualizar_estados_premium_expirados();

-- Resultado:
-- chapas_actualizadas: {171, 9999, 234}
-- total_actualizados: 3
```

### 2. Función `tiene_acceso_premium()` mejorada

Ahora también actualiza el estado al verificar acceso:

```sql
-- Al llamar a esta función, si encuentra que expiró, actualiza el estado
SELECT tiene_acceso_premium('9999');
-- Resultado: false
-- Y automáticamente cambia el estado a 'expired' en la tabla
```

### 3. pg_cron Job automático

Se ejecuta **automáticamente todos los días a las 00:05** para actualizar estados expirados.

**Ver jobs programados:**
```sql
SELECT * FROM cron.job;
```

**Ver historial de ejecuciones:**
```sql
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;
```

**Desactivar el job (si es necesario):**
```sql
SELECT cron.unschedule('actualizar-estados-premium-diario');
```

**Reactivar el job:**
```sql
SELECT cron.schedule(
  'actualizar-estados-premium-diario',
  '5 0 * * *',
  $$SELECT actualizar_estados_premium_expirados();$$
);
```

---

## 🎯 Estados posibles de suscripciones

| Estado | Significado |
|--------|-------------|
| `active` | Suscripción activa y vigente |
| `trialing` | Periodo de prueba activo |
| `expired` | Suscripción expirada (periodo_fin ya pasó) |
| `canceled` | Suscripción cancelada por el usuario |
| `past_due` | Pago falló, esperando renovación |

---

## 🧪 Probar que funciona

### Prueba 1: Crear suscripción de prueba que expire en 2 minutos

```sql
INSERT INTO usuarios_premium (
  chapa,
  estado,
  periodo_inicio,
  periodo_fin,
  features_disponibles
) VALUES (
  '9999',
  'active',
  NOW(),
  NOW() + INTERVAL '2 minutes'  -- Expira en 2 minutos
)
ON CONFLICT (chapa) DO UPDATE SET
  estado = 'active',
  periodo_fin = NOW() + INTERVAL '2 minutes',
  updated_at = NOW();
```

### Prueba 2: Esperar 2 minutos y verificar

```sql
-- Después de 2 minutos, llamar a la función
SELECT tiene_acceso_premium('9999');
-- Resultado: false

-- Ver que el estado cambió a 'expired'
SELECT chapa, estado, periodo_fin
FROM usuarios_premium
WHERE chapa = '9999';
-- estado debería ser 'expired'
```

### Prueba 3: Actualizar manualmente todos los expirados

```sql
SELECT * FROM actualizar_estados_premium_expirados();
-- Verás cuántas chapas se actualizaron
```

---

## ⚠️ Importante: Habilitar pg_cron

Para que el cron job funcione, **debes habilitar la extensión pg_cron**:

1. Ve a **Database > Extensions** en Supabase
2. Busca **pg_cron**
3. Click en **Enable**

Si no habilitas pg_cron, el script funcionará pero el job automático no se ejecutará.

**Alternativa sin pg_cron:**

Si no quieres usar pg_cron, puedes llamar manualmente a la función periódicamente:

```sql
-- Ejecutar esto manualmente cuando quieras actualizar estados
SELECT * FROM actualizar_estados_premium_expirados();
```

O crear una Edge Function que se ejecute periódicamente con un cron externo.

---

## 📈 Monitoreo

### Ver suscripciones por estado

```sql
SELECT
  estado,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE periodo_fin > NOW()) as vigentes,
  COUNT(*) FILTER (WHERE periodo_fin <= NOW()) as expiradas
FROM usuarios_premium
GROUP BY estado;
```

### Ver suscripciones que expiran pronto

```sql
SELECT
  chapa,
  estado,
  periodo_fin,
  periodo_fin - NOW() as tiempo_restante
FROM usuarios_premium
WHERE estado IN ('active', 'trialing')
  AND periodo_fin IS NOT NULL
  AND periodo_fin > NOW()
  AND periodo_fin < NOW() + INTERVAL '7 days'
ORDER BY periodo_fin ASC;
```

### Ver renovaciones recientes

```sql
SELECT
  chapa,
  estado,
  periodo_inicio,
  periodo_fin,
  updated_at
FROM usuarios_premium
WHERE updated_at > NOW() - INTERVAL '24 hours'
ORDER BY updated_at DESC;
```

---

## 🔄 Cuando hagas testing con Stripe

Después de probar un pago con Stripe (modo TEST), verifica:

1. **Webhook recibido en Stripe Dashboard:**
   - Developers > Webhooks > Click en tu webhook
   - Deberías ver eventos recientes

2. **Suscripción creada en Supabase:**
   ```sql
   SELECT * FROM usuarios_premium
   WHERE chapa = 'TU_CHAPA'
   ORDER BY updated_at DESC;
   ```

3. **Estado correcto:**
   - `estado = 'active'` o `'trialing'`
   - `periodo_fin > NOW()`
   - `stripe_customer_id` y `stripe_subscription_id` rellenados

---

## 🆘 Troubleshooting

### El estado no se actualiza automáticamente

**Verificar que pg_cron está habilitado:**
```sql
SELECT * FROM pg_extension WHERE extname = 'pg_cron';
```

Si no aparece, ve a Database > Extensions > Habilitar pg_cron.

**Verificar que el job está programado:**
```sql
SELECT * FROM cron.job;
```

### Actualizar manualmente los estados

Si el cron no funciona o quieres forzar actualización:

```sql
SELECT * FROM actualizar_estados_premium_expirados();
```

### Ver errores de cron

```sql
SELECT * FROM cron.job_run_details
WHERE status = 'failed'
ORDER BY start_time DESC;
```

---

## ✅ Checklist de implementación

- [ ] Ejecutar script `actualizar_estados_premium.sql` en Supabase SQL Editor
- [ ] Habilitar extensión `pg_cron` en Database > Extensions
- [ ] Verificar que el job está programado: `SELECT * FROM cron.job;`
- [ ] Probar con chapa 9999 que expire en 2 minutos
- [ ] Verificar que estados se actualizan correctamente

---

**Creado:** 2025-12-09
**Versión:** 1.0
