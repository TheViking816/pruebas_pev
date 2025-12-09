-- ============================================================================
-- VERIFICAR QUE LA FUNCIÓN RPC EXISTE EN SUPABASE
-- ============================================================================
-- Ejecuta este SQL en Supabase SQL Editor para verificar

-- 1. Ver si la función actualizar_suscripcion_desde_webhook existe
SELECT
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'actualizar_suscripcion_desde_webhook';

-- Si retorna una fila, la función existe ✅
-- Si retorna vacío, la función NO existe ❌ y hay que crearla

-- ============================================================================
-- SI LA FUNCIÓN NO EXISTE, EJECUTA ESTE SCRIPT PARA CREARLA
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
DECLARE
  v_estado_anterior VARCHAR(50);
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

  RAISE NOTICE 'Suscripción actualizada exitosamente para chapa: %', p_chapa;
END;
$$;

COMMENT ON FUNCTION public.actualizar_suscripcion_desde_webhook IS
  'Actualiza la suscripción de un usuario desde un webhook de Stripe con lógica de renovación y cancelación';

-- ============================================================================
-- PROBAR LA FUNCIÓN MANUALMENTE
-- ============================================================================

-- Simular lo que enviaría el webhook para chapa 9999
SELECT public.actualizar_suscripcion_desde_webhook(
  '9999',                                    -- chapa
  'cus_test_123',                           -- stripe_customer_id
  'sub_test_123',                           -- stripe_subscription_id
  'price_1SVccrFApc6nOGEvgrJJ1xBR',        -- stripe_price_id
  'active',                                  -- estado
  NOW(),                                     -- periodo_inicio
  NOW() + INTERVAL '1 month'                -- periodo_fin
);

-- Verificar que se guardó
SELECT * FROM usuarios_premium WHERE chapa = '9999';
