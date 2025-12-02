# ✅ Pruebas de Correcciones - Sistema Premium y Chatbot

## 🔧 Problemas Corregidos

### 1. ✅ Botón del Chatbot Visible Cuando No Debería
- **Problema:** El botón se mostraba aunque `mostrarBoton: false`
- **Causa:** El CSS mostraba el botón por defecto, el JS lo ocultaba después
- **Solución:** Ahora el botón está oculto por defecto en CSS

### 2. ✅ Botón Visible en la Página de Login
- **Problema:** El botón del chatbot se mostraba en el login
- **Causa:** No había verificación de la página actual
- **Solución:** Ahora verifica que el usuario esté logueado Y no esté en login

### 3. ✅ Bloqueo Premium No Funcionaba en el Chatbot
- **Problema:** Se podía acceder al chatbot sin premium
- **Causa:** El contenido se cargaba antes de verificar el acceso
- **Solución:** Todo el contenido se oculta inmediatamente hasta verificar premium

---

## 🧪 Cómo Probar las Correcciones

### IMPORTANTE: Limpiar Caché Primero

Antes de probar, **DEBES limpiar la caché del navegador** para que se carguen los nuevos archivos:

#### Opción 1: Recarga Forzada (Recomendado)
1. Abre DevTools (F12)
2. Haz clic derecho en el botón de recargar
3. Selecciona "Vaciar caché y recargar de forma forzada"

#### Opción 2: Limpiar Manualmente
1. Abre DevTools (F12)
2. Ve a la pestaña "Application" (o "Aplicación")
3. En el menú lateral: Storage → Clear site data
4. Marca todas las opciones
5. Click en "Clear site data"
6. Cierra y vuelve a abrir el navegador

#### Opción 3: Modo Incógnito
1. Abre una ventana de incógnito (Ctrl+Shift+N)
2. Ve a tu localhost

---

## 📝 Lista de Pruebas

### Prueba 1: Botón del Chatbot Oculto por Defecto

**Objetivo:** Verificar que el botón NO se muestra

**Pasos:**
1. Abre `http://localhost:XXXX` (o tu puerto)
2. Abre la consola (F12 → Console)
3. Verifica los logs

**Resultado Esperado:**
```
✅ Logs en consola:
   "🤖 Chatbot IA: Oculto (configuración: mostrarBoton = false)"

✅ Visual:
   - NO hay botón flotante verde/turquesa en la esquina inferior derecha
   - La página se carga normalmente
```

**Si falla:**
- Limpia caché y recarga
- Verifica que `config-features.js` tenga `mostrarBoton: false`
- Verifica que `styles.css` tenga `display: none` en `.chatbot-fab`

---

### Prueba 2: Botón NO se Muestra en Login

**Objetivo:** Verificar que el botón nunca aparece en la página de login

**Pasos:**
1. Cierra sesión (si estás logueado)
2. Ve a la página de login
3. Revisa la esquina inferior derecha

**Resultado Esperado:**
```
✅ NO hay botón del chatbot visible
✅ Solo ves el botón "Instalar App" (si aplica)
```

**Si falla:**
- El botón solo debería mostrarse DESPUÉS de iniciar sesión
- Verifica los logs de consola

---

### Prueba 3: Botón NO se Muestra Después de Login (Config = false)

**Objetivo:** Con `mostrarBoton: false`, el botón no debe aparecer nunca

**Pasos:**
1. Inicia sesión con tu usuario
2. Ve al dashboard
3. Navega a cualquier página (Jornales, Sueldómetro, etc.)

**Resultado Esperado:**
```
✅ En consola:
   "🤖 Chatbot IA: Oculto (configuración: mostrarBoton = false)"

✅ Visual:
   - NO hay botón del chatbot en ninguna página
```

**Si falla:**
- Verifica que `config-features.js` tenga `mostrarBoton: false`
- Limpia caché y recarga

---

### Prueba 4: Acceso Directo al Chatbot SIN Premium

