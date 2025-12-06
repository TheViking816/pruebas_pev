-- =====================================================
-- Tabla: calendario_pago
-- Descripción: Almacena los rangos de fechas de pago para cada quincena
-- =====================================================

CREATE TABLE IF NOT EXISTS calendario_pago (
  id BIGSERIAL PRIMARY KEY,

  -- Identificación del periodo
  anio INTEGER NOT NULL,
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  quincena INTEGER NOT NULL CHECK (quincena IN (1, 2)),

  -- Descripción legible del periodo
  periodo_descripcion TEXT NOT NULL,
  -- Ejemplo: "Primera quincena de enero", "Segunda quincena de enero"

  -- Rango de fechas de pago
  fecha_pago_inicio DATE NOT NULL,
  fecha_pago_fin DATE NOT NULL,

  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraint para evitar duplicados
  UNIQUE(anio, mes, quincena)
);

-- Índices para mejorar las consultas
CREATE INDEX IF NOT EXISTS idx_calendario_pago_periodo
ON calendario_pago(anio, mes, quincena);

CREATE INDEX IF NOT EXISTS idx_calendario_pago_fechas
ON calendario_pago(fecha_pago_inicio, fecha_pago_fin);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_calendario_pago_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_calendario_pago_updated_at
  BEFORE UPDATE ON calendario_pago
  FOR EACH ROW
  EXECUTE FUNCTION update_calendario_pago_updated_at();

-- =====================================================
-- Datos de ejemplo para 2025
-- =====================================================
-- Nota: Estos son rangos ejemplo. Ajusta según los datos reales del puerto.

-- Enero 2025
INSERT INTO calendario_pago (anio, mes, quincena, periodo_descripcion, fecha_pago_inicio, fecha_pago_fin)
VALUES
  (2024, 12, 2, 'Segunda quincena de diciembre 2024', '2025-01-05', '2025-01-07'),
  (2025, 1, 1, 'Primera quincena de enero', '2025-01-17', '2025-01-20');

-- Febrero 2025
INSERT INTO calendario_pago (anio, mes, quincena, periodo_descripcion, fecha_pago_inicio, fecha_pago_fin)
VALUES
  (2025, 1, 2, 'Segunda quincena de enero', '2025-02-05', '2025-02-07'),
  (2025, 2, 1, 'Primera quincena de febrero', '2025-02-17', '2025-02-19');

-- Marzo 2025
INSERT INTO calendario_pago (anio, mes, quincena, periodo_descripcion, fecha_pago_inicio, fecha_pago_fin)
VALUES
  (2025, 2, 2, 'Segunda quincena de febrero', '2025-03-05', '2025-03-07'),
  (2025, 3, 1, 'Primera quincena de marzo', '2025-03-17', '2025-03-20');

-- Abril 2025
INSERT INTO calendario_pago (anio, mes, quincena, periodo_descripcion, fecha_pago_inicio, fecha_pago_fin)
VALUES
  (2025, 3, 2, 'Segunda quincena de marzo', '2025-04-05', '2025-04-07'),
  (2025, 4, 1, 'Primera quincena de abril', '2025-04-17', '2025-04-21');

-- Mayo 2025
INSERT INTO calendario_pago (anio, mes, quincena, periodo_descripcion, fecha_pago_inicio, fecha_pago_fin)
VALUES
  (2025, 4, 2, 'Segunda quincena de abril', '2025-05-05', '2025-05-07'),
  (2025, 5, 1, 'Primera quincena de mayo', '2025-05-19', '2025-05-21');

-- Junio 2025
INSERT INTO calendario_pago (anio, mes, quincena, periodo_descripcion, fecha_pago_inicio, fecha_pago_fin)
VALUES
  (2025, 5, 2, 'Segunda quincena de mayo', '2025-06-05', '2025-06-07'),
  (2025, 6, 1, 'Primera quincena de junio', '2025-06-17', '2025-06-19');

-- Julio 2025
INSERT INTO calendario_pago (anio, mes, quincena, periodo_descripcion, fecha_pago_inicio, fecha_pago_fin)
VALUES
  (2025, 6, 2, 'Segunda quincena de junio', '2025-07-05', '2025-07-07'),
  (2025, 7, 1, 'Primera quincena de julio', '2025-07-17', '2025-07-21');

