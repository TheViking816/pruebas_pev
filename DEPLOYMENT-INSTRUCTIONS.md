# 🚀 Instrucciones de Despliegue - Sistema de Notificaciones Completo

## ✅ Cambios Completados

### 1. Backend de Notificaciones (Vercel)
- ✅ Creado `/api/push/notify-new-hire.js` - Arregla el error 404 actual
- ✅ Creado `/api/push/notify-oracle.js` - Nuevo endpoint para notificaciones del Oráculo
- ✅ Actualizado `vercel.json` con las rutas correctas
- ✅ Corregido nombre de tabla: `push_notifications` (en lugar de `push_subscriptions`)
- ✅ Código subido a GitHub: https://github.com/TheViking816/portalestiba-push-backend

### 2. Edge Function (Supabase)
- ✅ Actualizada URL del backend a: `https://portalestiba-push-backend-one.vercel.app`
- ✅ Código subido a rama `render`: https://github.com/TheViking816/PortalEstibaVLC/tree/render

---

## 📋 Pasos de Despliegue

### PASO 1: Configurar Variables de Entorno en Vercel

Vercel detectará automáticamente los cambios en GitHub y hará redeploy, pero **ANTES** necesitas añadir las variables que faltan:

1. Ve a: https://vercel.com/portalestiba-push-backend-one/settings/environment-variables

2. Añade estas 2 variables nuevas:

| Nombre | Valor | Descripción |
|--------|-------|-------------|
| `WEB_PUSH_EMAIL` | `noreply@portalestibavlc.com` | Email de contacto para VAPID |
| `VAPID_PUBLIC_KEY` | (ver abajo) | Ya la tienes configurada |

3. **IMPORTANTE**: Verifica que ya tengas estas variables existentes:
   - ✅ `SUPABASE_URL`
   - ✅ `SUPABASE_SERVICE_ROLE_KEY`
   - ✅ `VAPID_PRIVATE_KEY`
   - ✅ `VAPID_PUBLIC_KEY`

4. Después de añadir las variables, **NO es necesario hacer nada más** - Vercel redesplegará automáticamente al detectar el commit en GitHub.

### PASO 2: Redesplegar Edge Function en Supabase

La Edge Function ya tiene el código actualizado en GitHub. Ahora debes redesplegarla:

```bash
# Opción A: Desde la terminal (si tienes Supabase CLI instalado)
cd "C:\Users\adria\Proyectos _IA\PortalEstibaVLC\PortalEstibaVLC"
supabase functions deploy daily-oracle-notifications

# Opción B: Desde el Dashboard de Supabase
# 1. Ve a: https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/functions
# 2. Encuentra "daily-oracle-notifications"
# 3. Haz clic en "Deploy"
# 4. Selecciona la última versión del código
```

### PASO 3: Configurar Cron Job (Ejecución Automática Diaria)

Para que las notificaciones se envíen automáticamente cada día a las 17:00 (5 PM):

1. Ve al **SQL Editor** de Supabase:
   https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/sql/new

2. Ejecuta este SQL:

```sql
-- Habilitar la extensión pg_cron si no está habilitada
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Programar la ejecución diaria a las 17:00 (hora del servidor UTC)
-- AJUSTA LA HORA SEGÚN TU ZONA HORARIA
SELECT cron.schedule(
  'daily-oracle-notifications',           -- Nombre del job
  '0 17 * * *',                            -- A las 17:00 UTC cada día
  $$
  SELECT
    net.http_post(
      url := 'https://icszzxkdxatfytpmoviq.supabase.co/functions/v1/daily-oracle-notifications',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb
    ) AS request_id;
  $$
);

-- Ver todos los cron jobs configurados
SELECT * FROM cron.job;
```

**IMPORTANTE - Zona Horaria**:
- Si quieres que se ejecute a las 17:00 hora de España (CET/CEST), y el servidor está en UTC:
  - En invierno (CET = UTC+1): usa `'0 16 * * *'` (16:00 UTC = 17:00 CET)
  - En verano (CEST = UTC+2): usa `'0 15 * * *'` (15:00 UTC = 17:00 CEST)

