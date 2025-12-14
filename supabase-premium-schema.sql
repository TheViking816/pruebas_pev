-- ============================================================================
-- PORTAL ESTIBA VLC - ESQUEMA PREMIUM CON STRIPE
-- ============================================================================
-- Este script añade las tablas y funciones necesarias para el sistema freemium
-- Ejecutar en: Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- LIMPIAR OBJETOS ANTERIORES (SI EXISTEN)
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
DROP TABLE IF EXISTS public.usuarios_premium;

-- ============================================================================
-- 1. TABLA USUARIOS_PREMIUM
-- ============================================================================
-- Almacena las suscripciones premium de los usuarios
CREATE TABLE public.usuarios_premium (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapa TEXT NOT NULL UNIQUE,

  -- Información de Stripe
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,

  -- Estado de la suscripción
  estado VARCHAR(50) DEFAULT 'active', -- 'active', 'canceled', 'past_due', 'trialing'
  periodo_inicio TIMESTAMP WITH TIME ZONE,
  periodo_fin TIMESTAMP WITH TIME ZONE,

  -- Features premium disponibles
  features_disponibles TEXT[] DEFAULT ARRAY['sueldometro', 'oraculo', 'chatbot_ia'],

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cancelado_at TIMESTAMP WITH TIME ZONE
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_usuarios_premium_chapa ON public.usuarios_premium(chapa);
CREATE INDEX IF NOT EXISTS idx_usuarios_premium_stripe_customer ON public.usuarios_premium(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_premium_estado ON public.usuarios_premium(estado);

COMMENT ON TABLE public.usuarios_premium IS 'Almacena las suscripciones premium de usuarios con integración a Stripe';

-- ============================================================================
-- 2. FUNCIONES RPC PARA VERIFICACIÓN PREMIUM
-- ============================================================================

-- Función: Verificar si un usuario tiene acceso premium activo
CREATE OR REPLACE FUNCTION public.tiene_acceso_premium(chapa_usuario TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  es_premium BOOLEAN;
BEGIN
  -- Verificar si el usuario tiene suscripción activa y vigente
  SELECT EXISTS (
    SELECT 1
    FROM public.usuarios_premium
    WHERE chapa = chapa_usuario
      AND estado IN ('active', 'trialing')
      AND (periodo_fin IS NULL OR periodo_fin > NOW())
  ) INTO es_premium;

  RETURN es_premium;
END;
$$;

COMMENT ON FUNCTION public.tiene_acceso_premium IS 'Verifica si un usuario tiene suscripción premium activa';

-- Función: Verificar acceso a un feature específico
CREATE OR REPLACE FUNCTION public.tiene_acceso_feature(
  chapa_usuario TEXT,
  nombre_feature TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tiene_acceso BOOLEAN;
BEGIN
  -- Primero verificar si tiene premium activo
  IF NOT public.tiene_acceso_premium(chapa_usuario) THEN
    RETURN FALSE;
  END IF;

  -- Verificar si el feature está en su lista de features disponibles
  SELECT EXISTS (
    SELECT 1
    FROM public.usuarios_premium
    WHERE chapa = chapa_usuario
      AND nombre_feature = ANY(features_disponibles)
  ) INTO tiene_acceso;

  RETURN tiene_acceso;
END;
$$;

COMMENT ON FUNCTION public.tiene_acceso_feature IS 'Verifica si un usuario tiene acceso a un feature premium específico';

-- ============================================================================
-- 3. FUNCIÓN PARA ACTUALIZAR SUSCRIPCIÓN DESDE STRIPE WEBHOOK
-- ============================================================================

CREATE OR REPLACE FUNCTION public.actualizar_suscripcion_desde_webhook(
  p_chapa TEXT,
  p_stripe_customer_id TEXT,
  p_stripe_subscription_id TEXT,
  p_stripe_price_id TEXT,
  p_estado VARCHAR(50),
  p_periodo_inicio TIMESTAMP WITH TIME ZONE,
  p_periodo_fin TIMESTAMP WITH TIME ZONE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insertar o actualizar la suscripción
  INSERT INTO public.usuarios_premium (
    chapa,
    stripe_customer_id,
    stripe_subscription_id,
    stripe_price_id,
    estado,
    periodo_inicio,
    periodo_fin,
    updated_at
  ) VALUES (
    p_chapa,
    p_stripe_customer_id,
    p_stripe_subscription_id,
    p_stripe_price_id,
    p_estado,
    p_periodo_inicio,
    p_periodo_fin,
    NOW()
  )
  ON CONFLICT (chapa) DO UPDATE SET
    stripe_customer_id = EXCLUDED.stripe_customer_id,
    stripe_subscription_id = EXCLUDED.stripe_subscription_id,
    stripe_price_id = EXCLUDED.stripe_price_id,
    estado = EXCLUDED.estado,
    periodo_inicio = EXCLUDED.periodo_inicio,
    periodo_fin = EXCLUDED.periodo_fin,
    updated_at = NOW();
END;
$$;

COMMENT ON FUNCTION public.actualizar_suscripcion_desde_webhook IS 'Actualiza la suscripción de un usuario desde un webhook de Stripe';

-- ============================================================================
-- 4. TRIGGER PARA ACTUALIZAR TIMESTAMP
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_usuarios_premium_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_usuarios_premium_timestamp ON public.usuarios_premium;
CREATE TRIGGER trigger_update_usuarios_premium_timestamp
  BEFORE UPDATE ON public.usuarios_premium
  FOR EACH ROW
  EXECUTE FUNCTION public.update_usuarios_premium_timestamp();

-- ============================================================================
-- 5. PERMISOS RLS (Row Level Security)
-- ============================================================================

-- Habilitar RLS en la tabla
ALTER TABLE public.usuarios_premium ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver solo su propia suscripción
DROP POLICY IF EXISTS "Usuarios pueden ver su propia suscripción" ON public.usuarios_premium;
CREATE POLICY "Usuarios pueden ver su propia suscripción"
  ON public.usuarios_premium
  FOR SELECT
  USING (auth.jwt() ->> 'chapa' = chapa);

-- Política: Solo el sistema puede insertar/actualizar (a través de service_role)
DROP POLICY IF EXISTS "Solo service_role puede modificar suscripciones" ON public.usuarios_premium;
CREATE POLICY "Solo service_role puede modificar suscripciones"
  ON public.usuarios_premium
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- 6. DATOS INICIALES: PERÍODO DE GRACIA HASTA 1 ENERO 2026
-- ============================================================================
-- Este script da acceso premium gratuito a todos los usuarios hasta el 1 de enero de 2026
-- EJECUTAR DESPUÉS DE CREAR LAS TABLAS

-- Insertar suscripción gratuita para todos los usuarios existentes en la tabla censo
INSERT INTO public.usuarios_premium (
  chapa,
  estado,
  periodo_inicio,
  periodo_fin,
  features_disponibles
)
SELECT DISTINCT
  c.chapa,
  'trialing' AS estado,
  NOW() AS periodo_inicio,
  '2026-01-01 00:00:00+00'::TIMESTAMP WITH TIME ZONE AS periodo_fin,
  ARRAY['sueldometro', 'oraculo', 'chatbot_ia'] AS features_disponibles
FROM public.censo c
WHERE c.chapa IS NOT NULL
  AND c.chapa != ''
  AND NOT EXISTS (
    SELECT 1 FROM public.usuarios_premium up WHERE up.chapa = c.chapa
  )
ON CONFLICT (chapa) DO NOTHING;

-- Mensaje de confirmación
DO $$
DECLARE
  total_usuarios INT;
BEGIN
  SELECT COUNT(*) INTO total_usuarios FROM public.usuarios_premium WHERE estado = 'trialing';
  RAISE NOTICE 'Se han configurado % usuarios con acceso premium gratuito hasta el 1 de enero de 2026', total_usuarios;
END $$;

-- ============================================================================
-- 7. VISTAS ÚTILES
-- ============================================================================

-- Vista: Resumen de suscripciones premium
CREATE OR REPLACE VIEW public.v_resumen_premium AS
SELECT
  COUNT(*) AS total_suscripciones,
  COUNT(*) FILTER (WHERE estado = 'active') AS activas,
  COUNT(*) FILTER (WHERE estado = 'trialing') AS en_prueba,
  COUNT(*) FILTER (WHERE estado = 'canceled') AS canceladas,
  COUNT(*) FILTER (WHERE periodo_fin > NOW()) AS vigentes
FROM public.usuarios_premium;

COMMENT ON VIEW public.v_resumen_premium IS 'Resumen de suscripciones premium por estado';

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================

-- Verificar creación de tablas
SELECT
  'Tabla usuarios_premium creada' AS mensaje,
  COUNT(*) AS total_registros
FROM public.usuarios_premium;
