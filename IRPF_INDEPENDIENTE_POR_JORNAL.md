# IRPF Independiente por Jornal - Documentación

## 📋 Resumen del Cambio

Se ha implementado un sistema donde cada jornal **guarda y mantiene el porcentaje de IRPF** que tenía cuando se calculó por primera vez. Esto evita que cambios futuros en el IRPF afecten retroactivamente a jornales de meses anteriores.

## 🎯 Problema Solucionado

**Antes**: Si en Noviembre tenías un IRPF del 40% y en Diciembre lo cambias a 45%, el sistema recalculaba TODOS los jornales (incluyendo los de Noviembre) con el 45%.

**Ahora**: Los jornales de Noviembre mantienen su 40% original, y solo los nuevos jornales de Diciembre en adelante usan el 45%.

## 🔧 Cambios Implementados

### 1. **Base de Datos (Supabase)**
- **Nueva columna** `irpf_aplicado` en la tabla `jornales`
- Almacena el porcentaje de IRPF específico de cada jornal
- Los jornales sin esta columna (antiguos) usan el IRPF actual del usuario

### 2. **Código JavaScript**

#### **supabase.js**
- `guardarJornalManual()`: Ahora guarda el campo `irpf_aplicado` cuando se proporciona
- `saveJornalManual()`: Acepta un nuevo parámetro opcional `irpfActual` para asignar IRPF a nuevos jornales

#### **app.js**
- **Carga de jornales**: Cada jornal recibe su `irpf_aplicado` (guardado o actual)
- **Cálculos de neto**:
  - Total global: Suma usando el IRPF específico de cada jornal
  - Total por quincena: Suma usando el IRPF específico de cada jornal
  - Filas individuales: Muestran el neto con su IRPF específico
- **Función `actualizarIRPF()`**: Respeta el IRPF histórico de cada jornal
  - Lee el `data-irpf-aplicado` de cada fila
  - No recalcula jornales con IRPF guardado
- **Guardado de jornales manuales**: Obtiene el IRPF actual del usuario y lo asigna al jornal
- **Atributo `data-irpf-aplicado`**: Cada fila de jornal en el DOM guarda su IRPF

## 📝 Instrucciones de Instalación

### Paso 1: Ejecutar Migración SQL en Supabase

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Navega a **SQL Editor**
3. Abre el archivo `migracion_irpf_por_jornal.sql`
4. Copia todo el contenido
5. Pégalo en el SQL Editor de Supabase
6. Haz clic en **RUN** para ejecutar la migración

**Contenido de la migración:**
```sql
-- Añade la columna irpf_aplicado a la tabla jornales
ALTER TABLE jornales
ADD COLUMN IF NOT EXISTS irpf_aplicado numeric DEFAULT NULL;

-- Comentario explicativo
COMMENT ON COLUMN jornales.irpf_aplicado IS
'Porcentaje de IRPF aplicado a este jornal en el momento de su cálculo.
Si es NULL, se usa el IRPF actual del usuario.';
```

### Paso 2: Desplegar los Cambios en el Código

Los cambios en `app.js` y `supabase.js` ya están listos y funcionarán automáticamente una vez ejecutes la migración.

## 🧪 Pruebas

### Caso de Prueba 1: Jornales Existentes
1. Los jornales anteriores a esta actualización NO tienen `irpf_aplicado`
2. Usarán el IRPF actual del usuario hasta que se recargue la página después de un cambio de IRPF
3. **Comportamiento esperado**: Mantienen el IRPF que estaba configurado cuando se implementó este cambio

### Caso de Prueba 2: Nuevos Jornales
1. Crea un jornal manual con IRPF = 40%
2. Cambia el IRPF a 45%
3. Crea otro jornal manual
4. **Resultado esperado**:
   - Primer jornal: Se muestra con IRPF 40%
   - Segundo jornal: Se muestra con IRPF 45%

### Caso de Prueba 3: Cambio de IRPF
1. Ten jornales con diferentes IRPFs
2. Cambia el IRPF global (por ejemplo, de 40% a 45%)
3. **Resultado esperado**:
   - Jornales antiguos: Mantienen su IRPF original
   - Total neto global: Se calcula correctamente sumando cada jornal con su IRPF
   - Label de total neto: Muestra "Total Neto (Anual con IRPF aplicado)"

## 📊 Visualización

- **Estadísticas globales**: Ahora muestran "Total Neto (Anual con IRPF aplicado)" en lugar de mostrar un porcentaje único
- **Jornales individuales**: Cada jornal mantiene su propio IRPF internamente
- **Totales por quincena**: Se calculan sumando cada jornal con su IRPF específico

## 🔒 Jornales Históricos

