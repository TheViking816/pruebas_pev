# Cambios Realizados en el Chatbot y PWA

## ✅ Cambios Completados

### 1. Eliminación de Referencias de Source en Respuestas del Assistant
**Archivo modificado:** `chatbot/openai-assistants.js`

- **Problema:** Las respuestas del chatbot mostraban referencias como `【4:2†source】【4:5†source】`
- **Solución:** Se añadió un regex para limpiar estas referencias antes de devolver la respuesta al usuario
- **Código añadido (línea 235):**
  ```javascript
  // Limpiar referencias de source que vienen del assistant (ej: 【4:2†source】)
  respuestaTexto = respuestaTexto.replace(/【\d+:\d+†source】/g, '');
  ```

### 2. Restructuración de Secciones V Acuerdo Marco y Guía de Contratación
**Archivos modificados:**
- `chatbot/index.html`
- `chatbot/chat-styles.css`

- **Problema:** Los títulos de sección (ej: "Contratación y Estabilidad") aparecían como clicables pero el chatbot no sabía cómo responder
- **Solución:**
  - Se añadió la clase `section-title` a los títulos de sección en el HTML
  - Se añadieron estilos CSS para que no sean clicables (`pointer-events: none`)
  - Se organizó la Guía de Contratación en subapartados:
    - Horarios y Jornadas
    - Localización y Disponibilidad
    - Prioridades y Asignación
    - Sustituciones y Festivos
    - Controles y Normativa

### 3. Sistema de Calendario de Pago
**Archivos creados/modificados:**
- `supabase_calendario_pago.sql` (nuevo)
- `chatbot/ai-engine.js`
- `chatbot/pwa-data-bridge.js`

#### Base de Datos
Se creó la tabla `calendario_pago` en Supabase con:
- Campos: `anio`, `mes`, `quincena`, `periodo_descripcion`, `fecha_pago_inicio`, `fecha_pago_fin`
- Funciones auxiliares: `obtener_fechas_pago()`, `obtener_proximo_pago()`
- Datos precargados para todo 2025

**Para usar el SQL:**
1. Abre Supabase
2. Ve a SQL Editor
3. Ejecuta el archivo `supabase_calendario_pago.sql`
4. La tabla se creará con todos los datos de 2025

#### Integración con Chatbot
- **Nuevo intent:** `calendario_pago` que captura preguntas como:
  - "¿Cuándo voy a cobrar?"
  - "¿Cuándo me pagan?"
  - "¿Cuándo es el pago de esta quincena?"

- **Lógica implementada:**
  - Detecta automáticamente la quincena actual
  - Calcula qué quincena se cobra (la segunda del mes pasado si estamos en la primera, o la primera de este mes si estamos en la segunda)
  - Devuelve las fechas de pago en formato legible

- **Respuesta del chatbot:**
  ```
  💰 Calendario de Pago

  Segunda quincena de diciembre 2024

  Cobrarás entre el 5 de enero y el 7 de enero

  Se cobra quincenalmente. Los días de pago varían ligeramente según el mes.
  ```

---

## 📋 Tareas Pendientes (Para Implementar)

### 4. Implementar Visualización del Tablón de Contratación

**Objetivo:** Crear una sección visual que muestre la última jornada contratada, agrupada por:
- Empresas → Barcos → Partes → Chapas

**Estructura propuesta:**
```
Empresa: MSC
  ├─ Barco: MSC STELLA (Parte 1)
  │   ├─ Chapa 123 - Especialista - 08-14
  │   └─ Chapa 456 - Grúa - 08-14
  ├─ Barco: MSC STELLA (Parte 2)
  │   └─ Chapa 789 - Especialista - 08-14
  └─ Barco: MSC MOON (Parte 1)
      └─ Chapa 321 - Trinca - 14-20

Empresa: APM
  └─ Barco: APM EXPRESS (Parte 1)
      ├─ Chapa 111 - Grúa - 08-14
      └─ Chapa 222 - Especialista - 08-14
```

**Implementación sugerida:**

1. **Crear nueva página en la navegación:**
   - Añadir botón en `index.html` sidebar:
   ```html
   <button class="nav-link" data-page="tablon">
     <svg>...</svg>
     Tablón de Contratación
   </button>
   ```

2. **Crear archivo `pages/tablon.html`:**
   - Estructura HTML para mostrar el tablón con acordeones colapsables
   - Diseño visual atractivo con colores diferenciados por empresa

3. **Crear archivo `scripts/tablon.js`:**
   - Consultar la tabla `jornales` de Supabase
   - Filtrar solo la última jornada con contratación
   - Agrupar los datos por empresa > barco > parte
   - Renderizar el HTML dinámicamente