### PASO 4: Probar el Sistema Manualmente

Antes de esperar al cron job, prueba que todo funciona:

#### A) Probar el endpoint del backend directamente:

```bash
curl -X POST https://portalestiba-push-backend-one.vercel.app/api/push/notify-oracle \
  -H "Content-Type: application/json" \
  -d '{
    "title": "🔮 Prueba del Oráculo",
    "body": "✅ Alta probabilidad! 85% en MAÑANA",
    "url": "/oraculo",
    "chapa_target": "12345"
  }'
```

Cambia `"12345"` por una chapa real que tenga suscripción activa.

#### B) Probar la Edge Function completa:

```bash
curl -X POST https://icszzxkdxatfytpmoviq.supabase.co/functions/v1/daily-oracle-notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TU_SERVICE_ROLE_KEY]"
```

Reemplaza `[TU_SERVICE_ROLE_KEY]` con tu clave (la que está en las variables de entorno de Vercel).

---

## 🔍 Verificación y Logs

### Ver logs de la Edge Function:
https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/functions/daily-oracle-notifications/logs

### Ver logs del backend de Vercel:
https://vercel.com/portalestiba-push-backend-one/deployments

### Verificar cron jobs en Supabase:
```sql
SELECT * FROM cron.job;
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

---

## ⚠️ Solución de Problemas

### Error 404 en /api/push/notify-new-hire
**Causa**: Vercel no ha redesplegado con los nuevos archivos en `/api/`
**Solución**:
1. Ve a https://vercel.com/portalestiba-push-backend-one/deployments
2. Verifica que el último deployment incluye los archivos `/api/push/*.js`
3. Si no, haz un redeploy manual

### Edge Function falla al enviar notificaciones
**Causa**: Variables de entorno faltantes en Vercel
**Solución**: Verifica que `WEB_PUSH_EMAIL` esté configurada (Paso 1)

### No se reciben notificaciones
**Causa**: Usuario no tiene suscripción activa
**Solución**: Verifica en la tabla `push_notifications`:
```sql
SELECT * FROM push_notifications WHERE user_chapa = 'CHAPA_DEL_USUARIO';
```

### Cron job no se ejecuta
**Causa**: pg_cron no está habilitado o la hora está mal configurada
**Solución**:
1. Verifica que pg_cron esté habilitado: `SELECT * FROM pg_extension WHERE extname = 'pg_cron';`
2. Verifica la hora configurada: `SELECT * FROM cron.job;`

---

## 📊 Resumen de URLs

| Recurso | URL |
|---------|-----|
| Backend (Vercel) | https://portalestiba-push-backend-one.vercel.app |
| Edge Function | https://icszzxkdxatfytpmoviq.supabase.co/functions/v1/daily-oracle-notifications |
| GitHub Backend | https://github.com/TheViking816/portalestiba-push-backend |
| GitHub PWA (render) | https://github.com/TheViking816/PortalEstibaVLC/tree/render |
| Scraper (Render) | https://noray-scraper.onrender.com/api/all |

---

## ✅ Checklist Final

- [ ] Variables de entorno añadidas en Vercel
- [ ] Vercel ha redesplegado automáticamente
- [ ] Edge Function redesplegada en Supabase
- [ ] Cron job configurado con SQL
- [ ] Prueba manual del endpoint `/api/push/notify-oracle` exitosa
- [ ] Prueba manual de la Edge Function exitosa
- [ ] Verificados los logs - sin errores
- [ ] Primera notificación automática recibida (esperar hasta las 17:00)

---

## 🎯 ¿Todo Listo?

Una vez completados estos 4 pasos, el sistema estará completamente funcional:

1. ✅ Los usuarios recibirán notificaciones cuando haya nuevas contrataciones
2. ✅ Los usuarios recibirán notificaciones diarias a las 17:00 con su probabilidad del Oráculo
3. ✅ El scraper responde instantáneamente gracias al caché
4. ✅ El bug del scroll del foro está arreglado

¡Todo debería estar funcionando perfectamente! 🎉
