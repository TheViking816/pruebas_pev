# 🧪 Rama de Prueba: Scraper y Notificaciones

## 📋 Resumen de Cambios

Esta rama de prueba (`test/scraper-y-notificaciones`) integra todas las funcionalidades de scraping automático y notificaciones push para el Portal Estiba VLC.

### ✅ Funcionalidades Implementadas

1. **✅ Auto-carga de datos de Noray en el Oráculo**
   - Al abrir la página del Oráculo, se cargan automáticamente los datos del scraper
   - URL del scraper: https://noray-scraper.onrender.com/api/all
   - Rellena automáticamente los campos de demanda (grúas, coches, fijos)
   - Si falla, el usuario puede usar el botón manual "Cargar desde Noray"

2. **✅ Notificaciones diarias del Oráculo (16:00)**
   - Edge function que se ejecuta automáticamente cada día
   - Calcula la probabilidad de trabajo para cada usuario
   - Envía notificación push con la mejor jornada y probabilidad
   - Implementado en: `supabase/functions/daily-oracle-notifications/index.ts`

3. **✅ Notificaciones de nuevos jornales**
   - Edge function que se dispara al insertar un jornal en Supabase
   - Envía notificación push al usuario contratado
   - Implementado en: `supabase/functions/notify-new-jornal/index.ts`

4. **✅ Fix del scroll en el foro**
   - Aumentado padding-bottom para evitar que el compositor tape mensajes
   - Los mensajes ahora son completamente visibles

---

## 📁 Archivos Modificados/Creados

### Archivos Modificados

1. **`app.js`** (líneas 6164-6215)
   - Añadida auto-carga de datos de Noray en `loadCalculadora()`
   - Intenta cargar datos automáticamente al abrir el Oráculo
   - Actualiza los campos del formulario si tiene éxito

2. **`styles.css`** (línea 1018)
   - Aumentado `padding-bottom` del foro de 160px a 200px
   - Fix para evitar que el compositor del chat tape los últimos mensajes

### Archivos Creados

3. **`supabase/functions/notify-new-jornal/index.ts`**
   - Edge function para notificaciones de nuevos jornales
   - Se dispara cuando se inserta un registro en la tabla `jornales`
   - Llama a `/api/push/notify-new-hire` del backend de Vercel

4. **`supabase/setup-jornal-notifications.sql`**
   - Script SQL para configurar el trigger de nuevos jornales
   - Crea función y trigger en Supabase
   - Incluye instrucciones de testing y troubleshooting

5. **`README-RAMA-TEST.md`**
   - Este archivo
   - Documentación completa de la rama de prueba

### Archivos Heredados de `render`

6. **`supabase/functions/daily-oracle-notifications/index.ts`**
   - Edge function para notificaciones diarias del Oráculo
   - Ya existía en rama `render`, mergeada a esta rama

7. **`NOTIFICACIONES-ORACULO-README.md`**
   - Documentación detallada de notificaciones del Oráculo
   - Hereda de rama `render`

8. **`DEPLOYMENT-INSTRUCTIONS.md`**
   - Instrucciones completas de despliegue del sistema
   - Hereda de rama `render`

9. **`supabase/cleanup-old-notifications.sql`**
   - Script para limpiar sistema de notificaciones viejo
   - Elimina cron jobs obsoletos y edge functions viejas
   - Instrucciones para verificar que solo quede el nuevo sistema

---

## ⚠️ Migración desde Sistema Viejo

Si ya tenías notificaciones configuradas con la edge function `send-push-notification`, **debes migrar al nuevo sistema**:

### ¿Qué cambió?

| Sistema Viejo | Sistema Nuevo |
|---------------|---------------|
| Edge function: `send-push-notification` | Edge function: `notify-new-jornal` |
| Usaba campos incorrectos (`trabajo`, `sueldo`) | Usa estructura real de la tabla (`puesto`, `empresa`, `buque`) |
| Poca documentación | Completamente documentado |
| Sin script de setup | Script SQL completo con testing |

