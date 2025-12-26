#!/usr/bin/env node

/**
 * Script de Build: Genera config.local.js en producción
 *
 * USO:
 * - En Netlify/Vercel: Se ejecuta automáticamente durante el build
 * - Configura la variable de entorno OPENAI_API_KEY en tu servicio
 */

const fs = require('fs');
const path = require('path');

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('❌ ERROR: Variable de entorno OPENAI_API_KEY no configurada');
  console.log('');
  console.log('Configúrala en tu servicio de hosting:');
  console.log('- Netlify: Site settings > Environment variables');
  console.log('- Vercel: Settings > Environment Variables');
  console.log('- GitHub Actions: Settings > Secrets and variables > Actions');
  process.exit(1);
}

const configContent = `/**
 * Configuración PRODUCCIÓN - Generado automáticamente
 * NO EDITAR - Este archivo se genera durante el build
 */
window.OPENAI_CONFIG = {
  apiKey: '${apiKey}'
};

// Configurar automáticamente
if (window.OPENAI_CONFIG.apiKey) {
  localStorage.setItem('openai_api_key', window.OPENAI_CONFIG.apiKey);
  console.log('✅ OpenAI API Key configurada automáticamente');
}
`;

const outputPath = path.join(__dirname, 'chatbot', 'config.local.js');

fs.writeFileSync(outputPath, configContent, 'utf8');

console.log('✅ config.local.js generado exitosamente');
console.log(`📁 Ubicación: ${outputPath}`);
console.log('🔑 API Key configurada (primeros 10 caracteres):', apiKey.substring(0, 10) + '...');
