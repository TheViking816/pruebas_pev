# 🤖 Cómo Activar/Desactivar el Chatbot IA

## Estado Actual
🔒 **CHATBOT OCULTO** - El botón flotante del chatbot está oculto hasta que completes la integración con OpenAI

## Cuándo Activarlo
Activa el chatbot cuando:
- ✅ Hayas integrado OpenAI GPT-4
- ✅ Hayas probado que funciona correctamente
- ✅ Estés satisfecho con la calidad de las respuestas

## Cómo Activarlo

### Paso 1: Editar el Archivo de Configuración

Abre el archivo: `config-features.js`

**Busca esta sección:**
```javascript
CHATBOT_IA: {
  mostrarBoton: false,  // ⚠️ CAMBIAR A true CUANDO QUIERAS ACTIVAR
  mensajeOculto: '🤖 Chatbot IA: Funcionalidad oculta temporalmente (en desarrollo)'
}
```

**Cámbialo a:**
```javascript
CHATBOT_IA: {
  mostrarBoton: true,  // ✅ BOTÓN VISIBLE
  mensajeOculto: '🤖 Chatbot IA: Funcionalidad oculta temporalmente (en desarrollo)'
}
```

### Paso 2: Guardar y Desplegar

1. **Guarda el archivo**
2. **Haz commit:**
   ```bash
   git add config-features.js
   git commit -m "feat: Activar botón del chatbot IA"
   git push
   ```
3. **Vercel desplegará automáticamente**
4. **Espera 1-2 minutos para el despliegue**

### Paso 3: Verificar

1. **Abre tu PWA en el navegador**
2. **Deberías ver el botón flotante del chatbot** en la esquina inferior derecha
3. **Haz clic para probarlo**

## Cómo Desactivarlo (Si Necesitas Ocultarlo de Nuevo)

Simplemente cambia `mostrarBoton` de `true` a `false`:

```javascript
mostrarBoton: false,  // Ocultar chatbot
```

Y vuelve a hacer commit y push.

## Importante ⚠️

### El Chatbot SIEMPRE Requerirá Premium

Aunque el botón esté visible, el chatbot **SIEMPRE verificará** que el usuario tenga premium antes de permitir acceso.

**Flujo de usuario sin premium:**
1. Ve el botón del chatbot ✅
2. Hace clic en el botón
3. Se abre chatbot/index.html
4. **Se muestra overlay de bloqueo premium** 🔒
5. Se le pide que se suscriba

**Flujo de usuario con premium:**
1. Ve el botón del chatbot ✅
2. Hace clic en el botón
3. Se abre chatbot/index.html
4. **Se verifica que tiene acceso** ✅
5. Puede usar el chatbot libremente

### Archivos Relacionados

Si necesitas modificar el comportamiento del bloqueo:

- **Verificación de premium:** `chatbot/premium-check.js`
- **Overlay de bloqueo:** `chatbot/premium-check.js` (función `mostrarBloqueo()`)
- **Botón flotante:** `index.html` (líneas 924-930)
- **Control de visibilidad:** `index.html` (líneas 968-988)

## Preguntas Frecuentes

### ¿El botón se oculta para todos los usuarios?
Sí, cuando `mostrarBoton: false`, TODOS los usuarios dejan de ver el botón, independientemente de si tienen premium o no.

### ¿Puedo hacer que solo ciertos usuarios vean el botón?
Sí, tendrías que modificar la lógica en `index.html` para verificar la chapa del usuario:

```javascript
document.addEventListener('DOMContentLoaded', () => {
  const chatbotFab = document.getElementById('chatbot-fab');
  const currentChapa = localStorage.getItem('currentChapa');
  const config = window.FEATURES_CONFIG.CHATBOT_IA;

  // Mostrar solo para tu chapa (testing)
  if (currentChapa === '115' && config.mostrarBoton) {
    chatbotFab.style.display = '';
  } else {
    chatbotFab.style.display = 'none';
  }
});
```

### ¿Qué pasa si alguien accede directamente a /chatbot/index.html?
El archivo `chatbot/premium-check.js` se ejecutará automáticamente al cargar la página y verificará el acceso premium. Si no tiene acceso, se mostrará el overlay de bloqueo.

### ¿Puedo probar el chatbot sin activar el botón?
Sí, simplemente navega a: `https://tu-dominio.vercel.app/chatbot/index.html`

Pero recuerda que necesitarás tener premium activo para que no te bloquee.

---

## 🎉 ¡Listo!

Cuando completes la integración con OpenAI, simplemente cambia `mostrarBoton: true` y estarás en producción.
