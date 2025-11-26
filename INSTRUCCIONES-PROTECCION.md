# 🛡️ INSTRUCCIONES - Sistema de Protección de Código

## ✅ ¡COMPLETADO!

He creado una nueva rama con **TODAS las protecciones** implementadas:

**Rama:** `claude/proteccion-codigo-018o6LC3bLGHbrVWKrTDEost`

---

## 🔒 Protecciones Implementadas

### 1. **LICENSE** - Protección Legal 📜
- Copyright restrictivo completo
- Prohibición expresa de copiar, modificar o distribuir
- Sanciones legales de hasta **600.000€** y **4 años de prisión**
- Conforme a la Ley de Propiedad Intelectual española

### 2. **protection.js** - Protección Técnica 🛡️
- ✅ **Verificación de dominio:** Solo funciona en `theviking816.github.io`
- ✅ **Detección de copias:** Muestra advertencia si se copia a otro dominio
- ✅ **Redirección automática:** Redirige a tu URL oficial en 5 segundos
- ✅ **Advertencia en consola:** Mensaje legal en DevTools (F12)
- ✅ **Marcas de agua invisibles:** Metadata en el DOM para rastreo

### 3. **Headers de Copyright** - Marcas de Agua 📝
- Headers completos en `app.js` y `supabase.js`
- Identificación clara del propietario
- Advertencias legales visibles en el código

### 4. **README.md** - Documentación Completa 📚
- Términos de uso claros
- Advertencias para desarrolladores
- Información del proyecto
- Instrucciones para usuarios autorizados

---

## 🧪 CÓMO PROBAR LA RAMA

### OPCIÓN A: Probar localmente

```bash
# 1. Cambiar a la rama de protección
git checkout claude/proteccion-codigo-018o6LC3bLGHbrVWKrTDEost

# 2. Abrir index.html en tu navegador
# (Puedes usar Live Server de VS Code o simplemente abrir el archivo)

# 3. Probar la aplicación:
#    - Hacer login
#    - Ver dashboard
#    - Enviar mensaje en foro
#    - Etc.

# 4. Abrir DevTools (F12) y ver el mensaje de advertencia en consola
```

### OPCIÓN B: Probar en GitHub Pages (Recomendado)

1. **Ve a la configuración de GitHub Pages:**
   ```
   https://github.com/TheViking816/PortalEstibaVLC/settings/pages
   ```

2. **Cambiar la rama de despliegue:**
   - En "Source", selecciona: `claude/proteccion-codigo-018o6LC3bLGHbrVWKrTDEost`
   - Folder: `/ (root)`
   - Click en **"Save"**

3. **Esperar 1-2 minutos** (GitHub Pages se actualiza)

4. **Visitar tu URL:** https://theviking816.github.io/PortalEstibaVLC/

5. **Probar todo:**
   - ✅ Login funciona
   - ✅ Dashboard se carga
   - ✅ Jornales se muestran
   - ✅ Foro funciona
   - ✅ Abrir DevTools (F12) → Ver mensaje de advertencia

---

## ✅ Qué Verificar en las Pruebas

### Funcionalidad (TODO debe funcionar igual):
- [ ] Login con usuario y contraseña
- [ ] Dashboard se carga correctamente
- [ ] Historial de jornales visible
- [ ] Oráculo calcula probabilidades
- [ ] Foro permite leer y enviar mensajes
- [ ] Censo se muestra
- [ ] PWA se puede instalar

### Protecciones (Nuevas características):
- [ ] Abrir DevTools (F12) → Ver advertencia legal en consola
- [ ] Código fuente tiene headers de copyright
- [ ] Archivo LICENSE existe
- [ ] README.md completo visible

### Prueba de Copia (Opcional):
Si quieres verificar que la protección funciona:
1. Copia todo el código a otro directorio
2. Ábrelo en otro servidor (ej: `http://localhost:8080`)
3. Debería mostrar advertencia y redirigir a tu URL oficial

---

## 🚀 CÓMO APLICAR LAS PROTECCIONES (Mergear)

Una vez hayas probado que todo funciona:

### OPCIÓN 1: Cambiar GitHub Pages a esta rama (Más simple)

1. Ve a: https://github.com/TheViking816/PortalEstibaVLC/settings/pages
2. En "Source", selecciona: `claude/proteccion-codigo-018o6LC3bLGHbrVWKrTDEost`
3. Click en "Save"
4. ✅ **¡Listo!** Tu app ahora tiene todas las protecciones

