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
      return new Response(JSON.stringify({ error: 'No se pudieron obtener datos del scraper', scraperData }), { status: 500 });
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

    console.log(`📊 Censo cargado: ${censoData.length} trabajadores`);

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

    // 5. IMPORTANTE: Las notificaciones del Oráculo SIEMPRE usan la jornada 08-14
    // porque es la jornada del día siguiente que más importa a los trabajadores
    const jornadaOraculo = '08-14';
    console.log('📍 Jornada del Oráculo (siempre 08-14):', jornadaOraculo);

    // Constantes
    const LIMITE_SP = 440;
    const INICIO_OC = 441;
    const FIN_OC = 500;

    // Crear censos separados SP y OC
    const censoSP = censoData.filter(u => u.posicion >= 1 && u.posicion <= LIMITE_SP);
    const censoOC = censoData.filter(u => u.posicion >= INICIO_OC && u.posicion <= FIN_OC);

    // Función para obtener peso según color (IGUAL QUE EN PWA)
    function getPesoDisponibilidad(persona: any) {
      if (!persona) return 0;

      const color = typeof persona.color === 'number'
        ? ['red', 'orange', 'yellow', 'blue', 'green'][persona.color]
        : persona.color?.toString().toLowerCase();

      switch (color) {
        case 'red':
        case 'rojo': return 0;
        case 'orange':
        case 'naranja': return 0.25;
        case 'yellow':
        case 'amarillo': return 0.50;
        case 'blue':
        case 'azul': return 0.75;
        case 'green':
        case 'verde': return 1.00;
        default: return 0; // Por defecto NO disponible (igual que PWA)
      }
    }

    // Función para contar disponibles entre dos posiciones (IGUAL QUE EN PWA)
    function contarDisponiblesEntre(desde: number, hasta: number, censoActual: any[], limiteInicio: number, limiteFin: number) {
      let disponibles = 0;

      if (desde <= hasta) {
        // Rango directo
        for (let pos = desde + 1; pos <= hasta; pos++) {
          const persona = censoActual.find(c => c.posicion === pos);
          disponibles += getPesoDisponibilidad(persona);
        }
      } else {
        // Rango con vuelta: desde -> fin + inicio -> hasta
        for (let pos = desde + 1; pos <= limiteFin; pos++) {
          const persona = censoActual.find(c => c.posicion === pos);
          disponibles += getPesoDisponibilidad(persona);
        }
        for (let pos = limiteInicio; pos <= hasta; pos++) {
          const persona = censoActual.find(c => c.posicion === pos);
          disponibles += getPesoDisponibilidad(persona);
        }
      }

      return disponibles;
    }

    // Función para calcular distancia efectiva (IGUAL QUE EN PWA)
    function calcularDistanciaEfectiva(
      puerta: number,
      usuario: number,
      censoActual: any[],
      limiteInicio: number,
      limiteFin: number
    ): number {
      let distancia;

      if (usuario > puerta) {
        // Usuario está delante
        distancia = contarDisponiblesEntre(puerta, usuario, censoActual, limiteInicio, limiteFin);
      } else if (usuario < puerta) {
        // Usuario está detrás, hay que dar la vuelta
        distancia = contarDisponiblesEntre(puerta, limiteFin, censoActual, limiteInicio, limiteFin)
                  + contarDisponiblesEntre(limiteInicio - 1, usuario, censoActual, limiteInicio, limiteFin);
      } else {
        // Misma posición
        return 0;
      }

      // Sumar el peso de disponibilidad del propio usuario (IMPORTANTE)
      const usuarioData = censoActual.find(c => c.posicion === usuario);
      const pesoUsuario = getPesoDisponibilidad(usuarioData);
      distancia += pesoUsuario;

      return distancia;
    }

    // URL del servidor push en Vercel
    const nodePushServerUrl = 'https://portalestiba-push-backend-one.vercel.app';
    let notificationsSent = 0;
    let notificationsFailed = 0;

    for (const subscription of subscriptions) {
      try {
        const userChapa = String(subscription.user_chapa);
        const userData = censoData.find(u => String(u.chapa) === userChapa);

        if (!userData) {
          console.warn(`⚠️ Usuario ${userChapa} no encontrado en censo, saltando...`);
          continue;
        }

        const userPosition = userData.posicion;

        // Determinar si el usuario es SP o OC
        const esUsuarioSP = userPosition <= LIMITE_SP;
        const censoActual = esUsuarioSP ? censoSP : censoOC;
        const limiteInicio = esUsuarioSP ? 1 : INICIO_OC;
        const limiteFin = esUsuarioSP ? LIMITE_SP : FIN_OC;

        // Obtener puerta actual para la jornada 08-14
        const puertasLaborables = puertas.filter(p => p.jornada !== 'Festivo');
        const puertaData = puertasLaborables.find(p => p.jornada === jornadaOraculo);

        if (!puertaData) {
          console.warn(`⚠️ No se encontró puerta para jornada ${jornadaOraculo}, saltando usuario ${userChapa}...`);
          continue;
        }

        const puertaActual = parseInt(esUsuarioSP ? puertaData.puertaSP : puertaData.puertaOC) || 0;

        if (puertaActual === 0) {
          console.warn(`⚠️ Puerta en 0 para ${esUsuarioSP ? 'SP' : 'OC'}, jornada ${jornadaOraculo}. Saltando usuario ${userChapa}...`);
          continue;
        }

        // Calcular distancia EFECTIVA usando la MISMA función que la PWA
        const distanciaEfectiva = calcularDistanciaEfectiva(
          puertaActual,
          userPosition,
          censoActual,
          limiteInicio,
          limiteFin
        );

        const distanciaPuerta = Math.round(distanciaEfectiva);

        console.log(`🚪 Usuario ${userChapa} (${esUsuarioSP ? 'SP' : 'OC'}): Puerta=${puertaActual}, Pos=${userPosition}, Distancia efectiva=${distanciaPuerta}`);

        // Construir mensaje con distancia efectiva a la puerta
        const title = '🔮 Tu Oráculo del Día';
        const body = `Estás a ${distanciaPuerta} posiciones de la puerta! Entra al Oráculo para ver en qué jornada trabajas.`;

        // Enviar notificación
        const notificationPayload = {
          title,
          body,
          url: '/calculadora', // URL correcta para el Oráculo
          icon: 'https://i.imgur.com/Q91Pi44.png',
          badge: 'https://i.imgur.com/Q91Pi44.png',
          chapa_target: userChapa
        };

        const pushResponse = await fetch(`${nodePushServerUrl}/api/push/notify-oracle`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
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
