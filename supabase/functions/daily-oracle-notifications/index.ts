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
      .select('chapa, posicion')
      .order('posicion', { ascending: true });

    if (censoError) {
      console.error('Error obteniendo censo:', censoError);
      return new Response(JSON.stringify({ error: censoError.message }), { status: 500 });
    }

    // Crear map de chapa -> posición
    const censoMap = new Map(censoData.map(u => [u.chapa.toString(), u.posicion]));

    // 4. Obtener puertas para detectar siguiente jornada y puerta actual
    const { data: puertasData, error: puertasError } = await supabase
      .from('puertas')
      .select('*')
      .order('id', { ascending: true });

    if (puertasError) {
      console.error('Error obteniendo puertas:', puertasError);
      return new Response(JSON.stringify({ error: puertasError.message }), { status: 500 });
    }

    // Filtrar solo puertas laborables (no festivos)
    const puertasLaborables = puertasData.filter(p => p.jornada !== 'Festivo');

    // Detectar siguiente jornada a contratar
    function detectarSiguienteJornada(puertas: any[]): string {
      const ahora = new Date();
      const horaActual = ahora.getHours();

      // Lógica similar al frontend
      if (horaActual >= 2 && horaActual < 8) return '08-14';
      if (horaActual >= 8 && horaActual < 14) return '14-20';
      if (horaActual >= 14 && horaActual < 20) return '20-02';
      return '08-14'; // Después de las 20:00, siguiente es mañana
    }

    const siguienteJornada = detectarSiguienteJornada(puertasLaborables);
    console.log('📍 Siguiente jornada:', siguienteJornada);

    // Obtener puerta actual para la siguiente jornada
    const puertaData = puertasLaborables.find(p => p.jornada === siguienteJornada);
    const puertaActual = puertaData ? parseInt(puertaData.puertaSP || '223') : 223;
    console.log('🚪 Puerta actual SP:', puertaActual);

    // 5. Para cada suscriptor, calcular probabilidad y enviar notificación
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

        // Calcular probabilidad simplificada para cada jornada
        const jornadasConfig = [
          { codigo: '08-14', nombre: 'Mañana (08-14)' },
          { codigo: '14-20', nombre: 'Tarde (14-20)' },
          { codigo: '20-02', nombre: 'Noche (20-02)' }
        ];

        let puertaPrevista = puertaActual;
        const resultados: any[] = [];
        let esPrimeraJornadaActiva = true;

        for (const jornada of jornadasConfig) {
          const demanda = scraperData.demandas[jornada.codigo];
          if (!demanda) continue;

          const gruas = demanda.gruas || 0;
          const coches = demanda.coches || 0;
          const demandaTotal = (gruas * 7) + coches;

          // Calcular demanda eventuales (restar fijos solo en primera jornada)
          let demandaEventuales = demandaTotal;
          if (esPrimeraJornadaActiva && scraperData.fijos > 0) {
            const fijosParaCalculo = Math.floor(scraperData.fijos / 2);
            demandaEventuales = Math.max(0, demandaTotal - fijosParaCalculo);
            esPrimeraJornadaActiva = false;
          }

          if (demandaEventuales === 0) {
            resultados.push({ jornada: jornada.nombre, probabilidad: 0 });
            continue;
          }

          // Calcular si alcanza al usuario
          const puertaAntes = puertaPrevista;
          const distanciaNecesaria = userPosition > puertaAntes ? userPosition - puertaAntes : 440 - puertaAntes + userPosition;

          const alcanza = demandaEventuales >= distanciaNecesaria;
          puertaPrevista = (puertaAntes + demandaEventuales) % 440;

          // Calcular probabilidad
          let probabilidad = 0;
          if (alcanza) {
            const margen = demandaEventuales - distanciaNecesaria;
            const ratioMargen = margen / Math.max(1, demandaEventuales);

            if (ratioMargen >= 1) {
              probabilidad = 82 + Math.min(6, (ratioMargen - 1) * 3);
            } else if (ratioMargen >= 0) {
              probabilidad = 42 + 40 * (ratioMargen / (ratioMargen + 0.25));
            } else {
              probabilidad = 38;
            }
          } else {
            const cobertura = demandaEventuales / Math.max(1, distanciaNecesaria);
            if (cobertura >= 0.95) {
              probabilidad = 35 + (cobertura - 0.95) * 150;
            } else if (cobertura >= 0.8) {
              probabilidad = 22 + (cobertura - 0.8) * 87;
            } else if (cobertura >= 0.5) {
              probabilidad = 10 + (cobertura - 0.5) * 40;
            } else if (cobertura >= 0.2) {
              probabilidad = 3 + (cobertura - 0.2) * 23;
            } else {
              probabilidad = Math.max(1, cobertura * 15);
            }
          }

          resultados.push({
            jornada: jornada.nombre,
            probabilidad: Math.min(95, Math.max(0, probabilidad))
          });
        }

        // Normalizar probabilidades
        const sumaProbs = resultados.reduce((sum, r) => sum + r.probabilidad, 0);
        const probNoTrabajar = Math.max(0, 100 - sumaProbs);

        // Determinar mejor jornada
        const mejorResultado = resultados.reduce((best, current) =>
          current.probabilidad > best.probabilidad ? current : best
        , { jornada: 'N/A', probabilidad: 0 });

        const bestProbability = Math.round(mejorResultado.probabilidad);
        const bestShiftName = mejorResultado.jornada;

        // Construir mensaje
        let title = '🔮 Tu Oráculo del Día';
        let body = '';

        if (bestProbability >= 80) {
          body = `¡Calienta que sales! ${bestProbability}% en ${bestShiftName}`;
        } else if (bestProbability >= 60) {
          body = `Bastante probable: ${bestProbability}% en ${bestShiftName}`;
        } else if (bestProbability >= 40) {
          body = `Va a estar justo: ${bestProbability}% en ${bestShiftName}`;
        } else if (bestProbability >= 20) {
          body = `Poco probable: ${bestProbability}% (mejor: ${bestShiftName})`;
        } else {
          body = `Difícil hoy: ${bestProbability}% (mejor: ${bestShiftName})`;
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

