# 🔍 Diagnóstico del Problema de Acceso Premium

## 🐛 Problemas Reportados

1. ❌ No puedes hacer scroll en páginas normales (Mi contratación, Jornales, Puertas)
2. ❌ Sueldómetro y Oráculo aparecen bloqueados
3. ℹ️ La vista `v_resumen_premium` muestra 0 activas (esto es normal)

---

## ✅ Arreglos Implementados

### 1. Scroll Desbloqueado
- Añadido `document.body.style.overflow = ''` en función `showPage()`
- Ahora el scroll se desbloquea automáticamente al navegar entre páginas

### 2. Debug Añadido
- Console.log detallados en `FeatureLock.verificarAcceso()`
- Te mostrará exactamente qué está pasando cuando verifica el acceso

---

## 📋 Pasos de Diagnóstico

### Paso 1: Verificar Funciones SQL en Supabase

1. Abre [Supabase SQL Editor](https://app.supabase.com/project/icszzxkdxatfytpmoviq/sql)
2. Copia y pega TODO el contenido de `VERIFICAR_PREMIUM.sql`
3. Ejecuta el script
4. **Verifica los resultados:**

**Resultados esperados:**
```
Query 2 (tiene_acceso_premium): TRUE
Query 3 (tiene_acceso_feature):
  - sueldometro: TRUE
  - oraculo: TRUE
  - chatbot: TRUE
Query 5 (usuarios_con_acceso): 519
```

Si alguno devuelve `FALSE`, **hay un problema en la base de datos**.

---

### Paso 2: Verificar Console Logs en el Navegador

1. Abre tu PWA: https://portalestibavlc.vercel.app
2. Abre DevTools (F12)
3. Ve a la pestaña **Console**
4. Navega a **Sueldómetro**
5. **Busca estos logs:**

```
🔐 [FeatureLock] Verificando acceso para feature: sueldometro
🔐 [FeatureLock] Chapa desde localStorage: 115
🔐 [FeatureLock] Llamando a tieneAccesoFeature...
🔍 [PREMIUM DEBUG] Verificando acceso para chapa=115, feature=sueldometro
🔍 [PREMIUM DEBUG] Llamando a RPC 'tiene_acceso_feature'...
🔍 [PREMIUM DEBUG] Resultado RPC - data: true error: null
🔍 [PREMIUM DEBUG] ¿Tiene acceso? true
🔐 [FeatureLock] Resultado: ✅ ACCESO PERMITIDO
```

**Si ves `✅ ACCESO PERMITIDO`** → El backend funciona, pero algo más está mal
**Si ves `🔒 ACCESO DENEGADO`** → El problema está en la verificación

**Si ves `⚠️ No hay chapa en localStorage`** → No estás logueado correctamente

---

### Paso 3: Verificar Estado de la Vista

La vista `v_resumen_premium` mostrando **0 activas** es **NORMAL**.

**¿Por qué?**
- "Activas" se refiere a estado `active` (usuarios pagando)
- Tus 519 usuarios están en estado `trialing` (gratis hasta 01/01/2026)
- Por eso muestra: `en_prueba: 519` ✅

**Esto NO es un problema.**

---

## 🔧 Soluciones Según el Diagnóstico

### Caso A: Funciones SQL devuelven FALSE

**Problema:** La función `tiene_acceso_premium` no está funcionando

**Solución:**
1. Ejecuta `LIMPIAR_TABLA_PREMIUM.sql`
2. Ejecuta `supabase-premium-schema.sql`
3. Verifica de nuevo con `VERIFICAR_PREMIUM.sql`

---

### Caso B: Console muestra "No hay chapa en localStorage"

**Problema:** No estás logueado o el login no guardó el chapa

**Solución:**
1. Cierra sesión
2. Vuelve a hacer login
3. Abre Console (F12)
4. Escribe: `localStorage.getItem('currentChapa')`
5. Debería mostrar tu número de chapa (ej: "115")

---

### Caso C: Console muestra "ACCESO DENEGADO" pero SQL muestra TRUE

**Problema:** El frontend no se está comunicando bien con Supabase

**Solución:**
1. Verifica que `supabase.js` se carga ANTES que `services/premium.js` en index.html
2. Abre Console
3. Escribe: `window.supabase`
4. Debería mostrar un objeto, no `undefined`

---

### Caso D: Todo devuelve TRUE pero sigue bloqueado

**Problema:** El overlay no se está removiendo

**Solución:**
1. Inspecciona el elemento (clic derecho > Inspeccionar)
2. Busca un elemento con clase `feature-lock-overlay`
3. Si existe → El JavaScript no está removiendo el overlay
4. Verifica que `FeatureLock.js` se importa correctamente como módulo

---

## 🎯 Qué Hacer Ahora

### 1. Mergear los Cambios
```bash
git checkout main
git merge feature/freemium-merge
git push origin main
```

### 2. Esperar Deploy de Vercel
- Ve a https://vercel.com/dashboard
- Espera a que termine el deployment

### 3. Ejecutar Diagnóstico
- Ejecuta `VERIFICAR_PREMIUM.sql` en Supabase
- Abre la PWA con DevTools (F12)
- Ve a Sueldómetro
- **Copia y envíame los logs completos de la Console**

---

## 📊 Información que Necesito

Para ayudarte mejor, envíame:

1. **Resultado del Query 2 de VERIFICAR_PREMIUM.sql:**
```sql
SELECT public.tiene_acceso_premium('TU_CHAPA') as tiene_acceso;
```

2. **Resultado del Query 3 de VERIFICAR_PREMIUM.sql:**
```sql
SELECT
  public.tiene_acceso_feature('TU_CHAPA', 'sueldometro') as sueldometro,
  public.tiene_acceso_feature('TU_CHAPA', 'oraculo') as oraculo,
  public.tiene_acceso_feature('TU_CHAPA', 'chatbot_ia') as chatbot;
```

3. **Screenshot o copia de los logs de Console cuando abres Sueldómetro**

---

## ✅ Checklist de Verificación

- [ ] Ejecutar `VERIFICAR_PREMIUM.sql` en Supabase
- [ ] Mergear feature/freemium-merge a main
- [ ] Esperar deploy de Vercel
- [ ] Abrir PWA con DevTools (F12)
- [ ] Ir a Sueldómetro
- [ ] Verificar logs en Console
- [ ] Copiar logs completos
- [ ] Enviar resultados

---

Con esta información podré identificar exactamente dónde está el problema. 🔍
