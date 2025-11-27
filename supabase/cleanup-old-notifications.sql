-- ============================================================================
-- LIMPIEZA DE SISTEMA DE NOTIFICACIONES VIEJO
-- ============================================================================
-- Este script elimina:
-- 1. Cron job viejo que enviaba notificaciones a las 16:00
-- 2. Triggers y funciones obsoletas relacionadas con notificaciones
--
-- IMPORTANTE: Ejecuta este script DESPUÉS de haber configurado el nuevo sistema
-- con notify-new-jornal y daily-oracle-notifications
-- ============================================================================

-- ============================================================================
-- 1. ELIMINAR CRON JOBS VIEJOS
-- ============================================================================

-- Ver todos los cron jobs configurados actualmente
SELECT jobid, jobname, schedule, command
FROM cron.job
ORDER BY jobid;

-- Eliminar cron job de notificaciones a las 16:00 (si existe)
-- IMPORTANTE: Verifica primero el nombre exacto del job con la query anterior
-- Nombres comunes: 'daily-oracle-notifications', 'send-push-notifications', etc.

-- Si el job se llama 'daily-oracle-notifications' y NO quieres las notificaciones automáticas:
-- SELECT cron.unschedule('daily-oracle-notifications');

-- Si hay otros jobs relacionados con notificaciones, elimínalos también:
-- SELECT cron.unschedule('NOMBRE_DEL_JOB');

-- ⚠️ NOTA: Si SÍ quieres mantener las notificaciones diarias del Oráculo a las 16:00,
-- NO elimines el cron job. El nuevo sistema usa el mismo cron job pero con mejor lógica.

-- ============================================================================
-- 2. ELIMINAR TRIGGERS Y FUNCIONES VIEJAS
-- ============================================================================

-- Si existe un trigger viejo con otro nombre (no 'on_jornal_inserted')
-- Por ejemplo, si tenías uno llamado 'jornal_notification_trigger':
-- DROP TRIGGER IF EXISTS jornal_notification_trigger ON jornales;
-- DROP TRIGGER IF EXISTS send_push_on_jornal ON jornales;
-- DROP TRIGGER IF EXISTS notify_on_new_jornal ON jornales;

-- Ver todos los triggers en la tabla jornales
SELECT
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'jornales';

-- Si aparecen triggers duplicados o viejos, elimínalos:
-- DROP TRIGGER IF EXISTS NOMBRE_TRIGGER_VIEJO ON jornales;

-- ============================================================================
-- 3. VERIFICAR EDGE FUNCTIONS ACTIVAS
-- ============================================================================

-- Las edge functions se gestionan desde Supabase Dashboard, no desde SQL
-- Para eliminar una edge function vieja:

-- 1. Ve a: https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/functions
-- 2. Busca la función 'send-push-notification' (la vieja)
-- 3. Haz clic en los 3 puntos → Delete

-- IMPORTANTE: NO elimines estas funciones nuevas:
-- ✅ daily-oracle-notifications (notificaciones diarias del Oráculo)
-- ✅ notify-new-jornal (notificaciones de nuevos jornales)

-- ============================================================================
-- 4. VERIFICACIÓN FINAL
-- ============================================================================

-- Verificar que solo existe el trigger nuevo
SELECT
  trigger_name,
  event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'jornales';

-- Debe aparecer solo: 'on_jornal_inserted'

-- Verificar cron jobs activos
SELECT
  jobname,
  schedule,
  active
FROM cron.job
ORDER BY jobname;

-- Si quieres notificaciones diarias del Oráculo, debe aparecer:
-- 'daily-oracle-notifications' con schedule '0 16 * * *' (o la hora que hayas configurado)

-- ============================================================================
-- RESUMEN DE LO QUE QUEDA ACTIVO
-- ============================================================================

-- Sistema NUEVO (debe estar activo):
-- ✅ Edge Function: notify-new-jornal
-- ✅ Edge Function: daily-oracle-notifications
-- ✅ Trigger: on_jornal_inserted (en tabla jornales)
-- ✅ Cron Job: daily-oracle-notifications (si quieres notificaciones diarias)

-- Sistema VIEJO (debe estar eliminado):
-- ❌ Edge Function: send-push-notification
-- ❌ Triggers viejos en tabla jornales
-- ❌ Cron jobs duplicados o obsoletos

-- ============================================================================
-- COMANDOS PARA ELIMINAR EDGE FUNCTION VIEJA (via Supabase CLI)
-- ============================================================================

-- Si prefieres usar CLI en lugar del Dashboard:
/*
# Listar todas las edge functions
supabase functions list

# Eliminar la función vieja
supabase functions delete send-push-notification
*/

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================

-- 1. El nuevo sistema (notify-new-jornal) es MEJOR que el viejo porque:
--    - Usa la estructura real de la tabla jornales
--    - Mejor manejo de errores
--    - Mejor logging
--    - Mejor documentación

-- 2. NO necesitas mantener ambos sistemas. El nuevo reemplaza al viejo completamente.

-- 3. Si algo falla después de la limpieza, puedes restaurar ejecutando
--    de nuevo el script: supabase/setup-jornal-notifications.sql
