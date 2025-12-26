# 🚀 Desplegar AHORA - 5 Minutos

## ✅ YA ESTÁ TODO CONFIGURADO

El chatbot está listo para producción. Los usuarios **NO configuran nada**.

---

## 📝 Pasos para Desplegar (5 minutos)

### 1. Crea API Key Dedicada (2 min)

1. Ve a: https://platform.openai.com/api-keys
2. Clic en **"Create new secret key"**
3. Nombre: `Portal Estiba VLC - Producción`
4. Clic en **"Create secret key"**
5. **COPIA LA KEY** (solo se muestra una vez)

### 2. Configura Límites de Gasto (1 min)

1. Ve a: https://platform.openai.com/settings/organization/limits
2. Configura:
   - **Monthly budget**: $50
   - **Daily budget**: $10
3. Guarda cambios

### 3. Actualiza la Key en el Código (1 min)

Abre `chatbot/openai-assistants.js` y reemplaza en la **línea 18**:

```javascript
this.apiKey = localStorage.getItem('openai_api_key') ||
              'TU-NUEVA-KEY-AQUI';  // ⬅️ Pega tu nueva key aquí
```

### 4. Sube a Producción (1 min)

Sube estos archivos a tu servidor:

```
chatbot/
├── openai-assistants.js  (con nueva key)
├── ai-engine.js
└── index.html
```

---

## 🧪 Prueba en Producción

Abre tu chatbot en producción y pregunta:

```
¿Qué días son festivos?
¿Cuántos días de vacaciones tengo?
¿Qué es el V Acuerdo Marco?
```

✅ **Debe funcionar sin configurar nada**

---

## 📊 Monitorea Uso

Ve a: https://platform.openai.com/usage

Revisa diariamente:
- Número de consultas
- Costo diario
- Picos inusuales

---

## ✅ ¡LISTO!

Tu chatbot está en producción. Los usuarios solo abren y preguntan.

**Costo estimado:** $5-10/mes con 100 usuarios/día

---

## 🔒 Seguridad Extra (Opcional)

Si quieres más seguridad, lee `DESPLIEGUE_PRODUCCION.md` para implementar un backend proxy.

---

## ❓ Si Algo Falla

### "API key no válida"
- Verifica que copiaste bien la key
- Asegúrate de no tener espacios al inicio/final

### "Límite de consultas alcanzado"
- Aumenta los límites en OpenAI
- O espera a que se reinicie (cada 24h)

### Los usuarios ven error
- Abre la consola del navegador (F12)
- Busca errores en rojo
- Mándame el error

---

## 📞 Soporte

Si tienes problemas:
1. Abre consola (F12)
2. Copia el error
3. Mándamelo

**¡Ya está todo listo para producción!** 🎉
