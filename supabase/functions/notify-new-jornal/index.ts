// supabase/functions/notify-new-jornal/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
console.log("notify-new-jornal Edge Function started!");
serve(async (req)=>{
  try {
    // Inicializar cliente de Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('🔔 Nueva notificación de jornal...');
    // Parsear el payload que viene del webhook/trigger
    const payload = await req.json();
    console.log('📦 Payload recibido:', JSON.stringify(payload, null, 2));
    // El payload vendrá del webhook de Supabase con formato:
    // { type: 'INSERT', table: 'jornales', record: { ... }, old_record: null }
    const jornal = payload.record;
    if (!jornal) {
      console.error('❌ No se encontró el registro del jornal en el payload');
      return new Response(JSON.stringify({
        error: 'No record found'
      }), {
        status: 400
      });
    }
    // Extraer información del jornal (estructura real de la tabla)
    const userChapa = jornal.chapa;
    const fecha = jornal.fecha;
    const jornada = jornal.jornada;
    const puesto = jornal.puesto || 'Trabajo general';
    const empresa = jornal.empresa || '';
    const buque = jornal.buque || '';
    console.log(`📋 Nuevo jornal detectado:`, {
      chapa: userChapa,
      fecha: fecha,
      jornada: jornada,
      puesto: puesto,
      empresa: empresa,
      buque: buque
    });
    // Verificar si el usuario tiene suscripción activa
    // IMPORTANTE: Usar maybeSingle() en lugar de single() porque puede haber múltiples suscripciones
    const { data: subscriptions, error: subError } = await supabase.from('push_subscriptions').select('*').eq('user_chapa', userChapa);
    if (subError) {
      console.error(`❌ Error consultando suscripciones: ${subError.message}`);
      return new Response(JSON.stringify({
        success: false,
        error: subError.message
      }), {
        status: 500
      });
    }
    if (!subscriptions || subscriptions.length === 0) {
      console.log(`⚠️ Usuario ${userChapa} no tiene suscripción activa - no se enviará notificación`);
      return new Response(JSON.stringify({
        success: false,
        message: 'Usuario sin suscripción activa'
      }), {
        status: 200
      });
    }
    console.log(`✅ Usuario ${userChapa} tiene ${subscriptions.length} suscripción(es) activa(s)`);
    const subscription = subscriptions[0]; // Usar la primera suscripción
    // Formatear fecha para mostrar (DD/MM/YYYY)
    let fechaFormateada = fecha;
    try {
      const fechaObj = new Date(fecha);
      fechaFormateada = fechaObj.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      console.warn('⚠️ Error formateando fecha:', e);
    }
    // Construir título y mensaje de la notificación
    // IMPORTANTE: El formato en BD es "08 a 14" NO "08-14"
    let jornadaNombre = '';
    switch(jornada){
      case '08 a 14':
      case '08-14':
        jornadaNombre = 'Mañana';
        break;
      case '14 a 20':
      case '14-20':
        jornadaNombre = 'Tarde';
        break;
      case '20 a 02':
      case '20-02':
        jornadaNombre = 'Noche';
        break;
      case '02 a 08':
      case '02-08':
        jornadaNombre = 'Súper';
        break;
      default:
        jornadaNombre = jornada;
    }
    const title = '🎉 ¡Nueva Contratación!';
    // Construir mensaje con la información disponible
    // Usar jornada directamente (ej: "20 a 02") en vez de nombre (ej: "Noche")
    let bodyParts = [
      jornada,
      fechaFormateada
    ];
    if (puesto) bodyParts.push(puesto);
    if (empresa) bodyParts.push(empresa);
    if (buque) bodyParts.push(buque);
    const body = bodyParts.join(' - ');
    // Enviar notificación al backend de push en Vercel
    const nodePushServerUrl = 'https://portalestiba-push-backend-one.vercel.app';
    const notificationPayload = {
      title,
      body,
      url: '/?page=contratacion',
      page: 'contratacion',
      icon: 'https://i.imgur.com/Q91Pi44.png',
      badge: 'https://i.imgur.com/Q91Pi44.png',
      chapa_target: userChapa
    };
    console.log('📤 Enviando notificación:', notificationPayload);
    const pushResponse = await fetch(`${nodePushServerUrl}/api/push/notify-new-hire`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(notificationPayload)
    });
    if (pushResponse.ok) {
      console.log(`✅ Notificación enviada exitosamente a chapa ${userChapa}`);
      return new Response(JSON.stringify({
        success: true,
        message: 'Notificación enviada',
        chapa: userChapa
      }), {
        headers: {
          'Content-Type': 'application/json'
        },
        status: 200
      });
    } else {
      const errorText = await pushResponse.text();
      console.error(`❌ Error enviando notificación: ${pushResponse.status} - ${errorText}`);
      return new Response(JSON.stringify({
        success: false,
        error: `Backend error: ${pushResponse.status}`,
        details: errorText
      }), {
        status: 500
      });
    }
  } catch (error) {
    console.error('❌ Error en Edge Function:', error.message);
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
});
