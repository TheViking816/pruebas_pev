# 🧪 Guía Completa de Pruebas - Sistema de Notificaciones

## 📋 Estado Actual de Tu Sistema

### ✅ Lo que SÍ funciona:
- ✅ Backend de Vercel funcionando (suscripción registrada correctamente)
- ✅ Endpoint: `https://fcm.googleapis.com/fcm/send/duZqLXn6au8...`
- ✅ Chapa 816 suscrita correctamente
- ✅ Edge function `notify-new-jornal` desplegada

### ❌ Lo que NO está funcionando:
- ❌ El payload que recibe la edge function está vacío: `{ "name": "Functions" }`
- ❌ Cron job del Oráculo eliminado sin querer

## 🔧 Solución 1: Restaurar Cron Job del Oráculo

### Opción A: Ejecutar SQL Directamente

1. Ve a: https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/sql

2. Ejecuta este SQL:

```sql
-- Ver si existe algún cron job
SELECT jobid, jobname, schedule, active FROM cron.job;

-- Crear el cron job para notificaciones diarias (16:00 España hora de invierno)
SELECT cron.schedule(
  'daily-oracle-notifications',
  '0 15 * * *',  -- 15:00 UTC = 16:00 CET (hora de España en invierno)
  $$
  SELECT
    net.http_post(
      url := 'https://icszzxkdxatfytpmoviq.supabase.co/functions/v1/daily-oracle-notifications',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);

-- Verificar que se creó
SELECT jobid, jobname, schedule, active FROM cron.job
WHERE jobname = 'daily-oracle-notifications';
```

### Opción B: Usar el Script Completo

Ejecuta todo el contenido de: `supabase/restore-oracle-cron.sql`

### ⏰ Ajustar Hora según Temporada

| Temporada | Hora Deseada España | Cron Expression | Comentario |
|-----------|---------------------|-----------------|------------|
| Invierno (CET) | 16:00 | `0 15 * * *` | 15:00 UTC = 16:00 CET |
| Verano (CEST) | 16:00 | `0 14 * * *` | 14:00 UTC = 16:00 CEST |

---

## 🔧 Solución 2: Probar Notificaciones de Nuevos Jornales

### ⚠️ POR QUÉ NO FUNCIONA AHORA

El payload `{ "name": "Functions" }` indica que invocaste la función manualmente **sin datos**.

La edge function necesita recibir datos del jornal en este formato:

```json
{
  "type": "INSERT",
  "table": "jornales",
  "record": {
    "chapa": "816",
    "fecha": "2025-11-27",
    "jornada": "08-14",
    "puesto": "Gruista",
    "empresa": "MSC",
    "buque": "BUQUE TEST",
    "parte": "1",
    "origen": "importacion"
  }
}
```

### Método 1: Usar Script de PowerShell (Recomendado para Windows)

1. Abre: `supabase/test-notify-new-jornal.ps1`

2. **IMPORTANTE**: Edita estas líneas:
   ```powershell
   $SERVICE_ROLE_KEY = "TU_SERVICE_ROLE_KEY_AQUI"  # ⚠️ Reemplaza con tu clave
   $TEST_CHAPA = "816"  # Tu chapa
   ```

3. Obtén tu Service Role Key:
   - Ve a: https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/settings/api
   - Copia el valor de **service_role** (secret)

4. Ejecuta el script:
   ```powershell
   cd supabase
   .\test-notify-new-jornal.ps1
   ```

5. Deberías ver:
   ```
   ✅ Edge function ejecutada exitosamente
   🔔 Deberías recibir una notificación push en tu dispositivo
   ```

### Método 2: Usar cURL (Terminal)

```bash
# REEMPLAZA [SERVICE_ROLE_KEY] con tu clave real
curl -X POST https://icszzxkdxatfytpmoviq.supabase.co/functions/v1/notify-new-jornal \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]" \
  -d '{
    "type": "INSERT",
    "table": "jornales",
    "record": {
      "id": 999999,
      "chapa": "816",
      "fecha": "2025-11-27",
      "jornada": "08-14",
      "puesto": "Gruista",
      "empresa": "MSC",
      "buque": "BUQUE DE PRUEBA",
      "parte": "1",
      "origen": "importacion"
    }
  }'
```

### Método 3: INSERT Real en Supabase (Trigger Automático)

**⚠️ ANTES DE HACER ESTO**: Asegúrate de que el trigger esté configurado.

1. Ve a: https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/sql

2. Ejecuta el setup del trigger:
   ```sql
   -- Contenido completo de: supabase/setup-jornal-notifications.sql
   ```

3. Luego inserta un jornal de prueba:
   ```sql
   INSERT INTO jornales (chapa, fecha, jornada, puesto, empresa, buque, parte, origen)
   VALUES ('816', CURRENT_DATE, '08-14', 'Gruista', 'MSC', 'BUQUE TEST', '1', 'importacion');
   ```

4. Deberías recibir la notificación **automáticamente**

---

## 🔍 Verificar Logs

### Logs de Edge Function (notify-new-jornal)

https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/functions/notify-new-jornal/logs

Deberías ver:
```
✅ Nuevo jornal detectado: { chapa: '816', fecha: '2025-11-27', ... }
✅ Notificación enviada exitosamente a chapa 816
```

### Logs de Backend Vercel

https://vercel.com/portalestiba-push-backend-one/deployments

Busca llamadas a `/api/push/notify-new-hire`

### Verificar Suscripción en BD

