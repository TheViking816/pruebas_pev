-- ============================================================================
-- FIX URGENTE: Error de URL en pg_net
-- ============================================================================
-- El error "URL using bad/illegal format" indica que pg_net no puede
-- construir la URL correctamente. Vamos a simplificar el trigger.
-- ============================================================================

-- Eliminar trigger y función actual
DROP TRIGGER IF EXISTS on_jornal_inserted ON jornales;
DROP FUNCTION IF EXISTS notify_new_jornal_trigger() CASCADE;

-- ============================================================================
-- RECREAR FUNCIÓN CON URL HARDCODEADA (no construida)
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_new_jornal_trigger()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
BEGIN
  -- Log inicial
  RAISE NOTICE 'Trigger disparado para chapa: %', NEW.chapa;

  -- Llamar a la Edge Function con URL hardcodeada
  SELECT net.http_post(
    url := 'https://icszzxkdxatfytpmoviq.supabase.co/functions/v1/notify-new-jornal',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imljc3p6eGtkeGF0Znl0cG1vdmlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjYzOTY2NSwiZXhwIjoyMDc4MjE1NjY1fQ.LnNbC1ndNvSTSlwYYbcZwXM3iF30IqB5m6mII7IA50I"}'::jsonb,
    body := json_build_object(
      'type', 'INSERT',
      'table', 'jornales',
      'record', row_to_json(NEW)
    )::jsonb
  ) INTO request_id;

  RAISE NOTICE 'Request ID: %, Chapa: %', request_id, NEW.chapa;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error en trigger: %, SQLSTATE: %', SQLERRM, SQLSTATE;
  RETURN NEW; -- No bloquear el INSERT aunque falle la notificación
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RECREAR TRIGGER
-- ============================================================================

CREATE TRIGGER on_jornal_inserted
  AFTER INSERT ON jornales
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_jornal_trigger();

-- ============================================================================
-- VERIFICAR
-- ============================================================================

SELECT trigger_name FROM information_schema.triggers
WHERE event_object_table = 'jornales' AND trigger_name = 'on_jornal_inserted';

-- ============================================================================
-- PRUEBA CON FORMATO CORRECTO DE JORNADA
-- ============================================================================

-- IMPORTANTE: El formato es "14 a 20" NO "14-20"
INSERT INTO jornales (chapa, fecha, jornada, puesto, empresa, buque, parte, origen)
VALUES ('816', CURRENT_DATE, '20 a 02', 'Gruista FIX', 'MSC', 'TEST URL FIX', '888', 'https://test.com');

-- Ver si se ejecutó
SELECT
  id,
  url,
  status_code,
  error_msg,
  created
FROM net.http_request_queue
ORDER BY created DESC
LIMIT 5;

-- Si status_code es NULL y error_msg tiene algo, hay un problema
-- Si status_code es 200, funcionó perfectamente
