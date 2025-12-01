-- ============================================================================
-- LIMPIAR TABLA USUARIOS_PREMIUM Y OBJETOS RELACIONADOS
-- ============================================================================
-- Ejecuta esto ANTES de correr supabase-premium-schema.sql
-- ============================================================================

-- Eliminar políticas RLS si existen
DROP POLICY IF EXISTS "Usuarios pueden ver su propia suscripción" ON public.usuarios_premium;
DROP POLICY IF EXISTS "Solo service_role puede modificar suscripciones" ON public.usuarios_premium;

-- Eliminar triggers si existen
DROP TRIGGER IF EXISTS trigger_update_usuarios_premium_timestamp ON public.usuarios_premium;

-- Eliminar funciones si existen
DROP FUNCTION IF EXISTS public.update_usuarios_premium_timestamp();
DROP FUNCTION IF EXISTS public.actualizar_suscripcion_desde_webhook(TEXT, TEXT, TEXT, TEXT, VARCHAR, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE);
DROP FUNCTION IF EXISTS public.tiene_acceso_feature(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.tiene_acceso_premium(TEXT);

-- Eliminar vista si existe
DROP VIEW IF EXISTS public.v_resumen_premium;

-- Eliminar tabla si existe
DROP TABLE IF EXISTS public.usuarios_premium CASCADE;

-- Mensaje de confirmación
SELECT '✅ Tabla usuarios_premium y objetos relacionados eliminados correctamente' AS resultado;