4. **Query SQL para obtener datos:**
   ```sql
   -- Obtener la última jornada con contratación
   SELECT DISTINCT fecha
   FROM jornales
   WHERE empresa IS NOT NULL
   ORDER BY fecha DESC
   LIMIT 1;

   -- Obtener todas las contrataciones de esa jornada
   SELECT
     chapa,
     empresa,
     buque,
     parte,
     especialidad,
     turno
   FROM jornales
   WHERE fecha = [ultima_fecha]
     AND empresa IS NOT NULL
   ORDER BY empresa, buque, parte, chapa;
   ```

5. **Estilos CSS sugeridos:**
   - Acordeones colapsables para empresas
   - Badges de colores para especialidades
   - Iconos para turnos
   - Diseño responsive con grid/flexbox

### 5. Añadir Posiciones al Censo Visual

**Objetivo:** Mostrar la posición de cada chapa al lado, encima o debajo de su nombre en el censo.

**Ubicación:** Página de censo (`data-page="censo"`)

**Implementación sugerida:**

1. **Buscar el archivo que renderiza el censo:**
   - Probablemente en `scripts/censo.js` o similar
   - O directamente en `pages/censo.html`

2. **Modificar la estructura del HTML del censo:**
   ```html
   <!-- ANTES -->
   <div class="chapa-item">
     <span class="chapa-numero">816</span>
     <span class="chapa-nombre">Juan Pérez</span>
   </div>

   <!-- DESPUÉS -->
   <div class="chapa-item">
     <div class="chapa-info">
       <span class="chapa-numero">816</span>
       <span class="chapa-posicion">Pos: 45</span>
     </div>
     <span class="chapa-nombre">Juan Pérez</span>
   </div>
   ```

3. **Obtener la posición desde los datos:**
   - Si ya se consulta la tabla `censo_trabajadores`, añadir el campo `posicion`
   - Si no, hacer una query que incluya la posición ordenada

4. **Estilos CSS:**
   ```css
   .chapa-posicion {
     font-size: 0.75rem;
     color: #64748b;
     background: #f1f5f9;
     padding: 0.125rem 0.375rem;
     border-radius: 4px;
     margin-left: 0.5rem;
   }
   ```

---

## 🚀 Próximos Pasos

### Para ejecutar los cambios completados:

1. **Actualizar el repositorio:**
   ```bash
   git add .
   git commit -m "Fix: Eliminar referencias source, restructurar secciones e integrar calendario de pago"
   git push
   ```

2. **Ejecutar el SQL en Supabase:**
   - Copiar el contenido de `supabase_calendario_pago.sql`
   - Ir a Supabase Dashboard > SQL Editor
   - Pegar y ejecutar el script

3. **Probar el chatbot:**
   - Recargar la PWA
   - Probar preguntas como "¿Cuándo voy a cobrar?"
   - Verificar que no aparecen referencias 【4:2†source】
   - Verificar que los títulos de sección no son clicables

### Para implementar las tareas pendientes:

**Tablón de Contratación (4-6 horas de trabajo):**
1. Crear la estructura HTML
2. Implementar la lógica JavaScript
3. Diseñar el CSS
4. Probar con datos reales

**Posiciones en Censo (1-2 horas de trabajo):**
1. Identificar archivo del censo
2. Añadir campo de posición
3. Ajustar estilos

---

## 📝 Notas Adicionales

### Pregunta "Doble Puerta"
La pregunta "¿Cómo funciona el sistema de Doble Puerta (Súper vs Diurno)?" se mantuvo en la Guía de Contratación porque:
- Está dentro de una sección con título ("Horarios y Jornadas")
- El patrón `/doble puerta/i` ya existe en `ai-engine.js` (línea 487)
- El chatbot la procesa a través de `consultar_guia_contratacion`

Si el chatbot no puede responder adecuadamente:
1. Verificar que el PDF de la Guía de Contratación tiene información sobre "Doble Puerta"
2. Si no, eliminar o comentar la línea 149 de `chatbot/index.html`:
   ```html
   <!-- <li>"¿Cómo funciona el sistema de Doble Puerta (Súper vs Diurno)?"</li> -->
   ```

### Mantenimiento del Calendario de Pago
Para añadir datos de 2026:
1. Copiar el patrón de INSERT del SQL
2. Ajustar fechas según el calendario real
3. Ejecutar en Supabase SQL Editor

---

## 🐛 Problemas Conocidos

Ninguno en los cambios implementados.

---

## 📞 Soporte

Si encuentras algún problema con los cambios implementados, verifica:
1. Que el archivo `supabase_calendario_pago.sql` se ejecutó correctamente
2. Que los archivos modificados se guardaron y se subieron al servidor
3. Que el cache del navegador se limpió (Ctrl+Shift+R)
