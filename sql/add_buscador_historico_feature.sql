-- ===========================================================================
-- AÑADIR FEATURE "buscador_historico" A SUSCRIPCIONES EXISTENTES
-- ===========================================================================
-- Ejecuta este script en tu panel de Supabase SQL Editor
-- para añadir el feature "buscador_historico" a todas las suscripciones activas
-- ===========================================================================

-- Paso 1: Actualizar suscripciones existentes para añadir buscador_historico
UPDATE suscripciones
SET features_disponibles = array_append(features_disponibles, 'buscador_historico')
WHERE 'buscador_historico' != ALL(features_disponibles)
  AND activo = true;

-- Paso 2: Verificar que se aplicó correctamente
SELECT
  chapa,
  features_disponibles,
  fecha_inicio,
  fecha_fin,
  activo
FROM suscripciones
WHERE activo = true
ORDER BY fecha_inicio DESC;

-- Paso 3 (OPCIONAL): Si quieres añadir el feature a TODAS las suscripciones (incluidas inactivas)
-- Descomenta las siguientes líneas:
/*
UPDATE suscripciones
SET features_disponibles = array_append(features_disponibles, 'buscador_historico')
WHERE 'buscador_historico' != ALL(features_disponibles);
*/

-- ===========================================================================
-- NOTAS IMPORTANTES:
-- ===========================================================================
-- 1. Este script solo actualiza suscripciones que NO tienen ya el feature
-- 2. La condición 'buscador_historico' != ALL(features_disponibles) evita duplicados
-- 3. Después de ejecutar, todas las suscripciones activas tendrán:
--    ["sueldometro", "oraculo", "chatbot_ia", "buscador_historico"]
-- ===========================================================================
