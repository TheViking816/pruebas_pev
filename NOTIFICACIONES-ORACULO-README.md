# Implementación de Notificaciones Diarias del Oráculo

## 📋 Resumen

Sistema de notificaciones push diarias que envía a cada usuario su probabilidad de trabajar según el Oráculo.

## 🏗️ Arquitectura

```
┌─────────────────────┐
│  Supabase Cron Job  │  ← Ejecuta cada día a las 17:00
│   (pg_cron)         │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────────────────┐
│  Edge Function:                 │
│  daily-oracle-notifications     │
│                                 │
│  1. Obtiene datos de Noray      │
│  2. Lee usuarios suscritos      │
│  3. Calcula probabilidades      │
│  4. Envía notificaciones        │
└──────────┬──────────────────────┘
           │
           ↓
┌─────────────────────────────────┐
│  Servidor Node.js (Vercel)      │
│  /api/push/notify-oracle        │
│                                 │
│  Envía push notification        │
│  al dispositivo del usuario     │
└─────────────────────────────────┘
```

## 🔧 Paso 1: Desplegar Edge Function

La Edge Function ya está creada en:
```
supabase/functions/daily-oracle-notifications/index.ts
```

**Desplegar a Supabase:**
```bash
cd C:\Users\adria\Proyectos _IA\PortalEstibaVLC\PortalEstibaVLC
supabase functions deploy daily-oracle-notifications
```

**Configurar variables de entorno en Supabase:**
```bash
supabase secrets set NODE_PUSH_SERVER_URL=https://tu-servidor-vercel.vercel.app
```

## 🔧 Paso 2: Crear endpoint en servidor Node.js (Vercel)

Añade este endpoint a tu servidor Node.js en Vercel:

```javascript
// api/push/notify-oracle.js (o similar)
const webpush = require('web-push');
const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, body, url, chapa_target } = req.body;

    // Inicializar Supabase
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Obtener suscripción del usuario
    const { data: subscription, error } = await supabase
      .from('push_notifications')
      .select('*')
      .eq('user_chapa', chapa_target)
      .single();

    if (error || !subscription) {
      console.error('Usuario no encontrado:', chapa_target);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Payload de la notificación
    const payload = JSON.stringify({
      title,
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: {
        url: url || '/oraculo'
      }
    });

    // Enviar notificación push
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth
        }
      },
      payload
    );

    console.log(`✅ Notificación del Oráculo enviada a chapa ${chapa_target}`);

    return res.status(200).json({
      success: true,
      message: 'Notificación enviada'
    });

  } catch (error) {
    console.error('Error enviando notificación:', error);
    return res.status(500).json({
      error: error.message
    });
  }
};
```

## 🔧 Paso 3: Configurar Cron Job en Supabase

Conecta a tu base de datos de Supabase y ejecuta:

```sql
-- Habilitar extensión pg_cron (si no está habilitada)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Crear cron job para ejecutar cada día a las 17:00
SELECT cron.schedule(
  'daily-oracle-notifications',  -- nombre del job
  '0 17 * * *',                   -- cron expression (17:00 todos los días)
  $$
  SELECT
    net.http_post(
        url:='https://TU-PROJECT-ID.supabase.co/functions/v1/daily-oracle-notifications',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer TU_ANON_KEY"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Ver cron jobs configurados
SELECT * FROM cron.job;

-- Eliminar un cron job (si necesitas cambiar el horario)
-- SELECT cron.unschedule('daily-oracle-notifications');
```

**⚠️ Importante:**
- Reemplaza `TU-PROJECT-ID` con tu ID de proyecto de Supabase
- Reemplaza `TU_ANON_KEY` con tu clave anónima de Supabase
- El horario está en UTC, ajusta según tu zona horaria

## 🔧 Paso 4: Probar manualmente

Antes de activar el cron job, prueba manualmente:

```bash
# Desde terminal
curl -X POST https://TU-PROJECT-ID.supabase.co/functions/v1/daily-oracle-notifications \
  -H "Authorization: Bearer TU_ANON_KEY" \
  -H "Content-Type: application/json"
```

Deberías ver en los logs:
- ✅ Datos del scraper obtenidos
- 📋 Usuarios suscritos encontrados
- ✅ Notificaciones enviadas

## 📊 Cómo funciona el cálculo de probabilidad

El sistema calcula la probabilidad para cada jornada:

```typescript
function calculateDailyProbability(userPosition, demandas, fijos) {
  // Para cada jornada (08-14, 14-20, 20-02):
  const totalDemand = gruas + coches;
  const positionsCovered = totalDemand - fijos;

  if (userPosition <= positionsCovered) {
    return 100%; // Seguro que sale
  } else if (userPosition <= positionsCovered + 10) {
    return (100 - distance * 10)%; // Probabilidad decreciente
  } else {
    return 0%; // No sale
  }
}
```

**Ejemplo:**
- Demanda jornada 14-20: 19 grúas + 0 coches = 19 total
- Fijos: 0 (porque Cloudflare bloquea)
- Posiciones cubiertas: 19 - 0 = 19
- Usuario en posición 15: **100% de probabilidad**
- Usuario en posición 22: **70% de probabilidad** (3 posiciones fuera)
- Usuario en posición 35: **0% de probabilidad**

## 🔄 Ajustes opcionales

### Cambiar horario de notificación

Edita el cron expression en el SQL:
```sql
'0 17 * * *'  -- 17:00 UTC todos los días
'0 8 * * *'   -- 08:00 UTC todos los días
'30 16 * * *' -- 16:30 UTC todos los días
```

### Cambiar lógica de cálculo

Edita la función `calculateDailyProbability` en:
```
supabase/functions/daily-oracle-notifications/index.ts
```

Luego vuelve a desplegar:
```bash
supabase functions deploy daily-oracle-notifications
```

## ✅ Checklist de implementación

- [ ] Desplegar Edge Function a Supabase
- [ ] Configurar variables de entorno (NODE_PUSH_SERVER_URL)
- [ ] Añadir endpoint `/api/push/notify-oracle` en servidor Vercel
- [ ] Configurar cron job en Supabase
- [ ] Probar manualmente con curl
- [ ] Verificar que llegan las notificaciones
- [ ] Activar cron job para producción

## 🐛 Troubleshooting

**No llegan notificaciones:**
1. Verificar logs de Edge Function en Supabase Dashboard
2. Verificar logs del servidor Vercel
3. Comprobar que el cron job se está ejecutando: `SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;`

**Error "Usuario no encontrado en censo":**
- Verificar que la tabla `censo` tiene los datos correctos
- Verificar que el campo `chapa` coincide entre `push_notifications` y `censo`

**Probabilidades incorrectas:**
- Verificar que los fijos se están obteniendo correctamente (actualmente 0 por Cloudflare)
- Ajustar la lógica en `calculateDailyProbability` según tus necesidades

## 📝 Notas

- El sistema usa los datos del scraper (https://noray-scraper.onrender.com/api/all)
- Los fijos actualmente retornan 0 debido al bloqueo de Cloudflare
- Puedes ajustar el cálculo de probabilidad según tus necesidades
- Las notificaciones se envían solo a usuarios con suscripción activa
