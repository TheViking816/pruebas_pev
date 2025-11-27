# 🔔 Guía Completa: Cómo Probar las Notificaciones

## 📋 Resumen

Hay **DOS sistemas de notificaciones** en Portal Estiba VLC:

1. **Notificaciones de Nuevos Jornales** - Se envían automáticamente cuando se inserta un jornal para tu chapa
2. **Notificaciones del Oráculo** - Se envían diariamente a las 16:00 (4pm) con la probabilidad de contratación

Ambos sistemas están **100% funcionales** ✅

---

## 🎉 1. Notificaciones de Nuevos Jornales

### ¿Qué muestra la notificación?

**Título:** 🎉 ¡Nueva Contratación!

**Contenido:**
- **Jornada** (código): "20 a 02", "08 a 14", "14 a 20", etc.
- **Fecha**: DD/MM/YYYY
- **Empresa**: MSC, CMA, etc.
- **Buque**: Nombre del barco
- **Icono**: Logo de Portal Estiba VLC

**Ejemplo:**
```
🎉 ¡Nueva Contratación!
20 a 02 - 27/11/2025 - MSC - ATLANTIC EXPLORER
```

### Cómo Probar

#### Opción A: Insertar Jornal Real en Supabase

1. Ve a: https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/editor
2. Selecciona la tabla `jornales`
3. Click en **"Insert row"**
4. Rellena los campos:
   ```
   chapa: 816
   fecha: 2025-11-27 (o la fecha actual)
   jornada: 20 a 02  (o cualquier otra: 08 a 14, 14 a 20, etc.)
   puesto: Gruista Test
   empresa: MSC
   buque: TEST NOTIFICACION
   parte: 999
   origen: https://test.com
   ```
5. Click en **"Save"**

**Deberías recibir la notificación en 1-2 segundos** 🔔

#### Opción B: Ejecutar Script de Prueba

1. Abre PowerShell en el directorio del proyecto
2. Ejecuta:
   ```powershell
   .\TEST-DIRECTO-CURL.ps1
   ```

Esto llama directamente a la edge function simulando un webhook.

### Verificar que Funcionó

**1. Ver Logs del Webhook** (si insertaste desde Supabase)
   - https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/database/hooks
   - Click en el webhook `notify-jornal-insert`
   - Ver pestaña "Logs" o "History"
   - Debe aparecer: ✅ Status 200 OK

**2. Ver Logs de la Edge Function**
   - https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/functions/notify-new-jornal/logs
   - Debe mostrar:
     ```
     📦 Payload recibido
     📋 Nuevo jornal detectado: { chapa: "816", ... }
     ✅ Notificación enviada exitosamente a chapa 816
     ```

**3. Ver Logs del Backend Vercel**
   - https://vercel.com/portalestiba-push-backend-one/deployments
   - Click en el último deployment
   - Ver logs en tiempo real
   - Debe mostrar POST a `/api/push/notify-new-hire`

**4. Tu Dispositivo**
   - Deberías ver la notificación push con el icono y mensaje

---

## 🔮 2. Notificaciones del Oráculo

### ¿Qué muestra la notificación?

**Título:** 🔮 Tu Oráculo del Día

**Contenido:** (Varía según tu probabilidad)
- **≥80%**: "¡Calienta que sales! 85% en Mañana (08-14)"
- **60-79%**: "Bastante probable: 72% en Tarde (14-20)"
- **40-59%**: "Va a estar justo: 45% en Noche (20-02)"
- **20-39%**: "Poco probable: 28% (mejor: Mañana)"
- **<20%**: "Difícil hoy: 12% (mejor: Tarde)"

**Icono**: Logo de Portal Estiba VLC

### Cómo se Calcula

La edge function:
1. Obtiene datos reales de Noray (demandas de grúas y coches)
2. Obtiene tu posición del censo
3. Usa puerta inicial 223 (valor estándar del sistema)
4. Calcula probabilidad para cada jornada (Mañana, Tarde, Noche)
5. Te envía la jornada con mayor probabilidad

### Programación Automática

Las notificaciones del oráculo se envían **automáticamente a las 16:00 (4pm hora de España)** todos los días.

Esto está configurado con un cron job en Supabase:
```sql
SELECT cron.schedule(
  'daily-oracle-notifications',
  '0 15 * * *',  -- 15:00 UTC = 16:00 CET
  $$
  SELECT net.http_post(
    url := 'https://icszzxkdxatfytpmoviq.supabase.co/functions/v1/daily-oracle-notifications',
    ...
  );
  $$
);
```

### Cómo Probar AHORA (sin esperar a las 16:00)

#### Ejecutar Script de Prueba

1. Abre PowerShell en el directorio del proyecto
2. Ejecuta:
   ```powershell
   .\TEST-ORACULO-NOTIFICACION.ps1
   ```

Este script:
- Llama directamente a la edge function
- Procesa **todos los usuarios suscritos** en `push_subscriptions`
- Envía notificación a cada uno con su probabilidad personalizada

