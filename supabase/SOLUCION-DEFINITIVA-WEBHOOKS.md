# 🔥 SOLUCIÓN DEFINITIVA - Database Webhooks (SIN pg_net)

## ❌ Problema Identificado

**pg_net está ROTO en tu proyecto de Supabase**. El error "URL using bad/illegal format" no se puede resolver desde SQL.

## ✅ Solución: Usar Database Webhooks

Los webhooks de Supabase funcionan MEJOR que triggers con pg_net porque:
- ✅ No dependen de pg_net
- ✅ Mejor logging
- ✅ Más confiables
- ✅ Configuración visual (no SQL)

---

## 🚀 CONFIGURACIÓN (2 minutos)

### PASO 1: Eliminar el Trigger Roto

Ve a: https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/sql

Ejecuta esto:

```sql
-- Eliminar trigger que usa pg_net (no funciona)
DROP TRIGGER IF EXISTS on_jornal_inserted ON jornales;
DROP TRIGGER IF EXISTS on_jornal_insert ON jornales;
DROP FUNCTION IF EXISTS notify_new_jornal_trigger() CASCADE;

-- Verificar que no queden triggers de notificaciones
SELECT trigger_name FROM information_schema.triggers
WHERE event_object_table = 'jornales';

-- Solo debe aparecer: update_jornales_updated_at
```

### PASO 2: Crear Database Webhook

1. **Ve a**: https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/database/hooks

2. **Si no ves la opción de Webhooks**, ve a:
   https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/database/publications

3. **Click en "Database Webhooks"** (en el menú lateral)

4. **Click en "Create a new hook"** o **"Enable Webhooks"**

5. **Configuración del Webhook**:

   ```
   Name: notify-jornal-insert

   Table: jornales

   Events: ☑ INSERT (solo este, desmarca UPDATE y DELETE)

   Type: HTTP Request

   HTTP Request:
   ├─ Method: POST
   ├─ URL: https://icszzxkdxatfytpmoviq.supabase.co/functions/v1/notify-new-jornal
   └─ Headers:
      Content-Type: application/json
      Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imljc3p6eGtkeGF0Znl0cG1vdmlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjYzOTY2NSwiZXhwIjoyMDc4MjE1NjY1fQ.LnNbC1ndNvSTSlwYYbcZwXM3iF30IqB5m6mII7IA50I
   ```

6. **Click en "Create webhook"**

---

## 🧪 PASO 3: Probar Inmediatamente

Inserta un jornal de prueba:

```sql
-- En Supabase SQL Editor
INSERT INTO jornales (chapa, fecha, jornada, puesto, empresa, buque, parte, origen)
VALUES ('816', CURRENT_DATE, '20 a 02', 'Gruista WEBHOOK', 'MSC', 'TEST WEBHOOK DEFINITIVO', '777', 'https://test.com');
```

**Deberías recibir la notificación AHORA MISMO** 🔔

---

## 📊 Verificar que Funcionó

### 1. Ver Logs del Webhook

Ve a: https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/database/hooks

Click en tu webhook `notify-jornal-insert` → Ver logs/history

Deberías ver:
- ✅ Status: 200 OK
- ✅ Response time
- ✅ Timestamp

### 2. Ver Logs de la Edge Function

https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/functions/notify-new-jornal/logs

Deberías ver:
```
📦 Payload recibido: { "type": "INSERT", "table": "jornales", ... }
📋 Nuevo jornal detectado: { chapa: '816', ... }
✅ Notificación enviada exitosamente a chapa 816
```

### 3. Ver Logs de Vercel

https://vercel.com/portalestiba-push-backend-one/deployments

Deberías ver llamadas POST a `/api/push/notify-new-hire`

### 4. Tu Dispositivo

Deberías haber recibido la notificación push 🎉

---

## ⚙️ Configuración Visual del Webhook

Si la interfaz te pide más detalles, aquí está TODO:

### Basic Info
- **Name**: `notify-jornal-insert`
- **Schema**: `public`
- **Table**: `jornales`

### Events
- ☑ **INSERT**
- ☐ UPDATE
- ☐ DELETE

### HTTP Request
- **Method**: `POST`
- **URL**: `https://icszzxkdxatfytpmoviq.supabase.co/functions/v1/notify-new-jornal`

### Headers (añadir 2 headers)

**Header 1:**
```
Key: Content-Type
Value: application/json
```

**Header 2:**
```
Key: Authorization
Value: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imljc3p6eGtkeGF0Znl0cG1vdmlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjYzOTY2NSwiZXhwIjoyMDc4MjE1NjY1fQ.LnNbC1ndNvSTSlwYYbcZwXM3iF30IqB5m6mII7IA50I
```

### HTTP Params
- (Dejar vacío)

---

## ✅ Ventajas de Webhooks vs Triggers

| Característica | Trigger + pg_net | Database Webhook |
|----------------|------------------|------------------|
| Confiabilidad | ❌ Puede fallar | ✅ Muy confiable |
| Logging | ❌ Difícil | ✅ Logs en Dashboard |
| Configuración | ❌ SQL complejo | ✅ Interfaz visual |
| Debugging | ❌ Complicado | ✅ Fácil |
| Dependencias | ❌ pg_net | ✅ Sistema nativo |

---

## 🔍 Troubleshooting

### Si el Webhook no aparece en el Dashboard

1. Ve a: **Database → Publications** (menú lateral)
2. Verifica que `supabase_realtime` esté habilitado
3. Si no ves "Database Webhooks", actualiza la página

### Si el Webhook falla

1. Ver logs del webhook en el Dashboard
2. Verificar que la URL de la edge function sea correcta
3. Verificar que el header Authorization tenga el Bearer token

### Si llega a la Edge Function pero no envía notificación

1. Verificar que la chapa tenga suscripción:
   ```sql
   SELECT * FROM push_subscriptions WHERE user_chapa = '816';
   ```

2. Ver logs de Vercel para ver si llega al backend

---

## 📸 Capturas de Pantalla (Ayuda Visual)

### Ubicación del Webhook

```
Dashboard
  └─ Database
      └─ Webhooks  ← AQUÍ
```

### Formulario de Creación

```
┌─────────────────────────────────────────┐
│ Create Database Webhook                │
├─────────────────────────────────────────┤
│ Name: notify-jornal-insert              │
│ Table: jornales                         │
│ Events: ☑ INSERT                        │
│                                         │
│ HTTP Request                            │
│ ├─ Method: POST                         │
│ ├─ URL: https://...                     │
│ └─ Headers:                             │
│     Content-Type: application/json      │
│     Authorization: Bearer ...           │
└─────────────────────────────────────────┘
```

---

## 🎯 RESUMEN DE 3 PASOS

1. **Ejecutar SQL** para eliminar triggers rotos
2. **Crear Webhook** en el Dashboard (interfaz visual)
3. **Insertar jornal de prueba** y recibir notificación

**TOTAL: 2-3 minutos**

---

## 🚨 IMPORTANTE

Una vez que el webhook funcione:
- ❌ NO uses triggers con pg_net (están rotos)
- ✅ USA webhooks para todas las notificaciones
- ✅ Mucho más fácil de mantener

---

**HAZ LOS 3 PASOS Y CONFIRMA QUE LLEGA LA NOTIFICACIÓN** 🚀