Los jornales que ya existen en la base de datos antes de esta actualización:
- **No tienen** `irpf_aplicado` guardado (valor `NULL`)
- **Usarán** el IRPF actual del usuario
- Si quieres asignarles un IRPF histórico específico, puedes ejecutar:

```sql
-- Asignar a todos los jornales existentes el IRPF de su usuario
UPDATE jornales j
SET irpf_aplicado = (
  SELECT irpf_porcentaje
  FROM configuracion_usuario cu
  WHERE cu.chapa = j.chapa
)
WHERE irpf_aplicado IS NULL;
```

## 🚀 Funcionalidades Adicionales Implementadas

### ✅ Bloquear IRPF por quincena (IMPLEMENTADO)
Cada quincena ahora tiene un botón de candado (🔓/🔒) que permite bloquear el IRPF de todos sus jornales.

**Cómo funciona:**
- Click en el candado 🔓 → Se asigna el IRPF actual a todos los jornales de la quincena
- Los jornales quedan "congelados" con ese IRPF
- Click en 🔒 para desbloquear la quincena
- El estado se guarda en localStorage

**Casos de uso:**
- Cerrar quincenas antiguas para evitar cambios accidentales
- Fijar el IRPF de un mes completo antes de cambiar el porcentaje

### ✅ Indicador visual de IRPF diferente (IMPLEMENTADO)
Los jornales que tienen un IRPF diferente al actual muestran un badge naranja con el porcentaje.

**Características:**
- Badge animado con efecto pulse
- Tooltip informativo al pasar el mouse
- Color naranja distintivo para fácil identificación
- Solo aparece cuando el IRPF del jornal ≠ IRPF actual

### ✅ Leyenda del censo mejorada (IMPLEMENTADO)
La leyenda del censo ahora incluye información sobre las posiciones SP/OC:

- **Posición SP (1-455)**: Badge amarillo
- **Posición OC (456+)**: Badge azul

## 🔮 Próximas Mejoras Opcionales

### Opción 1: Exportar reporte de IRPF
Generar un PDF o CSV con el desglose de IRPFs aplicados por mes/quincena.

## ❓ Preguntas Frecuentes

**P: ¿Qué pasa si elimino la columna irpf_aplicado de un jornal?**
R: El jornal usará el IRPF actual del usuario.

**P: ¿Cómo puedo ver qué IRPF tiene asignado un jornal?**
R: Puedes consultar directamente en Supabase: `SELECT chapa, fecha, irpf_aplicado FROM jornales ORDER BY fecha DESC;`

**P: ¿Los jornales importados del CSV tendrán IRPF asignado?**
R: Los jornales importados del CSV NO tendrán `irpf_aplicado` por defecto. Si quieres asignarles un IRPF, deberías modificar la función de importación `syncJornalesFromCSV`.

## 📁 Archivos Modificados

### Base de datos
- `migracion_irpf_por_jornal.sql` - Migración SQL para añadir columna `irpf_aplicado` (NUEVO)

### JavaScript
- `supabase.js` - Modificaciones en funciones de guardado de jornales
- `app.js` - Modificaciones extensas:
  - Carga y asignación de IRPF a jornales
  - Cálculos de neto (global, quincena, individual)
  - Función `actualizarIRPF()` respetando históricos
  - Sistema de bloqueo de quincenas
  - Indicador visual de IRPF diferente

### HTML
- `index.html` - Leyenda del censo mejorada con badges SP/OC

### CSS
- `styles.css` - Nuevos estilos:
  - `.btn-lock-quincena` y `.btn-lock-quincena.locked` (botón de bloqueo)
  - `.badge-irpf-diff` (indicador de IRPF diferente)
  - `.censo-badge-sp` y `.censo-badge-oc` (badges de leyenda)
  - `.censo-legend-divider` (separador de leyenda)
  - Animación `pulseIRPF` para el badge

### Documentación
- `IRPF_INDEPENDIENTE_POR_JORNAL.md` - Documentación completa (NUEVO)

## ✅ Checklist de Implementación

### Sistema Base de IRPF por Jornal
- [x] Crear migración SQL
- [x] Modificar función de guardado de jornales
- [x] Actualizar carga de jornales para asignar IRPF
- [x] Modificar cálculos de neto (global, quincena, individual)
- [x] Actualizar función actualizarIRPF para respetar históricos
- [x] Actualizar labels de visualización

### Funcionalidades Adicionales
- [x] Implementar sistema de bloqueo de IRPF por quincena
- [x] Añadir indicador visual de IRPF diferente al actual
- [x] Mejorar leyenda del censo con badges SP/OC

### Pendiente
- [ ] **Ejecutar migración SQL en Supabase** ← PENDIENTE
- [ ] Probar con jornales reales
- [ ] Validar funcionamiento en PWA

---

**Fecha de implementación**: 2025-12-07
**Versión**: 2.0 (con funcionalidades adicionales)
