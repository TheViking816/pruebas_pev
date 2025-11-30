/**
 * Componente FeatureLock
 * Bloquea features premium y muestra modal de upgrade
 */

import { tieneAccesoFeature } from '../services/premium.js';
import { redirectToCheckout } from '../services/stripe.js';

class FeatureLock {
  constructor(featureName) {
    this.featureName = featureName;
    this.chapa = localStorage.getItem('currentChapa');
    this.isUnlocked = false;
  }

  /**
   * Verifica si el feature está desbloqueado
   */
  async verificarAcceso() {
    if (!this.chapa) {
      this.isUnlocked = false;
      return false;
    }

    this.isUnlocked = await tieneAccesoFeature(this.chapa, this.featureName);
    return this.isUnlocked;
  }

  /**
   * Crea el overlay de bloqueo
   */
  crearOverlay(container) {
    // Limpiar overlay anterior si existe
    const existingOverlay = container.querySelector('.feature-lock-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }

    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'feature-lock-overlay';
    overlay.innerHTML = `
      <div class="feature-lock-content">
        <div class="feature-lock-icon">🔒</div>
        <h3>Feature Premium</h3>
        <p>Desbloquea ${this.getNombreFeature()} con una suscripción premium</p>
        <button class="premium-button" id="unlock-btn-${this.featureName}">
          <span class="premium-icon">⭐</span>
          Desbloquear por €4.99/mes
        </button>
        <p class="feature-lock-benefits">
          ✅ Acceso completo a Sueldómetro<br>
          ✅ Oráculo con predicciones<br>
          ✅ Chatbot IA avanzado
        </p>
      </div>
    `;

    // Event listener para botón
    overlay.querySelector(`#unlock-btn-${this.featureName}`).addEventListener('click', () => {
      this.handleUnlock();
    });

    return overlay;
  }

  /**
   * Bloquea un contenedor
   */
  async bloquear(containerSelector) {
    const hasAccess = await this.verificarAcceso();

    if (hasAccess) {
      console.log(`✅ Usuario tiene acceso a ${this.featureName}`);
      return false; // No bloqueado
    }

    console.log(`🔒 Bloqueando feature: ${this.featureName}`);

    const container = document.querySelector(containerSelector);
    if (!container) {
      console.error(`❌ Contenedor no encontrado: ${containerSelector}`);
      return true;
    }

    // Añadir clase de bloqueado
    container.classList.add('feature-locked');

    // Crear y añadir overlay
    const overlay = this.crearOverlay(container);
    container.appendChild(overlay);

    return true; // Bloqueado
  }

  /**
   * Maneja el unlock
   */
  async handleUnlock() {
    if (!this.chapa) {
      alert('Por favor, inicia sesión primero');
      return;
    }

    console.log('🔓 Iniciando proceso de suscripción...');
    await redirectToCheckout(this.chapa);
  }

  /**
   * Obtiene el nombre del feature para mostrar
   */
  getNombreFeature() {
    const nombres = {
      'sueldometro': 'el Sueldómetro',
      'oraculo': 'el Oráculo',
      'chatbot_ia': 'el Chatbot IA'
    };
    return nombres[this.featureName] || 'este feature';
  }
}

/**
 * CSS para el componente (añadir a styles.css)
 */
export const FEATURE_LOCK_STYLES = `
.feature-locked {
  position: relative;
  pointer-events: none;
  user-select: none;
}

.feature-lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  border-radius: 12px;
  pointer-events: all;
}

.feature-lock-content {
  text-align: center;
  padding: 2rem;
  max-width: 400px;
}

.feature-lock-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.feature-lock-content h3 {
  font-size: 1.5rem;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.feature-lock-content p {
  color: #64748b;
  margin-bottom: 1.5rem;
}

.premium-button {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.premium-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
}

.premium-icon {
  font-size: 1.2rem;
}

.feature-lock-benefits {
  font-size: 0.875rem !important;
  color: #475569 !important;
  margin-top: 1.5rem !important;
  line-height: 1.8;
  text-align: left;
}
`;

// Exportar para usar como módulo
export default FeatureLock;

// También hacer disponible globalmente para scripts no-módulo
if (typeof window !== 'undefined') {
  window.FeatureLock = FeatureLock;
}