**Objetivo:** Verificar que el bloqueo premium funciona

**Pasos:**
1. Asegúrate de NO tener premium activo:
   ```sql
   -- En Supabase SQL Editor:
   UPDATE usuarios_premium
   SET estado = 'canceled',
       periodo_fin = NOW(),
       features_disponibles = ARRAY[]::text[]
   WHERE chapa = 'TU_CHAPA';
   ```

2. Navega directamente a: `http://localhost:XXXX/chatbot/index.html`

3. Observa la consola y la pantalla

**Resultado Esperado:**

```
✅ En consola (F12 → Console):
   "🔒 [CHATBOT] Contenido oculto hasta verificar acceso premium"
   "🔐 [CHATBOT] Iniciando verificación de acceso premium..."
   "🔍 [CHATBOT] Verificando acceso premium para chapa: XXX"
   "🔒 [CHATBOT] Usuario sin acceso premium"

✅ Visual:
   - Pantalla morada con degradado
   - Mensaje: "🤖✨ Chatbot IA Premium"
   - Texto: "El asistente virtual inteligente está disponible solo para usuarios premium"
   - Botón: "⭐ Desbloquear Premium"
   - Botón: "Volver al Portal"
   - NO se ve NADA del chatbot (ni mensajes, ni input, ni nada)
```

**Si falla (se ve el chatbot):**
- Verifica que `chatbot/premium-check.js` se cargue correctamente
- Limpia caché del navegador
- Verifica que el archivo esté en el HTML: `<script src="./premium-check.js?v=1"></script>`

---

### Prueba 5: Acceso Directo al Chatbot CON Premium

**Objetivo:** Verificar que usuarios premium SÍ pueden acceder

**Pasos:**
1. Activa tu premium:
   ```sql
   -- En Supabase SQL Editor:
   UPDATE usuarios_premium
   SET estado = 'active',
       periodo_inicio = NOW(),
       periodo_fin = NOW() + INTERVAL '1 year',
       features_disponibles = ARRAY['sueldometro', 'oraculo', 'chatbot_ia']::text[]
   WHERE chapa = 'TU_CHAPA';
   ```

2. Navega a: `http://localhost:XXXX/chatbot/index.html`

3. Observa la consola y la pantalla

**Resultado Esperado:**

```
✅ En consola:
   "🔒 [CHATBOT] Contenido oculto hasta verificar acceso premium"
   "🔐 [CHATBOT] Iniciando verificación de acceso premium..."
   "🔍 [CHATBOT] Verificando acceso premium para chapa: XXX"
   "✅ [CHATBOT] Usuario tiene acceso premium - permitiendo acceso"
   "🔓 [CHATBOT] Desbloqueando contenido..."
   "✅ [CHATBOT] Contenido desbloqueado"

✅ Visual:
   - El chatbot se carga normalmente
   - Ves el mensaje de bienvenida
   - Ves el input para escribir
   - Ves los chips de acciones rápidas
   - Todo funciona con normalidad
```

**Si falla:**
- Verifica que la query SQL se ejecutó correctamente
- Verifica los logs de la RPC en consola
- Verifica que `supabaseClient` esté disponible

---

### Prueba 6: Activar el Botón del Chatbot (Opcional)

**Objetivo:** Verificar que el botón se muestra cuando se activa

**Pasos:**
1. Edita `config-features.js`:
   ```javascript
   CHATBOT_IA: {
     mostrarBoton: true,  // ← Cambiado a true
   }
   ```

2. Guarda el archivo
3. Recarga la página (Ctrl+R)
4. Inicia sesión si no lo estás

**Resultado Esperado:**

```
✅ En consola:
   "🤖 Chatbot IA: Visible"

✅ Visual:
   - Ves el botón flotante verde/turquesa con un icono de chat
   - Tiene una estrellita (✨) en la esquina
   - Está en la esquina inferior derecha
   - NO se ve en el login
   - SÍ se ve después de iniciar sesión
```

