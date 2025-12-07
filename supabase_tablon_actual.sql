-- =========================================================================
-- Tabla para el Tablón de Contratación - Solo datos actuales del CSV
-- =========================================================================
-- Esta tabla NO acumula datos históricos, se sobrescribe con cada actualización
-- Contiene únicamente las contrataciones que están actualmente en el CSV de la empresa
-- =========================================================================

-- 1. Crear la tabla (si no existe)
CREATE TABLE IF NOT EXISTS public.tablon_actual (
  id BIGSERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  chapa TEXT NOT NULL,
  puesto TEXT NOT NULL,
  jornada TEXT NOT NULL,
  empresa TEXT NOT NULL,
  buque TEXT NOT NULL,
  parte TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_tablon_actual_fecha ON public.tablon_actual(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_tablon_actual_jornada ON public.tablon_actual(jornada);
CREATE INDEX IF NOT EXISTS idx_tablon_actual_empresa ON public.tablon_actual(empresa);
CREATE INDEX IF NOT EXISTS idx_tablon_actual_chapa ON public.tablon_actual(chapa);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.tablon_actual ENABLE ROW LEVEL SECURITY;

-- 4. Política para lectura pública (cualquiera puede leer)
CREATE POLICY "Enable read access for all users"
ON public.tablon_actual
FOR SELECT
USING (true);

-- 5. Política para escritura (solo usuarios autenticados o servicio)
-- IMPORTANTE: Ajusta esto según tu configuración de autenticación
CREATE POLICY "Enable insert for authenticated users only"
ON public.tablon_actual
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only"
ON public.tablon_actual
FOR DELETE
USING (true);

-- =========================================================================
-- VERIFICACIÓN: Ver la estructura de la tabla
-- =========================================================================
\d public.tablon_actual

-- =========================================================================
-- CONSULTA DE PRUEBA: Ver si hay datos
-- =========================================================================
SELECT
  COUNT(*) as total,
  COUNT(DISTINCT fecha) as fechas_distintas,
  COUNT(DISTINCT jornada) as jornadas_distintas,
  MAX(updated_at) as ultima_actualizacion
FROM public.tablon_actual;
