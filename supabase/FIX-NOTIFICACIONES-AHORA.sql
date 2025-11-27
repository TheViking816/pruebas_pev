-- ============================================================================
-- FIX INMEDIATO - NOTIFICACIONES DE JORNALES
-- ============================================================================
-- Este script limpia TODO y recrea el sistema correctamente
-- Ejecuta TODO este archivo en Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- PASO 1: ELIMINAR TODOS LOS TRIGGERS VIEJOS
-- ============================================================================

-- Ver todos los triggers actuales
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'jornales';

-- Eliminar TODOS los triggers relacionados con notificaciones
DROP TRIGGER IF EXISTS on_jornal_insert ON jornales;
DROP TRIGGER IF EXISTS on_jornal_inserted ON jornales;
DROP TRIGGER IF EXISTS send_push_on_jornal ON jornales;
DROP TRIGGER IF EXISTS notify_on_new_jornal ON jornales;
DROP TRIGGER IF EXISTS jornal_notification_trigger ON jornales;

-- NO tocar este trigger (es para updated_at)
-- DROP TRIGGER IF EXISTS update_jornales_updated_at ON jornales;

-- ============================================================================
-- PASO 2: ELIMINAR FUNCIONES VIEJAS
-- ============================================================================

DROP FUNCTION IF EXISTS notify_new_jornal_trigger() CASCADE;
DROP FUNCTION IF EXISTS send_push_notification_trigger() CASCADE;
DROP FUNCTION IF EXISTS jornal_notification_function() CASCADE;

-- ============================================================================
-- PASO 3: HABILITAR EXTENSIONES NECESARIAS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================================================
-- PASO 4: CREAR FUNCIÓN CORRECTA (SIMPLIFICADA PARA DEBUGGING)
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_new_jornal_trigger()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
  payload jsonb;
BEGIN
  -- Construir payload
  payload := jsonb_build_object(
    'type', 'INSERT',
    'table', 'jornales',
    'record', row_to_json(NEW)
  );

  -- Log para debugging
  RAISE NOTICE 'Trigger ejecutado para chapa: %, payload: %', NEW.chapa, payload;

  -- Llamar a la Edge Function
  PERFORM net.http_post(
    url := 'https://icszzxkdxatfytpmoviq.supabase.co/functions/v1/notify-new-jornal',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := payload
  );

  -- Log de éxito
  RAISE NOTICE 'Notificación enviada para chapa: %', NEW.chapa;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PASO 5: CREAR TRIGGER NUEVO
-- ============================================================================

CREATE TRIGGER on_jornal_inserted
  AFTER INSERT ON jornales
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_jornal_trigger();

-- ============================================================================
-- PASO 6: VERIFICAR CONFIGURACIÓN
-- ============================================================================

-- 1. Ver triggers activos (solo debe aparecer update_jornales_updated_at y on_jornal_inserted)
SELECT trigger_name, event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'jornales'
ORDER BY trigger_name;

-- 2. Ver extensiones habilitadas
SELECT extname FROM pg_extension
WHERE extname IN ('pg_net', 'pg_cron')
ORDER BY extname;

-- 3. Ver cron job del Oráculo
SELECT jobname, schedule, active
FROM cron.job
WHERE jobname = 'daily-oracle-notifications';

-- ============================================================================
-- PASO 7: PRUEBA INMEDIATA
-- ============================================================================

-- Insertar jornal de prueba para chapa 816
-- IMPORTANTE: Esto debería disparar la notificación AHORA MISMO
INSERT INTO jornales (chapa, fecha, jornada, puesto, empresa, buque, parte, origen)
VALUES ('816', CURRENT_DATE, '14-20', 'Gruista TEST', 'MSC', 'BUQUE DE PRUEBA INMEDIATA', '999', 'importacion');

-- ============================================================================
-- PASO 8: VER LOGS DEL TRIGGER
-- ============================================================================

-- Los logs RAISE NOTICE aparecerán en:
-- 1. Supabase Dashboard → Database → Logs
-- 2. O en la consola si estás usando psql

-- También verifica los logs de la edge function:
-- https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/functions/notify-new-jornal/logs

-- ============================================================================
-- PASO 9: VERIFICAR SUSCRIPCIÓN
-- ============================================================================

-- Ver si la chapa 816 tiene suscripción activa
SELECT
  user_chapa,
  endpoint,
  created_at
FROM push_subscriptions
WHERE user_chapa = '816';

-- Debe aparecer un endpoint que empiece con: https://fcm.googleapis.com/fcm/send/

-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================

-- Si después de ejecutar este script TODAVÍA no llegan notificaciones:

-- 1. Ver si el trigger se está ejecutando
-- Después de hacer un INSERT, busca en los logs de la base de datos
-- Debe aparecer: "Trigger ejecutado para chapa: 816"

-- 2. Ver logs de la edge function
-- https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/functions/notify-new-jornal/logs
-- Debe aparecer: "📋 Nuevo jornal detectado"

-- 3. Ver logs de Vercel
-- https://vercel.com/portalestiba-push-backend-one/deployments
-- Debe aparecer llamadas a /api/push/notify-new-hire

-- 4. Si la edge function NO recibe llamadas:
-- El problema está en el trigger (pg_net no está funcionando)

-- 5. Si la edge function SÍ recibe llamadas pero no llega al backend:
-- El problema está en la edge function

-- 6. Si el backend SÍ recibe llamadas pero no llega la notificación:
-- El problema está en FCM o en la suscripción

-- ============================================================================
-- LIMPIEZA DE JORNALES DE PRUEBA
-- ============================================================================

-- Después de probar, elimina los jornales de prueba
-- DELETE FROM jornales WHERE buque LIKE '%PRUEBA%';

-- ============================================================================
-- ÉXITO
-- ============================================================================

-- Si ves esto en los logs de la edge function después del INSERT:
-- ✅ Nuevo jornal detectado: { chapa: '816', ... }
-- ✅ Notificación enviada exitosamente a chapa 816

-- Entonces el sistema está funcionando correctamente.

SELECT 'Sistema de notificaciones configurado correctamente' as status;
