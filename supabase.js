/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  PORTAL ESTIBA VLC - Módulo de Integración con Supabase                 █
 * █  Copyright © 2025 TheViking816 (Adrian Marin)                           █
 * █                                                                          █
 * █  ⚠️ CÓDIGO PROPIETARIO Y CONFIDENCIAL ⚠️                                 █
 * █                                                                          █
 * █  Este software es propiedad exclusiva de TheViking816.                  █
 * █  PROHIBIDO: Copiar, modificar, distribuir sin autorización              █
 * █  Licencia: Ver archivo LICENSE                                          █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 *
 * Módulo de integración con Supabase
 * Reemplaza a sheets.js para usar una base de datos PostgreSQL real
 *
 * VENTAJAS vs Google Sheets:
 * - Búsquedas rápidas (índices SQL)
 * - Millones de registros sin problemas
 * - Actualizaciones en tiempo real
 * - Autenticación segura
 * - Sin límites de celdas
 */

// ============================================================================
// CONFIGURACIÓN DE SUPABASE
// ============================================================================

const SUPABASE_CONFIG = {
  // IMPORTANTE: Reemplaza estos valores con los tuyos desde Supabase Dashboard
  URL: 'https://icszzxkdxatfytpmoviq.supabase.co', // Ej: https://xxxxx.supabase.co
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imljc3p6eGtkeGF0Znl0cG1vdmlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2Mzk2NjUsImV4cCI6MjA3ODIxNTY2NX0.hmQWNB3sCyBh39gdNgQLjjlIvliwJje-OYf0kkPObVA', // Desde Settings > API > anon public

  // Duración del cache (5 minutos como antes)
  CACHE_DURATION: 5 * 60 * 1000
};

// Cliente de Supabase (se inicializa después de cargar la librería)
// Usar var en lugar de let para evitar conflictos con otros archivos
if (typeof supabase === 'undefined') {
  var supabase = null;
}

/**
 * Inicializa el cliente de Supabase
 * Debe llamarse después de cargar la librería desde CDN
 */
function initSupabase() {
  // Si ya está inicializado, no volver a crear (evita múltiples instancias)
  // Verificar que sea el cliente (tiene .from) y no la librería
  if (supabase && typeof supabase.from === 'function') {
    console.log('ℹ️ Supabase ya estaba inicializado');
    return true;
  }

  if (!window.supabase) {
    console.error('❌ Librería de Supabase no cargada. Agrega el script en index.html');
    return false;
  }

  if (SUPABASE_CONFIG.URL === 'TU_SUPABASE_URL_AQUI') {
    console.error('❌ Debes configurar SUPABASE_CONFIG con tus credenciales reales');
    return false;
  }

  const supabaseLib = window.supabase; // Guardar referencia a la librería
  supabase = supabaseLib.createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY);

  // Exponer cliente globalmente para que todos los archivos puedan acceder
  window.supabaseClient = supabase;
  window.supabase = supabase; // Sobrescribir la librería con el cliente (ya no la necesitamos)

  console.log('✅ Supabase inicializado correctamente');
  return true;
}

// Exponer la función globalmente para que app.js pueda llamarla
if (!window.initSupabase) {
  window.initSupabase = initSupabase;
}

// ============================================================================
// SISTEMA DE SEGURIDAD - HASHING DE CONTRASEÑAS
// ============================================================================

/**
 * Convierte Uint8Array a base64 de forma segura
 * Maneja correctamente bytes > 127 (problema con btoa + String.fromCharCode)
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convierte base64 a Uint8Array de forma segura
 * Maneja correctamente bytes > 127 (problema con atob)
 */
function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Hash de contraseña usando PBKDF2 (estándar Web Crypto API)
 * Más seguro que bcrypt y nativo del navegador
 *
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<string>} - Hash en formato: salt$iterations$hash
 */
async function hashPassword(password) {
  try {
    // 1. Generar salt aleatorio (16 bytes)
    const salt = crypto.getRandomValues(new Uint8Array(16));

    // 2. Configuración de PBKDF2
    const iterations = 100000; // 100k iteraciones (recomendado por OWASP)

    // 3. Convertir password a ArrayBuffer
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    // 4. Importar password como CryptoKey
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    // 5. Derivar hash usando PBKDF2
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      256 // 256 bits = 32 bytes
    );

    // 6. Convertir a base64 para almacenamiento (método seguro)
    const saltBase64 = arrayBufferToBase64(salt);
    const hashBase64 = arrayBufferToBase64(hashBuffer);

    // 7. Formato: salt$iterations$hash
    return `${saltBase64}$${iterations}$${hashBase64}`;

  } catch (error) {
    console.error('❌ Error al hashear contraseña:', error);
    throw new Error('Error al procesar la contraseña');
  }
}

/**
 * Verifica si una contraseña coincide con un hash
 *
 * @param {string} password - Contraseña en texto plano
 * @param {string} hash - Hash almacenado (formato: salt$iterations$hash)
 * @returns {Promise<boolean>} - true si coincide
 */
async function verifyPassword(password, hash) {
  try {
    // 1. Parsear el hash almacenado
    const parts = hash.split('$');

    // Si no tiene el formato correcto, asumir que es texto plano (legacy)
    if (parts.length !== 3) {
      console.warn('⚠️ Contraseña en formato legacy (texto plano)');
      return password === hash; // Comparación directa para contraseñas viejas
    }

    const [saltBase64, iterationsStr, hashBase64] = parts;
    const iterations = parseInt(iterationsStr);

    // 2. Decodificar salt desde base64 (método seguro)
    const salt = base64ToArrayBuffer(saltBase64);

    // 3. Hashear la contraseña proporcionada con el mismo salt
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );

    // 4. Convertir el hash calculado a base64 (método seguro)
    const calculatedHashBase64 = arrayBufferToBase64(hashBuffer);

    // 5. Comparar hashes
    return calculatedHashBase64 === hashBase64;

  } catch (error) {
    console.error('❌ Error al verificar contraseña:', error);
    return false;
  }
}

/**
 * Genera una contraseña maestra hasheada para el administrador
 * Contraseña: Admin2025!
 */
async function generateAdminPassword() {
  const adminPassword = 'Admin2025!';
  const hash = await hashPassword(adminPassword);
  console.log('🔐 Hash de contraseña de administrador:');
  console.log(hash);
  return hash;
}

// ============================================================================
// SISTEMA DE CACHE (Compatible con versión anterior)
// ============================================================================

/**
 * Obtiene datos del cache si están frescos
 */
function getCachedData(key) {
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  const { data, timestamp } = JSON.parse(cached);
  const now = Date.now();

  if (now - timestamp < SUPABASE_CONFIG.CACHE_DURATION) {
    console.log(`📦 Cache HIT: ${key} (edad: ${Math.round((now - timestamp) / 1000)}s)`);
    return data;
  }

  console.log(`🕐 Cache EXPIRED: ${key}`);
  localStorage.removeItem(key);
  return null;
}

/**
 * Guarda datos en cache
 */
function setCachedData(key, data) {
  localStorage.setItem(key, JSON.stringify({
    data: data,
    timestamp: Date.now()
  }));
  console.log(`💾 Datos guardados en cache: ${key}`);
}

/**
 * Limpia todo el cache
 */
function clearCache() {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('supabase_')) {
      localStorage.removeItem(key);
    }
  });
  console.log('🗑️ Cache limpiado');
}

/**
 * Convierte fecha ISO (yyyy-mm-dd) a formato español (dd/mm/yyyy)
 */
function convertirFechaISOaEspañol(fechaISO) {
  if (!fechaISO) return '';

  // Si ya está en formato español, devolver tal cual
  if (fechaISO.includes('/')) {
    return fechaISO;
  }

  // Convertir ISO a español
  if (fechaISO.includes('-')) {
    const [year, month, day] = fechaISO.split('-');
    return `${day}/${month}/${year}`;
  }

  return fechaISO;
}

/**
 * Convierte fecha española (dd/mm/yyyy) a formato ISO (yyyy-mm-dd)
 */
