/**
 * Servicio de Premium - Frontend
 * Verifica acceso a features premium
 */

/**
 * Verifica si un usuario tiene acceso premium
 */
export async function tienePremium(chapa) {
  try {
    if (!window.supabaseClient) {
      console.error('❌ Supabase no está inicializado');
      return false;
    }

    const { data, error } = await window.supabaseClient.rpc('tiene_acceso_premium', {
      chapa_usuario: chapa
    });

    if (error) {
      console.error('❌ Error verificando premium:', error);
      return false;
    }

    return data === true;

  } catch (error) {
    console.error('❌ Error en tienePremium:', error);
    return false;
  }
}

/**
 * Verifica si un usuario tiene acceso a un feature específico
 */
export async function tieneAccesoFeature(chapa, feature) {
  try {
    console.log(`🔍 [PREMIUM DEBUG] Verificando acceso para chapa=${chapa}, feature=${feature}`);

    if (!window.supabaseClient) {
      console.error('❌ Supabase no está inicializado');
      return false;
    }

    console.log(`🔍 [PREMIUM DEBUG] Llamando a RPC 'tiene_acceso_feature'...`);

    const { data, error } = await window.supabaseClient.rpc('tiene_acceso_feature', {
      chapa_usuario: chapa,
      nombre_feature: feature
    });

    console.log(`🔍 [PREMIUM DEBUG] Resultado RPC - data:`, data, 'error:', error);

    if (error) {
      console.error(`❌ Error verificando feature ${feature}:`, error);
      return false;
    }

    const tieneAcceso = data === true;
    console.log(`🔍 [PREMIUM DEBUG] ¿Tiene acceso? ${tieneAcceso}`);

    return tieneAcceso;

  } catch (error) {
    console.error('❌ Error en tieneAccesoFeature:', error);
    return false;
  }
}

/**
 * Obtiene la información de suscripción del usuario
 */
export async function obtenerInfoSuscripcion(chapa) {
  try {
    if (!window.supabaseClient) {
      console.error('❌ Supabase no está inicializado');
      return null;
    }

    const { data, error } = await window.supabaseClient
      .from('usuarios_premium')
      .select('*')
      .eq('chapa', chapa)
      .single();

    if (error) {
      console.error('❌ Error obteniendo suscripción:', error);
      return null;
    }

    return data;

  } catch (error) {
    console.error('❌ Error en obtenerInfoSuscripcion:', error);
    return null;
  }
}

/**
 * Lista de features premium disponibles
 */
export const FEATURES_PREMIUM = {
  SUELDOMETRO: 'sueldometro',
  ORACULO: 'oraculo',
  CHATBOT_IA: 'chatbot_ia'
};

/**
 * Precios
 */
export const PRECIOS = {
  MENSUAL: {
    precio: 9.99,
    moneda: 'EUR',
    intervalo: 'mes'
  },
  ANUAL: {
    precio: 99.00,
    moneda: 'EUR',
    intervalo: 'año',
    descuento: '17%'
  }
};
