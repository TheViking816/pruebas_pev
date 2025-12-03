/**
 * Motor de IA Local - Pattern Matching Inteligente
 * 100% gratuito, funciona offline, sin necesidad de API keys
 *
 * Soporta 3 modos:
 * 1. LOCAL: Pattern matching con base de conocimiento
 * 2. GROQ: API gratuita (requiere conexión)
 * 3. OPENAI: GPT-4 (requiere API key de pago)
 */

class AIEngine {
  constructor() {
    this.mode = 'local'; // 'local', 'groq', 'openai', 'xai'
    this.apiKey = null;
    this.dataBridge = null; // Se inyectará desde chat-app.js

    // Sistema de contexto conversacional
    this.conversationHistory = [];
    this.lastIntent = null;
    this.lastData = null;

    // Base de conocimiento: patrones de intenciones
    this.intents = {
      // CONSULTAS DE TRABAJO
      'cuando_trabajo': {
        patterns: [
          /cuándo (voy a )?trabaj(o|ar|aré)/i,
          /qué (día|días) (voy a )?trabaj(o|ar)/i,
          /cuándo (me toca|entro)/i,
          /próxima? jornada/i,
          /cuándo trabajo/i
        ],
        response: 'consultar_oraculo',
        confidence: 0.9
      },

      // POSICIÓN EN CENSO
      'posicion': {
        patterns: [
          /mi posición/i,
          /qué posición (tengo|estoy)/i,
          /cuántas? posiciones? (me quedan?|faltan?)/i,
          /dónde estoy (en el )?censo/i,
          /a cuántas? posiciones? estoy/i,
          /cuánto falta para (que )?(trabaje|entrar)/i
        ],
        response: 'consultar_posicion',
        confidence: 0.9
      },

      // JORNALES
      'jornales': {
        patterns: [
          /cuántos? jornales? (tengo|llevo)/i,
          /mis jornales/i,
          /jornales? (de la|esta) quincena/i,
          /cuánto(s)? (días )?(he )?trabajado/i,
          /ver (mis )?jornales/i
        ],
        response: 'consultar_jornales',
        confidence: 0.9
      },

      // JORNALES MES PASADO
      'jornales_mes_pasado': {
        patterns: [
          /cuántos? jornales? (tuve|llev[eé]|trabaj[eé]) (el|este)? ?(mes )?(pasado|anterior)/i,
          /jornales? del mes pasado/i,
          /jornales? (de|del) mes anterior/i,
          /cuántos? (días )?trabaj[eé] (el )?(mes )?pasado/i
        ],
        response: 'consultar_jornales_mes_pasado',
        confidence: 0.95
      },

      // SALARIO MES PASADO
      'salario_mes_pasado': {
        patterns: [
          /cuánto (gané|cobré|llev[eé] ganado) (el|este)? ?(mes )?pasado/i,
          /salario (del|el) mes pasado/i,
          /sueldo (del|el) mes (pasado|anterior)/i,
          /gané.*mes pasado/i
        ],
        response: 'consultar_salario_mes_pasado',
        confidence: 0.95
      },

      // SALARIO ANUAL (debe ir ANTES de salario para no ser capturado)
      'salario_anual': {
        patterns: [
          /cuánto (llevo|he) ganado (este|el) año/i,
          /total (del )?año/i,
          /ganancia anual/i,
          /salario anual/i,
          /ganado (este|en el) año/i,
          /llevo ganado.*año/i,
          /gané.*año/i
        ],
        response: 'consultar_salario_anual',
        confidence: 0.95
      },

      // SALARIO (quincena)
      'salario': {
        patterns: [
          /cuánto (voy a )?cobr(o|ar|aré)/i,
          /mi (sueldo|salario)/i,
          /cuánto (llevo )?ganado( (esta|la) quincena)?/i,
          /llevo ganado/i,
          /sueldómetro/i,
          /dinero/i,
          /nómina/i
        ],
        response: 'consultar_salario',
        confidence: 0.9
      },

      // JORNAL MÁS ALTO (QUINCENA)
      'jornal_maximo': {
        patterns: [
          /(cuál|cual) (es|fue) (el|mi) jornal (más|mas) alto( (de |esta )?quincena)?$/i,
          /jornal (más|mas) alto( (de |esta )?quincena)?$/i,
          /mejor jornal( (de |esta )?quincena)?$/i,
          /máximo jornal( (de |esta )?quincena)?$/i
        ],
        response: 'consultar_jornal_maximo',
        confidence: 0.9
      },

      // JORNAL MÁS ALTO (MES PASADO)
      'jornal_maximo_mes_pasado': {
        patterns: [
          /(cuál|cual) (fue|era) (el|mi) jornal (más|mas) alto (del|el) mes pasado/i,
          /jornal (más|mas) alto (del|el) mes pasado/i,
          /mejor jornal (del|el) mes pasado/i,
          /máximo jornal (del|el) mes pasado/i
        ],
        response: 'consultar_jornal_maximo_mes_pasado',
        confidence: 0.95
      },

      // PRIMA MÁS ALTA (QUINCENA)
      'prima_maxima': {
        patterns: [
          /(cuál|cual) (es|fue) (la|mi) prima (más|mas) alta( (de |esta )?quincena)?$/i,
          /prima (más|mas) alta( (de |esta )?quincena)?$/i,
          /mejor prima( (de |esta )?quincena)?$/i,
          /máxima prima( (de |esta )?quincena)?$/i
        ],
        response: 'consultar_prima_maxima',
        confidence: 0.9
      },

      // PRIMA MÁS ALTA (MES PASADO)
      'prima_maxima_mes_pasado': {
        patterns: [
          /(cuál|cual) (fue|era) (la|mi) prima (más|mas) alta (del|el) mes pasado/i,
          /prima (más|mas) alta (del|el) mes pasado/i,
          /mejor prima (del|el) mes pasado/i,
          /máxima prima (del|el) mes pasado/i
        ],
        response: 'consultar_prima_maxima_mes_pasado',
        confidence: 0.95
      },

      // JORNALES POR HORARIO
      'jornales_por_horario': {
        patterns: [
          /cuántos? jornales? (llevo|tengo|he trabajado) (de|desde|entre) (\d{1,2}).*?(\d{1,2})/i,
          /jornales? en (jornada|horario|turno) (de |desde )?(\d{1,2}).*?(\d{1,2})/i,
          /cu[aá]ntos? (jornales? )?de (\d{1,2}).*?(\d{1,2})/i
        ],
        response: 'consultar_jornales_horario',
        confidence: 0.85
      },

      // DÓNDE TRABAJO HOY
      'donde_trabajo': {
        patterns: [
          /dónde trabaj(o|aré) (hoy|mañana)/i,
          /en qué empresa/i,
          /qué (especialidad|puesto)/i,
          /mi contratación/i,
          /dónde (me han contratado|estoy contratado)/i,
          /trabaj(o|as) hoy/i,
          /^hoy.*trabaj/i
        ],
        response: 'consultar_contratacion',
        confidence: 0.9
      },

      // PUERTAS
      'puertas': {
        patterns: [
          /puertas? (del día|de hoy|de mañana)/i,
          /cuál(es)? (es|son) las? puertas?/i,
          /ver puertas?/i
        ],
        response: 'consultar_puertas',
        confidence: 0.9
      },

      // ACCIONES - NO DISPONIBLE
      'no_disponible': {
        patterns: [
          /poner(me)? no disponible/i,
          /no disponibilidad/i,
          /formulario.*no disponib/i,
          /(abrir?|abreme|abre|enseña|muestra).*formulario.*disponib/i,
          /no (puedo|voy a|pueda) trabajar/i,
          /reportar ausencia/i,
          /^no disponible$/i,
          /(quiero|voy a|necesito) (poner|estar|quedar)(me)? no disponible/i,
          /ponme no disponible/i,
          /\b(abrir?|abreme|enseña|muestra).*no disponib/i,
          /formulario de ausencia/i
        ],
        response: 'abrir_no_disponible',
        confidence: 0.95
      },

      // ACCIONES - PUNTO Y HS
      'punto': {
        patterns: [
          /poner(me)? (el )?punto/i,
          /(abrir?|abreme|abre) (el )?punto (y )?h\.?s\.?/i,
          /marcar (el )?punto/i,
          /(quiero|voy a) poner(me)? (el )?punto/i,
          /ponme (el )?punto/i
        ],
        response: 'abrir_punto',
        confidence: 0.85
      },

      // VER CONTRATACIÓN (SPREADSHEET)
      'ver_contratacion': {
        patterns: [
          /ver (la )?contrataci(ó|o)n/i,
          /(abrir?|abreme|abre|ver) (la )?(hoja|planilla) (de )?contrataci(ó|o)n/i,
          /contrataciones? del d(í|i)a/i
        ],
        response: 'abrir_contratacion',
        confidence: 0.85
      },

      // VER CHAPERO
      'ver_chapero': {
        patterns: [
          /ver (el )?chapero/i,
          /(abrir?|abreme|abre|ver) (el )?censo/i,
          /lista (de )?trabajadores/i,
          /chapas?/i
        ],
        response: 'abrir_chapero',
        confidence: 0.85
      },

      // COMUNICACIONES OFICINA
      'comunicaciones': {
        patterns: [
          /comunicaciones? (de la )?oficina/i,
          /(abrir?|abreme|abre) comunicaciones?/i,
          /formulario comunicaci(ó|o)n/i
        ],
        response: 'abrir_comunicaciones',
        confidence: 0.85
      },

      // ABRIR ORÁCULO (navegación directa)
      'abrir_oraculo': {
        patterns: [
          /(abrir?|abreme|abre|enseña|muestra|ver) (el )?or[aá]culo/i,
          /llévame al or[aá]culo/i,
          /ir al or[aá]culo/i,
          /voy a trabajar hoy/i,
          /^trabajar[eé]? hoy/i,
          /^hoy trabajo/i
        ],
        response: 'navegar_oraculo',
        confidence: 0.95
      },

      // SALUDOS
      'saludo': {
        patterns: [
          /^hola/i,
          /^buenos? (días?|tardes?|noches?)/i,
          /^hey/i,
          /^buenas/i,
          /qué tal/i
        ],
        response: 'saludo',
        confidence: 0.95
      },

      // AYUDA
      'ayuda': {
        patterns: [
          /ayuda/i,
          /qué puedes hacer/i,
          /cómo funciona(s)?/i,
          /qué sabes/i,
          /comandos/i
        ],
        response: 'ayuda',
        confidence: 0.9
      },

      // EMPRESA MÁS TRABAJADA
      'empresa_mas_trabajada': {
        patterns: [
          /(en )?(qué|que) empresa (he )?trabajado (más|mas)( esta quincena| la quincena| este año| el año pasado)?/i,
          /(cuál|cual) (es|fue) la empresa (donde|que) (más|mas) (he )?trabajado/i,
          /empresa (donde|que) (más|mas) (he )?trabajado/i,
          /(en )?(dónde|donde) (he )?trabajado (más|mas)/i
        ],
        response: 'consultar_empresa_mas_trabajada',
        confidence: 0.9
      },

      // JORNADA MÁS TRABAJADA
      'jornada_mas_trabajada': {
        patterns: [
          /(en )?(qué|que) (jornada|horario|turno) (he )?trabajado (más|mas)( esta quincena| la quincena| este año| el año pasado)?/i,
          /(cuál|cual) (es|fue) la jornada (donde|que) (más|mas) (he )?trabajado/i,
          /jornada (donde|que) (más|mas) (he )?trabajado/i,
          /(qué|que) (horario|turno) (he hecho|hago) (más|mas)/i
        ],
        response: 'consultar_jornada_mas_trabajada',
        confidence: 0.9
      },

      // DÍA CON MAYOR PRIMA
      'dia_mayor_prima': {
        patterns: [
          /(qué|que) día (hice|tuve) (la )?(mayor|más alta|mejor) prima/i,
          /(cuándo|cuando) (hice|tuve) (la )?(mayor|más alta|mejor) prima/i,
          /día (con |de )(la )?(mayor|más alta|mejor) prima/i
        ],
        response: 'consultar_dia_mayor_prima',
        confidence: 0.9
      },

      // SEGUIMIENTO / MÁS INFORMACIÓN
      'seguimiento': {
        patterns: [
          /^(dame|dime|muestra|enseña) (los?|el|la|las)? ?(detalles?|información|info|datos)/i,
          /^(más|mas) (detalles?|información|info)/i,
          /^cuéntame más/i,
          /^amplía/i,
          /^explica/i,
          /^y (eso|esto)\??$/i,
          /^(detalles?|información|info)$/i
        ],
        response: 'ampliar_informacion',
        confidence: 0.95
      },

      // RESPUESTAS AFIRMATIVAS
      'afirmativo': {
        patterns: [
          /^sí$/i,
          /^si$/i,
          /^vale$/i,
          /^ok$/i,
          /^okay$/i,
          /^claro$/i,
          /^adelante$/i,
          /^perfecto$/i,
          /^de acuerdo$/i,
          /^por supuesto$/i,
          /^venga$/i,
          /^dale$/i
        ],
        response: 'confirmar_accion',
        confidence: 0.95
      },

      // FESTIVOS NO LABORABLES
      'festivos': {
        patterns: [
          /(qué|que) (días|dia) (son )?festivos?/i,
          /(cuándo|cuando) (son|es|hay) festivos?/i,
          /(días|dia) festivos? (del )?puerto/i,
          /(días|dia) no laborables?/i,
          /festivos? no laborables?/i,
          /(cuáles|cuales) (son )?festivos?/i
        ],
        response: 'consultar_festivos',
        confidence: 0.9
      },

      // CONSULTAS DE TARIFAS/JORNALES
      'consulta_tarifa': {
        patterns: [
          /(cuánto|cuanto) (es|está|vale|cuesta|pagan|paga) (el |la )?jornal/i,
          /(cuánto|cuanto) (es|está|vale|cuesta|pagan|paga).*(14.*20|08.*14|02.*08|20.*02)/i,
          /jornal de.*(domingo|lunes|martes|miércoles|jueves|viernes|sábado|laborable|festivo)/i,
          /(tarifa|precio).*(trinca|destrinca)/i,
          /(cuánto|cuanto).*(barra|barras).*(trinca|destrinca)/i,
          /a cuánto está.*(trinca|destrinca)/i
        ],
        response: 'consultar_tarifa',
        confidence: 0.9
      },

      // CHAPAS DISPONIBLES
      'chapas_disponibles': {
        patterns: [
          /(cuántas|cuantas) chapas? disponibles?/i,
          /chapas? (en )?verde/i,
          /(cuántos|cuantos) (trabajadores?|estibadores?) disponibles?/i,
          /(cuánta|cuanta) gente disponible/i,
          /disponibilidad (del )?censo/i
        ],
        response: 'consultar_chapas_disponibles',
        confidence: 0.9
      },

      // CONVENIO COLECTIVO
      'convenio': {
        patterns: [
          /(qué|que) (dice|pone|establece).*(convenio|colectivo)/i,
          /(según|segun) (el )?convenio/i,
          /convenio (dice|establece|menciona)/i,
          /(artículo|articulo|art).*(convenio|colectivo)/i,
          /(derecho|derechos|obligación|obligaciones).*(convenio|trabajador|empresa)/i,
          /vacaciones? (cuántos|cuantos|días|dia)/i,
          /permisos? retribuid/i,
          /jornada laboral/i,
          /período|periodo.*(prueba|vacaciones)/i,
          /plus|pluses|complemento/i,
          /descanso|descansos/i
        ],
        response: 'consultar_convenio',
        confidence: 0.85
      },

      // V ACUERDO MARCO
      'acuerdo_marco': {
        patterns: [
          /(qué|que|que es|cuál|cual).*(acuerdo marco|v acuerdo)/i,
          /(qué|que) (dice|pone|establece).*(acuerdo marco|v acuerdo)/i,
          /(según|segun) (el )?acuerdo marco/i,
          /acuerdo marco (dice|establece|menciona|es)/i,
          /BOE.*8165/i,
          /(normativa|regulación|regulacion).*(estiba|portuaria)/i,
          /marco (regulatorio|normativo)/i,
          /v acuerdo/i
        ],
        response: 'consultar_acuerdo_marco',
        confidence: 0.85
      },

      // GUÍA DE CONTRATACIÓN
      'guia_contratacion': {
        patterns: [
          /(cuándo|cuando).*(se contrata|contratan).*(jornada|02.*08|08.*14|14.*20|20.*02)/i,
          /(cómo|como).*(se contrata|contratan).*(jornada|festivo|laborable)/i,
          /(guía|guia).*(contratación|contratacion)/i,
          /procedimiento.*(contratación|contratacion)/i,
          /(orden|turno).*(contratación|contratacion)/i,
          /(segundo|tercer).*(festivo|laborable).*(contrat)/i,
          /(cuándo|cuando).*(segundo|tercer).*(festivo)/i,
          /festivos? seguidos?.*(contrat)/i,
          /(criterios|normas|reglas).*(contratación|contratacion)/i,
          /(prioridad|preferencia).*(contratación|contratacion)/i
        ],
        response: 'consultar_guia_contratacion',
        confidence: 0.85
      }
    };

    // Respuestas predefinidas
    this.responses = {
      saludo: [
        "Hola 👋 ¿En qué puedo ayudarte?",
        "Buenas, ¿qué necesitas saber?",
        "Hola, estoy aquí para ayudarte."
      ],
      ayuda: `Puedo ayudarte con:

📊 **Jornales:**
  • "¿Cuántos jornales llevo esta quincena?"
  • "¿Cuántos jornales he hecho en el mes pasado?"
  • "¿Cuántos jornales de 20-02 llevo?"

💰 **Salario:**
  • "¿Cuánto llevo ganado esta quincena?"
  • "¿Cuál fue mi jornal más alto?"
  • "¿Cuál fue mi prima más alta?"

🎯 **Posición:**
  • "¿A cuántas posiciones estoy?"
  • "¿En qué empresa trabajo más?"

🔮 **Predicción:**
  • "¿Cuándo voy a trabajar?"
  • "¿Cuáles son las puertas de hoy?"

📅 **Festivos:**
  • "¿Qué días son festivos?"

💵 **Tarifas:**
  • "¿Cuánto es el jornal de 14-20 el domingo?"
  • "¿A cuánto está la barra de trinca 20-02 laborable?"
  • "¿Cuánto pagan de destrinca en 08-14 festivo?"

🟢 **Censo:**
  • "¿Cuántas chapas disponibles hay?"

📜 **Convenio:**
  • "¿Cuántos días de vacaciones tengo?"
  • "¿Qué dice el convenio sobre permisos?"

📋 **V Acuerdo Marco:**
  • "¿Qué es el V Acuerdo Marco?"

📝 **Guía de Contratación:**
  • "¿Cuándo se contrata la jornada de 02-08?"
  • "¿Cuándo se contrata el segundo festivo si hay 2 seguidos?"

🔧 **Acciones:**
  • "Quiero ponerme no disponible"

Escribe tu pregunta abajo ⬇️`,
      no_entiendo: "No entendí tu pregunta. Prueba preguntarme sobre jornales, salario, posición o cuándo trabajas.",
      error_datos: "No pude obtener esos datos. Intenta de nuevo.",
      sin_datos: "No encontré datos para esa consulta."
    };
  }

