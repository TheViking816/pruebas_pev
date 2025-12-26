# 🤖 Asistente IA - Portal Estiba VLC

Chatbot inteligente con voz para trabajadores del Puerto de Valencia.

## 🎯 Características

### ✅ Implementado (100% Gratuito)

- ✨ **IA Local con Pattern Matching**: Motor de IA inteligente sin coste
- 🎤 **Reconocimiento de voz**: Web Speech API nativa del navegador
- 🔊 **Respuestas por voz**: Síntesis de voz en español
- 📱 **PWA Instalable**: Funciona como app nativa
- 🎨 **UI moderna**: Interfaz tipo WhatsApp optimizada para móvil
- 📊 **Integración con PWA principal**: Acceso a todos tus datos
- ⚡ **Respuestas rápidas**: Chips con preguntas comunes
- 💾 **Funciona offline**: Service Worker con caché

### 🔮 Preparado para Futuro

- 🌐 **Groq API**: Soporte para IA conversacional gratuita (requiere conexión)
- 🧠 **OpenAI GPT**: Preparado para integración (requiere API key)

## 💬 ¿Qué puedes preguntar?

### Consultas de Trabajo

- "¿Cuándo voy a trabajar?"
- "¿Qué día me toca?"
- "¿Cuándo es mi próxima jornada?"

### Posición en Censo

- "¿Mi posición?"
- "¿A cuántas posiciones estoy?"
- "¿Cuánto falta para que trabaje?"

### Jornales

- "¿Cuántos jornales llevo?"
- "Jornales de esta quincena"
- "¿Cuántos días he trabajado?"

### Salario

- "¿Cuánto voy a cobrar?"
- "Mi salario"
- "¿Cuánto llevo ganado?"

### Contratación

- "¿Dónde trabajo hoy?"
- "¿En qué empresa?"
- "¿Qué especialidad tengo?"

### Acciones

- "Ponme no disponible"
- "Ábreme el formulario de no disponibilidad"
- "Ponme el punto"

## 🚀 Instalación y Uso

### Requisitos Previos

1. Tener la PWA principal instalada
2. Haber iniciado sesión con tu chapa
3. Navegador moderno (Chrome, Edge, Safari)

### Cómo Usar

1. **Acceder al chatbot**:
   - Navega a `https://tu-dominio.com/chatbot/`
   - O desde la PWA principal, haz clic en "Asistente IA"

2. **Escribir o Hablar**:
   - Escribe tu pregunta en el campo de texto
   - O presiona el botón del micrófono y habla

3. **Acciones Rápidas**:
   - Usa los chips en la parte inferior para preguntas comunes

4. **Configuración**:
   - Haz clic en el icono de ajustes (⚙️)
   - Activa/desactiva respuestas por voz
   - Cambia el modo de IA (local, Groq, OpenAI)

## 🔧 Configuración Técnica

### Estructura de Archivos

```
chatbot/
├── index.html              # UI principal del chat
├── chat-styles.css         # Estilos modernos
├── chat-app.js             # Lógica principal
├── ai-engine.js            # Motor de IA (pattern matching)
├── voice-handler.js        # Reconocimiento y síntesis de voz
├── pwa-data-bridge.js      # Puente de datos con Supabase
├── manifest.json           # Config PWA
├── service-worker.js       # Cache offline
└── README.md               # Esta documentación
```

### Modos de IA

#### 1. Local (Por Defecto - Gratuito)

```javascript
// Configuración automática
// Sin necesidad de API keys
// Funciona offline
```

**Ventajas**:
- ✅ 100% gratuito
- ✅ Funciona sin internet
- ✅ Privacidad total (no envía datos)
- ✅ Respuesta instantánea

**Limitaciones**:
- ⚠️ Menos conversacional
- ⚠️ Patrones predefinidos

#### 2. Groq (Futuro - Gratuito)

```javascript
// Configurar en ajustes
ai_mode = 'groq'
// API key gratis en: https://console.groq.com
```

**Ventajas**:
- ✅ Gratis con límites generosos
- ✅ IA conversacional real
- ✅ Modelos: Llama 3.1, Mixtral

**Limitaciones**:
- ⚠️ Requiere conexión
- ⚠️ Límite: 30 requests/minuto

#### 3. OpenAI GPT (Futuro - De Pago)

