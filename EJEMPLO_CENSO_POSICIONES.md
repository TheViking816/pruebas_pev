# Ejemplo: Añadir Posiciones al Censo Visual

Este documento contiene instrucciones para añadir la posición de cada chapa en el censo visual.

---

## 📋 Objetivo

Mostrar la posición de cada trabajador en el censo, al lado o encima de su nombre/chapa.

**Antes:**
```
816 - Juan Pérez González
```

**Después:**
```
816 [Pos: 45] - Juan Pérez González
```

---

## 🔍 Paso 1: Localizar el Archivo del Censo

Busca el archivo que renderiza el censo. Probablemente sea uno de estos:
- `pages/censo.html`
- `scripts/censo.js`
- Dentro de `index.html` en una sección con `id="censo-page"`

**Cómo encontrarlo:**
1. Abre `index.html`
2. Busca `data-page="censo"` o `id="censo-page"`
3. Si el contenido está en otro archivo, busca `censo.html` o `censo.js`

---

## 📊 Paso 2: Verificar la Fuente de Datos

Necesitas verificar de dónde vienen los datos del censo:

### Opción A: Desde Supabase (tabla `censo_trabajadores`)

Si usas Supabase, verifica que la tabla `censo_trabajadores` tenga el campo `posicion`:

```sql
-- Verificar estructura de la tabla
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'censo_trabajadores';
```

Si NO existe el campo `posicion`, añádelo:

```sql
-- Añadir columna posicion si no existe
ALTER TABLE censo_trabajadores
ADD COLUMN IF NOT EXISTS posicion INTEGER;

-- Actualizar posiciones basándose en el orden actual
WITH ranked AS (
  SELECT
    chapa,
    ROW_NUMBER() OVER (ORDER BY chapa) as nueva_posicion
  FROM censo_trabajadores
)
UPDATE censo_trabajadores ct
SET posicion = r.nueva_posicion
FROM ranked r
WHERE ct.chapa = r.chapa;
```

### Opción B: Desde Google Sheets API

Si usas Google Sheets, verifica que los datos incluyan la posición:

```javascript
// En window.SheetsAPI.getCenso() o similar
// Asegúrate de que el objeto retornado incluya posicion:
{
  chapa: 816,
  nombre: "Juan Pérez",
  posicion: 45,  // <-- Debe estar presente
  disponible: true
}
```

---

## 🎨 Paso 3: Modificar el HTML del Censo

### Ejemplo 1: Estructura Simple

Si tu censo tiene una estructura simple como esta:

```html
<!-- ANTES -->
<div class="censo-item">
  <span class="chapa">816</span>
  <span class="nombre">Juan Pérez González</span>
</div>
```

Cámbiala a:

```html
<!-- DESPUÉS -->
<div class="censo-item">
  <div class="chapa-info">
    <span class="chapa">816</span>
    <span class="posicion">Pos: 45</span>
  </div>
  <span class="nombre">Juan Pérez González</span>
</div>
```

### Ejemplo 2: Con JavaScript Dinámico

Si el HTML se genera dinámicamente en JavaScript:

```javascript
// ANTES
censoContainer.innerHTML = chapas.map(chapa => `
  <div class="censo-item">
    <span class="chapa">${chapa.numero}</span>
    <span class="nombre">${chapa.nombre}</span>
  </div>
`).join('');

// DESPUÉS
censoContainer.innerHTML = chapas.map(chapa => `
  <div class="censo-item">
    <div class="chapa-info">
      <span class="chapa">${chapa.numero}</span>
      <span class="posicion">Pos: ${chapa.posicion || '-'}</span>
    </div>
    <span class="nombre">${chapa.nombre}</span>
  </div>
`).join('');
```

---

## 🎨 Paso 4: Añadir Estilos CSS

Añade estos estilos a tu archivo CSS principal (probablemente `styles.css`):

```css
/* Contenedor de chapa y posición */
.chapa-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Número de chapa */
.chapa {
  font-weight: 700;
  color: #1e40af;
  font-size: 1rem;
  min-width: 50px;
}

/* Badge de posición */
.posicion {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  white-space: nowrap;
}

/* Variantes de color según la posición */
.posicion.top {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  border-color: #fbbf24;
}

.posicion.middle {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border-color: #60a5fa;
}

.posicion.bottom {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #6b7280;
  border-color: #d1d5db;
}
```

---

## 🎯 Paso 5: Añadir Lógica para Colores (Opcional)

Para que las posiciones tengan diferentes colores según su rango:

