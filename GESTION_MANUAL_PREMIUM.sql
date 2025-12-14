-- =====================================================================
-- GESTIÓN MANUAL DEL SISTEMA PREMIUM - SUPABASE
-- Portal Estiba VLC
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. VER ESTADO DE UN USUARIO ESPECÍFICO
-- ---------------------------------------------------------------------
-- Reemplaza '115' con la chapa del usuario que quieras consultar
SELECT
    chapa,
    estado,
    periodo_inicio,
    periodo_fin,
    features_disponibles,
    stripe_customer_id,
    stripe_subscription_id,
    created_at,
    updated_at
FROM usuarios_premium
WHERE chapa = '115';


-- ---------------------------------------------------------------------
-- 2. ACTIVAR PREMIUM MANUALMENTE PARA UN USUARIO (MODO TESTING)
-- ---------------------------------------------------------------------
-- Esto da acceso premium a un usuario específico sin necesidad de Stripe
-- Útil para testing o para dar acceso gratuito a usuarios específicos

-- Opción A: Usuario nuevo (no existe en la tabla)
INSERT INTO usuarios_premium (
    chapa,
    estado,
    periodo_inicio,
    periodo_fin,
    features_disponibles
) VALUES (
    '115',  -- Reemplaza con la chapa del usuario
    'active',  -- Estado activo
    NOW(),  -- Desde ahora
    NOW() + INTERVAL '1 year',  -- Hasta dentro de 1 año
    ARRAY['sueldometro', 'oraculo', 'chatbot_ia']::text[]  -- Todos los features
);

-- Opción B: Usuario existente (ya está en la tabla)
UPDATE usuarios_premium
SET
    estado = 'active',
    periodo_inicio = NOW(),
    periodo_fin = NOW() + INTERVAL '1 year',  -- 1 año de acceso
    features_disponibles = ARRAY['sueldometro', 'oraculo', 'chatbot_ia']::text[],
    updated_at = NOW()
WHERE chapa = '115';  -- Reemplaza con la chapa del usuario


-- ---------------------------------------------------------------------
-- 3. DESACTIVAR PREMIUM MANUALMENTE PARA UN USUARIO
-- ---------------------------------------------------------------------
-- Quita el acceso premium a un usuario específico
UPDATE usuarios_premium
SET
    estado = 'canceled',
    periodo_fin = NOW(),  -- Finaliza ahora
    features_disponibles = ARRAY[]::text[],  -- Sin features
    updated_at = NOW()
WHERE chapa = '115';  -- Reemplaza con la chapa del usuario


-- ---------------------------------------------------------------------
-- 4. DAR ACCESO SOLO A FEATURES ESPECÍFICOS
-- ---------------------------------------------------------------------
-- Ejemplo: Dar acceso solo al Sueldómetro y Oráculo, pero no al Chatbot
UPDATE usuarios_premium
SET
    estado = 'active',
    periodo_inicio = NOW(),
    periodo_fin = NOW() + INTERVAL '1 month',  -- 1 mes de acceso
    features_disponibles = ARRAY['sueldometro', 'oraculo']::text[],  -- Solo estos features
    updated_at = NOW()
WHERE chapa = '115';  -- Reemplaza con la chapa del usuario


-- ---------------------------------------------------------------------
-- 5. EXTENDER EL PERIODO DE TRIAL PARA TODOS LOS USUARIOS
-- ---------------------------------------------------------------------
-- Útil si quieres extender el periodo de prueba general
UPDATE usuarios_premium
SET
    periodo_fin = '2026-02-01 00:00:00+00',  -- Nueva fecha de fin (1 feb 2026)
    updated_at = NOW()
WHERE estado = 'trialing';


-- ---------------------------------------------------------------------
-- 6. EXTENDER EL PERIODO PREMIUM DE UN USUARIO ESPECÍFICO
-- ---------------------------------------------------------------------
-- Ejemplo: Dar 3 meses más de premium a un usuario
UPDATE usuarios_premium
SET
    periodo_fin = periodo_fin + INTERVAL '3 months',  -- Añadir 3 meses
    updated_at = NOW()
WHERE chapa = '115';  -- Reemplaza con la chapa del usuario


-- ---------------------------------------------------------------------
-- 7. VER TODOS LOS USUARIOS CON PREMIUM ACTIVO
-- ---------------------------------------------------------------------
SELECT
    chapa,
    estado,
    periodo_inicio,
    periodo_fin,
    features_disponibles
FROM usuarios_premium
WHERE estado IN ('active', 'trialing')
    AND periodo_fin > NOW()
ORDER BY periodo_fin DESC;


-- ---------------------------------------------------------------------
-- 8. VER USUARIOS CON PREMIUM EXPIRADO
-- ---------------------------------------------------------------------
SELECT
    chapa,
    estado,
    periodo_inicio,
    periodo_fin
FROM usuarios_premium
WHERE periodo_fin < NOW()
ORDER BY periodo_fin DESC;


