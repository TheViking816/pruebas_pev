-- ============================================================================
-- CORRECCIÓN URGENTE: Webhook y Features
-- ============================================================================
-- Problema:
-- 1. Estado "incomplete" cuando debería ser "active"
-- 2. Falta "buscador_historico" en features_disponibles
-- 3. Webhook no actualiza features
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PASO 1: Actualizar la función RPC para incluir features_disponibles
-- ----------------------------------------------------------------------------

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
    features_disponibles,  -- ✅ AÑADIDO
    updated_at
  ) VALUES (
    p_chapa,
    p_stripe_customer_id,
    p_stripe_subscription_id,
    p_stripe_price_id,
    p_estado,
    p_periodo_inicio,
    p_periodo_fin,
    v_features,  -- ✅ AÑADIDO: Asignar todas las features automáticamente
    NOW()
  )
  ON CONFLICT (chapa) DO UPDATE SET
    stripe_customer_id = EXCLUDED.stripe_customer_id,
    stripe_subscription_id = EXCLUDED.stripe_subscription_id,
    stripe_price_id = EXCLUDED.stripe_price_id,
    estado = EXCLUDED.estado,
    periodo_inicio = EXCLUDED.periodo_inicio,
    periodo_fin = EXCLUDED.periodo_fin,
    features_disponibles = v_features,  -- ✅ AÑADIDO: Actualizar features en cada webhook
    updated_at = NOW();

  RAISE NOTICE 'Usuario % actualizado con estado % y features %', p_chapa, p_estado, v_features;
END;
$$;

COMMENT ON FUNCTION public.actualizar_suscripcion_desde_webhook IS
'Actualiza la suscripción de un usuario desde un webhook de Stripe (incluye features completas)';

-- ----------------------------------------------------------------------------
-- PASO 2: Corregir MANUALMENTE la suscripción de chapa 816 (problema actual)
-- ----------------------------------------------------------------------------

-- Ver el estado actual en Stripe de la suscripción
-- (Debes verificar en Stripe Dashboard si el estado es "active")

-- Si en Stripe el estado es "active", ejecuta esto:
UPDATE public.usuarios_premium
SET
  estado = 'active',  -- Cambiar de incomplete a active
  features_disponibles = ARRAY['sueldometro', 'oraculo', 'chatbot_ia', 'buscador_historico'],  -- Añadir todas las features
  updated_at = NOW()
WHERE chapa = '816';

-- Verificar el cambio
SELECT
  chapa,
  estado,
  features_disponibles,
  stripe_subscription_id,
  periodo_inicio,
  periodo_fin
FROM public.usuarios_premium
WHERE chapa = '816';

-- ----------------------------------------------------------------------------
-- PASO 3: Corregir TODOS los usuarios que tengan el problema
-- ----------------------------------------------------------------------------

-- Ver cuántos usuarios tienen el problema (estado incomplete o features incompletas)
SELECT
  chapa,
  estado,
  features_disponibles,
  stripe_subscription_id
FROM public.usuarios_premium
WHERE
  estado = 'incomplete'
  OR NOT ('buscador_historico' = ANY(features_disponibles))
  OR array_length(features_disponibles, 1) < 4;

-- Si quieres corregirlos todos automáticamente:
UPDATE public.usuarios_premium
SET
  features_disponibles = ARRAY['sueldometro', 'oraculo', 'chatbot_ia', 'buscador_historico'],
  updated_at = NOW()
WHERE
  NOT ('buscador_historico' = ANY(features_disponibles))
  OR array_length(features_disponibles, 1) < 4;

-- ⚠️ IMPORTANTE: Solo cambiar 'incomplete' a 'active' si confirmaste en Stripe
-- que el pago se procesó correctamente
-- Verifica manualmente cada caso en: https://dashboard.stripe.com/subscriptions

-- ----------------------------------------------------------------------------
-- PASO 4: Verificar que todo está correcto
-- ----------------------------------------------------------------------------

-- Ver todas las suscripciones activas
SELECT
  chapa,
  estado,
  features_disponibles,
  array_length(features_disponibles, 1) as num_features,
  stripe_subscription_id,
  periodo_inicio,
  periodo_fin,
  created_at,
  updated_at
FROM public.usuarios_premium
WHERE estado IN ('active', 'trialing', 'incomplete')
ORDER BY updated_at DESC;

-- Verificar que el trial inicial también tenga todas las features
UPDATE public.usuarios_premium
SET features_disponibles = ARRAY['sueldometro', 'oraculo', 'chatbot_ia', 'buscador_historico']
WHERE estado = 'trialing'
  AND (
    NOT ('buscador_historico' = ANY(features_disponibles))
    OR array_length(features_disponibles, 1) < 4
  );

-- ============================================================================
-- NOTAS FINALES
-- ============================================================================

/*
IMPORTANTE: Después de ejecutar este SQL:

1. ✅ La función RPC ahora incluye automáticamente todas las features
2. ✅ El usuario 816 debería tener acceso completo
3. ✅ Futuros usuarios tendrán las 4 features automáticamente

SIGUIENTE PASO:
- Verificar en Stripe Dashboard el estado real de la suscripción sub_1ShDDJFApc6nOGEvAMlwAzcA
- Si está "active" en Stripe, el UPDATE de arriba es correcto
- Si está "incomplete" en Stripe, hay un problema con el pago que debes resolver en Stripe

ACTUALIZAR BACKEND:
- El webhook en BACKEND_FILES_TO_UPLOAD/api/stripe-webhook.js ya funciona bien
- Solo necesitaba actualizar la función RPC de Supabase (ya hecho arriba)

ACTUALIZAR DESCRIPCIÓN EN STRIPE:
- Ve a Stripe Dashboard > Products > Portal Estiba VLC Premium
- Edita la descripción para incluir:
  "Acceso completo a Sueldómetro, Oráculo, Chatbot IA y Buscador Histórico"
*/
