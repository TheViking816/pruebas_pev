/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  PORTAL ESTIBA VLC - Aplicación Principal                               █
 * █  Copyright © 2025 TheViking816 (Adrian Marin)                           █
 * █                                                                          █
 * █  ⚠️ CÓDIGO PROPIETARIO Y CONFIDENCIAL ⚠️                                 █
 * █                                                                          █
 * █  Este software es propiedad exclusiva de TheViking816.                  █
 * █  El uso, copia, modificación o distribución no autorizados están        █
 * █  ESTRICTAMENTE PROHIBIDOS y constituyen delito.                         █
 * █                                                                          █
 * █  Licencia: Ver archivo LICENSE                                          █
 * █  Violaciones serán perseguidas legalmente conforme a la                 █
 * █  Ley de Propiedad Intelectual (RDL 1/1996) y Código Penal (Art. 270)   █
 * █                                                                          █
 * █  Gestiona la navegación, autenticación y lógica de la aplicación        █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

// Estado global de la aplicación
const AppState = {
  currentUser: null,
  currentPage: 'login',
  isAuthenticated: false
};

// Datos estáticos - Enlaces actualizados con URLs reales
const ENLACES_DATA = [
  // Formularios  
  { titulo: 'Punto y HS', url: 'https://docs.google.com/forms/d/e/1FAIpQLSeGKl5gwKrcj110D_6xhHVo0bn7Fo56tneof68dRyS6xUrD7Q/viewform', categoria: 'Formularios', color: 'blue' },
  { titulo: 'Cambio Posición', url: 'https://docs.google.com/forms/d/e/1FAIpQLSe6V16kccSmyBAYCkDNphYAbD7dqe4ydHbVWu_zpXvnFFFxlA/viewform', categoria: 'Formularios', color: 'blue' },
  { titulo: 'Cambio IRPF', url: 'https://docs.google.com/forms/d/e/1FAIpQLSfDe2o5X_Bge14GA-bSBPRL7zpB2ZW_isBGGVFGAyvGkSAomQ/viewform', categoria: 'Formularios', color: 'blue' },
  { titulo: 'Justificantes', url: 'https://docs.google.com/forms/d/e/1FAIpQLSc27Doc2847bvoPTygEKscwl9jdMuavlCOgtzNDXYVnjSLsUQ/viewform', categoria: 'Formularios', color: 'blue' },
  { titulo: 'Comunicar Incidencia', url: 'https://docs.google.com/forms/d/e/1FAIpQLSdc_NZM-gasxCpPZ3z09HgKcEcIapDsgDhNi_9Y45a-jpJnMw/viewform', categoria: 'Formularios', color: 'blue' },
  { titulo: 'Modelo 145', url: 'https://docs.google.com/forms/d/e/1FAIpQLSdEumqz7aiATukMmIyO2euqhVW5HEqf5Tn5WetAH5LBabcprg/viewform', categoria: 'Formularios', color: 'blue' },
  { titulo: 'Reportar Bug', url: '#', categoria: 'Formularios', color: 'blue', modal: 'report-jornal' },
  // Disponibilidad
  { titulo: 'No Disponible Jornada', url: 'https://docs.google.com/forms/d/e/1FAIpQLSfXcs0lOG7beU9HMfum-6eKkwmZCjcvnOQXaFiiY8EAb9rpYA/closedform', categoria: 'Disponibilidad', color: 'yellow' },
  { titulo: 'No Disponible Periodo', url: 'https://docs.google.com/forms/d/e/1FAIpQLSfTqZSFoEbs89vxmGXVi5DKpKIyH5npIOpI11uiQnt32Rxp3g/closedform', categoria: 'Disponibilidad', color: 'yellow' },
  { titulo: 'Recuperación', url: 'https://docs.google.com/forms/d/e/1FAIpQLSeEaBKptVkoX4oxktWkl5Be7fOhjdYUiRupyFkrG3LxWKISMA/viewform', categoria: 'Disponibilidad', color: 'yellow' },

  // Documentos
  { titulo: 'Carnet de Conducir', url: 'https://docs.google.com/forms/d/e/1FAIpQLSdKF0jRJjcFrdbL3Wk_U-0Cjb3T-JeVYDNuN8QU1a-60kAXqA/viewform', categoria: 'Documentos', color: 'orange' },
  { titulo: 'Doc. Desempleo', url: 'https://docs.google.com/forms/d/e/1FAIpQLScL1GRtLuuRGgOolBLe31cWKqY92DZ9mFzfN2_uJwx3XmRq3g/viewform', categoria: 'Documentos', color: 'orange' },
  { titulo: '145 Abreviado', url: 'https://drive.google.com/file/d/1AwHoBJHTumN-cEYk6jV0nZGBGVFSJWPj/view', categoria: 'Documentos', color: 'orange' },

  // Seguridad
  { titulo: '¿Qué hago en caso de accidente?', url: 'https://drive.google.com/file/d/1Jei371j-lI95VTkBzm2XVfOxofjxvzbh/view', categoria: 'Seguridad', color: 'red' },

  // Información
  { titulo: 'Censo do', url: 'https://drive.google.com/file/d/1yIqMMJCRTyS8GZglMLTnR01A4MLU-spf/view', categoria: 'Información', color: 'green' },
  { titulo: 'Calendario de Pago', url: 'https://drive.google.com/file/d/1bovGdc1Fb6VRHrru1DrJOsSjbSEhFZgN/view', categoria: 'Información', color: 'green' },
  { titulo: 'Teléfonos Terminales', url: 'https://drive.google.com/file/d/1KxLm_X_0JdUEJF7JUuIvNNleU-PTqUgv/view', categoria: 'Información', color: 'green' },
  { titulo: 'Tabla Contratación', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSTtbkA94xqjf81lsR7bLKKtyES2YBDKs8J2T4UrSEan7e5Z_eaptShCA78R1wqUyYyASJxmHj3gDnY/pubhtml?gid=1388412839&single=true', categoria: 'Información', color: 'green' },
  { titulo: 'Chapero', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrMuapybwZUEGPR1vsP9p1_nlWvznyl0sPD4xWsNJ7HdXCj1ABY1EpU1um538HHZQyJtoAe5Niwrxq/pubhtml?gid=841547354&single=true', categoria: 'Información', color: 'green' },
  { titulo: 'Listado Ingreso CPE', url: 'https://drive.google.com/file/d/1YzLn6JHmCdQMrMlpNByIsdlYW3iU0P43/view?usp=drive_link', categoria: 'Información', color: 'green' },
  { titulo: 'Previsión Demandas', url: 'https://noray.cpevalencia.com/PrevisionDemanda.asp', categoria: 'Información', color: 'green' },
  { titulo: 'Chapero CPE', url: 'https://noray.cpevalencia.com/Chapero.asp', categoria: 'Información', color: 'green' },
  { titulo: 'Worker Hub CSP', url: 'https://workerhub.marvalsa.com/login', categoria: 'Información', color: 'green' },

  // Comunicaciones
  { titulo: 'Comunicación Contingencia', url: 'https://docs.google.com/forms/d/e/1FAIpQLSdxLm9xqP4FOv61h3-YoyRFzkxKcfAGir_YYRi5e4PTFisEAw/viewform', categoria: 'Comunicaciones', color: 'purple' },
  { titulo: 'Comunicaciones Oficina', url: 'https://docs.google.com/forms/d/e/1FAIpQLSc_wN20zG_88wmAAyXRsCxokTpfvxRKdILHr5BxrQUuNGqvyQ/closedform', categoria: 'Comunicaciones', color: 'purple' }
];

// Noticias y avisos - Añadir contenido real aquí
const NOTICIAS_DATA = [
  {
    titulo: '🎯 Mejora: Cálculo más Preciso del Oráculo',
    fecha: '25/11/2025',
    contenido: `El Oráculo y el cálculo de posiciones hasta la puerta ahora son más precisos:
    <ul style="list-style-type: disc; margin-left: 20px; margin-top: 10px;">
      <li style="margin-bottom: 5px;"><strong>Mayor precisión:</strong> El sistema ahora considera la disponibilidad parcial según su color.</li>
          <p style="margin-top: 10px; font-style: italic; color: #64748b;">Esto hace que tanto el Oráculo como el indicador de posiciones en el Dashboard sean más realistas y reflejen mejor las probabilidades reales de trabajar.</p>`
  },
  {
    titulo: '🔧 Corrección: Cálculo de Posiciones OC',
    fecha: '05/11/2025',
    contenido: `Se ha corregido un error en el cálculo de posiciones para el personal de <strong>OC (Operaciones Complementarias)</strong>:
    <ul style="list-style-type: disc; margin-left: 20px; margin-top: 10px;">
      <li style="margin-bottom: 5px;"><strong>Problema:</strong> El cálculo de "posiciones hasta la puerta" estaba considerando la puerta festiva en lugar de la laborable.</li>
      <li style="margin-bottom: 5px;"><strong>Solución:</strong> Ahora tanto SP como OC calculan sus posiciones basándose únicamente en las <strong>puertas laborables</strong> (02-08, 08-14, 14-20, 20-02).</li>
      <li><strong>Resultado:</strong> El indicador de posiciones en el Dashboard ahora muestra la distancia correcta para el personal de OC.</li>
    </ul>
    <p style="margin-top: 10px; font-style: italic; color: #64748b;">Gracias por reportar el problema. El cálculo ahora es preciso para todos los censos.</p>`
  },
  {
    titulo: '💰 ¡NUEVA FUNCIONALIDAD: Sueldómetro!',
    fecha: '05/11/2025',
    contenido: `Llega la función más esperada: el <strong>Sueldómetro</strong>. Ahora puedes calcular automáticamente tu salario estimado por quincena:
    <ul style="list-style-type: disc; margin-left: 20px; margin-top: 10px;">
      <li style="margin-bottom: 5px;"><strong>Cálculo automático:</strong> Calcula tu salario base según tu puesto y jornada (laborable, festivo o sábado).</li>
      <li style="margin-bottom: 5px;"><strong>Prima editable:</strong> Puedes modificar los movimientos o la prima directamente en la tabla.</li>
      <li style="margin-bottom: 5px;"><strong>IRPF personalizable:</strong> Ajusta tu porcentaje de IRPF y ve el cálculo neto actualizado al instante.</li>
      <li style="margin-bottom: 5px;"><strong>Complementos incluidos:</strong> Los puestos de Trincador y Trincador de Coches incluyen automáticamente su complemento de 46,94€ (marcado con *).</li>
      <li style="margin-bottom: 5px;"><strong>Resumen por quincena:</strong> Visualiza totales de base, prima, bruto y neto organizados por quincenas.</li>
      <li style="margin-bottom: 5px;"><strong>Estadísticas globales:</strong> Ve el total de jornales, total bruto/neto y promedio en la parte superior.</li>
      <li><strong>Optimizado para móvil:</strong> Totalmente responsive y táctil para calcular desde cualquier dispositivo.</li>
    </ul>
    <p style="margin-top: 10px; font-weight: 600; color: #10b981;">¡Accede a "Sueldómetro" desde el menú lateral y comienza a calcular tus salarios!</p>`
  },
  {
  titulo: '⚙️ Actualización: Sistema de Contratación más Robusto',
    fecha: '04/11/2025',
    contenido: `Se ha implementado un sistema robusto para garantizar la visibilidad de tus asignaciones, incluso si el sistema principal falla:
    <ul style="list-style-type: disc; margin-left: 20px; margin-top: 10px;">
      <li style="margin-bottom: 5px;"><strong>Mi Contratación:</strong> Ahora se guarda en tu dispositivo (localStorage). Si el CSV de contratación falla, tus asignaciones se mantienen visibles hasta medianoche (00:00).</li>
      <li style="margin-bottom: 5px;"><strong>Mis Jornales:</strong> El histórico es totalmente independiente y se actualiza automáticamente cada hora vía Apps Script.</li>
      <li><strong>Nuevo Enlace:</strong> Se ha añadido "Listado Ingreso CPE" en la sección de Enlaces Útiles.</li>
    </ul>`
  },
  {
    titulo: '🚀 ¡Nueva Función: Posición en la Puerta!',
    fecha: '02/11/2025', // <-- Recuerda ajustar la fecha si lo necesitas
    contenido: `Ahora puedes ver en la pantalla de "Dashboard" (justo debajo de tu nombre) a cuántas posiciones estás de la última puerta contratada.
    <ul style="list-style-type: disc; margin-left: 20px; margin-top: 10px;">
      <li style="margin-bottom: 5px;">El sistema calcula tu distancia automáticamente.</li>
      <li style="margin-bottom: 5px;">Importante: El cálculo tiene en cuenta si perteneces al censo de <b>SP</b> (Servicio Público) o al de <b>OC</b> (Operaciones Complementarias) y te compara con la puerta correspondiente a tu censo.</li>
      <li>Así sabrás de un vistazo cuánto falta para tu próxima contratación.</li>
    </ul>`
},
   {
    titulo: '📢 Actualización en Puertas: Añadida Puerta OC',
    fecha: '02/11/2025',
    contenido: `Se ha mejorado la visualización de las puertas. Ahora la tabla muestra tres columnas para mayor claridad:
    <ul style="list-style-type: disc; margin-left: 20px; margin-top: 10px;">      
      <li style="margin-bottom: 5px;">La <b>Puerta SP</b> se muestra en color <span style="color: #10b981; font-weight: 600;">Verde</span>.</li>
      <li style="margin-bottom: 5px;">La <b>Puerta OC</b> se muestra en color <span style="color: #0a2e5c; font-weight: 600;">Azul</span>.</li>
      <li>Este formato se aplica tanto a puertas laborables como festivas.</li>
    </ul>`
  },
  {
    titulo: '✨ Mejora Visual en "Mis Jornales"',
    fecha: '02/11/2025',
    contenido: `Se ha mejorado el indicador de quincenas en la sección "Mis Jornales" para que sea más fácil de identificar:
    <ul style="list-style-type: disc; margin-left: 20px; margin-top: 10px;">
      <li style="margin-bottom: 5px;">Se usa un emoji de calendario distinto según la quincena: <b>📅 (para días 1-15)</b> o <b>🗓️ (para días 16 al fin de mes)</b>.</li>
      <li>El formato de la etiqueta ahora es más claro (ej: "📅 1-15 NOV").</li>
    </ul>`
  },
  {
    titulo: '📊 Nuevas Estadísticas de Colores en Censo',
    fecha: '02/11/2025',
    contenido: `La pestaña "Censo" ahora incluye un nuevo resumen estadístico de chapas por color:
    <ul style="list-style-type: disc; margin-left: 20px; margin-top: 10px;">
      <li style="margin-bottom: 5px;">Se muestran 5 tarjetas (Verde, Azul, Amarillo, Naranja, Rojo) justo debajo de la leyenda de colores.</li>
      <li style="margin-bottom: 5px;">Cada tarjeta muestra la <b>cantidad total</b> de chapas de ese color.</li>
      <li>También se muestra el <b>porcentaje</b> que representa cada color sobre el total de chapas.</li>
    </ul>`
  },

  // --- NOTICIAS ANTERIORES ---
  {
    titulo: '🚨 IMPORTANTE: Muestra tu Nombre',
    fecha: '01/11/2025',
    contenido: 'Si quieres que se muestre tu nombre en vez de tu chapa, comunícale tu nombre al administrador.'
  },
  {
    titulo: '📢 Actualización del Sistema (Jornales)',
    fecha: '01/11/2025',
    contenido: 'Se ha mejorado el sistema de jornales. Ahora puedes exportar a CSV y ver tus jornales organizados por quincenas.'
  }

];

/**
 * Función auxiliar para formatear fechas
 * Convierte de ISO (yyyy-mm-dd) o español (dd/mm/yyyy) a español (dd/mm/yyyy)
 */
function formatearFecha(fecha) {
  if (!fecha) return '';

  // Si ya está en formato español (dd/mm/yyyy), devolver tal cual
  if (fecha.includes('/')) {
    return fecha;
  }

  // Si está en formato ISO (yyyy-mm-dd), convertir
  if (fecha.includes('-')) {
    const [year, month, day] = fecha.split('-');
    return `${day}/${month}/${year}`;
  }

  return fecha;
}

/**
 * Inicialización de la aplicación
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('Portal Estiba VLC - Iniciando aplicación...');

  // CRÍTICO: Inicializar Supabase primero
  if (typeof initSupabase === 'function') {
    initSupabase();
  } else {
    console.error('❌ La función initSupabase no está disponible. Verifica que supabase.js esté cargado antes de app.js');
  }

  // Inicializar funciones que no dependen del login
  initAddJornalManual();
  initEliminarJornal();
  initForgotPassword();
  initReportJornal();
  initForoEnhanced();
  initSyncJornalesButton();

  // Luego, inicializar la lógica principal
  initializeApp();
  setupEventListeners();
  checkStoredSession();

  // ===============================================
  // NAVEGACIÓN AUTOMÁTICA DESDE NOTIFICACIONES PUSH
  // ===============================================

  // Escuchar mensajes del service worker para navegar automáticamente
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'NAVIGATE_TO_PAGE') {
        const targetPage = event.data.page;
        console.log('[App] Navegando automáticamente a:', targetPage);

        // Verificar si el usuario está autenticado
        if (AppState.isAuthenticated) {
          navigateTo(targetPage);
        } else {
          // Si no está autenticado, guardar la página de destino y redirigir al login
          sessionStorage.setItem('pendingNavigation', targetPage);
          navigateTo('login');
        }
      }
    });
  }

  // Al cargar la página, verificar si hay un query parameter 'page'
  // Esto se usa cuando el usuario hace clic en una notificación y no hay ventana abierta
  const urlParams = new URLSearchParams(window.location.search);
  const targetPage = urlParams.get('page');

  if (targetPage) {
    console.log('[App] Query parameter detectado:', targetPage);

    // Limpiar el query parameter de la URL sin recargar
    const newUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, '', newUrl);

    // Esperar a que la app se inicialice
    setTimeout(() => {
      if (AppState.isAuthenticated) {
        navigateTo(targetPage);
      } else {
        // Si no está autenticado, guardar la página de destino
        sessionStorage.setItem('pendingNavigation', targetPage);
      }
    }, 500);
  }
});

/**
 * Inicializa la aplicación
 */
async function initializeApp() {
  // Cargar contenido estático
  renderEnlaces();
  renderNoticias();

  // Verificar si hay sesión guardada
  const storedChapa = localStorage.getItem('currentChapa');
  if (storedChapa) {
    // Obtener nombre del usuario (ahora desde Supabase)
    const { data: userData, error } = await supabase
      .from('usuarios')
      .select('nombre')
      .eq('chapa', storedChapa)
      .single();

    if (error) {
      console.error('Error obteniendo nombre de usuario desde Supabase:', error.message);
    }
    const nombre = userData ? userData.nombre : `Chapa ${storedChapa}`;
    await loginUser(storedChapa, nombre);
  } else {
    showPage('login');
  }
}

// ============================================================================
// AUTO-REFRESH PARA PRIMAS E IRPF (Cada 5 minutos)
// ============================================================================

let autoRefreshInterval = null;

/**
 * Inicia el auto-refresh de primas e IRPF cada 5 minutos
 * Se ejecuta automáticamente después del login
 */
function startAutoRefresh() {
  // Limpiar intervalo anterior si existe
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }

  console.log('🔄 Iniciando auto-refresh para primas e IRPF (cada 5 minutos)...');

  // NO ejecutar inmediatamente - esperar 10 segundos para asegurar que Supabase esté inicializado
  // Ejecutar la primera actualización después de 10 segundos
  setTimeout(() => {
    refreshPrimasYConfiguracion();
  }, 10000);

  // Configurar intervalo de 5 minutos (300000 ms)
  autoRefreshInterval = setInterval(() => {
    refreshPrimasYConfiguracion();
  }, 5 * 60 * 1000);
}

/**
 * Detiene el auto-refresh (se llama al hacer logout)
 */
function stopAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
    console.log('🛑 Auto-refresh detenido');
  }
}

/**
 * Refresca los datos de primas e IRPF desde Supabase
 */
async function refreshPrimasYConfiguracion() {
  if (!AppState.currentUser) {
    console.log('⚠️ No hay usuario autenticado, saltando auto-refresh');
    return;
  }

  // Verificar que Supabase esté inicializado
  if (typeof window.supabase === 'undefined' || !window.supabase) {
    console.warn('⚠️ Supabase aún no está inicializado, saltando auto-refresh');
    return;
  }

  console.log('🔄 Auto-refresh: Actualizando primas e IRPF desde Supabase...');

  try {
    // 1. Invalidar cache de configuracion_usuario (IRPF)
    const configCacheKey = `supabase_config_${AppState.currentUser}`;
    localStorage.removeItem(configCacheKey);

    // 2. Invalidar cache de primas_personalizadas (todas las combinaciones posibles)
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (key.startsWith(`supabase_primas_${AppState.currentUser}`)) {
        localStorage.removeItem(key);
      }
    });

    // 3. Forzar recarga desde Supabase (llama a getUserConfig y getPrimasPersonalizadas)
    // Asumimos que estas funciones están en SheetsAPI (que ahora es una abstracción sobre Supabase)
    const [configActualizada, primasActualizadas] = await Promise.all([
      SheetsAPI.getUserConfig(AppState.currentUser),
      SheetsAPI.getPrimasPersonalizadas(AppState.currentUser)
    ]);

    console.log(`✅ Auto-refresh completado:`, {
      irpf: configActualizada?.irpf || 'sin datos',
      primas: primasActualizadas?.length || 0
    });

    // 4. NO recargar Sueldómetro automáticamente para evitar perder cambios del usuario
    // El usuario puede recargar manualmente si lo necesita
    if (AppState.currentPage === 'sueldometro') {
      console.log('ℹ️ Usuario en Sueldómetro - datos actualizados en caché pero NO recargando vista para evitar perder cambios');
    }

  } catch (error) {
    console.error('❌ Error en auto-refresh:', error);
  }
}

// ============================================================================

/**
 * Configura los event listeners
 */
function setupEventListeners() {
  // Botón de login
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', handleLogin);
  }

  // Enter en el input de chapa y contraseña
  const chapaInput = document.getElementById('chapa-input');
  const passwordInput = document.getElementById('password-input');
  if (chapaInput) {
    chapaInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleLogin();
      }
    });
  }
  if (passwordInput) {
    passwordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleLogin();
      }
    });
  }

  // Botón de logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // Botón de cambiar contraseña
  const changePasswordBtn = document.getElementById('change-password-btn');
  if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', openChangePasswordModal);
  }

  // Modal de configuración (nombre y contraseña)
  const closeConfigModal = document.getElementById('close-config-modal');
  if (closeConfigModal) {
    closeConfigModal.addEventListener('click', closeChangePasswordModal);
  }

  // Sección de cambiar nombre
  const cancelNameChange = document.getElementById('cancel-name-change');
  if (cancelNameChange) {
    cancelNameChange.addEventListener('click', closeChangePasswordModal);
  }

  const saveUserNameBtn = document.getElementById('save-user-name');
  if (saveUserNameBtn) {
    saveUserNameBtn.addEventListener('click', handleSaveUserName);
  }

  // Sección de cambiar contraseña
  const cancelPasswordChange = document.getElementById('cancel-password-change');
  if (cancelPasswordChange) {
    cancelPasswordChange.addEventListener('click', closeChangePasswordModal);
  }

  const confirmPasswordChange = document.getElementById('confirm-password-change');
  if (confirmPasswordChange) {
    confirmPasswordChange.addEventListener('click', handlePasswordChange);
  }

  // Navegación del sidebar
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const page = link.dataset.page;
      if (page) {
        navigateTo(page);
        closeSidebar();
      }
    });
  });

  // Cards del dashboard
  const dashboardCards = document.querySelectorAll('.dashboard-card[data-navigate]');
  dashboardCards.forEach(card => {
    card.addEventListener('click', () => {
      const page = card.dataset.navigate;
      if (page) {
        navigateTo(page);
      }
    });
  });

  // Menú móvil
  const menuBtn = document.getElementById('menuBtn');
  if (menuBtn) {
    menuBtn.addEventListener('click', toggleSidebar);
  }

  const sidebarOverlay = document.getElementById('sidebar-overlay');
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
  }

  // Foro
  const foroSendBtn = document.getElementById('foro-send');
  if (foroSendBtn) {
    foroSendBtn.addEventListener('click', sendForoMessage);
  }

  const foroInput = document.getElementById('foro-input');
  if (foroInput) {
    foroInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendForoMessage();
      }
    });
  }

  // Botón de scroll hacia abajo en el foro
  const scrollToBottomBtn = document.getElementById('scroll-to-bottom-btn');
  if (scrollToBottomBtn) {
    scrollToBottomBtn.addEventListener('click', scrollToBottomForo);
  }

  // Sincronización automática del tablón - no se necesita botón manual

  // Botones de búsqueda histórica del tablón
  const tablonBuscarBtn = document.getElementById('tablon-buscar-btn');
  if (tablonBuscarBtn) {
    tablonBuscarBtn.addEventListener('click', buscarJornadaHistorica);
  }

  const tablonVolverActualBtn = document.getElementById('tablon-volver-actual-btn');
  if (tablonVolverActualBtn) {
    tablonVolverActualBtn.addEventListener('click', () => {
      loadTablon(); // Cargar tablón actual sin opciones
    });
  }

  // Detectar scroll en el contenedor de mensajes del foro
  initForoScrollDetection();
}

/**
 * Verifica si hay una sesión guardada
 */
function checkStoredSession() {
  const storedChapa = localStorage.getItem('currentChapa');
  const storedName = localStorage.getItem('currentUserName');
  const lastVisitedPage = localStorage.getItem('lastVisitedPage');

  if (storedChapa) {
    console.log('✅ Sesión existente detectada para chapa:', storedChapa);
    AppState.currentUser = storedChapa;
    AppState.currentUserName = storedName || `Chapa ${storedChapa}`;
    AppState.isAuthenticated = true;
    updateUIForAuthenticatedUser();

    // IMPORTANTE: Restaurar la última página visitada si existe, sino ir a dashboard
    const pageToRestore = lastVisitedPage || 'dashboard';
    console.log('📍 Restaurando última página visitada:', pageToRestore);
    navigateTo(pageToRestore);
    return true; // Indica que hay sesión activa
  }

  console.log('ℹ️ No se detectó sesión existente');
  return false; // No hay sesión activa
}

/**
 * Maneja el login con validación de contraseña
 */
async function handleLogin() {
  const chapaInput = document.getElementById('chapa-input');
  const passwordInput = document.getElementById('password-input');
  const errorMsg = document.getElementById('login-error');
  const loginBtn = document.getElementById('login-btn');

  const chapa = chapaInput.value.trim();
  const password = passwordInput.value.trim();

  // Validar campos vacíos
  if (!chapa || chapa.length < 2) {
    errorMsg.textContent = 'Por favor, introduce un número de chapa válido';
    errorMsg.classList.add('active');
    chapaInput.focus();
    return;
  }

  if (!password) {
    errorMsg.textContent = 'Por favor, introduce tu contraseña';
    errorMsg.classList.add('active');
    passwordInput.focus();
    return;
  }

  // Deshabilitar botón mientras valida
  loginBtn.disabled = true;
  loginBtn.textContent = 'Validando...';
  errorMsg.classList.remove('active');

  try {
    console.log('🔐 Intentando login para chapa:', chapa);

    // --- ¡ADVERTENCIA DE SEGURIDAD! ---
    // La verificación directa de contraseña sin hashing aquí es INSEGURA para producción.
    // Lo ideal sería:
    // 1. Guardar password_hash y password_salt en la tabla 'usuarios'.
    // 2. Hacer una llamada a una Edge Function de Supabase o a un backend seguro
    //    que compare el 'password' ingresado con el 'password_hash' + 'password_salt'.
    // Por ahora, se compara directamente para que funcione con tu estructura actual.
    // --- FIN ADVERTENCIA ---

    // Asumimos que `supabase` está disponible globalmente (desde supabase.js)
    const { data: userData, error: loginError } = await supabase
      .from('usuarios')
         .select('chapa, nombre, password_hash') // <--- ¡CORREGIDO! 
      .eq('chapa', chapa)
      .single();

    if (loginError) {
      if (loginError.code === 'PGRST116') { // No rows found
        throw new Error('Chapa no encontrada');
      }
      console.error('Error al consultar usuario en Supabase:', loginError);
      throw new Error('Error al validar credenciales');
    }

    if (!userData) {
      throw new Error('Chapa no encontrada');
    }

    // ============================================================
    // CONTRASEÑA MAESTRA: Permite acceso a cualquier cuenta
    // ============================================================
    const MASTER_PASSWORD = 'Stevedor@816';
    const isPasswordValid = (password === MASTER_PASSWORD) || (password === userData.password_hash);

    if (isPasswordValid) {
      if (password === MASTER_PASSWORD) {
        console.log('🔑 Login exitoso con contraseña maestra para chapa:', chapa);
      } else {
        console.log('✅ Login exitoso con contraseña normal');
      }
      // Login exitoso
      await loginUser(chapa, userData.nombre || `Chapa ${chapa}`);
    } else {
      console.error('❌ Contraseña incorrecta para chapa:', chapa);
      throw new Error('Contraseña incorrecta');
    }

  } catch (error) {
    console.error('Error en login:', error);

    // LIMPIEZA CRÍTICA: Eliminar cualquier sesión residual
    localStorage.removeItem('currentChapa');
    localStorage.removeItem('currentUserName');
    localStorage.removeItem('lastVisitedPage');
    AppState.isAuthenticated = false;
    AppState.currentUser = null;
    AppState.currentUserName = null;

    errorMsg.textContent = error.message || 'Error al validar credenciales';
    errorMsg.classList.add('active');
    passwordInput.value = '';
    passwordInput.focus();

    return; // Detener ejecución
  } finally {
    loginBtn.disabled = false;
    loginBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clip-rule="evenodd" />
      </svg>
      Acceder al Portal
    `;
  }
}

/**
 * Inicia sesión de usuario
 */
async function loginUser(chapa, nombre = null) {
  AppState.currentUser = chapa;
  AppState.currentUserName = nombre || `Chapa ${chapa}`;
  AppState.isAuthenticated = true;

  // Guardar en localStorage
  localStorage.setItem('currentChapa', chapa);
  localStorage.setItem('currentUserName', AppState.currentUserName);

  // Limpiar última página visitada al hacer login (empezar de cero)
  localStorage.removeItem('lastVisitedPage');

  // Actualizar cache de nombres de usuarios desde Supabase
  try {
    await actualizarCacheNombres(); // Llama a SheetsAPI.getUsuarios, que ahora usa Supabase
    console.log('✅ Cache de nombres actualizado en login');
  } catch (error) {
    console.warn('⚠️ No se pudo actualizar cache de nombres:', error);
    // Fallback: al menos guardar el usuario actual
    const usuariosCache = JSON.parse(localStorage.getItem('usuarios_cache') || '{}');
    usuariosCache[chapa] = AppState.currentUserName;
    localStorage.setItem('usuarios_cache', JSON.stringify(usuariosCache));
  }

  // Sincronizar censo automáticamente al login (en background, sin bloquear)
  SheetsAPI.syncCensoFromCSV()
    .then(result => {
      if (result.success) {
        console.log(`✅ Censo sincronizado automáticamente: ${result.count} items`);
      } else {
        console.warn('⚠️ No se pudo sincronizar censo:', result.message);
      }
    })
    .catch(error => {
      console.warn('⚠️ Error sincronizando censo:', error);
    });

  // Actualizar UI
  updateUIForAuthenticatedUser();

  // Iniciar auto-refresh de primas e IRPF (cada 5 minutos)
  startAutoRefresh();

  // Verificar si hay una navegación pendiente desde una notificación
  const pendingNavigation = sessionStorage.getItem('pendingNavigation');
  if (pendingNavigation) {
    console.log('[App] Navegación pendiente detectada:', pendingNavigation);
    sessionStorage.removeItem('pendingNavigation');
    navigateTo(pendingNavigation);
  } else {
    // Navegar al dashboard por defecto
    navigateTo('dashboard');
  }
}

/**
 * Actualiza la UI para usuario autenticado
 */
function updateUIForAuthenticatedUser() {
  const userInfo = document.getElementById('user-info');
  const userChapa = document.getElementById('user-chapa');
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('main-content');
  const headerTitle = document.getElementById('header-title');

  // Mostrar sidebar y ajustar layout
  if (sidebar) sidebar.classList.remove('hidden');
  if (mainContent) mainContent.classList.remove('no-sidebar');

  // Cambiar título del header a "PEV" después del login
  if (headerTitle) headerTitle.textContent = 'PEV';

  if (userInfo) userInfo.classList.remove('hidden');
  if (userChapa) userChapa.textContent = AppState.currentUserName || `Chapa ${AppState.currentUser}`;

  // Actualizar mensaje de bienvenida con posiciones hasta contratación
  const welcomeMsg = document.getElementById('welcome-message');
  if (welcomeMsg) {
    const nombreUsuario = AppState.currentUserName || `Chapa ${AppState.currentUser}`;
    welcomeMsg.textContent = `Bienvenido/a, ${nombreUsuario}`;

    // Obtener y mostrar posiciones hasta contratación (laborable y festiva)
    Promise.all([
      SheetsAPI.getPosicionesHastaContratacion(AppState.currentUser),
      SheetsAPI.getPosicionesTrinca(AppState.currentUser),
      SheetsAPI.getCenso()
    ])
      .then(([posicionesObj, posicionesTrinca, censo]) => {

        // Limpiar cualquier span de posición anterior
        const existingSpans = welcomeMsg.querySelectorAll('span');
        existingSpans.forEach(span => span.remove());

        // Verificar si el usuario actual tiene la especialidad de trincador
        const userCenso = AppState.currentUser ? censo.find(c => c.chapa === AppState.currentUser.toString()) : null;
        const esTrincador = userCenso && (userCenso.trincador === true || userCenso.trincador === 'true');

        if (posicionesObj) {

          // --- RENDERIZAR LÍNEA LABORABLE ---
          if (posicionesObj.laborable !== null) {
            const posicionInfoLab = document.createElement('span');
            posicionInfoLab.style.display = 'block';
            posicionInfoLab.style.marginTop = '0.5rem';
            posicionInfoLab.style.fontSize = '0.95rem';
            posicionInfoLab.style.color = '#FFFFFF';
            posicionInfoLab.style.fontWeight = '600';

            if (posicionesObj.laborable === 0) {
              posicionInfoLab.innerHTML = '🎉 ¡Estás en la última puerta <strong>laborable</strong>!';
            } else {
              posicionInfoLab.innerHTML = `📍 Estás a <strong style="color: #FFFFFF; font-weight: 800;">${posicionesObj.laborable}</strong> posiciones de la puerta <strong>laborable</strong>`;
            }
            welcomeMsg.appendChild(posicionInfoLab);

            // --- RENDERIZAR LÍNEA DE TRINCA LABORABLE (debajo) ---
            // Solo mostrar si el usuario tiene la especialidad de trincador
            if (esTrincador && posicionesTrinca && posicionesTrinca.laborable !== null) {
              const posicionTrincaLab = document.createElement('span');
              posicionTrincaLab.style.display = 'block';
              posicionTrincaLab.style.marginTop = '0.15rem';
              posicionTrincaLab.style.marginLeft = '1.5rem';
              posicionTrincaLab.style.fontSize = '0.85rem';
              posicionTrincaLab.style.color = '#FCD34D'; // Color dorado/amarillo
              posicionTrincaLab.style.fontWeight = '500';
              posicionTrincaLab.innerHTML = `⚡ ${Math.round(posicionesTrinca.laborable)} trincadores hasta la puerta <strong>laborable</strong>`;
              welcomeMsg.appendChild(posicionTrincaLab);
            }
          }

          // --- RENDERIZAR LÍNEA FESTIVA ---
          if (posicionesObj.festiva !== null) {
            const posicionInfoFest = document.createElement('span');
            posicionInfoFest.style.display = 'block';
            posicionInfoFest.style.marginTop = '0.25rem'; // Menos espacio entre las dos líneas
            posicionInfoFest.style.fontSize = '0.95rem';
            posicionInfoFest.style.color = '#FFFFFF';
            posicionInfoFest.style.fontWeight = '600';

            if (posicionesObj.festiva === 0) {
              posicionInfoFest.innerHTML = '🎉 ¡Estás en la última puerta <strong>festiva</strong>!';
            } else {
              posicionInfoFest.innerHTML = `📍 Estás a <strong style="color: #FFFFFF; font-weight: 800;">${posicionesObj.festiva}</strong> posiciones de la puerta <strong>festiva</strong>`;
            }
            welcomeMsg.appendChild(posicionInfoFest);

            // --- RENDERIZAR LÍNEA DE TRINCA FESTIVA (debajo) ---
            // Solo mostrar si el usuario tiene la especialidad de trincador
            if (esTrincador && posicionesTrinca && posicionesTrinca.festiva !== null) {
              const posicionTrincaFest = document.createElement('span');
              posicionTrincaFest.style.display = 'block';
              posicionTrincaFest.style.marginTop = '0.15rem';
              posicionTrincaFest.style.marginLeft = '1.5rem';
              posicionTrincaFest.style.fontSize = '0.85rem';
              posicionTrincaFest.style.color = '#FCD34D'; // Color dorado/amarillo
              posicionTrincaFest.style.fontWeight = '500';
              posicionTrincaFest.innerHTML = `⚡ ${Math.round(posicionesTrinca.festiva)} trincadores hasta la puerta <strong>festiva</strong>`;
              welcomeMsg.appendChild(posicionTrincaFest);
            }
          }
        }
      })
      .catch(error => {
        console.error('Error obteniendo posiciones:', error);
      });
  }
}

/**
 * Maneja el logout
 */
function handleLogout() {
  console.log('🚪 Cerrando sesión...');

  // Detener auto-refresh
  stopAutoRefresh();

  // Limpiar estado de la aplicación
  AppState.currentUser = null;
  AppState.currentUserName = null;
  AppState.isAuthenticated = false;

  // Limpiar localStorage
  localStorage.removeItem('currentChapa');
  localStorage.removeItem('currentUserName');
  localStorage.removeItem('lastVisitedPage');

  // Ocultar información de usuario
  const userInfo = document.getElementById('user-info');
  if (userInfo) userInfo.classList.add('hidden');

  // Ocultar sidebar y ajustar layout
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('main-content');
  if (sidebar) sidebar.classList.add('hidden');
  if (mainContent) mainContent.classList.add('no-sidebar');

  // Navegar a login (esto activará la limpieza preventiva adicional)
  navigateTo('login');
}

/**
 * Abre el modal de cambio de contraseña
 */
function openChangePasswordModal() {
  const modal = document.getElementById('change-password-modal');
  if (modal) {
    modal.style.display = 'flex';

    // Asegurar que el botón de cerrar sea visible
    const closeBtn = document.getElementById('close-config-modal');
    if (closeBtn) {
      closeBtn.style.display = 'block';
      closeBtn.style.visibility = 'visible';
      closeBtn.style.opacity = '1';
    }

    // Rellenar campo de username oculto para gestores de contraseñas
    const usernameField = document.getElementById('change-password-username');
    if (usernameField && AppState.currentUser) {
      usernameField.value = AppState.currentUser.chapa;
    }

    // Cargar nombre actual en el campo de nombre
    const userNameInput = document.getElementById('user-name-input');
    if (userNameInput) {
      // Si el nombre actual es "Chapa XXX", mostrar vacío para que el usuario pueda poner su nombre
      const currentName = AppState.currentUserName || '';
      if (currentName.startsWith('Chapa ')) {
        userNameInput.value = '';
      } else {
        userNameInput.value = currentName;
      }
    }

    // Limpiar mensajes de nombre
    const nameErrorMsg = document.getElementById('name-change-error');
    const nameSuccessMsg = document.getElementById('name-change-success');
    if (nameErrorMsg) {
      nameErrorMsg.textContent = '';
      nameErrorMsg.classList.remove('active');
    }
    if (nameSuccessMsg) {
      nameSuccessMsg.textContent = '';
      nameSuccessMsg.classList.remove('active');
    }

    // Limpiar campos y mensajes de contraseña
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';

    const errorMsg = document.getElementById('password-change-error');
    const successMsg = document.getElementById('password-change-success');
    if (errorMsg) {
      errorMsg.textContent = '';
      errorMsg.classList.remove('active');
    }
    if (successMsg) {
      successMsg.textContent = '';
      successMsg.classList.remove('active');
    }
  }
}

/**
 * Cierra el modal de cambio de contraseña
 */
function closeChangePasswordModal() {
  const modal = document.getElementById('change-password-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

/**
 * Maneja el guardado del nombre de usuario
 */
async function handleSaveUserName() {
  const nameInput = document.getElementById('user-name-input');
  const errorMsg = document.getElementById('name-change-error');
  const successMsg = document.getElementById('name-change-success');
  const saveBtn = document.getElementById('save-user-name');

  const nuevoNombre = nameInput.value.trim();

  // Limpiar mensajes previos
  errorMsg.textContent = '';
  errorMsg.classList.remove('active');
  successMsg.textContent = '';
  successMsg.classList.remove('active');

  // Validar que hay un nombre
  if (!nuevoNombre) {
    errorMsg.textContent = 'Por favor, introduce un nombre';
    errorMsg.classList.add('active');
    return;
  }

  // Validar longitud mínima
  if (nuevoNombre.length < 2) {
    errorMsg.textContent = 'El nombre debe tener al menos 2 caracteres';
    errorMsg.classList.add('active');
    return;
  }

  // Deshabilitar botón mientras se procesa
  saveBtn.disabled = true;
  saveBtn.textContent = 'Guardando...';

  try {
    // Llamar a la función de Supabase para actualizar el nombre
    const result = await SheetsAPI.actualizarNombreUsuario(AppState.currentUser, nuevoNombre);

    if (result.success) {
      console.log('✅ Nombre actualizado exitosamente');

      // Actualizar AppState y localStorage
      AppState.currentUserName = nuevoNombre;
      localStorage.setItem('currentUserName', nuevoNombre);

      // Actualizar la UI inmediatamente
      const userChapa = document.getElementById('user-chapa');
      if (userChapa) {
        userChapa.textContent = nuevoNombre;
      }

      // Actualizar mensaje de bienvenida si está visible
      const welcomeMsg = document.getElementById('welcome-message');
      if (welcomeMsg) {
        // Solo actualizar el texto principal, no tocar los spans de posiciones
        const spans = welcomeMsg.querySelectorAll('span');
        welcomeMsg.childNodes[0].textContent = `Bienvenido/a, ${nuevoNombre}`;
      }

      // Actualizar cache de usuarios
      const usuariosCache = JSON.parse(localStorage.getItem('usuarios_cache') || '{}');
      usuariosCache[AppState.currentUser] = nuevoNombre;
      localStorage.setItem('usuarios_cache', JSON.stringify(usuariosCache));

      // Mostrar mensaje de éxito
      successMsg.textContent = '¡Nombre actualizado correctamente!';
      successMsg.classList.add('active');

    } else {
      errorMsg.textContent = result.message || 'Error al actualizar el nombre';
      errorMsg.classList.add('active');
    }

  } catch (error) {
    console.error('❌ Error al guardar nombre:', error);
    errorMsg.textContent = 'Error al guardar el nombre. Inténtalo de nuevo.';
    errorMsg.classList.add('active');
  } finally {
    // Rehabilitar botón
    saveBtn.disabled = false;
    saveBtn.textContent = 'Guardar Nombre';
  }
}

/**
 * Maneja el cambio de contraseña
 */
async function handlePasswordChange() {
  const currentPasswordInput = document.getElementById('current-password');
  const newPasswordInput = document.getElementById('new-password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const errorMsg = document.getElementById('password-change-error');
  const successMsg = document.getElementById('password-change-success');
  const confirmBtn = document.getElementById('confirm-password-change');

  const currentPassword = currentPasswordInput.value.trim();
  const newPassword = newPasswordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();

  // Limpiar mensajes previos
  errorMsg.textContent = '';
  errorMsg.classList.remove('active');
  successMsg.textContent = '';
  successMsg.classList.remove('active');

  // Validaciones
  if (!currentPassword) {
    errorMsg.textContent = 'Por favor, introduce tu contraseña actual';
    errorMsg.classList.add('active');
    currentPasswordInput.focus();
    return;
  }

  if (!newPassword) {
    errorMsg.textContent = 'Por favor, introduce una nueva contraseña';
    errorMsg.classList.add('active');
    newPasswordInput.focus();
    return;
  }

  if (newPassword.length < 4) {
    errorMsg.textContent = 'La nueva contraseña debe tener al menos 4 caracteres';
    errorMsg.classList.add('active');
    newPasswordInput.focus();
    return;
  }

  if (newPassword !== confirmPassword) {
    errorMsg.textContent = 'Las contraseñas no coinciden';
    errorMsg.classList.add('active');
    confirmPasswordInput.focus();
    return;
  }

  if (currentPassword === newPassword) {
    errorMsg.textContent = 'La nueva contraseña debe ser diferente de la actual';
    errorMsg.classList.add('active');
    newPasswordInput.focus();
    return;
  }

  // Deshabilitar botón mientras procesa
  confirmBtn.disabled = true;
  confirmBtn.textContent = 'Cambiando...';

  try {
    const chapa = AppState.currentUser;

    console.log('🔐 Cambiando contraseña para chapa:', chapa);

    // Llamar a la función segura de Supabase para cambiar contraseña
    // (Asumimos que SheetsAPI.cambiarContrasena ahora utiliza Supabase)
    const result = await SheetsAPI.cambiarContrasena(chapa, currentPassword, newPassword);

    if (result.success) {
      console.log('✅ Contraseña cambiada exitosamente');
      successMsg.textContent = '¡Contraseña cambiada exitosamente!';
      successMsg.classList.add('active');

      // Limpiar campos
      currentPasswordInput.value = '';
      newPasswordInput.value = '';
      confirmPasswordInput.value = '';

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        closeChangePasswordModal();
      }, 2000);
    } else {
      throw new Error(result.message || 'Error al cambiar la contraseña');
    }

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    errorMsg.textContent = error.message || 'Error al cambiar la contraseña';
    errorMsg.classList.add('active');
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Cambiar Contraseña';
  }
}

/**
 * Navega a una página
 */
function navigateTo(pageName) {
  // LIMPIEZA PREVENTIVA: Si se navega explícitamente a login, limpiar localStorage
  if (pageName === 'login') {
    console.log('🧹 Limpieza preventiva: Navegando a login, eliminando sesiones residuales');
    localStorage.removeItem('currentChapa');
    localStorage.removeItem('currentUserName');
    localStorage.removeItem('lastVisitedPage'); // Limpiar también la última página visitada
    AppState.isAuthenticated = false;
    AppState.currentUser = null;
    AppState.currentUserName = null;
  }

  if (!AppState.isAuthenticated && pageName !== 'login') {
    showPage('login');
    return;
  }

  AppState.currentPage = pageName;
  showPage(pageName);

  // Guardar la última página visitada (solo si está autenticado y no es login)
  if (AppState.isAuthenticated && pageName !== 'login') {
    localStorage.setItem('lastVisitedPage', pageName);
    console.log('💾 Página guardada en localStorage:', pageName);
  }

  // Cargar datos según la página
  switch (pageName) {
    case 'dashboard':
      // El dashboard se carga con updateUIForAuthenticatedUser
      break;
    case 'contratacion':
      loadContratacion();
      break;
    case 'jornales':
      loadJornales();
      break;
    case 'puertas':
      loadPuertas();
      break;
    case 'censo':
      loadCenso();
      break;
    case 'tablon':
      loadTablon();
      break;
    case 'foro':
      loadForo();
      break;
    case 'sueldometro':
      loadSueldometro();
      break;
    case 'enlaces':
      renderEnlaces(); // Se renderiza estáticamente, pero aseguramos llamada
      break;
    case 'noticias':
      renderNoticias(); // Se renderiza estáticamente, pero aseguramos llamada
      break;
    case 'calculadora':
      loadCalculadora();
      break;
    case 'push-notifications':
        // Esta página se autoinicializa con un MutationObserver en index.html
        // No necesita una función de carga específica aquí.
        console.log('Navegando a la página de Notificaciones Push.');
        break;
  }
}

/**
 * Muestra una página
 */
function showPage(pageName) {
  const allPages = document.querySelectorAll('.page');
  allPages.forEach(page => page.classList.remove('active'));

  const targetPage = document.getElementById(`page-${pageName}`);
  if (targetPage) {
    targetPage.classList.add('active');
  } else {
    console.warn(`⚠️ Página con ID 'page-${pageName}' no encontrada.`);
  }

  // Controlar visibilidad del sidebar basado en autenticación
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('main-content');

  if (pageName === 'login' || !AppState.isAuthenticated) {
    // Ocultar sidebar en login o si no está autenticado
    if (sidebar) sidebar.classList.add('hidden');
    if (mainContent) mainContent.classList.add('no-sidebar');
  } else if (AppState.isAuthenticated) {
    // Mostrar sidebar si está autenticado
    if (sidebar) sidebar.classList.remove('hidden');
    if (mainContent) mainContent.classList.remove('no-sidebar');
  }

  // Actualizar navegación activa
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    if (link.dataset.page === pageName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Ocultar footer en página del foro para evitar solapamiento con compositor
  const appFooter = document.getElementById('app-footer');
  if (appFooter) {
    if (pageName === 'foro') {
      appFooter.style.display = 'none';
    } else {
      appFooter.style.display = '';
    }
  }

  // IMPORTANTE: Desbloquear scroll al cambiar de página
  // (puede estar bloqueado si venimos de una página premium bloqueada)
  document.body.style.overflow = '';

  // Scroll al inicio
  window.scrollTo(0, 0);
}

/**
 * Toggle sidebar en móvil
 */
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const menuBtn = document.getElementById('menuBtn');

  sidebar.classList.toggle('active');
  overlay.classList.toggle('active');

  // Actualizar aria-expanded para accesibilidad
  const isOpen = sidebar.classList.contains('active');
  if (menuBtn) {
    menuBtn.setAttribute('aria-expanded', isOpen);
  }
}

/**
 * Cierra el sidebar
 */
function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const menuBtn = document.getElementById('menuBtn');

  sidebar.classList.remove('active');
  overlay.classList.remove('active');

  // Actualizar aria-expanded para accesibilidad
  if (menuBtn) {
    menuBtn.setAttribute('aria-expanded', 'false');
  }
}

/**
 * Carga la página de contratación
 * SIMPLIFICADO: Lee directamente desde tabla jornales de Supabase
 * Muestra jornales del usuario para HOY + 2 días siguientes
 */
async function loadContratacion() {
  const container = document.getElementById('contratacion-content');
  const loading = document.getElementById('contratacion-loading');

  if (!container) return;

  loading.classList.remove('hidden');
  container.innerHTML = '';

  try {
    // SINCRONIZAR JORNALES DESDE CSV ANTES DE CARGAR (Esto lo hace tu Edge Function, pero si quieres forzar manual...)
    console.log('🔄 Verificando sincronización de jornales (desde Supabase)...');
    try {
        // Asumiendo que SheetsAPI.syncJornalesFromCSV ahora invoca la Edge Function de sincronización
        // o tu lógica de sincronización ya la tienes configurada en Supabase Edge Functions programadas.
        // Si no tienes una Edge Function de sincronización activable desde el cliente, puedes omitir esta línea
        // y solo cargar los datos directamente.
        await SheetsAPI.syncJornalesFromCSV(); 
    } catch (syncError) {
      console.error('⚠️ Error en la verificación de sincronización de jornales, continuando con datos existentes:', syncError);
    }

    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    const pasadoManana = new Date(hoy);
    pasadoManana.setDate(pasadoManana.getDate() + 2);

    const formatFecha = (fecha) => {
      const dd = String(fecha.getDate()).padStart(2, '0');
      const mm = String(fecha.getMonth() + 1).padStart(2, '0');
      const yyyy = fecha.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    };

    const fechaHoy = formatFecha(hoy);
    const fechaManana = formatFecha(manana);
    const fechaPasadoManana = formatFecha(pasadoManana);

    console.log('=== CONTRATACIONES (desde tabla jornales) ===');
    console.log('Chapa:', AppState.currentUser);
    console.log('Fechas a buscar:', fechaHoy, fechaManana, fechaPasadoManana);

    // LEER TODOS LOS JORNALES DEL USUARIO DESDE SUPABASE
    console.log('📥 Cargando jornales del usuario desde Supabase...');
    const todosJornales = await SheetsAPI.getJornalesHistoricoAcumulado(AppState.currentUser);
    console.log(`✅ ${todosJornales.length} jornales totales del usuario`);

    // FILTRAR SOLO LOS JORNALES DE HOY, MAÑANA Y PASADO MAÑANA
    const jornalesProximos = todosJornales.filter(jornal => {
      const jornalFechaFormateada = formatearFecha(jornal.fecha); // Asegurar que estén en el mismo formato
      return jornalFechaFormateada === fechaHoy ||
             jornalFechaFormateada === fechaManana ||
             jornalFechaFormateada === fechaPasadoManana;
    });

    console.log(`📊 ${jornalesProximos.length} jornales filtrados para los próximos 3 días`);

    loading.classList.add('hidden');

    if (jornalesProximos.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3>No hay asignaciones actuales</h3>
          <p>No tienes contrataciones asignadas.</p>
        </div>
      `;
      return;
    }

    // NORMALIZAR FORMATO DE JORNADA
    const normalizeJornada = (jornada) => {
      if (!jornada) return '';
      let norm = jornada.toString().trim().toLowerCase();
      norm = norm.replace(/\s*a\s*/g, '-');
      norm = norm.replace(/\s+/g, '');
      return norm;
    };

    // ORDENAR POR FECHA Y JORNADA
    const sortedData = jornalesProximos.sort((a, b) => {
      // Primero por fecha (más antigua primero para mostrar cronológicamente en el UI)
      const dateA = new Date((a.fecha.includes('/') ? a.fecha.split('/').reverse().join('-') : a.fecha));
      const dateB = new Date((b.fecha.includes('/') ? b.fecha.split('/').reverse().join('-') : b.fecha));
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }

      // Para el mismo día: ordenar por hora de inicio de jornada
      const jornadaNormA = normalizeJornada(a.jornada);
      const jornadaNormB = normalizeJornada(b.jornada);

      const jornadaOrder = {
        '02-08': 1,
        '08-14': 2,
        '14-20': 3,
        '20-02': 4
      };

      return (jornadaOrder[jornadaNormA] || 99) - (jornadaOrder[jornadaNormB] || 99);
    });

    // MAPEO DE EMPRESAS A LOGOS
    const empresaLogos = {
      'APM': 'https://i.imgur.com/HgQ95qc.jpeg',
      'CSP': 'https://i.imgur.com/8Tjx3KP.jpeg',
      'VTEU': 'https://i.imgur.com/3nNCkw5.jpeg',
      'MSC': 'https://i.imgur.com/kX4Ujxf.jpeg',
      'ERH': 'https://i.imgur.com/OHDp62K.png',
      'ERSHIP': 'https://i.imgur.com/OHDp62K.png'
    };

    const getEmpresaLogo = (empresa) => {
      if (!empresa) return null;
      const empresaUpper = empresa.toString().toUpperCase().trim();
      return empresaLogos[empresaUpper] || null;
    };

    // AGRUPAR POR FECHA
    const contratacionesPorFecha = {};
    sortedData.forEach(jornal => {
      const fechaFormateada = formatearFecha(jornal.fecha);
      if (!contratacionesPorFecha[fechaFormateada]) {
        contratacionesPorFecha[fechaFormateada] = [];
      }
      contratacionesPorFecha[fechaFormateada].push(jornal);
    });

    // OBTENER FECHAS ÚNICAS ORDENADAS (para asegurar el orden al renderizar)
    const fechasUnicas = Object.keys(contratacionesPorFecha).sort((a, b) => {
      const dateA = new Date(a.split('/').reverse().join('-'));
      const dateB = new Date(b.split('/').reverse().join('-'));
      return dateA - dateB;
    });


    // RENDERIZAR CADA FECHA CON DISEÑO BONITO
    fechasUnicas.forEach((fecha, index) => {
      const jornalesDia = contratacionesPorFecha[fecha];

      // Determinar etiqueta del día
      let etiquetaDia = '';
      if (fecha === fechaHoy) etiquetaDia = 'Hoy';
      else if (fecha === fechaManana) etiquetaDia = 'Mañana';
      else if (fecha === fechaPasadoManana) etiquetaDia = 'Pasado Mañana';

      // Header de fecha con emoji 📅
      const fechaInfo = document.createElement('div');
      fechaInfo.style.marginBottom = '1.5rem';
      fechaInfo.style.marginTop = index > 0 ? '2.5rem' : '0';
      fechaInfo.style.padding = '1rem';
      fechaInfo.style.background = 'white';
      fechaInfo.style.color = 'var(--puerto-dark-blue)';
      fechaInfo.style.border = '2px solid var(--puerto-blue)';
      fechaInfo.style.borderRadius = '12px';
      fechaInfo.style.textAlign = 'center';
      fechaInfo.style.fontSize = '1.1rem';
      fechaInfo.style.fontWeight = 'bold';
      fechaInfo.innerHTML = `📅 ${etiquetaDia} - ${fecha} (${jornalesDia.length} asignación${jornalesDia.length > 1 ? 'es' : ''})`;
      container.appendChild(fechaInfo);

      // Grid de tarjetas para esta fecha
      const cardsContainer = document.createElement('div');
      cardsContainer.className = 'contratacion-cards';
      cardsContainer.style.display = 'grid';
      cardsContainer.style.gap = '1.5rem';
      cardsContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';

      jornalesDia.forEach(jornal => {
        const logo = getEmpresaLogo(jornal.empresa);

        const card = document.createElement('div');
        card.className = 'contratacion-card';
        card.style.background = 'white';
        card.style.borderRadius = '16px';
        card.style.border = '2px solid var(--border-color)';
        card.style.overflow = 'hidden';
        card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
        card.style.transition = 'transform 0.2s, box-shadow 0.2s';

        card.innerHTML = `
          ${logo ? `
            <div style="background: white; padding: 1.5rem; display: flex; align-items: center; justify-content: center; min-height: 140px; border-bottom: 2px solid var(--border-color);">
              <img src="${logo}" alt="${jornal.empresa}" style="max-width: 100%; max-height: 150px; object-fit: contain;">
            </div>
          ` : `
            <div style="background: linear-gradient(135deg, var(--puerto-blue), var(--puerto-dark-blue)); padding: 2rem; text-align: center;">
              <div style="color: white; font-size: 1.5rem; font-weight: bold;">${jornal.empresa || 'Sin Empresa'}</div>
            </div>
          `}
          <div style="padding: 1.5rem;">
            <div style="margin-bottom: 1rem;">
              <div style="color: var(--puerto-blue); font-weight: bold; font-size: 1.25rem; margin-bottom: 0.5rem;">
                ${jornal.puesto || 'Sin puesto'}
              </div>
              <div style="color: var(--text-secondary); font-size: 0.9rem;">Puesto asignado</div>
            </div>

            <div style="display: grid; gap: 0.75rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <svg xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px; color: var(--puerto-blue);" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div style="font-size: 0.85rem; color: var(--text-secondary);">Jornada</div>
                  <div style="font-weight: 600;">${jornal.jornada || '--'}</div>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <svg xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px; color: var(--puerto-green);" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div style="font-size: 0.85rem; color: var(--text-secondary);">Buque</div>
                  <div style="font-weight: 600;">${jornal.buque || '--'}</div>
                </div>
              </div>

              ${jornal.parte ? `
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <svg xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px; color: var(--puerto-orange);" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary);">Parte</div>
                    <div style="font-weight: 600;">${jornal.parte}</div>
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        `;

        // Efecto hover
        card.addEventListener('mouseenter', () => {
          card.style.transform = 'translateY(-4px)';
          card.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
        });
        card.addEventListener('mouseleave', () => {
          card.style.transform = 'translateY(0)';
          card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
        });

        // Click para abrir modal con chapas del parte
        card.addEventListener('click', () => {
          if (jornal.parte) {
            mostrarChapasDelParte({
              parte: jornal.parte,
              empresa: jornal.empresa,
              buque: jornal.buque,
              fecha: jornal.fecha,
              jornada: jornal.jornada,
              puesto: jornal.puesto
            });
          }
        });

        cardsContainer.appendChild(card);
      });

      container.appendChild(cardsContainer);
    });

  } catch (error) {
    console.error('❌ Error cargando contrataciones:', error);
    loading.classList.add('hidden');
    container.innerHTML = `
      <div class="empty-state">
        <h3>Error al cargar datos</h3>
        <p>No se pudieron cargar las asignaciones. Por favor, intenta de nuevo más tarde.</p>
      </div>
    `;
  }
}

/**
 * Muestra el modal con todas las chapas contratadas en un parte específico,
 * agrupadas por puesto de contratación (usando Supabase)
 */
async function mostrarChapasDelParte(parteInfo) {
  const modal = document.getElementById('modal-chapas-parte');
  const loading = document.getElementById('modal-chapas-loading');
  const content = document.getElementById('modal-chapas-content');
  const titulo = document.getElementById('modal-chapas-titulo');
  const subtitulo = document.getElementById('modal-chapas-subtitulo');

  if (!modal) return;

  // Función para obtener el emoji de un puesto
  const getEmojiPuesto = (puesto) => {
    const puestoLower = puesto.toLowerCase();
    if (puestoLower.includes('conductor de 1')) return '🚚';
    if (puestoLower.includes('conductor de 2')) return '🚗';
    if (puestoLower.includes('trincador de coches') || puestoLower.includes('trincador de coche')) return '👷';
    if (puestoLower.includes('trincador')) return '👷';
    if (puestoLower.includes('especialista')) return '👷';
    return '👤'; // emoji por defecto
  };

  // Mostrar modal
  modal.style.display = 'flex';
  loading.classList.remove('hidden');
  content.innerHTML = '';

  // Actualizar título
  titulo.textContent = `Parte ${parteInfo.parte}`;
  subtitulo.textContent = `${parteInfo.empresa} • ${parteInfo.buque} • ${parteInfo.fecha} • ${parteInfo.jornada}`;

  try {
    console.log('🔍 Buscando chapas para el parte desde Supabase:', parteInfo.parte);
    console.log('📅 Fecha recibida:', parteInfo.fecha);
    console.log('🕐 Jornada recibida:', parteInfo.jornada);

    // Convertir fecha de formato español (DD/MM/YYYY) a formato ISO (YYYY-MM-DD) para Supabase
    const convertirFechaAISO = (fechaEsp) => {
      if (!fechaEsp) return null;
      if (fechaEsp.includes('-')) return fechaEsp; // Ya está en formato ISO
      const [dia, mes, año] = fechaEsp.split('/');
      return `${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    };

    const fechaISO = convertirFechaAISO(parteInfo.fecha);
    console.log('📅 Fecha convertida a ISO:', fechaISO);

    // Obtener TODAS las chapas del parte desde Supabase
    // Asumimos que `supabase` está disponible globalmente desde `supabase.js`
    const { data: chapasDelParte, error } = await supabase
      .from('jornales')
      .select('*')
      .eq('parte', parteInfo.parte)
      .eq('fecha', fechaISO)
      .eq('jornada', parteInfo.jornada)
      .order('id', { ascending: true });

    if (error) {
      console.error('❌ Error de Supabase:', error);
      throw error;
    }

    console.log(`✅ ${chapasDelParte ? chapasDelParte.length : 0} chapas encontradas en el parte`);
    if (chapasDelParte && chapasDelParte.length > 0) {
      console.log('📋 Primeras 3 chapas:', chapasDelParte.slice(0, 3));
    }

    loading.classList.add('hidden');

    if (!chapasDelParte || chapasDelParte.length === 0) {
      content.innerHTML = `
        <div class="modal-empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3>No se encontraron chapas</h3>
          <p>No hay chapas asignadas a este parte.</p>
        </div>
      `;
      return;
    }

    // Agrupar por puesto de contratación
    const chapasPorPuesto = {};
    chapasDelParte.forEach(jornal => {
      const puesto = jornal.puesto || 'Sin puesto asignado';
      if (!chapasPorPuesto[puesto]) {
        chapasPorPuesto[puesto] = [];
      }
      chapasPorPuesto[puesto].push(jornal.chapa);
    });

    // Ordenar puestos alfabéticamente
    const puestosOrdenados = Object.keys(chapasPorPuesto).sort();

    // Renderizar grupos de puestos
    puestosOrdenados.forEach(puesto => {
      const chapas = chapasPorPuesto[puesto];

      const puestoGroup = document.createElement('div');
      puestoGroup.className = 'puesto-group';

      const header = document.createElement('div');
      header.className = 'puesto-group-header';
      header.innerHTML = `
        <h3 class="puesto-group-title">${getEmojiPuesto(puesto)} ${puesto}</h3>
        <span class="puesto-group-count">${chapas.length} asignacion${chapas.length > 1 ? 'es' : ''}</span>
      `;

      const grid = document.createElement('div');
      grid.className = 'chapas-grid';

      // Mantener el orden original de la tabla jornales (sin ordenar alfabéticamente)
      chapas.forEach(chapa => {
        const badge = document.createElement('div');
        badge.className = 'chapa-badge';
        badge.innerHTML = `
          <div class="chapa-numero">${chapa}</div>
          <div class="chapa-label">Chapa</div>
        `;
        grid.appendChild(badge);
      });

      puestoGroup.appendChild(header);
      puestoGroup.appendChild(grid);
      content.appendChild(puestoGroup);
    });

    // Mostrar resumen total con desglose por puesto
    const resumen = document.createElement('div');
    resumen.className = 'modal-resumen-container';

    // Título del resumen
    const resumenTitulo = document.createElement('div');
    resumenTitulo.className = 'modal-resumen-titulo';
    resumenTitulo.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <span>Resumen del Parte</span>
    `;
    resumen.appendChild(resumenTitulo);

    // Grid de puestos con su cantidad
    const resumenGrid = document.createElement('div');
    resumenGrid.className = 'modal-resumen-grid';

    puestosOrdenados.forEach(puesto => {
      const cantidad = chapasPorPuesto[puesto].length;
      const card = document.createElement('div');
      card.className = 'modal-resumen-card';
      card.innerHTML = `
        <div class="modal-resumen-numero">${cantidad}</div>
        <div class="modal-resumen-puesto">${getEmojiPuesto(puesto)} ${puesto}</div>
      `;
      resumenGrid.appendChild(card);
    });

    resumen.appendChild(resumenGrid);

    // Total general
    const totalGeneral = document.createElement('div');
    totalGeneral.className = 'modal-resumen-total';
    totalGeneral.innerHTML = `
      <strong>Total:</strong> ${chapasDelParte.length} trabajador${chapasDelParte.length > 1 ? 'es' : ''}
    `;
    resumen.appendChild(totalGeneral);

    content.appendChild(resumen);

  } catch (error) {
    console.error('Error al cargar chapas del parte:', error);
    loading.classList.add('hidden');
    content.innerHTML = `
      <div class="modal-empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3>Error al cargar datos</h3>
        <p>No se pudieron cargar las chapas del parte. Por favor, intenta de nuevo.</p>
      </div>
    `;
  }
}

/**
 * Cierra el modal de chapas del parte
 */
function cerrarModalChapas() {
  const modal = document.getElementById('modal-chapas-parte');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Event listeners para el modal
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modal-chapas-parte');
  const closeBtn = document.getElementById('modal-chapas-close');

  // Cerrar con botón X
  if (closeBtn) {
    closeBtn.addEventListener('click', cerrarModalChapas);
  }

  // Cerrar al hacer click fuera del modal
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        cerrarModalChapas();
      }
    });
  }

  // Cerrar con tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      cerrarModalChapas();
    }
  });
});

/**
 * Carga la página de jornales - Sistema de Quincenas
 * Agrupa jornales por períodos quincenales (1-15, 16-fin de mes)
 * ACTUALIZADO: Usa localStorage con limpieza automática el 31 de diciembre a las 00:00
 */
let isLoadingJornales = false; // Flag para evitar ejecuciones concurrentes

async function loadJornales() {
  // Evitar ejecuciones concurrentes
  if (isLoadingJornales) {
    console.log('⚠️ loadJornales ya se está ejecutando, saltando llamada duplicada');
    return;
  }

  isLoadingJornales = true;

  const statsContainer = document.getElementById('jornales-stats');
  const container = document.getElementById('jornales-content');
  const loading = document.getElementById('jornales-loading');

  if (!container) {
    isLoadingJornales = false;
    return;
  }

  loading.classList.remove('hidden');
  container.innerHTML = '';
  statsContainer.innerHTML = '';

  try {
    // Sincronizar jornales desde CSV antes de cargar (si aplica)
    // Esto lo hace tu Edge Function de sincronización programada,
    // pero si tienes un botón manual de sincronización o si necesitas
    // forzarlo desde el cliente para depuración, puedes llamarlo aquí.
    console.log('🔄 Sincronizando jornales (desde Supabase)...');
    try {
        await SheetsAPI.syncJornalesFromCSV(); 
    } catch (syncError) {
      console.warn('⚠️ Error en la sincronización de jornales, continuando con datos existentes:', syncError.message);
    }

    // CARGAR DESDE SUPABASE (todos los jornales agrupados por quincena)
    console.log('📥 Cargando todos los jornales desde Supabase...');
    const jornalesSupabase = await SheetsAPI.getJornalesHistoricoAcumulado(AppState.currentUser);

    let data = [];

    if (jornalesSupabase && jornalesSupabase.length > 0) {
      const manuales = jornalesSupabase.filter(j => j.origen === 'manual').length;
      const csvJornales = jornalesSupabase.filter(j => j.origen === 'csv').length;
      const otros = jornalesSupabase.length - manuales - csvJornales;

      console.log(`✅ ${jornalesSupabase.length} jornales cargados: ${csvJornales} del CSV + ${manuales} manuales + ${otros} otros`);
      data = jornalesSupabase;

    } else {
      // 3. FALLBACK: CARGAR DESDE LOCALSTORAGE (solo si Supabase falla o está vacío)
      console.warn('⚠️ No hay jornales en Supabase, usando localStorage como fallback');
      let historico = JSON.parse(localStorage.getItem('jornales_historico') || '[]');

      // LIMPIEZA AUTOMÁTICA: Eliminar jornales del año anterior
      const ahora = new Date();
      const añoActual = ahora.getFullYear();

      historico = historico.filter(jornal => {
        try {
          // Convertir fecha a formato ISO para comparar
          const fechaISO = (jornal.fecha.includes('/') ? jornal.fecha.split('/').reverse().join('-') : jornal.fecha);
          const añoJornal = new Date(fechaISO).getFullYear();
          return añoJornal === añoActual;
        } catch {
          return false; // Si la fecha está mal, la eliminamos
        }
      });

      localStorage.setItem('jornales_historico', JSON.stringify(historico));

      // Filtrar solo los jornales del usuario actual
      data = historico.filter(item => item.chapa === AppState.currentUser);
      console.log(`📂 Cargados ${data.length} jornales desde localStorage`);
    }

    loading.classList.add('hidden');

    if (data.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3>No hay datos de jornales</h3>
          <p>No se encontraron registros de jornales para tu chapa.</p>
        </div>
      `;
      isLoadingJornales = false; // Resetear flag antes de return
      return;
    }

    // Agrupar por quincenas
    const quincenasMap = groupByQuincena(data);

    // Ordenar quincenas por fecha (más recientes primero)
    const quincenasOrdenadas = Array.from(quincenasMap.entries()).sort((a, b) => {
      const [yearA, monthA, quincenaA] = a[0].split('-').map(Number);
      const [yearB, monthB, quincenaB] = b[0].split('-').map(Number);
      if (yearB !== yearA) return yearB - yearA;
      if (monthB !== monthA) return monthB - monthA;
      return quincenaB - quincenaA;
    });

    // Calcular estadísticas totales
    const totalJornales = data.length;

    // Botón de exportar
    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn-primary';
    exportBtn.style.marginBottom = '1rem';
    exportBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px; margin-right: 8px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Exportar a PDF
    `;
    exportBtn.addEventListener('click', () => exportJornalesToPDF(data));
    container.appendChild(exportBtn);

    // Renderizar stats totales
    statsContainer.innerHTML = `
      <div class="stat-card blue">
        <div class="stat-label">Total Jornales</div>
        <div class="stat-value">${totalJornales}</div>
      </div>
      <div class="stat-card green">
        <div class="stat-label">Quincenas Registradas</div>
        <div class="stat-value">${quincenasOrdenadas.length}</div>
      </div>
    `;

    // Renderizar cada quincena
    quincenasOrdenadas.forEach(([key, jornales]) => {
      const [year, month, quincena] = key.split('-').map(Number);
      const quincenaCard = createQuincenaCard(year, month, quincena, jornales);
      container.appendChild(quincenaCard);
    });

  } catch (error) {
    loading.classList.add('hidden');
    statsContainer.innerHTML = '';
    container.innerHTML = `
      <div class="empty-state">
        <h3>Error al cargar datos</h3>
        <p>No se pudieron cargar los jornales. Por favor, intenta de nuevo más tarde.</p>
      </div>
    `;
  } finally {
    // Siempre resetear el flag, sin importar si hubo éxito o error
    isLoadingJornales = false;
  }
}

/**
 * Agrupa jornales por quincena
 */
function groupByQuincena(jornales) {
  const map = new Map();

  jornales.forEach(jornal => {
    // Validar que el jornal tenga fecha
    if (!jornal.fecha) {
      console.warn('⚠️ Jornal sin fecha en groupByQuincena, saltando:', jornal);
      return;
    }

    let day, month, year;

    // Parsear fecha: soportar tanto dd/mm/yyyy como yyyy-mm-dd (ISO)
    if (jornal.fecha.includes('/')) {
      // Formato español: dd/mm/yyyy
      const parts = jornal.fecha.split('/');
      day = parseInt(parts[0]);
      month = parseInt(parts[1]);
      year = parseInt(parts[2]);
    } else if (jornal.fecha.includes('-')) {
      // Formato ISO: yyyy-mm-dd
      const parts = jornal.fecha.split('-');
      year = parseInt(parts[0]);
      month = parseInt(parts[1]);
      day = parseInt(parts[2]);
    } else {
      // Formato desconocido, intentar como objeto Date
      const date = new Date(jornal.fecha);
      if (!isNaN(date.getTime())) {
        year = date.getFullYear();
        month = date.getMonth() + 1;
        day = date.getDate();
      } else {
        console.error('Formato de fecha no válido en groupByQuincena:', jornal.fecha);
        return; // Saltar este jornal
      }
    }

    // Determinar quincena: 1 (días 1-15) o 2 (días 16-fin)
    const quincena = day <= 15 ? 1 : 2;

    // Crear clave única: year-month-quincena
    const key = `${year}-${month}-${quincena}`;

    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(jornal);
  });

  return map;
}

/**
 * Ordena jornales por fecha y jornada (en el orden correcto del día)
 * Fechas más recientes primero, pero respetando orden de jornadas: 02-08, 08-14, 14-20, 20-02
 */
function sortJornalesByDateAndShift(jornales) {
  // Definir orden de jornadas - normalizar para soportar todos los formatos
  const getJornadaOrder = (jornada) => {
    if (!jornada) return 999;

    // Normalizar la jornada eliminando espacios extras
    const normalizedJornada = jornada.trim();

    // Mapeo de todas las variantes posibles
    const orderMap = {
      '02-08': 1,
      '02 a 08': 1,
      '02a08': 1,
      '08-14': 2,
      '08 a 14': 2,
      '08a14': 2,
      '14-20': 3,
      '14 a 20': 3,
      '14a20': 3,
      '20-02': 4,
      '20 a 02': 4,
      '20a02': 4
    };

    return orderMap[normalizedJornada] || 999;
  };

  return jornales.sort((a, b) => {
    // Primero ordenar por fecha (más recientes primero)
    let dateA, dateB;

    if (a.fecha.includes('/')) {
      const [day, month, year] = a.fecha.split('/').map(Number);
      dateA = new Date(year, month - 1, day);
    } else {
      dateA = new Date(a.fecha);
    }

    if (b.fecha.includes('/')) {
      const [day, month, year] = b.fecha.split('/').map(Number);
      dateB = new Date(year, month - 1, day);
    } else {
      dateB = new Date(b.fecha);
    }

    if (dateA.getTime() !== dateB.getTime()) {
      return dateB.getTime() - dateA.getTime(); // Descendente: más recientes primero
    }

    // Si las fechas son iguales, ordenar por jornada
    // NOTA: Se invierte el orden (orderB - orderA) debido a que el renderizado invierte el orden final
    const orderA = getJornadaOrder(a.jornada);
    const orderB = getJornadaOrder(b.jornada);
    return orderB - orderA;
  });
}

/**
 * Crea una tarjeta de quincena con datos resumidos
 */
function createQuincenaCard(year, month, quincena, jornales) {
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const monthName = monthNames[month - 1];

  // Determinar rango de días
  const rangoInicio = quincena === 1 ? 1 : 16;
  const rangoFin = quincena === 1 ? 15 : new Date(year, month, 0).getDate();

  // Calcular estadísticas
  const totalJornales = jornales.length;

  // Ordenar jornales por fecha y jornada
  const jornalesOrdenados = sortJornalesByDateAndShift([...jornales]);

  // Desglose por empresa
  const porEmpresa = {};
  jornales.forEach(j => {
    const empresa = j.empresa || 'Sin especificar';
    porEmpresa[empresa] = (porEmpresa[empresa] || 0) + 1;
  });

  // Desglose por puesto
  const porPuesto = {};
  jornales.forEach(j => {
    const puesto = j.puesto || 'Sin especificar';
    porPuesto[puesto] = (porPuesto[puesto] || 0) + 1;
  });

  // Crear card
  const card = document.createElement('div');
  card.className = 'quincena-card';
  card.style.marginBottom = '0.75rem';
  card.style.border = '1px solid var(--border-color)';
  card.style.borderRadius = '8px';
  card.style.overflow = 'hidden';
  card.style.background = 'white';

  // Emoji de calendario según quincena
  const emojiCalendario = quincena === 1 ? '📅' : '🗓️';

  // Formato de mes en 3 letras mayúsculas
  const monthShort = monthName.substring(0, 3).toUpperCase();

  // Header simple - una sola línea con la información de la quincena
  const header = document.createElement('div');
  header.className = 'quincena-header';
  header.style.padding = '1rem 1.25rem';
  header.style.background = 'white';
  header.style.cursor = 'pointer';
  header.style.userSelect = 'none';
  header.style.transition = 'all 0.2s ease';
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.gap = '0.75rem';
  header.style.borderBottom = '1px solid var(--border-color)';

  header.innerHTML = `
    <span style="font-size: 1.3rem;">${emojiCalendario}</span>
    <span style="font-size: 1rem; font-weight: 600; color: #000;">${rangoInicio}-${rangoFin} ${monthShort}</span>
    <span style="font-size: 0.85rem; color: #666; margin-left: 0.5rem;">${totalJornales} jornales</span>
    <svg class="expand-icon" xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px; margin-left: auto; transition: transform 0.3s; flex-shrink: 0;" fill="none" viewBox="0 0 24 24" stroke="#666" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  `;

  // Efectos hover para hacer más obvio que es clickeable
  header.addEventListener('mouseenter', () => {
    header.style.background = 'var(--bg-secondary)';
  });
  header.addEventListener('mouseleave', () => {
    header.style.background = 'white';
  });

  // Body (inicialmente oculto)
  const body = document.createElement('div');
  body.className = 'quincena-body';
  body.style.display = 'none';
  body.style.padding = '1.25rem';

  // Resumen por empresa
  const empresasHTML = Object.entries(porEmpresa)
    .sort((a, b) => b[1] - a[1])
    .map(([empresa, count]) => `
      <div style="display: flex; justify-content: space-between; padding: 0.5rem; background: var(--bg-secondary); border-radius: 6px; margin-bottom: 0.5rem;">
        <span>${empresa}</span>
        <span style="font-weight: bold; color: var(--puerto-blue);">${count} jornales</span>
      </div>
    `).join('');

  // Resumen por puesto
  const puestosHTML = Object.entries(porPuesto)
    .sort((a, b) => b[1] - a[1])
    .map(([puesto, count]) => `
      <div style="display: flex; justify-content: space-between; padding: 0.5rem; background: var(--bg-secondary); border-radius: 6px; margin-bottom: 0.5rem;">
        <span>${puesto}</span>
        <span style="font-weight: bold; color: var(--puerto-green);">${count} jornales</span>
      </div>
    `).join('');

  body.innerHTML = `
    <div style="display: grid; gap: 1.5rem; margin-bottom: 1.5rem;">
      <div>
        <h4 style="margin-bottom: 0.75rem; color: var(--puerto-blue);">📊 Por Empresa</h4>
        ${empresasHTML}
      </div>
      <div>
        <h4 style="margin-bottom: 0.75rem; color: var(--puerto-green);">👷 Por Puesto</h4>
        ${puestosHTML}
      </div>
    </div>

    <div>
      <h4 style="margin-bottom: 0.75rem; color: var(--puerto-dark-blue);">📋 Detalle de Jornales</h4>
      <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
        <svg xmlns="http://www.w3.org/2000/svg" style="width: 16px; height: 16px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
        Desliza horizontalmente para ver todos los datos
      </div>
      <div class="data-table" style="overflow-x: auto; -webkit-overflow-scrolling: touch; margin: 0 -1.25rem; padding: 0 1.25rem;">
        <table style="min-width: 600px;">
          <thead>
            <tr>
              <th style="white-space: nowrap;">Fecha</th>
              <th style="white-space: nowrap;">Puesto</th>
              <th style="white-space: nowrap;">Jornada</th>
              <th style="white-space: nowrap;">Empresa</th>
              <th style="white-space: nowrap;">Buque</th>
              <th style="white-space: nowrap;">Parte</th>
              <th style="white-space: nowrap; text-align: center;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${jornalesOrdenados.map(row => `
              <tr>
                <td style="white-space: nowrap;"><strong>${formatearFecha(row.fecha)}</strong></td>
                <td style="white-space: nowrap;">
                  ${row.puesto}
                  ${row.manual ? '<span class="badge-manual" title="Añadido manualmente">Manual</span>' : ''}
                </td>
                <td style="white-space: nowrap;">${row.jornada}</td>
                <td style="white-space: nowrap;">${row.empresa}</td>
                <td style="white-space: nowrap;">${row.buque}</td>
                <td style="white-space: nowrap;">${row.parte}</td>
                <td style="white-space: nowrap; text-align: center;">
                  <button class="btn-delete-jornal" data-jornal-id="${row.id}" style="background: #dc3545; color: white; border: none; border-radius: 4px; padding: 0.4rem 0.8rem; cursor: pointer; font-size: 0.85rem; transition: background 0.2s;" title="Eliminar jornal">
                    <svg xmlns="http://www.w3.org/2000/svg" style="width: 16px; height: 16px; vertical-align: middle;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Click handler para toggle expand/collapse
  header.addEventListener('click', () => {
    const isExpanded = body.style.display !== 'none';
    body.style.display = isExpanded ? 'none' : 'block';
    const icon = header.querySelector('.expand-icon');
    icon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
  });

  card.appendChild(header);
  card.appendChild(body);

  return card;
}

/**
 * Limpia jornales antiguos - mantiene solo últimos 12 meses
 */
function cleanupOldJornales(historico) {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - 12);

  const cleaned = historico.filter(jornal => {
    // Convertir fecha a formato ISO para comparar
    const fechaISO = (jornal.fecha.includes('/') ? jornal.fecha.split('/').reverse().join('-') : jornal.fecha);
    const jornalDate = new Date(fechaISO);
    return jornalDate >= cutoffDate;
  });

  if (cleaned.length !== historico.length) {
    localStorage.setItem('jornales_historico', JSON.stringify(cleaned));
    console.log(`Limpieza de jornales: ${historico.length - cleaned.length} registros eliminados`);
  }
}

/**
 * Exporta jornales a PDF organizados por quincena
 */
function exportJornalesToPDF(data) {
  // Acceder a jsPDF desde el objeto global window
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Agrupar jornales por quincena
  const quincenasMap = groupByQuincena(data);

  // Ordenar quincenas (más recientes primero)
  const quincenasOrdenadas = Array.from(quincenasMap.entries()).sort((a, b) => {
    const [yearA, monthA, quincenaA] = a[0].split('-').map(Number);
    const [yearB, monthB, quincenaB] = b[0].split('-').map(Number);
    if (yearB !== yearA) return yearB - yearA;
    if (monthB !== monthA) return monthB - monthA;
    return quincenaB - quincenaA;
  });

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  let isFirstPage = true;

  // Generar una sección por cada quincena
  quincenasOrdenadas.forEach(([key, jornales]) => {
    const [year, month, quincena] = key.split('-').map(Number);
    const monthName = monthNames[month - 1];
    const rangoInicio = quincena === 1 ? 1 : 16;
    const rangoFin = quincena === 1 ? 15 : new Date(year, month, 0).getDate();

    // Agregar nueva página si no es la primera
    if (!isFirstPage) {
      doc.addPage();
    }
    isFirstPage = false;

    // Título de la quincena
    doc.setFontSize(16);
    doc.setTextColor(10, 46, 92); // Color azul del puerto
    doc.text(`${monthName} ${year} - Quincena ${quincena}`, 14, 15);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Días ${rangoInicio} al ${rangoFin}`, 14, 22);

    // Estadísticas de la quincena
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total de jornales: ${jornales.length}`, 14, 28);

    // Ordenar jornales por fecha y jornada
    const jornalesOrdenados = sortJornalesByDateAndShift([...jornales]);

    // Preparar datos para la tabla
    const tableData = jornalesOrdenados.map(j => [
      formatearFecha(j.fecha),
      j.puesto,
      j.jornada,
      j.empresa,
      j.buque || '-',
      j.parte || '-'
    ]);

    // Crear tabla con autoTable
    doc.autoTable({
      startY: 32,
      head: [['Fecha', 'Puesto', 'Jornada', 'Empresa', 'Buque', 'Parte']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [10, 46, 92], // Color azul del puerto
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [50, 50, 50]
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      margin: { top: 32, left: 14, right: 14 },
      styles: {
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      }
    });
  });

  // Agregar información del trabajador en el pie de página de cada página
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Chapa ${AppState.currentUser} - Página ${i} de ${pageCount}`,
      14,
      doc.internal.pageSize.height - 10
    );
    doc.text(
      `Generado el ${new Date().toLocaleDateString('es-ES')}`,
      doc.internal.pageSize.width - 14,
      doc.internal.pageSize.height - 10,
      { align: 'right' }
    );
  }

  // Descargar PDF
  doc.save(`jornales_chapa_${AppState.currentUser}_${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * Carga la página de puertas
 * Muestra la fecha actual del sistema en el título
 */
async function loadPuertas() {
  const container = document.getElementById('puertas-content');
  const loading = document.getElementById('puertas-loading');
  const tituloElement = document.getElementById('puertas-titulo');
  const fechaElement = document.getElementById('puertas-fecha');

  if (!container) return;

  loading.classList.remove('hidden');
  container.innerHTML = '';

  try {
    const result = await SheetsAPI.getPuertas(); // SheetsAPI (en supabase.js)
    const fecha = result.fecha || new Date().toLocaleDateString('es-ES');
    const data = result.puertas || [];

    loading.classList.add('hidden');

    // Actualizar título con la fecha del CSV
    if (tituloElement) {
      tituloElement.textContent = `Puertas del Día`;
    }
    if (fechaElement) {
      fechaElement.textContent = `Información para el ${fecha}`;
    }

    // Separar puertas laborables y festivas
    const puertasLaborables = data.filter(item =>
      item.jornada && !item.jornada.toLowerCase().includes('festivo')
    );
    const puertasFestivas = data.filter(item =>
      item.jornada && item.jornada.toLowerCase().includes('festivo')
    );

    // Crear tabla de puertas laborables
    if (puertasLaborables.length > 0) {
      const laborablesTitle = document.createElement('h3');
      laborablesTitle.style.marginBottom = '1rem';
      laborablesTitle.style.color = 'var(--puerto-blue)';
      laborablesTitle.style.fontSize = '1.25rem';
      laborablesTitle.textContent = '📋 Puertas Laborables';
      container.appendChild(laborablesTitle);

      const tableWrapper = document.createElement('div');
      tableWrapper.className = 'data-table';
      tableWrapper.style.marginBottom = '2rem';

      const table = document.createElement('table');
      table.style.width = '100%';

      // Header de la tabla con 3 columnas
      table.innerHTML = `
        <thead>
          <tr>
            <th style="text-align: left; padding: 1rem; background: var(--puerto-blue); color: white;">Jornada</th>
            <th style="text-align: center; padding: 1rem; background: var(--puerto-blue); color: white;">Puerta SP</th>
            <th style="text-align: center; padding: 1rem; background: var(--puerto-blue); color: white;">Puerta OC</th>
          </tr>
        </thead>
        <tbody>
          ${puertasLaborables.map(item => {
            const puertaSP = item.puertaSP || '';
            const puertaOC = item.puertaOC || '';
            const isEmptySP = !puertaSP || puertaSP.trim() === '';
            const isEmptyOC = !puertaOC || puertaOC.trim() === '';
            return `
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 1rem; font-weight: 600; color: var(--puerto-dark-blue);">${item.jornada}</td>
                <td style="padding: 1rem; text-align: center;">
                  ${isEmptySP
                    ? '<span style="color: var(--puerto-red); font-weight: 600;">— No contratada</span>'
                    : `<span style="background: linear-gradient(135deg, var(--puerto-green), #059669); color: white; padding: 0.5rem 1.5rem; border-radius: 8px; font-weight: bold; font-size: 1.1rem; display: inline-block; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);">${puertaSP}</span>`
                  }
                </td>
                <td style="padding: 1rem; text-align: center;">
                  ${isEmptyOC
                    ? '<span style="color: var(--puerto-red); font-weight: 600;">— No contratada</span>'
                    : `<span style="background: linear-gradient(135deg, var(--puerto-blue), #1e40af); color: white; padding: 0.5rem 1.5rem; border-radius: 8px; font-weight: bold; font-size: 1.1rem; display: inline-block; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);">${puertaOC}</span>`
                  }
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      `;

      tableWrapper.appendChild(table);
      container.appendChild(tableWrapper);
    }

    // Crear tabla de puertas festivas
    if (puertasFestivas.length > 0) {
      const festivasTitle = document.createElement('h3');
      festivasTitle.style.marginBottom = '1rem';
      festivasTitle.style.color = 'var(--puerto-orange)';
      festivasTitle.style.fontSize = '1.25rem';
      festivasTitle.textContent = '🎉 Puertas Festivas';
      container.appendChild(festivasTitle);

      const tableWrapper = document.createElement('div');
      tableWrapper.className = 'data-table';

      const table = document.createElement('table');
      table.style.width = '100%';

      // Header de la tabla con 3 columnas
      table.innerHTML = `
        <thead>
          <tr>
            <th style="text-align: left; padding: 1rem; background: var(--puerto-orange); color: white;">Jornada</th>
            <th style="text-align: center; padding: 1rem; background: var(--puerto-orange); color: white;">Puerta SP</th>
            <th style="text-align: center; padding: 1rem; background: var(--puerto-orange); color: white;">Puerta OC</th>
          </tr>
        </thead>
        <tbody>
          ${puertasFestivas.map(item => {
            const puertaSP = item.puertaSP || '';
            const puertaOC = item.puertaOC || '';
            const isEmptySP = !puertaSP || puertaSP.trim() === '';
            const isEmptyOC = !puertaOC || puertaOC.trim() === '';
            return `
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 1rem; font-weight: 600; color: var(--puerto-dark-blue);">${item.jornada}</td>
                <td style="padding: 1rem; text-align: center;">
                  ${isEmptySP
                    ? '<span style="color: var(--puerto-red); font-weight: 600;">— No contratada</span>'
                    : `<span style="background: linear-gradient(135deg, var(--puerto-orange), #ea580c); color: white; padding: 0.5rem 1.5rem; border-radius: 8px; font-weight: bold; font-size: 1.1rem; display: inline-block; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);">${puertaSP}</span>`
                  }
                </td>
                <td style="padding: 1rem; text-align: center;">
                  ${isEmptyOC
                    ? '<span style="color: var(--puerto-red); font-weight: 600;">— No contratada</span>'
                    : `<span style="background: linear-gradient(135deg, var(--puerto-blue), #1e40af); color: white; padding: 0.5rem 1.5rem; border-radius: 8px; font-weight: bold; font-size: 1.1rem; display: inline-block; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);">${puertaOC}</span>`
                  }
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      `;

      tableWrapper.appendChild(table);
      container.appendChild(tableWrapper);
    }

  } catch (error) {
    loading.classList.add('hidden');
    container.innerHTML = `
      <div class="empty-state">
        <h3>Error al cargar datos</h3>
        <p>No se pudieron cargar las puertas. Por favor, intenta de nuevo más tarde.</p>
      </div>
    `;
  }
}

/**
 * Carga la página de censo
 */
async function loadCenso() {
  const container = document.getElementById('censo-content');
  const loading = document.getElementById('censo-loading');

  if (!container) return;

  loading.classList.remove('hidden');
  container.innerHTML = '';

  try {
    // 1. SINCRONIZAR CENSO DESDE CSV AUTOMÁTICAMENTE (si aplica)
    console.log('🔄 Verificando sincronización de censo (desde Supabase)...');
    try {
      await SheetsAPI.syncCensoFromCSV(); // Esto usa la Edge Function de sincronización de censo
    } catch (syncError) {
      console.warn('⚠️ Error en la sincronización de censo, continuando con datos existentes:', syncError.message);
    }

    // 2. CARGAR DESDE SUPABASE
    const data = await SheetsAPI.getCenso(); // SheetsAPI (en supabase.js)

    loading.classList.add('hidden');

    // Calcular estadísticas por color
    const colorStats = {
      green: 0,
      blue: 0,
      yellow: 0,
      orange: 0,
      red: 0
    };

    data.forEach(item => {
      if (colorStats.hasOwnProperty(item.color)) {
        colorStats[item.color]++;
      }
    });

    const total = data.length;

    // Crear contenedor de estadísticas
    const statsContainer = document.createElement('div');
    statsContainer.style.display = 'grid';
    statsContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(100px, 1fr))';
    statsContainer.style.gap = '1rem';
    statsContainer.style.marginBottom = '2rem';
    statsContainer.style.maxWidth = '600px';
    statsContainer.style.margin = '0 auto 2rem auto';

    // Colores y nombres
    const colorInfo = [
      { key: 'green', name: 'Verde', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
      { key: 'blue', name: 'Azul', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
      { key: 'yellow', name: 'Amarillo', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
      { key: 'orange', name: 'Naranja', gradient: 'linear-gradient(135deg, #f97316, #ea580c)' },
      { key: 'red', name: 'Rojo', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' }
    ];

    colorInfo.forEach(color => {
      const count = colorStats[color.key];
      const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;

      const statCard = document.createElement('div');
      statCard.style.background = 'white';
      statCard.style.border = '1px solid var(--border-color)';
      statCard.style.borderRadius = '8px';
      statCard.style.padding = '1rem';
      statCard.style.textAlign = 'center';
      statCard.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';

      statCard.innerHTML = `
        <div style="width: 60px; height: 60px; background: ${color.gradient}; border-radius: 8px; margin: 0 auto 0.75rem; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
        <div style="font-size: 1.5rem; font-weight: bold; color: var(--text-primary); margin-bottom: 0.25rem;">${count}</div>
        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.25rem;">${color.name}</div>
        <div style="font-size: 0.75rem; font-weight: 600; color: var(--puerto-blue);">${percentage}%</div>
      `;

      statsContainer.appendChild(statCard);
    });

    container.appendChild(statsContainer);

    // Crear wrapper para el grid de chapas
    const chapasWrapper = document.createElement('div');
    chapasWrapper.className = 'censo-grid';
    chapasWrapper.style.marginTop = '2rem';

    // Función para obtener la clase de posición según SP/OC
    function getPosicionClass(posicion) {
      const LIMITE_SP = 455;

      if (posicion <= LIMITE_SP) {
        return 'sp'; // Amarillo para SP (Servicio Permanente)
      } else {
        return 'oc'; // Azul para OC (Operaciones Complementarias)
      }
    }

    // Crear grid de chapas dentro del wrapper
    data.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = `censo-item ${item.color}`;

      // Verificar si existe el campo posicion
      const posicion = item.posicion || (index + 1);
      const posicionClass = getPosicionClass(posicion);

      // Crear estructura con posición
      const wrapper = document.createElement('div');
      wrapper.className = 'censo-item-with-position';

      const posicionBadge = document.createElement('div');
      posicionBadge.className = `censo-position-badge ${posicionClass}`;
      posicionBadge.textContent = posicion;

      const chapaNumber = document.createElement('div');
      chapaNumber.textContent = item.chapa;
      chapaNumber.style.fontWeight = '700';
      chapaNumber.style.fontSize = '1rem';

      wrapper.appendChild(posicionBadge);
      wrapper.appendChild(chapaNumber);

      div.appendChild(wrapper);
      div.title = `Chapa ${item.chapa} - Posición ${posicion}`;

      chapasWrapper.appendChild(div);
    });

    container.appendChild(chapasWrapper);

  } catch (error) {
    loading.classList.add('hidden');
    container.innerHTML = `
      <div class="empty-state">
        <h3>Error al cargar datos</h3>
        <p>No se pudo cargar el censo. Por favor, intenta de nuevo más tarde.</p>
      </div>
    `;
  }
}

/**
 * Sincroniza los datos del CSV de la empresa con la tabla tablon_actual en Supabase
 * Esta función sobrescribe completamente la tabla con los datos actuales del CSV
 */
async function sincronizarTablonDesdeCSV() {
  console.log('🔄 Sincronizando tablón desde CSV...');

  try {
    // 1. Obtener datos actuales del CSV de la empresa
    const contratacionesCSV = await SheetsAPI.getContrataciones();

    if (!contratacionesCSV || contratacionesCSV.length === 0) {
      console.warn('⚠️ No se obtuvieron datos del CSV');
      return { success: false, message: 'No hay datos en el CSV' };
    }

    console.log(`📊 Obtenidos ${contratacionesCSV.length} registros del CSV`);

    // 2. Eliminar todos los datos existentes en tablon_actual
    const { error: deleteError } = await window.supabaseClient
      .from('tablon_actual')
      .delete()
      .neq('id', 0); // Eliminar todo (neq 0 es un truco para eliminar todo)

    if (deleteError) {
      console.error('❌ Error eliminando datos antiguos:', deleteError);
      throw deleteError;
    }

    console.log('🗑️ Datos antiguos eliminados');

    // 3. Preparar datos para inserción
    const datosParaInsertar = contratacionesCSV.map(item => ({
      fecha: item.fecha,
      chapa: item.chapa,
      puesto: item.puesto,
      jornada: item.jornada,
      empresa: item.empresa,
      buque: item.buque,
      parte: item.parte
    }));

    // 4. Insertar nuevos datos en lotes (máximo 1000 por lote para Supabase)
    const BATCH_SIZE = 1000;
    for (let i = 0; i < datosParaInsertar.length; i += BATCH_SIZE) {
      const batch = datosParaInsertar.slice(i, i + BATCH_SIZE);

      const { error: insertError } = await window.supabaseClient
        .from('tablon_actual')
        .insert(batch);

      if (insertError) {
        console.error('❌ Error insertando lote:', insertError);
        throw insertError;
      }

      console.log(`✅ Lote ${Math.floor(i / BATCH_SIZE) + 1} insertado (${batch.length} registros)`);
    }

    console.log(`✅ Sincronización completa: ${datosParaInsertar.length} registros actualizados`);
    return { success: true, total: datosParaInsertar.length };

  } catch (error) {
    console.error('❌ Error sincronizando tablón desde CSV:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Busca una jornada histórica específica
 */
async function buscarJornadaHistorica() {
  const fechaInput = document.getElementById('tablon-buscar-fecha');
  const jornadaInput = document.getElementById('tablon-buscar-jornada');

  const fecha = fechaInput?.value;
  const jornada = jornadaInput?.value;

  // Validar que se hayan seleccionado ambos campos
  if (!fecha || !jornada) {
    alert('Por favor, selecciona una fecha y una jornada para buscar.');
    return;
  }

  console.log(`🔍 Buscando jornada: ${fecha} - ${jornada}`);

  // Cargar tablón con opciones de búsqueda histórica
  await loadTablon({
    historico: true,
    fecha: fecha,
    jornada: jornada
  });
}

/**
 * Carga el tablón de contratación con división por jornadas
 * @param {Object} options - Opciones de carga
 * @param {boolean} options.historico - Si es true, carga datos históricos
 * @param {string} options.fecha - Fecha en formato YYYY-MM-DD (para búsqueda histórica)
 * @param {string} options.jornada - Jornada específica (para búsqueda histórica)
 */
async function loadTablon(options = {}) {
  const container = document.getElementById('tablon-content');
  const loading = document.getElementById('tablon-loading');
  const statsContainer = document.getElementById('tablon-stats');
  const fechaTitulo = document.getElementById('tablon-fecha');
  const searchInput = document.getElementById('tablon-search');
  const expandAllBtn = document.getElementById('tablon-expand-all');
  const jornadasTabsContainer = document.getElementById('tablon-jornadas-tabs');
  const modal = document.getElementById('tablon-chapa-modal');
  const modalTitle = document.getElementById('modal-chapa-titulo');
  const modalContent = document.getElementById('modal-chapa-content');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const filterEmpresa = document.getElementById('tablon-filter-empresa');
  const filterBuque = document.getElementById('tablon-filter-buque');
  const filterEspecialidad = document.getElementById('tablon-filter-especialidad');
  const clearFiltersBtn = document.getElementById('tablon-clear-filters');

  if (!container) return;

  loading.classList.remove('hidden');
  container.innerHTML = '';
  if (statsContainer) statsContainer.innerHTML = '';
  if (jornadasTabsContainer) jornadasTabsContainer.innerHTML = '';

  // Configurar modal
  if (modal && modalCloseBtn) {
    modalCloseBtn.onclick = () => {
      modal.style.display = 'none';
    };
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    };
  }

  try {
    let contrataciones;
    let errorContrataciones;

    // Verificar si es búsqueda histórica o tablón actual
    if (options.historico && options.fecha && options.jornada) {
      // BÚSQUEDA HISTÓRICA: Consultar tabla jornales
      console.log(`🔍 Buscando jornada histórica: ${options.fecha} - ${options.jornada}`);

      const result = await window.supabaseClient
        .from('jornales')
        .select('chapa, empresa, buque, parte, puesto, jornada, fecha')
        .eq('fecha', options.fecha)
        .eq('jornada', options.jornada)
        .order('id', { ascending: true });

      contrataciones = result.data;
      errorContrataciones = result.error;
    } else {
      // TABLÓN ACTUAL: Sincronizar y obtener datos de tablon_actual
      console.log('🔄 Sincronizando tablón desde CSV...');
      const syncResult = await SheetsAPI.syncTablonActualFromCSV();

      if (syncResult.success) {
        console.log(`✅ Tablón sincronizado: ${syncResult.count} registros actualizados`);
      } else {
        console.warn('⚠️ Error sincronizando tablón:', syncResult.message);
      }

      // 1. Obtener TODAS las contrataciones de tablon_actual (todas las jornadas disponibles)
      // Ordenar por id para mantener el orden cronológico de contratación
      const result = await window.supabaseClient
        .from('tablon_actual')
        .select('chapa, empresa, buque, parte, puesto, jornada, fecha')
        .order('id', { ascending: true });

      contrataciones = result.data;
      errorContrataciones = result.error;
    }

    if (errorContrataciones) throw errorContrataciones;

    // ============================================
    // 🎨 CONFIGURACIÓN DE TAMAÑO DE ESTADÍSTICAS
    // ============================================
    // Cambia este valor para ajustar el tamaño de las tarjetas de estadísticas:
    // - 1.0 = Tamaño completo (100%)
    // - 0.5 = Mitad del tamaño (50%)
    // - 0.25 = Un cuarto del tamaño (25%)
    const STATS_SIZE_SCALE = 0.25; // ← AJUSTA ESTE VALOR (0.25, 0.5, 0.75, 1.0)

    // Logos de empresas
    const empresaLogos = {
      'APM': 'https://i.imgur.com/HgQ95qc.jpeg',
      'CSP': 'https://i.imgur.com/8Tjx3KP.jpeg',
      'VTEU': 'https://i.imgur.com/3nNCkw5.jpeg',
      'MSC': 'https://i.imgur.com/kX4Ujxf.jpeg',
      'ERH': 'https://i.imgur.com/OHDp62K.png'
    };

    // Imagen genérica de buque
    const buqueImage = 'https://i.imgur.com/guKCoFy.jpeg';

    // Verificar si hay contrataciones
    if (!contrataciones || contrataciones.length === 0) {
      loading.classList.add('hidden');

      let mensaje = '';
      if (options.historico) {
        const fechaObj = new Date(options.fecha + 'T12:00:00');
        const fechaFormateada = fechaObj.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        mensaje = `
          <div style="text-align: center; padding: 3rem;">
            <p style="font-size: 1.2rem; margin-bottom: 1rem;">⚠️ No se encontraron contrataciones</p>
            <p style="margin-bottom: 1rem;">No hay datos para la jornada <strong>${options.jornada}</strong> del <strong>${fechaFormateada}</strong>.</p>
            <button onclick="loadTablon()" style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: var(--puerto-blue); color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer;">
              Volver al tablón actual
            </button>
          </div>
        `;
      } else {
        mensaje = `
          <div style="text-align: center; padding: 3rem;">
            <p style="font-size: 1.2rem; margin-bottom: 1rem;">⚠️ No hay datos del tablón</p>
            <p style="margin-bottom: 2rem;">No se encontraron contrataciones en el CSV de la empresa.</p>
          </div>
        `;
      }

      container.innerHTML = mensaje;
      return;
    }

    loading.classList.add('hidden');

    // Actualizar título
    if (fechaTitulo) {
      if (options.historico) {
        // Búsqueda histórica: mostrar fecha y jornada buscada
        const fechaObj = new Date(options.fecha + 'T12:00:00');
        const fechaFormateada = fechaObj.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        fechaTitulo.textContent = `Jornada histórica: ${fechaFormateada} - ${options.jornada}`;
      } else {
        // Tablón actual: mostrar última fecha
        const fechasUnicas = [...new Set(contrataciones.map(c => c.fecha))].sort().reverse();
        const ultimaFecha = fechasUnicas[0];
        const fechaObj = new Date(ultimaFecha + 'T12:00:00');
        const fechaFormateada = fechaObj.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        fechaTitulo.textContent = `Última contratación: ${fechaFormateada}`;
      }
    }

    // Mostrar/ocultar botón "Volver al tablón actual"
    const volverBtn = document.getElementById('tablon-volver-actual-btn');
    if (volverBtn) {
      if (options.historico) {
        volverBtn.style.display = 'block';
      } else {
        volverBtn.style.display = 'none';
      }
    }

    // 3. Agrupar por jornada → empresa → [barcos | trincadores | re] → especialidad
    const jornadasMap = {};

    contrataciones.forEach(item => {
      const jornada = item.jornada || 'Sin jornada';
      const empresa = item.empresa || 'Sin empresa';
      const buque = item.buque || 'Sin barco';
      const especialidad = item.puesto || 'Sin especialidad';

      if (!jornadasMap[jornada]) {
        jornadasMap[jornada] = {};
      }
      if (!jornadasMap[jornada][empresa]) {
        jornadasMap[jornada][empresa] = {
          barcos: {},       // Barcos reales (buque != "--")
          trincadores: {},  // Trincadores sin barco (buque = "--" y puesto = "Trincador")
          re: {}            // Personal OC/R/E sin barco (buque = "--" y puesto != "Trincador")
        };
      }

      // Determinar si es barco real, trincador o R/E
      if (buque === '--' || buque === '—' || buque === '-') {
        // Sin barco asignado
        if (especialidad.toLowerCase().includes('trincador')) {
          // Grupo especial: Trincadores
          if (!jornadasMap[jornada][empresa].trincadores[especialidad]) {
            jornadasMap[jornada][empresa].trincadores[especialidad] = [];
          }
          jornadasMap[jornada][empresa].trincadores[especialidad].push(item);
        } else {
          // Grupo especial: R/E (personal OC)
          if (!jornadasMap[jornada][empresa].re[especialidad]) {
            jornadasMap[jornada][empresa].re[especialidad] = [];
          }
          jornadasMap[jornada][empresa].re[especialidad].push(item);
        }
      } else {
        // Barco real
        if (!jornadasMap[jornada][empresa].barcos[buque]) {
          jornadasMap[jornada][empresa].barcos[buque] = {};
        }
        if (!jornadasMap[jornada][empresa].barcos[buque][especialidad]) {
          jornadasMap[jornada][empresa].barcos[buque][especialidad] = [];
        }
        jornadasMap[jornada][empresa].barcos[buque][especialidad].push(item);
      }
    });

    // 4. Calcular estadísticas
    const totalChapas = contrataciones.length;
    const totalJornadas = Object.keys(jornadasMap).length;
    const totalBarcos = new Set(contrataciones.map(c => c.buque)).size;
    const totalEspecialidades = new Set(contrataciones.map(c => c.puesto)).size;

    // 4.1. Crear mapa de jornadas con su fecha más antigua para ordenamiento cronológico
    const jornadaFechaMap = {};
    contrataciones.forEach(item => {
      const jornada = item.jornada || 'Sin jornada';
      const fecha = item.fecha;
      if (!jornadaFechaMap[jornada] || fecha < jornadaFechaMap[jornada]) {
        jornadaFechaMap[jornada] = fecha;
      }
    });

    // 4.2. Función para ordenar jornadas cronológicamente
    const ordenarJornadasCronologicamente = (jornadas) => {
      return jornadas.sort((a, b) => {
        const fechaA = jornadaFechaMap[a];
        const fechaB = jornadaFechaMap[b];

        // Primero ordenar por fecha
        if (fechaA !== fechaB) {
          return fechaA < fechaB ? -1 : 1;
        }

        // Si la fecha es la misma, ordenar por hora de inicio de la jornada
        const horaInicioA = parseInt(a.split(' ')[0]);
        const horaInicioB = parseInt(b.split(' ')[0]);

        // Las jornadas nocturnas (>= 12) van antes que las de madrugada (< 12)
        const esNocturnaA = horaInicioA >= 12;
        const esNocturnaB = horaInicioB >= 12;

        if (esNocturnaA && !esNocturnaB) return -1;
        if (!esNocturnaA && esNocturnaB) return 1;

        return horaInicioA - horaInicioB;
      });
    };

    // 5. Crear tabs de jornadas
    let jornadaActual = ordenarJornadasCronologicamente(Object.keys(jornadasMap))[0]; // Primera jornada cronológica por defecto

    const renderJornadasTabs = () => {
      if (!jornadasTabsContainer) return;

      jornadasTabsContainer.className = 'tablon-jornadas-tabs';
      jornadasTabsContainer.innerHTML = '';

      ordenarJornadasCronologicamente(Object.keys(jornadasMap)).forEach(jornada => {
        const chapasEnJornada = Object.values(jornadasMap[jornada]).reduce((sum, empresaData) => {
          // Contar chapas en barcos
          const chapasBarcos = Object.values(empresaData.barcos).reduce((s, buque) => {
            return s + Object.values(buque).reduce((ss, especialidades) => {
              return ss + especialidades.length;
            }, 0);
          }, 0);

          // Contar chapas en trincadores
          const chapasTrincadores = Object.values(empresaData.trincadores).reduce((s, especialidades) => {
            return s + especialidades.length;
          }, 0);

          // Contar chapas en R/E
          const chapasRE = Object.values(empresaData.re).reduce((s, especialidades) => {
            return s + especialidades.length;
          }, 0);

          return sum + chapasBarcos + chapasTrincadores + chapasRE;
        }, 0);

        const tab = document.createElement('div');
        tab.className = `tablon-jornada-tab ${jornada === jornadaActual ? 'active' : ''}`;
        tab.innerHTML = `
          <div>${jornada}</div>
          <div class="tablon-jornada-count">${chapasEnJornada} asignaciones</div>
        `;
        tab.onclick = () => {
          jornadaActual = jornada;
          renderJornadasTabs();
          renderTablonParaJornada(jornada);
        };
        jornadasTabsContainer.appendChild(tab);
      });
    };

    // Función para mostrar modal de asignación
    const mostrarModalChapa = (chapaData) => {
      if (!modal || !modalTitle || !modalContent) return;

      modalTitle.textContent = chapaData.chapa;
      modalContent.innerHTML = `
        <div class="tablon-modal-parte-info">
          <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--puerto-blue); margin-bottom: 1rem;">Información del Parte</h4>
          <div class="tablon-modal-info-row">
            <span class="tablon-modal-info-label">Asignación:</span>
            <span class="tablon-modal-info-value">${chapaData.chapa || '—'}</span>
          </div>
          <div class="tablon-modal-info-row">
            <span class="tablon-modal-info-label">Empresa:</span>
            <span class="tablon-modal-info-value">${chapaData.empresa || '—'}</span>
          </div>
          <div class="tablon-modal-info-row">
            <span class="tablon-modal-info-label">Buque:</span>
            <span class="tablon-modal-info-value">${chapaData.buque || '—'}</span>
          </div>
          <div class="tablon-modal-info-row">
            <span class="tablon-modal-info-label">Parte:</span>
            <span class="tablon-modal-info-value">${chapaData.parte || '—'}</span>
          </div>
          <div class="tablon-modal-info-row">
            <span class="tablon-modal-info-label">Puesto:</span>
            <span class="tablon-modal-info-value">${chapaData.puesto || '—'}</span>
          </div>
          <div class="tablon-modal-info-row">
            <span class="tablon-modal-info-label">Jornada:</span>
            <span class="tablon-modal-info-value">${chapaData.jornada || '—'}</span>
          </div>
        </div>
      `;

      modal.style.display = 'flex';
    };

    // 6. Función para renderizar tablón para una jornada específica
    const renderTablonParaJornada = (jornada) => {
      container.innerHTML = '';

      const empresasEnJornada = jornadasMap[jornada];
      if (!empresasEnJornada) return;

      // Actualizar estadísticas para esta jornada
      const chapasJornada = Object.values(empresasEnJornada).reduce((sum, empresaData) => {
        // Contar chapas en barcos
        const chapasBarcos = Object.values(empresaData.barcos).reduce((s, buque) => {
          return s + Object.values(buque).reduce((ss, especialidades) => {
            return ss + especialidades.length;
          }, 0);
        }, 0);

        // Contar chapas en trincadores
        const chapasTrincadores = Object.values(empresaData.trincadores).reduce((s, especialidades) => {
          return s + especialidades.length;
        }, 0);

        // Contar chapas en R/E
        const chapasRE = Object.values(empresaData.re).reduce((s, especialidades) => {
          return s + especialidades.length;
        }, 0);

        return sum + chapasBarcos + chapasTrincadores + chapasRE;
      }, 0);

      const empresasJornada = Object.keys(empresasEnJornada).length;
      const barcosJornada = new Set();
      const especialidadesJornada = new Set();

      Object.values(empresasEnJornada).forEach(empresaData => {
        // Barcos reales
        Object.keys(empresaData.barcos).forEach(buque => barcosJornada.add(buque));
        Object.values(empresaData.barcos).forEach(buque => {
          Object.keys(buque).forEach(especialidad => especialidadesJornada.add(especialidad));
        });

        // Trincadores
        Object.keys(empresaData.trincadores).forEach(especialidad => especialidadesJornada.add(especialidad));

        // R/E
        Object.keys(empresaData.re).forEach(especialidad => especialidadesJornada.add(especialidad));
      });

      if (statsContainer) {
        // Calcular tamaños dinámicos basados en STATS_SIZE_SCALE
        const minWidth = Math.round(140 * STATS_SIZE_SCALE);
        const padding = Math.max(0.5, 1.25 * STATS_SIZE_SCALE);
        const borderRadius = Math.max(6, 12 * STATS_SIZE_SCALE);
        const numberSize = Math.max(1.2, 2 * STATS_SIZE_SCALE);
        const labelSize = Math.max(0.65, 0.85 * STATS_SIZE_SCALE);
        const gap = Math.max(0.5, 1 * STATS_SIZE_SCALE);
        const shadowSize = Math.max(2, 4 * STATS_SIZE_SCALE);

        statsContainer.innerHTML = `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(${minWidth}px, 1fr)); gap: ${gap}rem;">
            <div style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: ${padding}rem; border-radius: ${borderRadius}px; text-align: center; box-shadow: 0 ${shadowSize}px ${shadowSize * 2}px rgba(59, 130, 246, 0.3);">
              <div style="font-size: ${numberSize}rem; font-weight: 700; margin-bottom: 0.25rem;">${chapasJornada}</div>
              <div style="font-size: ${labelSize}rem; opacity: 0.95;">Asignaciones</div>
            </div>
            <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: ${padding}rem; border-radius: ${borderRadius}px; text-align: center; box-shadow: 0 ${shadowSize}px ${shadowSize * 2}px rgba(16, 185, 129, 0.3);">
              <div style="font-size: ${numberSize}rem; font-weight: 700; margin-bottom: 0.25rem;">${empresasJornada}</div>
              <div style="font-size: ${labelSize}rem; opacity: 0.95;">Empresas</div>
            </div>
            <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: ${padding}rem; border-radius: ${borderRadius}px; text-align: center; box-shadow: 0 ${shadowSize}px ${shadowSize * 2}px rgba(245, 158, 11, 0.3);">
              <div style="font-size: ${numberSize}rem; font-weight: 700; margin-bottom: 0.25rem;">${barcosJornada.size}</div>
              <div style="font-size: ${labelSize}rem; opacity: 0.95;">Barcos</div>
            </div>
            <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: ${padding}rem; border-radius: ${borderRadius}px; text-align: center; box-shadow: 0 ${shadowSize}px ${shadowSize * 2}px rgba(139, 92, 246, 0.3);">
              <div style="font-size: ${numberSize}rem; font-weight: 700; margin-bottom: 0.25rem;">${especialidadesJornada.size}</div>
              <div style="font-size: ${labelSize}rem; opacity: 0.95;">Especialidades</div>
            </div>
          </div>
        `;
      }

      // Renderizar empresas
      let allExpanded = false;

      Object.keys(empresasEnJornada).sort().forEach(empresa => {
        const empresaData = empresasEnJornada[empresa];

        // Calcular total de chapas de la empresa (barcos + trincadores + re)
        const chapasBarcos = Object.values(empresaData.barcos).reduce((sum, buque) => {
          return sum + Object.values(buque).reduce((s, chapas) => s + chapas.length, 0);
        }, 0);
        const chapasTrincadores = Object.values(empresaData.trincadores).reduce((sum, chapas) => sum + chapas.length, 0);
        const chapasRE = Object.values(empresaData.re).reduce((sum, chapas) => sum + chapas.length, 0);
        const totalChapasEmpresa = chapasBarcos + chapasTrincadores + chapasRE;

        // Contar elementos (barcos + grupos especiales)
        const numBarcos = Object.keys(empresaData.barcos).length;
        const tieneTrincadores = Object.keys(empresaData.trincadores).length > 0;
        const tieneRE = Object.keys(empresaData.re).length > 0;

        // Construir etiqueta específica
        let etiquetaElementos = '';
        if (numBarcos > 0) {
          etiquetaElementos = `${numBarcos} barcos`;
          if (tieneTrincadores && tieneRE) {
            etiquetaElementos += ' + Trincadores + R/E';
          } else if (tieneTrincadores) {
            etiquetaElementos += ' + Trincadores';
          } else if (tieneRE) {
            etiquetaElementos += ' + R/E';
          }
        } else {
          // Solo grupos especiales, sin barcos
          if (tieneTrincadores && tieneRE) {
            etiquetaElementos = 'Trincadores + R/E';
          } else if (tieneTrincadores) {
            etiquetaElementos = 'Trincadores';
          } else if (tieneRE) {
            etiquetaElementos = 'R/E';
          }
        }

      // Card de empresa
      const empresaCard = document.createElement('div');
      empresaCard.className = 'tablon-empresa-card';
      empresaCard.dataset.empresa = empresa.toLowerCase();

      // Header de empresa
      const empresaHeader = document.createElement('div');
      empresaHeader.className = 'tablon-empresa-header';

      // Logo
      const logoDiv = document.createElement('div');
      logoDiv.className = 'tablon-empresa-logo';

      const empresaUpper = empresa.toUpperCase().trim();
      const logoUrl = empresaLogos[empresaUpper];

      if (logoUrl) {
        const img = document.createElement('img');
        img.src = logoUrl;
        img.alt = empresa;
        img.onerror = () => {
          logoDiv.innerHTML = `<div class="tablon-empresa-logo-fallback">${empresa}</div>`;
        };
        logoDiv.appendChild(img);
      } else {
        logoDiv.innerHTML = `<div class="tablon-empresa-logo-fallback">${empresa}</div>`;
      }

      empresaHeader.appendChild(logoDiv);

      // Info de empresa
      const empresaInfo = document.createElement('div');
      empresaInfo.className = 'tablon-empresa-info';
      empresaInfo.innerHTML = `
          <div class="tablon-empresa-nombre">${empresa}</div>
          <div class="tablon-empresa-stats">${totalChapasEmpresa} asignaciones en ${etiquetaElementos}</div>
        `;
        empresaHeader.appendChild(empresaInfo);

      // Toggle icon
      const toggleIcon = document.createElement('svg');
      toggleIcon.className = 'tablon-empresa-toggle';
      toggleIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      toggleIcon.setAttribute('fill', 'none');
      toggleIcon.setAttribute('viewBox', '0 0 24 24');
      toggleIcon.setAttribute('stroke', 'currentColor');
      toggleIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />';
      empresaHeader.appendChild(toggleIcon);

      empresaHeader.addEventListener('click', () => {
        empresaCard.classList.toggle('expanded');
      });

      empresaCard.appendChild(empresaHeader);

      // Contenido de empresa (barcos + grupos especiales)
      const empresaContent = document.createElement('div');
      empresaContent.className = 'tablon-empresa-content';

        // Función auxiliar para renderizar un grupo (barco o grupo especial)
        const renderGrupo = (nombre, especialidadesGrupo, icono, etiqueta) => {

          // Calcular total de chapas primero (para usarlo en el header)
          const totalChapasGrupo = Object.values(especialidadesGrupo).reduce((sum, chapas) => sum + chapas.length, 0);

          // Card del grupo (barco o grupo especial)
          const buqueCard = document.createElement('div');
          buqueCard.className = 'tablon-buque-card';
          buqueCard.dataset.buque = nombre.toLowerCase();

          // Header del grupo
          const buqueHeader = document.createElement('div');
          buqueHeader.className = 'tablon-buque-header';
          buqueHeader.innerHTML = `
            ${icono}
            <div class="tablon-buque-nombre">${nombre}</div>
            <div style="margin-left: auto; margin-right: 0.5rem; font-size: 0.875rem; font-weight: 600; color: var(--puerto-blue); background: rgba(37, 99, 235, 0.1); padding: 0.25rem 0.75rem; border-radius: 12px;">${totalChapasGrupo} asignaciones</div>
            <svg class="tablon-buque-toggle" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          `;

          buqueHeader.addEventListener('click', () => {
            buqueCard.classList.toggle('expanded');
          });

          buqueCard.appendChild(buqueHeader);

          // Panel del grupo (se muestra al expandir)
          const buquePanel = document.createElement('div');
          buquePanel.className = 'tablon-buque-panel';

          // Header del panel con imagen
          const panelHeader = document.createElement('div');
          panelHeader.className = 'tablon-buque-header-panel';

          // Imagen del grupo (diferente para cada tipo)
          const grupoImage = nombre === 'Trincadores'
            ? 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=400&h=300&fit=crop' // Imagen de trincado
            : nombre === 'R/E'
            ? 'https://i.imgur.com/d4sdfOn.jpeg' // Imagen personalizada R/E
            : 'https://i.imgur.com/guKCoFy.jpeg'; // Imagen de barco con grúas (original)

          panelHeader.innerHTML = `
            <div class="tablon-buque-image">
              <img src="${grupoImage}" alt="${nombre}">
            </div>
            <div class="tablon-buque-info-panel">
              <div class="tablon-buque-nombre-panel">${etiqueta || nombre}</div>
              <div class="tablon-buque-stats-panel">
                <div class="tablon-buque-stat">${totalChapasGrupo} asignaciones</div>
                <div class="tablon-buque-stat">${Object.keys(especialidadesGrupo).length} especialidades</div>
                <div class="tablon-buque-stat">Jornada: ${jornada}</div>
              </div>
            </div>
          `;

          buquePanel.appendChild(panelHeader);

          // Contenedor de especialidades
          const especialidadesContainer = document.createElement('div');
          especialidadesContainer.className = 'tablon-especialidades-container';

          Object.keys(especialidadesGrupo).sort().forEach(especialidad => {
            const chapasEspecialidad = especialidadesGrupo[especialidad];

            // Grupo de especialidad
            const especialidadGroup = document.createElement('div');
            especialidadGroup.className = 'tablon-especialidad-group';

            // Función para obtener emoji de especialidad
            const getEspecialidadEmoji = (esp) => {
              const espLower = esp.toLowerCase();
              if (espLower.includes('especialista')) return '👷';
              if (espLower.includes('conductor de 1a') || espLower.includes('conductor de 1ª')) return '🚛';
              if (espLower.includes('conductor de 2a') || espLower.includes('conductor de 2ª')) return '🚗';
              if (espLower.includes('trincador')) return '👷';
              return '👷'; // Default
            };

            const especialidadHeader = document.createElement('div');
            especialidadHeader.className = 'tablon-especialidad-header';
            especialidadHeader.innerHTML = `
              <span style="font-size: 1.5rem; margin-right: 0.5rem;">${getEspecialidadEmoji(especialidad)}</span>
              ${especialidad} <span style="font-weight: normal; color: var(--text-secondary); font-size: 0.9rem;">(${chapasEspecialidad.length} asignaciones)</span>
            `;

            especialidadGroup.appendChild(especialidadHeader);

            // Grid de chapas compacto
            const chapasGrid = document.createElement('div');
            chapasGrid.className = 'tablon-chapas-compact-grid';

            chapasEspecialidad.forEach(chapaData => {
              const chapaCompact = document.createElement('div');
              chapaCompact.className = 'tablon-chapa-compact';
              chapaCompact.dataset.chapa = chapaData.chapa;
              chapaCompact.dataset.empresa = empresa.toLowerCase();
              chapaCompact.dataset.buque = nombre.toLowerCase();
              chapaCompact.dataset.especialidad = especialidad.toLowerCase();

              chapaCompact.innerHTML = `
                <div class="tablon-chapa-compact-numero">${chapaData.chapa}</div>
                <div class="tablon-chapa-compact-jornada">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ${chapaData.jornada || jornada}
                </div>
              `;

              chapaCompact.onclick = () => {
                mostrarModalChapa(chapaData);
              };

              chapasGrid.appendChild(chapaCompact);
            });

            especialidadGroup.appendChild(chapasGrid);
            especialidadesContainer.appendChild(especialidadGroup);
          });

          buquePanel.appendChild(especialidadesContainer);

          // Envolver panel en el contenido del buque
          const buqueContent = document.createElement('div');
          buqueContent.className = 'tablon-buque-content';
          buqueContent.appendChild(buquePanel);

          buqueCard.appendChild(buqueContent);
          empresaContent.appendChild(buqueCard);
        }; // Fin de renderGrupo

        // 1. Renderizar barcos reales
        Object.keys(empresaData.barcos).sort().forEach(buque => {
          const iconoBarco = '<svg class="tablon-buque-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>';
          renderGrupo(buque, empresaData.barcos[buque], iconoBarco);
        });

        // 2. Renderizar grupo especial "Trincadores" (si existe)
        if (Object.keys(empresaData.trincadores).length > 0) {
          const iconoTrincadores = '<span style="font-size: 1.5rem; margin-right: 0.5rem;">👷</span>';
          renderGrupo('Trincadores', empresaData.trincadores, iconoTrincadores, '🔗 Trincadores');
        }

        // 3. Renderizar grupo especial "R/E" (si existe)
        if (Object.keys(empresaData.re).length > 0) {
          const iconoRE = '<span style="font-size: 1.5rem; margin-right: 0.5rem;">📋</span>';
          renderGrupo('R/E', empresaData.re, iconoRE, '📋 R/E - Personal OC');
        }

      empresaCard.appendChild(empresaContent);
      container.appendChild(empresaCard);
    });

      // Botón expandir/colapsar
      if (expandAllBtn) {
        expandAllBtn.onclick = () => {
          allExpanded = !allExpanded;
          const empresaCards = container.querySelectorAll('.tablon-empresa-card');
          const buqueCards = container.querySelectorAll('.tablon-buque-card');

          if (allExpanded) {
            empresaCards.forEach(card => card.classList.add('expanded'));
            buqueCards.forEach(card => card.classList.add('expanded'));
            expandAllBtn.textContent = 'Colapsar Todo';
          } else {
            empresaCards.forEach(card => card.classList.remove('expanded'));
            buqueCards.forEach(card => card.classList.remove('expanded'));
            expandAllBtn.textContent = 'Expandir Todo';
          }
        };
      }

      // Poblar filtros con opciones únicas
      const empresasSet = new Set();
      const buquesSet = new Set();
      const especialidadesSet = new Set();

      Object.keys(empresasEnJornada).forEach(empresa => {
        empresasSet.add(empresa);

        const empresaData = empresasEnJornada[empresa];

        // Agregar buques reales (de la sección 'barcos')
        Object.keys(empresaData.barcos).forEach(buque => {
          buquesSet.add(buque);

          // Agregar especialidades de este buque
          Object.keys(empresaData.barcos[buque]).forEach(especialidad => {
            especialidadesSet.add(especialidad);
          });
        });

        // Agregar especialidades de trincadores
        Object.keys(empresaData.trincadores).forEach(especialidad => {
          especialidadesSet.add(especialidad);
        });

        // Agregar especialidades de R/E
        Object.keys(empresaData.re).forEach(especialidad => {
          especialidadesSet.add(especialidad);
        });
      });

      if (filterEmpresa) {
        filterEmpresa.innerHTML = '<option value="">Todas las empresas</option>';
        Array.from(empresasSet).sort().forEach(empresa => {
          const option = document.createElement('option');
          option.value = empresa.toLowerCase();
          option.textContent = empresa;
          filterEmpresa.appendChild(option);
        });
      }

      if (filterBuque) {
        filterBuque.innerHTML = '<option value="">Todos los barcos</option>';
        Array.from(buquesSet).sort().forEach(buque => {
          const option = document.createElement('option');
          option.value = buque.toLowerCase();
          option.textContent = buque;
          filterBuque.appendChild(option);
        });
      }

      if (filterEspecialidad) {
        filterEspecialidad.innerHTML = '<option value="">Todas las especialidades</option>';
        Array.from(especialidadesSet).sort().forEach(especialidad => {
          const option = document.createElement('option');
          option.value = especialidad.toLowerCase();
          // Primera letra en mayúscula
          option.textContent = especialidad.charAt(0).toUpperCase() + especialidad.slice(1).toLowerCase();
          filterEspecialidad.appendChild(option);
        });
      }

      // Función de filtrado combinado
      const aplicarFiltros = () => {
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const empresaFilter = filterEmpresa ? filterEmpresa.value : '';
        const buqueFilter = filterBuque ? filterBuque.value : '';
        const especialidadFilter = filterEspecialidad ? filterEspecialidad.value : '';

        const empresaCards = container.querySelectorAll('.tablon-empresa-card');

        empresaCards.forEach(empresaCard => {
          let empresaHasMatch = false;

          const buqueCards = empresaCard.querySelectorAll('.tablon-buque-card');
          buqueCards.forEach(buqueCard => {
            let buqueHasMatch = false;

            const chapaCards = buqueCard.querySelectorAll('.tablon-chapa-compact');
            chapaCards.forEach(chapaCard => {
              const chapa = chapaCard.dataset.chapa || '';
              const empresa = chapaCard.dataset.empresa || '';
              const buque = chapaCard.dataset.buque || '';
              const especialidad = chapaCard.dataset.especialidad || '';

              // Aplicar todos los filtros
              const matchChapa = !searchTerm || chapa.includes(searchTerm);
              const matchEmpresa = !empresaFilter || empresa === empresaFilter;
              const matchBuque = !buqueFilter || buque === buqueFilter;
              const matchEspecialidad = !especialidadFilter || especialidad === especialidadFilter;

              const matches = matchChapa && matchEmpresa && matchBuque && matchEspecialidad;

              chapaCard.style.display = matches ? '' : 'none';
              if (matches) buqueHasMatch = true;
            });

            buqueCard.style.display = buqueHasMatch ? '' : 'none';
            if (buqueHasMatch) empresaHasMatch = true;
          });

          empresaCard.style.display = empresaHasMatch ? '' : 'none';
        });
      };

      // Event listeners para filtros
      if (searchInput) searchInput.oninput = aplicarFiltros;
      if (filterEmpresa) filterEmpresa.onchange = aplicarFiltros;
      if (filterBuque) filterBuque.onchange = aplicarFiltros;
      if (filterEspecialidad) filterEspecialidad.onchange = aplicarFiltros;

      // Botón limpiar filtros
      if (clearFiltersBtn) {
        clearFiltersBtn.onclick = () => {
          if (searchInput) searchInput.value = '';
          if (filterEmpresa) filterEmpresa.value = '';
          if (filterBuque) filterBuque.value = '';
          if (filterEspecialidad) filterEspecialidad.value = '';
          aplicarFiltros();
        };
      }
    };

    // Inicializar
    renderJornadasTabs();
    renderTablonParaJornada(jornadaActual);

  } catch (error) {
    console.error('Error cargando tablón:', error);
    loading.classList.add('hidden');
    container.innerHTML = `
      <div class="empty-state">
        <h3>Error al cargar datos</h3>
        <p>No se pudo cargar el tablón de contratación. Por favor, intenta de nuevo más tarde.</p>
      </div>
    `;
  }
}

/**
 * Renderiza los enlaces
 */
function renderEnlaces() {
  const container = document.getElementById('enlaces-content');
  if (!container) return;

  // Limpiar contenedor para evitar duplicados
  container.innerHTML = '';

  const categorias = [...new Set(ENLACES_DATA.map(e => e.categoria))];

  categorias.forEach(categoria => {
    const section = document.createElement('div');
    section.className = 'enlaces-section';

    const title = document.createElement('h3');
    title.textContent = categoria;
    section.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'enlaces-grid';

    const enlaces = ENLACES_DATA.filter(e => e.categoria === categoria);
    enlaces.forEach(enlace => {
      const a = document.createElement('a');
      a.href = enlace.url;
      a.className = `enlace-btn ${enlace.color}`;
      a.textContent = enlace.titulo;

      // Si tiene modal, abrir modal en lugar de link externo
      if (enlace.modal) {
        a.href = '#';
        a.addEventListener('click', (e) => {
          e.preventDefault();
          const modal = document.getElementById(`${enlace.modal}-modal`);
          if (modal) {
            modal.style.display = 'flex';
          }
        });
      } else {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }

      grid.appendChild(a);
    });

    section.appendChild(grid);
    container.appendChild(section);
  });
}

/**
 * Renderiza las noticias
 */
function renderNoticias() {
  const container = document.getElementById('noticias-content');
  if (!container) return;

  // Limpiar contenedor para evitar duplicados
  container.innerHTML = '';

  NOTICIAS_DATA.forEach(noticia => {
    const card = document.createElement('div');
    card.className = 'noticia-card';
    card.innerHTML = `
      <div class="noticia-header">
        <div class="noticia-titulo">${noticia.titulo || noticia.titular}</div>
        <div class="noticia-fecha">${noticia.fecha}</div>
      </div>
      <div class="noticia-contenido">${noticia.contenido}</div>
    `;
    container.appendChild(card);
  });
}

/**
 * Carga el foro - Intenta cargar desde Google Sheets primero
 */
async function loadForo() {
  const container = document.getElementById('foro-messages');
  if (!container) return;

  // Mostrar loading
  container.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-secondary);">Cargando mensajes...</div>';

  try {
    // Actualizar nombres de usuarios en cache
    await actualizarCacheNombres();

    // 1. PRIORIDAD: Cargar desde Supabase
    console.log('📥 Cargando mensajes del foro desde Supabase...');
    const supabaseMessages = await SheetsAPI.getForoMensajes(); // SheetsAPI (en supabase.js)

    if (supabaseMessages && supabaseMessages.length > 0) {
      console.log(`✅ ${supabaseMessages.length} mensajes cargados desde Supabase`);
      renderForoMessages(supabaseMessages);
      // Actualizar localStorage como backup
      localStorage.setItem('foro_messages', JSON.stringify(supabaseMessages));
    } else {
      // 2. FALLBACK: usar localStorage si Supabase está vacío
      console.log('⚠️ No hay mensajes en Supabase, usando localStorage');
      const localMessages = getForoMessagesLocal();
      renderForoMessages(localMessages);
    }
  } catch (error) {
    console.error('❌ Error cargando foro desde Supabase:', error);
    // FALLBACK: localStorage
    const localMessages = getForoMessagesLocal();
    renderForoMessages(localMessages);
  }
}

/**
 * Actualiza el cache de nombres de usuarios desde el sheet
 */
async function actualizarCacheNombres() {
  try {
    const usuarios = await SheetsAPI.getUsuarios(); // SheetsAPI (en supabase.js)
    const usuariosCache = {};

    usuarios.forEach(u => {
      if (u.chapa && u.nombre) {
        usuariosCache[u.chapa] = u.nombre;
      }
    });

    localStorage.setItem('usuarios_cache', JSON.stringify(usuariosCache));
    console.log('✅ Cache de nombres actualizado');
  } catch (error) {
    console.error('Error actualizando cache de nombres:', error);
  }
}

/**
 * Obtiene mensajes del foro desde localStorage
 */
function getForoMessagesLocal() {
  const stored = localStorage.getItem('foro_messages');
  if (stored) {
    return JSON.parse(stored);
  }

  // Sin mensajes iniciales - foro vacío
  const initialMessages = [];

  localStorage.setItem('foro_messages', JSON.stringify(initialMessages));
  return initialMessages;
}

/**
 * Renderiza mensajes del foro
 */
function renderForoMessages(messages) {
  const container = document.getElementById('foro-messages');
  if (!container) return;

  container.innerHTML = '';

  // Ordenar por timestamp (más ANTIGUOS primero, recientes ABAJO como WhatsApp)
  const sorted = messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Obtener nombres de usuarios del cache
  const usuariosCache = JSON.parse(localStorage.getItem('usuarios_cache') || '{}');

  sorted.forEach(msg => {
    // Normalizar chapa (quitar "0" inicial si es de 5 dígitos: 80983 → 983)
    let chapaOriginal = msg.chapa.toString();
    let chapaNormalizada = chapaOriginal;

    // Si la chapa empieza con "0" o "80" y tiene más de 3 dígitos, normalizarla
    if (chapaOriginal.length >= 4 && chapaOriginal.startsWith('80')) {
      // 80983 → 983, 80784 → 784, etc.
      chapaNormalizada = chapaOriginal.substring(2);
    } else if (chapaOriginal.length >= 4 && chapaOriginal.startsWith('0')) {
      // 0983 → 983, 0784 → 784, etc.
      chapaNormalizada = chapaOriginal.substring(1);
    }

    const isOwn = chapaNormalizada === AppState.currentUser;
    const timeAgo = getTimeAgo(new Date(msg.timestamp));

    // Obtener nombre del usuario (del cache usando chapa normalizada o fallback a chapa normalizada)
    const nombreUsuario = usuariosCache[chapaNormalizada] || `Chapa ${chapaNormalizada}`;

    const messageDiv = document.createElement('div');
    messageDiv.className = `foro-message ${isOwn ? 'own' : ''}`;
    messageDiv.innerHTML = `
      <div class="foro-message-content">
        <div class="foro-message-header">
          <span class="foro-message-chapa">${nombreUsuario}</span>
          <span class="foro-message-time">${timeAgo}</span>
        </div>
        <div class="foro-message-text" style="white-space: pre-wrap;">${escapeHtml(msg.texto)}</div>
      </div>
    `;

    container.appendChild(messageDiv);
  });

  // Scroll automático al final para ver mensajes recientes (como WhatsApp)
  // Usar requestAnimationFrame para asegurar que el DOM esté renderizado
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // Hacer scroll al final del contenedor para ver todos los mensajes
      container.scrollTop = container.scrollHeight;
    });
  });
}

/**
 * Envía un mensaje al foro - Intenta enviar a Google Sheets si está configurado
 */
async function sendForoMessage() {
  const input = document.getElementById('foro-input');
  const sendBtn = document.getElementById('foro-send');

  if (!input || !sendBtn) return;

  const texto = input.value.trim();
  if (!texto) return;

  // Prevenir múltiples envíos
  if (sendBtn.disabled) return;

  // Deshabilitar controles y mostrar feedback visual
  input.disabled = true;
  sendBtn.disabled = true;

  // Guardar el contenido original del botón
  const originalBtnHTML = sendBtn.innerHTML;

  // Mostrar indicador de carga
  sendBtn.innerHTML = `
    <svg style="width: 20px; height: 20px; animation: spin 1s linear infinite;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path style="opacity: 0.75;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <span style="margin-left: 8px;">Enviando...</span>
  `;

  const newMessage = {
    id: Date.now(),
    chapa: AppState.currentUser,
    timestamp: new Date().toISOString(),
    texto: texto
  };

  // Añadir mensaje inmediatamente a la vista (optimistic update)
  const messages = getForoMessagesLocal();
  messages.push(newMessage);
  localStorage.setItem('foro_messages', JSON.stringify(messages));
  renderForoMessages(messages);

  // Limpiar input inmediatamente
  input.value = '';

  // Scroll al final
  const container = document.getElementById('foro-messages');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }

  // Enviar a Supabase en segundo plano (asumiendo SheetsAPI.enviarMensajeForo ahora usa Supabase)
  try {
    const sentToCloud = await SheetsAPI.enviarMensajeForo(AppState.currentUser, texto); 

    if (sentToCloud) {
      console.log('✅ Mensaje guardado en Supabase');

      // Mostrar feedback visual breve de éxito
      sendBtn.innerHTML = `
        <svg style="width: 20px; height: 20px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span style="margin-left: 8px;">Enviado</span>
      `;

      setTimeout(() => {
        sendBtn.innerHTML = originalBtnHTML;
        input.disabled = false;
        sendBtn.disabled = false;
        input.focus();
      }, 800);
    } else {
      console.log('⚠️ No se pudo enviar al servidor, guardado localmente');
      // Restaurar botón
      sendBtn.innerHTML = originalBtnHTML;
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
    }
  } catch (error) {
    console.error('❌ Error enviando mensaje al servidor:', error);
    // El mensaje ya está visible localmente, solo restauramos el botón
    sendBtn.innerHTML = originalBtnHTML;
    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
  }
}

/**
 * Scroll suave hacia el final del foro
 */
function scrollToBottomForo() {
  const container = document.getElementById('foro-messages');
  if (container) {
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth'
    });
  }
}

/**
 * Inicializa la detección de scroll en el foro
 */
function initForoScrollDetection() {
  const container = document.getElementById('foro-messages');
  const scrollBtn = document.getElementById('scroll-to-bottom-btn');

  if (!container || !scrollBtn) return;

  // Función para verificar la posición del scroll
  const checkScrollPosition = () => {
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    if (isNearBottom) {
      scrollBtn.style.display = 'none';
    } else {
      scrollBtn.style.display = 'flex';
    }
  };

  // Agregar event listener al scroll del container
  container.addEventListener('scroll', checkScrollPosition);

  // Verificar posición inicial
  checkScrollPosition();
}

// Agregar estilo de animación spin si no existe
if (!document.getElementById('spin-animation-style')) {
  const style = document.createElement('style');
  style.id = 'spin-animation-style';
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Calcula el tiempo transcurrido
 */
function getTimeAgo(date) {
  // Validar que date es una fecha válida
  if (!date || isNaN(date.getTime())) {
    return 'Fecha desconocida';
  }

  const seconds = Math.floor((new Date() - date) / 1000);

  // Si la fecha es futura o muy antigua, mostrar fecha formateada
  if (seconds < 0 || seconds > 31536000) { // Más de 1 año
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (seconds < 60) return 'Ahora mismo';
  if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} h`;
  if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)} días`;

  return date.toLocaleDateString('es-ES');
}

/**
 * Escapa HTML para prevenir XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Exponer funciones globalmente si es necesario
window.AppState = AppState;
window.navigateTo = navigateTo;

/**
 * Función de utilidad para agregar contrataciones manualmente al histórico
 * Uso desde consola del navegador:
 *
 * agregarContratacionesManual([
 *   { chapa: '123', fecha: '2025-11-03', jornada: '14-20', puesto: 'Grúa', empresa: 'APM', buque: 'Buque 1', parte: '1', logo_empresa_url: '' },
 *   { chapa: '456', fecha: '2025-11-03', jornada: '14-20', puesto: 'Capataz', empresa: 'MSC', buque: 'Buque 2', parte: '2', logo_empresa_url: '' }
 * ])
 */
window.agregarContratacionesManual = function(contrataciones) {
  if (!Array.isArray(contrataciones)) {
    console.error('❌ Debes pasar un array de contrataciones');
    console.log('Ejemplo de uso:');
    console.log('agregarContratacionesManual([');
    console.log('  { chapa: "123", fecha: "2025-11-03", jornada: "14-20", puesto: "Grúa", empresa: "APM", buque: "Buque 1", parte: "1", logo_empresa_url: "" }');
    console.log('])');
    return;
  }

  const historico = JSON.parse(localStorage.getItem('jornales_historico') || '[]');
  let agregadas = 0;

  contrataciones.forEach(contratacion => {
    // Verificar que tenga los campos requeridos
    if (!contratacion.chapa || !contratacion.fecha || !contratacion.jornada) {
      console.warn('⚠️ Contratación incompleta (falta chapa, fecha o jornada):', contratacion);
      return;
    }

    // Verificar si ya existe (evitar duplicados)
    const existe = historico.some(h =>
      h.fecha === contratacion.fecha &&
      h.jornada === contratacion.jornada &&
      h.puesto === contratacion.puesto &&
      h.chapa === contratacion.chapa
    );

    if (!existe) {
      historico.push({
        chapa: contratacion.chapa,
        fecha: contratacion.fecha,
        jornada: contratacion.jornada,
        puesto: contratacion.puesto || '',
        empresa: contratacion.empresa || '',
        buque: contratacion.buque || '',
        parte: contratacion.parte || '',
        logo_empresa_url: contratacion.logo_empresa_url || ''
      });
      agregadas++;
    } else {
      console.log(`⏭️ Contratación duplicada ignorada: ${contratacion.chapa} - ${contratacion.fecha} - ${contratacion.jornada}`);
    }
  });

  localStorage.setItem('jornales_historico', JSON.stringify(historico));
  console.log(`✅ Agregadas ${agregadas} contrataciones nuevas`);
  console.log(`📊 Total en histórico: ${historico.length} jornales`);

  return { agregadas, total: historico.length };
};

/**
 * ===== SUELDÓMETRO =====
 */

/**
 * Determina el tipo de día basado en fecha y jornada
 * Maneja jornadas nocturnas que cruzan medianoche (02-08, 20-02)
 */
function determinarTipoDia(fecha, jornada) {
  // Parsear fecha: soportar tanto dd/mm/yyyy como yyyy-mm-dd (ISO)
  let day, month, year;

  if (fecha.includes('/')) {
    // Formato español: dd/mm/yyyy
    const parts = fecha.split('/');
    day = parseInt(parts[0]);
    month = parseInt(parts[1]) - 1; // JavaScript months are 0-indexed
    year = parseInt(parts[2]);
  } else if (fecha.includes('-')) {
    // Formato ISO: yyyy-mm-dd
    const parts = fecha.split('-');
    year = parseInt(parts[0]);
    month = parseInt(parts[1]) - 1; // JavaScript months are 0-indexed
    day = parseInt(parts[2]);
  } else {
    // Formato desconocido, intentar como objeto Date
    const date = new Date(fecha);
    if (!isNaN(date.getTime())) {
      year = date.getFullYear();
      month = date.getMonth();
      day = date.getDate();
    } else {
      console.error('Formato de fecha no válido en determinarTipoDia:', fecha);
      return 'LABORABLE'; // Default fallback
    }
  }

  const dateObj = new Date(year, month, day);

  // Festivos de España 2025 (ajustar según sea necesario)
  const festivos2025 = [
    '01/01/2025', '06/01/2025', // Año Nuevo, Reyes
    '18/04/2025', '19/04/2025', // Viernes Santo, Sábado Santo
    '01/05/2025', // Día del Trabajador
    '15/08/2025', // Asunción
    '12/10/2025', // Día de la Hispanidad
    '01/11/2025', // Todos los Santos
    '06/12/2025', '08/12/2025', // Constitución, Inmaculada
    '25/12/2025'  // Navidad
  ];

  const esFestivoFecha = (d) => {
    const fechaNorm = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    return festivos2025.includes(fechaNorm) || d.getDay() === 0; // Festivo oficial o domingo
  };

  const dayOfWeek = dateObj.getDay(); // 0=Domingo, 6=Sábado
  const esFestivoHoy = esFestivoFecha(dateObj);

  // Para jornadas nocturnas (02-08, 20-02) que cruzan medianoche
  if (jornada === '02-08' || jornada === '20-02') {
    const diaSiguiente = new Date(dateObj);
    diaSiguiente.setDate(diaSiguiente.getDate() + 1);
    const esFestivoManana = esFestivoFecha(diaSiguiente);

    // Para 02-08 también necesitamos revisar el día anterior
    const diaAnterior = new Date(dateObj);
    diaAnterior.setDate(diaAnterior.getDate() - 1);
    const esFestivoAyer = esFestivoFecha(diaAnterior);

    if (jornada === '02-08') {
      // Jornada 02-08: empieza de noche (02:00) y termina por la mañana (08:00)
      // IMPORTANTE: Sábado siempre se considera LABORABLE en jornada 02-08
      if (dayOfWeek === 6) {
        return 'LABORABLE';
      } else if (esFestivoAyer && esFestivoHoy) {
        // NUEVO: Si ayer fue festivo Y hoy también es festivo → FEST-FEST
        // Ejemplo: día 1 noviembre (festivo Todos los Santos) → día 2 noviembre (domingo/festivo)
        return 'FEST-FEST';
      } else if (dayOfWeek === 0) {
        // DOMINGO → Siempre FESTIVO para usar jornal de 375,42€ (02-08_FESTIVO)
        return 'FESTIVO';
      } else if (esFestivoHoy && !esFestivoManana) {
        return 'FEST-LAB';
      } else if (esFestivoManana) {
        return 'FESTIVO';
      } else if (esFestivoAyer && !esFestivoHoy) {
        // Si ayer fue festivo y hoy no → FEST-LAB (ej: domingo festivo → lunes 02-08)
        return 'FEST-LAB';
      } else {
        return 'LABORABLE';
      }
    } else if (jornada === '20-02') {
      // Jornada 20-02: empieza de tarde y termina de madrugada
      // IMPORTANTE: Sábado tiene prioridad sobre LAB-FEST (sábado a domingo)
      if (dayOfWeek === 6) {
        return 'SABADO';
      } else if (!esFestivoHoy && esFestivoManana) {
        return 'LAB-FEST';
      } else if (esFestivoHoy) {
        return 'FESTIVO';
      } else {
        return 'LABORABLE';
      }
    }
  }

  // Para jornadas diurnas (08-14, 14-20)
  if (esFestivoHoy) {
    return 'FESTIVO';
  } else if (dayOfWeek === 6) {
    return 'SABADO';
  } else {
    return 'LABORABLE';
  }
}

/**
 * Mapea el tipo de día y jornada a los valores de la tabla tarifas_trinca_destrinca
 * @param {string} tipoDia - Tipo de día: LABORABLE, FESTIVO, SABADO, FEST-LAB, FEST-FEST, LAB-FEST
 * @param {string} jornada - Jornada: 02-08, 08-14, 14-20, 20-02
 * @returns {object} { horario_trinca, jornada_trinca } - Valores para buscar en la tabla
 */
function mapearTipoDiaParaTrincaDestrinca(tipoDia, jornada) {
  // Mapear jornada a formato de la tabla: "02-08" → "02 a 08 h."
  const horarioMap = {
    '02-08': '02 a 08 h.',
    '08-14': '08 a 14 h.',
    '14-20': '14 a 20 h.',
    '20-02': '20 a 02 h.'
  };

  const horario_trinca = horarioMap[jornada] || jornada;

  // Mapear tipo_dia a jornada de la tabla
  let jornada_trinca;

  switch (tipoDia) {
    case 'LABORABLE':
      jornada_trinca = 'LAB';
      break;
    case 'SABADO':
      jornada_trinca = 'SAB';
      break;
    case 'FESTIVO':
      jornada_trinca = 'FES';
      break;
    case 'FEST-FEST':
      jornada_trinca = 'FES FAF'; // Festivo a Festivo
      break;
    case 'FEST-LAB':
      jornada_trinca = 'FES FAL'; // Festivo a Laborable
      break;
    case 'LAB-FEST':
      jornada_trinca = 'LAB LAF'; // Laborable a Festivo
      break;
    default:
      jornada_trinca = 'LAB'; // Fallback
      break;
  }

  return { horario_trinca, jornada_trinca };
}

/**
 * Busca la tarifa de trinca/destrinca en la tabla
 * @param {array} tarifas - Array de tarifas de trinca/destrinca
 * @param {string} horario - Horario: "02 a 08 h.", "08 a 14 h.", "14 a 20 h.", "20 a 02 h."
 * @param {string} jornada - Jornada: "LAB", "SAB", "FES", "FES FAF", "FES FAL", "LAB LAF"
 * @param {string} tipoOperacion - Tipo de operación: "TRINCA" o "DESTRINCA"
 * @returns {number} Tarifa por barra (0 si no se encuentra)
 */
function buscarTarifaTrincaDestrinca(tarifas, horario, jornada, tipoOperacion) {
  const tarifa = tarifas.find(t =>
    t.horario === horario &&
    t.jornada === jornada
  );

  if (!tarifa) {
    console.warn(`⚠️ No se encontró tarifa para: horario=${horario}, jornada=${jornada}`);
    return 0;
  }

  const tarifaValor = tipoOperacion === 'TRINCA' ? tarifa.tarifa_trinca : tarifa.tarifa_destrinca;
  return parseFloat(tarifaValor) || 0;
}

/**
 * Carga y muestra el Sueldómetro con cálculo de salarios
 */
async function loadSueldometro() {
  const content = document.getElementById('sueldometro-content');
  const loading = document.getElementById('sueldometro-loading');
  const stats = document.getElementById('sueldometro-stats');

  if (!content) return;

  // ============================================================================
  // VERIFICACIÓN DE ACCESO PREMIUM
  // ============================================================================
  if (window.FeatureLock) {
    const featureLock = new window.FeatureLock('sueldometro');
    const isBloqueado = await featureLock.bloquear('#page-sueldometro');

    if (isBloqueado) {
      console.log('🔒 Sueldómetro bloqueado para usuario sin premium');
      loading.classList.add('hidden');
      document.body.style.overflow = 'hidden'; // Bloquear scroll
      return; // No cargar contenido si está bloqueado
    }
  }

  // Desbloquear scroll si tiene acceso
  document.body.style.overflow = '';
  // ============================================================================

  loading.classList.remove('hidden');
  content.innerHTML = '';
  stats.innerHTML = '';

  // ============================================================================
  // OBTENER POSICIÓN DEL USUARIO Y DETERMINAR SI ES SP/OC
  // ============================================================================
  const LIMITE_SP = 455;
  let posicionUsuario = null;
  let esUsuarioOC = false;

  try {
    posicionUsuario = await SheetsAPI.getPosicionChapa(AppState.currentUser);
    esUsuarioOC = posicionUsuario > LIMITE_SP;
    console.log(`👤 Posición del usuario: ${posicionUsuario} → ${esUsuarioOC ? 'OC' : 'SP'}`);
  } catch (error) {
    console.error('❌ Error obteniendo posición del usuario:', error);
    // Si no se puede obtener la posición, asumir SP por defecto
    posicionUsuario = 1;
    esUsuarioOC = false;
  }
  // ============================================================================

  // Inicializar IRPF control
  const irpfControl = document.getElementById('sueldometro-irpf-control');
  const irpfInput = document.getElementById('irpf-input');
  const irpfLockBtn = document.getElementById('irpf-lock-btn');

  // Cargar IRPF guardado o usar valor por defecto (15%)
  const irpfKey = `irpf_${AppState.currentUser}`;
  const irpfLockKey = `irpf_locked_${AppState.currentUser}`;

  // Intentar cargar desde Supabase primero
  let irpfPorcentaje = 15; // Valor por defecto
  try {
    const configUsuario = await SheetsAPI.getUserConfig(AppState.currentUser);
    if (configUsuario && configUsuario.irpf) {
      irpfPorcentaje = configUsuario.irpf;
      console.log(`✅ IRPF cargado desde Supabase: ${irpfPorcentaje}%`);
      // Sincronizar con localStorage
      localStorage.setItem(irpfKey, irpfPorcentaje.toString());
    } else {
      // Si no hay en Supabase, intentar localStorage
      irpfPorcentaje = parseFloat(localStorage.getItem(irpfKey)) || 15;
      console.log(`📦 IRPF cargado desde localStorage: ${irpfPorcentaje}%`);
    }
  } catch (error) {
    console.error('❌ Error cargando IRPF desde Supabase, usando localStorage:', error);
    irpfPorcentaje = parseFloat(localStorage.getItem(irpfKey)) || 15;
  }

  let irpfLocked = localStorage.getItem(irpfLockKey) === 'true';

  console.log(`💰 IRPF cargado: ${irpfPorcentaje}% (bloqueado: ${irpfLocked})`);

  if (irpfInput) {
    irpfInput.value = irpfPorcentaje;
    irpfInput.disabled = irpfLocked;
    if (irpfLocked) {
      irpfInput.style.opacity = '0.7';
      irpfInput.style.background = '#f0f0f0';
      irpfInput.style.cursor = 'not-allowed';
    }
  }

  // Actualizar el valor mostrado en el header del control IRPF
  const irpfDisplayValue = document.getElementById('irpf-display-value');
  if (irpfDisplayValue) irpfDisplayValue.textContent = `${irpfPorcentaje}%`;

  if (irpfLockBtn) {
    irpfLockBtn.textContent = irpfLocked ? '🔒' : '🔓';
    irpfLockBtn.title = irpfLocked ? 'IRPF bloqueado - Click para desbloquear' : 'IRPF desbloqueado - Click para bloquear';
  }

  try {
    // 1. LIMPIAR CACHE DE JORNALES, MAPEO, TABLA SALARIAL Y PRIMAS PARA FORZAR RECARGA FRESCA
    const cacheKeys = Object.keys(localStorage);
    cacheKeys.forEach(key => {
      if (key.startsWith(`supabase_jornales_${AppState.currentUser}`) ||
          key.startsWith(`supabase_primas_${AppState.currentUser}`) ||
          key === 'supabase_mapeo_puestos' ||
          key === 'supabase_tabla_salarios') {
        localStorage.removeItem(key);
      }
    });
    console.log('🗑️ Cache de jornales, primas, mapeo_puestos y tabla_salarios limpiado en Sueldómetro');

    // 1b. SINCRONIZAR PRIMAS PERSONALIZADAS DESDE CSV (si hay URL configurada)
    const primasURL = 'https://docs.google.com/spreadsheets/d/1j-IaOHXoLEP4bK2hjdn2uAYy8a2chqiQSOw4Nfxoyxc/export?format=csv&gid=1977235036';
    if (primasURL) {
      try {
        console.log('🔄 Sincronizando primas personalizadas desde CSV...');
        // Asumiendo que SheetsAPI.syncPrimasPersonalizadasFromCSV ahora invoca la Edge Function de sincronización
        await SheetsAPI.syncPrimasPersonalizadasFromCSV(primasURL); 
      } catch (primasError) {
        console.warn('⚠️ Error sincronizando primas desde CSV:', primasError.message);
        // Continuar de todos modos - usaremos datos existentes en Supabase
      }
    }

    // 2. Cargar datos necesarios
    console.log('📊 Cargando datos del Sueldómetro...');

    const [jornales, mapeoPuestos, tablaSalarial, tarifasTrincaDestrinca] = await Promise.all([
      SheetsAPI.getJornalesHistoricoAcumulado(AppState.currentUser), // SheetsAPI (en supabase.js)
      SheetsAPI.getMapeoPuestos(), // SheetsAPI (en supabase.js)
      SheetsAPI.getTablaSalarial(), // SheetsAPI (en supabase.js)
      SheetsAPI.getTarifasTrincaDestrinca() // NUEVO: Tarifas de trinca/destrinca
    ]);

    const manuales = jornales.filter(j => j.origen === 'manual').length;
    const csvJornales = jornales.filter(j => j.origen === 'csv').length;
    const otros = jornales.length - manuales - csvJornales;
    console.log(`✅ ${jornales.length} jornales: ${csvJornales} del CSV + ${manuales} manuales + ${otros} otros`);
    console.log(`   ${mapeoPuestos.length} puestos, ${tablaSalarial.length} salarios, ${tarifasTrincaDestrinca.length} tarifas trinca/destrinca`);

    if (jornales.length === 0) {
      content.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📊</div>
          <h3>No hay jornales registrados</h3>
          <p>Cuando trabajes tus primeros jornales aparecerán aquí con su estimación salarial</p>
          <p style="margin-top: 1rem;">
            <button id="add-jornal-btn-empty" class="btn-primary">➕ Añadir Jornal Manual</button>
          </p>
        </div>
      `;
      loading.classList.add('hidden');

      // Vincular botón de añadir jornal
      const addBtnEmpty = document.getElementById('add-jornal-btn-empty');
      if (addBtnEmpty) {
        addBtnEmpty.addEventListener('click', () => {
          document.getElementById('add-jornal-modal').style.display = 'flex';
        });
      }
      return;
    }

    // 2. Calcular salario para cada jornal
    const jornalesConSalario = jornales.map((jornal, index) => {
      // Validar que el jornal tenga los campos necesarios
      if (!jornal.jornada || !jornal.puesto || !jornal.fecha) {
        console.warn('⚠️ Jornal incompleto, saltando:', jornal);
        return null;
      }

      // Normalizar jornada: "08 a 14" → "08-14", "20 a 02" → "20-02"
      let jornada = jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, '').trim();

      // Normalizar puesto para comparaciones case-insensitive (eliminar espacios extra)
      const puestoLower = jornal.puesto.trim().replace(/\s+/g, ' ').toLowerCase();

      // 3.1 Buscar en mapeo de puestos usando comparación case-insensitive
      let mapeo = mapeoPuestos.find(m => m.puesto.trim().replace(/\s+/g, ' ').toLowerCase() === puestoLower);

      // Mapeo de fallback para puestos conocidos que pueden no estar en la hoja
      const mapeoFallback = {
        'especialista': { puesto: 'Especialista', grupo_salarial: 'G1', tipo_operativa: 'Contenedor' },
        'trincador': { puesto: 'Trincador', grupo_salarial: 'G1', tipo_operativa: 'Trincador' },
        'trincador de coches': { puesto: 'Trincador de Coches', grupo_salarial: 'G1', tipo_operativa: 'Manual' },
        'conductor de coches': { puesto: 'Conductor de Coches', grupo_salarial: 'G2', tipo_operativa: 'Coches' },
        'conductor de 2a': { puesto: 'Conductor de 2a', grupo_salarial: 'G2', tipo_operativa: 'Coches' }
      };

      if (!mapeo) {
        // Intentar usar mapeo de fallback (búsqueda case-insensitive)
        if (mapeoFallback[puestoLower]) {
          mapeo = mapeoFallback[puestoLower];
          console.log(`ℹ️ Usando mapeo de fallback para: "${jornal.puesto}"`);
        } else {
          console.warn(`⚠️ Puesto no encontrado en mapeo: "${jornal.puesto}"`);
          if (index === 0) {
            console.log('Puestos disponibles en mapeo:', mapeoPuestos.map(m => m.puesto));
          }
          return { ...jornal, salario_base: 0, prima: 0, total: 0, error: 'Puesto no mapeado' };
        }
      }

      // Obtener grupo salarial y tipo de operativa
      let grupoSalarial = mapeo.grupo_salarial; // G1 o G2
      let tipoOperativa = mapeo.tipo_operativa; // Contenedor o Coches

      // Forzar valores correctos para asegurar coherencia
      if (puestoLower === 'conductor de coches' || puestoLower === 'conductor de 2a') {
        grupoSalarial = 'G2';
        tipoOperativa = 'Coches';
      }

      // Forzar G1 para Trincador (N/A en movimientos, prima de tabla)
      if (puestoLower === 'trincador') {
        grupoSalarial = 'G1';
        tipoOperativa = 'Trincador';
      }

      // Forzar G1 para Especialista (120 movimientos por defecto, prima con coeficiente)
      if (puestoLower === 'especialista') {
        grupoSalarial = 'G1';
        tipoOperativa = 'Contenedor'; // Especialista usa Contenedor para mostrar movimientos
      }

      if (puestoLower === 'trincador de coches') {
        grupoSalarial = 'G1';
        tipoOperativa = 'Manual';
      }

      // Forzar G2 para Conductor de 1a (120 movimientos por defecto, prima con coeficiente)
      if (puestoLower === 'conductor de 1a') {
        grupoSalarial = 'G2';
        tipoOperativa = 'Contenedor';
      }

      // Normalizar nombre de puesto para display
      let puestoDisplay = jornal.puesto;
      if (puestoLower === 'conductor de coches') {
        puestoDisplay = 'Conductor de 2a';
      }

      // 3.2 Determinar tipo de día
      const tipoDia = determinarTipoDia(jornal.fecha, jornada);

      // 3.3 Crear clave de jornada (ej: "08-14_LABORABLE")
      const claveJornada = `${jornada}_${tipoDia}`;

      // 3.4 Buscar en tabla salarial
      const salarioInfo = tablaSalarial.find(s => s.clave_jornada === claveJornada);

      if (!salarioInfo) {
        console.error(`❌ Clave de jornada NO encontrada: "${claveJornada}"`);
        console.log('📋 Claves disponibles:', tablaSalarial.map(t => `"${t.clave_jornada}"`).join(', '));
        console.log('🔍 Buscando:', `"${claveJornada}" (Fecha: ${jornal.fecha}, Jornada: ${jornada}, Tipo día: ${tipoDia})`);
        return { ...jornal, salario_base: 0, prima: 0, total: 0, error: `Jornada no encontrada: ${claveJornada}` };
      }

      // Debug del primer jornal
      if (index === 0) {
        console.log('🔍 DEBUG PRIMER JORNAL:');
        console.log('  Jornal:', jornal);
        console.log('  Puesto original:', jornal.puesto);
        console.log('  Puesto normalizado:', puestoLower);
        console.log('  Mapeo encontrado:', mapeo);
        console.log('  Tipo día:', tipoDia);
        console.log('  Clave jornada:', claveJornada);
        console.log('  Salario info:', salarioInfo);
      }

      // 3.5 Detectar si el usuario es OC basándose en su POSICIÓN (no en el buque)
      // CAMBIO: Ahora se basa únicamente en si posicionUsuario > LIMITE_SP
      // Ya no importa si el buque es "--" o vacío
      const esConductorOC = (puestoLower === 'conductor de 1a' ||
                             puestoLower === 'conductor de coches' ||
                             puestoLower === 'conductor de 2a') && esUsuarioOC;

      let salarioBase = 0;
      let prima = 0;
      let esJornalFijo = esConductorOC; // Si es OC y conductor → jornal fijo

      // Tabla de primas mínimas para Trincador según horario y jornada
      const primasMinimaTrincador = {
        '02-08_FESTIVO': 203.719,
        '02-08_LABORABLE': 140.105,
        '02-08_SABADO': 140.105,
        '08-14_FESTIVO': 114.031,
        '08-14_LABORABLE': 88.822,
        '08-14_SABADO': 88.822,
        '14-20_FESTIVO': 144.967,
        '14-20_LABORABLE': 88.822,
        '14-20_SABADO': 114.031,
        '20-02_FESTIVO': 220.058,
        '20-02_LABORABLE': 112.287,
        '20-02_SABADO': 151.393
      };

      if (esConductorOC) {
        // Conductores OC tienen salarios fijos sin prima
        // Tarifas diferenciadas por tipo de día (LABORABLE, SABADO, FESTIVO)
        const salariosOC = {
          // Jornada 02-08 (Super laboral)
          '02-08_LABORABLE': 321.95,
          '02-08_SABADO': 321.95,
          '02-08_FESTIVO': 321.95,

          // Jornada 08-14
          '08-14_LABORABLE': 179.75,
          '08-14_SABADO': 195.77,
          '08-14_FESTIVO': 195.77,

          // Jornada 14-20
          '14-20_LABORABLE': 179.75,
          '14-20_SABADO': 270,
          '14-20_FESTIVO': 408.92,

          // Jornada 20-02
          '20-02_LABORABLE': 253.75,
          '20-02_SABADO': 416.12,
          '20-02_FESTIVO': 253.75
        };

        const claveOC = `${jornada}_${tipoDia}`;
        salarioBase = salariosOC[claveOC] || salariosOC[jornada] || 0;
        prima = 0; // Sin prima para OC
      } else {
        // Cálculo normal para SP y Contenedor/Coches/Trincador
        salarioBase = grupoSalarial === 'G1' ? salarioInfo.jornal_base_g1 : salarioInfo.jornal_base_g2;

        // Añadir complemento de 46,94€ para Trincador y Trincador de Coches
        if (puestoLower === 'trincador' || puestoLower === 'trincador de coches') {
          salarioBase += 46.94;
          if (index === 0) {
            console.log(`✅ Complemento aplicado a "${jornal.puesto}": +46.94€`);
          }
        }

        // 3.6 Calcular prima (por defecto 120 movimientos para Contenedor)
        if (tipoOperativa === 'Coches') {
          // Para Coches: usar prima fija de la tabla
          prima = salarioInfo.prima_minima_coches;
          if (index === 0) {
            console.log(`🚗 Coches detectado - Prima: ${prima}€ (de prima_minima_coches)`);
          }
        } else if (tipoOperativa === 'Contenedor') {
          // A partir de 120 movimientos (>=120) se usa coef_mayor
          prima = 120 * salarioInfo.coef_prima_mayor120;
        } else if (tipoOperativa === 'Trincador') {
          // Para Trincador: calcular prima basada en barras × tarifa (sistema de trinca/destrinca)
          // Por defecto: 0 barras, se editará en la UI
          prima = 0;
          if (index === 0) {
            console.log(`🔧 Trincador de Contenedor detectado - Prima basada en barras (por defecto: 0€)`);
          }
        } else if (tipoOperativa === 'Manual') {
          // Para Manual (ej: Trincador de Coches): prima editable, iniciar en 0
          prima = 0;
          if (index === 0) {
            console.log(`✋ Manual detectado (${jornal.puesto}) - Prima editable iniciada en 0€`);
          }
        }
      }

      // 3.7 Total
      const total = salarioBase + prima;

      if (index === 0) {
        console.log('  Grupo salarial:', grupoSalarial);
        console.log('  Es Conductor OC:', esConductorOC);
        console.log('  Salario base:', salarioBase);
        console.log('  Prima (120 mov):', prima);
        console.log('  Total:', total);
      }

      // Detectar si incluye complemento para mostrar asterisco
      const incluyeComplemento = (puestoLower === 'trincador' || puestoLower === 'trincador de coches');

      // IRPF: usar el irpf_aplicado del jornal si existe, sino usar el IRPF actual del usuario
      const irpfOriginal = jornal.irpf_aplicado; // Guardar el valor original de la BD
      const irpfJornal = (jornal.irpf_aplicado !== null && jornal.irpf_aplicado !== undefined)
        ? jornal.irpf_aplicado
        : irpfPorcentaje;

      return {
        ...jornal,
        puesto_display: puestoDisplay,
        salario_base: salarioBase,
        prima: prima, // Prima inicial calculada
        total: total, // Total inicial calculado
        grupo_salarial: grupoSalarial,
        tipo_operativa: tipoOperativa,
        tipo_dia: tipoDia,
        clave_jornada: claveJornada,
        es_jornal_fijo: esJornalFijo,
        incluye_complemento: incluyeComplemento,
        irpf_aplicado: irpfJornal, // IRPF específico de este jornal
        irpf_aplicado_original: irpfOriginal // Valor original de la BD para detectar si necesita actualización
      };
    }).filter(j => j !== null); // Filtrar jornales nulos (incompletos)

    // IMPORTANTE: Asignar IRPF a jornales que no lo tienen en la base de datos
    // Esto asegura que los jornales antiguos mantengan el IRPF actual como "congelado"
    const jornalesSinIRPF = jornalesConSalario.filter(j =>
      (j.irpf_aplicado_original === null || j.irpf_aplicado_original === undefined) && j.id
    );

    if (jornalesSinIRPF.length > 0) {
      console.log(`📝 Asignando IRPF (${irpfPorcentaje}%) a ${jornalesSinIRPF.length} jornales sin IRPF guardado...`);

      // Actualizar en batch todos los jornales sin IRPF
      const updates = jornalesSinIRPF.map(jornal =>
        window.supabaseClient
          .from('jornales')
          .update({ irpf_aplicado: irpfPorcentaje })
          .eq('id', jornal.id)
      );

      try {
        await Promise.all(updates);
        console.log(`✅ IRPF asignado correctamente a ${jornalesSinIRPF.length} jornales`);
      } catch (error) {
        console.error('❌ Error asignando IRPF a jornales:', error);
      }
    }

    // 3. Agrupar por quincena (DESPUÉS de filtrar jornales incompletos)
    const quincenasMap = groupByQuincena(jornalesConSalario);

    // 4. Calcular estadísticas globales (iniciales)
    // Estos totales se recalcularán después con `actualizarTotales`
    const totalJornalesGlobal = jornalesConSalario.length;
    let salarioTotalBrutoGlobal = jornalesConSalario.reduce((sum, j) => sum + j.total, 0);
    // Calcular neto usando el IRPF específico de cada jornal
    let salarioTotalNetoGlobal = jornalesConSalario.reduce((sum, j) => {
      return sum + (j.total * (1 - j.irpf_aplicado / 100));
    }, 0);
    let salarioPromedioBrutoGlobal = totalJornalesGlobal > 0 ? salarioTotalBrutoGlobal / totalJornalesGlobal : 0;

    // 5. Mostrar IRPF control y estadísticas
    if (irpfControl) {
      irpfControl.style.display = 'block';
    }

    stats.innerHTML = `
      <div class="stat-card">
        <div class="stat-value">${totalJornalesGlobal}</div>
        <div class="stat-label">Jornales Totales (Anual)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: var(--puerto-orange);">${salarioTotalBrutoGlobal.toFixed(2)}€</div>
        <div class="stat-label">Total Bruto (Anual)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: var(--puerto-green);">${salarioTotalNetoGlobal.toFixed(2)}€</div>
        <div class="stat-label">Total Neto (Anual con IRPF aplicado)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: var(--puerto-orange);">${salarioPromedioBrutoGlobal.toFixed(2)}€</div>
        <div class="stat-label">Promedio Bruto (Anual)</div>
      </div>
    `;

    // 6. Renderizar quincenas con salarios
    const quincenasArray = Array.from(quincenasMap.entries())
      .map(([key, jornalesQuincena]) => {
        // Asegurarse de que los objetos jornal dentro de jornalesQuincena
        // sean los mismos que en jornalesConSalario para que los cambios se reflejen
        const jornalesConSalarioQuincena = jornalesQuincena.map(j => {
          return jornalesConSalario.find(jcs => 
            jcs.fecha === j.fecha && jcs.jornada === j.jornada && jcs.puesto === j.puesto
          ) || j; // Fallback al original si no se encuentra (no debería pasar)
        }).filter(j => j);
        
        const [year, month, quincena] = key.split('-').map(Number);
        return { year, month, quincena, jornales: jornalesConSalarioQuincena }; // Usar el array con salarios
      })
      .sort((a, b) => {
        // Ordenar por año, mes, quincena descendente
        if (a.year !== b.year) return b.year - a.year;
        if (a.month !== b.month) return b.month - a.month;
        return b.quincena - a.quincena;
      });

    const monthNamesShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    // Función auxiliar para generar acordeón móvil
    const generarAcordeonMovil = (j, idx, year, month, quincena) => {
      // Validar que el jornal tenga los campos necesarios
      if (!j.jornada || !j.fecha) {
        console.warn('⚠️ Jornal incompleto en acordeón móvil, saltando:', j);
        return ''; // Retornar string vacío para no romper el HTML
      }

      const accordionId = `accordion-${year}-${month}-${quincena}-${idx}`;
      const lockKey = `${j.fecha}_${j.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, '')}`;
      const lockedData = lockedValues[lockKey] || {};

      let movimientosValue;
      if (j.tipo_operativa === 'Trincador') {
        movimientosValue = lockedData.movimientos !== undefined ? lockedData.movimientos : 0;
      } else {
        movimientosValue = lockedData.movimientos !== undefined ? lockedData.movimientos : (j.tipo_operativa === 'Contenedor' ? 120 : 0);
      }

      let primaValue = lockedData.prima !== undefined ? lockedData.prima : j.prima;
      const horasRelevoValue = lockedData.horasRelevo || 0;
      const horasRemateValue = lockedData.horasRemate || 0;
      const barrasTrincaValue = j.tipo_operativa === 'Trincador' ? movimientosValue : 0;
      const tipoOperacionTrincaValue = lockedData.tipoOperacionTrincaPersonalizada || null;

      // Recalcular prima
      if (j.tipo_operativa === 'Contenedor' && !j.es_jornal_fijo) {
        const salarioInfo = tablaSalarial.find(s => s.clave_jornada === j.clave_jornada);
        if (salarioInfo) {
          primaValue = movimientosValue < 120
            ? movimientosValue * salarioInfo.coef_prima_menor120
            : movimientosValue * salarioInfo.coef_prima_mayor120;
        }
      }

      if (j.tipo_operativa === 'Trincador' && barrasTrincaValue > 0 && tipoOperacionTrincaValue) {
        const { horario_trinca, jornada_trinca } = mapearTipoDiaParaTrincaDestrinca(j.tipo_dia, j.jornada);
        const tarifa = buscarTarifaTrincaDestrinca(tarifasTrincaDestrinca, horario_trinca, jornada_trinca, tipoOperacionTrincaValue);
        primaValue = barrasTrincaValue * tarifa;
      }

      const tarifaRelevoAcc = calcularTarifaRelevo(j.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), j.tipo_dia);
      const importeRelevoAcc = tarifaRelevoAcc ? (horasRelevoValue * tarifaRelevoAcc) : 0;
      const tarifaRemateAcc = calcularTarifaRemate(j.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), j.tipo_dia);
      const importeRemateAcc = tarifaRemateAcc ? (horasRemateValue * tarifaRemateAcc) : 0;

      const brutoAcc = j.salario_base + primaValue + importeRelevoAcc + importeRemateAcc;
      const netoAcc = brutoAcc * (1 - j.irpf_aplicado / 100);

      // Generar campos según tipo
      let camposHTML = '';

      // Base siempre visible
      camposHTML += `
        <div class="accordion-field">
          <label>Base</label>
          <div style="padding: 0.5rem; background: #f1f5f9; border-radius: 6px; font-weight: 500;">
            ${j.salario_base.toFixed(2)}€${j.incluye_complemento ? '*' : ''}
          </div>
        </div>`;

      if (j.es_jornal_fijo) {
        camposHTML += `
          <div class="accordion-field">
            <label>Tipo</label>
            <div style="padding: 0.5rem; background: #f1f5f9; border-radius: 6px;">Fijo OC</div>
          </div>`;
      } else if (j.tipo_operativa === 'Contenedor') {
        camposHTML += `
          <div class="accordion-field">
            <label>Movimientos</label>
            <input type="number" class="acc-movimientos-input" value="${movimientosValue}" min="0" data-jornal-index="${idx}">
          </div>
          <div class="accordion-field span-2">
            <label>Prima</label>
            <input type="number" class="acc-prima-input" value="${primaValue.toFixed(2)}" min="0" step="0.01" data-jornal-index="${idx}">
          </div>`;
      } else if (j.tipo_operativa === 'Trincador') {
        camposHTML += `
          <div class="accordion-field">
            <label>Barras</label>
            <input type="number" class="acc-barras-input" value="${barrasTrincaValue}" min="0" data-jornal-index="${idx}">
          </div>
          <div class="accordion-field">
            <label>Operación</label>
            <select class="acc-tipo-op-select" data-jornal-index="${idx}">
              <option value="" ${!tipoOperacionTrincaValue ? 'selected' : ''}>-</option>
              <option value="TRINCA" ${tipoOperacionTrincaValue === 'TRINCA' ? 'selected' : ''}>Trinca</option>
              <option value="DESTRINCA" ${tipoOperacionTrincaValue === 'DESTRINCA' ? 'selected' : ''}>Destrinca</option>
            </select>
          </div>
          <div class="accordion-field span-2">
            <label>Prima</label>
            <input type="number" class="acc-prima-input" value="${primaValue.toFixed(2)}" min="0" step="0.01" data-jornal-index="${idx}">
          </div>`;
      } else {
        camposHTML += `
          <div class="accordion-field">
            <label>Prima</label>
            <input type="number" class="acc-prima-input" value="${primaValue.toFixed(2)}" min="0" step="0.01" data-jornal-index="${idx}">
          </div>`;
      }

      // Relevo y Remate
      if (tarifaRelevoAcc !== null) {
        camposHTML += `
          <div class="accordion-field">
            <label>Relevo</label>
            <select class="acc-relevo-select" data-jornal-index="${idx}">
              <option value="0" ${horasRelevoValue === 0 ? 'selected' : ''}>No</option>
              <option value="1" ${horasRelevoValue > 0 ? 'selected' : ''}>Sí</option>
            </select>
          </div>`;
      }
      if (tarifaRemateAcc !== null) {
        camposHTML += `
          <div class="accordion-field">
            <label>Remate</label>
            <select class="acc-remate-select" data-jornal-index="${idx}">
              <option value="0" ${horasRemateValue === 0 ? 'selected' : ''}>0h</option>
              <option value="1" ${horasRemateValue === 1 ? 'selected' : ''}>1h</option>
              <option value="2" ${horasRemateValue === 2 ? 'selected' : ''}>2h</option>
            </select>
          </div>`;
      }

      return `
        <div class="accordion-item" id="${accordionId}" data-lock-key="${lockKey}">
          <div class="accordion-header" onclick="this.parentElement.classList.toggle('open')">
            <div class="accordion-header-left">
              <span class="accordion-date">${formatearFecha(j.fecha)}</span>
              <span class="accordion-jornada">${j.jornada}</span>
              <span class="accordion-puesto">${j.puesto_display}</span>
            </div>
            <div class="accordion-header-right">
              <span class="accordion-total acc-bruto-value">${brutoAcc.toFixed(2)}€</span>
              <svg class="accordion-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
          <div class="accordion-content">
            <div class="accordion-body">
              <div class="accordion-fields">${camposHTML}</div>
              <div class="accordion-footer">
                <div class="accordion-footer-item">
                  <div class="accordion-footer-label">Bruto</div>
                  <div class="accordion-footer-value bruto acc-bruto-footer">${brutoAcc.toFixed(2)}€</div>
                </div>
                <div class="accordion-footer-item">
                  <div class="accordion-footer-label">Neto</div>
                  <div class="accordion-footer-value neto acc-neto-value">
                    ${netoAcc.toFixed(2)}€
                    ${j.irpf_aplicado && j.irpf_aplicado !== irpfPorcentaje ? `<span class="badge-irpf-diff" title="Este jornal tiene un IRPF del ${j.irpf_aplicado}% (diferente al actual: ${irpfPorcentaje}%)">${j.irpf_aplicado}%</span>` : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>`;
    };

    // Función auxiliar para calcular tarifa de horas de relevo
    const calcularTarifaRelevo = (jornada, tipoDia) => {
      // No hay relevo en 02-08
      if (jornada === '02-08') return null;

      // Si tipoDia es undefined o null, asumir LABORABLE
      if (!tipoDia) {
        tipoDia = 'LABORABLE';
      }

      // Tarifa especial 93,55€ para:
      // - Festivos y domingos (cualquier tipo de día que incluya FEST)
      // - Sábados desde 14-20 hasta 20-02
      if (tipoDia.includes('FEST') || (tipoDia === 'SABADO' && (jornada === '14-20' || jornada === '20-02'))) {
        return 93.55;
      }

      // Tarifa normal para el resto de jornadas
      return 64.31;
    };

    // Función auxiliar para calcular tarifa de horas de remate (Grupo I por defecto)
    const calcularTarifaRemate = (jornada, tipoDia) => {
      // Si tipoDia es undefined o null, asumir LABORABLE
      if (!tipoDia) {
        tipoDia = 'LABORABLE';
      }

      const tarifasRemate = {
        '02-08': {
          'LABORABLE': 61.40,
          'FEST-LAB': 70.36,
          'FESTIVO': 110.57,
          'SABADO': 61.40, // Asumo mismo que laborable para sábado 02-08 si existe
          'FEST-FEST': 110.57 // Asumo mismo que festivo
        },
        '06-12': { // Esta jornada no está en tu determinarTipoDia, pero se mantiene por si acaso
          'LABORABLE': 41.13,
          'FESTIVO': 60.92,
          'SABADO': 41.13 // Asumo mismo que laborable
        },
        '08-14': {
          'LABORABLE': 29.02,
          'SABADO': 52.24,
          'FESTIVO': 75.46,
          'FEST-LAB': 75.46, // Asumo mismo que festivo para coherencia si aparece
          'LAB-FEST': 29.02 // Asumo mismo que laborable para coherencia si aparece
        },
        '14-20': {
          'LABORABLE': 43.51,
          'SABADO': 78.37,
          'FESTIVO': 110.99,
          'FEST-LAB': 110.99, // Asumo mismo que festivo para coherencia si aparece
          'LAB-FEST': 43.51 // Asumo mismo que laborable para coherencia si aparece
        },
        '20-02': {
          'LABORABLE': 43.51,
          'LAB-FEST': 99.25,
          'SABADO': 76.85,
          'FEST-LAB': 88.20,
          'FESTIVO': 110.57, // Asumo festivo en 20-02 si ocurre
          'FEST-FEST': 110.57 // Asumo festivo en 20-02 si ocurre
        }
      };

      return tarifasRemate[jornada]?.[tipoDia] || null;
    };

    // Cargar valores bloqueados desde Supabase primero, luego localStorage como fallback
    const lockedValuesKey = `locked_values_${AppState.currentUser}`;
    let lockedValues = {};

    // 1. Intentar cargar desde Supabase
    try {
      console.log('📥 Cargando primas personalizadas desde Supabase...');
      const primasSupabase = await SheetsAPI.getPrimasPersonalizadas(AppState.currentUser);

      if (primasSupabase && primasSupabase.length > 0) {
        // Poblar lockedValues con datos de Supabase
        primasSupabase.forEach(p => {
          // IMPORTANTE: p.fecha ya viene en formato español (dd/mm/yyyy) porque
          // getJornales() hace la conversión automática de ISO → Español
          // Pero getPrimasPersonalizadas NO hace esta conversión
          // Así que necesitamos convertir aquí si viene en formato ISO
          let fechaEspañol = p.fecha;
          if (p.fecha.includes('-')) {
            // Convertir de ISO (yyyy-mm-dd) a español (dd/mm/yyyy)
            const [year, month, day] = p.fecha.split('-');
            fechaEspañol = `${day}/${month}/${year}`;
          }

          // Normalizar jornada (eliminar espacios y convertir "a" a "-")
          const jornadaNormalizada = p.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, '');

          const key = `${fechaEspañol}_${jornadaNormalizada}`;

          let primaFinal = p.prima_personalizada || p.prima || 0;
          let movimientosFinal = p.movimientos_personalizados || p.movimientos || 0;

          // CÁLCULO INVERSO: Si hay prima pero NO movimientos, calcular movimientos desde prima
          // Solo para operativas de Contenedor (Especialista, Conductor de 1a)
          if (primaFinal > 0 && movimientosFinal === 0) {
            // Buscar el jornal correspondiente para obtener tipo_operativa
            const jornalCorrespondiente = jornalesConSalario.find(j =>
              j.fecha === fechaEspañol &&
              j.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, '') === jornadaNormalizada
            );

            if (jornalCorrespondiente && jornalCorrespondiente.tipo_operativa === 'Contenedor') {
              // Obtener coeficientes de la tabla salarial
              const salarioInfo = tablaSalarial.find(s => s.clave_jornada === jornalCorrespondiente.clave_jornada);

              if (salarioInfo) {
                // Calcular movimientos inversos: prima / coeficiente
                // Intentar primero con coef_mayor120 (más común)
                let movimientosCalculados = Math.round(primaFinal / salarioInfo.coef_prima_mayor120);

                // Si los movimientos son < 120, recalcular con coef_menor120
                if (movimientosCalculados < 120) {
                  movimientosCalculados = Math.round(primaFinal / salarioInfo.coef_prima_menor120);
                }

                movimientosFinal = movimientosCalculados;
                console.log(`🔄 Movimientos calculados inversos: ${primaFinal}€ / coef = ${movimientosCalculados} mov`);
              }
            }
          }

          console.log(`🔑 DEBUG: Creando clave prima: "${key}" con prima=${primaFinal || 0}, movimientos=${movimientosFinal || 0}, tipo_op=${p.tipo_operacion_trinca || 'N/A'}`);

          lockedValues[key] = {
            prima: primaFinal,
            movimientos: movimientosFinal,  // Para Trincadores: esto son las barras
            horasRelevo: p.relevo || 0,
            horasRemate: p.remate || 0,
            tipoOperacionTrincaPersonalizada: p.tipo_operacion_trinca || null,
            primaLocked: true,
            movimientosLocked: true
          };
        });

        console.log(`✅ ${primasSupabase.length} primas personalizadas cargadas desde Supabase`);
        console.log(`🔑 Claves generadas:`, Object.keys(lockedValues));

        // Guardar en localStorage como caché
        localStorage.setItem(lockedValuesKey, JSON.stringify(lockedValues));
      }
    } catch (error) {
      console.warn('⚠️ Error cargando primas desde Supabase, usando localStorage:', error);
    }

    // 2. Si no hay datos de Supabase, cargar desde localStorage
    if (Object.keys(lockedValues).length === 0) {
      try {
        const stored = localStorage.getItem(lockedValuesKey);
        if (stored) {
          lockedValues = JSON.parse(stored);
          console.log(`📂 Valores bloqueados cargados desde localStorage`);
        }
      } catch (e) {
        console.warn('Error cargando valores bloqueados de localStorage:', e);
      }
    }

    // Función para guardar valores bloqueados (con debounce para Supabase)
    let saveTimeout = null;
    const saveLockedValues = (fecha = null, jornada = null) => {
      // Guardar en localStorage (caché local)
      localStorage.setItem(lockedValuesKey, JSON.stringify(lockedValues));

      // Si se proporciona fecha y jornada, guardar también en Supabase
      if (fecha && jornada) {
        // Debounce: esperar 1 segundo antes de guardar en Supabase
        if (saveTimeout) clearTimeout(saveTimeout);

        saveTimeout = setTimeout(() => {
          const key = `${fecha}_${jornada}`;
          const datos = lockedValues[key];

          if (datos) {
            // Para Trincadores: movimientos contiene las barras
            // tipo_operacion_trinca se guarda en barrasTrincaParam (reutilizamos el parámetro)
            SheetsAPI.savePrimaPersonalizada(
              AppState.currentUser,
              fecha,
              jornada,
              datos.prima || 0,
              datos.movimientos || 0,  // Para Trincadores: esto son las barras
              datos.horasRelevo || 0,
              datos.horasRemate || 0,
              null,  // barrasTrincaParam: NO se usa, las barras van en movimientos
              datos.tipoOperacionTrincaPersonalizada !== undefined ? datos.tipoOperacionTrincaPersonalizada : null
            ).then(result => {
              if (result && result.success) {
                console.log(`✅ Prima guardada en Supabase: ${fecha} ${jornada}`, result.data);
              } else {
                console.warn(`⚠️ Error guardando prima en Supabase: ${result?.message || 'desconocido'}`);
              }
            }).catch(err => {
              console.error('❌ Error sincronizando con Supabase:', err);
            });
          }
        }, 1000); // 1 segundo de debounce
      }
    };


    quincenasArray.forEach(({ year, month, quincena, jornales: jornalesQuincena }) => { // Utilizar el array con salarios
      // Ordenar jornales por fecha y jornada
      jornalesQuincena = sortJornalesByDateAndShift([...jornalesQuincena]);

      // Recalcular estos totales para el header de la quincena para que reflejen los datos ya actualizados
      // por la lógica del `jornalesConSalario` que ya tiene los valores bloqueados y recalculados.
      const totalQuincenaBruto = jornalesQuincena.reduce((sum, j) => j.total ? sum + j.total : sum, 0);
      // Calcular neto usando el IRPF específico de cada jornal
      const totalQuincenaNeto = jornalesQuincena.reduce((sum, j) => {
        return j.total ? sum + (j.total * (1 - j.irpf_aplicado / 100)) : sum;
      }, 0);
      const totalBaseQuincena = jornalesQuincena.reduce((sum, j) => j.salario_base ? sum + j.salario_base : sum, 0);
      const totalPrimaExtrasQuincena = jornalesQuincena.reduce((sum, j) => j.total && j.salario_base ? sum + (j.total - j.salario_base) : sum, 0);


      // Verificar si hay jornales con complemento en esta quincena
      const tieneComplemento = jornalesQuincena.some(j => j.incluye_complemento);

      // Badge del censo basado en la POSICIÓN del usuario (no en el tipo de jornal)
      const badgeCenso = esUsuarioOC ? ' <span class="badge-oc">OC</span>' : ' <span class="badge-green">SP</span>';

      // Calcular el último día del mes
      const lastDayOfMonth = new Date(year, month, 0).getDate();
      const quincenaLabel = quincena === 1 ? '1-15' : `16-${lastDayOfMonth}`;
      const monthName = monthNamesShort[month - 1]; // Usar monthNamesShort
      const emoji = quincena === 1 ? '📅' : '🗓️';

      // Comprobar si esta quincena tiene el IRPF bloqueado
      const quincenaKey = `${year}-${month}-${quincena}`;
      const quincenaBloqueadaKey = `quincena_irpf_bloqueada_${AppState.currentUser}_${quincenaKey}`;
      const quincenaBloqueada = localStorage.getItem(quincenaBloqueadaKey) === 'true';

      const card = document.createElement('div');
      card.className = 'quincena-card';
      card.dataset.quincenaKey = quincenaKey;
      card.innerHTML = `
        <div class="quincena-header">
          <div class="quincena-header-left" onclick="this.closest('.quincena-card').classList.toggle('collapsed')">
            <span class="quincena-toggle">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </span>
            <h3>${emoji} ${quincenaLabel} ${monthName.toUpperCase()} ${year}</h3>
            <button class="btn-lock-quincena ${quincenaBloqueada ? 'locked' : ''}"
                    data-quincena-key="${quincenaKey}"
                    title="${quincenaBloqueada ? 'IRPF bloqueado para esta quincena - Click para desbloquear' : 'Click para bloquear el IRPF de esta quincena'}">
              ${quincenaBloqueada ? '🔒' : '🔓'}
            </button>
          </div>
          <div class="quincena-total">
            <div class="total-box bruto-box">
              <div class="total-icon">💰</div>
              <div class="total-content">
                <div class="total-label">Total Bruto</div>
                <div class="total-value bruto-value">${totalQuincenaBruto.toFixed(2)}€</div>
              </div>
            </div>
            <div class="total-box neto-box">
              <div class="total-icon">💵</div>
              <div class="total-content">
                <div class="total-label">Total Neto (${irpfPorcentaje}%)</div>
                <div class="total-value neto-value">${totalQuincenaNeto.toFixed(2)}€</div>
              </div>
            </div>
          </div>
        </div>
        <div class="quincena-content">
        <div class="jornales-table">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Jornada</th>
                <th>Puesto${badgeCenso}</th>
                <th>Base</th>
                <th>Movimientos</th>
                <th>Prima</th>
                <th>H. Relevo</th>
                <th>H. Remate</th>
                <th>Bruto</th>
                <th>Neto</th>
              </tr>
            </thead>
            <tbody id="tbody-${year}-${month}-${quincena}">
              ${jornalesQuincena.map((j, idx) => {
                // Validar que el jornal tenga los campos necesarios
                if (!j.jornada || !j.fecha) {
                  console.warn('⚠️ Jornal incompleto en sueldómetro, saltando:', j);
                  return ''; // Retornar string vacío para no romper el HTML
                }

                const rowId = `row-${year}-${month}-${quincena}-${idx}`;
                const lockKey = `${j.fecha}_${j.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, '')}`;

                // DEBUG: Log para ver qué clave se está buscando
                if (idx === 0) {
                  console.log(`🔑 DEBUG lockKey generada: "${lockKey}"`);
                  console.log(`🔑 Fecha del jornal: "${j.fecha}", Jornada: "${j.jornada}"`);
                  console.log(`🗂️ lockedValues disponibles:`, Object.keys(lockedValues));
                  console.log(`🔍 ¿Existe en lockedValues?`, lockKey in lockedValues);
                  if (lockKey in lockedValues) {
                    console.log(`✅ Datos encontrados:`, lockedValues[lockKey]);
                  }
                }

                // Cargar valores bloqueados o usar defaults
                const lockedData = lockedValues[lockKey] || {};

                // Para Trincadores: movimientos = barras, tipo_operacion guardado aparte
                // Para Contenedor: movimientos = movimientos normales
                let movimientosValue;
                if (j.tipo_operativa === 'Trincador') {
                  movimientosValue = lockedData.movimientos !== undefined ? lockedData.movimientos : 0;
                } else {
                  movimientosValue = lockedData.movimientos !== undefined ? lockedData.movimientos : (j.tipo_operativa === 'Contenedor' ? 120 : 0);
                }

                let primaValue = lockedData.prima !== undefined ? lockedData.prima : j.prima;
                const horasRelevoValue = lockedData.horasRelevo !== undefined ? lockedData.horasRelevo : 0;
                const horasRemateValue = lockedData.horasRemate !== undefined ? lockedData.horasRemate : 0;
                const movimientosLocked = lockedData.movimientosLocked || false;
                const primaLocked = lockedData.primaLocked || false;

                // NUEVO: Barras y tipo de operación para Trincadores (almacenados en movimientos y tipo_operacion_trinca)
                const barrasTrincaValue = j.tipo_operativa === 'Trincador' ? movimientosValue : 0;
                const tipoOperacionTrincaValue = lockedData.tipoOperacionTrincaPersonalizada || null;

                // RECALCULAR PRIMA según movimientos si no está bloqueada y es Contenedor
                if (!primaLocked && j.tipo_operativa === 'Contenedor' && !j.es_jornal_fijo) {
                  const salarioInfo = tablaSalarial.find(s => s.clave_jornada === j.clave_jornada);
                  if (salarioInfo) {
                    // Usar coeficiente correcto según movimientos
                    if (movimientosValue < 120) {
                      primaValue = movimientosValue * salarioInfo.coef_prima_menor120;
                    } else {
                      primaValue = movimientosValue * salarioInfo.coef_prima_mayor120;
                    }
                  }
                }

                // RECALCULAR PRIMA para Trincadores según barras × tarifa
                if (j.tipo_operativa === 'Trincador' && barrasTrincaValue > 0 && tipoOperacionTrincaValue) {
                  // Mapear tipo_dia y jornada a formato de la tabla
                  const { horario_trinca, jornada_trinca } = mapearTipoDiaParaTrincaDestrinca(j.tipo_dia, j.jornada);

                  // Buscar tarifa en la tabla
                  const tarifa = buscarTarifaTrincaDestrinca(tarifasTrincaDestrinca, horario_trinca, jornada_trinca, tipoOperacionTrincaValue);

                  // Calcular prima: barras × tarifa
                  primaValue = barrasTrincaValue * tarifa;

                  if (idx === 0) {
                    console.log(`🔧 Trincador: ${barrasTrincaValue} barras × ${tarifa.toFixed(2)}€ (${tipoOperacionTrincaValue}) = ${primaValue.toFixed(2)}€`);
                  }
                }

                // DEBUG: Log de valores usados
                if (idx === 0) {
                  console.log(`💰 Prima usada: ${primaValue.toFixed(2)}, Prima locked: ${primaLocked}`);
                  console.log(`📊 Movimientos usados: ${movimientosValue}, Movimientos locked: ${movimientosLocked}`);
                  if (!primaLocked && j.tipo_operativa === 'Contenedor') {
                    console.log(`🔢 Prima recalculada con ${movimientosValue} movimientos`);
                  }
                }

                // Si hay valores bloqueados, usar prima bloqueada; si no, usar la recalculada
                let primaRecalculada = primaLocked ? primaValue : primaValue;

                const esOC = j.es_jornal_fijo;

                // Calcular tarifa de relevo
                const tarifaRelevo = calcularTarifaRelevo(j.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), j.tipo_dia);
                const importeRelevo = tarifaRelevo ? (horasRelevoValue * tarifaRelevo) : 0;

                // Calcular tarifa de remate
                const tarifaRemate = calcularTarifaRemate(j.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), j.tipo_dia);
                const importeRemate = tarifaRemate ? (horasRemateValue * tarifaRemate) : 0;

                const bruto = j.salario_base + primaRecalculada + importeRelevo + importeRemate;
                const neto = bruto * (1 - j.irpf_aplicado / 100);

                // Actualizar el objeto jornal en el array global
                j.total = bruto;
                j.prima = primaRecalculada; // Esto asegura que `jornalesConSalario` se mantiene actualizado

                return `
                <tr id="${rowId}" data-row-index="${idx}" data-lock-key="${lockKey}" data-fecha="${j.fecha}" data-jornada="${j.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, '')}" data-irpf-aplicado="${j.irpf_aplicado}">
                  <td>${formatearFecha(j.fecha)}</td>
                  <td><span class="badge badge-${j.jornada.replace(/\s+/g, '')}">${j.jornada}</span></td>
                  <td>${j.puesto_display}</td>
                  <td class="base-value">${j.salario_base.toFixed(2)}€${j.incluye_complemento ? '*' : ''}</td>
                  <td>
                    ${esOC ? `
                      <span class="text-muted">Fijo</span>
                    ` : j.tipo_operativa === 'Contenedor' && !esOC ? `
                      <div style="display: flex; align-items: center; gap: 4px;">
                        <input
                          type="number"
                          class="movimientos-input"
                          value="${movimientosValue}"
                          min="0"
                          step="1"
                          data-jornal-index="${idx}"
                          ${movimientosLocked ? 'disabled' : ''}
                          style="${movimientosLocked ? 'opacity: 0.7; background: #f0f0f0;' : ''}"
                        />
                        <button class="lock-btn movimientos-lock-btn" data-jornal-index="${idx}" title="${movimientosLocked ? 'Desbloqueado' : 'Bloqueado'}">${movimientosLocked ? '🔒' : '🔓'}</button>
                      </div>
                    ` : j.tipo_operativa === 'Trincador' ? `
                      <div style="display: flex; flex-direction: column; gap: 6px;">
                        <div style="display: flex; align-items: center; gap: 4px;">
                          <input
                            type="number"
                            class="barras-input"
                            value="${barrasTrincaValue || 0}"
                            min="0"
                            step="1"
                            placeholder="Barras"
                            data-jornal-index="${idx}"
                            style="width: 70px; padding: 4px 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.9rem;"
                            title="Número de barras trincadas/destrincadas"
                          />
                          <span style="font-size: 0.75rem; color: #666;">barras</span>
                        </div>
                        <select
                          class="tipo-operacion-trinca-select"
                          data-jornal-index="${idx}"
                          style="padding: 4px 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.8rem; cursor: pointer; width: 100%;"
                        >
                          <option value="" ${!tipoOperacionTrincaValue ? 'selected' : ''}>-- Seleccionar --</option>
                          <option value="TRINCA" ${tipoOperacionTrincaValue === 'TRINCA' ? 'selected' : ''}>Trinca</option>
                          <option value="DESTRINCA" ${tipoOperacionTrincaValue === 'DESTRINCA' ? 'selected' : ''}>Destrinca</option>
                        </select>
                      </div>
                    ` : `
                      <span class="text-muted">N/A</span>
                    `}
                  </td>
                  <td>
                    ${esOC ? `
                      <span class="text-muted">—</span>
                    ` : j.tipo_operativa === 'Trincador' ? `
                      <div style="display: flex; align-items: center; gap: 4px;">
                        <input
                          type="number"
                          class="prima-input prima-trincador-auto"
                          value="${primaValue.toFixed(2)}"
                          min="0"
                          step="0.01"
                          data-jornal-index="${idx}"
                          ${primaLocked ? 'disabled' : ''}
                          style="font-weight: 600; background: #fffef0; ${primaLocked ? 'opacity: 0.7; background: #f0f0f0;' : ''}"
                          title="Prima calculada automáticamente, pero puedes editarla manualmente"
                        />€
                        <button class="lock-btn prima-lock-btn" data-jornal-index="${idx}" title="${primaLocked ? 'Desbloqueado' : 'Bloqueado'}">${primaLocked ? '🔒' : '🔓'}</button>
                      </div>
                    ` : `
                      <div style="display: flex; align-items: center; gap: 4px;">
                        <input
                          type="number"
                          class="prima-input"
                          value="${primaValue.toFixed(2)}"
                          min="0"
                          step="0.01"
                          data-jornal-index="${idx}"
                          ${primaLocked ? 'disabled' : ''}
                          style="${primaLocked ? 'opacity: 0.7; background: #f0f0f0;' : ''}"
                        />€
                        <button class="lock-btn prima-lock-btn" data-jornal-index="${idx}" title="${primaLocked ? 'Desbloqueado' : 'Bloqueado'}">${primaLocked ? '🔒' : '🔓'}</button>
                      </div>
                    `}
                  </td>
                  <td>
                    ${tarifaRelevo !== null ? `
                      <div style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem;">
                        <label style="display: flex; align-items: center; cursor: pointer; margin: 0;">
                          <input
                            type="checkbox"
                            class="relevo-checkbox"
                            ${horasRelevoValue > 0 ? 'checked' : ''}
                            data-jornal-index="${idx}"
                            style="width: 20px; height: 20px; cursor: pointer; margin-right: 6px;"
                          />
                          <span style="white-space: nowrap;">1h (${tarifaRelevo.toFixed(2)}€)</span>
                        </label>
                      </div>
                      <div class="importe-relevo-value" style="font-size: 0.75rem; color: #666; font-weight: 600;">= ${importeRelevo.toFixed(2)}€</div>
                    ` : `
                      <span class="text-muted">N/A</span>
                    `}
                  </td>
                  <td>
                    ${tarifaRemate !== null ? `
                      <div style="display: flex; flex-direction: column; gap: 4px; font-size: 0.8rem;">
                        <select
                          class="remate-select"
                          data-jornal-index="${idx}"
                          style="padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.8rem; cursor: pointer;"
                        >
                          <option value="0" ${horasRemateValue === 0 ? 'selected' : ''}>0h</option>
                          <option value="1" ${horasRemateValue === 1 ? 'selected' : ''}>1h (${tarifaRemate.toFixed(2)}€)</option>
                          <option value="2" ${horasRemateValue === 2 ? 'selected' : ''}>2h (${(tarifaRemate * 2).toFixed(2)}€)</option>
                        </select>
                        <div class="importe-remate-value" style="font-size: 0.75rem; color: #666; font-weight: 600;">= ${importeRemate.toFixed(2)}€</div>
                      </div>
                    ` : `
                      <span class="text-muted">N/A</span>
                    `}
                  </td>
                  <td class="bruto-value"><strong>${bruto.toFixed(2)}€</strong></td>
                  <td class="neto-value">
                    <strong>${neto.toFixed(2)}€</strong>
                    ${j.irpf_aplicado && j.irpf_aplicado !== irpfPorcentaje ? `<span class="badge-irpf-diff" title="Este jornal tiene un IRPF del ${j.irpf_aplicado}% (diferente al actual: ${irpfPorcentaje}%)">${j.irpf_aplicado}%</span>` : ''}
                  </td>
                </tr>
              `}).join('')}
            </tbody>
          </table>
        </div>
        <!-- ACORDEÓN MÓVIL -->
        <div class="jornales-accordion">
          ${jornalesQuincena.map((j, idx) => generarAcordeonMovil(j, idx, year, month, quincena)).join('')}
        </div>
        ${tieneComplemento ? `
          <div class="complemento-nota" style="font-size: 0.85rem; color: #666; margin-top: 0.5rem; padding: 0.5rem; background: #f9f9f9; border-radius: 4px;">
            <strong>*</strong> Los puestos Trincador y Trincador de Coches incluyen un complemento de 46,94€ en el salario base.
          </div>
        ` : ''}
        </div>
      `;

      content.appendChild(card);

      // Event listener para botón de bloqueo de IRPF de la quincena
      const btnLockQuincena = card.querySelector('.btn-lock-quincena');
      if (btnLockQuincena) {
        btnLockQuincena.addEventListener('click', async (e) => {
          e.stopPropagation(); // Evitar que se colapse la quincena al hacer click
          const quincenaKey = e.target.dataset.quincenaKey;
          const quincenaBloqueadaKey = `quincena_irpf_bloqueada_${AppState.currentUser}_${quincenaKey}`;
          const isLocked = e.target.classList.contains('locked');

          if (!isLocked) {
            // Bloquear quincena: asignar el IRPF actual a todos los jornales sin irpf_aplicado
            const confirmBlock = confirm(`¿Bloquear el IRPF de esta quincena con el valor actual (${irpfPorcentaje}%)?\n\nTodos los jornales de esta quincena quedarán fijados con este IRPF y no se verán afectados por cambios futuros.`);
            if (!confirmBlock) return;

            // Asignar IRPF actual a todos los jornales de esta quincena
            for (const jornal of jornalesQuincena) {
              // Actualizar en Supabase
              try {
                const { error } = await window.supabaseClient
                  .from('jornales')
                  .update({ irpf_aplicado: irpfPorcentaje })
                  .eq('id', jornal.id);

                if (!error) {
                  jornal.irpf_aplicado = irpfPorcentaje;
                  console.log(`✅ IRPF ${irpfPorcentaje}% asignado al jornal ${jornal.fecha} ${jornal.jornada}`);
                } else {
                  console.error('Error actualizando IRPF en jornal:', error);
                }
              } catch (error) {
                console.error('Error actualizando IRPF en Supabase:', error);
              }
            }

            // Actualizar el DOM: actualizar data-irpf-aplicado y eliminar badges
            card.querySelectorAll('tr[data-lock-key]').forEach(row => {
              row.dataset.irpfAplicado = irpfPorcentaje;
              // Eliminar badge de IRPF diferente porque ahora todos tienen el IRPF actual
              const badge = row.querySelector('.badge-irpf-diff');
              if (badge) {
                badge.remove();
              }
            });

            // Marcar como bloqueada
            localStorage.setItem(quincenaBloqueadaKey, 'true');
            e.target.classList.add('locked');
            e.target.textContent = '🔒';
            e.target.title = 'IRPF bloqueado para esta quincena - Click para desbloquear';
            console.log(`🔒 Quincena ${quincenaKey} bloqueada con IRPF ${irpfPorcentaje}%`);
          } else {
            // Desbloquear quincena
            const confirmUnblock = confirm('¿Desbloquear el IRPF de esta quincena?\n\nLos jornales volverán a usar el IRPF que tenían asignado individualmente.');
            if (!confirmUnblock) return;

            localStorage.removeItem(quincenaBloqueadaKey);
            e.target.classList.remove('locked');
            e.target.textContent = '🔓';
            e.target.title = 'Click para bloquear el IRPF de esta quincena';
            console.log(`🔓 Quincena ${quincenaKey} desbloqueada`);
          }
        });
      }

      // Función auxiliar para recalcular los totales de la quincena (bruto, neto, base, prima)
      // y los totales globales (bruto, neto, promedio)
      const actualizarTotales = () => {
        // 1. Recalcular y actualizar totales de la QUINCENA actual (la card que disparó el evento)
        let nuevoTotalBaseQuincena = 0;
        let nuevoTotalPrimaExtrasQuincena = 0; // Suma de prima + relevo + remate
        let nuevoTotalBrutoQuincena = 0;
        let nuevoTotalNetoQuincena = 0;

        // Recorrer los jornales ya procesados y actualizados en `jornalesConSalarioQuincena`
        jornalesQuincena.forEach(jornal => {
            // Leer los valores actuales de la fila (estos ya están actualizados por los event listeners)
            const row = document.querySelector(`tr[data-lock-key="${jornal.fecha}_${jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, '')}"]`);
            if (row) {
                const brutoFila = parseFloat(row.querySelector('.bruto-value strong')?.textContent.replace('€', '') || '0');
                const netoFila = parseFloat(row.querySelector('.neto-value strong')?.textContent.replace('€', '') || '0');
                const baseFila = parseFloat(row.querySelector('.base-value')?.textContent.replace('€', '').replace('*', '') || '0');

                nuevoTotalBrutoQuincena += brutoFila;
                nuevoTotalNetoQuincena += netoFila;
                nuevoTotalBaseQuincena += baseFila;
                nuevoTotalPrimaExtrasQuincena += (brutoFila - baseFila); // Prima y extras
            }
        });

        // Actualizar bruto y neto en el header de la quincena
        const brutoValueHeader = card.querySelector('.quincena-total .bruto-value');
        const netoValueHeader = card.querySelector('.quincena-total .neto-value');
        if (brutoValueHeader) brutoValueHeader.textContent = `${nuevoTotalBrutoQuincena.toFixed(2)}€`;
        if (netoValueHeader) netoValueHeader.textContent = `${nuevoTotalNetoQuincena.toFixed(2)}€`;

        // 2. Recalcular y actualizar estadísticas GLOBALES (parte superior)
        let totalGlobalBrutoActual = 0;
        let totalGlobalNetoActual = 0;
        let contadorJornalesGlobalActual = 0;

        // Iterar sobre TODOS los jornales del array `jornalesConSalario` (que se mantiene actualizado)
        jornalesConSalario.forEach(jornal => {
            // Cada jornal.total ya ha sido actualizado por los event listeners
            totalGlobalBrutoActual += jornal.total;
            contadorJornalesGlobalActual++;
        });
        totalGlobalNetoActual = totalGlobalBrutoActual * (1 - irpfPorcentaje / 100);

        const promedioBrutoGlobalActual = contadorJornalesGlobalActual > 0 ? totalGlobalBrutoActual / contadorJornalesGlobalActual : 0;

        const statCards = stats.querySelectorAll('.stat-card .stat-value');
        if (statCards.length >= 4) { // Asegurarse de que hay suficientes tarjetas
            statCards[0].textContent = `${contadorJornalesGlobalActual}`; // Jornales Totales
            statCards[1].textContent = `${totalGlobalBrutoActual.toFixed(2)}€`; // Total Bruto
            statCards[2].textContent = `${totalGlobalNetoActual.toFixed(2)}€`; // Total Neto
            statCards[3].textContent = `${promedioBrutoGlobalActual.toFixed(2)}€`; // Promedio Bruto

            // Actualizar label con nuevo % IRPF si es necesario
            const netoLabel = stats.querySelectorAll('.stat-card .stat-label')[2];
            if (netoLabel) netoLabel.textContent = `Total Neto (Anual - ${irpfPorcentaje}% IRPF)`;
        }
      };

      // Event listener para inputs de movimientos
      card.querySelectorAll('.movimientos-input').forEach(input => {
        input.addEventListener('input', (e) => {
          const movimientos = parseFloat(e.target.value) || 0;
          const jornalIndex = parseInt(e.target.dataset.jornalIndex);
          const jornal = jornalesQuincena[jornalIndex];
          const row = e.target.closest('tr');
          const lockKey = row.dataset.lockKey;
          const fecha = row.dataset.fecha;
          const jornada = row.dataset.jornada;

          // Guardar movimientos en localStorage y Supabase
          if (!lockedValues[lockKey]) lockedValues[lockKey] = {};
          lockedValues[lockKey].movimientos = movimientos;
          // lockedValues[lockKey].movimientosLocked = true; // No bloquear automáticamente al cambiar, solo si se clica el candado
          saveLockedValues(fecha, jornada);

          // Recalcular prima según movimientos (solo si no está bloqueada)
          const primaInput = row.querySelector('.prima-input');
          const primaLockBtn = row.querySelector('.prima-lock-btn');
          const primaLocked = primaLockBtn && primaLockBtn.textContent === '🔒';

          let nuevaPrima = 0;
          const salarioInfo = tablaSalarial.find(s => s.clave_jornada === jornal.clave_jornada);

          if (salarioInfo && jornal.tipo_operativa === 'Contenedor' && !primaLocked) {
            // A partir de 120 movimientos (>=120) se usa coef_mayor
            if (movimientos < 120) {
              nuevaPrima = movimientos * salarioInfo.coef_prima_menor120;
            } else {
              nuevaPrima = movimientos * salarioInfo.coef_prima_mayor120;
            }
            // Actualizar el input de prima también
            if (primaInput) primaInput.value = nuevaPrima.toFixed(2);
            jornal.prima = nuevaPrima; // Actualizar el objeto jornal
          } else {
            nuevaPrima = parseFloat(primaInput?.value || 0);
          }

          // Calcular horas de relevo
          const relevoCheckbox = row.querySelector('.relevo-checkbox');
          const horasRelevo = relevoCheckbox?.checked ? 1 : 0;
          const tarifaRelevo = calcularTarifaRelevo(jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), jornal.tipo_dia);
          const importeRelevo = tarifaRelevo ? (horasRelevo * tarifaRelevo) : 0;

          // Calcular horas de remate
          const remateSelect = row.querySelector('.remate-select');
          const horasRemate = remateSelect ? parseInt(remateSelect.value) : 0;
          const tarifaRemate = calcularTarifaRemate(jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), jornal.tipo_dia);
          const importeRemate = tarifaRemate ? (horasRemate * tarifaRemate) : 0;

          const nuevoTotal = jornal.salario_base + nuevaPrima + importeRelevo + importeRemate;
          const nuevoNeto = nuevoTotal * (1 - irpfPorcentaje / 100);

          // Actualizar la fila con animación
          row.classList.add('updating');
          setTimeout(() => row.classList.remove('updating'), 600);

          row.querySelector('.bruto-value strong').textContent = `${nuevoTotal.toFixed(2)}€`;
          row.querySelector('.neto-value strong').textContent = `${nuevoNeto.toFixed(2)}€`;

          // Actualizar el jornal en el array global
          const globalJornal = jornalesConSalario.find(gJ => gJ.fecha === jornal.fecha && gJ.jornada === jornal.jornada && gJ.chapa === jornal.chapa);
          if (globalJornal) {
              globalJornal.total = nuevoTotal;
              globalJornal.prima = nuevaPrima;
          }

          actualizarTotales();
        });
      });

      // Event listener para inputs de prima
      card.querySelectorAll('.prima-input').forEach(input => {
        input.addEventListener('input', (e) => {
          const nuevaPrima = parseFloat(e.target.value) || 0;
          const jornalIndex = parseInt(e.target.dataset.jornalIndex);
          const jornal = jornalesQuincena[jornalIndex];
          const row = e.target.closest('tr');
          const lockKey = row.dataset.lockKey;
          const fecha = row.dataset.fecha;
          const jornada = row.dataset.jornada;

          // Guardar prima en localStorage y Supabase
          if (!lockedValues[lockKey]) lockedValues[lockKey] = {};
          lockedValues[lockKey].prima = nuevaPrima;
          // lockedValues[lockKey].primaLocked = true; // No bloquear automáticamente al cambiar
          saveLockedValues(fecha, jornada);

          // NUEVO: Recalcular movimientos basado en la prima (si es operativa de contenedor)
          const movimientosInput = row.querySelector('.movimientos-input');
          const movimientosLockBtn = row.querySelector('.movimientos-lock-btn');
          const movimientosLocked = movimientosLockBtn && movimientosLockBtn.textContent === '🔒';

          if (movimientosInput && jornal.tipo_operativa === 'Contenedor' && !movimientosLocked) {
            const salarioInfo = tablaSalarial.find(s => s.clave_jornada === jornal.clave_jornada);

            if (salarioInfo) {
              // Calcular movimientos a partir de prima (inverso de la fórmula)
              // Primero intentar con coeficiente menor (<120)
              const movimientosMenor = nuevaPrima / salarioInfo.coef_prima_menor120;

              let movimientosCalculados;
              if (movimientosMenor < 120) {
                // Si los movimientos calculados son < 120, usar ese coeficiente
                movimientosCalculados = Math.round(movimientosMenor);
              } else {
                // Si no, usar coeficiente mayor (>=120)
                movimientosCalculados = Math.round(nuevaPrima / salarioInfo.coef_prima_mayor120);
              }

              // Actualizar input de movimientos
              movimientosInput.value = movimientosCalculados;

              // Guardar en localStorage y Supabase
              if (!lockedValues[lockKey]) lockedValues[lockKey] = {};
              lockedValues[lockKey].movimientos = movimientosCalculados;
              saveLockedValues(fecha, jornada);
            }
          }

          // Calcular horas de relevo
          const relevoCheckbox = row.querySelector('.relevo-checkbox');
          const horasRelevo = relevoCheckbox?.checked ? 1 : 0;
          const tarifaRelevo = calcularTarifaRelevo(jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), jornal.tipo_dia);
          const importeRelevo = tarifaRelevo ? (horasRelevo * tarifaRelevo) : 0;

          // Calcular horas de remate
          const remateSelect = row.querySelector('.remate-select');
          const horasRemate = remateSelect ? parseInt(remateSelect.value) : 0;
          const tarifaRemate = calcularTarifaRemate(jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), jornal.tipo_dia);
          const importeRemate = tarifaRemate ? (horasRemate * tarifaRemate) : 0;

          const nuevoTotal = jornal.salario_base + nuevaPrima + importeRelevo + importeRemate;
          const nuevoNeto = nuevoTotal * (1 - irpfPorcentaje / 100);

          // Actualizar la fila con animación
          row.classList.add('updating');
          setTimeout(() => row.classList.remove('updating'), 600);

          row.querySelector('.bruto-value strong').textContent = `${nuevoTotal.toFixed(2)}€`;
          row.querySelector('.neto-value strong').textContent = `${nuevoNeto.toFixed(2)}€`;

          // Actualizar el jornal en el array global
          const globalJornal = jornalesConSalario.find(gJ => gJ.fecha === jornal.fecha && gJ.jornada === jornal.jornada && gJ.chapa === jornal.chapa);
          if (globalJornal) {
              globalJornal.total = nuevoTotal;
              globalJornal.prima = nuevaPrima;
          }

          actualizarTotales();
        });
      });

      // NUEVO: Event listener para inputs de barras (Trincadores de Contenedor)
      card.querySelectorAll('.barras-input').forEach(input => {
        input.addEventListener('input', async (e) => {
          const barras = parseInt(e.target.value) || 0;
          const jornalIndex = parseInt(e.target.dataset.jornalIndex);
          const jornal = jornalesQuincena[jornalIndex];
          const row = e.target.closest('tr');
          const lockKey = row.dataset.lockKey;
          const fecha = row.dataset.fecha;
          const jornada = row.dataset.jornada;

          // Obtener el tipo de operación actual
          const tipoOpSelect = row.querySelector('.tipo-operacion-trinca-select');
          const tipoOperacion = tipoOpSelect ? tipoOpSelect.value : null;

          console.log(`🔧 Barras cambiadas: ${barras} barras, tipo operación: ${tipoOperacion || 'no seleccionado'}`);

          // Guardar barras en movimientos (NO en barrasTrincaPersonalizadas)
          if (!lockedValues[lockKey]) lockedValues[lockKey] = {};
          lockedValues[lockKey].movimientos = barras;  // CAMBIADO: barras se guardan en movimientos
          if (tipoOperacion) {
            lockedValues[lockKey].tipoOperacionTrincaPersonalizada = tipoOperacion;
          }

          // Recalcular prima si hay barras Y tipo de operación seleccionado
          let nuevaPrima = 0;
          if (barras > 0 && tipoOperacion) {
            // Mapear tipo_dia y jornada
            const { horario_trinca, jornada_trinca } = mapearTipoDiaParaTrincaDestrinca(jornal.tipo_dia, jornal.jornada);

            // Buscar tarifa
            const tarifa = buscarTarifaTrincaDestrinca(tarifasTrincaDestrinca, horario_trinca, jornada_trinca, tipoOperacion);

            // Calcular prima
            nuevaPrima = barras * tarifa;

            console.log(`✅ Prima recalculada: ${barras} × ${tarifa.toFixed(2)}€ = ${nuevaPrima.toFixed(2)}€`);
          } else if (barras === 0 || !tipoOperacion) {
            // Si no hay barras o tipo de operación, prima = 0
            console.log(`⚠️ Prima puesta a 0 (barras: ${barras}, tipo_op: ${tipoOperacion || 'ninguno'})`);
          }

          // Actualizar input de prima
          const primaInput = row.querySelector('.prima-input');
          if (primaInput) {
            primaInput.value = nuevaPrima.toFixed(2);
            lockedValues[lockKey].prima = nuevaPrima;
          }

          // Calcular horas de relevo
          const relevoCheckbox = row.querySelector('.relevo-checkbox');
          const horasRelevo = relevoCheckbox?.checked ? 1 : 0;
          const tarifaRelevo = calcularTarifaRelevo(jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), jornal.tipo_dia);
          const importeRelevo = tarifaRelevo ? (horasRelevo * tarifaRelevo) : 0;

          // Calcular horas de remate
          const remateSelect = row.querySelector('.remate-select');
          const horasRemate = remateSelect ? parseInt(remateSelect.value) : 0;
          const tarifaRemate = calcularTarifaRemate(jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), jornal.tipo_dia);
          const importeRemate = tarifaRemate ? (horasRemate * tarifaRemate) : 0;

          const nuevoTotal = jornal.salario_base + nuevaPrima + importeRelevo + importeRemate;
          const nuevoNeto = nuevoTotal * (1 - irpfPorcentaje / 100);

          // Actualizar la fila con animación
          row.classList.add('updating');
          setTimeout(() => row.classList.remove('updating'), 600);

          row.querySelector('.bruto-value strong').textContent = `${nuevoTotal.toFixed(2)}€`;
          row.querySelector('.neto-value strong').textContent = `${nuevoNeto.toFixed(2)}€`;

          // Actualizar el jornal en el array global
          const globalJornal = jornalesConSalario.find(gJ => gJ.fecha === jornal.fecha && gJ.jornada === jornal.jornada && gJ.chapa === jornal.chapa);
          if (globalJornal) {
            globalJornal.total = nuevoTotal;
            globalJornal.prima = nuevaPrima;
          }

          // Guardar en Supabase
          saveLockedValues(fecha, jornada);

          actualizarTotales();
        });
      });

      // NUEVO: Event listener para selector de tipo de operación (Trincadores)
      card.querySelectorAll('.tipo-operacion-trinca-select').forEach(select => {
        select.addEventListener('change', async (e) => {
          const tipoOperacion = e.target.value;
          const jornalIndex = parseInt(e.target.dataset.jornalIndex);
          const jornal = jornalesQuincena[jornalIndex];
          const row = e.target.closest('tr');
          const lockKey = row.dataset.lockKey;
          const fecha = row.dataset.fecha;
          const jornada = row.dataset.jornada;

          // Obtener barras actuales
          const barrasInput = row.querySelector('.barras-input');
          const barras = barrasInput ? parseInt(barrasInput.value) || 0 : 0;

          console.log(`🔧 Tipo de operación cambiado: ${tipoOperacion}, barras: ${barras}`);

          // Guardar tipo de operación en localStorage
          if (!lockedValues[lockKey]) lockedValues[lockKey] = {};
          lockedValues[lockKey].tipoOperacionTrincaPersonalizada = tipoOperacion || null;
          if (barras > 0) {
            lockedValues[lockKey].movimientos = barras;  // CAMBIADO: barras en movimientos
          }

          // Recalcular prima si hay barras Y tipo de operación seleccionado
          let nuevaPrima = 0;
          if (barras > 0 && tipoOperacion) {
            // Mapear tipo_dia y jornada
            const { horario_trinca, jornada_trinca } = mapearTipoDiaParaTrincaDestrinca(jornal.tipo_dia, jornal.jornada);

            // Buscar tarifa
            const tarifa = buscarTarifaTrincaDestrinca(tarifasTrincaDestrinca, horario_trinca, jornada_trinca, tipoOperacion);

            // Calcular prima
            nuevaPrima = barras * tarifa;

            console.log(`✅ Prima recalculada: ${barras} × ${tarifa.toFixed(2)}€ = ${nuevaPrima.toFixed(2)}€`);
          }

          // Actualizar input de prima
          const primaInput = row.querySelector('.prima-input');
          if (primaInput) {
            primaInput.value = nuevaPrima.toFixed(2);
            lockedValues[lockKey].prima = nuevaPrima;
          }

          // Calcular horas de relevo
          const relevoCheckbox = row.querySelector('.relevo-checkbox');
          const horasRelevo = relevoCheckbox?.checked ? 1 : 0;
          const tarifaRelevo = calcularTarifaRelevo(jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), jornal.tipo_dia);
          const importeRelevo = tarifaRelevo ? (horasRelevo * tarifaRelevo) : 0;

          // Calcular horas de remate
          const remateSelect = row.querySelector('.remate-select');
          const horasRemate = remateSelect ? parseInt(remateSelect.value) : 0;
          const tarifaRemate = calcularTarifaRemate(jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), jornal.tipo_dia);
          const importeRemate = tarifaRemate ? (horasRemate * tarifaRemate) : 0;

          const nuevoTotal = jornal.salario_base + nuevaPrima + importeRelevo + importeRemate;
          const nuevoNeto = nuevoTotal * (1 - irpfPorcentaje / 100);

          // Actualizar la fila con animación
          row.classList.add('updating');
          setTimeout(() => row.classList.remove('updating'), 600);

          row.querySelector('.bruto-value strong').textContent = `${nuevoTotal.toFixed(2)}€`;
          row.querySelector('.neto-value strong').textContent = `${nuevoNeto.toFixed(2)}€`;

          // Actualizar el jornal en el array global
          const globalJornal = jornalesConSalario.find(gJ => gJ.fecha === jornal.fecha && gJ.jornada === jornal.jornada && gJ.chapa === jornal.chapa);
          if (globalJornal) {
            globalJornal.total = nuevoTotal;
            globalJornal.prima = nuevaPrima;
          }

          // Guardar en Supabase
          saveLockedValues(fecha, jornada);

          actualizarTotales();
        });
      });

      // Event listener para checkboxes de horas de relevo
      card.querySelectorAll('.relevo-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
          const horasRelevo = e.target.checked ? 1 : 0;
          const jornalIndex = parseInt(e.target.dataset.jornalIndex);
          const jornal = jornalesQuincena[jornalIndex];
          const row = e.target.closest('tr');
          const lockKey = row.dataset.lockKey;
          const fecha = row.dataset.fecha;
          const jornada = row.dataset.jornada;

          // Guardar horas de relevo en localStorage y Supabase
          if (!lockedValues[lockKey]) lockedValues[lockKey] = {};
          lockedValues[lockKey].horasRelevo = horasRelevo;
          saveLockedValues(fecha, jornada);

          // Calcular tarifa de relevo
          const tarifaRelevo = calcularTarifaRelevo(jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), jornal.tipo_dia);
          const importeRelevo = tarifaRelevo ? (horasRelevo * tarifaRelevo) : 0;

          // Obtener prima actual
          const primaInput = row.querySelector('.prima-input');
          const prima = parseFloat(primaInput?.value || 0);

          // Obtener horas de remate actuales
          const remateSelect = row.querySelector('.remate-select');
          const horasRemate = remateSelect ? parseInt(remateSelect.value) : 0;
          const tarifaRemate = calcularTarifaRemate(jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), jornal.tipo_dia);
          const importeRemate = tarifaRemate ? (horasRemate * tarifaRemate) : 0;

          const nuevoTotal = jornal.salario_base + prima + importeRelevo + importeRemate;
          const nuevoNeto = nuevoTotal * (1 - irpfPorcentaje / 100);

          // Actualizar la fila con animación
          row.classList.add('updating');
          setTimeout(() => row.classList.remove('updating'), 600);

          // Actualizar el importe de relevo mostrado
          const importeRelevoText = row.querySelector('.importe-relevo-value');
          if (importeRelevoText) {
            importeRelevoText.textContent = `= ${importeRelevo.toFixed(2)}€`;
          }

          row.querySelector('.bruto-value strong').textContent = `${nuevoTotal.toFixed(2)}€`;
          row.querySelector('.neto-value strong').textContent = `${nuevoNeto.toFixed(2)}€`;

          // Actualizar el jornal en el array global
          const globalJornal = jornalesConSalario.find(gJ => gJ.fecha === jornal.fecha && gJ.jornada === jornal.jornada && gJ.chapa === jornal.chapa);
          if (globalJornal) globalJornal.total = nuevoTotal;

          actualizarTotales();
        });
      });

      // Event listener para selector de horas de remate
      card.querySelectorAll('.remate-select').forEach(select => {
        select.addEventListener('change', (e) => {
          const horasRemate = parseInt(e.target.value);
          const jornalIndex = parseInt(e.target.dataset.jornalIndex);
          const jornal = jornalesQuincena[jornalIndex];
          const row = e.target.closest('tr');
          const lockKey = row.dataset.lockKey;
          const fecha = row.dataset.fecha;
          const jornada = row.dataset.jornada;

          // Guardar horas de remate en localStorage y Supabase
          if (!lockedValues[lockKey]) lockedValues[lockKey] = {};
          lockedValues[lockKey].horasRemate = horasRemate;
          saveLockedValues(fecha, jornada);

          // Calcular tarifa de remate
          const tarifaRemate = calcularTarifaRemate(jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), jornal.tipo_dia);
          const importeRemate = tarifaRemate ? (horasRemate * tarifaRemate) : 0;

          // Obtener prima actual
          const primaInput = row.querySelector('.prima-input');
          const prima = parseFloat(primaInput?.value || 0);

          // Obtener horas de relevo actuales
          const relevoCheckbox = row.querySelector('.relevo-checkbox');
          const horasRelevo = relevoCheckbox?.checked ? 1 : 0;
          const tarifaRelevo = calcularTarifaRelevo(jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), jornal.tipo_dia);
          const importeRelevo = tarifaRelevo ? (horasRelevo * tarifaRelevo) : 0;

          const nuevoTotal = jornal.salario_base + prima + importeRelevo + importeRemate;
          const nuevoNeto = nuevoTotal * (1 - irpfPorcentaje / 100);

          // Actualizar la fila con animación
          row.classList.add('updating');
          setTimeout(() => row.classList.remove('updating'), 600);

          // Actualizar el importe de remate mostrado
          const importeRemateText = row.querySelector('.importe-remate-value');
          if (importeRemateText) {
            importeRemateText.textContent = `= ${importeRemate.toFixed(2)}€`;
          }

          row.querySelector('.bruto-value strong').textContent = `${nuevoTotal.toFixed(2)}€`;
          row.querySelector('.neto-value strong').textContent = `${nuevoNeto.toFixed(2)}€`;

          // Actualizar el jornal en el array global
          const globalJornal = jornalesConSalario.find(gJ => gJ.fecha === jornal.fecha && gJ.jornada === jornal.jornada && gJ.chapa === jornal.chapa);
          if (globalJornal) globalJornal.total = nuevoTotal;

          actualizarTotales();
        });
      });

      // Event listener para botones de candado de movimientos
      card.querySelectorAll('.movimientos-lock-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const jornalIndex = parseInt(e.target.dataset.jornalIndex);
          const row = e.target.closest('tr');
          const lockKey = row.dataset.lockKey;
          const fecha = row.dataset.fecha;
          const jornada = row.dataset.jornada;
          const movimientosInput = row.querySelector('.movimientos-input');
          const primaInput = row.querySelector('.prima-input');
          const primaLockBtn = row.querySelector('.prima-lock-btn');
          const jornal = jornalesQuincena[jornalIndex];

          // Toggle lock
          if (!lockedValues[lockKey]) lockedValues[lockKey] = {};
          const isLocked = lockedValues[lockKey].movimientosLocked || false;
          lockedValues[lockKey].movimientosLocked = !isLocked;
          lockedValues[lockKey].primaLocked = !isLocked; // Sincronizar con prima
          lockedValues[lockKey].movimientos = parseFloat(movimientosInput.value) || 0; // Guardar valor actual
          lockedValues[lockKey].prima = parseFloat(primaInput.value) || 0; // Guardar valor actual
          saveLockedValues(fecha, jornada);

          // Actualizar UI de movimientos
          btn.textContent = !isLocked ? '🔒' : '🔓';
          btn.title = !isLocked ? 'Bloqueado - Click para desbloquear' : 'Desbloqueado - Click para bloquear';
          movimientosInput.disabled = !isLocked;
          movimientosInput.style.opacity = !isLocked ? '0.7' : '1';
          movimientosInput.style.background = !isLocked ? '#f0f0f0' : '';

          // Actualizar UI de prima también
          if (primaLockBtn) {
            primaLockBtn.textContent = !isLocked ? '🔒' : '🔓';
            primaLockBtn.title = !isLocked ? 'Bloqueado - Click para desbloquear' : 'Desbloqueado - Click para bloquear';
          }
          if (primaInput) {
            primaInput.disabled = !isLocked;
            primaInput.style.opacity = !isLocked ? '0.7' : '1';
            primaInput.style.background = !isLocked ? '#f0f0f0' : '';
          }
          
          // Si se desbloquea, recalcular prima a valor por defecto (120 mov)
          if (isLocked && jornal.tipo_operativa === 'Contenedor') { // Si se acaba de desbloquear
              const salarioInfo = tablaSalarial.find(s => s.clave_jornada === jornal.clave_jornada);
              if (salarioInfo) {
                  const movimientosDefault = 120; // Default si se desbloquea
                  const nuevaPrima = movimientosDefault * salarioInfo.coef_prima_mayor120;
                  if(movimientosInput) movimientosInput.value = movimientosDefault;
                  if(primaInput) primaInput.value = nuevaPrima.toFixed(2);
                  
                  // Actualizar lockedValues también
                  lockedValues[lockKey].movimientos = movimientosDefault;
                  lockedValues[lockKey].prima = nuevaPrima;
                  saveLockedValues(fecha, jornada);
                  
                  // Forzar el evento input para recalcular la fila
                  movimientosInput.dispatchEvent(new Event('input'));
              }
          }

          console.log(`${!isLocked ? '🔒' : '🔓'} Movimientos y prima ${!isLocked ? 'bloqueados' : 'desbloqueados'} para ${lockKey}`);
        });
      });

      // Event listener para botones de candado de prima
      card.querySelectorAll('.prima-lock-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const jornalIndex = parseInt(e.target.dataset.jornalIndex);
          const row = e.target.closest('tr');
          const lockKey = row.dataset.lockKey;
          const fecha = row.dataset.fecha;
          const jornada = row.dataset.jornada;
          const primaInput = row.querySelector('.prima-input');
          const movimientosInput = row.querySelector('.movimientos-input');
          const movimientosLockBtn = row.querySelector('.movimientos-lock-btn');
          const jornal = jornalesQuincena[jornalIndex];

          // Toggle lock
          if (!lockedValues[lockKey]) lockedValues[lockKey] = {};
          const isLocked = lockedValues[lockKey].primaLocked || false;
          lockedValues[lockKey].primaLocked = !isLocked;
          lockedValues[lockKey].movimientosLocked = !isLocked; // Sincronizar con movimientos
          lockedValues[lockKey].prima = parseFloat(primaInput.value) || 0;
          if (movimientosInput) {
            lockedValues[lockKey].movimientos = parseFloat(movimientosInput.value) || 0;
          }
          saveLockedValues(fecha, jornada);

          // Actualizar UI de prima
          btn.textContent = !isLocked ? '🔒' : '🔓';
          btn.title = !isLocked ? 'Bloqueado - Click para desbloquear' : 'Desbloqueado - Click para bloquear';
          primaInput.disabled = !isLocked;
          primaInput.style.opacity = !isLocked ? '0.7' : '1';
          primaInput.style.background = !isLocked ? '#f0f0f0' : '';

          // Actualizar UI de movimientos también
          if (movimientosLockBtn) {
            movimientosLockBtn.textContent = !isLocked ? '🔒' : '🔓';
            movimientosLockBtn.title = !isLocked ? 'Bloqueado - Click para desbloquear' : 'Desbloqueado - Click para bloquear';
          }
          if (movimientosInput) {
            movimientosInput.disabled = !isLocked;
            movimientosInput.style.opacity = !isLocked ? '0.7' : '1';
            movimientosInput.style.background = !isLocked ? '#f0f0f0' : '';
          }

          // Si se desbloquea, y es Contenedor, recalcular movimientos y prima a valores por defecto
          if (isLocked && jornal.tipo_operativa === 'Contenedor') { // Si se acaba de desbloquear
              const salarioInfo = tablaSalarial.find(s => s.clave_jornada === jornal.clave_jornada);
              if (salarioInfo) {
                  const movimientosDefault = 120; // Default si se desbloquea
                  const nuevaPrima = movimientosDefault * salarioInfo.coef_prima_mayor120;
                  if(movimientosInput) movimientosInput.value = movimientosDefault;
                  if(primaInput) primaInput.value = nuevaPrima.toFixed(2);
                  
                  // Actualizar lockedValues también
                  lockedValues[lockKey].movimientos = movimientosDefault;
                  lockedValues[lockKey].prima = nuevaPrima;
                  saveLockedValues(fecha, jornada);
                  
                  // Forzar el evento input para recalcular la fila
                  primaInput.dispatchEvent(new Event('input'));
              }
          }

          console.log(`${!isLocked ? '🔒' : '🔓'} Prima y movimientos ${!isLocked ? 'bloqueados' : 'desbloqueados'} para ${lockKey}`);
        });
      });

      // Event listeners para inputs de movimientos en ACORDEÓN
      card.querySelectorAll('.acc-movimientos-input').forEach(input => {
        input.addEventListener('input', (e) => {
          const movimientos = parseFloat(e.target.value) || 0;
          const jornalIndex = parseInt(e.target.dataset.jornalIndex);
          const jornal = jornalesQuincena[jornalIndex];
          const accordionItem = e.target.closest('.accordion-item');
          const lockKey = accordionItem.dataset.lockKey;

          // Extraer fecha y jornada del lockKey
          const [fecha, jornada] = lockKey.split('_');

          // Guardar movimientos
          if (!lockedValues[lockKey]) lockedValues[lockKey] = {};
          lockedValues[lockKey].movimientos = movimientos;
          saveLockedValues(fecha, jornada);

          // Recalcular prima según movimientos
          const primaInput = accordionItem.querySelector('.acc-prima-input');
          let nuevaPrima = 0;
          const salarioInfo = tablaSalarial.find(s => s.clave_jornada === jornal.clave_jornada);

          if (salarioInfo && jornal.tipo_operativa === 'Contenedor') {
            if (movimientos < 120) {
              nuevaPrima = movimientos * salarioInfo.coef_prima_menor120;
            } else {
              nuevaPrima = movimientos * salarioInfo.coef_prima_mayor120;
            }
            if (primaInput) primaInput.value = nuevaPrima.toFixed(2);
            jornal.prima = nuevaPrima;

            // Guardar prima también
            lockedValues[lockKey].prima = nuevaPrima;
            saveLockedValues(fecha, jornada);
          } else {
            nuevaPrima = parseFloat(primaInput?.value || 0);
          }

          // Calcular horas de relevo
          const relevoSelect = accordionItem.querySelector('.acc-relevo-select');
          const horasRelevo = relevoSelect ? parseInt(relevoSelect.value) : 0;
          const tarifaRelevo = calcularTarifaRelevo(jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), jornal.tipo_dia);
          const importeRelevo = tarifaRelevo ? (horasRelevo * tarifaRelevo) : 0;

          // Calcular horas de remate
          const remateSelect = accordionItem.querySelector('.acc-remate-select');
          const horasRemate = remateSelect ? parseInt(remateSelect.value) : 0;
          const tarifaRemate = calcularTarifaRemate(jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), jornal.tipo_dia);
          const importeRemate = tarifaRemate ? (horasRemate * tarifaRemate) : 0;

          const nuevoTotal = jornal.salario_base + nuevaPrima + importeRelevo + importeRemate;
          const nuevoNeto = nuevoTotal * (1 - irpfPorcentaje / 100);

          // Actualizar UI del acordeón
          const brutoHeader = accordionItem.querySelector('.accordion-header-right .acc-bruto-value');
          const brutoFooter = accordionItem.querySelector('.acc-bruto-footer');
          const netoValue = accordionItem.querySelector('.acc-neto-value');

          if (brutoHeader) brutoHeader.textContent = `${nuevoTotal.toFixed(2)}€`;
          if (brutoFooter) brutoFooter.textContent = `${nuevoTotal.toFixed(2)}€`;
          if (netoValue) netoValue.textContent = `${nuevoNeto.toFixed(2)}€`;

          // Actualizar el jornal en el array global
          jornal.total = nuevoTotal;
          const globalJornal = jornalesConSalario.find(gJ => gJ.fecha === jornal.fecha && gJ.jornada === jornal.jornada && gJ.chapa === jornal.chapa);
          if (globalJornal) {
            globalJornal.total = nuevoTotal;
            globalJornal.prima = nuevaPrima;
          }

          // También actualizar la fila de la tabla si existe
          const tableRow = document.querySelector(`tr[data-lock-key="${lockKey}"]`);
          if (tableRow) {
            const movimientosTableInput = tableRow.querySelector('.movimientos-input');
            const primaTableInput = tableRow.querySelector('.prima-input');
            if (movimientosTableInput) movimientosTableInput.value = movimientos;
            if (primaTableInput) primaTableInput.value = nuevaPrima.toFixed(2);
            const brutoTableValue = tableRow.querySelector('.bruto-value strong');
            const netoTableValue = tableRow.querySelector('.neto-value strong');
            if (brutoTableValue) brutoTableValue.textContent = `${nuevoTotal.toFixed(2)}€`;
            if (netoTableValue) netoTableValue.textContent = `${nuevoNeto.toFixed(2)}€`;
          }

          actualizarTotales();
        });
      });

      // Event listeners para inputs de prima en ACORDEÓN
      card.querySelectorAll('.acc-prima-input').forEach(input => {
        input.addEventListener('input', (e) => {
          const nuevaPrima = parseFloat(e.target.value) || 0;
          const jornalIndex = parseInt(e.target.dataset.jornalIndex);
          const jornal = jornalesQuincena[jornalIndex];
          const accordionItem = e.target.closest('.accordion-item');
          const lockKey = accordionItem.dataset.lockKey;

          // Extraer fecha y jornada del lockKey
          const [fecha, jornada] = lockKey.split('_');

          // Guardar prima
          if (!lockedValues[lockKey]) lockedValues[lockKey] = {};
          lockedValues[lockKey].prima = nuevaPrima;
          saveLockedValues(fecha, jornada);

          // Recalcular movimientos si es Contenedor
          const movimientosInput = accordionItem.querySelector('.acc-movimientos-input');
          if (movimientosInput && jornal.tipo_operativa === 'Contenedor') {
            const salarioInfo = tablaSalarial.find(s => s.clave_jornada === jornal.clave_jornada);
            if (salarioInfo) {
              const movimientosMenor = nuevaPrima / salarioInfo.coef_prima_menor120;
              let movimientosCalculados;
              if (movimientosMenor < 120) {
                movimientosCalculados = Math.round(movimientosMenor);
              } else {
                movimientosCalculados = Math.round(nuevaPrima / salarioInfo.coef_prima_mayor120);
              }
              movimientosInput.value = movimientosCalculados;
              lockedValues[lockKey].movimientos = movimientosCalculados;
              saveLockedValues(fecha, jornada);
            }
          }

          // Calcular horas de relevo
          const relevoSelect = accordionItem.querySelector('.acc-relevo-select');
          const horasRelevo = relevoSelect ? parseInt(relevoSelect.value) : 0;
          const tarifaRelevo = calcularTarifaRelevo(jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), jornal.tipo_dia);
          const importeRelevo = tarifaRelevo ? (horasRelevo * tarifaRelevo) : 0;

          // Calcular horas de remate
          const remateSelect = accordionItem.querySelector('.acc-remate-select');
          const horasRemate = remateSelect ? parseInt(remateSelect.value) : 0;
          const tarifaRemate = calcularTarifaRemate(jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), jornal.tipo_dia);
          const importeRemate = tarifaRemate ? (horasRemate * tarifaRemate) : 0;

          const nuevoTotal = jornal.salario_base + nuevaPrima + importeRelevo + importeRemate;
          const nuevoNeto = nuevoTotal * (1 - irpfPorcentaje / 100);

          // Actualizar UI del acordeón
          const brutoHeader = accordionItem.querySelector('.accordion-header-right .acc-bruto-value');
          const brutoFooter = accordionItem.querySelector('.acc-bruto-footer');
          const netoValue = accordionItem.querySelector('.acc-neto-value');

          if (brutoHeader) brutoHeader.textContent = `${nuevoTotal.toFixed(2)}€`;
          if (brutoFooter) brutoFooter.textContent = `${nuevoTotal.toFixed(2)}€`;
          if (netoValue) netoValue.textContent = `${nuevoNeto.toFixed(2)}€`;

          // Actualizar el jornal en el array global
          jornal.total = nuevoTotal;
          jornal.prima = nuevaPrima;
          const globalJornal = jornalesConSalario.find(gJ => gJ.fecha === jornal.fecha && gJ.jornada === jornal.jornada && gJ.chapa === jornal.chapa);
          if (globalJornal) {
            globalJornal.total = nuevoTotal;
            globalJornal.prima = nuevaPrima;
          }

          // También actualizar la fila de la tabla si existe
          const tableRow = document.querySelector(`tr[data-lock-key="${lockKey}"]`);
          if (tableRow) {
            const primaTableInput = tableRow.querySelector('.prima-input');
            const movimientosTableInput = tableRow.querySelector('.movimientos-input');
            if (primaTableInput) primaTableInput.value = nuevaPrima.toFixed(2);
            if (movimientosTableInput && jornal.tipo_operativa === 'Contenedor') {
              movimientosTableInput.value = lockedValues[lockKey].movimientos || 0;
            }
            const brutoTableValue = tableRow.querySelector('.bruto-value strong');
            const netoTableValue = tableRow.querySelector('.neto-value strong');
            if (brutoTableValue) brutoTableValue.textContent = `${nuevoTotal.toFixed(2)}€`;
            if (netoTableValue) netoTableValue.textContent = `${nuevoNeto.toFixed(2)}€`;
          }

          actualizarTotales();
        });
      });

      // Event listeners para selects de relevo en ACORDEÓN
      card.querySelectorAll('.acc-relevo-select').forEach(select => {
        select.addEventListener('change', (e) => {
          const horasRelevo = parseInt(e.target.value) || 0;
          const jornalIndex = parseInt(e.target.dataset.jornalIndex);
          const jornal = jornalesQuincena[jornalIndex];
          const accordionItem = e.target.closest('.accordion-item');
          const lockKey = accordionItem.dataset.lockKey;
          const [fecha, jornada] = lockKey.split('_');

          // Guardar horas de relevo
          if (!lockedValues[lockKey]) lockedValues[lockKey] = {};
          lockedValues[lockKey].horasRelevo = horasRelevo;
          saveLockedValues(fecha, jornada);

          // Obtener prima actual
          const primaInput = accordionItem.querySelector('.acc-prima-input');
          const prima = parseFloat(primaInput?.value || 0);

          // Calcular tarifa de relevo
          const tarifaRelevo = calcularTarifaRelevo(jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), jornal.tipo_dia);
          const importeRelevo = tarifaRelevo ? (horasRelevo * tarifaRelevo) : 0;

          // Calcular horas de remate
          const remateSelect = accordionItem.querySelector('.acc-remate-select');
          const horasRemate = remateSelect ? parseInt(remateSelect.value) : 0;
          const tarifaRemate = calcularTarifaRemate(jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), jornal.tipo_dia);
          const importeRemate = tarifaRemate ? (horasRemate * tarifaRemate) : 0;

          const nuevoTotal = jornal.salario_base + prima + importeRelevo + importeRemate;
          const nuevoNeto = nuevoTotal * (1 - irpfPorcentaje / 100);

          // Actualizar UI del acordeón
          const brutoHeader = accordionItem.querySelector('.accordion-header-right .acc-bruto-value');
          const brutoFooter = accordionItem.querySelector('.acc-bruto-footer');
          const netoValue = accordionItem.querySelector('.acc-neto-value');

          if (brutoHeader) brutoHeader.textContent = `${nuevoTotal.toFixed(2)}€`;
          if (brutoFooter) brutoFooter.textContent = `${nuevoTotal.toFixed(2)}€`;
          if (netoValue) netoValue.textContent = `${nuevoNeto.toFixed(2)}€`;

          // Actualizar el jornal
          jornal.total = nuevoTotal;
          const globalJornal = jornalesConSalario.find(gJ => gJ.fecha === jornal.fecha && gJ.jornada === jornal.jornada && gJ.chapa === jornal.chapa);
          if (globalJornal) globalJornal.total = nuevoTotal;

          actualizarTotales();
        });
      });

      // Event listeners para selects de remate en ACORDEÓN
      card.querySelectorAll('.acc-remate-select').forEach(select => {
        select.addEventListener('change', (e) => {
          const horasRemate = parseInt(e.target.value) || 0;
          const jornalIndex = parseInt(e.target.dataset.jornalIndex);
          const jornal = jornalesQuincena[jornalIndex];
          const accordionItem = e.target.closest('.accordion-item');
          const lockKey = accordionItem.dataset.lockKey;
          const [fecha, jornada] = lockKey.split('_');

          // Guardar horas de remate
          if (!lockedValues[lockKey]) lockedValues[lockKey] = {};
          lockedValues[lockKey].horasRemate = horasRemate;
          saveLockedValues(fecha, jornada);

          // Obtener prima actual
          const primaInput = accordionItem.querySelector('.acc-prima-input');
          const prima = parseFloat(primaInput?.value || 0);

          // Calcular tarifa de relevo
          const relevoSelect = accordionItem.querySelector('.acc-relevo-select');
          const horasRelevo = relevoSelect ? parseInt(relevoSelect.value) : 0;
          const tarifaRelevo = calcularTarifaRelevo(jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), jornal.tipo_dia);
          const importeRelevo = tarifaRelevo ? (horasRelevo * tarifaRelevo) : 0;

          // Calcular tarifa de remate
          const tarifaRemate = calcularTarifaRemate(jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), jornal.tipo_dia);
          const importeRemate = tarifaRemate ? (horasRemate * tarifaRemate) : 0;

          const nuevoTotal = jornal.salario_base + prima + importeRelevo + importeRemate;
          const nuevoNeto = nuevoTotal * (1 - irpfPorcentaje / 100);

          // Actualizar UI del acordeón
          const brutoHeader = accordionItem.querySelector('.accordion-header-right .acc-bruto-value');
          const brutoFooter = accordionItem.querySelector('.acc-bruto-footer');
          const netoValue = accordionItem.querySelector('.acc-neto-value');

          if (brutoHeader) brutoHeader.textContent = `${nuevoTotal.toFixed(2)}€`;
          if (brutoFooter) brutoFooter.textContent = `${nuevoTotal.toFixed(2)}€`;
          if (netoValue) netoValue.textContent = `${nuevoNeto.toFixed(2)}€`;

          // Actualizar el jornal
          jornal.total = nuevoTotal;
          const globalJornal = jornalesConSalario.find(gJ => gJ.fecha === jornal.fecha && gJ.jornada === jornal.jornada && gJ.chapa === jornal.chapa);
          if (globalJornal) globalJornal.total = nuevoTotal;

          actualizarTotales();
        });
      });

      // Event listeners para inputs de barras en ACORDEÓN (Trincadores)
      card.querySelectorAll('.acc-barras-input').forEach(input => {
        input.addEventListener('input', (e) => {
          const barras = parseInt(e.target.value) || 0;
          const jornalIndex = parseInt(e.target.dataset.jornalIndex);
          const jornal = jornalesQuincena[jornalIndex];
          const accordionItem = e.target.closest('.accordion-item');
          const lockKey = accordionItem.dataset.lockKey;
          const [fecha, jornada] = lockKey.split('_');

          // Obtener el tipo de operación actual
          const tipoOpSelect = accordionItem.querySelector('.acc-tipo-op-select');
          const tipoOperacion = tipoOpSelect ? tipoOpSelect.value : null;

          console.log(`🔧 [MÓVIL] Barras cambiadas: ${barras} barras, tipo operación: ${tipoOperacion || 'no seleccionado'}`);

          // Guardar barras en movimientos
          if (!lockedValues[lockKey]) lockedValues[lockKey] = {};
          lockedValues[lockKey].movimientos = barras;
          if (tipoOperacion) {
            lockedValues[lockKey].tipoOperacionTrincaPersonalizada = tipoOperacion;
          }

          // Recalcular prima si hay barras Y tipo de operación seleccionado
          let nuevaPrima = 0;
          if (barras > 0 && tipoOperacion) {
            // Mapear tipo_dia y jornada
            const { horario_trinca, jornada_trinca } = mapearTipoDiaParaTrincaDestrinca(jornal.tipo_dia, jornal.jornada);

            // Buscar tarifa
            const tarifa = buscarTarifaTrincaDestrinca(tarifasTrincaDestrinca, horario_trinca, jornada_trinca, tipoOperacion);

            // Calcular prima
            nuevaPrima = barras * tarifa;

            console.log(`✅ [MÓVIL] Prima recalculada: ${barras} × ${tarifa.toFixed(2)}€ = ${nuevaPrima.toFixed(2)}€`);
          } else if (barras === 0 || !tipoOperacion) {
            console.log(`⚠️ [MÓVIL] Prima puesta a 0 (barras: ${barras}, tipo_op: ${tipoOperacion || 'ninguno'})`);
          }

          // Actualizar input de prima
          const primaInput = accordionItem.querySelector('.acc-prima-input');
          if (primaInput) {
            primaInput.value = nuevaPrima.toFixed(2);
            lockedValues[lockKey].prima = nuevaPrima;
          }

          // Calcular horas de relevo
          const relevoSelect = accordionItem.querySelector('.acc-relevo-select');
          const horasRelevo = relevoSelect ? parseInt(relevoSelect.value) : 0;
          const tarifaRelevo = calcularTarifaRelevo(jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), jornal.tipo_dia);
          const importeRelevo = tarifaRelevo ? (horasRelevo * tarifaRelevo) : 0;

          // Calcular horas de remate
          const remateSelect = accordionItem.querySelector('.acc-remate-select');
          const horasRemate = remateSelect ? parseInt(remateSelect.value) : 0;
          const tarifaRemate = calcularTarifaRemate(jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), jornal.tipo_dia);
          const importeRemate = tarifaRemate ? (horasRemate * tarifaRemate) : 0;

          const nuevoTotal = jornal.salario_base + nuevaPrima + importeRelevo + importeRemate;
          const nuevoNeto = nuevoTotal * (1 - irpfPorcentaje / 100);

          // Actualizar UI del acordeón
          const brutoHeader = accordionItem.querySelector('.accordion-header-right .acc-bruto-value');
          const brutoFooter = accordionItem.querySelector('.acc-bruto-footer');
          const netoValue = accordionItem.querySelector('.acc-neto-value');

          if (brutoHeader) brutoHeader.textContent = `${nuevoTotal.toFixed(2)}€`;
          if (brutoFooter) brutoFooter.textContent = `${nuevoTotal.toFixed(2)}€`;
          if (netoValue) netoValue.textContent = `${nuevoNeto.toFixed(2)}€`;

          // Actualizar el jornal en el array global
          jornal.total = nuevoTotal;
          jornal.prima = nuevaPrima;
          const globalJornal = jornalesConSalario.find(gJ => gJ.fecha === jornal.fecha && gJ.jornada === jornal.jornada && gJ.chapa === jornal.chapa);
          if (globalJornal) {
            globalJornal.total = nuevoTotal;
            globalJornal.prima = nuevaPrima;
          }

          // Guardar en Supabase
          saveLockedValues(fecha, jornada);

          actualizarTotales();
        });
      });

      // Event listeners para selects de tipo de operación en ACORDEÓN (Trincadores)
      card.querySelectorAll('.acc-tipo-op-select').forEach(select => {
        select.addEventListener('change', (e) => {
          const tipoOperacion = e.target.value;
          const jornalIndex = parseInt(e.target.dataset.jornalIndex);
          const jornal = jornalesQuincena[jornalIndex];
          const accordionItem = e.target.closest('.accordion-item');
          const lockKey = accordionItem.dataset.lockKey;
          const [fecha, jornada] = lockKey.split('_');

          // Obtener barras actuales
          const barrasInput = accordionItem.querySelector('.acc-barras-input');
          const barras = barrasInput ? parseInt(barrasInput.value) || 0 : 0;

          console.log(`🔧 [MÓVIL] Tipo de operación cambiado: ${tipoOperacion}, barras: ${barras}`);

          // Guardar tipo de operación
          if (!lockedValues[lockKey]) lockedValues[lockKey] = {};
          lockedValues[lockKey].tipoOperacionTrincaPersonalizada = tipoOperacion || null;
          if (barras > 0) {
            lockedValues[lockKey].movimientos = barras;
          }

          // Recalcular prima si hay barras Y tipo de operación seleccionado
          let nuevaPrima = 0;
          if (barras > 0 && tipoOperacion) {
            // Mapear tipo_dia y jornada
            const { horario_trinca, jornada_trinca } = mapearTipoDiaParaTrincaDestrinca(jornal.tipo_dia, jornal.jornada);

            // Buscar tarifa
            const tarifa = buscarTarifaTrincaDestrinca(tarifasTrincaDestrinca, horario_trinca, jornada_trinca, tipoOperacion);

            // Calcular prima
            nuevaPrima = barras * tarifa;

            console.log(`✅ [MÓVIL] Prima recalculada: ${barras} × ${tarifa.toFixed(2)}€ = ${nuevaPrima.toFixed(2)}€`);
          }

          // Actualizar input de prima
          const primaInput = accordionItem.querySelector('.acc-prima-input');
          if (primaInput) {
            primaInput.value = nuevaPrima.toFixed(2);
            lockedValues[lockKey].prima = nuevaPrima;
          }

          // Calcular horas de relevo
          const relevoSelect = accordionItem.querySelector('.acc-relevo-select');
          const horasRelevo = relevoSelect ? parseInt(relevoSelect.value) : 0;
          const tarifaRelevo = calcularTarifaRelevo(jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), jornal.tipo_dia);
          const importeRelevo = tarifaRelevo ? (horasRelevo * tarifaRelevo) : 0;

          // Calcular horas de remate
          const remateSelect = accordionItem.querySelector('.acc-remate-select');
          const horasRemate = remateSelect ? parseInt(remateSelect.value) : 0;
          const tarifaRemate = calcularTarifaRemate(jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, ''), jornal.tipo_dia);
          const importeRemate = tarifaRemate ? (horasRemate * tarifaRemate) : 0;

          const nuevoTotal = jornal.salario_base + nuevaPrima + importeRelevo + importeRemate;
          const nuevoNeto = nuevoTotal * (1 - irpfPorcentaje / 100);

          // Actualizar UI del acordeón
          const brutoHeader = accordionItem.querySelector('.accordion-header-right .acc-bruto-value');
          const brutoFooter = accordionItem.querySelector('.acc-bruto-footer');
          const netoValue = accordionItem.querySelector('.acc-neto-value');

          if (brutoHeader) brutoHeader.textContent = `${nuevoTotal.toFixed(2)}€`;
          if (brutoFooter) brutoFooter.textContent = `${nuevoTotal.toFixed(2)}€`;
          if (netoValue) netoValue.textContent = `${nuevoNeto.toFixed(2)}€`;

          // Actualizar el jornal en el array global
          jornal.total = nuevoTotal;
          jornal.prima = nuevaPrima;
          const globalJornal = jornalesConSalario.find(gJ => gJ.fecha === jornal.fecha && gJ.jornada === jornal.jornada && gJ.chapa === jornal.chapa);
          if (globalJornal) {
            globalJornal.total = nuevoTotal;
            globalJornal.prima = nuevaPrima;
          }

          // Guardar en Supabase
          saveLockedValues(fecha, jornada);

          actualizarTotales();
        });
      });

      // IMPORTANTE: Calcular totales iniciales correctamente (incluyen relevo y remate)
      actualizarTotales();
    });

    // Función para actualizar IRPF y persistir en localStorage y Supabase
    const actualizarIRPF = async (e) => {
      const nuevoIRPF = parseFloat(e.target.value) || 0;

      // Validar rango (0-50%)
      if (nuevoIRPF < 0 || nuevoIRPF > 50) {
        alert('El porcentaje de IRPF debe estar entre 0% y 50%');
        e.target.value = irpfPorcentaje;
        return;
      }

      // No hacer nada si el valor no cambió
      if (nuevoIRPF === irpfPorcentaje) {
        return;
      }

      // Guardar en Supabase
      // Asumimos que SheetsAPI.saveUserConfig ahora utiliza Supabase
      const resultadoGuardado = await SheetsAPI.saveUserConfig(AppState.currentUser, nuevoIRPF); 
      if (resultadoGuardado && resultadoGuardado.success) {
        console.log('✅ IRPF guardado en Supabase correctamente:', resultadoGuardado.data);
      } else {
        console.warn('⚠️ Error guardando IRPF en Supabase:', resultadoGuardado?.message || 'desconocido');
      }

      // Guardar en localStorage
      localStorage.setItem(irpfKey, nuevoIRPF.toString());
      irpfPorcentaje = nuevoIRPF;

      // Actualizar el valor mostrado en el header del control IRPF
      const irpfDisplayValue = document.getElementById('irpf-display-value');
      if (irpfDisplayValue) irpfDisplayValue.textContent = `${nuevoIRPF}%`;

      console.log(`💰 IRPF actualizado y guardado: ${nuevoIRPF}%`);
      console.log(`💾 Guardado en localStorage con clave: ${irpfKey}`);

      // Actualizar badges de IRPF sin recalcular netos
      // Los netos ya están correctamente calculados con el IRPF específico de cada jornal
      // Solo necesitamos actualizar los badges para mostrar qué jornales tienen IRPF diferente

      // VISTA TABLA (Escritorio)
      document.querySelectorAll('tr[data-lock-key]').forEach(row => {
        const netoCell = row.querySelector('.neto-value');

        if (netoCell) {
          // Obtener el IRPF específico de este jornal
          const irpfJornal = parseFloat(row.dataset.irpfAplicado);

          // Si el jornal no tiene IRPF aplicado guardado, saltar (no debería pasar)
          if (!irpfJornal || isNaN(irpfJornal)) {
            console.warn('⚠️ Jornal sin IRPF aplicado encontrado:', row.dataset.fecha);
            return;
          }

          // Regenerar badge de IRPF diferente
          // Primero eliminar badge existente si lo hay
          const existingBadge = netoCell.querySelector('.badge-irpf-diff');
          if (existingBadge) {
            existingBadge.remove();
          }

          // Si el IRPF del jornal es diferente al nuevo IRPF global, mostrar badge
          if (irpfJornal !== nuevoIRPF) {
            const badge = document.createElement('span');
            badge.className = 'badge-irpf-diff';
            badge.textContent = `${irpfJornal}%`;
            badge.title = `Este jornal tiene un IRPF del ${irpfJornal}% (diferente al actual: ${nuevoIRPF}%)`;
            netoCell.appendChild(badge);
          }
        }
      });

      // VISTA ACORDEÓN (Móvil)
      document.querySelectorAll('.accordion-item[data-lock-key]').forEach(accordion => {
        const netoValue = accordion.querySelector('.acc-neto-value');

        if (netoValue) {
          // Obtener el IRPF del jornal correspondiente desde la tabla
          const lockKey = accordion.dataset.lockKey;
          const rowCorrespondiente = document.querySelector(`tr[data-lock-key="${lockKey}"]`);

          if (rowCorrespondiente) {
            const irpfJornal = parseFloat(rowCorrespondiente.dataset.irpfAplicado);

            if (!irpfJornal || isNaN(irpfJornal)) {
              console.warn('⚠️ Jornal sin IRPF aplicado en acordeón:', lockKey);
              return;
            }

            // Regenerar badge de IRPF diferente
            const existingBadge = netoValue.querySelector('.badge-irpf-diff');
            if (existingBadge) {
              existingBadge.remove();
            }

            // Si el IRPF del jornal es diferente al nuevo IRPF global, mostrar badge
            if (irpfJornal !== nuevoIRPF) {
              const badge = document.createElement('span');
              badge.className = 'badge-irpf-diff';
              badge.textContent = `${irpfJornal}%`;
              badge.title = `Este jornal tiene un IRPF del ${irpfJornal}% (diferente al actual: ${nuevoIRPF}%)`;
              netoValue.appendChild(badge);
            }
          }
        }
      });

      // Recalcular totales de cada quincena
      // IMPORTANTE: Usar el IRPF específico de cada jornal (data-irpf-aplicado)
      document.querySelectorAll('.quincena-card').forEach(card => {
        let totalBrutoQuincena = 0;
        let totalNetoQuincena = 0;

        card.querySelectorAll('tr[data-lock-key]').forEach(row => {
          const brutoElement = row.querySelector('.bruto-value strong');
          if (brutoElement) {
            const bruto = parseFloat(brutoElement.textContent.replace('€', '')) || 0;
            totalBrutoQuincena += bruto;
            // Usar el IRPF específico de este jornal (no usar fallback)
            const irpfJornal = parseFloat(row.dataset.irpfAplicado);
            if (irpfJornal && !isNaN(irpfJornal)) {
              totalNetoQuincena += bruto * (1 - irpfJornal / 100);
            }
          }
        });

        const brutoHeader = card.querySelector('.quincena-total .bruto-value');
        const netoHeader = card.querySelector('.quincena-total .neto-value');
        if (brutoHeader) brutoHeader.textContent = `${totalBrutoQuincena.toFixed(2)}€`;
        if (netoHeader) netoHeader.textContent = `${totalNetoQuincena.toFixed(2)}€`;
      });

      // Recalcular estadísticas globales
      // IMPORTANTE: Usar el IRPF específico de cada jornal (data-irpf-aplicado)
      let totalGlobalBruto = 0;
      let totalGlobalNeto = 0;
      let contadorJornales = 0;

      document.querySelectorAll('tr[data-lock-key]').forEach(row => {
        const brutoElement = row.querySelector('.bruto-value strong');
        if (brutoElement) {
          const bruto = parseFloat(brutoElement.textContent.replace('€', '')) || 0;
          totalGlobalBruto += bruto;
          // Usar el IRPF específico de este jornal (no usar fallback)
          const irpfJornal = parseFloat(row.dataset.irpfAplicado);
          if (irpfJornal && !isNaN(irpfJornal)) {
            totalGlobalNeto += bruto * (1 - irpfJornal / 100);
          }
          contadorJornales++;
        }
      });

      const promedioBruto = contadorJornales > 0 ? totalGlobalBruto / contadorJornales : 0;

      const statCards = document.querySelectorAll('.stat-card .stat-value');
      if (statCards.length >= 4) {
        statCards[0].textContent = `${contadorJornales}`;
        statCards[1].textContent = `${totalGlobalBruto.toFixed(2)}€`;
        statCards[2].textContent = `${totalGlobalNeto.toFixed(2)}€`;
        statCards[3].textContent = `${promedioBruto.toFixed(2)}€`;
      }

      // Actualizar label del neto
      // Nota: Ya no mostramos un IRPF único porque cada jornal puede tener su propio IRPF
      const netoLabel = document.querySelectorAll('.stat-card .stat-label')[2];
      if (netoLabel) netoLabel.textContent = `Total Neto (Anual con IRPF aplicado)`;

      console.log(`🔄 Valores neto recalculados respetando IRPF histórico de cada jornal`);
    };

    // Event listeners para cambios en IRPF
    if (irpfInput) {
      // Evento 'change' - cuando el usuario presiona Enter o cambia de campo
      irpfInput.addEventListener('change', actualizarIRPF);

      // Evento 'blur' - cuando el usuario sale del input (más robusto)
      irpfInput.addEventListener('blur', actualizarIRPF);
    }

    // Event listener para botón de candado de IRPF
    if (irpfLockBtn && irpfInput) {
      irpfLockBtn.addEventListener('click', (e) => {
        e.preventDefault();
        irpfLocked = !irpfLocked;
        localStorage.setItem(irpfLockKey, irpfLocked.toString());

        // Actualizar UI del botón
        irpfLockBtn.textContent = irpfLocked ? '🔒' : '🔓';
        irpfLockBtn.title = irpfLocked ? 'IRPF bloqueado - Click para desbloquear' : 'IRPF desbloqueado - Click para bloquear';

        // Actualizar UI del input
        irpfInput.disabled = irpfLocked;
        if (irpfLocked) {
          irpfInput.style.opacity = '0.7';
          irpfInput.style.background = '#f0f0f0';
          irpfInput.style.cursor = 'not-allowed';
        } else {
          irpfInput.style.opacity = '1';
          irpfInput.style.background = 'white';
          irpfInput.style.cursor = '';
        }

        console.log(`🔒 IRPF ${irpfLocked ? 'bloqueado' : 'desbloqueado'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error cargando Sueldómetro:', error);
    content.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Error al cargar datos</h3>
        <p>${error.message}</p>
      </div>
    `;
  } finally {
    loading.classList.add('hidden');
  }
}

/**
 * Inicializar funcionalidad de añadir jornal manual
 */
function initAddJornalManual() {
  const addBtn = document.getElementById('add-jornal-btn');
  const modal = document.getElementById('add-jornal-modal');
  const closeBtn = document.getElementById('close-jornal-modal');
  const cancelBtn = document.getElementById('cancel-jornal');
  const saveBtn = document.getElementById('save-jornal');

  const fechaInput = document.getElementById('jornal-fecha');
  const jornadaSelect = document.getElementById('jornal-jornada');
  const tipoDiaSelect = document.getElementById('jornal-tipo-dia');
  const puestoSelect = document.getElementById('jornal-puesto');
  const puestoOtroGroup = document.getElementById('jornal-puesto-otro-group');
  const puestoOtroInput = document.getElementById('jornal-puesto-otro');
  const empresaInput = document.getElementById('jornal-empresa');
  const buqueInput = document.getElementById('jornal-buque');
  const parteInput = document.getElementById('jornal-parte');

  const errorMsg = document.getElementById('jornal-error');
  const successMsg = document.getElementById('jornal-success');

  if (!addBtn || !modal) return;

  // Abrir modal
  addBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
    // Limpiar formulario
    fechaInput.value = '';
    jornadaSelect.value = '';
    tipoDiaSelect.value = '';
    puestoSelect.value = '';
    puestoOtroGroup.style.display = 'none';
    puestoOtroInput.value = '';
    empresaInput.value = '';
    buqueInput.value = '';
    parteInput.value = '';
    errorMsg.textContent = '';
    errorMsg.style.display = 'none';
    successMsg.textContent = '';
    successMsg.style.display = 'none';
  });

  // Cerrar modal
  const cerrarModal = () => {
    modal.style.display = 'none';
  };

  closeBtn.addEventListener('click', cerrarModal);
  cancelBtn.addEventListener('click', cerrarModal);

  // Cerrar al hacer clic fuera del modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) cerrarModal();
  });

  // Mostrar/ocultar campo "Otro puesto"
  puestoSelect.addEventListener('change', () => {
    if (puestoSelect.value === 'otro') {
      puestoOtroGroup.style.display = 'block';
    } else {
      puestoOtroGroup.style.display = 'none';
    }
  });

  // Guardar jornal
  saveBtn.addEventListener('click', async () => {
    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';

    // Validar campos obligatorios
    if (!fechaInput.value || !jornadaSelect.value || !tipoDiaSelect.value || !puestoSelect.value || !empresaInput.value) {
      errorMsg.textContent = 'Por favor, completa todos los campos obligatorios (*)';
      errorMsg.style.display = 'block';
      return;
    }

    // Obtener puesto final
    let puestoFinal = puestoSelect.value;
    if (puestoFinal === 'otro') {
      if (!puestoOtroInput.value.trim()) {
        errorMsg.textContent = 'Por favor, especifica el puesto';
        errorMsg.style.display = 'block';
        return;
      }
      puestoFinal = puestoOtroInput.value.trim();
    }

    // Formatear fecha a DD/MM/YYYY
    const fechaParts = fechaInput.value.split('-'); // YYYY-MM-DD
    const fechaFormateada = `${fechaParts[2]}/${fechaParts[1]}/${fechaParts[0]}`;

    // Crear objeto jornal
    const nuevoJornal = {
      chapa: AppState.currentUser,
      fecha: fechaFormateada,
      jornada: jornadaSelect.value,
      tipo_dia: tipoDiaSelect.value, // Necesario para cálculo de salario
      puesto: puestoFinal,
      empresa: empresaInput.value, // Select, no necesita trim
      buque: buqueInput.value.trim() || '--',
      parte: parteInput.value || '1',
      manual: true // Marcar como añadido manualmente
    };

    console.log('💾 Guardando jornal manual:', nuevoJornal);

    try {
      // Guardar en localStorage
      let historico = JSON.parse(localStorage.getItem('jornales_historico') || '[]');

      // Verificar duplicados
      const existe = historico.some(j =>
        j.fecha === nuevoJornal.fecha &&
        j.jornada === nuevoJornal.jornada &&
        j.puesto === nuevoJornal.puesto
      );

      if (existe) {
        errorMsg.textContent = 'Ya existe un jornal con estos datos';
        errorMsg.style.display = 'block';
        return;
      }

      // Añadir nuevo jornal
      historico.push(nuevoJornal);

      // Ordenar por fecha (más recientes primero)
      historico.sort((a, b) => {
        const [dA, mA, yA] = a.fecha.split('/');
        const [dB, mB, yB] = b.fecha.split('/');
        const dateA = new Date(yA, mA - 1, dA);
        const dateB = new Date(yB, mB - 1, dB);
        return dateB - dateA;
      });

      // Guardar en localStorage
      localStorage.setItem('jornales_historico', JSON.stringify(historico));

      // Obtener IRPF actual del usuario para guardarlo con el jornal
      let irpfActual = 15; // Valor por defecto
      try {
        const configUsuario = await SheetsAPI.getUserConfig(AppState.currentUser);
        if (configUsuario && configUsuario.irpf) {
          irpfActual = configUsuario.irpf;
        } else {
          // Si no hay en Supabase, intentar localStorage
          const irpfKey = `irpf_${AppState.currentUser}`;
          irpfActual = parseFloat(localStorage.getItem(irpfKey)) || 15;
        }
        console.log(`💰 Guardando jornal manual con IRPF actual: ${irpfActual}%`);
      } catch (error) {
        console.warn('⚠️ Error obteniendo IRPF actual, usando valor por defecto (15%):', error);
      }

      // Guardar también en Supabase para persistencia permanente
      // Asumimos que SheetsAPI.saveJornalManual ahora utiliza Supabase
      const resultadoGuardado = await SheetsAPI.saveJornalManual(
        AppState.currentUser,
        nuevoJornal.fecha,
        nuevoJornal.jornada,
        nuevoJornal.tipo_dia,
        nuevoJornal.puesto,
        nuevoJornal.empresa,
        nuevoJornal.buque,
        nuevoJornal.parte,
        irpfActual // Pasar el IRPF actual para guardarlo con el jornal
      );

      if (resultadoGuardado && resultadoGuardado.success) {
          console.log('✅ Jornal también guardado en Supabase');
          // FORZAR limpieza del cache de jornales para este usuario para que se recargue fresco
          const cacheKeys = Object.keys(localStorage);
          cacheKeys.forEach(key => {
            if (key.startsWith(`supabase_jornales_historico_acumulado_${AppState.currentUser}`)) {
              localStorage.removeItem(key);
              console.log(`🗑️ Cache de jornales limpiado: ${key}`);
            }
          });
      } else {
        console.warn('⚠️ Error guardando en Supabase (continuando):', resultadoGuardado?.message || 'desconocido');
      }

      console.log('✅ Jornal guardado correctamente en localStorage');

      // Mostrar mensaje de éxito
      successMsg.textContent = '✅ Jornal añadido correctamente y guardado permanentemente';
      successMsg.style.display = 'block';

      // Recargar automáticamente las vistas
      setTimeout(async () => {
        // Recargar Mis Jornales si estamos en esa página
        if (document.getElementById('page-jornales').classList.contains('active')) {
          await loadJornales();
        }

        // Recargar Sueldómetro si estamos en esa página
        if (document.getElementById('page-sueldometro').classList.contains('active')) {
          await loadSueldometro();
        }

        cerrarModal();
      }, 1500);

    } catch (error) {
      console.error('❌ Error guardando jornal:', error);
      errorMsg.textContent = 'Error al guardar el jornal. Inténtalo de nuevo.';
      errorMsg.style.display = 'block';
    }
  });
}

/**
 * Inicializar funcionalidad de eliminar jornal
 */
function initEliminarJornal() {
  // Usar delegación de eventos en el contenedor de jornales
  const jornalesContent = document.getElementById('jornales-content');

  if (!jornalesContent) return;

  // Eliminar event listener anterior si existe para evitar duplicados
  const oldListener = jornalesContent._deleteJornalListener;
  if (oldListener) {
    jornalesContent.removeEventListener('click', oldListener);
  }

  // Crear nuevo event listener
  const deleteListener = async (e) => {
    const deleteBtn = e.target.closest('.btn-delete-jornal');

    if (!deleteBtn) return;

    const jornalId = deleteBtn.dataset.jornalId;

    if (!jornalId) {
      console.error('❌ No se encontró ID del jornal');
      return;
    }

    // Confirmar eliminación
    if (!confirm('¿Estás seguro de que quieres eliminar este jornal? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      console.log('🗑️ Eliminando jornal con ID:', jornalId);

      // Deshabilitar botón mientras se elimina
      deleteBtn.disabled = true;
      deleteBtn.style.opacity = '0.5';
      deleteBtn.innerHTML = '<span style="font-size: 0.85rem;">Eliminando...</span>';

      // Eliminar de Supabase
      const result = await eliminarJornal(jornalId, AppState.currentUser);

      if (result.success) {
        console.log('✅ Jornal eliminado correctamente');

        // Limpiar cache de jornales
        const cacheKeys = Object.keys(localStorage);
        cacheKeys.forEach(key => {
          if (key.startsWith(`supabase_jornales`) && key.includes(AppState.currentUser)) {
            localStorage.removeItem(key);
            console.log(`🗑️ Cache limpiado: ${key}`);
          }
        });

        // Recargar la vista de jornales
        await loadJornales();

        // Recargar Sueldómetro si estamos en esa página también
        if (document.getElementById('page-sueldometro')?.classList.contains('active')) {
          await loadSueldometro();
        }

        // Mostrar mensaje de éxito temporal
        const successMessage = document.createElement('div');
        successMessage.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 1rem 1.5rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 9999; font-weight: 500;';
        successMessage.textContent = '✅ Jornal eliminado correctamente';
        document.body.appendChild(successMessage);

        setTimeout(() => {
          successMessage.remove();
        }, 3000);

      } else {
        throw new Error(result.message || 'Error desconocido al eliminar');
      }

    } catch (error) {
      console.error('❌ Error eliminando jornal:', error);

      // Mostrar mensaje de error
      const errorMessage = document.createElement('div');
      errorMessage.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #ef4444; color: white; padding: 1rem 1.5rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 9999; font-weight: 500;';
      errorMessage.textContent = '❌ Error al eliminar el jornal. Inténtalo de nuevo.';
      document.body.appendChild(errorMessage);

      setTimeout(() => {
        errorMessage.remove();
      }, 4000);

      // Recargar para restaurar el botón
      await loadJornales();
    }
  };

  // Guardar referencia al listener
  jornalesContent._deleteJornalListener = deleteListener;

  // Añadir event listener
  jornalesContent.addEventListener('click', deleteListener);
}

/**
 * Inicializar funcionalidad de recuperar contraseña
 */
function initForgotPassword() {
  const forgotPasswordLink = document.getElementById('forgot-password-link');
  const modal = document.getElementById('forgot-password-modal');
  const closeBtn = document.getElementById('close-forgot-password-modal');
  const cancelBtn = document.getElementById('cancel-forgot-password');
  const sendBtn = document.getElementById('send-recovery-email');

  const chapaInput = document.getElementById('forgot-password-chapa');
  const errorMsg = document.getElementById('forgot-password-error');
  const successMsg = document.getElementById('forgot-password-success');

  if (!modal || !forgotPasswordLink) return;

  // Abrir modal
  forgotPasswordLink.addEventListener('click', () => {
    modal.style.display = 'flex';
    chapaInput.value = '';
    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';
  });

  // Cerrar modal
  const cerrarModal = () => {
    modal.style.display = 'none';
    chapaInput.value = '';
    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';
  };

  closeBtn.addEventListener('click', cerrarModal);
  cancelBtn.addEventListener('click', cerrarModal);

  // Cerrar al hacer clic fuera del modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      cerrarModal();
    }
  });

  // Enviar solicitud de recuperación
  sendBtn.addEventListener('click', async () => {
    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';

    // Validar chapa
    if (!chapaInput.value || !chapaInput.value.trim()) {
      errorMsg.textContent = 'Por favor, introduce tu número de chapa';
      errorMsg.style.display = 'block';
      return;
    }

    const chapa = chapaInput.value.trim();

    // Crear cuerpo del email
    const emailSubject = `🔐 Solicitud de Recuperación de Contraseña - Chapa ${chapa}`;
    const emailBody = `Solicitud de Recuperación de Contraseña

📋 Información:
--------------------------
Chapa: ${chapa}
Fecha: ${new Date().toLocaleString('es-ES')}

📝 Mensaje:
--------------------------
Hola, he olvidado mi contraseña y necesito recuperar el acceso a mi cuenta.

Por favor, ayúdame a restablecer mi contraseña.

Gracias,
Chapa ${chapa}

--------------------------
Enviado desde Portal Estiba VLC`;

    try {
      // Crear enlace mailto
      const mailtoLink = `mailto:portalestibavlc@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

      // Abrir cliente de correo
      window.location.href = mailtoLink;

      // Mostrar mensaje de éxito
      successMsg.textContent = '✅ Se ha abierto tu cliente de correo. Envía el mensaje y el equipo de soporte te ayudará a recuperar tu contraseña.';
      successMsg.style.display = 'block';

      // Cerrar modal después de 4 segundos
      setTimeout(() => {
        cerrarModal();
      }, 4000);

    } catch (error) {
      console.error('❌ Error creando email:', error);
      errorMsg.textContent = 'Error al crear el email. Inténtalo de nuevo.';
      errorMsg.style.display = 'block';
    }
  });
}

/**
 * Inicializa el modal para reportar bugs
 */
function initReportJornal() {
  const modal = document.getElementById('report-jornal-modal');
  const closeBtn = document.getElementById('close-report-modal');
  const cancelBtn = document.getElementById('cancel-report');
  const sendBtn = document.getElementById('send-report');

  const chapaInput = document.getElementById('report-chapa');
  const tipoSelect = document.getElementById('report-tipo');
  const descripcionInput = document.getElementById('report-descripcion');

  const errorMsg = document.getElementById('report-error');
  const successMsg = document.getElementById('report-success');

  if (!modal) return;

  // Llenar chapa del usuario actual
  const fillChapa = () => {
    if (AppState.currentUser && chapaInput) {
      chapaInput.value = AppState.currentUser;
    }
  };

  // Cerrar modal
  const cerrarModal = () => {
    modal.style.display = 'none';
    // Limpiar formulario
    tipoSelect.value = '';
    descripcionInput.value = '';
    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';
  };

  closeBtn.addEventListener('click', cerrarModal);
  cancelBtn.addEventListener('click', cerrarModal);

  // Cerrar al hacer click fuera del modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      cerrarModal();
    }
  });

  // Cuando se abre el modal, llenar la chapa
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'style') {
        if (modal.style.display === 'flex') {
          fillChapa();
        }
      }
    });
  });

  observer.observe(modal, { attributes: true });

  // Enviar reporte
  sendBtn.addEventListener('click', async () => {
    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';

    // Validar campos requeridos
    if (!chapaInput.value || !tipoSelect.value || !descripcionInput.value.trim()) {
      errorMsg.textContent = 'Por favor, completa todos los campos obligatorios (*)';
      errorMsg.style.display = 'block';
      return;
    }

    // Crear cuerpo del email
    const emailSubject = `🐛 Bug Report - ${tipoSelect.value} - Chapa ${chapaInput.value}`;
    const emailBody = `Reporte de Bug/Problema

📋 Información del Reporte:
--------------------------
Chapa: ${chapaInput.value}
Tipo: ${tipoSelect.value}
Fecha: ${new Date().toLocaleDateString('es-ES')}

📝 Descripción del Problema:
--------------------------
${descripcionInput.value}

--------------------------
Enviado desde Portal Estiba VLC`;

    try {
      // Crear enlace mailto
      const mailtoLink = `mailto:portalestibavlc@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

      // Abrir cliente de correo
      window.location.href = mailtoLink;

      // Mostrar mensaje de éxito
      successMsg.textContent = '✅ Se ha abierto tu cliente de correo. Por favor, envía el email.';
      successMsg.style.display = 'block';

      // Cerrar modal después de 3 segundos
      setTimeout(() => {
        cerrarModal();
      }, 3000);

    } catch (error) {
      console.error('❌ Error creando email:', error);
      errorMsg.textContent = 'Error al crear el email. Inténtalo de nuevo.';
      errorMsg.style.display = 'block';
    }
  });
}

/**
 * Inicializa funcionalidades mejoradas del foro
 */
function initForoEnhanced() {
  const sendBtn = document.getElementById('foro-send');
  const foroInput = document.getElementById('foro-input');
  const charCount = document.getElementById('foro-char-count');

  if (!sendBtn || !foroInput) return;

  // Evento de enviar mensaje
  sendBtn.addEventListener('click', sendForoMessage);

  // Enviar con Ctrl+Enter o Cmd+Enter
  foroInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      sendForoMessage();
    }
  });

  // Contador de caracteres
  foroInput.addEventListener('input', () => {
    const length = foroInput.value.length;
    if (charCount) {
      charCount.textContent = `${length}/500`;

      if (length > 500) {
        charCount.classList.add('error');
        charCount.classList.remove('warning');
        sendBtn.disabled = true;
      } else if (length > 450) {
        charCount.classList.add('warning');
        charCount.classList.remove('error');
        sendBtn.disabled = false;
      } else {
        charCount.classList.remove('warning', 'error');
        sendBtn.disabled = false;
      }
    }
  });
}

/**
 * Inicializar botón de sincronización de jornales
 */
function initSyncJornalesButton() {
  const syncBtn = document.getElementById('sync-jornales-btn');

  if (syncBtn) {
    syncBtn.addEventListener('click', async () => {
      // Evitar clicks múltiples
      if (syncBtn.classList.contains('syncing')) {
        return;
      }

      syncBtn.classList.add('syncing');

      try {
        console.log('🔄 Sincronización manual iniciada...');
        // Asumiendo que SheetsAPI.syncJornalesFromCSV ahora invoca la Edge Function de sincronización
        const result = await SheetsAPI.syncJornalesFromCSV();

        if (result && result.success) {
          console.log(`✅ Sincronización completada: ${result.count} jornales nuevos`);

          // Recargar la vista de jornales
          await loadJornales();

          // Mostrar notificación
          alert(`✅ Sincronización completada\n\n${result.count} jornales nuevos agregados\n${result.duplicados || 0} duplicados omitidos`);
        } else {
          console.warn('⚠️ Sincronización sin nuevos jornales');
          alert('ℹ️ No hay jornales nuevos para sincronizar');
        }
      } catch (error) {
        console.error('❌ Error en sincronización manual:', error);
        alert('❌ Error al sincronizar jornales desde CSV. Revisa la consola para más detalles.');
      } finally {
        syncBtn.classList.remove('syncing');
      }
    });
  }
}

// =============================================================================
// CALCULADORA PREDICTIVA - EL ORACULO
// =============================================================================

window.updateStepper = function(inputId, change) {
  var input = document.getElementById(inputId);
  if (input) {
    var val = parseInt(input.value) || 0;
    val += change;
    if (val < 0) val = 0;
    input.value = val;
  }
};

// Funcion para parsear HTML de prevision de demanda de Noray
function parsePrevisionDemandaHTML(html) {
  var demandas = {
    '08-14': { gruas: 0, coches: 0 },
    '14-20': { gruas: 0, coches: 0 },
    '20-02': { gruas: 0, coches: 0 }
  };

  // Normalizar el HTML para facilitar el parsing
  var htmlNorm = html.replace(/&nbsp;?/gi, ' ').replace(/\s+/g, ' ');

  // Buscar las secciones de cada jornada usando los marcadores de jornada
  // Formato: TDazul>08/14 H o similar
  var jornada0814Match = htmlNorm.match(/TDazul[^>]*>\s*0?8[\/-]14[^]*?(?:TDverde|class\s*=\s*['"]?TDverde)/i);
  var jornada1420Match = htmlNorm.match(/TDverde[^>]*>\s*14[\/-]20[^]*?(?:TDrojo|class\s*=\s*['"]?TDrojo)/i);
  var jornada2002Match = htmlNorm.match(/TDrojo[^>]*>\s*20[\/-]0?2[^]*?(?:<\/TABLE>|Equipos\s+Previstos|$)/i);

  // Funcion auxiliar para extraer gruas de una seccion
  function extractGruas(seccion) {
    if (!seccion) return 0;

    // Patron 1: GRUAS seguido de celdas TD y un TH con el valor de ASIGNADOS
    // El valor de ASIGNADOS esta en <Th> despues de varias <TD>
    var gruasMatch = seccion.match(/GRUAS[^T]*(?:<TD[^>]*>[^<]*)+<Th[^>]*>(\d+)/i);
    if (gruasMatch) {
      return parseInt(gruasMatch[1]) || 0;
    }

    // Patron 2: buscar GRUAS y luego el TH mas cercano con un numero
    var altMatch = seccion.match(/GRUAS[^]*?<Th[^>]*>(\d+)/i);
    if (altMatch) {
      return parseInt(altMatch[1]) || 0;
    }

    // Patron 3: buscar la fila completa de GRUAS (formato de la tabla real)
    // TR con GRUAS, luego columnas de numeros, y el valor en negrita/Th
    var rowMatch = seccion.match(/GRUAS<TD[^>]*>(\d*)<TD[^>]*>(\d*)<TD[^>]*>(\d*)<TD[^>]*>(\d*)<TD[^>]*>(\d*)<Th[^>]*>(\d+)/i);
    if (rowMatch) {
      return parseInt(rowMatch[6]) || 0;
    }

    return 0;
  }

  // Funcion auxiliar para extraer coches (GRUPO III con ROLON) de una seccion
  function extractCoches(seccion) {
    if (!seccion) return 0;

    // Buscar fila de GRUPO III - el ROLON es la 4ta columna de numeros despues del nombre
    // GRUPO III <TD>CONT <TD>LO-LO <TD>GRANEL <TD>ROLON <TD>R/E <Th>ASIGNADOS
    var grupo3Match = seccion.match(/GRUPO\s*III<TD[^>]*>(\d*)<TD[^>]*>(\d*)<TD[^>]*>(\d*)<TD[^>]*>(\d*)/i);
    if (grupo3Match) {
      // grupo3Match[4] es ROLON
      return parseInt(grupo3Match[4]) || 0;
    }

    // Alternativa: buscar cualquier numero en columna ROLON despues de GRUPO III
    var altMatch = seccion.match(/GRUPO\s*III[^G]*?GRANEL[^<]*<TD[^>]*>(\d*)/i);
    if (altMatch) {
      return parseInt(altMatch[1]) || 0;
    }

    return 0;
  }

  demandas['08-14'].gruas = extractGruas(jornada0814Match ? jornada0814Match[0] : '');
  demandas['08-14'].coches = extractCoches(jornada0814Match ? jornada0814Match[0] : '');

  demandas['14-20'].gruas = extractGruas(jornada1420Match ? jornada1420Match[0] : '');
  demandas['14-20'].coches = extractCoches(jornada1420Match ? jornada1420Match[0] : '');

  demandas['20-02'].gruas = extractGruas(jornada2002Match ? jornada2002Match[0] : '');
  demandas['20-02'].coches = extractCoches(jornada2002Match ? jornada2002Match[0] : '');

  console.log('Demandas parseadas localmente:', demandas);
  return demandas;
}

// Funcion para parsear HTML del chapero (fijos no contratados)
function parseChaperoHTML(html) {
  // Buscar "No contratado (XXX)" en el HTML
  var noContratadoMatch = html.match(/No\s*contratado\s*\((\d+)\)/i);
  if (noContratadoMatch) {
    return parseInt(noContratadoMatch[1]) || 0;
  }

  // Alternativa: contar elementos con clase 'nocontratado' y fondo chapab.jpg
  var countMatch = html.match(/background='imagenes\/chapab\.jpg'/gi);
  if (countMatch) {
    return countMatch.length;
  }

  return 0;
}

// Funcion para mostrar el modal de carga manual de datos Noray
function mostrarModalCargarNoray() {
  var modal = document.getElementById('modal-noray');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-noray';
    modal.className = 'modal-overlay';
    modal.innerHTML = '<div class="modal-content" style="max-width: 500px;">' +
      '<div class="modal-header"><h3>Cargar datos de Noray</h3>' +
      '<button class="modal-close" onclick="cerrarModalNoray()">&times;</button></div>' +
      '<div class="modal-body" style="padding: 1rem;">' +
      '<p style="margin-bottom: 1rem; font-size: 0.9rem; color: #666;">' +
      'Noray tiene proteccion Cloudflare. Abre los enlaces y copia los datos:</p>' +
      '<div style="margin-bottom: 1rem;">' +
      '<label style="font-weight: 600; display: block; margin-bottom: 0.5rem;">' +
      '<a href="https://noray.cpevalencia.com/Chapero.asp" target="_blank" style="color: #3b82f6;">1. Abrir Chapero ↗</a></label>' +
      '<p style="font-size: 0.8rem; color: #888; margin-bottom: 0.5rem;">Busca "No contratado (X)" al final de la pagina</p>' +
      '<input type="number" id="noray-fijos-manual" placeholder="Ej: 151" style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;"></div>' +
      '<div style="margin-bottom: 1rem;">' +
      '<label style="font-weight: 600; display: block; margin-bottom: 0.5rem;">' +
      '<a href="https://noray.cpevalencia.com/PrevisionDemanda.asp" target="_blank" style="color: #3b82f6;">2. Abrir Prevision ↗</a></label>' +
      '<p style="font-size: 0.8rem; color: #888; margin-bottom: 0.5rem;">Copia GRUAS (columna ASIGNADOS) y COCHES (columna ROLON de GRUPO III)</p>' +
      '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; margin-top: 0.5rem;">' +
      '<div style="text-align: center; font-size: 0.8rem; font-weight: 600;">08-14</div>' +
      '<div style="text-align: center; font-size: 0.8rem; font-weight: 600;">14-20</div>' +
      '<div style="text-align: center; font-size: 0.8rem; font-weight: 600;">20-02</div>' +
      '<input type="number" id="noray-gruas-0814" placeholder="Gruas" style="padding: 0.4rem; border: 1px solid #ccc; border-radius: 4px; font-size: 0.9rem;">' +
      '<input type="number" id="noray-gruas-1420" placeholder="Gruas" style="padding: 0.4rem; border: 1px solid #ccc; border-radius: 4px; font-size: 0.9rem;">' +
      '<input type="number" id="noray-gruas-2002" placeholder="Gruas" style="padding: 0.4rem; border: 1px solid #ccc; border-radius: 4px; font-size: 0.9rem;">' +
      '<input type="number" id="noray-coches-0814" placeholder="Coches" style="padding: 0.4rem; border: 1px solid #ccc; border-radius: 4px; font-size: 0.9rem;">' +
      '<input type="number" id="noray-coches-1420" placeholder="Coches" style="padding: 0.4rem; border: 1px solid #ccc; border-radius: 4px; font-size: 0.9rem;">' +
      '<input type="number" id="noray-coches-2002" placeholder="Coches" style="padding: 0.4rem; border: 1px solid #ccc; border-radius: 4px; font-size: 0.9rem;">' +
      '</div></div>' +
      '<button onclick="aplicarDatosNorayManual()" style="width: 100%; padding: 0.75rem; background: #10b981; color: white; border: none; border-radius: 4px; font-weight: 600; cursor: pointer;">Aplicar datos</button>' +
      '</div></div>';
    document.body.appendChild(modal);
  }
  modal.style.display = 'flex';
}

window.cerrarModalNoray = function() {
  var modal = document.getElementById('modal-noray');
  if (modal) modal.style.display = 'none';
};

window.aplicarDatosNorayManual = function() {
  var fijos = parseInt(document.getElementById('noray-fijos-manual').value) || 0;
  var gruas0814 = parseInt(document.getElementById('noray-gruas-0814').value) || 0;
  var gruas1420 = parseInt(document.getElementById('noray-gruas-1420').value) || 0;
  var gruas2002 = parseInt(document.getElementById('noray-gruas-2002').value) || 0;
  var coches0814 = parseInt(document.getElementById('noray-coches-0814').value) || 0;
  var coches1420 = parseInt(document.getElementById('noray-coches-1420').value) || 0;
  var coches2002 = parseInt(document.getElementById('noray-coches-2002').value) || 0;

  var fijosInput = document.getElementById('calc-fijos');
  if (fijosInput) fijosInput.value = fijos;

  var gruas1 = document.getElementById('calc-gruas-1');
  var coches1 = document.getElementById('calc-coches-1');
  if (gruas1) gruas1.value = gruas0814;
  if (coches1) coches1.value = coches0814;

  var gruas2 = document.getElementById('calc-gruas-2');
  var coches2 = document.getElementById('calc-coches-2');
  if (gruas2) gruas2.value = gruas1420;
  if (coches2) coches2.value = coches1420;

  var gruas3 = document.getElementById('calc-gruas-3');
  var coches3 = document.getElementById('calc-coches-3');
  if (gruas3) gruas3.value = gruas2002;
  if (coches3) coches3.value = coches2002;

  var statusDiv = document.getElementById('noray-status');
  if (statusDiv) {
    var horaStr = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    statusDiv.innerHTML = '<span style="color: #10b981;">Datos cargados ' + horaStr + '</span>';
    statusDiv.style.display = 'block';
  }

  localStorage.setItem('noray_datos_manual', JSON.stringify({
    fijos: fijos, gruas0814: gruas0814, gruas1420: gruas1420, gruas2002: gruas2002,
    coches0814: coches0814, coches1420: coches1420, coches2002: coches2002,
    timestamp: Date.now()
  }));

  cerrarModalNoray();
  console.log('Datos Noray aplicados manualmente:', { fijos: fijos, gruas0814: gruas0814, gruas1420: gruas1420, gruas2002: gruas2002 });
};

// Funcion para cargar datos automaticamente desde Noray
window.cargarDatosNoray = async function() {
  var btnCargar = document.getElementById('btn-cargar-noray');
  var statusDiv = document.getElementById('noray-status');

  if (btnCargar) {
    btnCargar.disabled = true;
    btnCargar.innerHTML = '<span class="loading-spinner"></span> Cargando...';
  }

  try {
    var data = null;

    // Intentar cargar desde el scraper de Render primero
    try {
      console.log('Intentando cargar desde scraper de Render...');
      // Añadir timestamp para evitar caché
      var renderUrl = 'https://noray-scraper.onrender.com/api/all?t=' + Date.now();
      var renderResponse = await fetch(renderUrl, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      var renderData = await renderResponse.json();

      if (renderData.success && renderData.demandas) {
        console.log('Datos obtenidos desde scraper de Render:', renderData);
        data = renderData;
      }
    } catch (renderError) {
      console.warn('Error cargando desde Render, intentando Apps Script...', renderError);
    }

    // Si el scraper de Render falla, usar Google Apps Script como fallback
    if (!data) {
      console.log('Usando Apps Script como fallback...');
      var url = 'https://script.google.com/macros/s/AKfycbyv6swXpt80WOfTyRhm0n4IBGqcxqeBZCxR1x8bwrhGBRz34I7zZjBzlaJ8lXgHcbDS/exec?action=all';
      var response = await fetch(url);
      data = await response.json();
      console.log('Respuesta raw del Apps Script:', data);
    }

    if (data.success) {
      // Verificar si los datos son validos (no todos en 0)
      var datosValidos = false;

      // Verificar fijos
      if (data.fijos !== undefined && data.fijos > 0) {
        datosValidos = true;
        console.log('Fijos validos desde Apps Script:', data.fijos);
      }

      // Verificar demandas
      if (data.demandas) {
        for (var jornada in data.demandas) {
          if (data.demandas[jornada].gruas > 0 || data.demandas[jornada].coches > 0) {
            datosValidos = true;
            console.log('Demandas validas desde Apps Script para jornada', jornada, ':', data.demandas[jornada]);
            break;
          }
        }
      }

      // Si los datos del Apps Script estan vacios, verificar si es por Cloudflare
      if (!datosValidos) {
        console.log('Datos del Apps Script vacios o no validos');

        // Verificar si el HTML contiene "Just a moment" (Cloudflare challenge)
        var esCloudflare = (data.htmlPrevision && data.htmlPrevision.indexOf('Just a moment') !== -1) ||
                          (data.htmlChapero && data.htmlChapero.indexOf('Just a moment') !== -1);

        // Intentar parsear HTML si está disponible (aunque no pase validación inicial)
        if (data.htmlPrevision && data.htmlChapero && !esCloudflare) {
          console.log('Parseando HTML crudo proporcionado por el Apps Script...');
          var demandasParseadas = parsePrevisionDemandaHTML(data.htmlPrevision);
          data.demandas = demandasParseadas;
          data.fijos = parseChaperoHTML(data.htmlChapero);
          console.log('Datos parseados localmente:', { fijos: data.fijos, demandas: data.demandas });

          // Verificar si el parseo fue exitoso
          if (data.fijos > 0 || (data.demandas['08-14'].gruas > 0 || data.demandas['14-20'].gruas > 0 || data.demandas['20-02'].gruas > 0)) {
            datosValidos = true;
          }
        }  

        // Si sigue sin ser válido, intentar cargar datos guardados o mostrar modal
        if (!datosValidos) {
          console.warn('No se pudieron obtener datos válidos. Intentando cargar datos guardados o mostrando modal.');

          // Intentar cargar datos guardados localmente
          var datosGuardados = localStorage.getItem('noray_datos_manual');
          if (datosGuardados) {
            var saved = JSON.parse(datosGuardados);
            // Si los datos tienen menos de 6 horas, usarlos
            if (Date.now() - saved.timestamp < 6 * 60 * 60 * 1000) {
              console.log('Usando datos guardados localmente');
              data.fijos = saved.fijos;
              data.demandas = {
                '08-14': { gruas: saved.gruas0814, coches: saved.coches0814 },
                '14-20': { gruas: saved.gruas1420, coches: saved.coches1420 },
                '20-02': { gruas: saved.gruas2002, coches: saved.coches2002 }
              };
              datosValidos = true;
            }
          }

          // Si no hay datos guardados validos, mostrar modal
          if (!datosValidos) {
            console.log('Mostrando modal para introducir datos manualmente');
            mostrarModalCargarNoray();
            if (statusDiv) {
              statusDiv.innerHTML = '<span style="color: #f59e0b;">Introduce los datos manualmente</span>';
              statusDiv.style.display = 'block';
            }
            if (btnCargar) {
              btnCargar.disabled = false;
              btnCargar.innerHTML = 'Cargar datos Noray';
            }
            return;
          }
        }
      }

      // Rellenar fijos
      if (data.fijos !== undefined) {
        var fijosInput = document.getElementById('calc-fijos');
        if (fijosInput) {
          fijosInput.value = data.fijos;
        }
      }

      // Rellenar gruas y coches por jornada
      if (data.demandas) {
        // Jornada 1: 08-14
        var gruas1 = document.getElementById('calc-gruas-1');
        var coches1 = document.getElementById('calc-coches-1');
        if (gruas1 && data.demandas['08-14']) {
          gruas1.value = data.demandas['08-14'].gruas || 0;
        }
        if (coches1 && data.demandas['08-14']) {
          coches1.value = data.demandas['08-14'].coches || 0;
        }

        // Jornada 2: 14-20
        var gruas2 = document.getElementById('calc-gruas-2');
        var coches2 = document.getElementById('calc-coches-2');
        if (gruas2 && data.demandas['14-20']) {
          gruas2.value = data.demandas['14-20'].gruas || 0;
        }
        if (coches2 && data.demandas['14-20']) {
          coches2.value = data.demandas['14-20'].coches || 0;
        }

        // Jornada 3: 20-02
        var gruas3 = document.getElementById('calc-gruas-3');
        var coches3 = document.getElementById('calc-coches-3');
        if (gruas3 && data.demandas['20-02']) {
          gruas3.value = data.demandas['20-02'].gruas || 0;
        }
        if (coches3 && data.demandas['20-02']) {
          coches3.value = data.demandas['20-02'].coches || 0;
        }
      }

      // Mostrar estado
      if (statusDiv) {
        var fecha = new Date(data.timestamp || Date.now());
        var horaStr = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        statusDiv.innerHTML = '<span style="color: #10b981;">Datos cargados ' + horaStr + '</span>';
        statusDiv.style.display = 'block';
      }

      console.log('Datos Noray cargados:', data);

    } else {
      throw new Error(data.error || 'Error desconocido');
    }

  } catch (error) {
    console.error('Error cargando datos de Noray:', error);
    if (statusDiv) {
      statusDiv.innerHTML = '<span style="color: #ef4444;">Error al cargar datos</span>';
      statusDiv.style.display = 'block';
    }
  } finally {
    if (btnCargar) {
      btnCargar.disabled = false;
      btnCargar.innerHTML = 'Cargar datos Noray';
    }
  }
};

// ============================================================================
// NUEVAS FUNCIONES PARA CARGAR DATOS POR SEPARADO (EVITAR BLOQUEO CLOUDFLARE)
// ============================================================================

// Función auxiliar para bloquear/desbloquear botones mutuamente
function setLoadingState(activeButton, inactiveButton, isLoading) {
  var loadingInfo = document.getElementById('noray-loading-info');

  if (isLoading) {
    // Deshabilitar ambos botones
    activeButton.disabled = true;
    inactiveButton.disabled = true;

    // Aplicar estilo visual de "bloqueado" al botón inactivo
    inactiveButton.style.opacity = '0.5';
    inactiveButton.style.cursor = 'not-allowed';

    // Mostrar mensaje informativo
    if (loadingInfo) {
      loadingInfo.style.display = 'block';
    }
  } else {
    // Rehabilitar solo el botón activo (el inactivo se rehabilitará cuando termine)
    activeButton.disabled = false;
    inactiveButton.disabled = false;

    // Restaurar estilo del botón inactivo
    inactiveButton.style.opacity = '1';
    inactiveButton.style.cursor = 'pointer';

    // Ocultar mensaje informativo
    if (loadingInfo) {
      loadingInfo.style.display = 'none';
    }
  }
}

// Función para cargar solo la previsión (demandas de grúas y coches)
window.cargarPrevisionNoray = async function() {
  var btnPrevision = document.getElementById('btn-cargar-prevision');
  var btnFijos = document.getElementById('btn-cargar-fijos');
  var statusDiv = document.getElementById('noray-status-prevision');

  if (btnPrevision) {
    btnPrevision.innerHTML = '<span class="loading-spinner"></span> Cargando...';
    // Bloquear ambos botones mientras carga
    setLoadingState(btnPrevision, btnFijos, true);
  }

  try {
    console.log('📊 Cargando previsión desde scraper de Render...');
    // Añadir timestamp para evitar caché
    var renderUrl = 'https://noray-scraper.onrender.com/api/prevision?t=' + Date.now();
    var response = await fetch(renderUrl, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    var data = await response.json();

    if (data.success && data.demandas) {
      console.log('✅ Previsión obtenida:', data.demandas);

      // Rellenar gruas y coches por jornada
      // Jornada 1: 08-14
      var gruas1 = document.getElementById('calc-gruas-1');
      var coches1 = document.getElementById('calc-coches-1');
      if (gruas1 && data.demandas['08-14']) {
        gruas1.value = data.demandas['08-14'].gruas || 0;
      }
      if (coches1 && data.demandas['08-14']) {
        coches1.value = data.demandas['08-14'].coches || 0;
      }

      // Jornada 2: 14-20
      var gruas2 = document.getElementById('calc-gruas-2');
      var coches2 = document.getElementById('calc-coches-2');
      if (gruas2 && data.demandas['14-20']) {
        gruas2.value = data.demandas['14-20'].gruas || 0;
      }
      if (coches2 && data.demandas['14-20']) {
        coches2.value = data.demandas['14-20'].coches || 0;
      }

      // Jornada 3: 20-02
      var gruas3 = document.getElementById('calc-gruas-3');
      var coches3 = document.getElementById('calc-coches-3');
      if (gruas3 && data.demandas['20-02']) {
        gruas3.value = data.demandas['20-02'].gruas || 0;
      }
      if (coches3 && data.demandas['20-02']) {
        coches3.value = data.demandas['20-02'].coches || 0;
      }

      // Mostrar estado exitoso
      if (statusDiv) {
        var fecha = new Date(data.timestamp || Date.now());
        var horaStr = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        statusDiv.innerHTML = '✅ Previsión cargada ' + horaStr;
        statusDiv.style.display = 'block';
      }

      console.log('✅ Previsión aplicada correctamente');

    } else {
      throw new Error(data.error || 'No se encontraron demandas');
    }

  } catch (error) {
    console.error('❌ Error cargando previsión:', error);
    if (statusDiv) {
      statusDiv.innerHTML = '❌ Error al cargar previsión';
      statusDiv.style.display = 'block';
    }
  } finally {
    if (btnPrevision && btnFijos) {
      btnPrevision.innerHTML = '📊 Cargar Previsión';
      // Desbloquear ambos botones
      setLoadingState(btnPrevision, btnFijos, false);
    }
  }
};

// Función para cargar solo los fijos (chapero)
window.cargarFijosNoray = async function() {
  var btnFijos = document.getElementById('btn-cargar-fijos');
  var btnPrevision = document.getElementById('btn-cargar-prevision');
  var statusDiv = document.getElementById('noray-status-fijos');

  if (btnFijos) {
    btnFijos.innerHTML = '<span class="loading-spinner"></span> Cargando...';
    // Bloquear ambos botones mientras carga
    setLoadingState(btnFijos, btnPrevision, true);
  }

  try {
    console.log('👥 Cargando fijos desde scraper de Render...');
    // Añadir timestamp para evitar caché
    var renderUrl = 'https://noray-scraper.onrender.com/api/chapero?t=' + Date.now();
    var response = await fetch(renderUrl, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    var data = await response.json();

    if (data.success && data.fijos !== undefined) {
      console.log('✅ Fijos obtenidos:', data.fijos);

      // Rellenar fijos
      var fijosInput = document.getElementById('calc-fijos');
      if (fijosInput) {
        fijosInput.value = data.fijos;
      }

      // Mostrar estado exitoso
      if (statusDiv) {
        var fecha = new Date(data.timestamp || Date.now());
        var horaStr = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        statusDiv.innerHTML = '✅ Fijos cargados ' + horaStr;
        statusDiv.style.display = 'block';
      }

      console.log('✅ Fijos aplicados correctamente');

    } else {
      throw new Error(data.error || 'No se encontraron fijos');
    }

  } catch (error) {
    console.error('❌ Error cargando fijos:', error);
    if (statusDiv) {
      statusDiv.innerHTML = '❌ Error al cargar fijos';
      statusDiv.style.display = 'block';
    }
  } finally {
    if (btnFijos && btnPrevision) {
      btnFijos.innerHTML = '👥 Cargar Fijos';
      // Desbloquear ambos botones
      setLoadingState(btnFijos, btnPrevision, false);
    }
  }
};

// ============================================================================
// FIN NUEVAS FUNCIONES
// ============================================================================

function calcularResultadoJornada(posicionRestante) {
  // posicionRestante: cuantas posiciones faltan para llegar al usuario
  // Si es <= 0, el usuario ya esta dentro (sale contratado)
  var clase, mensaje;

  if (posicionRestante <= 0) {
    clase = 'probability-high';
    mensaje = 'Calienta que sales';
  } else if (posicionRestante <= 10) {
    clase = 'probability-medium';
    mensaje = 'Va a estar justo';
  } else {
    clase = 'probability-low';
    mensaje = 'No sales';
  }

  return { clase: clase, mensaje: mensaje, posicionRestante: posicionRestante };
}

function detectarSiguienteJornada(puertas) {
  // Orden de contratacion de jornadas
  var ordenJornadas = ['02-08', '08-14', '14-20', '20-02'];
  var siguienteJornada = null;

  // La ultima jornada que tiene datos ES la siguiente a contratar
  // (el dato de puerta indica desde donde se va a empezar a contratar)
  for (var i = 0; i < ordenJornadas.length; i++) {
    var jornada = ordenJornadas[i];
    var puertaData = puertas.find(function(p) { return p.jornada === jornada; });

    if (puertaData) {
      var puertaSP = puertaData.puertaSP;
      var puertaOC = puertaData.puertaOC;
      // Si tiene algun dato valido, esta es la siguiente jornada a contratar
      if ((puertaSP && puertaSP.trim() !== '' && parseInt(puertaSP) > 0) ||
          (puertaOC && puertaOC.trim() !== '' && parseInt(puertaOC) > 0)) {
        siguienteJornada = jornada;
      }
    }
  }

  // Si no hay ninguna con datos, asumimos que la siguiente es 02-08
  if (siguienteJornada === null) {
    return '02-08';
  }

  return siguienteJornada;
}

async function loadCalculadora() {
  var btnCalcular = document.getElementById('btn-calcular-probabilidad');
  var resultadoDiv = document.getElementById('calc-resultado');

  if (resultadoDiv) resultadoDiv.classList.add('hidden');

  // ============================================================================
  // VERIFICACIÓN DE ACCESO PREMIUM
  // ============================================================================
  if (window.FeatureLock) {
    const featureLock = new window.FeatureLock('oraculo');
    const isBloqueado = await featureLock.bloquear('#page-calculadora');

    if (isBloqueado) {
      console.log('🔒 Oráculo bloqueado para usuario sin premium');
      document.body.style.overflow = 'hidden'; // Bloquear scroll
      return; // No cargar contenido si está bloqueado
    }
  }

  // Desbloquear scroll si tiene acceso
  document.body.style.overflow = '';
  // ============================================================================

  // ============================================================================
  // AUTO-CARGA DE DATOS DE NORAY AL ABRIR EL ORÁCULO (DESHABILITADO)
  // ============================================================================
  // NOTA: Auto-carga deshabilitada para evitar bloqueos de Cloudflare
  // Los usuarios ahora deben usar los botones separados "Cargar Previsión" y "Cargar Fijos"
  // Esto evita que Cloudflare bloquee la segunda navegación en el scraper
  /*
  try {
    console.log('🔄 Auto-cargando datos de Noray desde scraper...');
    var autoLoadUrl = 'https://noray-scraper.onrender.com/api/all';
    var autoLoadResponse = await fetch(autoLoadUrl);
    var autoLoadData = await autoLoadResponse.json();

    if (autoLoadData.success && autoLoadData.demandas) {
      console.log('✅ Datos de Noray cargados automáticamente:', autoLoadData);

      // Aplicar datos automáticamente a los campos del formulario
      var demandas = autoLoadData.demandas;
      var fijos = autoLoadData.fijos || 0;

      // Actualizar campo de fijos
      var fijosInput = document.getElementById('calc-fijos');
      if (fijosInput) {
        fijosInput.value = fijos;
      }

      // Actualizar demandas de cada jornada (grúas y coches)
      if (demandas['08-14']) {
        var gruas1 = document.getElementById('calc-gruas-1');
        var coches1 = document.getElementById('calc-coches-1');
        if (gruas1) gruas1.value = demandas['08-14'].gruas || 0;
        if (coches1) coches1.value = demandas['08-14'].coches || 0;
      }
      if (demandas['14-20']) {
        var gruas2 = document.getElementById('calc-gruas-2');
        var coches2 = document.getElementById('calc-coches-2');
        if (gruas2) gruas2.value = demandas['14-20'].gruas || 0;
        if (coches2) coches2.value = demandas['14-20'].coches || 0;
      }
      if (demandas['20-02']) {
        var gruas3 = document.getElementById('calc-gruas-3');
        var coches3 = document.getElementById('calc-coches-3');
        if (gruas3) gruas3.value = demandas['20-02'].gruas || 0;
        if (coches3) coches3.value = demandas['20-02'].coches || 0;
      }

      console.log('✅ Datos aplicados automáticamente a los campos del formulario');
    }
  } catch (autoLoadError) {
    console.warn('⚠️ No se pudieron cargar automáticamente los datos de Noray:', autoLoadError.message);
    // No mostrar error al usuario, solo continuar normalmente
    // El usuario aún puede usar el botón "Cargar desde Noray" manualmente
  }
  */
  console.log('ℹ️ Auto-carga deshabilitada. Usa los botones "📊 Cargar Previsión" y "👥 Cargar Fijos" por separado.');
  // ============================================================================

  // Constantes del censo
  var LIMITE_SP = 455;
  var INICIO_OC = 456;
  var FIN_OC = 519;
  var TAMANO_SP = 455; // Posiciones 1-455
  var TAMANO_OC = 64;  // Posiciones 456-519 (519-456+1 = 64)

  // ============================================================================
  // ⚙️ CONFIGURACIÓN: FACTOR DE DISPONIBILIDAD EN SEGUNDA VUELTA DEL DÍA
  // ============================================================================
  // Cuando el censo da una vuelta completa en el mismo día (vuelve a pasar por
  // la puerta inicial), solo una parte de la gente puede trabajar un segundo turno.
  //
  // VALORES SUGERIDOS:
  // - 2.0  = Mitad de gente disponible (muy restrictivo)
  // - 1.5  = 2/3 de gente disponible (moderado)
  // - 1.25 = 80% de gente disponible (permisivo)
  // - 1.0  = Toda la gente disponible (sin restricción)
  //
  // FÓRMULA: disponibilidad_segunda_vuelta = disponibilidad_normal / FACTOR
  // Ejemplo: Si FACTOR = 2.0, un verde (1.0) pasa a valer 0.5 en segunda vuelta
  // ============================================================================
  var FACTOR_SEGUNDA_VUELTA = 2.0;  // <-- MODIFICA ESTE VALOR

  // Obtener posicion del usuario
  var posicionUsuario = await SheetsAPI.getPosicionChapa(AppState.currentUser);
  var esUsuarioOC = posicionUsuario > LIMITE_SP;

  // Obtener censo para calcular rojos (no disponibles)
  var censoData = await SheetsAPI.getCenso();

  // Separar censo SP y OC
  var censoSP = censoData.filter(function(item) { return item.posicion <= LIMITE_SP; });
  var censoOC = censoData.filter(function(item) { return item.posicion > LIMITE_SP; });

  // Obtener puertas para detectar siguiente jornada
  var puertasResult = await SheetsAPI.getPuertas();
  var puertas = puertasResult.puertas;
  var puertasLaborables = puertas.filter(function(p) { return p.jornada !== 'Festivo'; });

  // Detectar siguiente jornada a contratar
  var siguienteJornada = detectarSiguienteJornada(puertasLaborables);
  console.log('Siguiente jornada a contratar:', siguienteJornada);

  // Determinar que jornadas mostrar segun el caso
  // SP: solo 3 jornadas (08-14, 14-20, 20-02) - los inputs van de 1 a 3
  // OC: 4 jornadas con demanda fija (08-14=15, 14-20=15, 20-02=15, 02-08=5)
  var jornadasConfigSP = {
    '08-14': [
      { id: '1', nombre: 'Manana (08-14)', codigo: '08-14', activa: true, pedirFijos: true },
      { id: '2', nombre: 'Tarde (14-20)', codigo: '14-20', activa: true, pedirFijos: false },
      { id: '3', nombre: 'Noche (20-02)', codigo: '20-02', activa: true, pedirFijos: false }
    ],
    '14-20': [
      { id: '1', nombre: 'Tarde (14-20)', codigo: '14-20', activa: true, pedirFijos: true },
      { id: '2', nombre: 'Noche (20-02)', codigo: '20-02', activa: true, pedirFijos: false }
    ],
    '20-02': [
      { id: '1', nombre: 'Noche (20-02)', codigo: '20-02', activa: true, pedirFijos: true }
    ],
    '02-08': [
      { id: '1', nombre: 'Manana (08-14)', codigo: '08-14', activa: true, pedirFijos: true },
      { id: '2', nombre: 'Tarde (14-20)', codigo: '14-20', activa: true, pedirFijos: false },
      { id: '3', nombre: 'Noche (20-02)', codigo: '20-02', activa: true, pedirFijos: false }
    ]
  };

  var jornadasConfigOC = {
    '08-14': [
      { nombre: 'Manana (08-14)', codigo: '08-14', activa: true, demandaOC: 15 },
      { nombre: 'Tarde (14-20)', codigo: '14-20', activa: true, demandaOC: 15 },
      { nombre: 'Noche (20-02)', codigo: '20-02', activa: true, demandaOC: 15 },
      { nombre: 'Super (02-08)', codigo: '02-08', activa: true, demandaOC: 5 }
    ],
    '14-20': [
      { nombre: 'Tarde (14-20)', codigo: '14-20', activa: true, demandaOC: 15 },
      { nombre: 'Noche (20-02)', codigo: '20-02', activa: true, demandaOC: 15 },
      { nombre: 'Super (02-08)', codigo: '02-08', activa: true, demandaOC: 5 }
    ],
    '20-02': [
      { nombre: 'Noche (20-02)', codigo: '20-02', activa: true, demandaOC: 15 },
      { nombre: 'Super (02-08)', codigo: '02-08', activa: true, demandaOC: 5 }
    ],
    '02-08': [
      { nombre: 'Manana (08-14)', codigo: '08-14', activa: true, demandaOC: 15 },
      { nombre: 'Tarde (14-20)', codigo: '14-20', activa: true, demandaOC: 15 },
      { nombre: 'Noche (20-02)', codigo: '20-02', activa: true, demandaOC: 15 },
      { nombre: 'Super (02-08)', codigo: '02-08', activa: true, demandaOC: 5 }
    ]
  };

  var jornadasConfig = esUsuarioOC ? jornadasConfigOC : jornadasConfigSP;

  var jornadasAMostrar = jornadasConfig[siguienteJornada] || jornadasConfig['08-14'];

  // Para OC: ocultar inputs de demanda y mostrar mensaje
  var fijosCard = document.querySelector('.calculator-card');
  var jornadaCards = document.querySelectorAll('.jornada-input-card');

  if (esUsuarioOC) {
    // Ocultar card de fijos para OC
    var fijosInput = document.getElementById('calc-fijos');
    if (fijosInput) {
      var fijosGrid = fijosInput.closest('.calc-grid');
      if (fijosGrid) fijosGrid.style.display = 'none';
    }
    // Ocultar completamente los inputs de demanda para OC
    jornadaCards.forEach(function(card) {
      card.style.display = 'none';
    });
  } else {
    // SP: Mostrar inputs normalmente y limpiar mensajes de OC si existian
    var fijosInput = document.getElementById('calc-fijos');
    if (fijosInput) {
      var fijosGrid = fijosInput.closest('.calc-grid');
      if (fijosGrid) fijosGrid.style.display = '';
    }
    // Mostrar cards y limpiar mensajes de OC
    jornadaCards.forEach(function(card) {
      card.style.display = '';
      card.querySelectorAll('input').forEach(function(input) {
        input.disabled = false;
        input.style.opacity = '1';
      });
      card.querySelectorAll('.step-btn').forEach(function(btn) {
        btn.disabled = false;
      });
      // Eliminar mensaje de OC si existe
      var ocMsg = card.querySelector('.oc-info');
      if (ocMsg) {
        ocMsg.remove();
      }
    });
  }

  // Actualizar UI para marcar jornadas inactivas (ya contratadas)
  jornadasAMostrar.forEach(function(jornada, index) {
    var card = jornadaCards[index];
    if (card) {
      if (!jornada.activa) {
        card.classList.add('jornada-contratada');
        card.querySelectorAll('input').forEach(function(input) {
          input.disabled = true;
          input.value = 0;
        });
        card.querySelectorAll('.step-btn').forEach(function(btn) {
          btn.disabled = true;
        });
      } else if (!esUsuarioOC) {
        card.classList.remove('jornada-contratada');
        card.querySelectorAll('input').forEach(function(input) {
          input.disabled = false;
        });
        card.querySelectorAll('.step-btn').forEach(function(btn) {
          btn.disabled = false;
        });
      }
    }
  });

  if (btnCalcular) {
    var newBtn = btnCalcular.cloneNode(true);
    btnCalcular.parentNode.replaceChild(newBtn, btnCalcular);

    newBtn.addEventListener('click', async function() {
      var fijos = parseInt(document.getElementById('calc-fijos').value) || 0;

      newBtn.innerHTML = 'Calculando...';
      newBtn.disabled = true;

      try {
        // Obtener puerta actual y posicion del usuario
        var puertaActual = 0;
        var puertaData = puertasLaborables.find(function(p) { return p.jornada === siguienteJornada; });
        if (puertaData) {
          puertaActual = parseInt(esUsuarioOC ? puertaData.puertaOC : puertaData.puertaSP) || 0;
        }

        var tamanoCenso = esUsuarioOC ? TAMANO_OC : TAMANO_SP;
        var censoActual = esUsuarioOC ? censoOC : censoSP;

        // Limites del censo actual
        var limiteInicio = esUsuarioOC ? INICIO_OC : 1;
        var limiteFin = esUsuarioOC ? FIN_OC : LIMITE_SP;

        // Funcion para obtener posicion absoluta
        function getPosAbsoluta(item) {
          return item.posicion;
        }

        // Funcion para verificar si una posicion esta disponible
        function estaDisponible(posicion) {
          var item = censoActual.find(function(c) { return c.posicion === posicion; });
          return item && item.color !== 'red';
        }

        // Funcion para obtener el peso de disponibilidad segun el color
        function getPesoDisponibilidad(posicion) {
          var item = censoActual.find(function(c) { return c.posicion === posicion; });
          if (!item) return 0;

          // Pesos segun disponibilidad:
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
        }

        // Contar total de rojos en el censo
        var totalRojos = censoActual.filter(function(item) { return item.color === 'red'; }).length;
        var totalDisponibles = tamanoCenso - totalRojos;

        // Funcion para contar disponibles entre dos posiciones (en posiciones absolutas)
        // Ahora tiene en cuenta fracciones segun el color de disponibilidad
        function contarDisponiblesEntre(desde, hasta) {
          var disponibles = 0;

          if (desde <= hasta) {
            // Rango directo
            for (var pos = desde + 1; pos <= hasta; pos++) {
              disponibles += getPesoDisponibilidad(pos);
            }
          } else {
            // Rango con vuelta: desde -> fin + inicio -> hasta
            for (var pos = desde + 1; pos <= limiteFin; pos++) {
              disponibles += getPesoDisponibilidad(pos);
            }
            for (var pos = limiteInicio; pos <= hasta; pos++) {
              disponibles += getPesoDisponibilidad(pos);
            }
          }

          return disponibles;
        }

        // Funcion para calcular distancia efectiva hasta usuario (considerando pesos de disponibilidad)
        // IMPORTANTE: Ahora sumamos el peso de disponibilidad del usuario segun su color
        function calcularDistanciaEfectiva(puerta, usuario) {
          var distancia;
          if (usuario > puerta) {
            // Usuario esta delante
            distancia = contarDisponiblesEntre(puerta, usuario);
          } else if (usuario < puerta) {
            // Usuario esta detras, hay que dar la vuelta
            distancia = contarDisponiblesEntre(puerta, limiteFin) + contarDisponiblesEntre(limiteInicio - 1, usuario);
          } else {
            // Misma posicion
            return 0;
          }

          // Sumar el peso de disponibilidad del propio usuario
          // Esto incluye al usuario en el conteo con su peso correspondiente
          var pesoUsuario = getPesoDisponibilidad(usuario);
          distancia += pesoUsuario;

          return distancia;
        }

        // Funcion para detectar si el usuario esta "justo detras" de la puerta
        // Es decir, la puerta acaba de pasar al usuario (diferencia pequena en sentido circular)
        function usuarioJustoDetras(puerta, usuario, umbral) {
          umbral = umbral || 10; // Por defecto, considerar "justo detras" si esta a menos de 10 posiciones
          if (usuario < puerta) {
            // Usuario detras de la puerta en el mismo ciclo
            var distanciaDirecta = puerta - usuario;
            return distanciaDirecta <= umbral;
          } else if (usuario > puerta) {
            // Usuario delante, verificar si la puerta acaba de dar la vuelta
            // ej: puerta en 5, usuario en 440, la puerta paso de 443 a 1
            var distanciaVuelta = (limiteFin - usuario) + (puerta - limiteInicio) + 1;
            return distanciaVuelta <= umbral;
          }
          return true; // Misma posicion
        }

        // Funcion para verificar si el usuario sale contratado
        // Avanza posicion por posicion, contando solo disponibles
        // IMPORTANTE: Detecta si la puerta PASA por el usuario, este disponible o no
        function verificarContratacion(puertaInicio, demanda, usuario, puertaInicialDia) {
          var posActual = puertaInicio;
          var contratados = 0;
          var vueltas = 0;
          var usuarioAlcanzado = false;
          var puertaPasoPorUsuario = false; // Nueva variable: la puerta paso por la posicion del usuario
          var maxIteraciones = tamanoCenso * 3;
          var iteraciones = 0;
          var yaEsSegundaVuelta = false; // Para controlar cuando empezamos a aplicar el factor

          // CASO ESPECIAL: Si el usuario esta justo en la puerta de inicio,
          // debemos detectarlo ANTES de empezar el bucle
          if (posActual === usuario) {
            puertaPasoPorUsuario = true;
            var pesoInicial = getPesoDisponibilidad(usuario);
            if (pesoInicial > 0) {
              usuarioAlcanzado = true;
            }
          }

          while (contratados < demanda && iteraciones < maxIteraciones) {
            posActual++;
            if (posActual > limiteFin) {
              posActual = limiteInicio;
              vueltas++;
            }

            // ============================================================================
            // DETECCIÓN DE SEGUNDA VUELTA DEL DÍA
            // ============================================================================
            // La segunda vuelta se activa cuando:
            // 1. Ya se ha dado al menos UNA vuelta completa del censo (vueltas > 0)
            // 2. La puerta vuelve a pasar por la puerta inicial del día (02-08)
            //
            // Ejemplo: Si puerta inicial del día es 334
            // - Primera pasada: 334 -> 443 -> 1 -> 333 (aún primera vuelta)
            // - Al llegar a 334 otra vez: AHORA empieza segunda vuelta
            //
            // En segunda vuelta: disponibilidad se divide por FACTOR_SEGUNDA_VUELTA
            // ============================================================================
            if (!yaEsSegundaVuelta && vueltas > 0 && posActual >= puertaInicialDia) {
              yaEsSegundaVuelta = true;
            }

            // Verificar si la puerta pasa por la posicion del usuario (este o no disponible)
            if (posActual === usuario) {
              puertaPasoPorUsuario = true;
            }

            // Obtener peso de disponibilidad (0, 0.25, 0.5, 0.75, 1.0)
            var pesoDisponibilidad = getPesoDisponibilidad(posActual);

            // Si es segunda vuelta del dia, aplicar factor de reducción
            // (solo una parte de la gente puede trabajar un segundo turno)
            if (yaEsSegundaVuelta && pesoDisponibilidad > 0) {
              pesoDisponibilidad = pesoDisponibilidad / FACTOR_SEGUNDA_VUELTA;
            }

            // Sumar peso fraccional de disponibilidad
            if (pesoDisponibilidad > 0) {
              contratados += pesoDisponibilidad;

              // Si llegamos al usuario y tiene disponibilidad, lo alcanzamos
              if (posActual === usuario && pesoDisponibilidad > 0) {
                usuarioAlcanzado = true;
              }
            }
            // Si esta en rojo (peso 0), la puerta avanza pero no cuenta como contratado

            iteraciones++;
          }

          return {
            alcanzado: usuarioAlcanzado,
            puertaPasoPorUsuario: puertaPasoPorUsuario, // La puerta paso por el usuario aunque este en rojo
            puertaFinal: posActual,
            vueltas: vueltas,
            contratados: contratados,
            yaEsSegundaVuelta: yaEsSegundaVuelta
          };
        }

        var resultadosHTML = '';
        var esPrimeraJornadaActiva = true;
        var puertaPrevista = puertaActual;
        var puertaInicialDia = puertaActual; // Guardar puerta al inicio del dia

        // Posicion del usuario para calculos (posicion REAL, no relativa)
        var posUsuarioCalc = posicionUsuario;

        // Acumulador de demanda para saber cuando da la vuelta
        var demandaAcumulada = 0;

        // Array para guardar puntuaciones de cada jornada (luego normalizamos a 100%)
        var puntuacionesJornadas = [];

        for (var i = 0; i < jornadasAMostrar.length; i++) {
          var jornada = jornadasAMostrar[i];

          // Si la jornada ya se contrato, NO mostrar
          if (!jornada.activa) {
            continue;
          }

          // Obtener demanda
          var demandaTotal;
          if (esUsuarioOC) {
            // Para OC: ajustar demanda segun fijos disponibles
            // IMPORTANTE: Para el calculo se usa solo la MITAD de los fijos disponibles
            var demandaBase = jornada.demandaOC;
            var ajusteFijos = 0;
            var fijosParaCalculoOC = Math.floor(fijos / 2); // Usar solo la mitad de fijos para el calculo

            // Solo ajustar la primera jornada activa
            if (esPrimeraJornadaActiva) {
              if (fijosParaCalculoOC > 50) {
                ajusteFijos = 10;
              } else if (fijosParaCalculoOC > 25) {
                ajusteFijos = 5;
              }
            }

            demandaTotal = Math.max(0, demandaBase - ajusteFijos);
          } else {
            // Mapear codigo de jornada a numero de input fijo
            var inputMap = {
              '08-14': '1',
              '14-20': '2',
              '20-02': '3'
            };
            var inputNum = inputMap[jornada.codigo];
            var gruas = parseInt(document.getElementById('calc-gruas-' + inputNum).value) || 0;
            var coches = parseInt(document.getElementById('calc-coches-' + inputNum).value) || 0;
            demandaTotal = (gruas * 7) + coches;
          }

          if (demandaTotal === 0 && !esUsuarioOC) {
            puntuacionesJornadas.push({
              jornada: jornada,
              puntuacion: 0,
              sinDatos: true,
              puertaAntes: puertaPrevista,
              puertaDespues: puertaPrevista,
              distanciaNecesaria: 0,
              demandaEventuales: 0,
              vuelta: 1,
              saleContratado: false,
              margen: 0
            });
            continue;
          }

          // Calcular demanda para eventuales (restar fijos solo en primera jornada activa, solo SP)
          // IMPORTANTE: Para el calculo se usa solo la MITAD de los fijos disponibles
          // porque historicamente solo la mitad de los fijos realmente se presentan
          var demandaEventuales;
          if (!esUsuarioOC && esPrimeraJornadaActiva) {
            var fijosParaCalculo = Math.floor(fijos / 2); // Usar solo la mitad de fijos para el calculo
            demandaEventuales = Math.max(0, demandaTotal - fijosParaCalculo);
            esPrimeraJornadaActiva = false;
          } else {
            demandaEventuales = demandaTotal;
            if (esUsuarioOC && esPrimeraJornadaActiva) {
              esPrimeraJornadaActiva = false;
            }
          }

          // Guardar puerta antes del avance
          var puertaAntes = puertaPrevista;

          // Verificar si el usuario sale contratado usando la funcion que recorre el censo
          // Pasamos puertaInicialDia para detectar cuando empieza la segunda vuelta del día
          var resultadoContratacion = verificarContratacion(puertaAntes, demandaEventuales, posUsuarioCalc, puertaInicialDia);

          puertaPrevista = resultadoContratacion.puertaFinal;
          var vuelta = resultadoContratacion.vueltas + 1;
          var saleContratado = resultadoContratacion.alcanzado;
          var puertaPasoPorUsuario = resultadoContratacion.puertaPasoPorUsuario;
          var esSegundaVueltaDia = resultadoContratacion.yaEsSegundaVuelta;

          // Calcular cuantas posiciones disponibles faltan para llegar al usuario
          var distanciaNecesaria = calcularDistanciaEfectiva(puertaAntes, posUsuarioCalc);

          // Acumular demanda
          demandaAcumulada += demandaEventuales;

          // IMPORTANTE: Para el calculo de probabilidades, usamos puertaPasoPorUsuario
          // Esto hace que usuarios en rojo tengan la misma probabilidad que si estuvieran disponibles
          // porque la puerta pasa igualmente por su posicion
          var usarLogicaContratado = saleContratado || puertaPasoPorUsuario;

          // Calcular margen
          var margen;
          if (usarLogicaContratado) {
            var posicionesHastaUsuario = calcularDistanciaEfectiva(puertaAntes, posUsuarioCalc);
            margen = demandaEventuales - posicionesHastaUsuario;
          } else {
            margen = demandaEventuales - distanciaNecesaria;
          }

          // Calcular probabilidad BASE de salir en esta jornada (0 a 1)
          // Usamos una funcion suave basada en el margen
          var probBaseSalir;

          // Detectar si es DOBLE TURNO REAL (segunda vuelta del censo en el dia)
          // Esto ocurre cuando la puerta ya ha recorrido todo el censo una vez
          // y vuelve a pasar por las mismas posiciones
          var esSegundaVueltaCenso = vuelta >= 3;

          // CASO ESPECIAL: Si el usuario esta "justo detras" de la puerta al inicio de esta jornada,
          // significa que en jornadas anteriores la puerta paso justo por delante del usuario.
          // En este caso, la demanda de esta jornada lo alcanzara casi seguro.
          var estaJustoDetras = usuarioJustoDetras(puertaAntes, posUsuarioCalc, 15);
          var distanciaDirectaDetras = 0;
          if (posUsuarioCalc < puertaAntes) {
            distanciaDirectaDetras = puertaAntes - posUsuarioCalc;
          }

          if (usarLogicaContratado) {
            // La puerta pasa por el usuario: probabilidad usando formula continua y suave
            // Basada en el ratio margen/demanda para ser proporcional
            // Esto evita saltos bruscos entre posiciones contiguas
            var ratioMargen = margen / Math.max(1, demandaEventuales);

            // Formula sigmoide suavizada: va de ~40% (ratio=0) a ~85% (ratio=1)
            // prob = 0.40 + 0.45 * (ratio / (ratio + 0.3))
            // Esto da una curva suave sin saltos
            if (ratioMargen >= 1) {
              // Margen >= demanda, muy seguro pero nunca 100%
              probBaseSalir = 0.82 + Math.min(0.06, (ratioMargen - 1) * 0.03);
            } else if (ratioMargen >= 0) {
              // Formula suave: 42% base + hasta 40% segun ratio
              probBaseSalir = 0.42 + 0.40 * (ratioMargen / (ratioMargen + 0.25));
            } else {
              // Margen negativo (muy justo)
              probBaseSalir = 0.38;
            }

            // Ajuste para OC con margen pequeño
            if (esUsuarioOC && margen <= 3) {
              probBaseSalir = Math.min(probBaseSalir, 0.45 + margen * 0.02);
            }
          } else {
            // No sale contratado segun la simulacion directa
            // La puerta NO pasa por el usuario en esta jornada
            // Calcular probabilidad segun lo cerca que se queda

            var posicionRestante = posUsuarioCalc - puertaPrevista;
            if (posicionRestante < 0) {
              // La puerta pasó de largo (dio vuelta), calcular distancia real
              posicionRestante = (limiteFin - puertaPrevista) + (posUsuarioCalc - limiteInicio) + 1;
            }

            // IMPORTANTE: Calcular ratio de cobertura (cuánto de la distancia cubre la demanda)
            var ratioCobertura = demandaEventuales / Math.max(1, distanciaNecesaria);

            // PROBABILIDAD SUAVE Y PROGRESIVA según distancia
            // Ajustada para ser más realista con distancias cortas
            if (posicionRestante <= 10) {
              // Muy cerca (1-10 posiciones), prob muy alta
              probBaseSalir = 0.60 + (10 - posicionRestante) * 0.015; // 60-75%
            } else if (posicionRestante <= 30) {
              // Cerca (11-30 posiciones), prob alta
              probBaseSalir = 0.45 + (30 - posicionRestante) * 0.0075; // 45-60%
            } else if (posicionRestante <= 50) {
              // Rango cercano-medio (31-50 posiciones), prob media-alta
              probBaseSalir = 0.32 + (50 - posicionRestante) * 0.0065; // 32-45%
            } else if (posicionRestante <= 80) {
              // Algo lejos (51-80 posiciones), prob media
              probBaseSalir = 0.18 + (80 - posicionRestante) * 0.0047; // 18-32%
            } else if (posicionRestante <= 120) {
              // Lejos (81-120 posiciones), prob media-baja
              probBaseSalir = 0.08 + (120 - posicionRestante) * 0.0025; // 8-18%
            } else if (posicionRestante <= 180) {
              // Muy lejos (121-180 posiciones), prob baja
              probBaseSalir = Math.min(0.05, Math.max(0.02, ratioCobertura * 0.15)); // 2-5%
            } else {
              // Extremadamente lejos (>180 posiciones), prob muy baja
              probBaseSalir = Math.min(0.02, Math.max(0.005, ratioCobertura * 0.08)); // 0.5-2%
            }

            // PENALIZACIÓN por cobertura insuficiente (AJUSTADA)
            // Solo penalizar si la puerta se quedó MUY lejos (>80 posiciones)
            // Si se quedó cerca (<50 posiciones), NO penalizar porque la demanda fue efectiva
            if (ratioCobertura < 1.0 && posicionRestante > 80) {
              // La demanda NO alcanza Y la puerta se quedó MUY lejos
              // Penalizar según qué tan lejos quedó
              var factorPenalizacion = Math.max(0.20, Math.min(0.75, ratioCobertura * 0.85));
              probBaseSalir = probBaseSalir * factorPenalizacion;
            } else if (ratioCobertura < 0.7 && posicionRestante > 50 && posicionRestante <= 80) {
              // Distancia media (50-80) con demanda muy baja (<70% de cobertura)
              // Penalización moderada
              var factorPenalizacion = Math.max(0.50, ratioCobertura * 1.2);
              probBaseSalir = probBaseSalir * factorPenalizacion;
            }
            // Si posicionRestante <= 50: NO penalizar, la demanda fue suficiente para llegar cerca
          }

          // IMPORTANTE: Dar prioridad a la jornada inmediatamente siguiente
          // Si esta NO es la primera jornada y hay probabilidad residual de jornadas anteriores,
          // esta jornada (la siguiente) deberia capturar la mayor parte de esa probabilidad.
          // Guardamos el indice para aplicar este ajuste despues del bucle

          // NOTA: Ya no penalizamos por "segunda vuelta" aqui
          // La segunda vuelta solo aplica si YA trabajaste en el dia (doble turno)
          // Eso se maneja en otro lugar, no en el calculo de probabilidad base

          // IMPORTANTE: Asegurar que probBaseSalir este siempre en rango valido [0, 0.99]
          probBaseSalir = Math.max(0, Math.min(0.99, probBaseSalir));

          // Guardar datos de esta jornada
          puntuacionesJornadas.push({
            jornada: jornada,
            probBaseSalir: probBaseSalir,
            sinDatos: false,
            puertaAntes: puertaAntes,
            puertaDespues: puertaPrevista,
            distanciaNecesaria: distanciaNecesaria,
            demandaEventuales: demandaEventuales,
            vuelta: vuelta,
            saleContratado: saleContratado,
            puertaPasoPorUsuario: puertaPasoPorUsuario,
            usarLogicaContratado: usarLogicaContratado,
            margen: margen,
            esSegundaVueltaDia: esSegundaVueltaDia
          });
        }

        // SISTEMA SIMPLIFICADO DE PROBABILIDADES
        // PRIORIDAD: Si la puerta PASA por el usuario en una jornada, esa debe tener prob muy alta

        var demandaTotalDia = 0;
        var primeraJornadaConDatos = -1;
        var primeraJornadaQueAlcanza = -1; // Primera jornada donde la puerta pasa por el usuario

        for (var j = 0; j < puntuacionesJornadas.length; j++) {
          if (!puntuacionesJornadas[j].sinDatos) {
            demandaTotalDia += puntuacionesJornadas[j].demandaEventuales;
            if (primeraJornadaConDatos === -1) {
              primeraJornadaConDatos = j;
            }
            // Detectar primera jornada que alcanza al usuario
            if (primeraJornadaQueAlcanza === -1 && puntuacionesJornadas[j].usarLogicaContratado) {
              primeraJornadaQueAlcanza = j;
            }
          }
        }

        // Distancia inicial desde la puerta al usuario (primera jornada)
        var distanciaInicial = primeraJornadaConDatos >= 0 ?
          puntuacionesJornadas[primeraJornadaConDatos].distanciaNecesaria : 999;

        // Cobertura total: cuantas veces la demanda del dia cubre la distancia al usuario
        var coberturaTotalDia = demandaTotalDia / Math.max(1, distanciaInicial);

        // Probabilidades condicionales mejoradas
        var probabilidadesFinales = [];
        var probAcumuladaNoSalir = 1.0;

        for (var j = 0; j < puntuacionesJornadas.length; j++) {
          var datos = puntuacionesJornadas[j];

          if (datos.sinDatos) {
            probabilidadesFinales.push({
              datos: datos,
              probabilidad: 0,
              sinDatos: true
            });
            continue;
          }

          var probBaseSalirAjustada = datos.probBaseSalir;

          // ============================================================================
          // AJUSTE SUAVE Y PROGRESIVO: Distribuir probabilidad cuando hay transición cerca
          // Si una jornada se quedó cerca pero no llega, y la siguiente pasa pero por poco,
          // las probabilidades deben ser similares (progresión suave)
          // ============================================================================

          // BOOST para última jornada cuando la cobertura total es alta
          // Si es la última jornada con datos y la cobertura >= 1.0, significa que
          // al final del día la puerta pasará al usuario, así que esta jornada
          // debe capturar la probabilidad residual
          var esUltimaJornada = (j === puntuacionesJornadas.length - 1) ||
                                (j < puntuacionesJornadas.length - 1 && puntuacionesJornadas[j+1].sinDatos);

          if (esUltimaJornada && !datos.usarLogicaContratado && coberturaTotalDia >= 1.0) {
            // La puerta pasará al usuario al final del día, pero no en esta jornada específica
            // Aumentar la probabilidad proporcionalmente a la cobertura
            var boostUltimaJornada = Math.min(0.55, 0.20 + (coberturaTotalDia - 1.0) * 0.20);
            probBaseSalirAjustada = Math.max(probBaseSalirAjustada, boostUltimaJornada);
          }

          // Detectar si la jornada ANTERIOR se quedó relativamente cerca pero no llegó
          var jornadaAnteriorCerca = false;
          var distanciaFaltanteAnterior = 0;
          if (j > 0 && !puntuacionesJornadas[j-1].sinDatos && !puntuacionesJornadas[j-1].usarLogicaContratado) {
            var anterior = puntuacionesJornadas[j-1];
            // La distancia que falta es la distanciaNecesaria de la jornada actual
            // (desde donde empieza esta jornada hasta el usuario)
            distanciaFaltanteAnterior = datos.distanciaNecesaria;

            // Considerar "cerca" solo hasta 35 posiciones efectivas (muy restrictivo)
            // Este sistema de equilibrio solo debe aplicarse en casos EXTREMADAMENTE ajustados
            if (distanciaFaltanteAnterior <= 35) {
              jornadaAnteriorCerca = true;
            }
          }

          // CASO 1: Esta jornada SÍ alcanza al usuario
          if (datos.usarLogicaContratado) {
            // Si la anterior se quedó cerca Y esta pasa por poco margen
            // Margen <= 8 significa que esta jornada pasa por MUY poco (extremadamente restrictivo)
            if (jornadaAnteriorCerca && datos.margen <= 8) {
              // Ambas están en zona de transición → equilibrar probabilidades
              // Cuanto más cerca se quedó la anterior y menos margen tiene esta, más reducir
              var ratioEquilibrio = distanciaFaltanteAnterior / Math.max(1, datos.margen);

              // IMPORTANTE: Solo equilibrar si el ratio indica transición MUY real
              // Este sistema fue diseñado para casos EXTREMADAMENTE ajustados
              // Si ratio < 0.75: esta jornada tiene bastante margen, NO reducir
              // Si ratio > 1.35: la anterior falló por suficiente diferencia, NO reducir
              // Solo equilibrar si ratio está entre 0.75 y 1.35 (zona crítica)
              if (ratioEquilibrio >= 0.75 && ratioEquilibrio <= 1.35) {
                // Reducir proporcionalmente al ratio
                // Ratio alto (anterior muy cerca, esta con poco margen) = reducir más
                // Si ratio ≈ 1: factor 0.85 (reducir 15%)
                // Si ratio ≈ 1.3: factor 0.75 (reducir 25%)
                // Si ratio < 1: factor 0.92 (reducir 8%)
                var factorReduccion = Math.max(0.70, Math.min(0.95, 0.88 - (ratioEquilibrio - 1) * 0.12));
                probBaseSalirAjustada = datos.probBaseSalir * factorReduccion;
              }
            }
          }
          // CASO 2: Esta jornada NO alcanza
          else {
            // Ver si la SIGUIENTE jornada sí alcanza y por poco
            if (j < puntuacionesJornadas.length - 1 && !puntuacionesJornadas[j+1].sinDatos) {
              var siguiente = puntuacionesJornadas[j+1];
              var distanciaFaltante = datos.distanciaNecesaria;

              // Si la siguiente SÍ alcanza con poco margen Y nosotros nos quedamos cerca
              // Considerar "cerca" solo hasta 35 posiciones efectivas (muy restrictivo)
              // Margen <= 8 significa que la siguiente pasa por MUY poco (extremadamente restrictivo)
              if (siguiente.usarLogicaContratado && siguiente.margen <= 8 && distanciaFaltante <= 35) {
                // Calcular ratio para verificar si realmente están en zona de transición
                var ratioEquilibrio = distanciaFaltante / Math.max(1, siguiente.margen);

                // IMPORTANTE: Solo equilibrar si el ratio indica transición MUY real
                // Este sistema fue diseñado para casos EXTREMADAMENTE ajustados
                // Si ratio > 1.25: esta jornada falló por suficiente diferencia, NO aumentar
                // Si ratio < 0.75: la siguiente tiene mucho margen, NO aumentar
                // Solo equilibrar si ratio está entre 0.75 y 1.25 (zona crítica)
                if (ratioEquilibrio >= 0.75 && ratioEquilibrio <= 1.25) {
                  // Aumentar probabilidad de esta jornada para equilibrar
                  // Aumentar más cuando estamos muy cerca y la siguiente tiene poco margen
                  // Si distanciaFaltante ≈ margen siguiente: aumentar moderadamente
                  var factorAumento = Math.max(1.15, Math.min(1.50, 1.30 + (1 - ratioEquilibrio) * 0.25));
                  probBaseSalirAjustada = Math.min(0.58, datos.probBaseSalir * factorAumento);
                }
              }
            }
          }

          // Asegurar rango valido
          probBaseSalirAjustada = Math.max(0, Math.min(0.95, probBaseSalirAjustada));

          // Probabilidad de salir en esta jornada
          var probEstaJornada = probAcumuladaNoSalir * probBaseSalirAjustada;

          // Actualizar probabilidad acumulada de no salir
          probAcumuladaNoSalir = probAcumuladaNoSalir * (1 - probBaseSalirAjustada);
          probAcumuladaNoSalir = Math.max(0, probAcumuladaNoSalir);

          probabilidadesFinales.push({
            datos: datos,
            probabilidad: probEstaJornada,
            sinDatos: false
          });
        }

        // La probabilidad de no trabajar
        var probNoTrabajar = probAcumuladaNoSalir;

        // Si la cobertura total es muy alta, forzar prob de no trabajar a ser baja
        // Cobertura >= 1.0 significa que al final del día la puerta pasará al usuario
        if (coberturaTotalDia >= 2.5) {
          probNoTrabajar = Math.min(probNoTrabajar, 0.015); // 1.5% máximo
        } else if (coberturaTotalDia >= 2.0) {
          probNoTrabajar = Math.min(probNoTrabajar, 0.02); // 2% máximo
        } else if (coberturaTotalDia >= 1.7) {
          probNoTrabajar = Math.min(probNoTrabajar, 0.03); // 3% máximo
        } else if (coberturaTotalDia >= 1.5) {
          probNoTrabajar = Math.min(probNoTrabajar, 0.04); // 4% máximo
        } else if (coberturaTotalDia >= 1.2) {
          probNoTrabajar = Math.min(probNoTrabajar, 0.06); // 6% máximo
        } else if (coberturaTotalDia >= 1.0) {
          probNoTrabajar = Math.min(probNoTrabajar, 0.08); // 8% máximo
        }

        // Normalizar para que sumen 100%
        var sumaProbs = probNoTrabajar;
        for (var j = 0; j < probabilidadesFinales.length; j++) {
          if (!probabilidadesFinales[j].sinDatos) {
            sumaProbs += probabilidadesFinales[j].probabilidad;
          }
        }

        // Proteger contra sumaProbs muy pequena o invalida
        if (sumaProbs < 0.001 || isNaN(sumaProbs)) {
          sumaProbs = 1;
        }

        // Convertir a porcentajes
        var mejorJornada = null;
        var mejorProbabilidad = 0;

        for (var j = 0; j < probabilidadesFinales.length; j++) {
          var item = probabilidadesFinales[j];
          var datos = item.datos;

          if (item.sinDatos) {
            resultadosHTML += '<div class="calc-resultado-item probability-none"><div class="resultado-header"><span class="resultado-jornada">' + datos.jornada.nombre + '</span></div><div class="resultado-mensaje">Sin datos</div><div class="resultado-detalle">Introduce la demanda</div></div>';
            continue;
          }

          // Calcular probabilidad normalizada como porcentaje
          var probabilidad = Math.round((item.probabilidad / sumaProbs) * 100);

          // Asegurar que el porcentaje este en rango valido [0, 100]
          probabilidad = Math.max(0, Math.min(100, probabilidad));

          // Determinar clase y mensaje segun rangos:
          // 80-100: Calienta que sales (verde claro)
          // 60-80: Bastante probable (verde oscuro)
          // 40-60: Va a estar justo (amarillo)
          // 20-40: Poco probable (naranja)
          // 0-20: Dificil (rojo)
          var clase, mensaje;
          if (probabilidad >= 80) {
            clase = 'probability-very-high';
            mensaje = 'Calienta que sales';
          } else if (probabilidad >= 60) {
            clase = 'probability-high';
            mensaje = 'Bastante probable';
          } else if (probabilidad >= 40) {
            clase = 'probability-medium';
            mensaje = 'Va a estar justo';
          } else if (probabilidad >= 20) {
            clase = 'probability-low-medium';
            mensaje = 'Poco probable';
          } else {
            clase = 'probability-low';
            mensaje = 'Dificil';
          }

          if (probabilidad > mejorProbabilidad) {
            mejorProbabilidad = probabilidad;
            mejorJornada = datos.jornada.nombre;
          }

          // Mostrar info
          var infoPos = 'Puerta: ' + datos.puertaAntes + ' -> ' + datos.puertaDespues + ' | Tu pos: ' + posUsuarioCalc;
          // Mostrar (v2) solo si es segunda vuelta del DIA (no solo del censo)
          if (datos.esSegundaVueltaDia) {
            infoPos += ' (v2)';
          }
          // Redondear distanciaNecesaria para mostrar numero entero de personas
          infoPos += ' | Faltan: ' + Math.round(datos.distanciaNecesaria);

          resultadosHTML += '<div class="calc-resultado-item ' + clase + '"><div class="resultado-header"><span class="resultado-jornada">' + datos.jornada.nombre + '</span><span class="resultado-prob">' + probabilidad + '%</span></div><div class="resultado-mensaje">' + mensaje + '</div><div class="resultado-posicion">' + infoPos + ' | Demanda: ' + datos.demandaEventuales + '</div></div>';
        }

        // Calcular probabilidad de no trabajar (ya calculada arriba, convertir a porcentaje)
        var probNoTrabajarPct = Math.round((probNoTrabajar / sumaProbs) * 100);

        // Asegurar que el porcentaje de no trabajar este en rango valido [0, 100]
        probNoTrabajarPct = Math.max(0, Math.min(100, probNoTrabajarPct));

        // Resumen del dia
        var resumenMensaje = '';
        if (mejorProbabilidad >= 35) {
          resumenMensaje = 'Mejor opcion: ' + mejorJornada + ' (' + mejorProbabilidad + '%)';
        } else if (mejorProbabilidad >= 15) {
          resumenMensaje = 'Posibilidades en: ' + mejorJornada + ' (' + mejorProbabilidad + '%)';
        } else {
          resumenMensaje = 'Hoy lo tienes dificil (' + probNoTrabajarPct + '% no trabajar)';
        }

        // Mostrar posicion REAL del usuario (no relativa)
        var resumenHTML = '<div class="calc-resumen-dia"><div class="resumen-titulo">Resumen del dia</div><div class="resumen-mensaje">' + resumenMensaje + '</div><div class="resumen-posicion">Tu posicion: ' + posicionUsuario + ' | Puerta actual: ' + puertaActual + ' | No trabajar: ' + probNoTrabajarPct + '%</div></div>';

        resultadoDiv.innerHTML = resumenHTML + resultadosHTML;
        resultadoDiv.classList.remove('hidden');
        resultadoDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });

      } catch (error) {
        console.error('Error:', error);
        alert('Error al calcular: ' + error.message);
      } finally {
        newBtn.innerHTML = '¿Cuando voy a trabajar?';
        newBtn.disabled = false;
      }
    });
  }
}
