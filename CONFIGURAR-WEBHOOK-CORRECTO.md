# ✅ Configurar Webhook Correctamente (Ya sabemos que la edge function funciona)

## 🎯 CONFIGURACIÓN EXACTA DEL WEBHOOK

Ve a: https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/database/hooks

### Si no ves "Database Webhooks":

1. Ve a: https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/database/publications
2. Click en "Realtime" en el menú lateral
3. Busca "Database Webhooks" o "Webhooks"

### Crear Nuevo Webhook:

**Click en "Create a new hook"** o **"Enable Webhooks"**

---

## 📋 CONFIGURACIÓN PASO A PASO

### Basic Settings

```
Name: notify-jornal-insert
Schema: public
Table: jornales
```

### Events

```
☑ INSERT
☐ UPDATE
☐ DELETE
```

### Webhook Configuration

```
Type: HTTP Request
Method: POST
URL: https://icszzxkdxatfytpmoviq.supabase.co/functions/v1/notify-new-jornal
```

### Headers (IMPORTANTE: Añadir EXACTAMENTE 2 headers)

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

### HTTP Params / Query Params

```
(Dejar vacío - No añadir nada)
```

---

## 🧪 PROBAR DESPUÉS DE CREAR EL WEBHOOK

```sql
-- Ejecutar en Supabase SQL Editor
INSERT INTO jornales (chapa, fecha, jornada, puesto, empresa, buque, parte, origen)
VALUES ('816', CURRENT_DATE, '20 a 02', 'Test Webhook', 'MSC', 'TEST FINAL', '888', 'https://test.com');
```

**Deberías recibir la notificación automáticamente** 🔔

---

## 📊 VERIFICAR QUE FUNCIONA

### 1. Ver Logs del Webhook

https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/database/hooks

- Click en tu webhook `notify-jornal-insert`
- Ve a la pestaña **"Logs"** o **"History"** o **"Recent Runs"**

**Deberías ver:**
- ✅ Status: `200 OK`
- ✅ Response: `{"success":true,"message":"Notificación enviada","chapa":"816"}`
- ✅ Timestamp de cuándo se ejecutó

### 2. Ver Logs de Edge Function

https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/functions/notify-new-jornal/logs

**Deberías ver (como en el test):**
```
📦 Payload recibido
📋 Nuevo jornal detectado: { chapa: "816", ... }
✅ Notificación enviada exitosamente a chapa 816
```

---

## ⚠️ TROUBLESHOOTING

### Si el webhook da error al insertar jornal:

**Error común:** "URL using bad/illegal format"

**Solución:** El webhook está intentando usar pg_net.

Verifica que:
1. NO haya triggers activos (ejecutar `ELIMINAR-TODO-YA.sql`)
2. El webhook esté configurado como **"HTTP Request"** NO como función
3. La URL esté completa: `https://icszzxkdxatfytpmoviq.supabase.co/functions/v1/notify-new-jornal`

### Si el webhook no aparece en los logs:

1. Verifica que el webhook esté **activo/enabled**
2. Verifica que los eventos incluyan **INSERT**
3. Verifica que la tabla sea exactamente **jornales** (no public.jornales)

### Si el webhook retorna 401 Unauthorized:

- Verifica que el header Authorization tenga el Bearer token completo
- Verifica que no haya espacios extras en el token

### Si el webhook retorna 404 Not Found:

- Verifica que la URL de la edge function sea correcta
- Verifica que la edge function esté desplegada

---

## 🎯 CONFIGURACIÓN VISUAL (AYUDA)

El formulario debería verse así:

```
┌─────────────────────────────────────────────────────────┐
│ Create Database Webhook                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Name: notify-jornal-insert                              │
│ Schema: public                                          │
│ Table: jornales                                         │
│                                                         │
│ Events:                                                 │
│   ☑ INSERT                                              │
│   ☐ UPDATE                                              │
│   ☐ DELETE                                              │
│                                                         │
│ Webhook Configuration:                                  │
│   Type: HTTP Request                                    │
│   Method: POST                                          │
│   URL: https://icszzxkdxatfytpmoviq.supabase.co/...    │
│                                                         │
│ Headers:                                                │
│   Content-Type: application/json                        │
│   Authorization: Bearer eyJhbGci...                     │
│                                                         │
│ [ Cancel ]                        [ Create Webhook ]    │
└─────────────────────────────────────────────────────────┘
```

---

## 📸 ALTERNATIVA: Realtime Broadcast

Si los webhooks no funcionan, también puedes usar **Realtime** con **Broadcast**:

1. Ve a: https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/database/publications
2. Click en la tabla `jornales`
3. Habilita **Realtime** para INSERT
4. Luego en tu app.js escuchas los cambios y llamas a la edge function

Pero webhooks es más simple.

---

## ✅ RESUMEN

1. **Edge function funciona** ✅ (ya probado con el script)
2. **Suscripción activa** ✅ (ya verificado)
3. **Backend funciona** ✅ (recibiste la notificación)

**Solo falta:** Configurar el webhook correctamente para que llame a la edge function automáticamente.

---

**CONFIGURA EL WEBHOOK Y PRUEBA INSERTANDO UN JORNAL** 🚀