```javascript
// Configurar en ajustes
ai_mode = 'openai'
api_key = 'sk-...'
```

**Ventajas**:
- ✅ Máxima calidad conversacional
- ✅ GPT-4o-mini muy económico

**Coste**:
- 💰 ~$0.15 por 1000 mensajes
- 💰 ~$5-10/mes con uso moderado

## 🔑 Cómo Obtener API Keys (Opcional)

### Groq (Gratis)

1. Visita: https://console.groq.com
2. Crea una cuenta gratuita
3. Ve a "API Keys"
4. Crea una nueva key
5. Cópiala y pégala en el chatbot (Ajustes)

### OpenAI (De Pago)

1. Visita: https://platform.openai.com
2. Crea una cuenta
3. Añade $5-10 de crédito
4. Ve a "API Keys"
5. Crea una nueva key
6. Cópiala y pégala en el chatbot (Ajustes)

**Recomendación**: Empieza con el modo Local. Si te gusta, prueba Groq (gratis). Solo pasa a OpenAI si necesitas máxima calidad.

## 📱 Instalación como App

### Android (Chrome/Edge)

1. Abre el chatbot en el navegador
2. Menú (⋮) → "Añadir a pantalla de inicio"
3. Elige un nombre
4. ¡Listo! Ahora tienes un icono en tu móvil

### iOS (Safari)

1. Abre el chatbot en Safari
2. Botón Compartir (📤)
3. "Añadir a pantalla de inicio"
4. ¡Listo!

## 🎨 Personalización

### Colores

Edita `chat-styles.css`:

```css
:root {
  --primary-color: #0066ff;  /* Color principal */
  --user-bubble: #0066ff;    /* Color burbujas usuario */
  --bot-bubble: #e5e7eb;     /* Color burbujas bot */
}
```

### Respuestas de la IA

Edita `ai-engine.js`:

```javascript
this.responses = {
  saludo: ["¡Hola! 👋", "¡Buenas!", ...],
  // Añade más respuestas aquí
}
```

### Intenciones (Patrones)

Edita `ai-engine.js`:

```javascript
this.intents = {
  'mi_nueva_intencion': {
    patterns: [
      /patron 1/i,
      /patron 2/i
    ],
    response: 'accion_a_ejecutar',
    confidence: 0.9
  }
}
```

## 🐛 Solución de Problemas

### El micrófono no funciona

1. Verifica permisos del navegador
2. Asegúrate de estar en HTTPS
3. Prueba con Chrome o Edge
4. En móvil: Da permisos al navegador en Ajustes

### No se conecta a la PWA principal

1. Verifica que hayas iniciado sesión
2. Revisa que `localStorage.getItem('currentChapa')` tenga valor
3. Abre la consola (F12) y busca errores

### Las respuestas son raras

1. Modo Local: Usa frases más simples y directas
2. Prueba con las acciones rápidas (chips)
3. Si usas Groq/OpenAI: Verifica tu API key

### No funciona offline

1. Verifica que el Service Worker esté registrado
2. Navega al menos una vez con internet
3. Revisa la consola: `navigator.serviceWorker.ready`

## 📊 Métricas de Uso

El chatbot guarda localmente:

- Historial de mensajes (localStorage)
- Preferencias (voz, acciones rápidas)
- Modo de IA configurado

**Privacidad**: Nada se envía a servidores externos (excepto si usas Groq/OpenAI).

## 🔮 Roadmap Futuro

### Próximas Funcionalidades

- [ ] Integración con notificaciones push
- [ ] Comandos por voz sin presionar botón
- [ ] Sugerencias inteligentes basadas en historial
- [ ] Exportar conversaciones
- [ ] Modo oscuro/claro
- [ ] Multi-idioma (valenciano, inglés)
- [ ] Acceso directo desde PWA principal

### Mejoras de IA

- [ ] Integración completa con Groq
- [ ] Integración completa con OpenAI
- [ ] Contexto conversacional
- [ ] Aprendizaje de preferencias del usuario
- [ ] Predicciones proactivas

## 📄 Licencia

Este chatbot es parte del proyecto Portal Estiba VLC.

---

**Desarrollado con ❤️ para los trabajadores del Puerto de Valencia**

¿Dudas o sugerencias? Contacta al desarrollador.