**Al hacer clic en el botón:**
- Si NO tienes premium → Ves el bloqueo premium
- Si SÍ tienes premium → Se abre el chatbot normalmente

---

### Prueba 7: Verificar Bloqueo en Sueldómetro y Oráculo

**Objetivo:** Asegurar que el resto del sistema premium funciona

**Pasos:**
1. Quita tu premium:
   ```sql
   UPDATE usuarios_premium
   SET estado = 'canceled', periodo_fin = NOW(), features_disponibles = ARRAY[]::text[]
   WHERE chapa = 'TU_CHAPA';
   ```

2. Ve al Sueldómetro
3. Ve al Oráculo

**Resultado Esperado:**

```
✅ Ambas páginas muestran overlay de bloqueo
✅ Mensaje: "Feature Premium"
✅ Botón: "Desbloquear por €4.99/mes"
```

---

## 📊 Checklist Final

Marca cada prueba cuando la completes:

- [ ] **Prueba 1:** Botón oculto por defecto ✅
- [ ] **Prueba 2:** Botón NO en login ✅
- [ ] **Prueba 3:** Botón NO después de login (config=false) ✅
- [ ] **Prueba 4:** Bloqueo premium funciona (sin premium) ✅
- [ ] **Prueba 5:** Acceso permitido (con premium) ✅
- [ ] **Prueba 6:** Botón visible al activar (opcional) ✅
- [ ] **Prueba 7:** Sueldómetro y Oráculo bloqueados ✅

---

## 🚨 Problemas Comunes

### "Sigo viendo el botón aunque config dice false"
**Solución:**
1. Limpia caché del navegador (Ctrl+Shift+R)
2. Verifica que `config-features.js` se cargó: `console.log(window.FEATURES_CONFIG)`
3. Cierra y abre el navegador

### "El chatbot no se bloquea, puedo usarlo sin premium"
**Solución:**
1. Limpia caché (importante!)
2. Verifica que `chatbot/premium-check.js` existe
3. Verifica en consola que aparecen los logs de `[CHATBOT]`
4. Verifica que Supabase está conectado: `console.log(window.supabaseClient)`

### "Me sale error de Supabase en el chatbot"
**Solución:**
1. Verifica que `chatbot/supabase.js` se carga correctamente
2. Verifica las credenciales de Supabase
3. Verifica que la función RPC `tiene_acceso_feature` existe en tu base de datos

### "El botón aparece y desaparece rápido"
**Solución:**
- Esto es normal si el JS aún se está ejecutando
- Si persiste, limpia caché
- El comportamiento correcto es que NUNCA aparezca si `mostrarBoton: false`

---

## ✅ Confirmación de Éxito

Si todas las pruebas pasan, tu sistema está funcionando correctamente:

✅ **Control de visibilidad:** El botón solo se muestra si `mostrarBoton: true`
✅ **Login protegido:** El botón nunca aparece en login
✅ **Bloqueo premium:** El chatbot verifica premium antes de mostrar contenido
✅ **Usuario premium:** Usuarios con premium tienen acceso completo
✅ **Resto del sistema:** Sueldómetro y Oráculo siguen bloqueados correctamente

---

## 📝 Notas Finales

1. **Recuerda dejar `mostrarBoton: false`** mientras mejoras el chatbot con OpenAI
2. **Cuando esté listo**, simplemente cambia a `true` y haz commit
3. **El bloqueo premium siempre estará activo** independientemente de la visibilidad del botón
4. **Restaura tu premium después de las pruebas:**
   ```sql
   UPDATE usuarios_premium
   SET estado = 'active',
       periodo_fin = NOW() + INTERVAL '1 year',
       features_disponibles = ARRAY['sueldometro', 'oraculo', 'chatbot_ia']::text[]
   WHERE chapa = 'TU_CHAPA';
   ```

---

**¡Todo debería funcionar correctamente ahora!** 🎉
