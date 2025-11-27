-- ============================================================================
-- ELIMINAR TODO LO QUE CAUSA EL ERROR
-- ============================================================================

-- Ver TODOS los triggers que hay ahora mismo
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'jornales';

-- ELIMINAR TODOS sin excepción (excepto el de updated_at)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT trigger_name
        FROM information_schema.triggers
        WHERE event_object_table = 'jornales'
        AND trigger_name != 'update_jornales_updated_at'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || r.trigger_name || ' ON jornales CASCADE';
        RAISE NOTICE 'Eliminado trigger: %', r.trigger_name;
    END LOOP;
END $$;

-- Eliminar TODAS las funciones relacionadas
DROP FUNCTION IF EXISTS notify_new_jornal_trigger() CASCADE;
DROP FUNCTION IF EXISTS send_push_notification_trigger() CASCADE;
DROP FUNCTION IF EXISTS jornal_notification_function() CASCADE;

-- Verificar que NO quede NADA
SELECT trigger_name FROM information_schema.triggers
WHERE event_object_table = 'jornales';

-- DEBE aparecer SOLO: update_jornales_updated_at
-- Si aparece CUALQUIER OTRA COSA, cópiala aquí y dime cuál es
