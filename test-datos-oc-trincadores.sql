-- =========================================================================
-- Script SQL para insertar datos de prueba de Trincadores y Personal OC
-- =========================================================================
-- Ejecuta este script en Supabase SQL Editor para añadir datos de prueba
-- con buque = "--" (sin barco asignado)
--
-- IMPORTANTE: Estos datos son temporales para probar la visualización.
-- Al final del script hay comandos para ELIMINAR estos datos de prueba.
-- =========================================================================

-- Paso 1: Insertar datos de prueba
-- Usa la fecha MÁS RECIENTE que tengas en tu tabla jornales para que aparezcan en el tablón

-- IMPORTANTE: Cambia '2025-11-03' por la fecha más reciente que tengas en tu tabla
-- Puedes obtenerla ejecutando: SELECT MAX(fecha) FROM jornales;

INSERT INTO jornales (fecha, chapa, puesto, jornada, empresa, buque, parte, origen) VALUES
-- Trincadores sin barco (buque = "--")
('2025-11-03', '919', 'Trincador', '20 a 02', 'APM', '--', '31666', 'TEST'),
('2025-11-03', '845', 'Trincador', '20 a 02', 'APM', '--', '31667', 'TEST'),
('2025-11-03', '777', 'Trincador', '08 a 14', 'CSP', '--', '31668', 'TEST'),

-- Personal OC (R/E) sin barco (buque = "--")
('2025-11-03', '472', 'Conductor de 1a', '20 a 02', 'APM', '--', '31928', 'TEST'),
('2025-11-03', '488', 'Conductor de 2a', '20 a 02', 'APM', '--', '31929', 'TEST'),
('2025-11-03', '456', 'Especialista', '08 a 14', 'VTEU', '--', '31930', 'TEST'),
('2025-11-03', '501', 'Conductor de 1a', '14 a 20', 'MSC', '--', '31931', 'TEST');

-- =========================================================================
-- VERIFICACIÓN: Ver los datos insertados
-- =========================================================================
SELECT
  fecha,
  chapa,
  puesto,
  jornada,
  empresa,
  buque,
  parte,
  origen
FROM jornales
WHERE origen = 'TEST'
ORDER BY empresa, jornada, puesto;

-- =========================================================================
-- LIMPIEZA: Ejecuta este comando cuando termines de probar para eliminar
-- los datos de prueba
-- =========================================================================

-- DESCOMENTA LA SIGUIENTE LÍNEA CUANDO QUIERAS ELIMINAR LOS DATOS DE PRUEBA:
-- DELETE FROM jornales WHERE origen = 'TEST';

-- Verificar que se eliminaron:
-- SELECT COUNT(*) FROM jornales WHERE origen = 'TEST';
-- (Debe devolver 0)
