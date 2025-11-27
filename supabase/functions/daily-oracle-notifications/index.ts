// supabase/functions/daily-oracle-notifications/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

console.log("daily-oracle-notifications Edge Function started!");

serve(async (req) => {
  try {
    // Inicializar cliente de Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔔 Iniciando envío de notificaciones diarias del Oráculo...');

    // 1. Obtener datos del scraper de Noray
    const scraperUrl = 'https://noray-scraper.onrender.com/api/all';
    const scraperResponse = await fetch(scraperUrl);
    const scraperData = await scraperResponse.json();

    if (!scraperData.success || !scraperData.demandas) {
      console.error('Error obteniendo datos del scraper:', scraperData);
      return new Response(JSON.stringify({
        error: 'No se pudieron obtener datos del scraper',
        scraperData
      }), { status: 500 });
    }

    console.log('✅ Datos del scraper obtenidos:', scraperData);

    // 2. Obtener usuarios suscritos a notificaciones
    const { data: subscriptions, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (subsError) {
      console.error('Error obteniendo suscripciones:', subsError);
      return new Response(JSON.stringify({ error: subsError.message }), { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('⚠️ No hay usuarios suscritos a notificaciones');
      return new Response(JSON.stringify({ message: 'No hay suscripciones' }), { status: 200 });
    }

    console.log(`📋 Encontrados ${subscriptions.length} usuarios suscritos`);

    // 3. Obtener datos del censo para las posiciones
    const { data: censoData, error: censoError } = await supabase
      .from('censo')
      .select('chapa, posicion, nombre')
      .order('posicion', { ascending: true });

    if (censoError) {
      console.error('Error obteniendo censo:', censoError);
      return new Response(JSON.stringify({ error: censoError.message }), { status: 500 });
    }

    // Crear map de chapa -> posición
    const censoMap = new Map(censoData.map(u => [u.chapa.toString(), u.posicion]));

    // 4. Para cada suscriptor, calcular probabilidad y enviar notificación
    // URL del servidor push en Vercel
    const nodePushServerUrl = 'https://portalestiba-push-backend-one.vercel.app';

    let notificationsSent = 0;
    let notificationsFailed = 0;

    for (const subscription of subscriptions) {
      try {
        const userChapa = subscription.user_chapa;
        const userPosition = censoMap.get(userChapa);

        if (!userPosition) {
          console.warn(`⚠️ Usuario ${userChapa} no encontrado en censo, saltando...`);
          continue;
        }

        // Calcular probabilidad para cada jornada
        const probabilities = calculateDailyProbability(
          userPosition,
          scraperData.demandas,
          scraperData.fijos
        );

        // Determinar mejor jornada
        const bestShift = Object.entries(probabilities)
          .sort(([,a], [,b]) => b - a)[0];

        const bestShiftName = bestShift[0];
        const bestProbability = Math.round(bestShift[1]);

        // Construir mensaje
        let title = '🔮 Tu Oráculo del Día';
        let body = '';
        let icon = '';

        if (bestProbability >= 70) {
          icon = '✅';
          body = `${icon} ¡Alta probabilidad! ${bestProbability}% en ${bestShiftName}`;
        } else if (bestProbability >= 40) {
          icon = '⚠️';
          body = `${icon} Probabilidad media: ${bestProbability}% en ${bestShiftName}`;
        } else {
          icon = '❌';
          body = `${icon} Baja probabilidad hoy: ${bestProbability}% (mejor turno: ${bestShiftName})`;
        }

        // Enviar notificación
        const notificationPayload = {
          title,
          body,
          url: '/oraculo',
          chapa_target: userChapa
        };

        const pushResponse = await fetch(`${nodePushServerUrl}/api/push/notify-oracle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notificationPayload)
        });

        if (pushResponse.ok) {
          notificationsSent++;
          console.log(`✅ Notificación enviada a chapa ${userChapa}: ${body}`);
        } else {
          notificationsFailed++;
          const errorText = await pushResponse.text();
          console.error(`❌ Error enviando a ${userChapa}: ${pushResponse.status} - ${errorText}`);
        }

      } catch (userError) {
        notificationsFailed++;
        console.error(`❌ Error procesando usuario ${subscription.user_chapa}:`, userError);
      }
    }

    const summary = {
      success: true,
      total: subscriptions.length,
      sent: notificationsSent,
      failed: notificationsFailed,
      timestamp: new Date().toISOString()
    };

    console.log('📊 Resumen:', summary);

    return new Response(JSON.stringify(summary), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('❌ Error en Edge Function:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});

/**
 * Calcula la probabilidad de trabajar en cada jornada
 */
function calculateDailyProbability(
  userPosition: number,
  demandas: any,
  fijos: number
): Record<string, number> {
  const probabilities: Record<string, number> = {};

  for (const [shift, demand] of Object.entries(demandas)) {
    const { gruas, coches } = demand as { gruas: number; coches: number };
    const totalDemand = gruas + coches;

    // Posiciones que se cubrirán en esta jornada
    const positionsCovered = totalDemand - fijos;

    // Probabilidad basada en posición del usuario vs posiciones cubiertas
    if (userPosition <= positionsCovered) {
      probabilities[shift] = 100; // Seguro que sale
    } else if (userPosition <= positionsCovered + 10) {
      // Probabilidad decreciente en el margen
      const distance = userPosition - positionsCovered;
      probabilities[shift] = Math.max(0, 100 - (distance * 10));
    } else {
      probabilities[shift] = 0;
    }
  }

  return probabilities;
}
