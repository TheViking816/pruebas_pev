# 📋 Tablón de Contratación - Solo Datos Actuales del CSV

## ✅ Cambio Implementado

El tablón ahora muestra **únicamente las contrataciones que están actualmente en el CSV de la empresa**, no el histórico acumulado.

---

## 🚀 Pasos para Implementar

### 1. Crear la tabla en Supabase

1. Abre tu **Supabase Dashboard**
2. Ve a **SQL Editor**
3. Copia y pega el contenido completo del archivo: `supabase_tablon_actual.sql`
4. Ejecuta el script
5. Verifica que se creó correctamente:
   ```sql
   SELECT * FROM public.tablon_actual LIMIT 10;
   ```

La tabla debería estar vacía inicialmente.

---

### 2. Visualizar el Tablón

1. **Recarga tu PWA** con Ctrl + Shift + R
2. Ve a la pestaña **"Tablón"**
3. La sincronización desde el CSV ocurre **automáticamente** al abrir la pestaña
4. El tablón se carga directamente con los datos actuales del CSV

---

## 🔄 Funcionamiento

### Sincronización Automática

Cada vez que abres la pestaña "Tablón", el sistema:

1. **Lee el CSV** actual de la empresa: `https://docs.google.com/spreadsheets/d/e/2PACX-1vSTtbkA94xqjf81lsR7bLKKtyES2YBDKs8J2T4UrSEan7e5Z_eaptShCA78R1wqUyYyASJxmHj3gDnY/pubhtml?gid=1388412839&single=true`

2. **Parsea los datos** con la función `SheetsAPI.syncTablonActualFromCSV()`

3. **Sobrescribe completamente** la tabla `tablon_actual`:
   - Elimina TODOS los datos anteriores (DELETE)
   - Inserta los datos nuevos del CSV (INSERT)

4. **Muestra el tablón** con los datos actualizados

---

## 📊 Diferencia entre tablas

| Tabla | Contenido | Uso |
|-------|-----------|-----|
| `jornales` | **Histórico acumulado** - todos los jornales desde siempre | Historial de jornales del usuario |
| `tablon_actual` | **Solo datos actuales del CSV** - se sobrescribe cada vez | Tablón de contratación |

---

## 🔧 Actualización del Tablón

### Sincronización Automática (Implementada)
- El tablón se sincroniza **automáticamente** cada vez que abres la pestaña
- ✅ Siempre muestra los datos más recientes del CSV
- ✅ No requiere intervención manual
- ✅ Sincronización transparente para el usuario

La función `SheetsAPI.syncTablonActualFromCSV()` se llama automáticamente al inicio de `loadTablon()` (app.js:2760)

---

## 🎯 Estructura de Datos

### Tabla `tablon_actual`

```sql
CREATE TABLE public.tablon_actual (
  id BIGSERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  chapa TEXT NOT NULL,
  puesto TEXT NOT NULL,
  jornada TEXT NOT NULL,
  empresa TEXT NOT NULL,
  buque TEXT NOT NULL,
  parte TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Ejemplo de datos:

| fecha | chapa | puesto | jornada | empresa | buque | parte |
|-------|-------|--------|---------|---------|-------|-------|
| 2025-11-03 | 683 | Especialista | 20 a 02 | APM | MAERSK CINCINNATI | 31912 |
| 2025-11-03 | 919 | Trincador | 20 a 02 | APM | -- | 31666 |
| 2025-11-03 | 472 | Conductor de 1a | 20 a 02 | APM | -- | 31928 |

---

## 🐛 Solución de Problemas

### Problema: "No hay datos del tablón"
**Posibles causas:**
1. **El CSV está vacío** - No hay contrataciones actuales
2. **El CSV no está accesible** - Verifica que la URL funciona en el navegador
3. **Error de permisos en Supabase** - Verifica que ejecutaste el script SQL completo
4. **No hay conexión a internet**

**Solución:** Abre la consola del navegador (F12) y busca mensajes de sincronización o errores

### Problema: El tablón no se actualiza
**Solución:**
1. Recarga la pestaña (Ctrl + Shift + R)
2. La sincronización ocurre automáticamente al cargar
3. Revisa la consola (F12) para ver los logs de sincronización

---

## 📝 Logs y Depuración

Cuando abras la pestaña "Tablón", verás en la consola (F12 → Console):

```
🔄 Sincronizando tablón desde CSV...
✅ Tablón sincronizado: 157 registros actualizados
📊 Obtenidos 157 registros del CSV
🗑️ Datos antiguos eliminados
✅ Lote 1 insertado (157 registros)
✅ Sincronización completa: 157 registros actualizados
```

---

## 🎨 Visualización de Grupos Especiales

El tablón ahora separa correctamente:

### 1. **Barcos reales** (buque != "--")
- Icono: 🚢
- Imagen: Grúas del puerto

### 2. **Grupo "Trincadores"** (buque = "--" y puesto = "Trincador")
- Icono: 👷
- Etiqueta: "🔗 Trincadores (Sin barco asignado)"
- Imagen: Operaciones de trincado

### 3. **Grupo "R/E"** (buque = "--" y puesto != "Trincador")
- Icono: 📋
- Etiqueta: "📋 R/E - Personal OC (Sin barco asignado)"
- Imagen: Puerto personalizada

---

## ✅ Checklist de Implementación

- [x] Ejecutar `supabase_tablon_actual.sql` en Supabase
- [x] Verificar que se creó la tabla: `SELECT * FROM tablon_actual;`
- [x] Implementar sincronización automática en `loadTablon()` (app.js:2760)
- [ ] Recargar la PWA (Ctrl + Shift + R)
- [ ] Ir a la pestaña "Tablón"
- [ ] Verificar que la sincronización ocurre automáticamente (revisar consola)
- [ ] Verificar que se cargaron los datos correctamente
- [ ] Comprobar que los grupos especiales (Trincadores y R/E) aparecen separados

---

## 📈 Próximos Pasos (Opcional)

### Automatizar la actualización
Puedes crear un script que se ejecute periódicamente (ej: cada hora) para mantener el tablón actualizado:

1. Crear una **Edge Function** en Supabase
2. Configurar un **Cron Job** que llame a la función
3. La función ejecuta `sincronizarTablonDesdeCSV()`

---

## 🔗 Archivos Relacionados

- **SQL**: `supabase_tablon_actual.sql` - Crear tabla en Supabase
- **JavaScript**:
  - `supabase.js:572` - Función `syncTablonActualFromCSV()` (sincronización desde CSV)
  - `app.js:2723` - Función `loadTablon()` (carga y renderizado del tablón)
  - `app.js:2760` - Llamada automática a sincronización
- **CSV**: [Contrataciones de la empresa](https://docs.google.com/spreadsheets/d/e/2PACX-1vSTtbkA94xqjf81lsR7bLKKtyES2YBDKs8J2T4UrSEan7e5Z_eaptShCA78R1wqUyYyASJxmHj3gDnY/pubhtml?gid=1388412839&single=true)

---

## ✨ ¡Listo!

Ahora el tablón muestra únicamente los datos actuales del CSV de la empresa, no el histórico acumulado.

**Sincronización automática:** Cada vez que abras la pestaña "Tablón", los datos se sincronizan automáticamente desde el CSV, sin necesidad de intervención manual.