  /**
   * Inicializa el motor de IA
   */
  async initialize(dataBridge) {
    this.dataBridge = dataBridge;

    // Cargar configuración guardada
    const savedMode = localStorage.getItem('ai_mode');
    const savedApiKey = localStorage.getItem('ai_api_key');

    if (savedMode) {
      this.mode = savedMode;
    }

    if (savedApiKey) {
      this.apiKey = savedApiKey;
    }

    console.log('✅ Motor de IA inicializado en modo:', this.mode);
  }

  /**
   * Procesa un mensaje del usuario y genera una respuesta
   */
  async processMessage(userMessage) {
    console.log('🤖 Procesando mensaje:', userMessage);

    // Limpiar mensaje
    const cleanMessage = userMessage.trim().toLowerCase();

    if (!cleanMessage) {
      return {
        text: this.responses.no_entiendo,
        intent: 'unknown',
        confidence: 0
      };
    }

    // Detectar intención
    let intent = this.detectIntent(cleanMessage);
    console.log('🎯 Intención detectada:', intent);
    console.log('📍 Action detectada:', intent.action, '| Name:', intent.name);

    // Si pide más información/detalles, usar el último intent
    if (intent.action === 'ampliar_informacion' && this.lastIntent) {
      console.log('📖 Ampliando información del último intent:', this.lastIntent.action);
      intent = this.lastIntent; // Reutilizar el último intent
    }

    // SIEMPRE generar respuesta local primero (con datos reales)
    const localResponse = await this.generateLocalResponse(intent, userMessage);

    // Guardar el intent y datos para próximas consultas
    this.lastIntent = intent;
    this.lastData = localResponse.data;

    // Si estamos en modo OpenAI y hay datos, mejorar la redacción
    if (this.mode === 'openai' && this.apiKey && localResponse.data) {
      return await this.generateOpenAIResponse(intent, userMessage);
    }

    // Si estamos en modo Groq y hay datos, mejorar la redacción
    if (this.mode === 'groq' && this.apiKey && localResponse.data) {
      return await this.enhanceWithGroq(localResponse, userMessage);
    }

    return localResponse;
  }