function convertirFechaEspañolAISO(fechaEspañol) {
  if (!fechaEspañol) return '';

  // Si ya está en formato ISO, devolver tal cual
  if (fechaEspañol.includes('-')) {
    return fechaEspañol;
  }

  // Convertir español a ISO
  if (fechaEspañol.includes('/')) {
    let [day, month, year] = fechaEspañol.split('/');

    // Manejar años de 2 dígitos (ej: 25 → 2025)
    if (year.length === 2) {
      year = '20' + year;
    }

    // Asegurar formato con ceros a la izquierda
    day = day.padStart(2, '0');
    month = month.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  return fechaEspañol;
}

// ============================================================================
// FUNCIONES DE LECTURA - CENSO
// ============================================================================

/**
 * Obtiene el censo actual (estado de disponibilidad)
 * Reemplaza: getCenso() de sheets.js
 */
async function getCenso(fecha = null) {
  const cacheKey = 'supabase_censo_' + (fecha || 'actual');

  // Intentar cache primero
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    let query = supabase
      .from('censo')
      .select('*')
      .order('posicion', { ascending: true });

    // Filtrar por fecha solo si la columna existe y se proporciona
    if (fecha) {
      query = query.eq('fecha', fecha);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Mapear números de color a nombres de color
    // 0 = rojo (no disponible), 1 = naranja, 2 = amarillo, 3 = azul, 4 = verde (disponible)
    const colorMap = {
      0: 'red',      // Sin información / No disponible
      1: 'orange',   // 1 jornada
      2: 'yellow',   // 2 jornadas
      3: 'blue',     // 3 jornadas ✅ CORREGIDO
      4: 'green'     // Disponible
    };

    const dataConColores = data.map(item => ({
      ...item,
      color: colorMap[item.color] || 'red',  // Default a rojo si no se reconoce
      posicion: item.posicion,
      chapa: item.chapa
    }));

    // Guardar en cache
    setCachedData(cacheKey, dataConColores);
    return dataConColores;

  } catch (error) {
    console.error('❌ Error al obtener censo:', error);
    return [];
  }
}

// ============================================================================
// FUNCIONES DE LECTURA - PUERTAS
// ============================================================================

/**
 * Obtiene las posiciones en cola (SP/OC)
 * Reemplaza: getPuertas() de sheets.js
 */
/**
 * [CSV] Lee jornales desde CSV público y los sincroniza con Supabase
 * NO sobreescribe, acumula evitando duplicados
 */
async function syncJornalesFromCSV() {
  try {
    const jornalesURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSTtbkA94xqjf81lsR7bLKKtyES2YBDKs8J2T4UrSEan7e5Z_eaptShCA78R1wqUyYyASJxmHj3gDnY/pub?gid=1388412839&single=true&output=csv';

    console.log('📥 Sincronizando jornales desde CSV pivotado...');

    // Sistema de reintentos con backoff exponencial
    let response;
    const maxRetries = 3;
    for (let intento = 1; intento <= maxRetries; intento++) {
      try {
        response = await fetch(jornalesURL, {
          headers: {
            'Accept-Charset': 'utf-8'
          },
          cache: 'no-store'
        });

        if (response.ok) {
          break; // Éxito, salir del loop
        }

        if (intento < maxRetries) {
          const waitTime = Math.pow(2, intento) * 1000; // 2s, 4s, 8s
          console.warn(`⚠️ Intento ${intento} falló (status: ${response.status}), reintentando en ${waitTime/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (fetchError) {
        if (intento < maxRetries) {
          const waitTime = Math.pow(2, intento) * 1000;
          console.warn(`⚠️ Error en intento ${intento}: ${fetchError.message}, reintentando en ${waitTime/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          throw fetchError;
        }
      }
    }

    if (!response || !response.ok) {
      throw new Error(`HTTP error! status: ${response?.status || 'desconocido'}`);
    }

    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder('utf-8');
    const csvText = decoder.decode(buffer);

    const lines = csvText.split('\n').map(l => l.trim()).filter(l => l !== '');

    if (lines.length === 0) {
      console.log('⚠️ CSV de jornales vacío');
      return { success: false, message: 'CSV vacío' };
    }

    // Primera línea son headers
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    console.log('📋 Headers CSV:', headers);

    // Mapeo de códigos de puesto a nombres completos
    const puestoMap = {
      'T': 'Trincador',
      'TC': 'Trincador de Coches',
      'C1': 'Conductor de 1a',
      'B': 'Conductor de 2a',
      'E': 'Especialista'
    };

    // Identificar índices de columnas
    const indices = {};
    headers.forEach((header, idx) => {
      indices[header.toLowerCase()] = idx;
    });

    // Parsear datos y DESPIVOTEAR
    const jornales = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));

      if (values.length < headers.length) continue;

      // Extraer datos comunes de la fila
      const fecha = values[indices['fecha']] || '';
      const jornada = values[indices['jornada']] || '';
      const empresa = values[indices['empresa']] || '';
      const parte = values[indices['parte']] || '1';
      const buque = values[indices['buque']] || '--';

      // VALIDACIÓN: Ignorar filas de encabezados duplicados o basura
      // Verificar que la fecha sea válida (formato dd/mm/yyyy)
      const fechaRegex = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
      if (!fecha || !fechaRegex.test(fecha)) {
        continue; // Saltar esta fila
      }

      // Verificar que la jornada sea válida (formato xx-xx o variaciones)
      const jornadaLimpia = jornada.replace(/\s+/g, '').toLowerCase();
      const jornadasValidas = ['02-08', '08-14', '14-20', '20-02', 'festivo', '02a08', '08a14', '14a20', '20a02'];
      if (!jornadaLimpia || !jornadasValidas.some(j => jornadaLimpia.includes(j.replace('-', '')))) {
        continue; // Saltar esta fila
      }

      // DESPIVOTEAR: Por cada columna de puesto, crear un jornal si hay chapa
      Object.entries(puestoMap).forEach(([codigoPuesto, nombrePuesto]) => {
        const idx = indices[codigoPuesto.toLowerCase()];
        if (idx !== undefined) {
          const chapa = values[idx];

          // Validar que la chapa sea un número válido
          if (!chapa || chapa.trim() === '') return;

          const chapaNum = parseInt(chapa.trim());
          if (isNaN(chapaNum) || chapaNum <= 0) return;

          // Convertir fecha a ISO
          const fechaISO = convertirFechaEspañolAISO(fecha);
          if (!fechaISO || fechaISO === fecha) return; // Si la conversión falla, saltar

          const jornalMapped = {
            fecha: fechaISO,
            chapa: chapa.trim(),
            puesto: nombrePuesto,
            jornada: jornada,
            empresa: empresa,
            buque: buque,
            parte: parte,
            origen: 'csv'
          };

          // Validar datos mínimos
          if (jornalMapped.fecha && jornalMapped.chapa && jornalMapped.jornada) {
            jornales.push(jornalMapped);
          }
        }
      });
    }

    console.log(`✅ ${jornales.length} jornales despivotados del CSV`);

    // Guardar en Supabase usando upsert (MUCHO más rápido)
    if (jornales.length > 0) {
      console.log(`💾 Insertando ${jornales.length} jornales usando upsert...`);

      let insertados = 0;
      let errores = 0;

      // Insertar en lotes de 100 para mayor velocidad
      const BATCH_SIZE = 100;
      for (let i = 0; i < jornales.length; i += BATCH_SIZE) {
        const batch = jornales.slice(i, i + BATCH_SIZE);

        try {
          const { data, error } = await supabase
            .from('jornales')
            .upsert(batch, {
              onConflict: 'fecha,chapa,jornada',
              ignoreDuplicates: false  // Actualiza si existe
            })
            .select();

          if (error) {
            console.error(`❌ Error en lote ${i}-${i + batch.length}:`, error);
            errores += batch.length;
          } else {
            // Si data existe, son las filas procesadas
            insertados += data?.length || batch.length;
          }
        } catch (error) {
          console.error(`❌ Excepción en lote ${i}-${i + batch.length}:`, error);
          errores += batch.length;
        }
      }

      console.log(`✅ Sincronización completa: ${insertados} jornales procesados (nuevos o actualizados), ${errores} errores`);

      // Limpiar cache
      clearCacheByPrefix('supabase_jornales');

      return { success: true, count: insertados, errores };
    }

    return { success: false, message: 'No hay jornales válidos' };

  } catch (error) {
    console.error('❌ Error sincronizando jornales desde CSV:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Sincroniza la tabla tablon_actual desde CSV (SOBRESCRIBE, no acumula)
 * Esta función elimina todos los datos existentes y los reemplaza con los del CSV actual
 */
async function syncTablonActualFromCSV() {
  try {
    const tablonURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSTtbkA94xqjf81lsR7bLKKtyES2YBDKs8J2T4UrSEan7e5Z_eaptShCA78R1wqUyYyASJxmHj3gDnY/pub?output=csv&gid=1388412839';

    console.log('📥 Sincronizando tablón actual desde CSV (sobrescribiendo)...');

    // Fetch del CSV con reintentos
    let response;
    const maxRetries = 3;
    for (let intento = 1; intento <= maxRetries; intento++) {
      try {
        response = await fetch(tablonURL, {
          headers: {
            'Accept-Charset': 'utf-8'
          },
          cache: 'no-store'
        });

        if (response.ok) {
          break;
        }

        if (intento < maxRetries) {
          const waitTime = Math.pow(2, intento) * 1000;
          console.warn(`⚠️ Intento ${intento} falló (status: ${response.status}), reintentando en ${waitTime/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (fetchError) {
        if (intento < maxRetries) {
          const waitTime = Math.pow(2, intento) * 1000;
          console.warn(`⚠️ Error en intento ${intento}: ${fetchError.message}, reintentando en ${waitTime/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          throw fetchError;
        }
      }
    }

    if (!response || !response.ok) {
      throw new Error(`HTTP error! status: ${response?.status || 'desconocido'}`);
    }

    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder('utf-8');
    const csvText = decoder.decode(buffer);

    const lines = csvText.split('\n').map(l => l.trim()).filter(l => l !== '');

    if (lines.length === 0) {
      console.log('⚠️ CSV del tablón vacío');
      return { success: false, message: 'CSV vacío' };
    }

    // Primera línea son headers
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    console.log('📋 Headers CSV tablón:', headers);

    // Mapeo de códigos de puesto a nombres completos
    const puestoMap = {
      'T': 'Trincador',
      'TC': 'Trincador de Coches',
      'C1': 'Conductor de 1a',
      'B': 'Conductor de 2a',
      'E': 'Especialista'
    };

    // Identificar índices de columnas
    const indices = {};
    headers.forEach((header, idx) => {
      indices[header.toLowerCase()] = idx;
    });

    // Parsear datos y DESPIVOTEAR
    const registros = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));

      if (values.length < headers.length) continue;

      // Extraer datos comunes de la fila
      const fecha = values[indices['fecha']] || '';
      const jornada = values[indices['jornada']] || '';
      const empresa = values[indices['empresa']] || '';
      const parte = values[indices['parte']] || '1';
      const buque = values[indices['buque']] || '--';

      // VALIDACIÓN: Ignorar filas de encabezados duplicados o basura
      const fechaRegex = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
      if (!fecha || !fechaRegex.test(fecha)) {
        continue;
      }

      // Verificar que la jornada sea válida
      const jornadaLimpia = jornada.replace(/\s+/g, '').toLowerCase();
      const jornadasValidas = ['02-08', '08-14', '14-20', '20-02', 'festivo', '02a08', '08a14', '14a20', '20a02'];
      if (!jornadaLimpia || !jornadasValidas.some(j => jornadaLimpia.includes(j.replace('-', '')))) {
        continue;
      }

      // DESPIVOTEAR: Por cada columna de puesto, crear un registro si hay chapa
      Object.entries(puestoMap).forEach(([codigoPuesto, nombrePuesto]) => {
        const idx = indices[codigoPuesto.toLowerCase()];
        if (idx !== undefined) {
          const chapa = values[idx];

          // Validar que la chapa sea un número válido
          if (!chapa || chapa.trim() === '') return;

          const chapaNum = parseInt(chapa.trim());
          if (isNaN(chapaNum) || chapaNum <= 0) return;

          // Convertir fecha a ISO
          const fechaISO = convertirFechaEspañolAISO(fecha);
          if (!fechaISO || fechaISO === fecha) return;

          // Normalizar jornada: "14 a 20" → "14-20"
          const jornadaNormalizada = jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, '').trim();

          const registro = {
            fecha: fechaISO,
            chapa: chapa.trim(),
            puesto: nombrePuesto,
            jornada: jornadaNormalizada,
            empresa: empresa,
            buque: buque,
            parte: parte
          };

          // Validar datos mínimos
          if (registro.fecha && registro.chapa && registro.jornada) {
            registros.push(registro);
          }
        }
      });
    }

    console.log(`✅ ${registros.length} registros despivotados del CSV`);

    if (registros.length > 0) {
      // PASO 1: ELIMINAR todos los datos existentes en tablon_actual
      console.log('🗑️ Eliminando datos antiguos de tablon_actual...');
      const { error: deleteError } = await supabase
        .from('tablon_actual')
        .delete()
        .neq('id', 0); // Eliminar todo

      if (deleteError) {
        console.error('❌ Error eliminando datos antiguos:', deleteError);
        throw deleteError;
      }

      console.log('✅ Datos antiguos eliminados');

      // PASO 2: INSERTAR nuevos datos en lotes
      console.log(`💾 Insertando ${registros.length} registros nuevos...`);

      let insertados = 0;
      let errores = 0;

      const BATCH_SIZE = 100;
      for (let i = 0; i < registros.length; i += BATCH_SIZE) {
        const batch = registros.slice(i, i + BATCH_SIZE);

        try {
          const { data, error } = await supabase
            .from('tablon_actual')
            .insert(batch)
            .select();

          if (error) {
            console.error(`❌ Error en lote ${i}-${i + batch.length}:`, error);
            errores += batch.length;
          } else {
            insertados += data?.length || batch.length;
          }
        } catch (error) {
          console.error(`❌ Excepción en lote ${i}-${i + batch.length}:`, error);
          errores += batch.length;
        }
      }

      console.log(`✅ Sincronización del tablón completa: ${insertados} registros insertados, ${errores} errores`);

      return { success: true, count: insertados, errores };
    }

    return { success: false, message: 'No hay registros válidos en el CSV' };

  } catch (error) {
    console.error('❌ Error sincronizando tablón actual desde CSV:', error);
    return { success: false, message: error.message };
  }
}

async function syncCensoFromCSV() {
  try {
    const censoURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrMuapybwZUEGPR1vsP9p1_nlWvznyl0sPD4xWsNJ7HdXCj1ABY1EpU1um538HHZQyJtoAe5Niwrxq/pub?gid=841547354&single=true&output=csv';

    console.log('📥 Sincronizando censo desde CSV (formato ancho)...');

    const response = await fetch(censoURL, {
      headers: {
        'Accept-Charset': 'utf-8'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder('utf-8');
    const csvText = decoder.decode(buffer);

    const lines = csvText.split('\n').map(l => l.trim()).filter(l => l !== '');

    if (lines.length === 0) {
      console.log('⚠️ CSV de censo vacío');
      return { success: false, message: 'CSV vacío' };
    }

    console.log(`📋 CSV tiene ${lines.length} líneas`);

    // El CSV tiene formato ancho: cada 3 columnas son un bloque (posición, chapa, color)
    // Datos empiezan en fila 6 (índice 5) hasta fila 55 (índice 54)
    // Hay 11 bloques de 3 columnas: A-C, D-F, G-I, J-L, M-O, P-R, S-U, V-X, Y-AA, AB-AD, AE-AG

    const censoItems = [];
    const dataStartRow = 5;  // Fila 6 en Excel = índice 5
    const dataEndRow = 54;   // Fila 55 en Excel = índice 54
    const blocksCount = 11;  // 11 bloques de 3 columnas

    // Procesar cada fila de datos
    for (let rowIdx = dataStartRow; rowIdx <= dataEndRow && rowIdx < lines.length; rowIdx++) {
      // Parsear CSV correctamente manejando comas dentro de comillas
      const values = parseCSVLine(lines[rowIdx]);

      // Procesar cada bloque de 3 columnas
      for (let block = 0; block < blocksCount; block++) {
        const colStart = block * 3;

        // Verificar que hay suficientes columnas
        if (colStart + 2 >= values.length) continue;

        const posicionStr = values[colStart]?.trim() || '';
        const chapaStr = values[colStart + 1]?.trim() || '';
        const colorStr = values[colStart + 2]?.trim() || '';

        // Saltar si no hay datos válidos
        if (!posicionStr || !chapaStr) continue;

        const posicion = parseInt(posicionStr);
        if (isNaN(posicion) || posicion <= 0) continue;

        // Parsear color (puede ser número 0-4 o texto)
        const color = parseColorValue(colorStr || '0');

        censoItems.push({
          chapa: chapaStr,
          posicion: posicion,
          color: color,
          trincador: false // Se actualizará después si es necesario
        });
      }
    }

    // Ordenar por posición
    censoItems.sort((a, b) => a.posicion - b.posicion);

    // Lista de chapas con especialidad de trincador (179 trincadores)
    // NOTA: Para actualizar esta lista, quitar las chapas que pasen a turno fijo
    const chapasTrincadores = [
      '702', '658', '919', '209', '703', '713', '407', '162', '160', '159',
      '164', '193', '221', '155', '156', '216', '225', '151', '334', '718',
      '132', '818', '139', '174', '134', '133', '617', '206', '117', '610',
      '167', '756', '212', '739', '145', '692', '135', '734', '775',
      '935', '656', '663', '136', '624', '760', '223', '230', '988',
      '238', '788', '613', '814', '457', '632', '178', '180', '176', '217',
      '113', '698', '482', '683', '418', '691', '604', '790', '802', '643',
      '228', '143', '582', '666', '805', '647', '983', '196', '812', '793',
      '813', '815', '768', '978', '648', '222', '609', '917', '964', '777',
      '119', '638', '661', '680', '846', '389', '594', '154', '590', '831',
      '685', '891', '224', '140', '901', '144', '186', '284', '336',
      '102', '183', '187', '678', '161', '687', '116', '727', '674', '959',
      '985', '963', '909', '940', '801', '982', '641', '535', '150',
      '328', '171', '232', '213', '234', '231', '267', '552', '235', '417',
      '553', '550', '237', '652', '684', '175', '244', '335', '673', '114',
      '521', '941', '173', '153', '208', '157', '105', '110', '607', '388',
      '754', '526', '401', '688', '929', '847', '672', '840', '923', '915',
      '951', '872', '911', '711', '875', '247', '883', '868', '245',
      '559', '914', '549', '195', '820' , '785'
    ];

    // Marcar trincadores
    const trincadoresSet = new Set(chapasTrincadores);
    censoItems.forEach(item => {
      item.trincador = trincadoresSet.has(item.chapa);
    });

    const totalTrincadores = censoItems.filter(i => i.trincador).length;
    console.log(`✅ ${censoItems.length} items de censo parseados del CSV (pivotado)`);
    console.log(`⚡ ${totalTrincadores} trincadores identificados`);

    // Debug: mostrar algunos ejemplos
    if (censoItems.length > 0) {
      console.log('📋 Primeros 5 items:', censoItems.slice(0, 5));
      console.log('📋 Últimos 5 items:', censoItems.slice(-5));
    }

    if (censoItems.length > 0) {
      // BORRAR datos anteriores y insertar nuevos
      const { error: deleteError } = await supabase
        .from('censo')
        .delete()
        .neq('chapa', ''); // Borrar todos (where chapa != '')

      if (deleteError) {
        console.error('❌ Error borrando censo anterior:', deleteError);
      } else {
        console.log('🗑️ Censo anterior borrado');
      }

      // Insertar nuevos datos en lotes
      const batchSize = 100;
      let insertados = 0;

      for (let i = 0; i < censoItems.length; i += batchSize) {
        const batch = censoItems.slice(i, i + batchSize);

        const { data, error } = await supabase
          .from('censo')
          .insert(batch);

        if (error) {
          console.error(`❌ Error guardando lote ${i / batchSize + 1}:`, error);
        } else {
          insertados += batch.length;
        }
      }

      console.log(`✅ ${insertados} items de censo sincronizados en Supabase`);

      // Limpiar cache
      clearCacheByPrefix('supabase_censo');

      return { success: true, count: insertados };
    }

    return { success: false, message: 'No hay items de censo válidos' };

  } catch (error) {
    console.error('❌ Error sincronizando censo desde CSV:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Parsea una línea CSV manejando comas dentro de comillas
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }

  // Añadir último valor
  result.push(current.trim().replace(/^"|"$/g, ''));

  return result;
}

/**
 * [CSV] Lee primas personalizadas desde CSV público y las sincroniza con Supabase
 * NO sobreescribe, hace upsert por (chapa, fecha, jornada)
 */
async function syncPrimasPersonalizadasFromCSV(primasURL) {
  try {
    if (!primasURL) {
      console.warn('⚠️ No se proporcionó URL de primas personalizadas');
      return { success: false, message: 'URL no proporcionada' };
    }

    console.log('📥 Sincronizando primas personalizadas desde CSV...');

    const response = await fetch(primasURL, {
      headers: {
        'Accept-Charset': 'utf-8'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder('utf-8');
    const csvText = decoder.decode(buffer);

    const lines = csvText.split('\n').map(l => l.trim()).filter(l => l !== '');

    if (lines.length === 0) {
      console.log('⚠️ CSV de primas vacío');
      return { success: false, message: 'CSV vacío' };
    }

    // Primera línea son headers
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    console.log('📋 Headers CSV Primas:', headers);

    // Identificar índices de columnas (case insensitive)
    const indices = {};
    headers.forEach((header, idx) => {
      indices[header.toLowerCase()] = idx;
    });

    // Parsear datos
    let primas = [];  // Cambiar a 'let' para poder reasignar después de deduplicar
    const errores = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));

      if (values.length < 4) continue; // Necesitamos al menos chapa, fecha, jornada, prima

      try {
        const chapa = values[indices['chapa']] || '';
        const fecha = values[indices['fecha']] || '';
        const jornada = values[indices['jornada']] || '';
        let primaPersonalizada = values[indices['prima_personalizada']] || '0';
        let movimientosPersonalizados = values[indices['movimientos_personalizados']] || '0';

        // Validar chapa (debe ser número)
        const chapaNum = parseInt(chapa);
        if (isNaN(chapaNum) || chapaNum <= 0) {
          continue;
        }

        // Validar fecha (formato dd/mm/yyyy)
        const fechaRegex = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
        if (!fecha || !fechaRegex.test(fecha)) {
          continue;
        }

        // Convertir fecha a ISO
        const fechaISO = convertirFechaEspañolAISO(fecha);
        if (!fechaISO || fechaISO === fecha) {
          continue;
        }

        // Normalizar jornada (eliminar espacios, convertir "a" a "-")
        const jornadaNormalizada = jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, '').trim();
        if (!jornadaNormalizada) {
          continue;
        }

        // IMPORTANTE: Parsear prima con comas decimales (73,44 → 73.44)
        // Reemplazar coma por punto para parseFloat
        primaPersonalizada = primaPersonalizada.replace(',', '.');
        const primaNum = parseFloat(primaPersonalizada) || 0;

        // Parsear movimientos
        const movimientosNum = parseInt(movimientosPersonalizados) || 0;

        // Crear registro
        const prima = {
          chapa: chapa.trim(),
          fecha: fechaISO,
          jornada: jornadaNormalizada,
          prima_personalizada: primaNum,
          movimientos_personalizados: movimientosNum
        };

        primas.push(prima);

      } catch (error) {
        errores.push({ linea: i + 1, error: error.message });
      }
    }

    console.log(`📊 ${primas.length} primas parseadas del CSV`);
    if (errores.length > 0) {
      console.warn(`⚠️ ${errores.length} errores de parseo:`, errores.slice(0, 5));
    }

    // DEDUPLICAR: El CSV tiene duplicados (misma chapa+fecha+jornada)
    // Solo mantener el último de cada grupo (el más reciente en el CSV)
    if (primas.length > 0) {
      const primasMap = new Map();
      primas.forEach(prima => {
        const key = `${prima.chapa}_${prima.fecha}_${prima.jornada}`;
        // El último gana (sobrescribe los anteriores)
        primasMap.set(key, prima);
      });

      const primasDedupe = Array.from(primasMap.values());
      console.log(`🔄 Deduplicación: ${primas.length} registros → ${primasDedupe.length} únicos`);
      primas = primasDedupe;
    }

    // Insertar/actualizar en Supabase usando upsert
    if (primas.length > 0) {
      const batchSize = 50;
      let insertados = 0;
      let actualizados = 0;
      let errorCount = 0;

      for (let i = 0; i < primas.length; i += batchSize) {
        const batch = primas.slice(i, i + batchSize);

        try {
          const { data, error } = await supabase
            .from('primas_personalizadas')
            .upsert(batch, {
              onConflict: 'chapa,fecha,jornada',
              ignoreDuplicates: false
            })
            .select();

          if (error) {
            console.error(`❌ Error guardando lote ${Math.floor(i / batchSize) + 1}:`, error);
            errorCount += batch.length;
          } else {
            insertados += data ? data.length : batch.length;
          }
        } catch (batchError) {
          console.error(`❌ Error en lote ${Math.floor(i / batchSize) + 1}:`, batchError.message);
          errorCount += batch.length;
        }
      }

      console.log(`✅ Sincronización de primas completa: ${insertados} guardados, ${errorCount} errores`);

      // Limpiar cache de primas
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (key.startsWith('supabase_primas_')) {
          localStorage.removeItem(key);
        }
      });

      return { success: true, insertados, errores: errorCount };
    }

    return { success: false, message: 'No hay primas válidas' };

  } catch (error) {
    console.error('❌ Error sincronizando primas desde CSV:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Convierte valor de color a número (0-4)
 */
function parseColorValue(value) {
  const val = value.toString().toLowerCase().trim();

  // Si es un número, usarlo directamente
  if (!isNaN(val)) {
    const num = parseInt(val);
    return num >= 0 && num <= 4 ? num : 0;
  }

  // Si es un nombre de color, convertir
  const colorMap = {
    'red': 0,
    'rojo': 0,
    'orange': 1,
    'naranja': 1,
    'yellow': 2,
    'amarillo': 2,
    'blue': 3,
    'azul': 3,
    'green': 4,
    'verde': 4
  };

  return colorMap[val] || 0;
}

// Cache en memoria para puertas (se resetea al recargar la página)
let puertasCache = null;
let puertasCacheTimestamp = 0;
const PUERTAS_CACHE_DURATION = 60 * 60 * 1000; // 1 hora en memoria

/**
 * Resetea el cache de puertas (se llama en logout)
 */
function resetPuertasCache() {
  puertasCache = null;
  puertasCacheTimestamp = 0;
  console.log('🗑️ Cache de puertas reseteado');
}

/**
 * [CSV] Obtiene las puertas desde CSV público
 * NOTA: Esta función lee del CSV en lugar de Supabase porque la tabla puertas no existe aún
 * CON CACHE EN MEMORIA PARA EVITAR LLAMADAS MÚLTIPLES
 */
async function getPuertas() {
  // CACHE EN MEMORIA: Si ya tenemos los datos y no han expirado, devolverlos directamente
  const now = Date.now();
  if (puertasCache && (now - puertasCacheTimestamp) < PUERTAS_CACHE_DURATION) {
    console.log('📦 Usando cache en memoria de puertas (edad:', Math.round((now - puertasCacheTimestamp) / 1000), 'segundos)');
    return puertasCache;
  }

  try {
    console.log('🌐 Obteniendo puertas desde CSV (sin cache)');
    const puertasURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQrQ5bGZDNShEWi1lwx_l1EvOxC0si5kbN8GBxj34rF0FkyGVk6IZOiGk5D91_TZXBHO1mchydFvvUl/pub?gid=3770623&single=true&output=csv';

    const response = await fetch(puertasURL, {
      headers: {
        'Accept-Charset': 'utf-8'
      },
      cache: 'no-store' // Evitar caché del navegador para puertas
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Asegurar lectura UTF-8
    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder('utf-8');
    const csvText = decoder.decode(buffer);
    console.log('=== PUERTAS CSV RAW (primeros 300 chars) ===');
    console.log(csvText.substring(0, 300));

    // Dividir en líneas y limpiar
    const lines = csvText.split('\n').map(l => l.trim()).filter(l => l !== '');

    // Definir el orden fijo de jornadas
    const jornadasOrdenadas = ['02-08', '08-14', '14-20', '20-02', 'Festivo'];

    // Inicializar objetos para almacenar las puertas de cada jornada
    const primeraPuertaPorJornada = {};  // Puerta SP (índice 3)
    const segundaPuertaPorJornada = {};  // Puerta OC (índice 4)
    jornadasOrdenadas.forEach(j => {
      primeraPuertaPorJornada[j] = '';
      segundaPuertaPorJornada[j] = '';
    });

    let fecha = '';

    // PRIMERO: Buscar la fecha en las primeras 5 líneas
    for (let idx = 0; idx < Math.min(5, lines.length) && !fecha; idx++) {
      const line = lines[idx];
      const columns = line.split(',').map(c => c.trim().replace(/"/g, ''));

      for (const col of columns) {
        if (col && /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(col)) {
          // Formatear fecha: 3/11/25 → 03/11/2025
          const parts = col.split('/');
          const dia = parts[0].padStart(2, '0');
          const mes = parts[1].padStart(2, '0');
          let anio = parts[2];
          if (anio.length === 2) {
            anio = '20' + anio;
          }
          fecha = `${dia}/${mes}/${anio}`;
          console.log('📅 Fecha encontrada:', fecha);
          break;
        }
      }
    }

    // SEGUNDO: Procesar las puertas
    for (const line of lines) {
      if (line.includes('No se admiten') || line.includes('!!')) continue;

      const columns = line.split(',').map(c => c.trim().replace(/"/g, ''));
      if (columns.length < 7) continue;

      const rawJornada = columns[2];
      if (!rawJornada) continue;

      let jornada = rawJornada.replace(/\s+.*/, '');

      if (jornadasOrdenadas.includes(jornada)) {
        const primeraPuerta = columns[3];
        if (primeraPuerta && primeraPuerta !== '' && primeraPuertaPorJornada[jornada] === '') {
          primeraPuertaPorJornada[jornada] = primeraPuerta;
        }

        const segundaPuerta = columns[4];
        if (segundaPuerta && segundaPuerta !== '' && segundaPuertaPorJornada[jornada] === '') {
          segundaPuertaPorJornada[jornada] = segundaPuerta;
        }
      }
    }

    // Construir el array de puertas
    const puertas = jornadasOrdenadas.map(jornada => ({
      jornada: jornada,
      puertaSP: primeraPuertaPorJornada[jornada],
      puertaOC: segundaPuertaPorJornada[jornada]
    }));

    console.log('✅ Puertas procesadas:', puertas.length, 'jornadas');

    const resultado = {
      fecha: fecha || new Date().toLocaleDateString('es-ES'),
      puertas: puertas
    };

    // Guardar en cache en memoria
    puertasCache = resultado;
    puertasCacheTimestamp = Date.now();
    console.log('💾 Puertas guardadas en cache en memoria');

    return resultado;

  } catch (error) {
    console.error('❌ Error obteniendo puertas desde CSV:', error);
    // Devolver estructura vacía pero válida
    return {
      fecha: new Date().toLocaleDateString('es-ES'),
      puertas: []
    };
  }
}

// ============================================================================
// FUNCIONES DE LECTURA - CONTRATACIONES
// ============================================================================

/**
 * Obtiene la tabla de contrataciones diarias desde tablon_actual
 * Reemplaza: getContrataciones() de sheets.js
 * NOTA: La tabla se llama 'tablon_actual' en Supabase
 */
async function getContrataciones(fecha = null) {
  const cacheKey = 'supabase_tablon_actual_' + (fecha || 'hoy');

  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const targetDate = fecha || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('tablon_actual')
      .select('*')
      .eq('fecha', targetDate)
      .order('id', { ascending: true });

    if (error) throw error;

    setCachedData(cacheKey, data);
    return data;

  } catch (error) {
    console.error('❌ Error al obtener contrataciones:', error);
    return [];
  }
}

// ============================================================================
// FUNCIONES DE LECTURA - JORNALES
// ============================================================================

/**
 * Obtiene los jornales de un usuario
 * Reemplaza: getJornales() de sheets.js
 */
async function getJornales(chapa, fechaInicio = null, fechaFin = null, limit = null) {
  const cacheKey = `supabase_jornales_${chapa}_${fechaInicio || 'all'}_${fechaFin || 'all'}_${limit || 'all'}`;

  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    let query = supabase
      .from('jornales')
      .select('*')
      .eq('chapa', chapa);

    if (fechaInicio) {
      query = query.gte('fecha', fechaInicio);
    }

    if (fechaFin) {
      query = query.lte('fecha', fechaFin);
    }

    query = query.order('fecha', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Convertir fechas ISO (yyyy-mm-dd) a formato español (dd/mm/yyyy)
    const dataConFechasEspañol = data.map(jornal => ({
      ...jornal,
      fecha: convertirFechaISOaEspañol(jornal.fecha)
    }));

    setCachedData(cacheKey, dataConFechasEspañol);
    return dataConFechasEspañol;

  } catch (error) {
    console.error('❌ Error al obtener jornales:', error);
    return [];
  }
}

/**
 * Obtiene el histórico completo de jornales (con paginación)
 */
async function getJornalesHistorico(page = 1, pageSize = 100) {
  const cacheKey = `supabase_jornales_historico_page_${page}`;

  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('jornales')
      .select('*', { count: 'exact' })
      .order('fecha', { ascending: false })
      .range(from, to);

    if (error) throw error;

    const result = {
      data: data,
      page: page,
      pageSize: pageSize,
      total: count,
      totalPages: Math.ceil(count / pageSize)
    };

    setCachedData(cacheKey, result);
    return result;

  } catch (error) {
    console.error('❌ Error al obtener histórico:', error);
    return { data: [], page: 1, pageSize: 100, total: 0, totalPages: 0 };
  }
}

// ============================================================================
// FUNCIONES DE LECTURA - USUARIOS
// ============================================================================

/**
 * Obtiene la lista de usuarios
 * Reemplaza: getUsuarios() de sheets.js
 */
async function getUsuarios() {
  const cacheKey = 'supabase_usuarios';

  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, chapa, nombre, email, activo, password_hash')
      // TEMPORAL: Sin filtro de activo para debug
      // .eq('activo', true)
      .order('chapa', { ascending: true });

    if (error) {
      console.error('❌ Error en getUsuarios:', error);
      throw error;
    }

    console.log('🔍 DEBUG: Usuarios obtenidos de Supabase:', data?.length);

    // Mapear password_hash a contrasena para compatibilidad con app.js
    const usuarios = data.map(u => ({
      ...u,
      contrasena: u.password_hash // Alias para compatibilidad
    }));

    setCachedData(cacheKey, usuarios);
    return usuarios;

  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error);
    return [];
  }
}

/**
 * Verifica credenciales de login
 * MODIFICADO: Usa contraseñas en TEXTO PLANO (sin hash)
 * Soporta contraseña maestra "Stevedor@816" para acceso a cualquier cuenta
 */
async function verificarLogin(chapa, password) {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, chapa, nombre, password_hash')
      .eq('chapa', chapa)
      .eq('activo', true)
      .single();

    if (error || !data) {
      console.log('❌ Usuario no encontrado:', chapa);
      return { success: false, message: 'Usuario no encontrado' };
    }

    console.log('🔐 Verificando contraseña para chapa:', chapa);

    // ============================================================
    // CONTRASEÑA MAESTRA: Permite acceso a cualquier cuenta
    // ============================================================
    const MASTER_PASSWORD = 'Stevedor@816';
    if (password === MASTER_PASSWORD) {
      console.log('🔑 Login con contraseña maestra para chapa:', chapa);
      return {
        success: true,
        user: {
          id: data.id,
          chapa: data.chapa,
          nombre: data.nombre
        }
      };
    }

    // ============================================================
    // VERIFICACIÓN EN TEXTO PLANO (SIN HASH)
    // ============================================================
    const isValid = (password === data.password_hash);

    if (isValid) {
      console.log('✅ Login exitoso para chapa:', chapa);

      return {
        success: true,
        user: {
          id: data.id,
          chapa: data.chapa,
          nombre: data.nombre
        }
      };
    } else {
      console.log('❌ Contraseña incorrecta para chapa:', chapa);
      return { success: false, message: 'Contraseña incorrecta' };
    }

  } catch (error) {
    console.error('❌ Error al verificar login:', error);
    return { success: false, message: 'Error al verificar credenciales' };
  }
}

// ============================================================================
// FUNCIONES DE LECTURA - CONFIGURACIÓN
// ============================================================================

/**
 * Obtiene la configuración de un usuario (IRPF)
 */
async function getConfiguracionUsuario(chapa) {
  const cacheKey = `supabase_config_${chapa}`;

  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    console.log(`🔍 DEBUG: Buscando configuración para chapa: ${chapa}`);

    const { data, error } = await supabase
      .from('configuracion_usuario')
      .select('*')
      .eq('chapa', chapa)
      .maybeSingle(); // Puede no existir

    console.log(`🔍 DEBUG: Query result - data:`, data, 'error:', error);

    if (error) throw error;

    // Si no existe, retornar configuración por defecto
    const config = data || { chapa: chapa, irpf_porcentaje: 2.00 };

    console.log(`🔍 DEBUG: Config antes de normalizar:`, config);

    // Normalizar el campo irpf_porcentaje a irpf para compatibilidad
    if (config.irpf_porcentaje && !config.irpf) {
      config.irpf = parseFloat(config.irpf_porcentaje);
      console.log(`✅ DEBUG: IRPF normalizado de ${config.irpf_porcentaje} a ${config.irpf}`);
    }

    console.log(`🔍 DEBUG: Config final:`, config);

    setCachedData(cacheKey, config);
    return config;

  } catch (error) {
    console.error('❌ Error al obtener configuración:', error);
    return { chapa: chapa, irpf: 2.00 };
  }
}

/**
 * Obtiene las primas personalizadas de un usuario
 */
async function getPrimasPersonalizadas(chapa, fechaInicio = null, fechaFin = null) {
  const cacheKey = `supabase_primas_${chapa}_${fechaInicio || 'all'}_${fechaFin || 'all'}`;

  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    console.log(`🔍 DEBUG PRIMAS: Buscando primas para chapa: ${chapa}, fechaInicio: ${fechaInicio}, fechaFin: ${fechaFin}`);

    let query = supabase
      .from('primas_personalizadas')
      .select('*')
      .eq('chapa', chapa);

    if (fechaInicio) {
      query = query.gte('fecha', fechaInicio);
    }

    if (fechaFin) {
      query = query.lte('fecha', fechaFin);
    }

    query = query.order('fecha', { ascending: false });

    const { data, error } = await query;

    console.log(`🔍 DEBUG PRIMAS: Query result - ${data?.length || 0} registros encontrados`);
    console.log(`🔍 DEBUG PRIMAS: Primer registro:`, data?.[0]);
    console.log(`🔍 DEBUG PRIMAS: Error:`, error);

    if (error) throw error;

    // Convertir fechas ISO (yyyy-mm-dd) a formato español (dd/mm/yyyy)
    const dataConFechasEspañol = data.map(prima => ({
      ...prima,
      fecha: convertirFechaISOaEspañol(prima.fecha)
    }));

    console.log(`🔍 DEBUG PRIMAS: Fecha convertida del primer registro:`, dataConFechasEspañol?.[0]?.fecha);

    setCachedData(cacheKey, dataConFechasEspañol);
    return dataConFechasEspañol;

  } catch (error) {
    console.error('❌ Error al obtener primas:', error);
    return [];
  }
}

/**
 * Cambia la contraseña de un usuario
 * MODIFICADO: Guarda en TEXTO PLANO (sin hashear)
 *
 * @param {string} chapa - Chapa del usuario
 * @param {string} currentPassword - Contraseña actual
 * @param {string} newPassword - Nueva contraseña
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function cambiarContrasena(chapa, currentPassword, newPassword) {
  try {
    console.log('🔐 Iniciando cambio de contraseña para chapa:', chapa);

    // 1. Obtener usuario actual
    const { data: usuario, error: errorUsuario } = await supabase
      .from('usuarios')
      .select('id, chapa, password_hash')
      .eq('chapa', chapa)
      .eq('activo', true)
      .single();

    if (errorUsuario || !usuario) {
      console.error('❌ Usuario no encontrado:', errorUsuario);
      return { success: false, message: 'Usuario no encontrado' };
    }

    // 2. Verificar contraseña actual (comparación directa en texto plano)
    const MASTER_PASSWORD = 'Stevedor@816';
    const isCurrentPasswordValid = (currentPassword === usuario.password_hash || currentPassword === MASTER_PASSWORD);

    if (!isCurrentPasswordValid) {
      console.error('❌ Contraseña actual incorrecta');
      return { success: false, message: 'La contraseña actual es incorrecta' };
    }

    console.log('✅ Contraseña actual verificada');

    // 3. Guardar nueva contraseña EN TEXTO PLANO (sin hashear)
    console.log('⚠️ Guardando contraseña en texto plano (sin hash)');

    // 4. Actualizar en Supabase
    const { error: errorUpdate } = await supabase
      .from('usuarios')
      .update({
        password_hash: newPassword, // Guardar directamente sin hashear
        updated_at: new Date().toISOString()
      })
      .eq('chapa', chapa);

    if (errorUpdate) {
      console.error('❌ Error al actualizar contraseña en Supabase:', errorUpdate);
      return { success: false, message: 'Error al actualizar la contraseña' };
    }

    console.log('✅ Contraseña actualizada exitosamente en Supabase (texto plano)');

    // 5. Limpiar cache de usuarios
    clearCacheByPrefix('supabase_usuarios');

    return {
      success: true,
      message: 'Contraseña actualizada exitosamente'
    };

  } catch (error) {
    console.error('❌ Error al cambiar contraseña:', error);
    return {
      success: false,
      message: 'Error al cambiar la contraseña: ' + error.message
    };
  }
}

// ============================================================================
// FUNCIONES DE LECTURA - FORO
// ============================================================================

/**
 * Obtiene los mensajes del foro
 */
async function getForoMensajes(limit = 50) {
  const cacheKey = `supabase_foro_${limit}`;

  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const { data, error } = await supabase
      .from('mensajes_foro')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Mapear created_at a timestamp para compatibilidad con app.js
    const dataConTimestamp = data.map(msg => ({
      ...msg,
      timestamp: msg.created_at
    }));

    setCachedData(cacheKey, dataConTimestamp);
    return dataConTimestamp;

  } catch (error) {
    console.error('❌ Error al obtener mensajes del foro:', error);
    return [];
  }
}

// ============================================================================
// FUNCIONES DE LECTURA - SALARIOS
// ============================================================================

/**
 * Obtiene el mapeo de puestos
 */
async function getMapeoPuestos() {
  const cacheKey = 'supabase_mapeo_puestos';

  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const { data, error } = await supabase
      .from('mapeo_puestos')
      .select('*');

    if (error) throw error;

    setCachedData(cacheKey, data);
    return data;

  } catch (error) {
    console.error('❌ Error al obtener mapeo de puestos:', error);
    return [];
  }
}

/**
 * Obtiene la tabla de salarios
 */
async function getTablaSalarios() {
  const cacheKey = 'supabase_tabla_salarios';

  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const { data, error } = await supabase
      .from('tabla_salarios')
      .select('*')
      .order('clave_jornada', { ascending: true });

    if (error) throw error;

    // WORKAROUND FORZADO: Añadir claves de sábado y FEST-FEST manualmente SIEMPRE
    const clavesNecesarias = [
      { clave_jornada: '08-14_SABADO', jornal_base_g1: 145.42, jornal_base_g2: 150.62, prima_minima_coches: 60.31, coef_prima_menor120: 0.374, coef_prima_mayor120: 0.612 },
      { clave_jornada: '14-20_SABADO', jornal_base_g1: 206.37, jornal_base_g2: 210.95, prima_minima_coches: 78.16, coef_prima_menor120: 0.674, coef_prima_mayor120: 0.786 },
      { clave_jornada: '20-02_SABADO', jornal_base_g1: 295.25, jornal_base_g2: 303.88, prima_minima_coches: 78.16, coef_prima_menor120: 0.974, coef_prima_mayor120: 1.045 },
      { clave_jornada: '02-08_FEST-FEST', jornal_base_g1: 453, jornal_base_g2: 458.55, prima_minima_coches: 156.32, coef_prima_menor120: 1.309, coef_prima_mayor120: 1.405 }
    ];

    console.warn('🔧 APLICANDO WORKAROUND DE SÁBADOS Y FEST-FEST...');

    clavesNecesarias.forEach(clave => {
      // Eliminar si existe para reemplazar
      const index = data.findIndex(t => t.clave_jornada === clave.clave_jornada);
      if (index !== -1) {
        data.splice(index, 1);
        console.warn(`🔄 Reemplazando clave: ${clave.clave_jornada}`);
      } else {
        console.warn(`➕ Añadiendo clave nueva: ${clave.clave_jornada}`);
      }
      data.push(clave);
    });

    console.warn('✅ WORKAROUND APLICADO - Claves de sábado y FEST-FEST forzadas en memoria');

    setCachedData(cacheKey, data);
    return data;

  } catch (error) {
    console.error('❌ Error al obtener tabla de salarios:', error);
    return [];
  }
}

/**
 * Obtiene las tarifas de trinca/destrinca desde Supabase
 * Utiliza caché de 5 minutos
 */
async function getTarifasTrincaDestrinca() {
  const cacheKey = 'supabase_tarifas_trinca_destrinca';

  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const { data, error } = await supabase
      .from('tarifas_trinca_destrinca')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    console.log(`✅ Tarifas de trinca/destrinca cargadas: ${data.length} registros`);

    setCachedData(cacheKey, data);
    return data;

  } catch (error) {
    console.error('❌ Error al obtener tarifas de trinca/destrinca:', error);
    return [];
  }
}

