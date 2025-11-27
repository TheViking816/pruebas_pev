-- ============================================================================
-- RESTAURAR CRON JOB DE NOTIFICACIONES DIARIAS DEL ORÁCULO
-- ============================================================================
-- Este script restaura el cron job que envía notificaciones diarias del Oráculo
-- a las 16:00 (hora de España)
--
-- IMPORTANTE: Ajusta la hora según tu zona horaria
-- - España (CET/CEST): En invierno usa 15:00 UTC, en verano usa 14:00 UTC
-- - El servidor de Supabase trabaja en UTC
-- ============================================================================

-- Verificar si ya existe el cron job
SELECT jobid, jobname, schedule, active
FROM cron.job
WHERE jobname = 'daily-oracle-notifications';

-- Si ya existe, eliminarlo primero para recrearlo
SELECT cron.unschedule('daily-oracle-notifications');

-- Crear el cron job para notificaciones diarias del Oráculo
-- Se ejecutará todos los días a las 15:00 UTC (16:00 CET - hora de invierno en España)
-- AJUSTA LA HORA SEGÚN TU ZONA HORARIA:
-- - Para 16:00 en España (invierno): usa '0 15 * * *' (15:00 UTC)
-- - Para 16:00 en España (verano):   usa '0 14 * * *' (14:00 UTC)
SELECT cron.schedule(
  'daily-oracle-notifications',           -- Nombre del job
  '0 15 * * *',                           -- Cron expression: 15:00 UTC = 16:00 CET (invierno)
  $$
  SELECT
    net.http_post(
      url := 'https://icszzxkdxatfytpmoviq.supabase.co/functions/v1/daily-oracle-notifications',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);

-- Verificar que se creó correctamente
SELECT
  jobid,
  jobname,
  schedule,
  active,
  nodename,
  command
FROM cron.job
WHERE jobname = 'daily-oracle-notifications';

-- ============================================================================
-- EXPLICACIÓN DE LA HORA
-- ============================================================================

-- El cron expression '0 15 * * *' significa:
-- - Minuto: 0
-- - Hora: 15 (15:00 UTC)
-- - Día del mes: * (todos los días)
-- - Mes: * (todos los meses)
-- - Día de la semana: * (todos los días)

-- Conversión de horarios (España):
-- UTC → CET (invierno, UTC+1)  → CEST (verano, UTC+2)
-- 14:00 UTC → 15:00 CET       → 16:00 CEST
-- 15:00 UTC → 16:00 CET       → 17:00 CEST
-- 16:00 UTC → 17:00 CET       → 18:00 CEST

-- Recomendación para España:
-- - Si quieres notificaciones a las 16:00 todo el año → usa '0 15 * * *' (invierno)
-- - Cambia manualmente a '0 14 * * *' en verano si quieres mantener las 16:00

-- ============================================================================
-- VERIFICAR QUE LA EDGE FUNCTION EXISTE
-- ============================================================================

-- Verifica que la edge function esté desplegada:
-- 1. Ve a: https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/functions
-- 2. Debe aparecer 'daily-oracle-notifications' en la lista
-- 3. Si no aparece, debes desplegarla:
--    supabase functions deploy daily-oracle-notifications

-- ============================================================================
-- PROBAR MANUALMENTE
-- ============================================================================

-- Para probar que funciona SIN esperar a las 16:00, ejecuta esto en tu terminal:
/*
curl -X POST https://icszzxkdxatfytpmoviq.supabase.co/functions/v1/daily-oracle-notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TU_SERVICE_ROLE_KEY]"
*/

-- Deberías recibir una notificación push con tu probabilidad del Oráculo

-- ============================================================================
-- VER HISTORIAL DE EJECUCIONES
-- ============================================================================

-- Ver últimas 10 ejecuciones del cron job
SELECT
  jobid,
  runid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-oracle-notifications')
ORDER BY start_time DESC
LIMIT 10;

-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================

-- Si el cron job no se ejecuta:
-- 1. Verificar que pg_cron esté habilitado:
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- 2. Si no está habilitado, ejecutar:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 3. Verificar que pg_net esté habilitado (para http_post):
SELECT * FROM pg_extension WHERE extname = 'pg_net';

-- 4. Si no está habilitado, ejecutar:
-- CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Para deshabilitar el cron job temporalmente (sin eliminarlo):
-- UPDATE cron.job SET active = false WHERE jobname = 'daily-oracle-notifications';

-- Para reactivarlo:
-- UPDATE cron.job SET active = true WHERE jobname = 'daily-oracle-notifications';

-- Para eliminar el cron job:
-- SELECT cron.unschedule('daily-oracle-notifications');
