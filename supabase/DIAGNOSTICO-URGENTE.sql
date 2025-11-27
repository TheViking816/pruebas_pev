-- ============================================================================
-- DIAGNÓSTICO URGENTE - POR QUÉ NO FUNCIONAN LAS NOTIFICACIONES
-- ============================================================================

-- PASO 1: Verificar que el trigger existe
SELECT
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'jornales'
  AND trigger_name = 'on_jornal_inserted';

-- Debe aparecer 1 fila. Si no aparece, el trigger NO EXISTE.

-- PASO 2: Ver últimos jornales insertados
SELECT id, chapa, fecha, jornada, puesto, empresa, buque, updated_at
FROM jornales
WHERE chapa = '816'
ORDER BY id DESC
LIMIT 5;

-- PASO 3: Ver logs de Postgres (para ver si el trigger se ejecutó)
-- Esto mostrará los RAISE NOTICE del trigger
-- Ve a: https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/logs/postgres-logs
-- Busca: "Trigger ejecutado para chapa: 816"

-- PASO 4: Probar la función del trigger directamente
DO $$
DECLARE
  test_record jornales;
BEGIN
  -- Simular un nuevo jornal
  SELECT '999999'::bigint as id, '816' as chapa, CURRENT_DATE as fecha,
         '08-14' as jornada, 'Gruista TEST' as puesto, 'MSC' as empresa,
         'BUQUE TEST DIRECTO' as buque, '1' as parte, 'importacion' as origen,
         now() as updated_at
  INTO test_record;

  -- Llamar a la función manualmente
  RAISE NOTICE 'Llamando a notify_new_jornal_trigger manualmente...';

  -- Esto debería aparecer en los logs
END $$;

-- PASO 5: Verificar que pg_net está funcionando
-- Hacer una petición HTTP de prueba
SELECT net.http_post(
  url := 'https://httpbin.org/post',
  headers := '{"Content-Type": "application/json"}'::jsonb,
  body := '{"test": "prueba pg_net"}'::jsonb
) as request_id;

-- Si esto devuelve un número, pg_net funciona
-- Si da error, pg_net NO funciona

-- PASO 6: Ver estado de las peticiones HTTP de pg_net
SELECT
  id,
  url,
  status_code,
  error_msg,
  created
FROM net.http_request_queue
ORDER BY created DESC
LIMIT 10;

-- PASO 7: Verificar suscripción de chapa 816
SELECT
  user_chapa,
  endpoint,
  p256dh,
  auth,
  created_at
FROM push_subscriptions
WHERE user_chapa = '816';

-- Debe aparecer 1 fila con endpoint que empiece con https://fcm.googleapis.com

-- ============================================================================
-- RESULTADO DEL DIAGNÓSTICO
-- ============================================================================

-- SI el trigger existe (PASO 1) pero NO hay logs en edge function:
--   → El problema es pg_net NO está llamando a la URL
--   → Verificar PASO 5 y PASO 6

-- SI el trigger NO existe (PASO 1):
--   → Ejecutar de nuevo FIX-NOTIFICACIONES-AHORA.sql

-- SI pg_net da error (PASO 5):
--   → El problema es que pg_net no está configurado correctamente
--   → Contactar soporte de Supabase

-- SI http_request_queue muestra errores (PASO 6):
--   → Ver el error_msg para saber qué falla

-- ============================================================================
-- SOLUCIÓN ALTERNATIVA: WEBHOOK DIRECTO
-- ============================================================================

-- Si pg_net no funciona, podemos usar un webhook de Supabase directamente
-- Ve a: https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/database/hooks

-- Crear webhook nuevo:
-- Table: jornales
-- Event: INSERT
-- Type: HTTP Request
-- Method: POST
-- URL: https://icszzxkdxatfytpmoviq.supabase.co/functions/v1/notify-new-jornal
-- Headers:
--   Content-Type: application/json
--   Authorization: Bearer [SERVICE_ROLE_KEY]
-- Payload:
--   {"type":"INSERT","table":"jornales","record":{{ record }}}