  /**
   * Detecta la intención del usuario mediante pattern matching
   */
  detectIntent(message) {
    let bestMatch = null;
    let highestConfidence = 0;

    // Comparar con todos los patrones
    for (const [intentName, intentData] of Object.entries(this.intents)) {
      for (const pattern of intentData.patterns) {
        if (pattern.test(message)) {
          if (intentData.confidence > highestConfidence) {
            highestConfidence = intentData.confidence;
            bestMatch = {
              name: intentName,
              action: intentData.response,
              confidence: intentData.confidence
            };
          }
        }
      }
    }

    return bestMatch || { name: 'unknown', action: 'unknown', confidence: 0 };
  }

  /**
   * Genera respuesta usando motor local (pattern matching)
   */
  async generateLocalResponse(intent, userMessage) {
    if (intent.action === 'saludo') {
      return {
        text: this.getRandomResponse(this.responses.saludo),
        intent: intent.name,
        confidence: intent.confidence
      };
    }

    if (intent.action === 'ayuda') {
      return {
        text: this.responses.ayuda,
        intent: intent.name,
        confidence: intent.confidence
      };
    }

    if (intent.action === 'confirmar_accion') {
      // Verificar si hay detalles de jornales pendientes
      const jornalesDetail = localStorage.getItem('pending_jornales_detail');

      if (jornalesDetail) {
        const jornales = JSON.parse(jornalesDetail);
        localStorage.removeItem('pending_jornales_detail');

        let respuesta = `📋 **Detalles completos de jornales:**\n\n`;

        for (const jornal of jornales) {
          let fecha = '-';
          if (jornal.fecha) {
            // Si la fecha está en formato español dd/mm/yyyy
            if (jornal.fecha.includes('/')) {
              const partes = jornal.fecha.split('/');
              if (partes.length === 3) {
                // Crear fecha desde dd/mm/yyyy
                const dateObj = new Date(partes[2], partes[1] - 1, partes[0]);
                if (!isNaN(dateObj.getTime())) {
                  fecha = dateObj.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: '2-digit' });
                } else {
                  fecha = jornal.fecha; // Usar el valor original si falla
                }
              }
            } else {
              // Si está en formato ISO yyyy-mm-dd
              const dateObj = new Date(jornal.fecha);
              if (!isNaN(dateObj.getTime())) {
                fecha = dateObj.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: '2-digit' });
              }
            }
          }
          respuesta += `**${fecha}**\n`;
          respuesta += `  • Empresa: ${jornal.empresa || 'N/A'}\n`;
          respuesta += `  • Puesto: ${jornal.puesto || 'N/A'}\n`;
          respuesta += `  • Jornada: ${jornal.jornada || 'N/A'}\n`;
          if (jornal.buque) respuesta += `  • Buque: ${jornal.buque}\n`;
          respuesta += `\n`;
        }

        return {
          text: respuesta,
          intent: intent.name,
          confidence: intent.confidence
        };
      }

      // Si el usuario dice "sí", ejecutar la última acción pendiente
      const lastAction = localStorage.getItem('pending_action');

      if (lastAction) {
        const action = JSON.parse(lastAction);
        localStorage.removeItem('pending_action'); // Limpiar

        return {
          text: "Perfecto, abriendo...",
          intent: intent.name,
          confidence: intent.confidence,
          action: action
        };
      } else {
        return {
          text: "Vale. ¿En qué más puedo ayudarte?",
          intent: intent.name,
          confidence: intent.confidence
        };
      }
    }

    // Consultas que requieren datos
    if (intent.action === 'consultar_oraculo') {
      return await this.handleOraculoQuery();
    }

    if (intent.action === 'consultar_posicion') {
      return await this.handlePosicionQuery();
    }

    if (intent.action === 'consultar_jornales') {
      return await this.handleJornalesQuery();
    }

    if (intent.action === 'consultar_salario') {
      console.log('🔹 Usando handleSalarioQuery (quincena)');
      return await this.handleSalarioQuery();
    }

    if (intent.action === 'consultar_salario_mes_pasado') {
      console.log('🔹 Usando handleSalarioMesPasadoQuery');
      return await this.handleSalarioMesPasadoQuery();
    }

    if (intent.action === 'consultar_salario_anual') {
      console.log('🔹 Usando handleSalarioAnualQuery (año completo)');
      return await this.handleSalarioAnualQuery();
    }

    if (intent.action === 'consultar_jornales_mes_pasado') {
      return await this.handleJornalesMesPasadoQuery();
    }

    if (intent.action === 'consultar_jornal_maximo') {
      return await this.handleJornalMaximoQuery('quincena');
    }

    if (intent.action === 'consultar_jornal_maximo_mes_pasado') {
      return await this.handleJornalMaximoQuery('mes-pasado');
    }

    if (intent.action === 'consultar_prima_maxima') {
      return await this.handlePrimaMaximaQuery('quincena');
    }

    if (intent.action === 'consultar_prima_maxima_mes_pasado') {
      return await this.handlePrimaMaximaQuery('mes-pasado');
    }

    if (intent.action === 'consultar_jornales_horario') {
      return await this.handleJornalesHorarioQuery(userMessage);
    }

    if (intent.action === 'consultar_contratacion') {
      return await this.handleContratacionQuery();
    }

    if (intent.action === 'consultar_puertas') {
      return await this.handlePuertasQuery();
    }

    if (intent.action === 'consultar_empresa_mas_trabajada') {
      return await this.handleEmpresaMasTrabajadaQuery(userMessage);
    }

    if (intent.action === 'consultar_jornada_mas_trabajada') {
      return await this.handleJornadaMasTrabajadaQuery(userMessage);
    }

    if (intent.action === 'consultar_dia_mayor_prima') {
      return await this.handleDiaMayorPrimaQuery(userMessage);
    }

    // NUEVOS HANDLERS
    if (intent.action === 'consultar_festivos') {
      return await this.handleFestivosQuery();
    }

    if (intent.action === 'consultar_tarifa') {
      return await this.handleTarifaQuery(userMessage);
    }

    if (intent.action === 'consultar_chapas_disponibles') {
      return await this.handleChapasDisponiblesQuery();
    }

    if (intent.action === 'consultar_convenio') {
      return await this.handleConvenioQuery(userMessage);
    }

    if (intent.action === 'consultar_acuerdo_marco') {
      return await this.handleAcuerdoMarcoQuery(userMessage);
    }

    if (intent.action === 'consultar_guia_contratacion') {
      return await this.handleGuiaContratacionQuery(userMessage);
    }

    // Acciones
    if (intent.action === 'abrir_no_disponible') {
      return {
        text: "Te abro el formulario de no disponibilidad.",
        intent: intent.name,
        confidence: intent.confidence,
        action: {
          type: 'open_link',
          url: 'https://docs.google.com/forms/d/e/1FAIpQLSfXcs0lOG7beU9HMfum-6eKkwmZCjcvnOQXaFiiY8EAb9rpYA/closedform'
        }
      };
    }

    if (intent.action === 'abrir_punto') {
      return {
        text: "Te abro el formulario para marcar el punto.",
        intent: intent.name,
        confidence: intent.confidence,
        action: {
          type: 'open_link',
          url: 'https://docs.google.com/forms/d/e/1FAIpQLSeGKl5gwKrcj110D_6xhHVo0bn7Fo56tneof68dRyS6xUrD7Q/viewform'
        }
      };
    }

    if (intent.action === 'abrir_contratacion') {
      return {
        text: "Te abro la hoja de contratación del día.",
        intent: intent.name,
        confidence: intent.confidence,
        action: {
          type: 'open_link',
          url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSTtbkA94xqjf81lsR7bLKKtyES2YBDKs8J2T4UrSEan7e5Z_eaptShCA78R1wqUyYyASJxmHj3gDnY/pubhtml?gid=1388412839&single=true'
        }
      };
    }

    if (intent.action === 'abrir_chapero') {
      return {
        text: "Te abro el chapero (censo de trabajadores).",
        intent: intent.name,
        confidence: intent.confidence,
        action: {
          type: 'open_link',
          url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrMuapybwZUEGPR1vsP9p1_nlWvznyl0sPD4xWsNJ7HdXCj1ABY1EpU1um538HHZQyJtoAe5Niwrxq/pubhtml?gid=841547354&single=true'
        }
      };
    }

    if (intent.action === 'abrir_comunicaciones') {
      return {
        text: "Te abro el formulario de comunicaciones con la oficina.",
        intent: intent.name,
        confidence: intent.confidence,
        action: {
          type: 'open_link',
          url: 'https://docs.google.com/forms/d/e/1FAIpQLSc_wN20zG_88wmAAyXRsCxokTpfvxRKdILHr5BxrQUuNGqvyQ/closedform'
        }
      };
    }

    // NAVEGAR AL ORÁCULO (navegación directa sin preguntar)
    if (intent.action === 'navegar_oraculo') {
      return {
        text: "Te abro el Oráculo 🔮",
        intent: intent.name,
        confidence: intent.confidence,
        action: {
          type: 'navigate_pwa',
          page: 'calculadora'
        }
      };
    }

    // No entendido - Intentar sugerir algo útil
    return await this.handleUnknownQuery(userMessage);
  }

  /**
   * Maneja preguntas no reconocidas - intenta sugerir algo útil
   */
  async handleUnknownQuery(userMessage) {
    try {
      const mensaje = userMessage.toLowerCase();

      // Detectar palabras clave para sugerir información relevante
      let sugerencia = '';
      let datosExtra = null;

      // Si menciona dinero/euros/cobrar/pagar
      if (/dinero|euro|cobr|pag|ganado|sueldo|nómina|nomina/i.test(mensaje)) {
        const salario = await this.dataBridge.calcularSueldoQuincena();
        if (salario && salario.salarioNeto > 0) {
          sugerencia = `💰 Esta quincena llevas estimados **${salario.salarioNeto.toFixed(2)}€** netos con ${salario.jornales} jornales.\n\n`;
          datosExtra = { type: 'salario', neto: salario.salarioNeto.toFixed(2), bruto: salario.salarioBruto.toFixed(2) };
        }
      }

      // Si menciona trabajo/curro/jornada/turno
      if (/trabajo|curro|turno|jornada|mañana|hoy|contratar/i.test(mensaje)) {
        const prediccion = await this.dataBridge.calcularProbabilidadTrabajar();
        if (prediccion && prediccion.jornadas && prediccion.jornadas.length > 0) {
          const mejor = prediccion.jornadas.reduce((a, b) => a.probabilidad > b.probabilidad ? a : b);
          sugerencia += `Tu mejor opción es **${mejor.jornada}** con ${mejor.probabilidad}% de probabilidad.\n\n`;
        }
      }

      // Si menciona posición/censo/puerta
      if (/posición|posicion|censo|puerta|contratación|contratacion/i.test(mensaje)) {
        const posicion = await this.dataBridge.getPosicionUsuario();
        if (posicion) {
          sugerencia += `Estás en el puesto **${posicion.posicion}** del censo.\n\n`;
        }
      }

      // Si no detectamos nada específico, mostrar resumen general
      if (!sugerencia) {
        const [jornales, posicion] = await Promise.all([
          this.dataBridge.getJornalesQuincena(),
          this.dataBridge.getPosicionUsuario()
        ]);

        sugerencia = `No estoy seguro de qué buscas. Aquí tienes un resumen:\n\n`;

        if (jornales && jornales.total > 0) {
          sugerencia += `📊 Jornales esta quincena: ${jornales.total}\n`;
        }
        if (posicion) {
          sugerencia += `📍 Tu posición: ${posicion.posicion}\n`;
        }

        sugerencia += `\nPrueba preguntar:\n`;
        sugerencia += `• "¿Cuándo voy a trabajar?"\n`;
        sugerencia += `• "¿Cuánto llevo ganado?"\n`;
        sugerencia += `• "¿Cuál fue mi mejor prima?"\n`;
      }

      return {
        text: sugerencia,
        intent: 'sugerencia',
        confidence: 0.5,
        data: datosExtra
      };

    } catch (error) {
      console.error('Error en handleUnknownQuery:', error);
      return {
        text: `No entendí tu pregunta. Puedo ayudarte con:\n\n• Predicción de trabajo\n• Jornales y salario\n• Posición en censo\n• Récords de primas\n\nPrueba: "¿Cuándo voy a trabajar?"`,
        intent: 'unknown',
        confidence: 0
      };
    }
  }

  /**
   * Handlers para cada tipo de consulta
   * @description Maneja consultas del Oráculo - redirige a la pestaña real
   * @depends pwa-data-bridge.js (getPosicionUsuario, getPuertas)
   */
  async handleOraculoQuery() {
    try {
      const chapa = localStorage.getItem('currentChapa');

      if (!chapa) {
        return {
          text: "Para consultar el Oráculo necesitas iniciar sesión primero.",
          intent: 'consultar_oraculo',
          confidence: 0.9
        };
      }

      // Obtener posición y puertas básicas
      const posicion = await this.dataBridge.getPosicionUsuario();
      const puertas = await this.dataBridge.getPuertas();

      if (!posicion) {
        return {
          text: "No pude obtener tu posición. Asegúrate de que Noray esté cargado en la app.",
          intent: 'consultar_oraculo',
          confidence: 0.9
        };
      }

      // Crear respuesta con distancia a puerta (COPIA EXACTA DEL DASHBOARD)
      let respuesta = `📍 **Distancia a puerta**\n\n`;

      // Mostrar distancia laborable
      if (posicion.posicionesLaborable !== null) {
        respuesta += `Estás a **${posicion.posicionesLaborable} posiciones** de puerta laborable\n`;

        // Si es trincador, mostrar también trincadores (igual que app.js línea 772)
        if (posicion.esTrincador && posicion.posicionesTrincaLaborable !== null) {
          respuesta += `⚡ ${posicion.posicionesTrincaLaborable} trincadores hasta la puerta laborable\n`;
        }
      }

      // Mostrar distancia festiva
      if (posicion.posicionesFestiva !== null) {
        respuesta += `Estás a **${posicion.posicionesFestiva} posiciones** de puerta festiva\n`;

        // Si es trincador, mostrar también trincadores (igual que app.js línea 803)
        if (posicion.esTrincador && posicion.posicionesTrincaFestiva !== null) {
          respuesta += `⚡ ${posicion.posicionesTrincaFestiva} trincadores hasta la puerta festiva\n`;
        }
      }

      respuesta += `\n¿Quieres que abra el Oráculo para ver la predicción completa?`;

      // Guardar acción pendiente para cuando diga "sí"
      localStorage.setItem('pending_action', JSON.stringify({
        type: 'navigate_pwa',
        page: 'oraculo'
      }));

      return {
        text: respuesta,
        intent: 'consultar_oraculo',
        confidence: 0.9,
        data: {
          type: 'puertas',
          puertas: puertas
        }
      };

    } catch (error) {
      console.error('Error en handleOraculoQuery:', error);
      return {
        text: this.responses.error_datos,
        intent: 'consultar_oraculo',
        confidence: 0.9
      };
    }
  }

  async handlePosicionQuery() {
    try {
      const posicion = await this.dataBridge.getPosicionUsuario();

      if (!posicion) {
        return {
          text: this.responses.sin_datos,
          intent: 'posicion',
          confidence: 0.9
        };
      }

      return {
        text: `Tu posición actual en el censo es: **${posicion.posicion}**`,
        intent: 'posicion',
        confidence: 0.9,
        data: {
          type: 'posicion',
          posicion: posicion.posicion,
          laborable: posicion.posicionesLaborable,
          festiva: posicion.posicionesFestiva
        }
      };

    } catch (error) {
      console.error('Error en handlePosicionQuery:', error);
      return {
        text: this.responses.error_datos,
        intent: 'posicion',
        confidence: 0.9
      };
    }
  }

  async handleJornalesQuery() {
    try {
      const jornales = await this.dataBridge.getJornalesQuincena();

      if (!jornales || jornales.total === 0) {
        return {
          text: "No encontré jornales registrados en esta quincena.",
          intent: 'jornales',
          confidence: 0.9
        };
      }

      // Crear resumen de jornales
      let respuesta = `📊 **${jornales.quincena}**: llevas **${jornales.total} jornales**\n\n`;

      // Mostrar los primeros 5 jornales como resumen
      const jornalesParaMostrar = jornales.jornales.slice(0, 5);

      respuesta += `Últimos jornales:\n`;
      for (const jornal of jornalesParaMostrar) {
        // Formatear fecha correctamente - puede venir como DD/MM/YYYY o YYYY-MM-DD
        let fecha = '-';
        if (jornal.fecha) {
          if (jornal.fecha.includes('/')) {
            // Formato DD/MM/YYYY - usar directamente
            const partes = jornal.fecha.split('/');
            if (partes.length === 3) {
              fecha = `${partes[0]}/${partes[1]}`;
            }
          } else {
            // Formato ISO YYYY-MM-DD
            const dateObj = new Date(jornal.fecha);
            if (!isNaN(dateObj.getTime())) {
              fecha = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
            }
          }
        }
        const especialidad = jornal.puesto ? ` [${jornal.puesto}]` : '';
        respuesta += `• ${fecha} - ${jornal.empresa || 'N/A'} (${jornal.jornada || 'N/A'})${especialidad}\n`;
      }

      if (jornales.total > 5) {
        respuesta += `\n_...y ${jornales.total - 5} jornales más_\n`;
      }

      // Guardar acción pendiente para mostrar todos los detalles
      localStorage.setItem('pending_jornales_detail', JSON.stringify(jornales.jornales));

      respuesta += `\n¿Quieres ver todos los detalles?`;

      return {
        text: respuesta,
        intent: 'jornales',
        confidence: 0.9,
        data: {
          type: 'jornales',
          total: jornales.total,
          quincena: jornales.quincena,
          jornales: jornales.jornales
        }
      };

    } catch (error) {
      console.error('Error en handleJornalesQuery:', error);
      return {
        text: this.responses.error_datos,
        intent: 'jornales',
        confidence: 0.9
      };
    }
  }

  async handleSalarioQuery() {
    try {
      const calculo = await this.dataBridge.calcularSueldoQuincena();

      if (!calculo || calculo.jornales === 0) {
        return {
          text: calculo?.mensaje || this.responses.sin_datos,
          intent: 'salario',
          confidence: 0.9
        };
      }

      let respuesta = `💰 **${calculo.quincena}**: llevas **${calculo.jornales} jornales**\n\n`;
      respuesta += `Salario bruto: ${calculo.salarioBruto}€\n`;
      respuesta += `IRPF (${calculo.irpfPorcentaje}%): -${calculo.irpf}€\n`;
      respuesta += `**Salario neto: ${calculo.salarioNeto}€**\n\n`;

      // Mostrar desglose de los últimos 3 jornales
      if (calculo.detalleJornales && calculo.detalleJornales.length > 0) {
        respuesta += `Últimos jornales:\n`;
        const ultimosJornales = calculo.detalleJornales.slice(0, 3);
        for (const jornal of ultimosJornales) {
          let fecha = '-';
          if (jornal.fecha) {
            if (jornal.fecha.includes('/')) {
              const partes = jornal.fecha.split('/');
              if (partes.length === 3) fecha = `${partes[0]}/${partes[1]}`;
            } else {
              const dateObj = new Date(jornal.fecha);
              if (!isNaN(dateObj.getTime())) {
                fecha = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
              }
            }
          }
          respuesta += `• ${fecha} - ${jornal.puesto} (${jornal.jornada}): ${jornal.total.toFixed(2)}€\n`;
        }

        if (calculo.jornales > 3) {
          respuesta += `_...y ${calculo.jornales - 3} jornales más_\n`;
        }
      }

      return {
        text: respuesta,
        intent: 'salario',
        confidence: 0.9,
        data: {
          type: 'salario',
          bruto: calculo.salarioBruto,
          neto: calculo.salarioNeto,
          irpf: calculo.irpf,
          jornales: calculo.jornales,
          quincena: calculo.quincena,
          detalle: calculo.detalleJornales
        }
      };

    } catch (error) {
      console.error('Error en handleSalarioQuery:', error);
      return {
        text: this.responses.error_datos,
        intent: 'salario',
        confidence: 0.9
      };
    }
  }

  async handleContratacionQuery() {
    try {
      const contratacion = await this.dataBridge.getContratacionHoy();

      if (!contratacion) {
        return {
          text: "No encontré contratación para hoy.",
          intent: 'donde_trabajo',
          confidence: 0.9
        };
      }

      return {
        text: `Hoy trabajas en **${contratacion.empresa}** como **${contratacion.puesto}**.`,
        intent: 'donde_trabajo',
        confidence: 0.9,
        data: {
          type: 'contratacion',
          empresa: contratacion.empresa,
          puesto: contratacion.puesto,
          jornada: contratacion.jornada,
          buque: contratacion.buque
        }
      };

    } catch (error) {
      console.error('Error en handleContratacionQuery:', error);
      return {
        text: this.responses.error_datos,
        intent: 'donde_trabajo',
        confidence: 0.9
      };
    }
  }

  async handlePuertasQuery() {
    try {
      const puertas = await this.dataBridge.getPuertas();

      if (!puertas || puertas.length === 0) {
        return {
          text: this.responses.sin_datos,
          intent: 'puertas',
          confidence: 0.9
        };
      }

      return {
        text: "Aquí tienes las puertas de hoy:",
        intent: 'puertas',
        confidence: 0.9,
        data: {
          type: 'puertas',
          puertas: puertas
        }
      };

    } catch (error) {
      console.error('Error en handlePuertasQuery:', error);
      return {
        text: this.responses.error_datos,
        intent: 'puertas',
        confidence: 0.9
      };
    }
  }

  async handleSalarioAnualQuery() {
    try {
      const calculo = await this.dataBridge.calcularSueldoAnual();

      if (!calculo || calculo.jornales === 0) {
        return {
          text: calculo?.mensaje || "No encontré jornales registrados este año.",
          intent: 'salario_anual',
          confidence: 0.9
        };
      }

      let respuesta = `📊 **Este año 2025**: llevas **${calculo.jornales} jornales** trabajados\n\n`;
      respuesta += `Salario bruto: ${calculo.salarioBruto}€\n`;
      respuesta += `IRPF (${calculo.irpfPorcentaje}%): -${calculo.irpf}€\n`;
      respuesta += `**Salario neto: ${calculo.salarioNeto}€**\n\n`;
      respuesta += `_Cálculo con valores reales de la tabla salarial_`;

      return {
        text: respuesta,
        intent: 'salario_anual',
        confidence: 0.9,
        data: {
          type: 'salario_anual',
          jornales: calculo.jornales,
          bruto: calculo.salarioBruto,
          neto: calculo.salarioNeto,
          irpf: calculo.irpf
        }
      };

    } catch (error) {
      console.error('Error en handleSalarioAnualQuery:', error);
      return {
        text: this.responses.error_datos,
        intent: 'salario_anual',
        confidence: 0.9
      };
    }
  }

  async handleSalarioMesPasadoQuery() {
    try {
      // Necesito crear una función similar a calcularSueldoQuincena pero para mes pasado
      const jornalesData = await this.dataBridge.getJornalesMesPasado();

      if (!jornalesData || jornalesData.total === 0) {
        return {
          text: "No encontré jornales en el mes pasado.",
          intent: 'salario_mes_pasado',
          confidence: 0.9
        };
      }

      // Calcular salario usando la misma lógica
      const [mapeoPuestos, tablaSalarial] = await Promise.all([
        window.SheetsAPI.getMapeoPuestos(),
        window.SheetsAPI.getTablaSalarial()
      ]);

      let irpfPorcentaje = 15;
      try {
        const configUsuario = await window.SheetsAPI.getUserConfig(this.dataBridge.currentChapa);
        if (configUsuario && configUsuario.irpf) {
          irpfPorcentaje = configUsuario.irpf;
        }
      } catch (error) {
        console.warn('⚠️ Error cargando IRPF, usando 15%');
      }

      let salarioBrutoTotal = 0;

      for (const jornal of jornalesData.jornales) {
        const puestoLower = jornal.puesto.trim().toLowerCase();
        const mapeo = mapeoPuestos.find(m => m.puesto.trim().toLowerCase() === puestoLower);

        if (!mapeo) continue;

        const grupoSalarial = mapeo.grupo_salarial;
        const jornada = jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, '');
        const tipoDia = this.dataBridge.determinarTipoDia(jornal.fecha, jornada);
        const claveJornada = `${jornada}_${tipoDia}`;

        const salarioRow = tablaSalarial.find(s => s.clave_jornada === claveJornada);
        if (!salarioRow) continue;

        let salarioBase = 0;
        if (grupoSalarial === 'Grupo 1') {
          salarioBase = parseFloat(salarioRow.jornal_base_g1) || 0;
        } else if (grupoSalarial === 'Grupo 2') {
          salarioBase = parseFloat(salarioRow.jornal_base_g2) || 0;
        }

        if (puestoLower === 'trincador' || puestoLower === 'trincador de coches') {
          salarioBase += 46.94;
        }

        let prima = 0;
        if (mapeo.tipo_operativa === 'Coches') {
          prima = parseFloat(salarioRow.prima_minima_coches) || 0;
        } else if (mapeo.tipo_operativa === 'Contenedor') {
          prima = 120 * (parseFloat(salarioRow.coef_prima_mayor120) || 0);
        }

        salarioBrutoTotal += salarioBase + prima;
      }

      const irpfImporte = (salarioBrutoTotal * irpfPorcentaje) / 100;
      const salarioNeto = salarioBrutoTotal - irpfImporte;

      let respuesta = `💰 **${jornalesData.mes}**: trabajaste **${jornalesData.total} jornales**\n\n`;
      respuesta += `Salario bruto: ${salarioBrutoTotal.toFixed(2)}€\n`;
      respuesta += `IRPF (${irpfPorcentaje}%): -${irpfImporte.toFixed(2)}€\n`;
      respuesta += `**Salario neto: ${salarioNeto.toFixed(2)}€**\n`;

      return {
        text: respuesta,
        intent: 'salario_mes_pasado',
        confidence: 0.9,
        data: {
          type: 'salario_mes_pasado',
          bruto: salarioBrutoTotal.toFixed(2),
          neto: salarioNeto.toFixed(2),
          irpf: irpfImporte.toFixed(2),
          jornales: jornalesData.total,
          mes: jornalesData.mes
        }
      };

    } catch (error) {
      console.error('Error en handleSalarioMesPasadoQuery:', error);
      return {
        text: this.responses.error_datos,
        intent: 'salario_mes_pasado',
        confidence: 0.9
      };
    }
  }

  async handleJornalesMesPasadoQuery() {
    try {
      const jornales = await this.dataBridge.getJornalesMesPasado();

      if (!jornales || jornales.total === 0) {
        return {
          text: "No encontré jornales registrados en el mes pasado.",
          intent: 'jornales_mes_pasado',
          confidence: 0.9
        };
      }

      // Crear resumen de jornales
      let respuesta = `📊 **${jornales.mes}**: trabajaste **${jornales.total} jornales**\n\n`;

      // Mostrar los primeros 5 jornales como resumen
      const jornalesParaMostrar = jornales.jornales.slice(0, 5);

      respuesta += `**Últimos jornales:**\n`;
      for (const jornal of jornalesParaMostrar) {
        let fecha = '-';
        if (jornal.fecha) {
          if (jornal.fecha.includes('/')) {
            const partes = jornal.fecha.split('/');
            if (partes.length === 3) {
              fecha = `${partes[0]}/${partes[1]}`;
            }
          } else {
            const dateObj = new Date(jornal.fecha);
            if (!isNaN(dateObj.getTime())) {
              fecha = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
            }
          }
        }
        const especialidad = jornal.puesto ? ` [${jornal.puesto}]` : '';
        respuesta += `• ${fecha} - ${jornal.empresa || 'N/A'} (${jornal.jornada || 'N/A'})${especialidad}\n`;
      }

      if (jornales.total > 5) {
        respuesta += `\n_...y ${jornales.total - 5} jornales más_\n`;
      }

      return {
        text: respuesta,
        intent: 'jornales_mes_pasado',
        confidence: 0.9,
        data: {
          type: 'jornales_mes_pasado',
          total: jornales.total,
          mes: jornales.mes,
          jornales: jornales.jornales
        }
      };

    } catch (error) {
      console.error('Error en handleJornalesMesPasadoQuery:', error);
      return {
        text: this.responses.error_datos,
        intent: 'jornales_mes_pasado',
        confidence: 0.9
      };
    }
  }

  async handleJornalMaximoQuery(periodo = 'quincena') {
    try {
      const jornalMax = await this.dataBridge.getJornalMasAlto(periodo);

      if (!jornalMax) {
        const periodoTexto = periodo === 'quincena' ? 'esta quincena' : 'el mes pasado';
        return {
          text: `No encontré jornales en ${periodoTexto}.`,
          intent: 'jornal_maximo',
          confidence: 0.9
        };
      }

      const periodoTexto = periodo === 'quincena' ? 'esta quincena' : 'el mes pasado';
      let respuesta = `💰 **Tu jornal más alto de ${periodoTexto}**: **${jornalMax.salarioCalculado.toFixed(2)}€**\n\n`;
      respuesta += `📅 **Fecha**: ${jornalMax.fecha}\n`;
      respuesta += `🏢 **Empresa**: ${jornalMax.empresa}\n`;
      respuesta += `👷 **Puesto**: ${jornalMax.puesto}\n`;
      respuesta += `🕐 **Jornada**: ${jornalMax.jornada}\n`;

      return {
        text: respuesta,
        intent: 'jornal_maximo',
        confidence: 0.9,
        data: {
          type: 'jornal_maximo',
          jornal: jornalMax
        }
      };

    } catch (error) {
      console.error('Error en handleJornalMaximoQuery:', error);
      return {
        text: this.responses.error_datos,
        intent: 'jornal_maximo',
        confidence: 0.9
      };
    }
  }

  async handlePrimaMaximaQuery(periodo = 'quincena') {
    try {
      const primaMax = await this.dataBridge.getPrimaMasAlta(periodo);

      if (!primaMax) {
        const periodoTexto = periodo === 'quincena' ? 'esta quincena' : 'el mes pasado';
        return {
          text: `No encontré primas personalizadas en ${periodoTexto}.`,
          intent: 'prima_maxima',
          confidence: 0.9
        };
      }

      const periodoTexto = periodo === 'quincena' ? 'esta quincena' : 'el mes pasado';
      let respuesta = `🏆 **Tu prima más alta de ${periodoTexto}**: **${primaMax.prima_personalizada}€**\n\n`;
      respuesta += `📅 **Fecha**: ${primaMax.fecha}\n`;
      respuesta += `🕐 **Jornada**: ${primaMax.jornada}\n`;

      if (primaMax.movimientos_personalizados > 0) {
        respuesta += `📦 **Movimientos**: ${primaMax.movimientos_personalizados}\n`;
      }

      return {
        text: respuesta,
        intent: 'prima_maxima',
        confidence: 0.9,
        data: {
          type: 'prima_maxima',
          prima: primaMax
        }
      };

    } catch (error) {
      console.error('Error en handlePrimaMaximaQuery:', error);
      return {
        text: this.responses.error_datos,
        intent: 'prima_maxima',
        confidence: 0.9
      };
    }
  }

  async handleJornalesHorarioQuery(userMessage) {
    try {
      // Extraer horarios del mensaje (ej: "20 a 02" o "20-02")
      const match = userMessage.match(/(\d{1,2}).*?(\d{1,2})/);

      if (!match) {
        return {
          text: "No pude identificar el horario. Por favor, especifica el rango de horas (ej: 20 a 02).",
          intent: 'jornales_horario',
          confidence: 0.9
        };
      }

      const horarioInicio = match[1].padStart(2, '0');
      const horarioFin = match[2].padStart(2, '0');

      // Por defecto, buscar en la quincena
      const jornales = await this.dataBridge.getJornalesPorHorario(horarioInicio, horarioFin, 'quincena');

      if (!jornales || jornales.total === 0) {
        return {
          text: `No encontré jornales en el horario ${horarioInicio}:00 a ${horarioFin}:00 esta quincena.`,
          intent: 'jornales_horario',
          confidence: 0.9
        };
      }

      let respuesta = `📊 **Jornales de ${horarioInicio}:00 a ${horarioFin}:00 esta quincena**: **${jornales.total} jornales**\n\n`;

      // Mostrar los primeros 5
      const jornalesParaMostrar = jornales.jornales.slice(0, 5);

      for (const jornal of jornalesParaMostrar) {
        let fecha = '-';
        if (jornal.fecha) {
          if (jornal.fecha.includes('/')) {
            const partes = jornal.fecha.split('/');
            if (partes.length === 3) {
              fecha = `${partes[0]}/${partes[1]}`;
            }
          } else {
            const dateObj = new Date(jornal.fecha);
            if (!isNaN(dateObj.getTime())) {
              fecha = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
            }
          }
        }
        respuesta += `• ${fecha} - ${jornal.empresa || 'N/A'}\n`;
      }

      if (jornales.total > 5) {
        respuesta += `\n_...y ${jornales.total - 5} jornales más_\n`;
      }

      return {
        text: respuesta,
        intent: 'jornales_horario',
        confidence: 0.9,
        data: {
          type: 'jornales_horario',
          total: jornales.total,
          horario: `${horarioInicio}-${horarioFin}`,
          jornales: jornales.jornales
        }
      };

    } catch (error) {
      console.error('Error en handleJornalesHorarioQuery:', error);
      return {
        text: this.responses.error_datos,
        intent: 'jornales_horario',
        confidence: 0.9
      };
    }
  }

  async handleEmpresaMasTrabajadaQuery(userMessage) {
    try {
      // Detectar periodo en el mensaje
      let periodo = 'quincena';
      if (/mes pasado|mes anterior/i.test(userMessage)) {
        periodo = 'mes-pasado';
      } else if (/este año|anual/i.test(userMessage)) {
        periodo = 'anual';
      }

      const empresaData = await this.dataBridge.getEmpresaMasTrabajada(periodo);

      if (!empresaData) {
        const periodoTexto = periodo === 'quincena' ? 'esta quincena' :
                            periodo === 'mes-pasado' ? 'el mes pasado' : 'este año';
        return {
          text: `No encontré jornales en ${periodoTexto}.`,
          intent: 'empresa_mas_trabajada',
          confidence: 0.9
        };
      }

      const periodoTexto = periodo === 'quincena' ? 'esta quincena' :
                          periodo === 'mes-pasado' ? 'el mes pasado' : 'este año';

      let respuesta = `🏢 **La empresa donde más has trabajado ${periodoTexto}**: **${empresaData.empresa}**\n\n`;
      respuesta += `📊 **Jornales en esta empresa**: ${empresaData.jornales} de ${empresaData.totalJornales} (${empresaData.porcentaje}%)\n`;

      return {
        text: respuesta,
        intent: 'empresa_mas_trabajada',
        confidence: 0.9,
        data: {
          type: 'empresa_mas_trabajada',
          empresa: empresaData
        }
      };

    } catch (error) {
      console.error('Error en handleEmpresaMasTrabajadaQuery:', error);
      return {
        text: this.responses.error_datos,
        intent: 'empresa_mas_trabajada',
        confidence: 0.9
      };
    }
  }

  async handleJornadaMasTrabajadaQuery(userMessage) {
    try {
      // Detectar periodo en el mensaje
      let periodo = 'quincena';
      if (/mes pasado|mes anterior/i.test(userMessage)) {
        periodo = 'mes-pasado';
      } else if (/este año|anual/i.test(userMessage)) {
        periodo = 'anual';
      }

      const jornadaData = await this.dataBridge.getJornadaMasTrabajada(periodo);

      if (!jornadaData) {
        const periodoTexto = periodo === 'quincena' ? 'esta quincena' :
                            periodo === 'mes-pasado' ? 'el mes pasado' : 'este año';
        return {
          text: `No encontré jornales en ${periodoTexto}.`,
          intent: 'jornada_mas_trabajada',
          confidence: 0.9
        };
      }

      const periodoTexto = periodo === 'quincena' ? 'esta quincena' :
                          periodo === 'mes-pasado' ? 'el mes pasado' : 'este año';

      let respuesta = `🕐 **La jornada donde más has trabajado ${periodoTexto}**: **${jornadaData.jornada}**\n\n`;
      respuesta += `📊 **Jornales en esta jornada**: ${jornadaData.jornales} de ${jornadaData.totalJornales} (${jornadaData.porcentaje}%)\n`;

      return {
        text: respuesta,
        intent: 'jornada_mas_trabajada',
        confidence: 0.9,
        data: {
          type: 'jornada_mas_trabajada',
          jornada: jornadaData
        }
      };

    } catch (error) {
      console.error('Error en handleJornadaMasTrabajadaQuery:', error);
      return {
        text: this.responses.error_datos,
        intent: 'jornada_mas_trabajada',
        confidence: 0.9
      };
    }
  }

  async handleDiaMayorPrimaQuery(userMessage) {
    try {
      // Detectar periodo en el mensaje
      let periodo = 'quincena';
      if (/mes pasado|mes anterior/i.test(userMessage)) {
        periodo = 'mes-pasado';
      }

      const primaData = await this.dataBridge.getDiaMayorPrima(periodo);

      if (!primaData) {
        const periodoTexto = periodo === 'quincena' ? 'esta quincena' : 'el mes pasado';
        return {
          text: `No encontré primas personalizadas en ${periodoTexto}.`,
          intent: 'dia_mayor_prima',
          confidence: 0.9
        };
      }

      const periodoTexto = periodo === 'quincena' ? 'esta quincena' : 'el mes pasado';

      let respuesta = `💎 **El día con mayor prima ${periodoTexto}**: **${primaData.prima_personalizada}€**\n\n`;
      respuesta += `📅 **Fecha**: ${primaData.fecha}\n`;
      respuesta += `🕐 **Jornada**: ${primaData.jornada}\n`;

      if (primaData.movimientos_personalizados > 0) {
        respuesta += `📦 **Movimientos**: ${primaData.movimientos_personalizados}\n`;
      }

      return {
        text: respuesta,
        intent: 'dia_mayor_prima',
        confidence: 0.9,
        data: {
          type: 'dia_mayor_prima',
          prima: primaData
        }
      };

    } catch (error) {
      console.error('Error en handleDiaMayorPrimaQuery:', error);
      return {
        text: this.responses.error_datos,
        intent: 'dia_mayor_prima',
        confidence: 0.9
      };
    }
  }

  /**
   * Handler para consultar festivos no laborables del puerto
   */
  async handleFestivosQuery() {
    try {
      let respuesta = `📅 **Festivos no laborables en el Puerto de Valencia 2025:**\n\n`;
      respuesta += `🎉 **1 de enero** (Año Nuevo)\n`;
      respuesta += `👑 **6 de enero** - SOLO jornadas 02-08 y 20-02\n`;
      respuesta += `🌸 **19 de marzo** (San José)\n`;
      respuesta += `⚒️ **1 de mayo** (Día del Trabajo)\n`;
      respuesta += `🎊 **9 de octubre** (Día de la Comunidad Valenciana)\n`;
      respuesta += `🎄 **25 de diciembre** (Navidad)\n`;
      respuesta += `🎉 **16 de julio** - SOLO jornadas 08-14 y 14-20\n\n`;
      respuesta += `_Estos festivos no se trabaja en ninguna de las empresas del puerto._`;

      return {
        text: respuesta,
        intent: 'festivos',
        confidence: 0.9
      };

    } catch (error) {
      console.error('Error en handleFestivosQuery:', error);
      return {
        text: this.responses.error_datos,
        intent: 'festivos',
        confidence: 0.9
      };
    }
  }

  /**
   * Handler para consultar tarifas/jornales
   */
  async handleTarifaQuery(userMessage) {
    try {
      // Detectar horario en el mensaje y normalizarlo a formato "XX a YY"
      let horario = null;
      const horarioMatch = userMessage.match(/(02|08|14|20).*?(08|14|20|02)/i);
      if (horarioMatch) {
        const inicio = horarioMatch[1].padStart(2, '0');
        const fin = horarioMatch[2].padStart(2, '0');
        horario = `${inicio} a ${fin}`; // Formato: "20 a 02"
      }

      // Detectar tipo de día y mapear a códigos de la tabla
      // LAB = laborable, SAB = sábado, FES = festivo
      let codigoJornada = 'LAB';
      if (/domingo|festivo/i.test(userMessage)) {
        codigoJornada = 'FES';
      } else if (/sábado|sabado/i.test(userMessage)) {
        codigoJornada = 'SAB';
      }

      // Si pregunta por trinca/destrinca
      if (/trinca|destrinca/i.test(userMessage)) {
        const tarifas = await window.SheetsAPI.getTarifasTrincaDestrinca();

        if (!tarifas || tarifas.length === 0) {
          return {
            text: "No pude cargar las tarifas de trinca/destrinca.",
            intent: 'consulta_tarifa',
            confidence: 0.9
          };
        }

        // Detectar si es trinca o destrinca
        const esDestrinca = /destrinca/i.test(userMessage);

        // Detectar horario si lo especifica
        let respuesta = '';
        if (horario) {
          // Buscar tarifa específica
          // Normalizar horario en la tabla (puede tener espacios extra)
          const tarifa = tarifas.find(t => {
            const horarioTabla = t.horario.trim();
            const jornadaTabla = t.jornada.trim();

            // Coincide el horario Y la jornada contiene el código
            return horarioTabla === horario && jornadaTabla.includes(codigoJornada);
          });

          if (tarifa) {
            const precio = esDestrinca ? tarifa.tarifa_destrinca : tarifa.tarifa_trinca;
            const nombreJornada = codigoJornada === 'LAB' ? 'laborable' :
                                  codigoJornada === 'SAB' ? 'sábado' : 'festivo';

            respuesta = `💰 **${esDestrinca ? 'Destrinca' : 'Trinca'} de ${horario} ${nombreJornada}**: **${precio}€** por barra\n\n`;
            respuesta += `_Fuente: Tabla de tarifas de trinca/destrinca del puerto_`;
          } else {
            respuesta = `No encontré la tarifa para ${horario} ${codigoJornada}.\n\n`;
            respuesta += `_Asegúrate de especificar el horario (02 a 08, 08 a 14, 14 a 20, 20 a 02) y el tipo de día (laborable, sábado, festivo)_`;
          }
        } else {
          // Mostrar todas las tarifas agrupadas por tipo de día
          respuesta = `💰 **Tarifas de ${esDestrinca ? 'Destrinca' : 'Trinca'} (€/barra):**\n\n`;

          // Agrupar por tipo de día
          const grupos = {
            'LAB': [],
            'SAB': [],
            'FES': []
          };

          for (const tarifa of tarifas) {
            const jornadaTabla = tarifa.jornada.trim();
            if (jornadaTabla.includes('LAB') && !jornadaTabla.includes('FES')) {
              grupos['LAB'].push(tarifa);
            } else if (jornadaTabla.includes('SAB')) {
              grupos['SAB'].push(tarifa);
            } else if (jornadaTabla.includes('FES')) {
              grupos['FES'].push(tarifa);
            }
          }

          // Mostrar cada grupo
          const nombresGrupos = {
            'LAB': 'LABORABLE',
            'SAB': 'SÁBADO',
            'FES': 'FESTIVO'
          };

          for (const [codigo, nombre] of Object.entries(nombresGrupos)) {
            if (grupos[codigo].length > 0) {
              respuesta += `**${nombre}:**\n`;
              for (const tarifa of grupos[codigo]) {
                const precio = esDestrinca ? tarifa.tarifa_destrinca : tarifa.tarifa_trinca;
                respuesta += `  • ${tarifa.horario}: ${precio}€\n`;
              }
              respuesta += `\n`;
            }
          }
        }

        return {
          text: respuesta,
          intent: 'consulta_tarifa',
          confidence: 0.9
        };
      }

      // Si pregunta por jornal (no trinca/destrinca)
      if (!horario) {
        return {
          text: "Por favor, especifica la jornada que te interesa. Por ejemplo: '¿Cuánto es el jornal de 14-20 el domingo?'",
          intent: 'consulta_tarifa',
          confidence: 0.9
        };
      }

      // Obtener tabla salarial
      const tablaSalarial = await window.SheetsAPI.getTablaSalarial();

      if (!tablaSalarial || tablaSalarial.length === 0) {
        return {
          text: "No pude cargar la tabla salarial.",
          intent: 'consulta_tarifa',
          confidence: 0.9
        };
      }

      // Convertir horario a formato con guión para tabla salarial
      const jornadaParaTabla = horario.replace(' a ', '-'); // "20 a 02" -> "20-02"

      // Mapear código de jornada a tipo de día para tabla salarial
      // Tabla salarial usa: LABORABLE, SABADO, FESTIVO
      const tipoDiaTabla = codigoJornada === 'LAB' ? 'LABORABLE' :
                           codigoJornada === 'SAB' ? 'SABADO' : 'FESTIVO';

      // Buscar en tabla salarial
      const claveJornada = `${jornadaParaTabla}_${tipoDiaTabla}`;
      const salarioRow = tablaSalarial.find(s => s.clave_jornada === claveJornada);

      if (!salarioRow) {
        return {
          text: `No encontré información salarial para ${jornadaParaTabla} ${tipoDiaTabla.toLowerCase()}. Prueba con otra jornada o día.`,
          intent: 'consulta_tarifa',
          confidence: 0.9
        };
      }

      let respuesta = `💰 **Jornal de ${jornadaParaTabla} ${tipoDiaTabla.toLowerCase()}:**\n\n`;
      respuesta += `**Grupo 1:**\n`;
      respuesta += `  • Jornal base: ${salarioRow.jornal_base_g1}€\n`;
      respuesta += `  • Prima mínima coches: ${salarioRow.prima_minima_coches}€\n`;
      respuesta += `  • Coef. prima <120: ${salarioRow.coef_prima_menor120}\n`;
      respuesta += `  • Coef. prima >120: ${salarioRow.coef_prima_mayor120}\n\n`;

      respuesta += `**Grupo 2:**\n`;
      respuesta += `  • Jornal base: ${salarioRow.jornal_base_g2}€\n`;
      respuesta += `  • Prima mínima coches: ${salarioRow.prima_minima_coches}€\n`;
      respuesta += `  • Coef. prima <120: ${salarioRow.coef_prima_menor120}\n`;
      respuesta += `  • Coef. prima >120: ${salarioRow.coef_prima_mayor120}\n\n`;

      respuesta += `_Nota: Los trincadores tienen un complemento adicional de +46,94€_`;

      return {
        text: respuesta,
        intent: 'consulta_tarifa',
        confidence: 0.9
      };

    } catch (error) {
      console.error('Error en handleTarifaQuery:', error);
      return {
        text: this.responses.error_datos,
        intent: 'consulta_tarifa',
        confidence: 0.9
      };
    }
  }

  /**
   * Handler para consultar cuántas chapas están disponibles (color verde)
   */
  async handleChapasDisponiblesQuery() {
    try {
      const censo = await window.SheetsAPI.getCenso();

      if (!censo || censo.length === 0) {
        return {
          text: "No pude obtener el censo actual.",
          intent: 'chapas_disponibles',
          confidence: 0.9
        };
      }

      // Contar chapas por color
      // color puede ser: 'red' (0), 'orange' (1), 'yellow' (2), 'blue' (3), 'green' (4)
      const colorCounts = {
        'green': 0,   // Disponible
        'blue': 0,    // 3 jornadas
        'yellow': 0,  // 2 jornadas
        'orange': 0,  // 1 jornada
        'red': 0      // No disponible
      };

      for (const trabajador of censo) {
        const color = trabajador.color;
        if (colorCounts.hasOwnProperty(color)) {
          colorCounts[color]++;
        }
      }

      const totalCenso = censo.length;
      const disponibles = colorCounts['green'];
      const porcentajeDisponibles = ((disponibles / totalCenso) * 100).toFixed(1);

      let respuesta = `📊 **Estado del censo hoy:**\n\n`;
      respuesta += `✅ **${disponibles} chapas disponibles** (color verde) - ${porcentajeDisponibles}%\n\n`;
      respuesta += `**Desglose completo:**\n`;
      respuesta += `🟢 Verde (disponible): ${colorCounts['green']}\n`;
      respuesta += `🔵 Azul (3 jornadas): ${colorCounts['blue']}\n`;
      respuesta += `🟡 Amarillo (2 jornadas): ${colorCounts['yellow']}\n`;
      respuesta += `🟠 Naranja (1 jornada): ${colorCounts['orange']}\n`;
      respuesta += `🔴 Rojo (no disponible): ${colorCounts['red']}\n\n`;
      respuesta += `📌 **Total en censo**: ${totalCenso} trabajadores`;

      return {
        text: respuesta,
        intent: 'chapas_disponibles',
        confidence: 0.9,
        data: {
          type: 'chapas_disponibles',
          disponibles: disponibles,
          total: totalCenso,
          porcentaje: porcentajeDisponibles,
          desglose: colorCounts
        }
      };

    } catch (error) {
      console.error('Error en handleChapasDisponiblesQuery:', error);
      return {
        text: this.responses.error_datos,
        intent: 'chapas_disponibles',
        confidence: 0.9
      };
    }
  }

  /**
   * Handler para consultar el Convenio Colectivo usando OpenAI Assistant
   */
  async handleConvenioQuery(userMessage) {
    try {
      // Verificar que el sistema de assistants esté disponible
      if (!window.OpenAIAssistants) {
        return {
          text: "❌ El sistema de consultas de documentos no está disponible. Por favor, recarga la página.",
          intent: 'convenio',
          confidence: 0.85
        };
      }

      // Verificar que haya API key configurada
      if (!window.OpenAIAssistants.isConfigured()) {
        return {
          text: "❌ No hay API key de OpenAI configurada. Por favor, configúrala para poder consultar el convenio colectivo.",
          intent: 'convenio',
          confidence: 0.85
        };
      }

      // Obtener la chapa del usuario para mantener contexto
      const userId = this.dataBridge?.currentChapa || 'default';

      // Consultar el assistant
      const respuesta = await window.OpenAIAssistants.consultarAssistant(
        'convenio',
        userMessage,
        userId
      );

      return {
        text: `📋 **Convenio Colectivo de la Estiba:**\n\n${respuesta}\n\n_Fuente: Convenio Colectivo del Puerto de Valencia_`,
        intent: 'convenio',
        confidence: 0.85,
        data: {
          type: 'convenio',
          fuente: 'assistant'
        }
      };

    } catch (error) {
      console.error('Error en handleConvenioQuery:', error);
      return {
        text: "❌ Error al consultar el convenio colectivo. Por favor, intenta de nuevo.",
        intent: 'convenio',
        confidence: 0.85
      };
    }
  }

  /**
   * Handler para consultar el V Acuerdo Marco usando OpenAI Assistant
   */
  async handleAcuerdoMarcoQuery(userMessage) {
    try {
      // Verificar que el sistema de assistants esté disponible
      if (!window.OpenAIAssistants) {
        return {
          text: "❌ El sistema de consultas de documentos no está disponible. Por favor, recarga la página.",
          intent: 'acuerdo_marco',
          confidence: 0.85
        };
      }

      // Verificar que haya API key configurada
      if (!window.OpenAIAssistants.isConfigured()) {
        return {
          text: "❌ No hay API key de OpenAI configurada. Por favor, configúrala para poder consultar el V Acuerdo Marco.",
          intent: 'acuerdo_marco',
          confidence: 0.85
        };
      }

      // Verificar que el assistant del acuerdo marco esté configurado
      if (!window.OpenAIAssistants.assistants.acuerdo_marco) {
        return {
          text: "❌ El assistant del V Acuerdo Marco aún no está configurado. Por favor, créalo primero usando el archivo crear_asistente.js con el PDF BOE-A-2022-8165.pdf",
          intent: 'acuerdo_marco',
          confidence: 0.85
        };
      }

      // Obtener la chapa del usuario para mantener contexto
      const userId = this.dataBridge?.currentChapa || 'default';

      // Consultar el assistant
      const respuesta = await window.OpenAIAssistants.consultarAssistant(
        'acuerdo_marco',
        userMessage,
        userId
      );

      return {
        text: `📜 **V Acuerdo Marco Estatal del Sector de la Estiba Portuaria:**\n\n${respuesta}\n\n_Fuente: BOE-A-2022-8165_`,
        intent: 'acuerdo_marco',
        confidence: 0.85,
        data: {
          type: 'acuerdo_marco',
          fuente: 'assistant'
        }
      };

    } catch (error) {
      console.error('Error en handleAcuerdoMarcoQuery:', error);
      return {
        text: "❌ Error al consultar el V Acuerdo Marco. Por favor, intenta de nuevo.",
        intent: 'acuerdo_marco',
        confidence: 0.85
      };
    }
  }

  /**
   * Handler para consultar la Guía de Contratación usando OpenAI Assistant
   */
  async handleGuiaContratacionQuery(userMessage) {
    try {
      // Verificar que el sistema de assistants esté disponible
      if (!window.OpenAIAssistants) {
        return {
          text: "❌ El sistema de consultas de documentos no está disponible. Por favor, recarga la página.",
          intent: 'guia_contratacion',
          confidence: 0.85
        };
      }

      // Verificar que haya API key configurada
      if (!window.OpenAIAssistants.isConfigured()) {
        return {
          text: "❌ No hay API key de OpenAI configurada. Por favor, configúrala para poder consultar la Guía de Contratación.",
          intent: 'guia_contratacion',
          confidence: 0.85
        };
      }

      // Verificar que el assistant de la guía esté configurado
      if (!window.OpenAIAssistants.assistants.guia_contratacion) {
        return {
          text: "❌ El assistant de la Guía de Contratación aún no está configurado.",
          intent: 'guia_contratacion',
          confidence: 0.85
        };
      }

      // Obtener la chapa del usuario para mantener contexto
      const userId = this.dataBridge?.currentChapa || 'default';

      // Consultar el assistant
      const respuesta = await window.OpenAIAssistants.consultarAssistant(
        'guia_contratacion',
        userMessage,
        userId
      );

      return {
        text: `📝 **Guía de Contratación - Puerto de Valencia:**\n\n${respuesta}\n\n_Fuente: Guía de Contratación del Puerto_`,
        intent: 'guia_contratacion',
        confidence: 0.85,
        data: {
          type: 'guia_contratacion',
          fuente: 'assistant'
        }
      };

    } catch (error) {
      console.error('Error en handleGuiaContratacionQuery:', error);
      return {
        text: "❌ Error al consultar la Guía de Contratación. Por favor, intenta de nuevo.",
        intent: 'guia_contratacion',
        confidence: 0.85
      };
    }
  }

  /**
   * Mejora una respuesta local con Groq (sin inventar datos)
   */
  async enhanceWithGroq(localResponse, userMessage) {
    try {
      console.log('✨ Mejorando respuesta con Groq...');

      const systemPrompt = `Eres un asistente virtual del Puerto de Valencia.
Tu trabajo es reformular la respuesta de forma más amigable y natural, pero NUNCA inventar datos.
Usa EXACTAMENTE los datos proporcionados, solo mejora la redacción.`;

      const userPrompt = `El usuario preguntó: "${userMessage}"

Los datos REALES son:
${localResponse.text}

Reformula esta respuesta de forma amigable pero SIN cambiar ningún dato numérico.`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3, // Baja temperatura para menos creatividad
          max_tokens: 300
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      const enhancedText = data.choices[0].message.content;

      console.log('✅ Respuesta mejorada con Groq');

      return {
        ...localResponse,
        text: enhancedText
      };

    } catch (error) {
      console.error('❌ Error mejorando con Groq:', error);
      // Si falla, devolver respuesta local original
      return localResponse;
    }
  }

  /**
   * Genera respuesta usando Groq API (gratuita)
   */
  async generateGroqResponse(intent, userMessage) {
    if (!this.apiKey) {
      console.warn('⚠️ Groq API key no configurada, usando modo local');
      return await this.generateLocalResponse(intent, userMessage);
    }

    try {
      console.log('🤖 Usando Groq API para responder');

      // Construir contexto basado en la intención detectada
      let systemPrompt = `Eres un asistente virtual para trabajadores del Puerto de Valencia.
Respondes de forma amigable, concisa y clara en español.
Puedes consultar datos de jornales, posición en censo, salarios y contrataciones.`;

      let userPrompt = userMessage;

      // Si tenemos datos de la intención, añadirlos al contexto
      if (intent.action === 'consultar_jornales') {
        const jornales = await this.dataBridge.getJornalesQuincena();
        if (jornales) {
          systemPrompt += `\n\nDatos disponibles: El usuario tiene ${jornales.total} jornales en ${jornales.quincena}.`;
        }
      } else if (intent.action === 'consultar_posicion') {
        const posicion = await this.dataBridge.getPosicionUsuario();
        if (posicion) {
          systemPrompt += `\n\nDatos disponibles: El usuario está en la posición ${posicion.posicion} del censo.`;
          if (posicion.posicionesLaborable) {
            systemPrompt += ` Está a ${posicion.posicionesLaborable} posiciones de la puerta laborable.`;
          }
        }
      } else if (intent.action === 'consultar_salario') {
        const salario = await this.dataBridge.getSalarioQuincena();
        if (salario) {
          systemPrompt += `\n\nDatos disponibles: El usuario lleva ganado aproximadamente ${salario.bruto}€ brutos (${salario.neto}€ netos) en ${salario.quincena}.`;
        }
      } else if (intent.action === 'consultar_contratacion') {
        const contratacion = await this.dataBridge.getContratacionHoy();
        if (contratacion) {
          systemPrompt += `\n\nDatos disponibles: Hoy trabaja en ${contratacion.empresa} como ${contratacion.puesto}, jornada ${contratacion.jornada}.`;
        }
      }

      // Llamar a Groq API
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant', // Modelo rápido y gratuito
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      console.log('✅ Respuesta de Groq:', aiResponse);

      return {
        text: aiResponse,
        intent: intent.name,
        confidence: intent.confidence
      };

    } catch (error) {
      console.error('❌ Error con Groq API:', error);
      console.warn('⏳ Fallback a modo local');
      return await this.generateLocalResponse(intent, userMessage);
    }
  }

  /**
   * Genera respuesta usando xAI (Grok)
   */
  async generateXAIResponse(intent, userMessage) {
    if (!this.apiKey) {
      console.warn('⚠️ xAI API key no configurada, usando modo local');
      return await this.generateLocalResponse(intent, userMessage);
    }

    try {
      console.log('🤖 Usando xAI (Grok) para responder');

      // Construir contexto basado en la intención detectada
      let systemPrompt = `Eres un asistente virtual para trabajadores del Puerto de Valencia.
Respondes de forma amigable, concisa y clara en español.
Puedes consultar datos de jornales, posición en censo, salarios y contrataciones.
Tu nombre es "Asistente IA del Puerto de Valencia".`;

      let userPrompt = userMessage;

      // Si tenemos datos de la intención, añadirlos al contexto
      if (intent.action === 'consultar_jornales') {
        const jornales = await this.dataBridge.getJornalesQuincena();
        if (jornales) {
          systemPrompt += `\n\nDatos disponibles: El usuario tiene ${jornales.total} jornales en ${jornales.quincena}.`;
        }
      } else if (intent.action === 'consultar_posicion') {
        const posicion = await this.dataBridge.getPosicionUsuario();
        if (posicion) {
          systemPrompt += `\n\nDatos disponibles: El usuario está en la posición ${posicion.posicion} del censo.`;
          if (posicion.posicionesLaborable) {
            systemPrompt += ` Está a ${posicion.posicionesLaborable} posiciones de la puerta laborable.`;
          }
        }
      } else if (intent.action === 'consultar_salario') {
        const salario = await this.dataBridge.getSalarioQuincena();
        if (salario) {
          systemPrompt += `\n\nDatos disponibles: El usuario lleva ganado aproximadamente ${salario.bruto}€ brutos (${salario.neto}€ netos) en ${salario.quincena}.`;
        }
      } else if (intent.action === 'consultar_contratacion') {
        const contratacion = await this.dataBridge.getContratacionHoy();
        if (contratacion) {
          systemPrompt += `\n\nDatos disponibles: Hoy trabaja en ${contratacion.empresa} como ${contratacion.puesto}, jornada ${contratacion.jornada}.`;
        }
      }

      // Llamar a xAI API (compatible con OpenAI)
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`xAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      console.log('✅ Respuesta de xAI (Grok):', aiResponse);

      return {
        text: aiResponse,
        intent: intent.name,
        confidence: intent.confidence
      };

    } catch (error) {
      console.error('❌ Error con xAI API:', error);
      console.warn('⏳ Fallback a modo local');
      return await this.generateLocalResponse(intent, userMessage);
    }
  }

  /**
   * Genera respuesta usando OpenAI GPT-4
   */
  async generateOpenAIResponse(intent, userMessage) {
    if (!this.apiKey) {
      console.warn('⚠️ OpenAI API key no configurada, usando modo local');
      return await this.generateLocalResponse(intent, userMessage);
    }

    try {
      console.log('🤖 Usando OpenAI GPT-4 para responder');

      // SIEMPRE obtener datos reales primero
      const localResponse = await this.generateLocalResponse(intent, userMessage);

      // Si hay datos, usar GPT-4 para mejorar la redacción
      if (localResponse.data) {
        const systemPrompt = `Eres un asistente virtual del Puerto de Valencia.
Tu trabajo es reformular respuestas de forma amigable y natural, pero NUNCA inventar datos.
Usa EXACTAMENTE los datos proporcionados, solo mejora la redacción y hazla más conversacional.
Mantén el formato markdown para negrita (**texto**) y emojis.`;

        const userPrompt = `El usuario preguntó: "${userMessage}"

Los datos REALES son:
${localResponse.text}

Reformula esta respuesta de forma amigable, conversacional y natural, pero SIN cambiar ningún dato numérico ni información factual.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini', // Modelo más económico pero potente
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.3,
            max_tokens: 500
          })
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const enhancedText = data.choices[0].message.content;

        console.log('✅ Respuesta mejorada con OpenAI GPT-4');

        return {
          ...localResponse,
          text: enhancedText
        };
      }

      // Si no hay datos (saludos, ayuda, etc), usar respuesta local
      return localResponse;

    } catch (error) {
      console.error('❌ Error con OpenAI API:', error);
      console.warn('⏳ Fallback a modo local');
      return await this.generateLocalResponse(intent, userMessage);
    }
  }

  /**
   * Utilidades
   */
  getRandomResponse(responses) {
    if (Array.isArray(responses)) {
      return responses[Math.floor(Math.random() * responses.length)];
    }
    return responses;
  }

  setMode(mode) {
    this.mode = mode;
    localStorage.setItem('ai_mode', mode);
    console.log('🔄 Modo de IA cambiado a:', mode);
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
    localStorage.setItem('ai_api_key', apiKey);
    console.log('🔑 API Key guardada');
  }
}

// Exportar
window.AIEngine = AIEngine;
