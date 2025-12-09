-- ============================================================================
-- ARREGLAR FEATURES_DISPONIBLES EN WEBHOOK
-- ============================================================================
-- El problema: cuando el webhook guarda la suscripción, features_disponibles queda []
-- La solución: modificar la función RPC para que siempre establezca las features
-- ============================================================================

-- PASO 1: Actualizar la función RPC para incluir features por defecto
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
  v_features TEXT[] := ARRAY['sueldometro', 'oraculo', 'chatbot_ia'];
BEGIN
  -- Log para debugging
  RAISE NOTICE 'Actualizando suscripción para chapa: %', p_chapa;

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
      features_disponibles,
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
      v_features,
      NOW(),
      NULL
    )
    ON CONFLICT (chapa) DO UPDATE SET
      stripe_customer_id = EXCLUDED.stripe_customer_id,
      stripe_subscription_id = EXCLUDED.stripe_subscription_id,
      stripe_price_id = EXCLUDED.stripe_price_id,
      estado = EXCLUDED.estado,
      periodo_inicio = EXCLUDED.periodo_inicio,
      periodo_fin = EXCLUDED.periodo_fin,
      features_disponibles = v_features,
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
      features_disponibles,
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
      v_features,
      NOW(),
      NOW()
    )
    ON CONFLICT (chapa) DO UPDATE SET
      stripe_customer_id = EXCLUDED.stripe_customer_id,
      stripe_subscription_id = EXCLUDED.stripe_subscription_id,
      stripe_price_id = EXCLUDED.stripe_price_id,
      estado = EXCLUDED.estado,
      periodo_inicio = EXCLUDED.periodo_inicio,
      periodo_fin = EXCLUDED.periodo_fin,
      features_disponibles = v_features,
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
      features_disponibles,
      updated_at
    ) VALUES (
      p_chapa,
      p_stripe_customer_id,
      p_stripe_subscription_id,
      p_stripe_price_id,
      p_estado,
      p_periodo_inicio,
      p_periodo_fin,
      v_features,
      NOW()
    )
    ON CONFLICT (chapa) DO UPDATE SET
      stripe_customer_id = EXCLUDED.stripe_customer_id,
      stripe_subscription_id = EXCLUDED.stripe_subscription_id,
      stripe_price_id = EXCLUDED.stripe_price_id,
      estado = EXCLUDED.estado,
      periodo_inicio = EXCLUDED.periodo_inicio,
      periodo_fin = EXCLUDED.periodo_fin,
      features_disponibles = v_features,
      updated_at = NOW();
  END IF;

  RAISE NOTICE 'Suscripción actualizada exitosamente para chapa: %', p_chapa;
END;
$$;

COMMENT ON FUNCTION public.actualizar_suscripcion_desde_webhook IS
  'Actualiza la suscripción de un usuario desde un webhook de Stripe con features por defecto';

-- ============================================================================
-- PASO 2: Arreglar la chapa 9999 que ya existe con features vacías
-- ============================================================================

UPDATE usuarios_premium
SET features_disponibles = ARRAY['sueldometro', 'oraculo', 'chatbot_ia']
WHERE chapa = '9999'
  AND (features_disponibles IS NULL OR features_disponibles = ARRAY[]::TEXT[]);

-- ============================================================================
-- PASO 3: Verificar que se arregló
-- ============================================================================

SELECT
  chapa,
  estado,
  features_disponibles,
  stripe_customer_id,
  periodo_fin
FROM usuarios_premium
WHERE chapa = '9999';

-- Debería mostrar:
-- features_disponibles: ["sueldometro", "oraculo", "chatbot_ia"]

-- ============================================================================
-- BONUS: Arreglar TODAS las chapas que tengan features vacías
-- ============================================================================

UPDATE usuarios_premium
SET features_disponibles = ARRAY['sueldometro', 'oraculo', 'chatbot_ia']
WHERE estado IN ('active', 'trialing')
  AND (features_disponibles IS NULL OR features_disponibles = ARRAY[]::TEXT[]);

-- Ver cuántas se actualizaron
SELECT
  COUNT(*) as total_arregladas
FROM usuarios_premium
WHERE estado IN ('active', 'trialing')
  AND features_disponibles = ARRAY['sueldometro', 'oraculo', 'chatbot_ia'];
