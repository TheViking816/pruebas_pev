/**
 * PWA Data Bridge
 * Puente para acceder a los datos de la PWA principal desde el chatbot
 * Utiliza Supabase compartido y localStorage
 */

class PWADataBridge {
  constructor() {
    this.supabase = null;
    this.currentChapa = null;
  }

  /**
   * Inicializa el puente de datos
   */
  async initialize() {
    // Inicializar Supabase (compartido con PWA principal)
    if (typeof initSupabase === 'function') {
      initSupabase();
      this.supabase = window.supabase;
    }

    // PRIORIDAD 1: Intentar leer auth de la PWA principal (SIEMPRE primero)
    const pwaChapa = localStorage.getItem('currentChapa');

    if (pwaChapa) {
      this.currentChapa = pwaChapa;
      console.log('✅ Autenticación heredada de PWA principal:', this.currentChapa);

      // Guardar también en chatbot_auth para futuras sesiones
      localStorage.setItem('chatbot_auth', JSON.stringify({
        chapa: this.currentChapa,
        timestamp: Date.now()
      }));

      return true;
    }

    // PRIORIDAD 2: Si no hay auth de PWA, verificar si hay auth del chatbot guardada
    const savedAuth = localStorage.getItem('chatbot_auth');

    if (savedAuth) {
      try {
        const auth = JSON.parse(savedAuth);
        this.currentChapa = auth.chapa;
        console.log('✅ Usuario ya autenticado (chatbot):', this.currentChapa);
        return true;
      } catch (error) {
        console.error('❌ Error al parsear chatbot_auth:', error);
        localStorage.removeItem('chatbot_auth');
      }
    }

    // PRIORIDAD 3: Si no hay ninguna auth, NO pedir credenciales automáticamente
    // El usuario debe venir desde el PWA, no acceder directamente al chatbot
    console.warn('⚠️ No hay usuario autenticado. Debes abrir el chatbot desde el PWA principal.');

    // NO mostrar prompt automáticamente - solo mensaje de error
    return false;
  }

  /**
   * Verifica las credenciales del usuario en Supabase
   */
  async verificarCredenciales(chapa, password) {
    try {
      if (!window.SheetsAPI || typeof window.SheetsAPI.getUsuarioPorChapa !== 'function') {
        console.warn('⚠️ SheetsAPI no disponible para verificación, permitiendo acceso');
        // En modo desarrollo, permitir acceso
        return true;
      }

      const usuario = await window.SheetsAPI.getUsuarioPorChapa(chapa);

      if (!usuario) {
        console.error('❌ Usuario no encontrado para chapa:', chapa);
        return false;
      }

      console.log('✅ Usuario encontrado en base de datos:', usuario.nombre || chapa);

      // Si viene de PWA (password null), no verificar contraseña
      if (password === null) {
        return true;
      }

      // Si se proporciona contraseña, verificar
      if (usuario.password && usuario.password === password) {
        return true;
      }

      // Si no hay campo password en Supabase, aceptar
      console.warn('⚠️ Sistema de contraseñas no implementado en BD, permitiendo acceso');
      return true;

    } catch (error) {
      console.error('❌ Error verificando credenciales:', error);
      // En caso de error, permitir acceso (modo desarrollo)
      return true;
    }
  }

  /**
   * Cambia la chapa del usuario (para testing)
   */
  async cambiarChapa(nuevaChapa, password) {
    if (!password) {
      console.error('❌ Se requiere contraseña para cambiar de chapa');
      return false;
    }

    const isValid = await this.verificarCredenciales(nuevaChapa.toString().trim(), password.trim());

    if (!isValid) {
      console.error('❌ Credenciales incorrectas');
      alert('❌ Chapa o contraseña incorrecta');
      return false;
    }

    this.currentChapa = nuevaChapa.toString().trim();
    localStorage.setItem('chatbot_auth', JSON.stringify({
      chapa: this.currentChapa,
      timestamp: Date.now()
    }));

    console.log('✅ Chapa cambiada a:', this.currentChapa);

    // Recargar la página para aplicar cambios
    location.reload();
  }

  /**
   * Cierra sesión
   */
  cerrarSesion() {
    localStorage.removeItem('chatbot_auth');
    console.log('✅ Sesión cerrada');
    location.reload();
  }