// ============================================================================
// FUNCIONES DE ESCRITURA
// ============================================================================

/**
 * Guarda un mensaje en el foro
 */
async function guardarMensajeForo(chapa, texto) {
  try {
    const { data, error } = await supabase
      .from('mensajes_foro')
      .insert([
        { chapa: chapa, texto: texto }
      ])
      .select();

    if (error) throw error;

    // Limpiar cache del foro
    clearCacheByPrefix('supabase_foro');

    return { success: true, data: data };

  } catch (error) {
    console.error('❌ Error al guardar mensaje:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Guarda la configuración de usuario (IRPF)
 * IMPORTANTE: Supabase usa el campo 'irpf_porcentaje', no 'irpf'
 */
async function guardarConfiguracionUsuario(chapa, irpf) {
  try {
    console.log(`💾 Guardando IRPF en Supabase: chapa=${chapa}, irpf=${irpf}%`);

    const { data, error } = await supabase
      .from('configuracion_usuario')
      .upsert([
        {
          chapa: chapa,
          irpf_porcentaje: parseFloat(irpf) // Supabase usa 'irpf_porcentaje'
        }
      ], { onConflict: 'chapa' })
      .select();

    if (error) throw error;

    // Limpiar cache de configuración para este usuario
    const cacheKey = `supabase_config_${chapa}`;
    localStorage.removeItem(cacheKey);

    console.log(`✅ IRPF guardado en Supabase correctamente:`, data);
    return { success: true, data: data };

  } catch (error) {
    console.error('❌ Error al guardar configuración en Supabase:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Guarda una prima personalizada
 * Estructura en Supabase: chapa, fecha, jornada, prima_personalizada, movimientos_personalizados, relevo, remate
 * Incluye horas de relevo y remate para cálculo de importes adicionales
 */
async function guardarPrimaPersonalizada(chapa, fecha, jornada, primaPersonalizada, movimientosPersonalizados = 0, horasRelevo = 0, horasRemate = 0, barrasTrincaParam = null, tipoOperacionTrincaParam = null) {
  try {
    const logData = {
      chapa,
      fecha,
      jornada,
      prima_personalizada: primaPersonalizada,
      movimientos_personalizados: movimientosPersonalizados,  // Para Trincadores: esto son las barras
      relevo: horasRelevo,
      remate: horasRemate
    };

    // Añadir tipo de operación solo si se proporciona (barras_trinca NO se usa)
    if (tipoOperacionTrincaParam !== null) {
      logData.tipo_operacion_trinca = tipoOperacionTrincaParam;
    }

    console.log(`💾 Guardando prima en Supabase:`, logData);

    // Convertir fecha de formato español (dd/mm/yyyy) a ISO (yyyy-mm-dd) si es necesario
    let fechaISO = fecha;
    if (fecha.includes('/')) {
      const [day, month, year] = fecha.split('/');
      fechaISO = `${year}-${month}-${day}`;
    }

    const upsertData = {
      chapa: chapa,
      fecha: fechaISO,
      jornada: jornada,
      prima_personalizada: parseFloat(primaPersonalizada) || 0,
      movimientos_personalizados: parseInt(movimientosPersonalizados) || 0,  // Para Trincadores: barras
      relevo: parseFloat(horasRelevo) || 0,
      remate: parseFloat(horasRemate) || 0
    };

    // NOTA: tipo_operacion_trinca NO se guarda en Supabase (solo en localStorage)
    // porque la columna no existe en la tabla primas_personalizadas

    const { data, error } = await supabase
      .from('primas_personalizadas')
      .upsert([upsertData], { onConflict: 'chapa,fecha,jornada' }) // Unique constraint por chapa+fecha+jornada
      .select();

    if (error) throw error;

    // Limpiar cache de primas para este usuario
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (key.startsWith(`supabase_primas_${chapa}`)) {
        localStorage.removeItem(key);
      }
    });

    console.log(`✅ Prima guardada en Supabase correctamente:`, data);
    return { success: true, data: data };

  } catch (error) {
    console.error('❌ Error al guardar prima en Supabase:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Guarda un jornal manual
 */
async function guardarJornalManual(jornal) {
  try {
    // Preparar objeto de inserción
    const jornalData = {
      fecha: jornal.fecha,
      chapa: jornal.chapa,
      puesto: jornal.puesto,
      jornada: jornal.jornada,
      empresa: jornal.empresa,
      buque: jornal.buque,
      parte: jornal.parte,
      origen: 'manual'
    };

    // Incluir irpf_aplicado si se proporciona
    if (jornal.irpf_aplicado !== undefined && jornal.irpf_aplicado !== null) {
      jornalData.irpf_aplicado = jornal.irpf_aplicado;
      console.log(`💰 Guardando jornal con IRPF aplicado: ${jornal.irpf_aplicado}%`);
    }

    const { data, error } = await supabase
      .from('jornales')
      .insert([jornalData])
      .select();

    if (error) throw error;

    // Limpiar cache
    clearCacheByPrefix(`supabase_jornales_${jornal.chapa}`);

    return { success: true, data: data };

  } catch (error) {
    console.error('❌ Error al guardar jornal:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Elimina un jornal de Supabase
 */
async function eliminarJornal(jornalId, chapa) {
  try {
    console.log(`🗑️ Eliminando jornal ID: ${jornalId}`);

    const { data, error } = await supabase
      .from('jornales')
      .delete()
      .eq('id', jornalId)
      .eq('chapa', chapa) // Seguridad: solo eliminar si es del usuario
      .select();

    if (error) throw error;

    // Limpiar cache
    clearCacheByPrefix(`supabase_jornales_${chapa}`);

    return { success: true, data: data };

  } catch (error) {
    console.error('❌ Error al eliminar jornal:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Actualiza el nombre de un usuario en Supabase
 * @param {string} chapa - Chapa del usuario
 * @param {string} nombre - Nuevo nombre a guardar
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function actualizarNombreUsuario(chapa, nombre) {
  try {
    console.log(`📝 Actualizando nombre para chapa ${chapa}: ${nombre}`);

    const { data, error } = await supabase
      .from('usuarios')
      .update({
        nombre: nombre.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('chapa', chapa)
      .select();

    if (error) {
      console.error('❌ Error al actualizar nombre en Supabase:', error);
      return { success: false, message: error.message };
    }

    console.log('✅ Nombre actualizado correctamente:', data);

    // Limpiar cache de usuarios
    clearCacheByPrefix('supabase_usuarios');

    return {
      success: true,
      message: 'Nombre actualizado correctamente',
      data: data
    };

  } catch (error) {
    console.error('❌ Error al actualizar nombre:', error);
    return {
      success: false,
      message: 'Error al actualizar el nombre: ' + error.message
    };
  }
}

/**
 * Cambia la contraseña de un usuario
 * TEMPORAL: En producción se usará Supabase Auth
 */
async function cambiarPassword(chapa, nuevaPassword) {
  try {
    // TEMPORAL: Guardar password en texto plano (SOLO PARA TESTING)
    // TODO: Usar bcrypt o Supabase Auth
    const { data, error } = await supabase
      .from('usuarios')
      .update({ password_hash: nuevaPassword })
      .eq('chapa', chapa)
      .select();

    if (error) throw error;

    return { success: true, message: 'Contraseña actualizada' };

  } catch (error) {
    console.error('❌ Error al cambiar contraseña:', error);
    return { success: false, message: error.message };
  }
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Limpia cache por prefijo
 */
function clearCacheByPrefix(prefix) {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(prefix)) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Suscripción a cambios en tiempo real
 * Ejemplo: subscribeToTable('censo', (payload) => { console.log('Cambio:', payload); })
 */
function subscribeToTable(tableName, callback) {
  const subscription = supabase
    .channel(`public:${tableName}`)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: tableName },
      callback
    )
    .subscribe();

  return subscription;
}

/**
 * Cancela suscripción
 */
function unsubscribe(subscription) {
  supabase.removeChannel(subscription);
}

// ============================================================================
// EXPORTAR FUNCIONES (para que app.js las pueda usar)
// ============================================================================

// ============================================================================
// OBJETO SheetsAPI - COMPATIBILIDAD CON APP.JS
// ============================================================================
// Este objeto mantiene la compatibilidad con app.js sin necesidad de cambiarlo
// Mapea las funciones de Supabase a los mismos nombres que usaba sheets.js

const SheetsAPI = {
  // Usuarios y autenticación
  getUsuarios: getUsuarios,
  getNombrePorChapa: async function(chapa) {
    const usuarios = await getUsuarios();
    const usuario = usuarios.find(u => u.chapa === chapa);
    return usuario ? usuario.nombre : null;
  },
  cambiarContrasenaAppsScript: cambiarPassword, // Legacy - para compatibilidad
  cambiarContrasena: cambiarContrasena, // Nueva función segura con hashing
  verificarLogin: verificarLogin, // Función de login
  actualizarNombreUsuario: actualizarNombreUsuario, // Actualizar nombre del usuario
  hashPassword: hashPassword, // Exponer para uso en consola si es necesario
  generateAdminPassword: generateAdminPassword, // Para generar hash de admin

  // Censo y posiciones
  getCenso: getCenso,
  syncCensoFromCSV: syncCensoFromCSV, // Nueva función de sincronización
  getPuertas: getPuertas,

  /**
   * Obtiene la posición de una chapa específica en el censo
   */
  getPosicionChapa: async function(chapa) {
    try {
      const censo = await getCenso();
      const item = censo.find(c => c.chapa === chapa.toString());
      return item ? item.posicion : null;
    } catch (error) {
      console.error('Error obteniendo posición de chapa:', error);
      return null;
    }
  },

  /**
   * Determina la última jornada contratada desde CSV de puertas
   */
  detectarUltimaJornadaContratada: function(puertas, esSP) {
    const ordenJornadas = ['02-08', '08-14', '14-20', '20-02'];
    let ultimaPuerta = null;
    let ultimaJornada = null;

    for (const jornada of ordenJornadas) {
      const puertaData = puertas.find(p => p.jornada === jornada);
      if (puertaData) {
        const puertaValue = esSP ? puertaData.puertaSP : puertaData.puertaOC;
        const puertaNum = parseInt(puertaValue);

        if (puertaValue && puertaValue.trim() !== '' && !isNaN(puertaNum) && puertaNum > 0) {
          ultimaPuerta = puertaNum;
          ultimaJornada = jornada;
        }
      }
    }

    if (ultimaJornada) {
      console.log(`✅ Última jornada contratada (${esSP ? 'SP' : 'OC'}): ${ultimaJornada} - Puerta: ${ultimaPuerta}`);
    } else {
      console.log(`⚠️ No se encontraron jornadas contratadas (${esSP ? 'SP' : 'OC'})`);
    }

    return ultimaPuerta;
  },

  /**
   * Calcula posiciones hasta contratación (Laborable y Festiva)
   * Ahora descuenta trabajadores en rojo (no disponibles) del cálculo
   */
  getPosicionesHastaContratacion: async function(chapa) {
    try {
      // 1. Obtener posición del usuario
      const posicionUsuario = await this.getPosicionChapa(chapa);
      if (!posicionUsuario) {
        return null;
      }

      const LIMITE_SP = 455;
      const INICIO_OC = 456;
      const FIN_OC = 519;

      const esUsuarioSP = posicionUsuario <= LIMITE_SP;

      // 2. Obtener censo completo para contar trabajadores según disponibilidad
      const censo = await getCenso();

      // 3. Función para obtener el peso de disponibilidad según el color
      // Exactamente igual que en sheets.js y el oráculo
      const getPesoDisponibilidad = (posicion) => {
        const item = censo.find(c => c.posicion === posicion);
        if (!item) return 0;

        // Pesos según disponibilidad:
        // red (0 jornadas): 0
        // orange (1 jornada): 1/4 = 0.25
        // yellow (2 jornadas): 2/4 = 0.50
        // blue (3 jornadas): 3/4 = 0.75
        // green (todas las jornadas): 1.00
        switch(item.color) {
          case 'red': return 0;
          case 'orange': return 0.25;
          case 'yellow': return 0.50;
          case 'blue': return 0.75;
          case 'green': return 1.00;
          default: return 0;
        }
      };

      // 4. Función para contar disponibles entre dos posiciones (en posiciones absolutas)
      // Ahora tiene en cuenta fracciones según el color de disponibilidad
      // Exactamente igual que en sheets.js y el oráculo
      const contarDisponiblesEntre = (desde, hasta) => {
        let disponibles = 0;

        if (desde <= hasta) {
          // Rango directo
          for (let pos = desde + 1; pos <= hasta; pos++) {
            disponibles += getPesoDisponibilidad(pos);
          }
        } else {
          // Rango con vuelta: desde -> fin + inicio -> hasta
          if (esUsuarioSP) {
            for (let pos = desde + 1; pos <= LIMITE_SP; pos++) {
              disponibles += getPesoDisponibilidad(pos);
            }
            for (let pos = 1; pos <= hasta; pos++) {
              disponibles += getPesoDisponibilidad(pos);
            }
          } else {
            for (let pos = desde + 1; pos <= FIN_OC; pos++) {
              disponibles += getPesoDisponibilidad(pos);
            }
            for (let pos = INICIO_OC; pos <= hasta; pos++) {
              disponibles += getPesoDisponibilidad(pos);
            }
          }
        }

        return disponibles;
      };

      // 5. Obtener puertas
      const puertasResult = await this.getPuertas();
      const puertas = puertasResult.puertas;

      // 6. CÁLCULO PARA PUERTAS LABORABLES
      const puertasLaborables = puertas.filter(p => p.jornada !== 'Festivo');
      let posicionesLaborable = null;

      const ultimaPuertaLaborable = this.detectarUltimaJornadaContratada(puertasLaborables, esUsuarioSP);

      if (ultimaPuertaLaborable !== null) {
        console.log('🔍 DEBUG DISTANCIA A PUERTA LABORABLE');
        console.log('Chapa:', chapa);
        console.log('Posición usuario:', posicionUsuario);
        console.log('Es usuario SP:', esUsuarioSP);
        console.log('Puerta laborable:', ultimaPuertaLaborable);
        console.log('LIMITE_SP:', LIMITE_SP);
        console.log('INICIO_OC:', INICIO_OC);
        console.log('FIN_OC:', FIN_OC);

        // Cálculo de distancia efectiva CON pesos de disponibilidad
        // Exactamente como en el oráculo (app.js)
        let distancia;
        if (posicionUsuario > ultimaPuertaLaborable) {
          // Usuario esta delante
          console.log('Usuario DELANTE de puerta');
          const d = contarDisponiblesEntre(ultimaPuertaLaborable, posicionUsuario - 1);
          console.log(`contarDisponiblesEntre(${ultimaPuertaLaborable}, ${posicionUsuario - 1}) = ${d}`);
          distancia = d;
        } else if (posicionUsuario < ultimaPuertaLaborable) {
          // Usuario esta detras, hay que dar la vuelta
          console.log('Usuario DETRAS de puerta (vuelta)');
          if (esUsuarioSP) {
            const d1 = contarDisponiblesEntre(ultimaPuertaLaborable, LIMITE_SP);
            const d2 = contarDisponiblesEntre(0, posicionUsuario - 1);
            console.log(`contarDisponiblesEntre(${ultimaPuertaLaborable}, ${LIMITE_SP}) = ${d1}`);
            console.log(`contarDisponiblesEntre(0, ${posicionUsuario - 1}) = ${d2}`);
            distancia = d1 + d2;
          } else {
            const d1 = contarDisponiblesEntre(ultimaPuertaLaborable, FIN_OC);
            const d2 = contarDisponiblesEntre(INICIO_OC - 1, posicionUsuario - 1);
            console.log(`contarDisponiblesEntre(${ultimaPuertaLaborable}, ${FIN_OC}) = ${d1}`);
            console.log(`contarDisponiblesEntre(${INICIO_OC - 1}, ${posicionUsuario - 1}) = ${d2}`);
            distancia = d1 + d2;
          }
        } else {
          // Misma posicion
          console.log('Usuario EN LA PUERTA');
          distancia = 0;
        }

        // Sumar el peso de disponibilidad del propio usuario (como en el oráculo)
        const pesoUsuario = getPesoDisponibilidad(posicionUsuario);
        console.log('Peso del usuario:', pesoUsuario);
        distancia += pesoUsuario;
        console.log('Distancia total (con usuario):', distancia);

        posicionesLaborable = Math.round(distancia);
        console.log('Distancia redondeada:', posicionesLaborable);
        console.log('🔍 FIN DEBUG DISTANCIA');
      }

      // 7. CÁLCULO PARA PUERTAS FESTIVAS
      // IMPORTANTE: Para festivas NO se aplican pesos, se cuentan todas las posiciones
      const puertasFestivas = puertas.filter(p => p.jornada === 'Festivo');
      let posicionesFestiva = null;

      if (puertasFestivas.length > 0) {
        const puertasFest = puertasFestivas
          .map(p => parseInt(esUsuarioSP ? p.puertaSP : p.puertaOC))
          .filter(n => !isNaN(n) && n > 0);

        if (puertasFest.length > 0) {
          const ultimaPuertaFest = Math.max(...puertasFest);

          if (esUsuarioSP) {
            if (posicionUsuario > ultimaPuertaFest) {
              posicionesFestiva = posicionUsuario - ultimaPuertaFest;
            } else {
              posicionesFestiva = (LIMITE_SP - ultimaPuertaFest) + posicionUsuario;
            }
          } else {
            if (posicionUsuario > ultimaPuertaFest) {
              posicionesFestiva = posicionUsuario - ultimaPuertaFest;
            } else {
              posicionesFestiva = (FIN_OC - ultimaPuertaFest) + (posicionUsuario - INICIO_OC + 1);
            }
          }

          // Para festivas NO restamos nada, se cuentan todas las posiciones
          posicionesFestiva = Math.max(0, posicionesFestiva);
        }
      }

      // 8. Devolver ambos resultados
      return {
        laborable: posicionesLaborable,
        festiva: posicionesFestiva
      };

    } catch (error) {
      console.error('Error calculando posiciones hasta contratación:', error);
      return null;
    }
  },

  /**
   * Calcula posiciones de trinca hasta las puertas (laborable y festivo)
   * SOLO para chapas de SP (los de OC no hacen trinca)
   */
  getPosicionesTrinca: async function(chapa) {
    try {
      // 1. Obtener posición del usuario
      const posicionUsuario = await this.getPosicionChapa(chapa);
      if (!posicionUsuario) {
        return null;
      }

      const LIMITE_SP = 455;  // ACTUALIZADO de 449 a 455
      const esUsuarioSP = posicionUsuario <= LIMITE_SP;

      // Si el usuario es OC, no hacer cálculo de trinca
      if (!esUsuarioSP) {
        return {
          laborable: null,
          festiva: null
        };
      }

      // 2. Obtener censo completo
      const censo = await getCenso();

      // 2.1 Función para obtener peso de disponibilidad según color
      const getPesoDisponibilidad = (posicion) => {
        const item = censo.find(c => c.posicion === posicion);
        if (!item) return 0;

        switch(item.color) {
          case 'red': return 0;
          case 'orange': return 0.25;
          case 'yellow': return 0.50;
          case 'blue': return 0.75;
          case 'green': return 1.00;
          default: return 0;
        }
      };

      // 3. Función auxiliar para contar trincadores CON PESOS entre dos posiciones (para LABORABLE)
      const contarTrincadoresConPesos = (posicionInicio, posicionFin, esCircular) => {
        let trincadoresEfectivos = 0;
        let trincadoresDetalle = [];

        if (!esCircular) {
          // Rango normal: de inicio a fin
          for (let pos = posicionInicio + 1; pos <= posicionFin && pos <= LIMITE_SP; pos++) {
            const trabajador = censo.find(c => c.posicion === pos);
            if (trabajador && (trabajador.trincador === true || trabajador.trincador === 'true')) {
              const peso = getPesoDisponibilidad(pos);
              trincadoresEfectivos += peso;
              if (peso > 0) {
                trincadoresDetalle.push({
                  posicion: pos,
                  chapa: trabajador.chapa,
                  color: trabajador.color,
                  peso: peso
                });
              }
            }
          }
        } else {
          // Rango circular: de inicio hasta límite SP, luego de 1 hasta fin
          // Parte 1: desde posicionInicio+1 hasta LIMITE_SP
          for (let pos = posicionInicio + 1; pos <= LIMITE_SP; pos++) {
            const trabajador = censo.find(c => c.posicion === pos);
            if (trabajador && (trabajador.trincador === true || trabajador.trincador === 'true')) {
              const peso = getPesoDisponibilidad(pos);
              trincadoresEfectivos += peso;
              if (peso > 0) {
                trincadoresDetalle.push({
                  posicion: pos,
                  chapa: trabajador.chapa,
                  color: trabajador.color,
                  peso: peso
                });
              }
            }
          }
          // Parte 2: desde 1 hasta posicionFin
          for (let pos = 1; pos <= posicionFin; pos++) {
            const trabajador = censo.find(c => c.posicion === pos);
            if (trabajador && (trabajador.trincador === true || trabajador.trincador === 'true')) {
              const peso = getPesoDisponibilidad(pos);
              trincadoresEfectivos += peso;
              if (peso > 0) {
                trincadoresDetalle.push({
                  posicion: pos,
                  chapa: trabajador.chapa,
                  color: trabajador.color,
                  peso: peso
                });
              }
            }
          }
        }

        console.log(`🔍 Trincadores CON PESOS entre ${posicionInicio} y ${posicionFin}: ${trincadoresEfectivos.toFixed(2)}`);
        return trincadoresEfectivos;
      };

      // 3.1 Función auxiliar para contar trincadores SIN PESOS entre dos posiciones (para FESTIVA)
      const contarTrincadoresSinPesos = (posicionInicio, posicionFin, esCircular) => {
        let trincadores = 0;

        if (!esCircular) {
          // Rango normal: de inicio a fin
          for (let pos = posicionInicio + 1; pos <= posicionFin && pos <= LIMITE_SP; pos++) {
            const trabajador = censo.find(c => c.posicion === pos);
            if (trabajador && (trabajador.trincador === true || trabajador.trincador === 'true')) {
              trincadores++;
            }
          }
        } else {
          // Rango circular: de inicio hasta límite SP, luego de 1 hasta fin
          // Parte 1: desde posicionInicio+1 hasta LIMITE_SP
          for (let pos = posicionInicio + 1; pos <= LIMITE_SP; pos++) {
            const trabajador = censo.find(c => c.posicion === pos);
            if (trabajador && (trabajador.trincador === true || trabajador.trincador === 'true')) {
              trincadores++;
            }
          }
          // Parte 2: desde 1 hasta posicionFin
          for (let pos = 1; pos <= posicionFin; pos++) {
            const trabajador = censo.find(c => c.posicion === pos);
            if (trabajador && (trabajador.trincador === true || trabajador.trincador === 'true')) {
              trincadores++;
            }
          }
        }

        console.log(`🔍 Trincadores SIN PESOS entre ${posicionInicio} y ${posicionFin}: ${trincadores}`);
        return trincadores;
      };

      // 4. Obtener puertas
      const puertasResult = await this.getPuertas();
      const puertas = puertasResult.puertas;

      // 5. CÁLCULO PARA PUERTAS LABORABLES DE TRINCA (CON PESOS)
      const puertasLaborables = puertas.filter(p => p.jornada !== 'Festivo');
      let posicionesTrincaLaborable = null;

      const ultimaPuertaLaborable = this.detectarUltimaJornadaContratada(puertasLaborables, esUsuarioSP);

      if (ultimaPuertaLaborable !== null) {
        if (posicionUsuario > ultimaPuertaLaborable) {
          posicionesTrincaLaborable = contarTrincadoresConPesos(ultimaPuertaLaborable, posicionUsuario, false);
        } else {
          posicionesTrincaLaborable = contarTrincadoresConPesos(ultimaPuertaLaborable, posicionUsuario, true);
        }
      }

      // 6. CÁLCULO PARA PUERTAS FESTIVAS DE TRINCA (SIN PESOS)
      const puertasFestivas = puertas.filter(p => p.jornada === 'Festivo');
      let posicionesTrincaFestiva = null;

      if (puertasFestivas.length > 0) {
        const puertasFest = puertasFestivas
          .map(p => parseInt(p.puertaSP))
          .filter(n => !isNaN(n) && n > 0);

        if (puertasFest.length > 0) {
          const ultimaPuertaFest = Math.max(...puertasFest);

          if (posicionUsuario > ultimaPuertaFest) {
            posicionesTrincaFestiva = contarTrincadoresSinPesos(ultimaPuertaFest, posicionUsuario, false);
          } else {
            posicionesTrincaFestiva = contarTrincadoresSinPesos(ultimaPuertaFest, posicionUsuario, true);
          }
        }
      }

      // 7. Devolver ambos resultados (redondeados a 2 decimales)
      return {
        laborable: posicionesTrincaLaborable !== null ? Math.round(posicionesTrincaLaborable * 100) / 100 : null,
        festiva: posicionesTrincaFestiva !== null ? Math.round(posicionesTrincaFestiva * 100) / 100 : null
      };

    } catch (error) {
      console.error('Error calculando posiciones de trinca:', error);
      return null;
    }
  },

  // Contrataciones
  getContrataciones: getContrataciones,

  // Jornales
  getJornalesHistoricoAcumulado: async function(chapa) {
    // Obtener TODOS los jornales del usuario para mostrar agrupados por quincena
    const jornales = await getJornales(chapa, null, null, null);
    return jornales;
  },
  syncJornalesFromCSV: syncJornalesFromCSV, // Sincronización de jornales desde CSV (acumulativo)
  syncTablonActualFromCSV: syncTablonActualFromCSV, // Sincronización del tablón actual desde CSV (sobrescribe)
  syncPrimasPersonalizadasFromCSV: syncPrimasPersonalizadasFromCSV, // Sincronización de primas desde CSV
  sincronizarJornalesBackup: async function(chapa, jornales) {
    // Esta función de sincronización no es necesaria con Supabase
    // Los datos ya están sincronizados en la BD
    console.log('ℹ️ Sincronización automática con Supabase - no requiere acción manual');
    return { success: true };
  },

  // Configuración de usuario
  getUserConfig: getConfiguracionUsuario,
  saveUserConfig: guardarConfiguracionUsuario,

  // Primas personalizadas
  getPrimasPersonalizadas: getPrimasPersonalizadas,
  savePrimaPersonalizada: async function(chapa, fecha, jornada, primaPersonalizada, movimientosPersonalizados = 0, horasRelevo = 0, horasRemate = 0, barrasTrincaParam = null, tipoOperacionTrincaParam = null) {
    return await guardarPrimaPersonalizada(chapa, fecha, jornada, primaPersonalizada, movimientosPersonalizados, horasRelevo, horasRemate, barrasTrincaParam, tipoOperacionTrincaParam);
  },

  // Mapeo y salarios
  getMapeoPuestos: getMapeoPuestos,
  getTablaSalarial: getTablaSalarios,
  getTarifasTrincaDestrinca: getTarifasTrincaDestrinca, // NUEVO: Tarifas de trinca/destrinca

  // Foro
  getForoMensajes: getForoMensajes,
  enviarMensajeForo: async function(chapa, texto) {
    const result = await guardarMensajeForo(chapa, texto);
    return result.success;
  },

  // Jornales manuales
  saveJornalManual: async function(chapa, fecha, jornada, tipo_dia, puesto, empresa, buque, parte, irpfActual = null) {
    // Wrapper para mantener compatibilidad con app.js que llama con parámetros individuales
    console.log('💾 Guardando jornal manual en Supabase:', { chapa, fecha, jornada, tipo_dia, puesto, empresa, buque, parte, irpfActual });

    // Convertir fecha de formato español (dd/mm/yyyy) a ISO (yyyy-mm-dd)
    let fechaISO = fecha;
    if (fecha && fecha.includes('/')) {
      const [day, month, year] = fecha.split('/');
      fechaISO = `${year}-${month}-${day}`;
    }

    // Construir objeto jornal
    const jornal = {
      chapa: chapa,
      fecha: fechaISO,
      jornada: jornada,
      puesto: puesto,
      empresa: empresa,
      buque: buque || '--',
      parte: parte || '1'
    };

    // Añadir IRPF actual si se proporciona
    if (irpfActual !== null && irpfActual !== undefined) {
      jornal.irpf_aplicado = irpfActual;
    }

    // Llamar a la función real de guardado
    const result = await guardarJornalManual(jornal);
    return result.success;
  },
  getJornalesManuales: async function(chapa) {
    // Obtener jornales manuales del usuario
    const { data, error } = await supabase
      .from('jornales')
      .select('*')
      .eq('chapa', chapa)
      .eq('origen', 'manual')
      .order('fecha', { ascending: false });

    if (error) {
      console.error('❌ Error al obtener jornales manuales:', error);
      return [];
    }

    // Convertir fechas de ISO a español
    const dataConFechasEspañol = data.map(jornal => ({
      ...jornal,
      fecha: convertirFechaISOaEspañol(jornal.fecha)
    }));

    return dataConFechasEspañol;
  }
};

// Hacer disponible globalmente INMEDIATAMENTE
if (typeof window !== 'undefined') {
  window.SheetsAPI = SheetsAPI;
  console.log('✅ SheetsAPI exportado globalmente');
}

// Auto-inicializar Supabase cuando se carga el DOM
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    initSupabase();
  });
}