### Pasos de Migración

1. **Ejecuta el script de limpieza**: `supabase/cleanup-old-notifications.sql`
2. **Despliega la nueva edge function**: `supabase functions deploy notify-new-jornal`
3. **Configura el nuevo trigger**: Ejecuta `supabase/setup-jornal-notifications.sql`
4. **Elimina la edge function vieja** desde Dashboard o CLI: `supabase functions delete send-push-notification`
5. **Prueba** insertando un jornal de prueba

### ¿Necesito mantener ambos sistemas?

**NO.** El sistema nuevo (`notify-new-jornal`) reemplaza completamente al viejo. Mantener ambos causaría notificaciones duplicadas.

---

## 🚀 Cómo Probar Esta Rama

### 1. Probar Auto-Carga de Noray

```bash
# 1. Hacer checkout de la rama
git checkout test/scraper-y-notificaciones

# 2. Desplegar a Vercel (si tienes configurado)
vercel --prod

# 3. Abrir la aplicación en el navegador
# 4. Login con tu chapa
# 5. Ir a "El Oráculo" en el menú
# 6. Verificar que los campos se rellenan automáticamente
#    - Revisar consola del navegador: debe decir "✅ Datos de Noray cargados automáticamente"
```

### 2. Probar Notificaciones de Nuevos Jornales

```bash
# 1. Limpiar sistema viejo (opcional pero recomendado)
# Ejecutar: supabase/cleanup-old-notifications.sql
# En: https://supabase.com/dashboard/project/[PROJECT-ID]/sql

# 2. Desplegar edge function
cd supabase
supabase functions deploy notify-new-jornal

# 3. Configurar trigger en Supabase
# Ejecutar el contenido de: supabase/setup-jornal-notifications.sql
# En: https://supabase.com/dashboard/project/[PROJECT-ID]/sql

# 4. Probar insertando un jornal de prueba
# En Supabase SQL Editor (usando estructura real de la tabla):
INSERT INTO jornales (chapa, fecha, jornada, puesto, empresa, buque, parte, origen)
VALUES ('TU_CHAPA', CURRENT_DATE, '08-14', 'Gruista', 'MSC', 'BUQUE TEST', '1', 'importacion');

# 5. Verificar que llegó la notificación push a tu dispositivo
# 6. Ver logs en: https://supabase.com/dashboard/project/[PROJECT-ID]/functions/notify-new-jornal/logs
```

### 3. Probar Notificaciones Diarias del Oráculo

```bash
# 1. Desplegar edge function (si no está desplegada)
supabase functions deploy daily-oracle-notifications

# 2. Configurar cron job (solo si no está configurado)
# Ver instrucciones en: DEPLOYMENT-INSTRUCTIONS.md

# 3. Probar manualmente (sin esperar al cron job)
curl -X POST https://icszzxkdxatfytpmoviq.supabase.co/functions/v1/daily-oracle-notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TU_SERVICE_ROLE_KEY]"

# 4. Verificar que llegó la notificación push
# 5. Ver logs en: https://supabase.com/dashboard/project/[PROJECT-ID]/functions/daily-oracle-notifications/logs
```

### 4. Probar Fix del Scroll del Foro

```bash
# 1. Abrir la aplicación
# 2. Ir al Foro
# 3. Escribir varios mensajes
# 4. Verificar que todos los mensajes son visibles
# 5. El último mensaje NO debe quedar tapado por el compositor del chat
```

---

## ⚙️ Configuración Necesaria

### Variables de Entorno en Supabase

Las edge functions necesitan estas variables (ya deberían estar configuradas):

```bash
SUPABASE_URL=https://icszzxkdxatfytpmoviq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[tu_service_role_key]
```

### Variables de Entorno en Vercel (Backend de Push)

El backend en https://portalestiba-push-backend-one.vercel.app necesita:

