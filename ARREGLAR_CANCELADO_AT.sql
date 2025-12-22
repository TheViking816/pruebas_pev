-- ============================================================================
-- ARREGLAR CAMPO cancelado_at EN CANCELACIONES
-- ============================================================================
-- Problema: Cuando se cancela una suscripción, el campo cancelado_at no se actualiza
-- Solución: Actualizar la función RPC para que llene cancelado_at cuando estado = 'canceled'
-- ============================================================================

-- Actualizar la función RPC
DROP FUNCTION IF EXISTS public.actualizar_suscripcion_desde_webhook(TEXT, TEXT, TEXT, TEXT, VARCHAR(50), TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE);

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
  v_features TEXT[] := ARRAY['sueldometro', 'oraculo', 'chatbot_ia', 'buscador_historico'];
  v_cancelado_at TIMESTAMP WITH TIME ZONE := NULL;
BEGIN
  -- Si el estado es 'canceled', marcar la fecha de cancelación
  IF p_estado = 'canceled' THEN
    v_cancelado_at := NOW();
  END IF;

  -- Si el estado cambia de 'canceled' a 'active' o 'trialing', limpiar cancelado_at
  IF p_estado IN ('active', 'trialing') THEN
    v_cancelado_at := NULL;
  END IF;

  -- Insertar o actualizar la suscripción
  INSERT INTO public.usuarios_premium (
    chapa,
    stripe_customer_id,
    stripe_subscription_id,
    stripe_price_id,
    estado,
    periodo_inicio,
    periodo_fin,
    features_disponibles,
    cancelado_at,  -- ✅ AÑADIDO
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
    v_cancelado_at,  -- ✅ AÑADIDO
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
    cancelado_at = v_cancelado_at,  -- ✅ AÑADIDO
    updated_at = NOW();

  RAISE NOTICE 'Usuario % actualizado: estado=%, cancelado_at=%', p_chapa, p_estado, v_cancelado_at;
END;
$$;

COMMENT ON FUNCTION public.actualizar_suscripcion_desde_webhook IS
'Actualiza la suscripción desde webhook de Stripe (incluye cancelado_at cuando estado=canceled)';

-- ============================================================================
-- VERIFICAR SUSCRIPCIONES CANCELADAS
-- ============================================================================

-- Ver suscripciones canceladas (debería tener cancelado_at lleno)
SELECT
  chapa,
  estado,
  cancelado_at,
  periodo_fin,
  features_disponibles
FROM public.usuarios_premium
WHERE estado = 'canceled';

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================

/*
COMPORTAMIENTO ESPERADO:

1. Cuando Stripe cancela una suscripción:
   - Envía webhook 'customer.subscription.deleted'
   - Backend llama a actualizar_suscripcion_desde_webhook con estado='canceled'
   - La función ahora actualiza cancelado_at = NOW()

2. El campo cancelado_at se usará para:
   - Saber cuándo se canceló exactamente
   - Mostrar al usuario que su suscripción está cancelada
   - Análisis de métricas (churn rate, etc.)

3. Si la suscripción se reactiva:
   - Estado cambia a 'active' o 'trialing'
   - cancelado_at se limpia (vuelve a NULL)

PRÓXIMOS PASOS:
- Ejecutar este SQL en Supabase
- Próxima cancelación llenará cancelado_at automáticamente
- Para la chapa 816 actual: como está 'active', cancelado_at=NULL es correcto
  (la cancelación está programada para el 22/01/2026, pero aún no ha ocurrido)
*/
