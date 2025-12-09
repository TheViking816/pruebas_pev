-- ============================================================================
-- SISTEMA DE ACTUALIZACIÓN AUTOMÁTICA DE ESTADOS PREMIUM
-- ============================================================================
-- Este script añade funcionalidad para actualizar automáticamente los estados
-- de las suscripciones cuando expiran
-- ============================================================================

-- ============================================================================
-- 1. FUNCIÓN PARA ACTUALIZAR ESTADOS EXPIRADOS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.actualizar_estados_premium_expirados()
RETURNS TABLE(
  chapas_actualizadas TEXT[],
  total_actualizados INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_chapas TEXT[];
  v_count INTEGER;
BEGIN
  -- Actualizar suscripciones que tienen estado active/trialing pero ya expiraron
  WITH actualizados AS (
    UPDATE public.usuarios_premium
    SET
      estado = 'expired',
      updated_at = NOW()
    WHERE estado IN ('active', 'trialing')
      AND periodo_fin IS NOT NULL
      AND periodo_fin <= NOW()
    RETURNING chapa
  )
  SELECT ARRAY_AGG(chapa), COUNT(*)
  INTO v_chapas, v_count
  FROM actualizados;

  -- Si no hay actualizaciones, retornar arrays vacíos
  IF v_chapas IS NULL THEN
    v_chapas := ARRAY[]::TEXT[];
    v_count := 0;
  END IF;

  RETURN QUERY SELECT v_chapas, v_count;
END;
$$;

COMMENT ON FUNCTION public.actualizar_estados_premium_expirados IS
  'Actualiza automáticamente los estados de suscripciones expiradas a "expired"';

-- ============================================================================
-- 2. MODIFICAR FUNCIÓN tiene_acceso_premium PARA ACTUALIZAR ESTADO
-- ============================================================================
-- Ahora también actualiza el estado si encuentra una suscripción expirada

CREATE OR REPLACE FUNCTION public.tiene_acceso_premium(chapa_usuario TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  es_premium BOOLEAN;
  v_estado VARCHAR(50);
  v_periodo_fin TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Obtener el estado actual y periodo_fin del usuario
  SELECT estado, periodo_fin
  INTO v_estado, v_periodo_fin
  FROM public.usuarios_premium
  WHERE chapa = chapa_usuario;

  -- Si no existe registro, no tiene premium
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Si el estado es active/trialing pero ya expiró, actualizar a expired
  IF v_estado IN ('active', 'trialing')
     AND v_periodo_fin IS NOT NULL
     AND v_periodo_fin <= NOW() THEN

    UPDATE public.usuarios_premium
    SET estado = 'expired', updated_at = NOW()
    WHERE chapa = chapa_usuario;

    RETURN FALSE;
  END IF;

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

COMMENT ON FUNCTION public.tiene_acceso_premium IS
  'Verifica si un usuario tiene suscripción premium activa y actualiza el estado si expiró';

-- ============================================================================
-- 3. MODIFICAR FUNCIÓN actualizar_suscripcion_desde_webhook
-- ============================================================================
-- Añadir lógica para detectar renovaciones y cancelaciones

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
DECLARE
  v_estado_anterior VARCHAR(50);
BEGIN
  -- Obtener estado anterior si existe
  SELECT estado INTO v_estado_anterior
  FROM public.usuarios_premium
  WHERE chapa = p_chapa;

  -- Si el estado cambia de canceled/expired a active, limpiar cancelado_at
  IF v_estado_anterior IN ('canceled', 'expired') AND p_estado IN ('active', 'trialing') THEN
    -- Nueva suscripción o renovación
    INSERT INTO public.usuarios_premium (
      chapa,
      stripe_customer_id,
      stripe_subscription_id,
      stripe_price_id,
      estado,
      periodo_inicio,
      periodo_fin,
      updated_at,
      cancelado_at
    ) VALUES (
      p_chapa,
      p_stripe_customer_id,
      p_stripe_subscription_id,
      p_stripe_price_id,
      p_estado,
      p_periodo_inicio,
      p_periodo_fin,
      NOW(),
      NULL  -- Limpiar cancelado_at en renovación
    )
    ON CONFLICT (chapa) DO UPDATE SET
      stripe_customer_id = EXCLUDED.stripe_customer_id,
      stripe_subscription_id = EXCLUDED.stripe_subscription_id,
      stripe_price_id = EXCLUDED.stripe_price_id,
      estado = EXCLUDED.estado,
      periodo_inicio = EXCLUDED.periodo_inicio,
      periodo_fin = EXCLUDED.periodo_fin,
      updated_at = NOW(),
      cancelado_at = NULL;

  -- Si el estado es canceled, marcar cancelado_at
  ELSIF p_estado = 'canceled' THEN
    INSERT INTO public.usuarios_premium (
      chapa,
      stripe_customer_id,
      stripe_subscription_id,
      stripe_price_id,
      estado,
      periodo_inicio,
      periodo_fin,
      updated_at,
      cancelado_at
    ) VALUES (
      p_chapa,
      p_stripe_customer_id,
      p_stripe_subscription_id,
      p_stripe_price_id,
      p_estado,
      p_periodo_inicio,
      p_periodo_fin,
      NOW(),
      NOW()  -- Marcar cuando fue cancelado
    )
    ON CONFLICT (chapa) DO UPDATE SET
      stripe_customer_id = EXCLUDED.stripe_customer_id,
      stripe_subscription_id = EXCLUDED.stripe_subscription_id,
      stripe_price_id = EXCLUDED.stripe_price_id,
      estado = EXCLUDED.estado,
      periodo_inicio = EXCLUDED.periodo_inicio,
      periodo_fin = EXCLUDED.periodo_fin,
      updated_at = NOW(),
      cancelado_at = COALESCE(usuarios_premium.cancelado_at, NOW());

  -- Actualización normal
  ELSE
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
  END IF;
END;
$$;

COMMENT ON FUNCTION public.actualizar_suscripcion_desde_webhook IS
  'Actualiza la suscripción de un usuario desde un webhook de Stripe con lógica de renovación y cancelación';

-- ============================================================================
-- 4. EJECUTAR ACTUALIZACIÓN INICIAL DE ESTADOS EXPIRADOS
-- ============================================================================

-- Ejecutar la función para actualizar todos los estados expirados actuales
SELECT * FROM public.actualizar_estados_premium_expirados();

-- ============================================================================
-- 5. CONFIGURAR pg_cron PARA EJECUCIÓN AUTOMÁTICA
-- ============================================================================
-- NOTA: Esto requiere habilitar la extensión pg_cron en Supabase
-- Dashboard > Database > Extensions > Buscar "pg_cron" > Enable

-- Primero, habilitar la extensión (ejecutar solo una vez)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Programar ejecución diaria a las 00:05 (5 minutos después de medianoche)
-- Esto actualiza todos los estados expirados automáticamente
SELECT cron.schedule(
  'actualizar-estados-premium-diario',  -- Nombre del job
  '5 0 * * *',                          -- Cron: cada día a las 00:05
  $$SELECT actualizar_estados_premium_expirados();$$
);

-- OPCIONAL: También ejecutar cada hora para mayor precisión
-- Descomentar si quieres actualizaciones más frecuentes
/*
SELECT cron.schedule(
  'actualizar-estados-premium-horario',
  '0 * * * *',  -- Cada hora en punto
  $$SELECT actualizar_estados_premium_expirados();$$
);
*/

-- ============================================================================
-- 6. FUNCIONES ÚTILES DE ADMINISTRACIÓN
-- ============================================================================

-- Ver jobs programados de cron
-- SELECT * FROM cron.job;

-- Desactivar un job (si es necesario)
-- SELECT cron.unschedule('actualizar-estados-premium-diario');

-- Ver historial de ejecuciones de cron
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================

-- Verificar resultado
DO $$
DECLARE
  total_expirados INT;
BEGIN
  SELECT COUNT(*) INTO total_expirados
  FROM public.usuarios_premium
  WHERE estado = 'expired';

  RAISE NOTICE '✅ Sistema de actualización automática configurado';
  RAISE NOTICE '📊 Estados expirados actuales: %', total_expirados;
  RAISE NOTICE '⏰ Cron job programado para ejecutarse diariamente a las 00:05';
END $$;
