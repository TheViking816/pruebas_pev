# 🚨 FIX INMEDIATO - Hacer que las Notificaciones Funcionen YA

## ❌ Problema Identificado

1. **Triggers duplicados**: Tienes `on_jornal_insert` (viejo) y `on_jornal_inserted` (nuevo) - están interfiriendo
2. **Nombre de tabla incorrecto**: La edge function busca en `push_subscriptions` pero la tabla se llama `push_notifications`
3. **Cron job a hora incorrecta**: Configurado a las 16:00 UTC en lugar de 15:00 UTC

## ✅ Solución en 3 Pasos (5 minutos)

### PASO 1: Limpiar y Recrear Triggers (2 min)

1. Ve a: https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/sql

2. **Copia y pega TODO** el contenido de: `supabase/FIX-NOTIFICACIONES-AHORA.sql`

3. Haz clic en **Run**

4. Debe aparecer al final: "Sistema de notificaciones configurado correctamente"

### PASO 2: Redesplegar Edge Function con Fix (2 min)

```bash
# En la terminal, dentro de la carpeta del proyecto
cd C:\Users\adria\Proyectos _IA\PortalEstibaVLC\PortalEstibaVLC

# Redesplegar la edge function CON EL FIX
supabase functions deploy notify-new-jornal
```

Verás algo como:
```
✓ Deploying function notify-new-jornal
✓ Function notify-new-jornal deployed successfully
```

### PASO 3: Probar Inmediatamente (1 min)

El script SQL del PASO 1 ya insertó un jornal de prueba automáticamente.

**Verifica los logs**:

1. **Logs de Edge Function**:
   https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/functions/notify-new-jornal/logs

   Deberías ver:
   ```
   📦 Payload recibido: { "type": "INSERT", "table": "jornales", ... }
   📋 Nuevo jornal detectado: { chapa: '816', ... }
   ✅ Notificación enviada exitosamente a chapa 816
   ```

2. **Logs de Vercel**:
   https://vercel.com/portalestiba-push-backend-one/deployments

   Deberías ver llamadas POST a `/api/push/notify-new-hire`

3. **Tu dispositivo**:
   Deberías recibir la notificación push

---

## 🔍 Si TODAVÍA No Funciona

### Verificación 1: ¿Se ejecutó el trigger?

```sql
-- Ver logs de la base de datos
-- Debe aparecer: "Trigger ejecutado para chapa: 816"
```

Ve a: https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/logs/postgres-logs

### Verificación 2: ¿Está la suscripción activa?

```sql
SELECT * FROM push_notifications
WHERE user_chapa = '816';
```

Debe aparecer un registro con endpoint de FCM.

### Verificación 3: ¿Está desplegada la edge function?

Ve a: https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/functions

Debe aparecer: `notify-new-jornal` con status verde (deployed)

---

## 📊 Cambios Realizados

### En FIX-NOTIFICACIONES-AHORA.sql:

1. ✅ Eliminados TODOS los triggers viejos
2. ✅ Eliminadas funciones duplicadas
3. ✅ Recreado solo el trigger correcto con RAISE NOTICE para debugging
4. ✅ Insertado jornal de prueba automático

### En notify-new-jornal/index.ts:

1. ✅ Cambiado `push_subscriptions` → `push_notifications` (nombre correcto)
2. ✅ Mejor logging para debugging

---

## 🎯 Checklist Post-Fix

Después de ejecutar los 3 pasos, verifica:

- [ ] Solo 2 triggers en tabla jornales: `update_jornales_updated_at` y `on_jornal_inserted`
- [ ] Edge function desplegada (versión nueva)
- [ ] Logs de edge function muestran: "Nuevo jornal detectado"
- [ ] Logs de Vercel muestran llamadas a `/api/push/notify-new-hire`
- [ ] Notificación push recibida en dispositivo

---

## ⚡ Resumen Ultra-Rápido

```bash
# 1. Ejecutar FIX-NOTIFICACIONES-AHORA.sql en Supabase SQL Editor

# 2. Redesplegar edge function
supabase functions deploy notify-new-jornal

# 3. Verificar logs
# https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/functions/notify-new-jornal/logs

# 4. Si funciona, ya está listo
# Si no funciona, revisar los logs de verificación arriba
```

---

## 📞 Última Línea de Defensa

Si después de TODO esto sigue sin funcionar, el problema está en:

1. **FCM (Firebase Cloud Messaging)**: El token puede estar expirado
2. **Permisos del navegador**: Verificar que las notificaciones estén permitidas
3. **Service Worker**: Puede necesitar re-registro

Para verificar:
```javascript
// En la consola del navegador de la PWA
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Service Worker:', reg);
  if (reg) {
    reg.pushManager.getSubscription().then(sub => {
      console.log('Subscription:', sub);
    });
  }
});
```

---

**EJECUTA LOS 3 PASOS Y CONFIRMA QUE FUNCIONA** 🚀