**Deberías recibir la notificación inmediatamente** 🔔

### Verificar que Funcionó

**1. Salida del Script**

Verás algo como:
```
=====================================================
  RESPUESTA RECIBIDA
=====================================================

Status: 200

Body:
{
  "success": true,
  "total": 1,
  "sent": 1,
  "failed": 0,
  "timestamp": "2025-11-27T15:30:00.000Z"
}

=====================================================
  NOTIFICACIONES ENVIADAS CORRECTAMENTE
=====================================================

Total usuarios: 1
Notificaciones enviadas: 1
Notificaciones fallidas: 0

Deberías haber recibido la notificación AHORA MISMO
```

**2. Ver Logs de la Edge Function**

https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/functions/daily-oracle-notifications/logs

Verás logs detallados mostrando:
- ✅ Datos del scraper obtenidos
- 📋 Encontrados X usuarios suscritos
- 🚪 Puerta actual SP: 223
- ✅ Notificación enviada a chapa 816: "¡Calienta que sales! 85% en Mañana (08-14)"

**3. Ver Logs del Backend Vercel**

https://vercel.com/portalestiba-push-backend-one/deployments

Debe mostrar POST a `/api/push/notify-oracle`

**4. Tu Dispositivo**

Deberías ver la notificación push del oráculo

---

## 🔧 Troubleshooting

### No recibo notificaciones

**1. Verificar que tienes suscripción activa**

Ejecuta en SQL Editor:
```sql
SELECT * FROM push_subscriptions WHERE user_chapa = '816';
```

Debe aparecer 1 fila con:
- `endpoint` empezando con `https://fcm.googleapis.com`
- `p256dh` y `auth` (claves de encriptación)

Si **NO aparece nada**: Tienes que suscribirte desde la app:
- Abre Portal Estiba en tu navegador
- Acepta las notificaciones cuando te lo pida
- Verifica que se cree la entrada en `push_subscriptions`

**2. Verificar permisos del navegador**

En tu navegador/dispositivo:
- **Chrome/Edge**: Configuración → Privacidad y seguridad → Notificaciones
- **Firefox**: Configuración → Privacidad y seguridad → Permisos → Notificaciones
- **Safari iOS**: Ajustes → Safari → Notificaciones

Asegúrate de que Portal Estiba VLC tenga permisos ✅

**3. Verificar que el service worker está activo**

1. Abre Portal Estiba en tu navegador
2. F12 (DevTools) → Application → Service Workers
3. Debe aparecer un service worker **activo**

**4. Ver errores en logs de Vercel**

https://vercel.com/portalestiba-push-backend-one/deployments

Si hay errores, aparecerán aquí en rojo.

**5. Ver errores en logs de edge functions**

- Jornales: https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/functions/notify-new-jornal/logs
- Oráculo: https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/functions/daily-oracle-notifications/logs

---

## 📊 Verificar el Cron Job del Oráculo

Para ver si el cron job está activo y programado:

```sql
-- Ver cron jobs activos
SELECT * FROM cron.job;

-- Ver historial de ejecuciones
SELECT * FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-oracle-notifications')
ORDER BY start_time DESC
LIMIT 10;
```

Si el cron job **NO aparece**, ejecuta `supabase/restore-oracle-cron.sql` para restaurarlo.

---

## ✅ Resumen de URLs Útiles

### Dashboards
- **Supabase Database**: https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/editor
- **Database Webhooks**: https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/database/hooks
- **Edge Functions**: https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/functions
- **Vercel Deployments**: https://vercel.com/portalestiba-push-backend-one/deployments

### Logs
- **Logs Jornal Notifications**: https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/functions/notify-new-jornal/logs
- **Logs Oracle Notifications**: https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/functions/daily-oracle-notifications/logs

### Scripts de Prueba
```powershell
# Probar notificación de jornal
.\TEST-DIRECTO-CURL.ps1

# Probar notificación del oráculo
.\TEST-ORACULO-NOTIFICACION.ps1
```

---

## 🎯 Cambios Recientes

### ✅ Implementado en esta sesión:

1. **Mostrar código de jornada** en vez de nombre en notificaciones de jornal
   - Antes: "Noche"
   - Ahora: "20 a 02"

2. **Añadido icono/logo** a todas las notificaciones
   - Icon: https://i.imgur.com/Q91Pi44.png
   - Badge: https://i.imgur.com/Q91Pi44.png

3. **Scripts de prueba** para ambos sistemas
   - TEST-DIRECTO-CURL.ps1 (jornales)
   - TEST-ORACULO-NOTIFICACION.ps1 (oráculo)

4. **Edge functions actualizadas** y desplegadas
   - notify-new-jornal ✅
   - daily-oracle-notifications ✅

---

**¡TODO LISTO! Ejecuta los scripts de prueba y deberías recibir las notificaciones al instante** 🚀
