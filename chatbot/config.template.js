/**
 * TEMPLATE de Configuración - Copiar como config.local.js
 *
 * INSTRUCCIONES:
 * 1. Copia este archivo y renómbralo a: config.local.js
 * 2. Reemplaza 'TU-API-KEY-AQUI' con tu API key real de OpenAI
 * 3. El archivo config.local.js NO se subirá a Git (está en .gitignore)
 *
 * Para obtener tu API key:
 * - Ve a: https://platform.openai.com/api-keys
 * - Crea una nueva key
 * - Configura límites de gasto ($50/mes recomendado)
 */

window.OPENAI_CONFIG = {
  apiKey: 'TU-API-KEY-AQUI'
};

// Configurar automáticamente en localStorage
if (window.OPENAI_CONFIG.apiKey && window.OPENAI_CONFIG.apiKey !== 'TU-API-KEY-AQUI') {
  localStorage.setItem('openai_api_key', window.OPENAI_CONFIG.apiKey);
  console.log('✅ OpenAI API Key configurada automáticamente');
} else {
  console.warn('⚠️ Configura tu API key en config.local.js');
}
