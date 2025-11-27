-- ============================================================================
-- CONFIGURACIÓN DE NOTIFICACIONES DE NUEVOS JORNALES
-- ============================================================================
-- Este script configura un webhook que se dispara cada vez que se inserta
-- un nuevo jornal en la tabla 'jornales', enviando una notificación push
-- al usuario contratado.
--
-- PREREQUISITOS:
-- 1. Edge Function 'notify-new-jornal' debe estar desplegada en Supabase
-- 2. Backend de push debe estar funcionando en Vercel
-- 3. Usuario debe tener suscripción activa en 'push_subscriptions'
--
-- INSTRUCCIONES DE DESPLIEGUE:
-- 1. Desplegar la edge function:
--    supabase functions deploy notify-new-jornal
--
-- 2. Ejecutar este script en el SQL Editor de Supabase
--
-- 3. Verificar que el webhook esté configurado:
--    SELECT * FROM supabase_functions.hooks;
-- ============================================================================

-- Habilitar la extensión http si no está habilitada (para llamar edge functions)
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Crear función que se ejecutará cuando se inserte un nuevo jornal
CREATE OR REPLACE FUNCTION notify_new_jornal_trigger()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
  project_url text := current_setting('app.settings.supabase_url', true);
  service_role_key text := current_setting('app.settings.service_role_key', true);
BEGIN
  -- Llamar a la Edge Function de Supabase
  -- IMPORTANTE: Reemplaza 'icszzxkdxatfytpmoviq' con tu Project ID real
  SELECT http_post(
    url := project_url || '/functions/v1/notify-new-jornal',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'jornales',
      'record', row_to_json(NEW)
    )
  ) INTO request_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar trigger anterior si existe
DROP TRIGGER IF EXISTS on_jornal_inserted ON jornales;

-- Crear trigger que se dispara DESPUÉS de cada INSERT en la tabla jornales
CREATE TRIGGER on_jornal_inserted
  AFTER INSERT ON jornales
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_jornal_trigger();

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Ver todos los triggers configurados
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_jornal_inserted';

-- ============================================================================
-- TESTING
-- ============================================================================

-- Para probar el sistema, inserta un jornal de prueba (reemplaza con chapa real):
/*
INSERT INTO jornales (chapa, fecha, jornada, trabajo, sueldo)
VALUES ('12345', CURRENT_DATE, '08-14', 'Grúa', 100.00);
*/

-- Verificar en logs de la Edge Function si se envió la notificación:
-- https://supabase.com/dashboard/project/[PROJECT-ID]/functions/notify-new-jornal/logs

-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================

-- Si no funcionan las notificaciones:
-- 1. Verificar que la edge function esté desplegada
-- 2. Verificar logs de la edge function
-- 3. Verificar que el usuario tenga suscripción activa:
/*
SELECT * FROM push_subscriptions WHERE user_chapa = '12345';
*/

-- 4. Verificar que el backend de Vercel esté funcionando:
/*
curl -X POST https://portalestiba-push-backend-one.vercel.app/api/push/notify-new-hire \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","body":"Test message","url":"/jornales","chapa_target":"12345"}'
*/

-- Para deshabilitar las notificaciones (si es necesario):
/*
DROP TRIGGER IF EXISTS on_jornal_inserted ON jornales;
*/
