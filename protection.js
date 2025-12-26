/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  PORTAL ESTIBA VLC - Sistema de Protección                              █
 * █  Copyright © 2025 TheViking816 (Adrian Marin)                           █
 * █                                                                          █
 * █  ⚠️ CÓDIGO PROPIETARIO Y CONFIDENCIAL ⚠️                                 █
 * █                                                                          █
 * █  Este software es propiedad exclusiva de TheViking816.                  █
 * █  El uso, copia, modificación o distribución no autorizados están        █
 * █  ESTRICTAMENTE PROHIBIDOS y constituyen delito.                         █
 * █                                                                          █
 * █  Licencia: Ver archivo LICENSE para más detalles                        █
 * █  Violaciones serán perseguidas legalmente                               █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function() {
  'use strict';

  // ============================================================================
  // CONFIGURACIÓN DE PROTECCIÓN
  // ============================================================================

  const PROTECTION_CONFIG = {
    // Dominios autorizados (solo estos pueden ejecutar la app)
    AUTHORIZED_DOMAINS: [
      'portal-estiba-vlc.vercel.app',  // Vercel (URL oficial nueva)
      'theviking816.github.io',        // GitHub Pages (deprecado, solo redirección)
      'localhost',                      // Para desarrollo local
      '127.0.0.1'                       // Para desarrollo local
    ],

    // URL oficial de la aplicación
    OFFICIAL_URL: 'https://portal-estiba-vlc.vercel.app/',

    // Información del propietario
    OWNER: {
      name: 'TheViking816',
      copyright: '© 2025 TheViking816 - Todos los derechos reservados'
    },

    // Control de mensajes en consola
    CONSOLE_WARNING_ENABLED: false,
    DEVTOOLS_WARNING_ENABLED: false
  };

  // ============================================================================
  // VERIFICACIÓN DE DOMINIO
  // ============================================================================

  /**
   * Verifica que la aplicación se esté ejecutando en un dominio autorizado
   */
  function checkDomain() {
    const currentDomain = window.location.hostname;

    const isAuthorized = PROTECTION_CONFIG.AUTHORIZED_DOMAINS.some(domain =>
      currentDomain === domain || currentDomain.endsWith('.' + domain)
    );

    if (!isAuthorized) {
      // Dominio NO autorizado - mostrar advertencia y redirigir
      showUnauthorizedWarning();
      redirectToOfficial();
      return false;
    }

    return true;
  }

  /**
   * Muestra advertencia de copia no autorizada
   */
  function showUnauthorizedWarning() {
    const warningHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      ">
        <div style="
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          max-width: 500px;
          text-align: center;
        ">
          <div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
          <h1 style="color: #d32f2f; margin: 0 0 20px 0;">ADVERTENCIA LEGAL</h1>
          <h2 style="color: #333; margin: 0 0 20px 0;">Copia No Autorizada Detectada</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Este software es <strong>código propietario</strong> de <strong>TheViking816</strong>.
            <br><br>
            El uso de esta copia no autorizada constituye una violación de la
            Ley de Propiedad Intelectual y puede resultar en acciones legales.
          </p>
          <div style="
            background: #fff3cd;
            border: 2px solid #ffc107;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 20px;
          ">
            <p style="margin: 0; color: #856404; font-weight: bold;">
              Serás redirigido a la aplicación oficial en 5 segundos...
            </p>
          </div>
          <a href="${PROTECTION_CONFIG.OFFICIAL_URL}" style="
            display: inline-block;
            background: #4CAF50;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin-top: 10px;
          ">
            Ir a la App Oficial
          </a>
          <p style="
            margin-top: 20px;
            font-size: 12px;
            color: #999;
          ">
            ${PROTECTION_CONFIG.OWNER.copyright}
          </p>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', warningHTML);
  }

  /**
   * Redirige a la URL oficial después de 5 segundos
   */
  function redirectToOfficial() {
    setTimeout(() => {
      window.location.href = PROTECTION_CONFIG.OFFICIAL_URL;
    }, 5000);
  }

  // ============================================================================
  // MENSAJE DE ADVERTENCIA EN CONSOLA
  // ============================================================================

  /**
   * Muestra advertencia legal en la consola del navegador
   */
  function showConsoleWarning() {
    // Estilos para la consola
    const styles = {
      title: 'font-size: 24px; color: #d32f2f; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);',
      warning: 'font-size: 16px; color: #ff6b6b; font-weight: bold;',
      info: 'font-size: 14px; color: #495057;',
      legal: 'font-size: 12px; color: #6c757d; font-style: italic;',
      copyright: 'font-size: 14px; color: #4CAF50; font-weight: bold;'
    };

    console.clear();
    console.log('%c⚠️ ADVERTENCIA LEGAL ⚠️', styles.title);
    console.log('');
    console.log('%c┌─────────────────────────────────────────────────────────────┐', styles.warning);
    console.log('%c│                                                             │', styles.warning);
    console.log('%c│  ESTE CÓDIGO ES PROPIETARIO DE THEVIKING816                │', styles.warning);
    console.log('%c│                                                             │', styles.warning);
    console.log('%c└─────────────────────────────────────────────────────────────┘', styles.warning);
    console.log('');
    console.log('%c🚫 PROHIBICIONES:', styles.info);
    console.log('%c   ❌ Copiar, modificar o distribuir este código', styles.legal);
    console.log('%c   ❌ Uso comercial no autorizado', styles.legal);
    console.log('%c   ❌ Ingeniería inversa', styles.legal);
    console.log('%c   ❌ Crear obras derivadas', styles.legal);
    console.log('');
    console.log('%c⚖️ SANCIONES POR VIOLACIÓN:', styles.info);
    console.log('%c   • Demandas civiles por daños y perjuicios', styles.legal);
    console.log('%c   • Acciones penales (Código Penal Español, Art. 270)', styles.legal);
    console.log('%c   • Multas de hasta 600.000€', styles.legal);
    console.log('%c   • Penas de prisión de hasta 4 años', styles.legal);
    console.log('');
    console.log('%c📜 Licencia: Ver archivo LICENSE en el repositorio', styles.info);
    console.log('%c🌐 URL Oficial: ' + PROTECTION_CONFIG.OFFICIAL_URL, styles.info);
    console.log('');
    console.log('%c' + PROTECTION_CONFIG.OWNER.copyright, styles.copyright);
    console.log('');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', styles.legal);
  }

  // ============================================================================
  // MARCA DE AGUA EN EL DOM
  // ============================================================================

  /**
   * Añade marca de agua invisible en el DOM (para tracking)
   */
  function addWatermark() {
    const watermark = document.createElement('meta');
    watermark.setAttribute('name', 'copyright');
    watermark.setAttribute('content', PROTECTION_CONFIG.OWNER.copyright);
    document.head.appendChild(watermark);

    const owner = document.createElement('meta');
    owner.setAttribute('name', 'author');
    owner.setAttribute('content', PROTECTION_CONFIG.OWNER.name);
    document.head.appendChild(owner);

    // Marca de agua visual sutil (solo visible en inspección)
    const visualWatermark = document.createElement('div');
    visualWatermark.id = 'copyright-protection';
    visualWatermark.setAttribute('data-owner', PROTECTION_CONFIG.OWNER.name);
    visualWatermark.setAttribute('data-license', 'Proprietary - All Rights Reserved');
    visualWatermark.style.display = 'none';
    visualWatermark.innerHTML = PROTECTION_CONFIG.OWNER.copyright;
    document.body.appendChild(visualWatermark);
  }

  // ============================================================================
  // PROTECCIÓN CONTRA DEVTOOLS (Opcional - puede molestar a usuarios legítimos)
  // ============================================================================

  /**
   * Detecta cuando se abren las DevTools y muestra advertencia
   * NOTA: Solo muestra advertencia, NO bloquea (para no molestar a usuarios)
   */
  function detectDevTools() {
    const threshold = 160;
    let devtoolsOpen = false;

    const check = () => {
      if (window.outerWidth - window.innerWidth > threshold ||
          window.outerHeight - window.innerHeight > threshold) {
        if (!devtoolsOpen) {
          devtoolsOpen = true;
          showConsoleWarning();
        }
      } else {
        devtoolsOpen = false;
      }
    };

    // Verificar cada segundo
    setInterval(check, 1000);
  }

  // ============================================================================
  // INICIALIZACIÓN
  // ============================================================================

  /**
   * Inicializa el sistema de protección
   */
  function initProtection() {
    // 1. Verificar dominio (CRÍTICO)
    const isDomainValid = checkDomain();

    if (!isDomainValid) {
      // Si el dominio no es válido, bloquear completamente la ejecución
      console.error('Dominio no autorizado detectado');
      return;
    }

    // 2. Mostrar advertencia en consola (configurable)
    if (PROTECTION_CONFIG.CONSOLE_WARNING_ENABLED) {
      showConsoleWarning();
    }

    // 3. Añadir marcas de agua (SIEMPRE)
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', addWatermark);
    } else {
      addWatermark();
    }

    // 4. Detectar DevTools (OPCIONAL - solo advertencia, no bloqueo)
    if (PROTECTION_CONFIG.DEVTOOLS_WARNING_ENABLED) {
      detectDevTools();
    }

    console.log('%c✅ Sistema de protección inicializado correctamente', 'color: #4CAF50; font-weight: bold;');
  }

  // ============================================================================
  // EJECUCIÓN
  // ============================================================================

  // Ejecutar protección inmediatamente
  initProtection();

  // Exportar funciones para uso interno (si es necesario)
  window.__PROTECTION__ = {
    config: PROTECTION_CONFIG,
    checkDomain: checkDomain,
    showWarning: showConsoleWarning
  };

})();
