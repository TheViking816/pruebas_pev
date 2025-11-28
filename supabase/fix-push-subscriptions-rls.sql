-- ============================================================================
-- FIX: Políticas RLS incorrectas en push_subscriptions
-- ============================================================================
-- El error "column chapa does not exist" ocurre porque las políticas RLS
-- están usando 'chapa' en lugar de 'user_chapa'
-- ============================================================================

-- Paso 1: Ver las políticas actuales
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'push_subscriptions';

-- Paso 2: Eliminar todas las políticas incorrectas
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Users can delete their own subscriptions" ON push_subscriptions;
DROP POLICY IF EXISTS "Enable read access for all users" ON push_subscriptions;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON push_subscriptions;
DROP POLICY IF EXISTS "Enable update for users based on chapa" ON push_subscriptions;
DROP POLICY IF EXISTS "Enable delete for users based on chapa" ON push_subscriptions;

-- Paso 3: Crear políticas correctas usando 'user_chapa'
CREATE POLICY "Users can view their own subscriptions"
  ON push_subscriptions
  FOR SELECT
  USING (user_chapa = current_setting('request.jwt.claims', true)::json->>'chapa');

CREATE POLICY "Users can insert their own subscriptions"
  ON push_subscriptions
  FOR INSERT
  WITH CHECK (user_chapa = current_setting('request.jwt.claims', true)::json->>'chapa');

CREATE POLICY "Users can update their own subscriptions"
  ON push_subscriptions
  FOR UPDATE
  USING (user_chapa = current_setting('request.jwt.claims', true)::json->>'chapa');

CREATE POLICY "Users can delete their own subscriptions"
  ON push_subscriptions
  FOR DELETE
  USING (user_chapa = current_setting('request.jwt.claims', true)::json->>'chapa');

-- Paso 4: Asegurar que RLS esté habilitado
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Paso 5: Verificar las nuevas políticas
SELECT
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'push_subscriptions';

-- ============================================================================
-- NOTA: Si prefieres deshabilitar RLS temporalmente para debugging:
-- ALTER TABLE push_subscriptions DISABLE ROW LEVEL SECURITY;
-- ============================================================================

SELECT 'Políticas RLS corregidas correctamente' as status;