```bash
SUPABASE_URL=https://icszzxkdxatfytpmoviq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[tu_service_role_key]
VAPID_PUBLIC_KEY=[tu_vapid_public_key]
VAPID_PRIVATE_KEY=[tu_vapid_private_key]
WEB_PUSH_EMAIL=noreply@portalestibavlc.com
```

---

## 🧪 Testing Checklist

Antes de mergear a main, verificar:

- [ ] Auto-carga de Noray funciona al abrir el Oráculo
- [ ] Los datos del scraper se cargan correctamente (grúas, coches, fijos)
- [ ] Si el scraper falla, no se muestra error al usuario
- [ ] El botón manual "Cargar desde Noray" sigue funcionando
- [ ] Notificaciones de nuevos jornales se envían correctamente
- [ ] Notificaciones diarias del Oráculo se envían a las 16:00
- [ ] El scroll del foro muestra todos los mensajes
- [ ] El compositor del chat no tapa los últimos mensajes
- [ ] No hay regresiones en otras funcionalidades

---

## 📊 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│  USUARIO                                                        │
│  - Abre Oráculo → Auto-carga de Noray                         │
│  - Recibe notificación diaria (16:00)                         │
│  - Recibe notificación de contratación                        │
└────────────────────┬────────────────────────────────────────────┘
                     │
         ┌───────────┴────────────┐
         │                        │
         ▼                        ▼
┌─────────────────┐      ┌─────────────────┐
│  SCRAPER RENDER │      │  SUPABASE       │
│  noray-scraper  │      │  - Edge Funcs   │
│  .onrender.com  │      │  - Triggers     │
└─────────────────┘      │  - Database     │
         │               └─────────┬────────┘
         │                         │
         │                         ▼
         │               ┌─────────────────┐
         │               │  BACKEND VERCEL │
         │               │  Push Server    │
         │               └─────────┬────────┘
         │                         │
         └─────────────────────────┴────────► NOTIFICACIÓN PUSH
```

---

## 🐛 Troubleshooting

### Auto-carga de Noray no funciona

1. Verificar en consola del navegador si hay errores
2. Verificar que el scraper está funcionando:
   ```bash
   curl https://noray-scraper.onrender.com/api/all
   ```
3. Si el scraper está en "cold start", esperar ~30 segundos

### No llegan notificaciones

1. Verificar que el usuario tiene suscripción activa:
   ```sql
   SELECT * FROM push_subscriptions WHERE user_chapa = 'TU_CHAPA';
   ```

2. Verificar logs de edge functions:
   - https://supabase.com/dashboard/project/[PROJECT-ID]/functions

3. Verificar backend de Vercel:
   - https://vercel.com/portalestiba-push-backend-one/deployments

### Trigger de jornales no funciona

1. Verificar que el trigger existe:
   ```sql
   SELECT * FROM information_schema.triggers
   WHERE trigger_name = 'on_jornal_inserted';
   ```

2. Verificar logs de la edge function `notify-new-jornal`

3. Probar insertar un jornal manualmente y ver si se dispara

---

## 📝 Próximos Pasos

Una vez probada y verificada esta rama:

1. **Mergear a main**
   ```bash
   git checkout main
   git merge test/scraper-y-notificaciones
   git push origin main
   ```

2. **Desplegar edge functions en producción**
   ```bash
   supabase functions deploy notify-new-jornal
   supabase functions deploy daily-oracle-notifications
   ```

3. **Configurar trigger de jornales**
   - Ejecutar `supabase/setup-jornal-notifications.sql` en producción

4. **Verificar cron job del Oráculo**
   - Confirmar que está configurado y funcionando

5. **Monitorear logs durante los primeros días**
   - Verificar que las notificaciones se envían correctamente
   - Ajustar horarios o lógica si es necesario

---

## 👤 Autor

**Adrian Lujan (TheViking816)**
- Email: portalestibavlc@gmail.com
- GitHub: @TheViking816

---

## 📅 Fecha de Creación

27 de Noviembre de 2025

---

## 📄 Licencia

Este código es propietario y confidencial. Ver [LICENSE](LICENSE) para más detalles.