**Ventaja:** No tocas la rama principal, solo cambias qué rama despliega GitHub Pages

### OPCIÓN 2: Mergear a rama principal

```bash
# 1. Cambiar a la rama principal
git checkout oraculo-2.0

# 2. Mergear la rama de protección
git merge claude/proteccion-codigo-018o6LC3bLGHbrVWKrTDEost

# 3. Push a la rama principal
git push origin oraculo-2.0

# 4. Verificar que GitHub Pages apunte a oraculo-2.0
# (en Settings > Pages)
```

---

## ⚠️ IMPORTANTE: Lo que CAMBIA y lo que NO

### ✅ NO CAMBIA (funciona igual):
- Funcionalidad completa de la app
- Login y autenticación
- Dashboard, jornales, foro
- PWA y modo offline
- Integración con Supabase
- **Los usuarios NO notan NINGUNA diferencia**

### ✨ SÍ CAMBIA (nuevas protecciones):
- Mensaje de advertencia legal en consola (solo visible en DevTools)
- Headers de copyright en archivos JS
- Protección contra copias en otros dominios
- Licencia restrictiva
- README con términos de uso

**En resumen:** La app funciona 100% igual para los usuarios, pero ahora está legalmente protegida.

---

## 🔍 Verificar que las Protecciones Funcionan

### 1. Advertencia en Consola
1. Abre tu PWA: https://theviking816.github.io/PortalEstibaVLC/
2. Presiona F12 (abrir DevTools)
3. Ve a la pestaña "Console"
4. Deberías ver:
   ```
   ⚠️ ADVERTENCIA LEGAL ⚠️

   ┌─────────────────────────────────────────────────────────┐
   │  ESTE CÓDIGO ES PROPIETARIO DE THEVIKING816            │
   └─────────────────────────────────────────────────────────┘

   🚫 PROHIBICIONES:
      ❌ Copiar, modificar o distribuir este código
      ...
   ```

### 2. Protección de Dominio
Para probar que bloquea copias:
1. Descarga todos los archivos
2. Súbelos a otro hosting (ej: Netlify, otro GitHub Pages)
3. Al abrirla, debería mostrar:
   - Pantalla roja con advertencia
   - "Copia No Autorizada Detectada"
   - Redirección automática a tu URL oficial

### 3. Copyright en Código
1. Abre el código fuente (View Source o Ctrl+U)
2. Verás headers de copyright en todos los archivos JS
3. Metadata en el HTML con información del propietario

---

## 📞 Si Algo No Funciona

### Si la app NO carga después del merge:
1. Revisa la consola (F12) para errores
2. Verifica que `protection.js` se carga antes que `app.js` en index.html
3. Limpia la caché del navegador (Ctrl+Shift+R)

### Si quieres deshacer los cambios:
```bash
# Volver a la rama original
git checkout oraculo-2.0

# Cambiar GitHub Pages de vuelta a oraculo-2.0
# (en Settings > Pages)
```

### Si necesitas ayuda:
- Abre un issue en GitHub
- Contacta conmigo con los detalles del error
- Incluye capturas de la consola (F12)

---

## 📊 Resumen de Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| **LICENSE** | ✨ Nuevo - Licencia propietaria completa |
| **README.md** | ✨ Nuevo - Documentación del proyecto |
| **protection.js** | ✨ Nuevo - Sistema de protección técnica |
| **index.html** | ✏️ Modificado - Carga protection.js |
| **app.js** | ✏️ Modificado - Header de copyright |
| **supabase.js** | ✏️ Modificado - Header de copyright |

**Total:** 6 archivos (3 nuevos, 3 modificados)

**Líneas añadidas:** ~620 líneas de protección

---

## 🎯 Siguiente Paso Recomendado

**Prueba la rama en GitHub Pages:**

1. Ve a: https://github.com/TheViking816/PortalEstibaVLC/settings/pages
2. Cambia "Branch" a: `claude/proteccion-codigo-018o6LC3bLGHbrVWKrTDEost`
3. Espera 1-2 minutos
4. Visita: https://theviking816.github.io/PortalEstibaVLC/
5. Prueba todas las funcionalidades
6. Abre DevTools (F12) para ver las protecciones

**Si todo funciona:** ¡Déjala así! Ya tienes todas las protecciones activas.

**Si algo falla:** Vuelve a cambiar la rama en Pages a `oraculo-2.0` y avísame.

---

```
Copyright © 2025 TheViking816
Protección de código implementada con éxito ✅
```
