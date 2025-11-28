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

    // 3. Obtener datos del censo con colores para calcular distancia efectiva
    const { data: censoData, error: censoError } = await supabase
      .from('censo')
      .select('chapa, posicion, color')
      .order('posicion', { ascending: true });

    if (censoError) {
      console.error('Error obteniendo censo:', censoError);
      return new Response(JSON.stringify({ error: censoError.message }), { status: 500 });
    }

    // Crear map de chapa -> {posicion, color}
    const censoMap = new Map(censoData.map(u => [u.chapa.toString(), { posicion: u.posicion, color: u.color }]));

    // 4. Obtener puertas reales desde CSV
    const puertasURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQrQ5bGZDNShEWi1lwx_l1EvOxC0si5kbN8GBxj34rF0FkyGVk6IZOiGk5D91_TZXBHO1mchydFvvUl/pub?gid=3770623&single=true&output=csv';

    const puertasResponse = await fetch(puertasURL);
    const puertasText = await puertasResponse.text();

    // Parsear CSV de puertas (formato complejo)
    const lines = puertasText.split('\n').map(l => l.trim()).filter(l => l !== '');
    const jornadasOrdenadas = ['02-08', '08-14', '14-20', '20-02', 'Festivo'];
    const puertasPorJornada: any = {};

    // Procesar las puertas
    for (const line of lines) {
      if (line.includes('No se admiten') || line.includes('!!')) continue;

      const columns = line.split(',').map(c => c.trim().replace(/"/g, ''));
      if (columns.length < 7) continue;

      const rawJornada = columns[2];
      if (!rawJornada) continue;

      const jornada = rawJornada.replace(/\s+.*/, '');

      if (jornadasOrdenadas.includes(jornada)) {
        const puertaSP = columns[3] ? parseInt(columns[3]) : 0;
        const puertaOC = columns[4] ? parseInt(columns[4]) : 0;

        // Solo guardar si tiene valores válidos (> 0), o si no existe todavía
        if ((puertaSP > 0 || puertaOC > 0) || !puertasPorJornada[jornada]) {
          puertasPorJornada[jornada] = {
            jornada: jornada,
            puertaSP: puertaSP,
            puertaOC: puertaOC
          };
        }
      }
    }

    // Convertir a array
    const puertas = jornadasOrdenadas.map(j => puertasPorJornada[j]).filter(p => p);

    console.log('🚪 Puertas obtenidas:', puertas);

    // 5. Detectar siguiente jornada basándose en hora actual
    function detectarSiguienteJornada(): string {
      const ahora = new Date();
      const horaActual = ahora.getHours();

      // Detectar basándose en la hora actual
      if (horaActual >= 2 && horaActual < 8) return '08-14';
      if (horaActual >= 8 && horaActual < 14) return '14-20';
      if (horaActual >= 14 && horaActual < 20) return '20-02';
      return '08-14'; // Después de las 20:00, siguiente es mañana
    }

    const siguienteJornada = detectarSiguienteJornada();
    console.log('📍 Siguiente jornada:', siguienteJornada);

    // 5. Para cada suscriptor, calcular probabilidad y enviar notificación
    // URL del servidor push en Vercel
    const nodePushServerUrl = 'https://portalestiba-push-backend-one.vercel.app';

    let notificationsSent = 0;
    let notificationsFailed = 0;

    // Función para calcular peso según color
    function getPesoDisponible(color: any): number {
      // El color puede ser número (0-4) o string
      if (typeof color === 'number') {
        // 0=red, 1=orange, 2=yellow, 3=blue, 4=green
        if (color === 4) return 1.0;  // green
        if (color === 3) return 0.75; // blue
        if (color === 2) return 0.5;  // yellow
        if (color === 1) return 0.25; // orange
        if (color === 0) return 0.0;  // red
        return 1.0; // Por defecto, disponible
      }

      // Si es string
      const colorLower = color?.toString().toLowerCase() || '';
      if (colorLower === 'green' || colorLower === 'verde') return 1.0;
      if (colorLower === 'blue' || colorLower === 'azul') return 0.75;
      if (colorLower === 'yellow' || colorLower === 'amarillo') return 0.5;
      if (colorLower === 'orange' || colorLower === 'naranja') return 0.25;
      if (colorLower === 'red' || colorLower === 'rojo') return 0.0;
      return 1.0; // Por defecto, considerar disponible
    }

    for (const subscription of subscriptions) {
      try {
        const userChapa = subscription.user_chapa;
        const userData = censoMap.get(userChapa);

        if (!userData) {
          console.warn(`⚠️ Usuario ${userChapa} no encontrado en censo, saltando...`);
          continue;
        }

        const userPosition = userData.posicion;
        const userColor = userData.color;

        // Determinar si el usuario es SP o OC
        const LIMITE_SP = 440;
        const esUsuarioSP = userPosition <= LIMITE_SP;

        // Obtener puerta actual según la siguiente jornada
        const puertasLaborables = puertas.filter(p => p.jornada !== 'Festivo');
        const puertaData = puertasLaborables.find(p => p.jornada === siguienteJornada);

        if (!puertaData) {
          console.warn(`⚠️ No se encontró puerta para jornada ${siguienteJornada}, saltando usuario ${userChapa}...`);
          continue;
        }

        const puertaActual = esUsuarioSP ? puertaData.puertaSP : puertaData.puertaOC;

        // Calcular distancia EFECTIVA considerando disponibilidad (colores)
        let distanciaEfectiva = 0;
        const tamanoCenso = esUsuarioSP ? LIMITE_SP : 500;
        const inicioRango = esUsuarioSP ? 1 : 441;
        const finRango = esUsuarioSP ? LIMITE_SP : 500;

        // Filtrar censo según tipo (SP o OC)
        const censoFiltrado = censoData.filter(u => {
          if (esUsuarioSP) {
            return u.posicion >= inicioRango && u.posicion <= finRango;
          } else {
            return u.posicion >= inicioRango && u.posicion <= finRango;
          }
        });

        // Calcular distancia efectiva desde puerta hasta usuario
        if (userPosition > puertaActual) {
          // Usuario adelante, contar desde puerta hasta usuario
          for (const persona of censoFiltrado) {
            if (persona.posicion > puertaActual && persona.posicion < userPosition) {
              distanciaEfectiva += getPesoDisponible(persona.color);
            }
          }
        } else {
          // Puerta pasó al usuario (circular), contar desde puerta hasta fin + inicio hasta usuario
          for (const persona of censoFiltrado) {
            if (persona.posicion > puertaActual || persona.posicion < userPosition) {
              distanciaEfectiva += getPesoDisponible(persona.color);
            }
          }
        }

        // Redondear distancia efectiva
        const distanciaPuerta = Math.round(distanciaEfectiva);
        console.log(`🚪 Usuario ${userChapa} (${esUsuarioSP ? 'SP' : 'OC'}): Puerta=${puertaActual}, Pos=${userPosition}, Distancia efectiva=${distanciaPuerta}`);

        // Construir mensaje con distancia efectiva a la puerta
        const title = '🔮 Tu Oráculo del Día';
        const body = `Estás a ${distanciaPuerta} posiciones de la puerta! Entra al Oráculo para ver en qué jornada trabajas.`;

        // Enviar notificación
        const notificationPayload = {
          title,
          body,
          url: '/oraculo',
          icon: 'https://i.imgur.com/Q91Pi44.png',
          badge: 'https://i.imgur.com/Q91Pi44.png',
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