```javascript
/**
 * Obtiene la clase CSS según la posición en el censo
 */
function getPosicionClass(posicion, totalChapas) {
  const porcentaje = (posicion / totalChapas) * 100;

  if (porcentaje <= 20) {
    return 'top'; // Top 20% (primeras posiciones)
  } else if (porcentaje <= 60) {
    return 'middle'; // 60% medio
  } else {
    return 'bottom'; // 40% últimas posiciones
  }
}

// Uso en el renderizado:
censoContainer.innerHTML = chapas.map(chapa => {
  const posicionClass = getPosicionClass(chapa.posicion, chapas.length);

  return `
    <div class="censo-item">
      <div class="chapa-info">
        <span class="chapa">${chapa.numero}</span>
        <span class="posicion ${posicionClass}">Pos: ${chapa.posicion || '-'}</span>
      </div>
      <span class="nombre">${chapa.nombre}</span>
    </div>
  `;
}).join('');
```

---

## 📱 Paso 6: Diseño Responsive

Para móviles, ajusta el diseño para que se vea bien en pantallas pequeñas:

```css
/* Responsive para móviles */
@media (max-width: 640px) {
  .chapa-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .posicion {
    font-size: 0.7rem;
    padding: 0.1rem 0.4rem;
  }
}
```

---

## 🔄 Paso 7: Actualizar la Consulta de Datos

### Si usas Supabase:

```javascript
// ANTES
const { data: censoData, error } = await window.supabase
  .from('censo_trabajadores')
  .select('chapa, nombre, disponible')
  .order('chapa');

// DESPUÉS
const { data: censoData, error } = await window.supabase
  .from('censo_trabajadores')
  .select('chapa, nombre, disponible, posicion')
  .order('posicion'); // O mantén 'chapa' si prefieres
```

### Si usas Google Sheets:

Asegúrate de que el método que obtiene los datos incluya la columna de posición:

```javascript
// En window.SheetsAPI.getCenso() o similar
async getCenso() {
  // ... código de obtención de datos ...

  return datos.map((row, index) => ({
    chapa: row[0],
    nombre: row[1],
    disponible: row[2],
    posicion: row[3] || (index + 1) // Columna de posición o calcular
  }));
}
```

---

## 🎨 Variantes de Diseño

### Variante 1: Posición como Badge Pequeño Arriba

```html
<div class="censo-item">
  <div class="chapa-container">
    <span class="posicion-mini">45</span>
    <span class="chapa">816</span>
  </div>
  <span class="nombre">Juan Pérez González</span>
</div>
```

```css
.chapa-container {
  position: relative;
  display: inline-block;
}

.posicion-mini {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  font-size: 0.625rem;
  font-weight: 700;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  line-height: 1;
}
```

### Variante 2: Posición como Texto Secundario

```html
<div class="censo-item">
  <div class="chapa-info">
    <span class="chapa">816</span>
    <span class="nombre">Juan Pérez González</span>
    <span class="posicion-text">Posición en censo: 45</span>
  </div>
</div>
```

```css
.posicion-text {
  font-size: 0.75rem;
  color: #6b7280;
  font-style: italic;
}
```

### Variante 3: Posición con Icono

```html
<div class="censo-item">
  <div class="chapa-info">
    <span class="chapa">816</span>
    <span class="posicion">
      <svg class="icon-pos" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
        <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
      </svg>
      45
    </span>
  </div>
  <span class="nombre">Juan Pérez González</span>
</div>
```

```css
.posicion {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.icon-pos {
  color: #6b7280;
}
```

---

## ✅ Testing

Pasos para verificar que funciona correctamente:

1. Verifica que los datos incluyen el campo `posicion`
2. Recarga la página del censo
3. Verifica que cada chapa muestra su posición
4. Prueba en móvil para asegurar que el diseño responsive funciona
5. Si usas colores dinámicos, verifica que las primeras posiciones tienen color dorado/amarillo

---

## 🔧 Troubleshooting

### Problema: Las posiciones no aparecen

**Solución:**
- Verifica que la consulta a la base de datos incluye el campo `posicion`
- Abre la consola del navegador (F12) y verifica que los datos tienen `posicion`
- Revisa que el HTML se está generando correctamente

### Problema: Las posiciones están desordenadas

**Solución:**
- Asegúrate de ordenar por `posicion` en la consulta:
  ```javascript
  .order('posicion', { ascending: true })
  ```

### Problema: Algunas posiciones son `null` o `-`

**Solución:**
- Actualiza la base de datos para asignar posiciones:
  ```sql
  UPDATE censo_trabajadores
  SET posicion = (
    SELECT COUNT(*) + 1
    FROM censo_trabajadores c2
    WHERE c2.chapa < censo_trabajadores.chapa
  )
  WHERE posicion IS NULL;
  ```

---

¡Listo! Con esto tendrás las posiciones visibles en el censo de trabajadores.