  /**
   * Obtiene la posición del usuario en el censo
   * COPIA EXACTA DEL DASHBOARD: usa los mismos métodos y valores
   */
  async getPosicionUsuario() {
    try {
      if (!this.currentChapa) {
        throw new Error('No hay usuario logueado');
      }

      // Verificar que SheetsAPI está disponible
      if (!window.SheetsAPI || typeof window.SheetsAPI.getPosicionChapa !== 'function') {
        throw new Error('SheetsAPI no está disponible');
      }

      console.log('📍 Obteniendo posición para chapa:', this.currentChapa);

      // Usar Promise.all igual que el dashboard (app.js línea 729-733)
      const [posicionesHasta, posicionesTrinca, censo] = await Promise.all([
        window.SheetsAPI.getPosicionesHastaContratacion(this.currentChapa),
        window.SheetsAPI.getPosicionesTrinca(this.currentChapa),
        window.SheetsAPI.getCenso()
      ]);

      const posicion = await window.SheetsAPI.getPosicionChapa(this.currentChapa);

      // Verificar si el usuario es trincador (igual que app.js línea 753)
      let esTrincador = false;
      if (censo && Array.isArray(censo)) {
        const usuarioCenso = censo.find(c => c.chapa === this.currentChapa);
        esTrincador = usuarioCenso && (usuarioCenso.trincador === true || usuarioCenso.trincador === 'true');
      }

      console.log('✅ Posición obtenida:', { posicion, posicionesHasta, posicionesTrinca, esTrincador });

      return {
        posicion: posicion,
        posicionesLaborable: posicionesHasta?.laborable || null,
        posicionesFestiva: posicionesHasta?.festiva || null,
        posicionesTrincaLaborable: esTrincador ? (posicionesTrinca?.laborable || null) : null,
        posicionesTrincaFestiva: esTrincador ? (posicionesTrinca?.festiva || null) : null,
        esTrincador: esTrincador
      };

    } catch (error) {
      console.error('❌ Error obteniendo posición:', error);
      return null;
    }
  }

