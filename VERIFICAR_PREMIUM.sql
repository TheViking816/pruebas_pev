-- ============================================================================
-- SCRIPT PARA VERIFICAR SISTEMA PREMIUM
-- ============================================================================
-- Ejecuta estos queries en Supabase SQL Editor para diagnosticar problemas
-- ============================================================================

-- 1. Ver usuarios premium y sus estados
SELECT
  chapa,
  estado,
  periodo_inicio::date as inicio,
  periodo_fin::date as fin,
  features_disponibles,
  CASE
    WHEN periodo_fin > NOW() THEN '✅ Vigente'
    WHEN periodo_fin <= NOW() THEN '❌ Expirado'
    ELSE '⚠️ Sin fecha fin'
  END as vigencia
FROM public.usuarios_premium
LIMIT 10;

-- 2. Verificar función tiene_acceso_premium con un chapa específico
-- REEMPLAZA '115' con cualquier chapa de tu tabla
SELECT public.tiene_acceso_premium('115') as tiene_acceso;

-- 3. Verificar función tiene_acceso_feature con un chapa específico
-- REEMPLAZA '115' con cualquier chapa de tu tabla
SELECT
  public.tiene_acceso_feature('115', 'sueldometro') as sueldometro,
  public.tiene_acceso_feature('115', 'oraculo') as oraculo,
  public.tiene_acceso_feature('115', 'chatbot_ia') as chatbot;

-- 4. Ver resumen de estados
SELECT
  estado,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE periodo_fin > NOW()) as vigentes,
  COUNT(*) FILTER (WHERE periodo_fin <= NOW()) as expirados
FROM public.usuarios_premium
GROUP BY estado;

-- 5. Ver usuarios que deberían tener acceso ahora mismo
SELECT
  COUNT(*) as usuarios_con_acceso_ahora
FROM public.usuarios_premium
WHERE estado IN ('active', 'trialing')
  AND (periodo_fin IS NULL OR periodo_fin > NOW());

-- 6. Verificar que la función RPC existe
SELECT
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%premium%'
ORDER BY routine_name;

-- ============================================================================
-- RESULTADOS ESPERADOS
-- ============================================================================
-- Query 2: Debería retornar TRUE si el usuario tiene acceso
-- Query 3: Debería retornar TRUE para las 3 features
-- Query 5: Debería retornar 519 (todos tus usuarios)
-- Query 6: Debería mostrar 3 funciones:
--   - tiene_acceso_premium
--   - tiene_acceso_feature
--   - actualizar_suscripcion_desde_webhook
-- ============================================================================
