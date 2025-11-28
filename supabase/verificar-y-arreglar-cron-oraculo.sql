-- ============================================================================
-- VERIFICAR Y ARREGLAR CRON JOB DEL ORÁCULO
-- ============================================================================
-- Este script verifica que el cron job esté configurado correctamente
-- y lo recrea si es necesario
-- ============================================================================

-- PASO 1: Ver cron jobs existentes
SELECT
  jobid,
  jobname,
  schedule,
  command,
  active,
  nodename
FROM cron.job
WHERE jobname LIKE '%oracle%' OR jobname LIKE '%oraculo%';

-- PASO 2: Eliminar cron jobs viejos del oráculo si existen
SELECT cron.unschedule('daily-oracle-notifications');
SELECT cron.unschedule('oracle-notifications');
SELECT cron.unschedule('oraculo-notifications');

-- PASO 3: Habilitar extensión pg_cron si no está habilitada
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- PASO 4: Habilitar extensión pg_net para llamadas HTTP
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- PASO 5: Crear el cron job para ejecutar a las 17:00 (5 PM) todos los días
SELECT cron.schedule(
  'daily-oracle-notifications',              -- Nombre del job
  '0 17 * * *',                              -- A las 17:00 UTC todos los días
  $$
  SELECT net.http_post(
    url := 'https://icszzxkdxatfytpmoviq.supabase.co/functions/v1/daily-oracle-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- PASO 6: Verificar que el cron job se creó correctamente
SELECT
  jobid,
  jobname,
  schedule,
  command,
  active,
  nodename
FROM cron.job
WHERE jobname = 'daily-oracle-notifications';

-- PASO 7: Ver los logs de ejecución del cron (últimas 10 ejecuciones)
SELECT
  runid,
  jobid,
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
-- RESULTADO ESPERADO
-- ============================================================================
-- Debe aparecer 1 fila en cron.job con:
-- - jobname: 'daily-oracle-notifications'
-- - schedule: '0 17 * * *'
-- - active: true

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================
-- 1. El horario '0 17 * * *' significa:
--    - Minuto 0
--    - Hora 17 (5 PM)
--    - Todos los días del mes (*)
--    - Todos los meses (*)
--    - Todos los días de la semana (*)
--
-- 2. La hora está en UTC, no en hora local española
--    - Si quieres que se ejecute a las 17:00 hora española (CET/CEST):
--      - En invierno (CET, UTC+1): programa a las 16:00 UTC → '0 16 * * *'
--      - En verano (CEST, UTC+2): programa a las 15:00 UTC → '0 15 * * *'
--
-- 3. Para cambiar el horario, ejecuta:
--    SELECT cron.unschedule('daily-oracle-notifications');
--    -- Y luego vuelve a crear el cron con el nuevo horario
--
-- 4. Si quieres ejecutar manualmente el cron job (para testing):
--    SELECT net.http_post(
--      url := 'https://icszzxkdxatfytpmoviq.supabase.co/functions/v1/daily-oracle-notifications',
--      headers := '{"Content-Type": "application/json"}'::jsonb,
--      body := '{}'::jsonb
--    );
--
-- 5. Para deshabilitar temporalmente (sin eliminar):
--    UPDATE cron.job
--    SET active = false
--    WHERE jobname = 'daily-oracle-notifications';
--
-- 6. Para reactivar:
--    UPDATE cron.job
--    SET active = true
--    WHERE jobname = 'daily-oracle-notifications';

SELECT '✅ Cron job del Oráculo configurado correctamente' as status;
