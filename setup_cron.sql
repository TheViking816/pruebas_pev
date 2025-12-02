-- PASO 1: Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- PASO 2: Eliminar crons existentes
SELECT cron.unschedule('oraculo-notifications') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'oraculo-notifications'
);

-- PASO 3: Crear el cron con timeout aumentado
SELECT cron.schedule(
    'oraculo-notifications',
    '* * * * *', -- Cada minuto SOLO para pruebas (cambiar a '0 13 * * 1-6' para 15:00 España)
    $$
    SELECT net.http_post(
        url := 'https://icszzxkdxatfytpmoiviq.supabase.co/functions/v1/daily-oracle-notifications',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imljc3p6eGtkeGF0Znl0cG1vdmlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjYzOTY2NSwiZXhwIjoyMDc4MjE1NjY1fQ.LnNbC1ndNvSTSlwYYbcZwXM3iF30IqB5m6mII7IA50I"}'::jsonb,
        body := '{}'::jsonb,
        timeout_milliseconds := 120000
    );
    $$
);

-- PASO 4: Verificar configuración
SELECT * FROM cron.job WHERE jobname = 'oraculo-notifications';