-- ---------------------------------------------------------------------
-- 9. VER ESTADÍSTICAS DEL SISTEMA PREMIUM
-- ---------------------------------------------------------------------
SELECT
    estado,
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN stripe_subscription_id IS NOT NULL THEN 1 END) as con_suscripcion_stripe
FROM usuarios_premium
GROUP BY estado
ORDER BY total_usuarios DESC;


-- ---------------------------------------------------------------------
-- 10. CONVERTIR USUARIO DE TRIALING A ACTIVE (SIMULAR PAGO)
-- ---------------------------------------------------------------------
-- Útil para testing: simular que un usuario en trial ha pagado
UPDATE usuarios_premium
SET
    estado = 'active',
    periodo_inicio = NOW(),
    periodo_fin = NOW() + INTERVAL '1 month',  -- 1 mes de suscripción
    updated_at = NOW()
WHERE chapa = '115'  -- Reemplaza con la chapa del usuario
    AND estado = 'trialing';


-- ---------------------------------------------------------------------
-- 11. RESETEAR UN USUARIO A TRIAL (PARA TESTING)
-- ---------------------------------------------------------------------
-- Volver a poner un usuario en modo trial
UPDATE usuarios_premium
SET
    estado = 'trialing',
    periodo_inicio = NOW(),
    periodo_fin = '2026-01-01 00:00:00+00',  -- Hasta el 1 de enero
    features_disponibles = ARRAY['sueldometro', 'oraculo', 'chatbot_ia']::text[],
    stripe_customer_id = NULL,
    stripe_subscription_id = NULL,
    stripe_price_id = NULL,
    updated_at = NOW()
WHERE chapa = '115';  -- Reemplaza con la chapa del usuario


-- ---------------------------------------------------------------------
-- 12. ELIMINAR COMPLETAMENTE UN USUARIO DEL SISTEMA PREMIUM
-- ---------------------------------------------------------------------
-- ⚠️ CUIDADO: Esto elimina permanentemente el registro
DELETE FROM usuarios_premium
WHERE chapa = '115';  -- Reemplaza con la chapa del usuario


-- ---------------------------------------------------------------------
-- 13. VERIFICAR QUÉ FEATURES TIENE ACCESO UN USUARIO
-- ---------------------------------------------------------------------
-- Usa la función RPC que ya tienes creada
SELECT tiene_acceso_feature('115', 'chatbot_ia');  -- Devuelve true/false
SELECT tiene_acceso_feature('115', 'sueldometro');  -- Devuelve true/false
SELECT tiene_acceso_feature('115', 'oraculo');  -- Devuelve true/false


-- ---------------------------------------------------------------------
-- 14. DAR PREMIUM VITALICIO A UN USUARIO (ADMIN/DEVELOPER)
-- ---------------------------------------------------------------------
-- Para dar acceso permanente (ej: a ti mismo como developer)
UPDATE usuarios_premium
SET
    estado = 'active',
    periodo_inicio = NOW(),
    periodo_fin = NOW() + INTERVAL '100 years',  -- Prácticamente vitalicio
    features_disponibles = ARRAY['sueldometro', 'oraculo', 'chatbot_ia']::text[],
    updated_at = NOW()
WHERE chapa = '115';  -- Tu chapa


-- ---------------------------------------------------------------------
-- 15. VERIFICAR USUARIOS QUE EXPIRAN EN LOS PRÓXIMOS 7 DÍAS
-- ---------------------------------------------------------------------
-- Útil para enviar recordatorios de renovación
SELECT
    chapa,
    estado,
    periodo_fin,
    features_disponibles
FROM usuarios_premium
WHERE periodo_fin > NOW()
    AND periodo_fin < NOW() + INTERVAL '7 days'
    AND estado IN ('active', 'trialing')
ORDER BY periodo_fin ASC;


-- =====================================================================
-- NOTAS IMPORTANTES:
-- =====================================================================
--
-- 1. El 1 de enero de 2026, todos los usuarios en 'trialing' con
--    periodo_fin = '2026-01-01 00:00:00+00' perderán acceso automáticamente
--    porque la función tiene_acceso_feature() verifica que periodo_fin > NOW()
--
-- 2. Para probar el bloqueo premium:
--    - Quita tu acceso con la query #3 (desactivar premium)
--    - Intenta acceder al sueldómetro, oráculo o chatbot
--    - Deberías ver el overlay de bloqueo premium
--    - Restaura tu acceso con la query #2 (activar premium)
--
-- 3. Estados posibles:
--    - 'trialing': Periodo de prueba gratuito
--    - 'active': Suscripción activa (pagando)
--    - 'canceled': Suscripción cancelada
--    - 'past_due': Pago fallido
--    - 'unpaid': Sin pagar
--
-- 4. Features disponibles:
--    - 'sueldometro': Acceso al sueldómetro
--    - 'oraculo': Acceso al oráculo (calculadora predictiva)
--    - 'chatbot_ia': Acceso al chatbot IA
--
-- =====================================================================
