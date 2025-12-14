# ✅ Prueba Rápida - V Acuerdo Marco Arreglado

## 🔧 Lo que Arreglé

1. ✅ **Actualizado Assistant ID** al correcto: `asst_mylG8Di8ZMKKyfr3y7ksbzCf`
2. ✅ **Mejorados los patterns** para detectar mejor preguntas sobre el V Acuerdo Marco
3. ✅ **Actualizada versión** de archivos para forzar recarga

---

## 🚀 Prueba AHORA

### 1. Recarga el Chatbot
Abre el chatbot y **recarga con Ctrl+Shift+R** (recarga forzada)

### 2. Configura API Key (si no lo hiciste)
Abre consola (F12) y ejecuta:
```javascript
window.OpenAIAssistants.setApiKey('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');
```

### 3. Prueba Estas Preguntas

#### Pregunta 1 (exacta de tu prueba):
```
¿Qué es el V Acuerdo Marco?
```

**Debe responder:**
```
📜 V Acuerdo Marco Estatal del Sector de la Estiba Portuaria:

El V Acuerdo Marco Estatal del Sector de la Estiba Portuaria es un marco
normativo que regula las relaciones laborales en el sector de la estiba en
España...
```

#### Pregunta 2:
```
¿Qué dice el V Acuerdo sobre el empleo?
```

#### Pregunta 3:
```
V Acuerdo Marco normativa
```

---

## 🔍 Verificar en la Consola

Si quieres ver qué está pasando, abre la consola (F12) y busca:

### Debe aparecer esto:
```
✅ OpenAI Assistants Manager cargado
```

### Al hacer una pregunta sobre el V Acuerdo, debe aparecer:
```
📤 Consultando assistant acuerdo_marco...
⏳ Estado: queued (intento 1/60)
⏳ Estado: in_progress (intento 2/60)
⏳ Estado: in_progress (intento 3/60)
...
✅ Respuesta obtenida del assistant
```

---

## ❌ Si No Funciona

### Error: "No se detecta el intent"
La pregunta no dispara el intent del V Acuerdo Marco.

**Solución:** Asegúrate de mencionar "v acuerdo" o "acuerdo marco" en tu pregunta.

**Prueba con:**
```
¿Qué es el v acuerdo marco?
```

### Error: "Assistant ID no configurado"
El assistant ID no está bien configurado.

**Solución:** Recarga la página con Ctrl+Shift+R

### Error: "No hay API key"
La API key no está configurada.

**Solución:** Ejecuta en consola:
```javascript
window.OpenAIAssistants.setApiKey('tu-key-aqui');
```

---

## ✅ Confirmación de Funcionamiento

Si al preguntar "¿Qué es el V Acuerdo Marco?" recibes una respuesta detallada del assistant, **TODO FUNCIONA CORRECTAMENTE**.

---

## 📊 IDs Correctos Configurados

### Convenio Colectivo:
```
asst_C1RQ9CeYEAVtUjQZTnSMhKvM
```

### V Acuerdo Marco:
```
asst_mylG8Di8ZMKKyfr3y7ksbzCf  ✅ (ACTUALIZADO)
```

---

**¿Funciona ahora?** ¡Dime si ya responde correctamente! 🚀