-- Agosto 2025
INSERT INTO calendario_pago (anio, mes, quincena, periodo_descripcion, fecha_pago_inicio, fecha_pago_fin)
VALUES
  (2025, 7, 2, 'Segunda quincena de julio', '2025-08-05', '2025-08-07'),
  (2025, 8, 1, 'Primera quincena de agosto', '2025-08-18', '2025-08-20');

-- Septiembre 2025
INSERT INTO calendario_pago (anio, mes, quincena, periodo_descripcion, fecha_pago_inicio, fecha_pago_fin)
VALUES
  (2025, 8, 2, 'Segunda quincena de agosto', '2025-09-05', '2025-09-08'),
  (2025, 9, 1, 'Primera quincena de septiembre', '2025-09-17', '2025-09-19');

-- Octubre 2025
INSERT INTO calendario_pago (anio, mes, quincena, periodo_descripcion, fecha_pago_inicio, fecha_pago_fin)
VALUES
  (2025, 9, 2, 'Segunda quincena de septiembre', '2025-10-06', '2025-10-08'),
  (2025, 10, 1, 'Primera quincena de octubre', '2025-10-17', '2025-10-20');

-- Noviembre 2025
INSERT INTO calendario_pago (anio, mes, quincena, periodo_descripcion, fecha_pago_inicio, fecha_pago_fin)
VALUES
  (2025, 10, 2, 'Segunda quincena de octubre', '2025-11-05', '2025-11-07'),
  (2025, 11, 1, 'Primera quincena de noviembre', '2025-11-17', '2025-11-19');

-- Diciembre 2025
INSERT INTO calendario_pago (anio, mes, quincena, periodo_descripcion, fecha_pago_inicio, fecha_pago_fin)
VALUES
  (2025, 11, 2, 'Segunda quincena de noviembre', '2025-12-05', '2025-12-08'),
  (2025, 12, 1, 'Primera quincena de diciembre', '2025-12-17', '2025-12-19');

-- =====================================================
-- Función auxiliar para obtener la fecha de pago de una quincena específica
-- =====================================================
CREATE OR REPLACE FUNCTION obtener_fechas_pago(p_anio INTEGER, p_mes INTEGER, p_quincena INTEGER)
RETURNS TABLE (
  fecha_inicio DATE,
  fecha_fin DATE,
  descripcion TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    fecha_pago_inicio,
    fecha_pago_fin,
    periodo_descripcion
  FROM calendario_pago
  WHERE anio = p_anio
    AND mes = p_mes
    AND quincena = p_quincena;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Función para obtener el próximo pago basado en la fecha actual
-- =====================================================
CREATE OR REPLACE FUNCTION obtener_proximo_pago()
RETURNS TABLE (
  fecha_inicio DATE,
  fecha_fin DATE,
  descripcion TEXT,
  dias_restantes INTEGER
) AS $$
DECLARE
  hoy DATE := CURRENT_DATE;
BEGIN
  RETURN QUERY
  SELECT
    fecha_pago_inicio,
    fecha_pago_fin,
    periodo_descripcion,
    (fecha_pago_inicio - hoy)::INTEGER as dias_restantes
  FROM calendario_pago
  WHERE fecha_pago_fin >= hoy
  ORDER BY fecha_pago_inicio
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Comentarios de la tabla
-- =====================================================
COMMENT ON TABLE calendario_pago IS 'Almacena el calendario de pagos quincenales del puerto';
COMMENT ON COLUMN calendario_pago.anio IS 'Año del periodo (ej: 2025)';
COMMENT ON COLUMN calendario_pago.mes IS 'Mes del periodo (1-12)';
COMMENT ON COLUMN calendario_pago.quincena IS 'Quincena del periodo (1=primera, 2=segunda)';
COMMENT ON COLUMN calendario_pago.periodo_descripcion IS 'Descripción legible del periodo de trabajo';
COMMENT ON COLUMN calendario_pago.fecha_pago_inicio IS 'Primer día del rango de pago';
COMMENT ON COLUMN calendario_pago.fecha_pago_fin IS 'Último día del rango de pago';