  /**
   * Obtiene los jornales de la quincena actual
   */
  async getJornalesQuincena() {
    try {
      if (!this.currentChapa) {
        throw new Error('No hay usuario logueado');
      }

      // Verificar que SheetsAPI está disponible
      if (!window.SheetsAPI || typeof window.SheetsAPI.getJornales !== 'function') {
        throw new Error('SheetsAPI no está disponible');
      }

      // Calcular rango de fechas de la quincena actual
      const hoy = new Date();
      console.log('🕐 Fecha actual del sistema:', hoy.toISOString(), 'Año:', hoy.getFullYear());
      const dia = hoy.getDate();

      let fechaInicio, fechaFin;

      if (dia <= 15) {
        // Primera quincena
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        fechaFin = new Date(hoy.getFullYear(), hoy.getMonth(), 15);
      } else {
        // Segunda quincena
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 16);
        fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
      }

      // Formatear fechas a ISO
      const fechaInicioISO = this.formatDateToISO(fechaInicio);
      const fechaFinISO = this.formatDateToISO(fechaFin);

      console.log('📅 Obteniendo jornales:', { chapa: this.currentChapa, desde: fechaInicioISO, hasta: fechaFinISO });

      // Obtener jornales
      const jornales = await window.SheetsAPI.getJornales(
        this.currentChapa,
        fechaInicioISO,
        fechaFinISO,
        null
      );

      console.log('✅ Jornales obtenidos:', jornales.length);

      return {
        total: jornales.length,
        jornales: jornales,
        quincena: dia <= 15 ? 'Primera quincena' : 'Segunda quincena'
      };

    } catch (error) {
      console.error('❌ Error obteniendo jornales:', error);
      return null;
    }
  }

  /**
   * Obtiene el salario estimado de la quincena actual
   */
  async getSalarioQuincena() {
    try {
      if (!this.currentChapa) {
        throw new Error('No hay usuario logueado');
      }

      const jornalesData = await this.getJornalesQuincena();

      if (!jornalesData || jornalesData.total === 0) {
        return null;
      }

      // Estimación simple: 150€ brutos por jornal (promedio)
      // TODO: Usar el cálculo real del sueldómetro
      const estimacionBruto = jornalesData.total * 150;
      const estimacionNeto = Math.round(estimacionBruto * 0.85); // Descontar 15% aprox

      return {
        bruto: estimacionBruto,
        neto: estimacionNeto,
        jornales: jornalesData.total,
        quincena: jornalesData.quincena
      };

    } catch (error) {
      console.error('❌ Error obteniendo salario:', error);
      return null;
    }
  }

  /**
   * Obtiene la contratación de hoy
   */
  async getContratacionHoy() {
    try {
      if (!this.currentChapa) {
        throw new Error('No hay usuario logueado');
      }

      // Verificar que SheetsAPI está disponible
      if (!window.SheetsAPI || typeof window.SheetsAPI.getJornales !== 'function') {
        throw new Error('SheetsAPI no está disponible');
      }

      const hoy = this.formatDateToISO(new Date());

      console.log('🚢 Obteniendo contratación de hoy:', hoy);

      // Obtener jornales de hoy
      const jornales = await window.SheetsAPI.getJornales(
        this.currentChapa,
        hoy,
        hoy,
        null
      );

      console.log('✅ Jornales de hoy:', jornales?.length || 0);

      if (!jornales || jornales.length === 0) {
        return null;
      }

      // Devolver el primer jornal (más reciente)
      const jornal = jornales[0];

      return {
        empresa: jornal.empresa || 'No especificada',
        puesto: jornal.puesto || 'No especificado',
        jornada: jornal.jornada || 'No especificada',
        buque: jornal.buque || 'No especificado',
        parte: jornal.parte || '1'
      };

    } catch (error) {
      console.error('❌ Error obteniendo contratación:', error);
      return null;
    }
  }

  /**
   * Obtiene todos los jornales del año actual
   */
  async getJornalesAnuales() {
    try {
      if (!this.currentChapa) {
        throw new Error('No hay usuario logueado');
      }

      if (!window.SheetsAPI || typeof window.SheetsAPI.getJornales !== 'function') {
        throw new Error('SheetsAPI no está disponible');
      }

      const hoy = new Date();
      const añoActual = hoy.getFullYear();

      const fechaInicio = new Date(añoActual, 0, 1); // 1 de enero
      const fechaFin = hoy; // Hasta hoy

      const fechaInicioISO = this.formatDateToISO(fechaInicio);
      const fechaFinISO = this.formatDateToISO(fechaFin);

      console.log('📅 Obteniendo jornales anuales:', { chapa: this.currentChapa, desde: fechaInicioISO, hasta: fechaFinISO });

      const jornales = await window.SheetsAPI.getJornales(
        this.currentChapa,
        fechaInicioISO,
        fechaFinISO,
        null
      );

      console.log('✅ Jornales anuales obtenidos:', jornales.length);

      return jornales;

    } catch (error) {
      console.error('❌ Error obteniendo jornales anuales:', error);
      return null;
    }
  }

  /**
   * Obtiene los jornales del mes pasado
   */
  async getJornalesMesPasado() {
    try {
      if (!this.currentChapa) {
        throw new Error('No hay usuario logueado');
      }

      if (!window.SheetsAPI || typeof window.SheetsAPI.getJornales !== 'function') {
        throw new Error('SheetsAPI no está disponible');
      }

      const hoy = new Date();

      // Calcular primer y último día del mes pasado
      const primerDiaMesPasado = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
      const ultimoDiaMesPasado = new Date(hoy.getFullYear(), hoy.getMonth(), 0);

      const fechaInicioISO = this.formatDateToISO(primerDiaMesPasado);
      const fechaFinISO = this.formatDateToISO(ultimoDiaMesPasado);

      console.log('📅 Obteniendo jornales del mes pasado:', { chapa: this.currentChapa, desde: fechaInicioISO, hasta: fechaFinISO });

      const jornales = await window.SheetsAPI.getJornales(
        this.currentChapa,
        fechaInicioISO,
        fechaFinISO,
        null
      );

      console.log('✅ Jornales del mes pasado obtenidos:', jornales.length);

      const nombreMes = primerDiaMesPasado.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

      return {
        total: jornales.length,
        jornales: jornales,
        mes: nombreMes
      };

    } catch (error) {
      console.error('❌ Error obteniendo jornales del mes pasado:', error);
      return null;
    }
  }

  /**
   * Obtiene jornales en un rango de horas específico (ej: 20-02)
   */
  async getJornalesPorHorario(horarioInicio, horarioFin, periodo = 'quincena') {
    try {
      if (!this.currentChapa) {
        throw new Error('No hay usuario logueado');
      }

      let jornales;
      if (periodo === 'quincena') {
        const jornalesData = await this.getJornalesQuincena();
        jornales = jornalesData?.jornales || [];
      } else if (periodo === 'mes-pasado') {
        const jornalesData = await this.getJornalesMesPasado();
        jornales = jornalesData?.jornales || [];
      } else if (periodo === 'anual') {
        jornales = await this.getJornalesAnuales() || [];
      }

      if (!jornales || jornales.length === 0) {
        return { total: 0, jornales: [] };
      }

      // Filtrar por jornada que contenga el rango horario
      // Ejemplos: "20-02", "20 a 02", "20 02"
      const jornadaPatterns = [
        `${horarioInicio}-${horarioFin}`,
        `${horarioInicio} a ${horarioFin}`,
        `${horarioInicio} ${horarioFin}`
      ];

      const jornalesFiltrados = jornales.filter(jornal => {
        const jornada = jornal.jornada?.toLowerCase().replace(/\s+/g, '-');
        return jornadaPatterns.some(pattern =>
          jornada?.includes(pattern.toLowerCase().replace(/\s+/g, '-'))
        );
      });

      console.log(`✅ Jornales en horario ${horarioInicio}-${horarioFin}:`, jornalesFiltrados.length);

      return {
        total: jornalesFiltrados.length,
        jornales: jornalesFiltrados
      };

    } catch (error) {
      console.error('❌ Error obteniendo jornales por horario:', error);
      return null;
    }
  }

  /**
   * Obtiene el jornal con el salario más alto (de la quincena o mes pasado)
   */
  async getJornalMasAlto(periodo = 'quincena') {
    try {
      if (!this.currentChapa) {
        throw new Error('No hay usuario logueado');
      }

      // Obtener tabla salarial y mapeo de puestos
      const [mapeoPuestos, tablaSalarial] = await Promise.all([
        window.SheetsAPI.getMapeoPuestos(),
        window.SheetsAPI.getTablaSalarial()
      ]);

      // Obtener jornales del periodo
      let jornalesData;
      if (periodo === 'quincena') {
        jornalesData = await this.getJornalesQuincena();
      } else if (periodo === 'mes-pasado') {
        jornalesData = await this.getJornalesMesPasado();
      }

      if (!jornalesData || jornalesData.total === 0) {
        return null;
      }

      // Calcular salario de cada jornal
      let jornalMax = null;
      let salarioMax = 0;

      for (const jornal of jornalesData.jornales) {
        const puestoLower = jornal.puesto.trim().toLowerCase();
        const mapeo = mapeoPuestos.find(m => m.puesto.trim().toLowerCase() === puestoLower);

        if (!mapeo) continue;

        const grupoSalarial = mapeo.grupo_salarial;
        const jornada = jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, '');
        const tipoDia = this.determinarTipoDia(jornal.fecha, jornada);
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

        const total = salarioBase + prima;

        if (total > salarioMax) {
          salarioMax = total;
          jornalMax = { ...jornal, salarioCalculado: total };
        }
      }

      return jornalMax;

    } catch (error) {
      console.error('❌ Error obteniendo jornal más alto:', error);
      return null;
    }
  }

  /**
   * Obtiene la prima más alta (de la quincena o mes pasado)
   */
  async getPrimaMasAlta(periodo = 'quincena') {
    try {
      if (!this.currentChapa) {
        throw new Error('No hay usuario logueado');
      }

      // Obtener rango de fechas según periodo
      let fechaInicioISO, fechaFinISO;
      if (periodo === 'quincena') {
        const hoy = new Date();
        const dia = hoy.getDate();
        let fechaInicio, fechaFin;

        if (dia <= 15) {
          fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
          fechaFin = new Date(hoy.getFullYear(), hoy.getMonth(), 15);
        } else {
          fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 16);
          fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        }

        fechaInicioISO = this.formatDateToISO(fechaInicio);
        fechaFinISO = this.formatDateToISO(fechaFin);
      } else if (periodo === 'mes-pasado') {
        const hoy = new Date();
        const primerDiaMesPasado = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
        const ultimoDiaMesPasado = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
        fechaInicioISO = this.formatDateToISO(primerDiaMesPasado);
        fechaFinISO = this.formatDateToISO(ultimoDiaMesPasado);
      }

      // Obtener primas personalizadas
      const primasPersonalizadas = await window.SheetsAPI.getPrimasPersonalizadas(
        this.currentChapa,
        fechaInicioISO,
        fechaFinISO
      );

      if (!primasPersonalizadas || primasPersonalizadas.length === 0) {
        return null;
      }

      // Encontrar la prima más alta
      let primaMax = null;
      let valorMax = 0;

      for (const prima of primasPersonalizadas) {
        const valor = parseFloat(prima.prima_personalizada) || 0;
        if (valor > valorMax) {
          valorMax = valor;
          primaMax = prima;
        }
      }

      return primaMax;

    } catch (error) {
      console.error('❌ Error obteniendo prima más alta:', error);
      return null;
    }
  }

  /**
   * Obtiene las puertas del día
   */
  async getPuertas() {
    try {
      const puertasData = await window.SheetsAPI.getPuertas();

      if (!puertasData || !puertasData.puertas) {
        return null;
      }

      return puertasData.puertas.map(p => ({
        jornada: p.jornada,
        sp: p.puertaSP || '-',
        oc: p.puertaOC || '-'
      }));

    } catch (error) {
      console.error('❌ Error obteniendo puertas:', error);
      return null;
    }
  }

  /**
   * Obtiene las fechas de pago del calendario
   */
  async getProximoPago(anio, mes, quincena) {
    try {
      // Usar window.supabaseClient en lugar de window.supabase
      const { data, error} = await window.supabaseClient
        .from('calendario_pago')
        .select('*')
        .eq('anio', anio)
        .eq('mes', mes)
        .eq('quincena', quincena)
        .single();

      if (error) {
        console.error('❌ Error obteniendo calendario de pago:', error);
        return null;
      }

      return data;

    } catch (error) {
      console.error('❌ Error obteniendo calendario de pago:', error);
      return null;
    }
  }

  /**
   * Obtiene el nombre del usuario
   */
  async getNombreUsuario() {
    try {
      if (!this.currentChapa) {
        return 'trabajador';
      }

      const nombre = await window.SheetsAPI.getNombrePorChapa(this.currentChapa);
      return nombre || `Chapa ${this.currentChapa}`;

    } catch (error) {
      console.error('❌ Error obteniendo nombre:', error);
      return 'trabajador';
    }
  }

  /**
   * Calcula el sueldo estimado de la quincena actual
   */
  async calcularSueldoQuincena() {
    try {
      if (!this.currentChapa) {
        return null;
      }

      // Obtener jornales de la quincena
      const jornalesData = await this.getJornalesQuincena();
      if (!jornalesData || jornalesData.total === 0) {
        return {
          jornales: 0,
          salarioBruto: 0,
          irpf: 0,
          salarioNeto: 0,
          mensaje: 'No hay jornales en esta quincena'
        };
      }

      // Obtener datos necesarios para el cálculo
      const [mapeoPuestos, tablaSalarial] = await Promise.all([
        window.SheetsAPI.getMapeoPuestos(),
        window.SheetsAPI.getTablaSalarial()
      ]);

      console.log('🗂️ Tabla salarial cargada:', tablaSalarial.length, 'filas');
      console.log('🔑 Ejemplo de clave_jornada:', tablaSalarial[0]?.clave_jornada);

      // Obtener IRPF del usuario
      let irpfPorcentaje = 15; // Default
      try {
        const configUsuario = await window.SheetsAPI.getUserConfig(this.currentChapa);
        if (configUsuario && configUsuario.irpf) {
          irpfPorcentaje = configUsuario.irpf;
        }
      } catch (error) {
        console.warn('⚠️ Error cargando IRPF, usando 15%');
      }

      // Calcular salario para cada jornal
      let salarioBrutoTotal = 0;
      let detalleJornales = [];

      for (const jornal of jornalesData.jornales) {
        console.log('📊 Procesando jornal:', jornal);

        const puestoLower = jornal.puesto.trim().toLowerCase();
        const mapeo = mapeoPuestos.find(m => m.puesto.trim().toLowerCase() === puestoLower);

        if (!mapeo) {
          console.warn('⚠️ No se encontró mapeo para puesto:', jornal.puesto);
          continue;
        }

        console.log('✅ Mapeo encontrado:', mapeo);

        const grupoSalarial = mapeo.grupo_salarial;

        // Normalizar jornada: '14 a 20' -> '14-20'
        const jornada = jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, '');

        // Determinar tipo de día (LABORABLE, SABADO, FEST-FEST)
        const tipoDia = this.determinarTipoDia(jornal.fecha, jornada);

        // Crear clave de jornada (ej: "14-20_LABORABLE")
        const claveJornada = `${jornada}_${tipoDia}`;

        console.log('🔑 Clave de jornada:', claveJornada);

        // Buscar en tabla salarial
        const salarioRow = tablaSalarial.find(s => s.clave_jornada === claveJornada);

        if (!salarioRow) {
          console.warn('⚠️ No se encontró salario para clave:', claveJornada);
          continue;
        }

        console.log('✅ Fila de salario encontrada:', salarioRow);

        // Obtener salario base según grupo
        let salarioBase = 0;
        if (grupoSalarial === 'Grupo 1') {
          salarioBase = parseFloat(salarioRow.jornal_base_g1) || 0;
        } else if (grupoSalarial === 'Grupo 2') {
          salarioBase = parseFloat(salarioRow.jornal_base_g2) || 0;
        }

        // Añadir complemento de 46,94€ para Trincador y Trincador de Coches
        if (puestoLower === 'trincador' || puestoLower === 'trincador de coches') {
          salarioBase += 46.94;
        }

        // Calcular prima (por defecto 120 movimientos para Contenedor)
        let prima = 0;
        if (mapeo.tipo_operativa === 'Coches') {
          prima = parseFloat(salarioRow.prima_minima_coches) || 0;
        } else if (mapeo.tipo_operativa === 'Contenedor') {
          // 120 movimientos por defecto con coef_prima_mayor120
          prima = 120 * (parseFloat(salarioRow.coef_prima_mayor120) || 0);
        }

        const total = salarioBase + prima;
        salarioBrutoTotal += total;

        console.log('💰 Cálculo:', { salarioBase, prima, total });

        detalleJornales.push({
          fecha: jornal.fecha,
          puesto: jornal.puesto,
          jornada: jornal.jornada,
          salarioBase,
          prima,
          total
        });
      }

      console.log('💵 Salario bruto total:', salarioBrutoTotal);

      const irpfImporte = (salarioBrutoTotal * irpfPorcentaje) / 100;
      const salarioNeto = salarioBrutoTotal - irpfImporte;

      return {
        jornales: jornalesData.total,
        quincena: jornalesData.quincena,
        salarioBruto: salarioBrutoTotal.toFixed(2),
        irpf: irpfImporte.toFixed(2),
        irpfPorcentaje,
        salarioNeto: salarioNeto.toFixed(2),
        detalleJornales
      };

    } catch (error) {
      console.error('❌ Error calculando sueldo:', error);
      return null;
    }
  }

  /**
   * Calcula el sueldo total del año
   */
  async calcularSueldoAnual() {
    try {
      if (!this.currentChapa) {
        return null;
      }

      // Obtener todos los jornales del año
      const jornales = await this.getJornalesAnuales();
      if (!jornales || jornales.length === 0) {
        return {
          jornales: 0,
          salarioBruto: 0,
          irpf: 0,
          salarioNeto: 0,
          mensaje: 'No hay jornales este año'
        };
      }

      // Obtener datos necesarios para el cálculo
      const [mapeoPuestos, tablaSalarial] = await Promise.all([
        window.SheetsAPI.getMapeoPuestos(),
        window.SheetsAPI.getTablaSalarial()
      ]);

      // Obtener IRPF del usuario
      let irpfPorcentaje = 15; // Default
      try {
        const configUsuario = await window.SheetsAPI.getUserConfig(this.currentChapa);
        if (configUsuario && configUsuario.irpf) {
          irpfPorcentaje = configUsuario.irpf;
        }
      } catch (error) {
        console.warn('⚠️ Error cargando IRPF, usando 15%');
      }

      // Calcular salario para cada jornal
      let salarioBrutoTotal = 0;

      for (const jornal of jornales) {
        const puestoLower = jornal.puesto.trim().toLowerCase();
        const mapeo = mapeoPuestos.find(m => m.puesto.trim().toLowerCase() === puestoLower);

        if (!mapeo) continue;

        const grupoSalarial = mapeo.grupo_salarial;

        // Normalizar jornada: '14 a 20' -> '14-20'
        const jornada = jornal.jornada.replace(/\s+a\s+/g, '-').replace(/\s+/g, '');

        // Determinar tipo de día (LABORABLE, SABADO, FESTIVO, etc.)
        const tipoDia = this.determinarTipoDia(jornal.fecha, jornada);

        // Crear clave de jornada (ej: "14-20_LABORABLE")
        const claveJornada = `${jornada}_${tipoDia}`;

        // Buscar en tabla salarial
        const salarioRow = tablaSalarial.find(s => s.clave_jornada === claveJornada);

        if (!salarioRow) continue;

        // Obtener salario base según grupo
        let salarioBase = 0;
        if (grupoSalarial === 'Grupo 1') {
          salarioBase = parseFloat(salarioRow.jornal_base_g1) || 0;
        } else if (grupoSalarial === 'Grupo 2') {
          salarioBase = parseFloat(salarioRow.jornal_base_g2) || 0;
        }

        // Añadir complemento de 46,94€ para Trincador y Trincador de Coches
        if (puestoLower === 'trincador' || puestoLower === 'trincador de coches') {
          salarioBase += 46.94;
        }

        // Calcular prima (por defecto 120 movimientos para Contenedor)
        let prima = 0;
        if (mapeo.tipo_operativa === 'Coches') {
          prima = parseFloat(salarioRow.prima_minima_coches) || 0;
        } else if (mapeo.tipo_operativa === 'Contenedor') {
          // 120 movimientos por defecto con coef_prima_mayor120
          prima = 120 * (parseFloat(salarioRow.coef_prima_mayor120) || 0);
        }

        const total = salarioBase + prima;
        salarioBrutoTotal += total;
      }

      const irpfImporte = (salarioBrutoTotal * irpfPorcentaje) / 100;
      const salarioNeto = salarioBrutoTotal - irpfImporte;

      return {
        jornales: jornales.length,
        salarioBruto: salarioBrutoTotal.toFixed(2),
        irpf: irpfImporte.toFixed(2),
        irpfPorcentaje,
        salarioNeto: salarioNeto.toFixed(2)
      };

    } catch (error) {
      console.error('❌ Error calculando sueldo anual:', error);
      return null;
    }
  }

  /**
   * Utilidades
   */
  formatDateToISO(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDateToSpanish(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Determina el tipo de día para cálculo salarial
   */
  determinarTipoDia(fecha, jornada) {
    // Parsear fecha: soportar tanto dd/mm/yyyy como yyyy-mm-dd (ISO)
    let day, month, year;

    if (fecha.includes('/')) {
      // Formato español: dd/mm/yyyy
      const parts = fecha.split('/');
      day = parseInt(parts[0]);
      month = parseInt(parts[1]) - 1;
      year = parseInt(parts[2]);
    } else if (fecha.includes('-')) {
      // Formato ISO: yyyy-mm-dd
      const parts = fecha.split('-');
      year = parseInt(parts[0]);
      month = parseInt(parts[1]) - 1;
      day = parseInt(parts[2]);
    } else {
      // Formato desconocido
      const date = new Date(fecha);
      if (!isNaN(date.getTime())) {
        year = date.getFullYear();
        month = date.getMonth();
        day = date.getDate();
      } else {
        console.error('Formato de fecha no válido:', fecha);
        return 'LABORABLE';
      }
    }

    const dateObj = new Date(year, month, day);

    // Festivos de España 2025
    const festivos2025 = [
      '01/01/2025', '06/01/2025',
      '18/04/2025', '19/04/2025',
      '01/05/2025',
      '15/08/2025',
      '12/10/2025',
      '01/11/2025',
      '06/12/2025', '08/12/2025',
      '25/12/2025'
    ];

    const esFestivoFecha = (d) => {
      const fechaNorm = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      return festivos2025.includes(fechaNorm) || d.getDay() === 0;
    };

    const dayOfWeek = dateObj.getDay();
    const esFestivoHoy = esFestivoFecha(dateObj);

    // Para jornadas nocturnas (02-08, 20-02)
    if (jornada === '02-08' || jornada === '20-02') {
      const diaSiguiente = new Date(dateObj);
      diaSiguiente.setDate(diaSiguiente.getDate() + 1);
      const esFestivoManana = esFestivoFecha(diaSiguiente);

      const diaAnterior = new Date(dateObj);
      diaAnterior.setDate(diaAnterior.getDate() - 1);
      const esFestivoAyer = esFestivoFecha(diaAnterior);

      if (jornada === '02-08') {
        if (dayOfWeek === 6) {
          return 'LABORABLE';
        } else if (esFestivoAyer && esFestivoHoy) {
          return 'FEST-FEST';
        } else if (dayOfWeek === 0) {
          return 'FESTIVO';
        } else if (esFestivoHoy && !esFestivoManana) {
          return 'FEST-LAB';
        } else if (esFestivoManana) {
          return 'FESTIVO';
        } else if (esFestivoAyer && !esFestivoHoy) {
          return 'FEST-LAB';
        } else {
          return 'LABORABLE';
        }
      } else if (jornada === '20-02') {
        if (dayOfWeek === 6) {
          return 'SABADO';
        } else if (!esFestivoHoy && esFestivoManana) {
          return 'LAB-FEST';
        } else if (esFestivoHoy) {
          return 'FESTIVO';
        } else {
          return 'LABORABLE';
        }
      }
    }

    // Para jornadas diurnas (08-14, 14-20)
    if (esFestivoHoy) {
      return 'FESTIVO';
    } else if (dayOfWeek === 6) {
      return 'SABADO';
    } else {
      return 'LABORABLE';
    }
  }

  /**
   * Obtiene la empresa donde más ha trabajado en un periodo
   */
  async getEmpresaMasTrabajada(periodo = 'quincena') {
    try {
      if (!this.currentChapa) return null;

      let jornalesData;
      if (periodo === 'mes-pasado') {
        jornalesData = await this.getJornalesMesPasado();
      } else if (periodo === 'anual') {
        jornalesData = await this.getJornalesAnuales();
      } else {
        jornalesData = await this.getJornalesQuincena();
      }

      if (!jornalesData || !jornalesData.jornales || jornalesData.total === 0) {
        return null;
      }

      // Contar jornales por empresa
      const empresasCount = {};
      for (const jornal of jornalesData.jornales) {
        const empresa = jornal.empresa || 'Sin especificar';
        empresasCount[empresa] = (empresasCount[empresa] || 0) + 1;
      }

      // Encontrar la empresa con más jornales
      let empresaMasTrabajada = null;
      let maxJornales = 0;
      for (const [empresa, count] of Object.entries(empresasCount)) {
        if (count > maxJornales) {
          maxJornales = count;
          empresaMasTrabajada = empresa;
        }
      }

      return {
        empresa: empresaMasTrabajada,
        jornales: maxJornales,
        totalJornales: jornalesData.total,
        porcentaje: ((maxJornales / jornalesData.total) * 100).toFixed(1)
      };

    } catch (error) {
      console.error('Error en getEmpresaMasTrabajada:', error);
      return null;
    }
  }

  /**
   * Obtiene la jornada donde más ha trabajado en un periodo
   */
  async getJornadaMasTrabajada(periodo = 'quincena') {
    try {
      if (!this.currentChapa) return null;

      let jornalesData;
      if (periodo === 'mes-pasado') {
        jornalesData = await this.getJornalesMesPasado();
      } else if (periodo === 'anual') {
        jornalesData = await this.getJornalesAnuales();
      } else {
        jornalesData = await this.getJornalesQuincena();
      }

      if (!jornalesData || !jornalesData.jornales || jornalesData.total === 0) {
        return null;
      }

      // Contar jornales por jornada
      const jornadasCount = {};
      for (const jornal of jornalesData.jornales) {
        const jornada = jornal.jornada || 'Sin especificar';
        jornadasCount[jornada] = (jornadasCount[jornada] || 0) + 1;
      }

      // Encontrar la jornada con más jornales
      let jornadaMasTrabajada = null;
      let maxJornales = 0;
      for (const [jornada, count] of Object.entries(jornadasCount)) {
        if (count > maxJornales) {
          maxJornales = count;
          jornadaMasTrabajada = jornada;
        }
      }

      return {
        jornada: jornadaMasTrabajada,
        jornales: maxJornales,
        totalJornales: jornalesData.total,
        porcentaje: ((maxJornales / jornalesData.total) * 100).toFixed(1)
      };

    } catch (error) {
      console.error('Error en getJornadaMasTrabajada:', error);
      return null;
    }
  }

  /**
   * Obtiene el día con mayor prima en un periodo
   */
  async getDiaMayorPrima(periodo = 'quincena') {
    try {
      if (!this.currentChapa) return null;

      // Reutilizar la función getPrimaMasAlta que ya existe
      return await this.getPrimaMasAlta(periodo);

    } catch (error) {
      console.error('Error en getDiaMayorPrima:', error);
      return null;
    }
  }

  /**
   * Calcula la probabilidad de trabajar para cada jornada
   * Simula la lógica del Oráculo
   */
  async calcularProbabilidadTrabajar() {
    try {
      if (!this.currentChapa) return null;

      const posicion = await this.getPosicionUsuario();
      const puertas = await this.getPuertas();

      if (!posicion || !puertas || puertas.length === 0) {
        return null;
      }

      const resultados = [];

      for (const puerta of puertas) {
        // Calcular ratio (posición / puerta)
        const puertaSP = parseInt(puerta.sp) || 0;
        const puertaOC = parseInt(puerta.oc) || 0;
        const puertaTotal = Math.max(puertaSP, puertaOC, 1);
        const posicionNum = parseInt(posicion.posicion) || 0;

        const ratio = posicionNum / puertaTotal;

        // Calcular probabilidad basada en ratio
        let probabilidad, mensaje, detalle;

        if (ratio <= 0.5) {
          probabilidad = 95;
          mensaje = 'Seguro que curras';
          detalle = 'Muy por debajo de la puerta';
        } else if (ratio <= 0.7) {
          probabilidad = 85;
          mensaje = 'Casi seguro';
          detalle = 'Buena posición, tranquilo';
        } else if (ratio <= 0.9) {
          probabilidad = 65;
          mensaje = 'Vas bien, ojo';
          detalle = 'Cerca del corte, cruza los dedos';
        } else if (ratio <= 1.0) {
          probabilidad = 45;
          mensaje = 'Por los pelos...';
          detalle = 'Justo en el filo';
        } else if (ratio <= 1.15) {
          probabilidad = 25;
          mensaje = 'Lo veo difícil';
          detalle = 'Fuera del corte, necesitas suerte';
        } else if (ratio <= 1.5) {
          probabilidad = 10;
          mensaje = 'Hoy no toca';
          detalle = 'Muy lejos, mejor descansa';
        } else {
          probabilidad = 5;
          mensaje = 'Quédate en casita';
          detalle = 'Demasiado lejos del corte';
        }

        resultados.push({
          jornada: puerta.jornada,
          puertaSP: puertaSP,
          puertaOC: puertaOC,
          probabilidad: probabilidad,
          mensaje: mensaje,
          detalle: detalle
        });
      }

      return {
        posicion: posicion.posicion,
        posicionesLaborable: posicion.posicionesLaborable,
        posicionesFestiva: posicion.posicionesFestiva,
        jornadas: resultados
      };

    } catch (error) {
      console.error('Error en calcularProbabilidadTrabajar:', error);
      return null;
    }
  }
}

// Exportar
window.PWADataBridge = PWADataBridge;
