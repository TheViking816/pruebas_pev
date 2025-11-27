-- ============================================================================
-- VERIFICAR QUE EL WEBHOOK FUNCIONA
-- ============================================================================

-- 1. Ver si tienes suscripción activa
SELECT
  user_chapa,
  endpoint,
  created_at
FROM push_subscriptions
WHERE user_chapa = '816';

-- DEBE aparecer 1 fila con endpoint que empiece con https://fcm.googleapis.com
-- Si NO aparece, el problema es que NO tienes suscripción activa

-- 2. Ver último jornal insertado
SELECT id, chapa, fecha, jornada, puesto, buque, updated_at
FROM jornales
WHERE chapa = '816'
ORDER BY id DESC
LIMIT 1;

-- 3. Insertar jornal de prueba AHORA
INSERT INTO jornales (chapa, fecha, jornada, puesto, empresa, buque, parte, origen)
VALUES ('816', CURRENT_DATE, '20 a 02', 'PRUEBA VERIFICACION', 'MSC', 'TEST AHORA', '999', 'https://test.com')
RETURNING id, chapa, jornada;

-- Después de ejecutar este INSERT:
-- 1. Ve a: https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/database/hooks
-- 2. Click en tu webhook "notify-jornal-insert"
-- 3. Ve a la pestaña "Logs" o "History"
-- 4. Debe aparecer una petición con status 200

-- Si NO aparece ninguna petición en los logs del webhook:
-- → El webhook NO está configurado correctamente

-- Si SÍ aparece petición con status 200:
-- → El webhook funciona, hay que ver logs de edge function

-- Si aparece petición con status 4xx o 5xx:
-- → Ver el mensaje de error