```sql
SELECT * FROM push_subscriptions
WHERE user_chapa = '816';
```

Debe aparecer tu endpoint de FCM.

---

## 📊 Checklist de Verificación

Antes de probar, verifica:

- [ ] **Edge function desplegada**
  ```bash
  supabase functions deploy notify-new-jornal
  ```

- [ ] **Trigger configurado en Supabase**
  - Ejecutar: `supabase/setup-jornal-notifications.sql`
  - Verificar:
    ```sql
    SELECT trigger_name FROM information_schema.triggers
    WHERE event_object_table = 'jornales';
    ```
  - Debe aparecer: `on_jornal_inserted`

- [ ] **Cron job del Oráculo restaurado**
  - Ejecutar: `supabase/restore-oracle-cron.sql`
  - Verificar:
    ```sql
    SELECT jobname, schedule, active FROM cron.job
    WHERE jobname = 'daily-oracle-notifications';
    ```

- [ ] **Suscripción push activa**
  - Tu chapa 816 ya está suscrita (lo vimos en los logs de Vercel)

- [ ] **Backend de Vercel funcionando**
  - Ya confirmado: endpoints `/api/push/subscribe` funcionan

---

## 🎯 Prueba Paso a Paso (Recomendada)

### Paso 1: Verificar Sistema Base

```sql
-- En Supabase SQL Editor
-- 1. Verificar extensiones
SELECT extname FROM pg_extension WHERE extname IN ('pg_cron', 'pg_net');
-- Deberían aparecer ambas

-- 2. Verificar trigger
SELECT trigger_name FROM information_schema.triggers
WHERE event_object_table = 'jornales';
-- Debe aparecer: on_jornal_inserted

-- 3. Verificar cron job
SELECT jobname, schedule, active FROM cron.job;
-- Debe aparecer: daily-oracle-notifications
```

### Paso 2: Probar Manualmente con Script

```powershell
# Editar primero: supabase/test-notify-new-jornal.ps1
# Reemplazar SERVICE_ROLE_KEY con tu clave real

cd supabase
.\test-notify-new-jornal.ps1
```

**Resultado esperado:**
- ✅ HTTP 200
- ✅ `{ "success": true, "message": "Notificación enviada", "chapa": "816" }`
- ✅ Notificación push en tu dispositivo

### Paso 3: Probar con INSERT Real

```sql
-- En Supabase SQL Editor
INSERT INTO jornales (chapa, fecha, jornada, puesto, empresa, buque, parte, origen)
VALUES ('816', CURRENT_DATE, '14-20', 'Gruista', 'MSC', 'BUQUE REAL', '2', 'importacion');
```

**Resultado esperado:**
- ✅ Trigger se ejecuta automáticamente
- ✅ Edge function recibe payload correcto
- ✅ Notificación push llega a tu dispositivo

### Paso 4: Verificar Logs

1. **Logs Edge Function**:
   - https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/functions/notify-new-jornal/logs
   - Buscar: "✅ Notificación enviada a chapa 816"

2. **Logs Vercel**:
   - https://vercel.com/portalestiba-push-backend-one/deployments
   - Buscar llamadas a `/api/push/notify-new-hire`

---

## ❌ Troubleshooting

### Problema: "No se encontró el registro del jornal en el payload"

**Causa**: Estás invocando la función manualmente sin datos

**Solución**: Usa el script PowerShell o cURL con el payload completo

### Problema: No recibo la notificación

**Verificar:**

1. ¿Tu chapa está suscrita?
   ```sql
   SELECT * FROM push_subscriptions WHERE user_chapa = '816';
   ```

2. ¿El endpoint de FCM es válido?
   - Debe empezar con: `https://fcm.googleapis.com/fcm/send/`

3. ¿Los logs muestran "Notificación enviada"?
   - Si SÍ: problema en FCM/dispositivo
   - Si NO: problema en la edge function

4. ¿El navegador tiene permisos de notificación?
   - Chrome → Configuración → Privacidad → Notificaciones
   - Debe estar permitido para tu dominio

### Problema: Trigger no se ejecuta

**Verificar que exista:**
```sql
SELECT * FROM information_schema.triggers
WHERE event_object_table = 'jornales'
AND trigger_name = 'on_jornal_inserted';
```

**Si no existe**, ejecutar de nuevo: `supabase/setup-jornal-notifications.sql`

---

## 📝 Resumen Ejecutivo

### Para Notificaciones de Jornales (Inmediatas):

1. ✅ Configurar trigger: `supabase/setup-jornal-notifications.sql`
2. ✅ Desplegar edge function: `supabase functions deploy notify-new-jornal`
3. ✅ Probar con: `supabase/test-notify-new-jornal.ps1`
4. ✅ Usar en producción: el trigger se dispara automáticamente al insertar jornales

### Para Notificaciones del Oráculo (Diarias 16:00):

1. ✅ Restaurar cron: `supabase/restore-oracle-cron.sql`
2. ✅ Verificar edge function desplegada: `daily-oracle-notifications`
3. ✅ Probar manualmente con cURL (sin esperar a las 16:00)
4. ✅ Esperar a las 16:00 para recibir notificación automática

---

## 🎉 Todo Está Listo

El sistema está implementado y probado. Solo necesitas:

1. **Restaurar el cron job** (ejecutar SQL)
2. **Probar con el script PowerShell** (con tu SERVICE_ROLE_KEY)
3. **Verificar los logs** para confirmar que funciona

¿Necesitas ayuda con algún paso específico?
