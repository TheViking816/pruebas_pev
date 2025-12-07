-- Migración: Añadir columna irpf_aplicado a la tabla jornales
-- Esta columna guardará el porcentaje de IRPF que se aplicó a cada jornal
-- para evitar que cambios futuros de IRPF afecten retroactivamente a jornales pasados

-- 1. Añadir la columna irpf_aplicado
ALTER TABLE jornales
ADD COLUMN IF NOT EXISTS irpf_aplicado numeric DEFAULT NULL;

-- 2. Comentario explicativo de la columna
COMMENT ON COLUMN jornales.irpf_aplicado IS
'Porcentaje de IRPF aplicado a este jornal en el momento de su cálculo. Si es NULL, se usa el IRPF actual del usuario.';

-- 3. Para jornales existentes que aún no tienen IRPF asignado, podemos opcionalmente
--    asignarles el IRPF actual del usuario (descomentar si se desea):
-- UPDATE jornales j
-- SET irpf_aplicado = (
--   SELECT irpf_porcentaje
--   FROM configuracion_usuario cu
--   WHERE cu.chapa = j.chapa
-- )
-- WHERE irpf_aplicado IS NULL;

-- Nota: La migración está diseñada para ser idempotente (se puede ejecutar múltiples veces)
