# Ejemplo Completo: Implementación del Tablón de Contratación

Este documento contiene todo el código necesario para implementar el Tablón de Contratación Visual.

---

## 📂 Estructura de Archivos a Crear/Modificar

```
pwa-dual-buttons/
├── index.html                    (modificar)
├── pages/
│   └── tablon.html              (crear nuevo)
└── scripts/
    └── tablon.js                (crear nuevo)
```

---

## 1. Modificar `index.html`

### Añadir botón en la navegación (después de línea 106):

```html
<!-- Después del botón "Censo" -->
<button class="nav-link" data-page="tablon">
  <svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
  Tablón de Contratación
</button>
```

---

## 2. Crear `pages/tablon.html`

```html
<!-- Tablón de Contratación -->
<div id="tablon-page" class="page" style="display: none;">
  <div class="page-header">
    <h2>📋 Tablón de Contratación</h2>
    <p class="subtitle">Última jornada con contratación</p>
  </div>

  <!-- Fecha de última jornada -->
  <div class="card mb-4">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-gray-500">Fecha de última contratación</p>
        <p id="tablon-fecha" class="text-lg font-semibold">-</p>
      </div>
      <button id="tablon-refresh-btn" class="btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Actualizar
      </button>
    </div>
  </div>

  <!-- Estadísticas rápidas -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <div class="card">
      <p class="text-sm text-gray-500">Total Chapas</p>
      <p id="tablon-total-chapas" class="text-2xl font-bold text-blue-600">-</p>
    </div>
    <div class="card">
      <p class="text-sm text-gray-500">Empresas</p>
      <p id="tablon-total-empresas" class="text-2xl font-bold text-green-600">-</p>
    </div>
    <div class="card">
      <p class="text-sm text-gray-500">Barcos</p>
      <p id="tablon-total-barcos" class="text-2xl font-bold text-purple-600">-</p>
    </div>
    <div class="card">
      <p class="text-sm text-gray-500">Partes</p>
      <p id="tablon-total-partes" class="text-2xl font-bold text-orange-600">-</p>
    </div>
  </div>

  <!-- Filtros -->
  <div class="card mb-4">
    <div class="flex flex-wrap gap-2">
      <input
        type="text"
        id="tablon-search"
        placeholder="Buscar por chapa, empresa, barco..."
        class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <select id="tablon-filter-turno" class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
        <option value="">Todas las jornadas</option>
        <option value="02 a 08">02 a 08</option>
        <option value="08 a 14">08 a 14</option>
        <option value="14 a 20">14 a 20</option>
        <option value="20 a 02">20 a 02</option>
      </select>
    </div>
  </div>

  <!-- Loading -->
  <div id="tablon-loading" class="text-center py-8">
    <div class="spinner"></div>
    <p class="mt-4 text-gray-500">Cargando tablón de contratación...</p>
  </div>

  <!-- Error -->
  <div id="tablon-error" class="alert alert-error" style="display: none;">
    <p>Error al cargar el tablón de contratación. Por favor, intenta de nuevo.</p>
  </div>

  <!-- Contenido del tablón (se genera dinámicamente) -->
  <div id="tablon-content" class="space-y-4"></div>
</div>

<!-- Estilos específicos del tablón -->
<style>
  .tablon-empresa {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    margin-bottom: 1rem;
  }

  .tablon-empresa-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1rem 1.5rem;
    font-weight: 600;
    font-size: 1.125rem;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s ease;
  }

  .tablon-empresa-header.con-logo {
    background: white;
    color: #1e293b;
    border-bottom: 3px solid #e2e8f0;
  }

  .tablon-empresa-header:hover {
    background: linear-gradient(135deg, #5a67d8 0%, #6b46a0 100%);
  }

  .tablon-empresa-header.con-logo:hover {
    background: #f8fafc;
  }

  .tablon-empresa-logo {
    max-height: 60px;
    max-width: 200px;
    object-fit: contain;
    margin-right: 1rem;
  }

  .tablon-empresa-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .tablon-empresa-body {
    padding: 0;
  }

  .tablon-barco {
    border-left: 4px solid #3b82f6;
    background: #f8fafc;
    margin: 0.5rem 1rem;
    border-radius: 8px;
    overflow: hidden;
  }

  .tablon-barco-header {
    background: #e0f2fe;
    padding: 0.75rem 1rem;
    font-weight: 600;
    color: #0c4a6e;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .tablon-barco-header:hover {
    background: #bae6fd;
  }

  .tablon-parte {
    padding: 0.5rem 1rem;
    border-left: 3px solid #10b981;
    margin: 0.5rem 1rem 0.5rem 2rem;
    background: white;
    border-radius: 6px;
  }

  .tablon-parte-header {
    font-weight: 600;
    color: #047857;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
  }

  .tablon-chapa {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    margin: 0.25rem 0;
    background: #f9fafb;
    border-radius: 6px;
    transition: all 0.2s ease;
  }

  .tablon-chapa:hover {
    background: #f3f4f6;
    transform: translateX(4px);
  }

  .tablon-chapa-numero {
    font-weight: 700;
    color: #1e40af;
    font-size: 1rem;
    min-width: 60px;
  }

  .tablon-chapa-info {
    flex: 1;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .badge-especialidad {
    background: #dbeafe;
    color: #1e40af;
  }

  .badge-turno {
    background: #fef3c7;
    color: #92400e;
  }

  .chevron {
    transition: transform 0.3s ease;
  }

  .chevron.rotate {
    transform: rotate(180deg);
  }

  .collapse {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
  }

  .collapse.show {
    max-height: 10000px;
  }
</style>
```

---

## 3. Crear `scripts/tablon.js`

```javascript
/**
 * Tablón de Contratación
 * Muestra la última jornada con contratación agrupada por empresas > barcos > partes
 */

class TablonContratacion {
  constructor() {
    this.ultimaFecha = null;
    this.datos = [];
    this.datosAgrupados = {};
    this.filtros = {
      busqueda: '',
      turno: ''
    };

    // Mapeo de logos de empresas (tomado de app.js)
    this.empresaLogos = {
      'APM': 'https://i.imgur.com/HgQ95qc.jpeg',
      'CSP': 'https://i.imgur.com/8Tjx3KP.jpeg',
      'VTEU': 'https://i.imgur.com/3nNCkw5.jpeg',
      'MSC': 'https://i.imgur.com/kX4Ujxf.jpeg',
      'ERH': 'https://i.imgur.com/OHDp62K.png'
    };
  }

  /**
   * Obtiene el logo de una empresa
   */
  getEmpresaLogo(empresa) {
    if (!empresa) return null;
    const empresaUpper = empresa.toString().toUpperCase().trim();
    return this.empresaLogos[empresaUpper] || null;
  }

  /**
   * Inicializa el tablón
   */
  async init() {
    console.log('📋 Inicializando Tablón de Contratación...');

    // Referencias DOM
    this.elements = {
      loading: document.getElementById('tablon-loading'),
      error: document.getElementById('tablon-error'),
      content: document.getElementById('tablon-content'),
      fecha: document.getElementById('tablon-fecha'),
      totalChapas: document.getElementById('tablon-total-chapas'),
      totalEmpresas: document.getElementById('tablon-total-empresas'),
      totalBarcos: document.getElementById('tablon-total-barcos'),
      totalPartes: document.getElementById('tablon-total-partes'),
      searchInput: document.getElementById('tablon-search'),
      filterTurno: document.getElementById('tablon-filter-turno'),
      refreshBtn: document.getElementById('tablon-refresh-btn')
    };

    // Event listeners
    this.setupEventListeners();

    // Cargar datos
    await this.cargarDatos();
  }

  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    // Búsqueda
    this.elements.searchInput.addEventListener('input', (e) => {
      this.filtros.busqueda = e.target.value.toLowerCase();
      this.renderTablon();
    });

    // Filtro de turno
    this.elements.filterTurno.addEventListener('change', (e) => {
      this.filtros.turno = e.target.value;
      this.renderTablon();
    });

    // Botón refresh
    this.elements.refreshBtn.addEventListener('click', () => {
      this.cargarDatos();
    });
  }

  /**
   * Carga los datos de la última jornada
   */
  async cargarDatos() {
    try {
      this.showLoading(true);
      this.elements.error.style.display = 'none';

      // 1. Obtener la última fecha con contratación
      const { data: fechaData, error: fechaError } = await window.supabase
        .from('jornales')
        .select('fecha')
        .not('empresa', 'is', null)
        .order('fecha', { ascending: false })
        .limit(1)
        .single();

      if (fechaError) {
        throw new Error('No se pudo obtener la última fecha');
      }

      this.ultimaFecha = fechaData.fecha;

      // 2. Obtener todas las contrataciones de esa fecha
      const { data: jornalesData, error: jornalesError } = await window.supabase
        .from('jornales')
        .select('*')
        .eq('fecha', this.ultimaFecha)
        .not('empresa', 'is', null)
        .order('empresa')
        .order('buque')
        .order('parte')
        .order('chapa');

      if (jornalesError) {
        throw new Error('No se pudieron obtener los jornales');
      }

      this.datos = jornalesData;

      // 3. Agrupar datos
      this.agruparDatos();

      // 4. Actualizar estadísticas
      this.actualizarEstadisticas();

      // 5. Renderizar tablón
      this.renderTablon();

      this.showLoading(false);

    } catch (error) {
      console.error('❌ Error cargando tablón:', error);
      this.showLoading(false);
      this.elements.error.style.display = 'block';
    }
  }

  /**
   * Agrupa los datos por empresa > barco > parte
   */
  agruparDatos() {
    this.datosAgrupados = {};

    this.datos.forEach(jornal => {
      const empresa = jornal.empresa || 'Sin empresa';
      const buque = jornal.buque || 'Sin buque';
      const parte = jornal.parte || 'Sin parte';

      // Inicializar estructura
      if (!this.datosAgrupados[empresa]) {
        this.datosAgrupados[empresa] = {};
      }
      if (!this.datosAgrupados[empresa][buque]) {
        this.datosAgrupados[empresa][buque] = {};
      }
      if (!this.datosAgrupados[empresa][buque][parte]) {
        this.datosAgrupados[empresa][buque][parte] = [];
      }

      // Añadir chapa
      this.datosAgrupados[empresa][buque][parte].push(jornal);
    });
  }

  /**
   * Actualiza las estadísticas
   */
  actualizarEstadisticas() {
    // Fecha
    const fecha = new Date(this.ultimaFecha);
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    this.elements.fecha.textContent = fecha.toLocaleDateString('es-ES', opciones);

    // Total chapas
    this.elements.totalChapas.textContent = this.datos.length;

    // Total empresas
    const empresas = new Set(this.datos.map(j => j.empresa));
    this.elements.totalEmpresas.textContent = empresas.size;

    // Total barcos
    const barcos = new Set(this.datos.map(j => `${j.empresa}-${j.buque}`));
    this.elements.totalBarcos.textContent = barcos.size;

    // Total partes
    this.elements.totalPartes.textContent = this.datos.filter((j, i, arr) =>
      arr.findIndex(x => x.empresa === j.empresa && x.buque === j.buque && x.parte === j.parte) === i
    ).length;
  }

  /**
   * Renderiza el tablón
   */
  renderTablon() {
    this.elements.content.innerHTML = '';

    // Aplicar filtros
    let datosFiltrados = { ...this.datosAgrupados };

    // Filtro de búsqueda y turno
    if (this.filtros.busqueda || this.filtros.turno) {
      datosFiltrados = this.aplicarFiltros(this.datosAgrupados);
    }

    // Si no hay datos
    if (Object.keys(datosFiltrados).length === 0) {
      this.elements.content.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p>No se encontraron contrataciones con los filtros aplicados</p>
        </div>
      `;
      return;
    }

    // Renderizar cada empresa
    Object.entries(datosFiltrados).forEach(([empresa, barcos]) => {
      const empresaEl = this.crearEmpresaElement(empresa, barcos);
      this.elements.content.appendChild(empresaEl);
    });
  }

  /**
   * Aplica los filtros a los datos
   */
  aplicarFiltros(datos) {
    const resultado = {};

    Object.entries(datos).forEach(([empresa, barcos]) => {
      Object.entries(barcos).forEach(([buque, partes]) => {
        Object.entries(partes).forEach(([parte, chapas]) => {
          const chapasFiltradas = chapas.filter(chapa => {
            // Filtro de búsqueda
            if (this.filtros.busqueda) {
              const busqueda = this.filtros.busqueda;
              const coincide =
                chapa.chapa.toString().includes(busqueda) ||
                empresa.toLowerCase().includes(busqueda) ||
                buque.toLowerCase().includes(busqueda) ||
                (chapa.puesto && chapa.puesto.toLowerCase().includes(busqueda));

              if (!coincide) return false;
            }

            // Filtro de jornada
            if (this.filtros.turno && chapa.jornada !== this.filtros.turno) {
              return false;
            }

            return true;
          });

          if (chapasFiltradas.length > 0) {
            if (!resultado[empresa]) resultado[empresa] = {};
            if (!resultado[empresa][buque]) resultado[empresa][buque] = {};
            resultado[empresa][buque][parte] = chapasFiltradas;
          }
        });
      });
    });

    return resultado;
  }

  /**
   * Crea el elemento HTML de una empresa
   */
  crearEmpresaElement(empresa, barcos) {
    const empresaDiv = document.createElement('div');
    empresaDiv.className = 'tablon-empresa';

    const logo = this.getEmpresaLogo(empresa);

    // Header de empresa
    const empresaHeader = document.createElement('div');
    empresaHeader.className = logo ? 'tablon-empresa-header con-logo' : 'tablon-empresa-header';

    if (logo) {
      empresaHeader.innerHTML = `
        <div class="tablon-empresa-info">
          <img src="${logo}" alt="${empresa}" class="tablon-empresa-logo">
          <span>${empresa}</span>
        </div>
        <svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      `;
    } else {
      empresaHeader.innerHTML = `
        <span>${empresa}</span>
        <svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      `;
    }

    // Body de empresa
    const empresaBody = document.createElement('div');
    empresaBody.className = 'tablon-empresa-body collapse';

    // Añadir barcos
    Object.entries(barcos).forEach(([buque, partes]) => {
      const barcoEl = this.crearBarcoElement(buque, partes);
      empresaBody.appendChild(barcoEl);
    });

    // Toggle empresa
    empresaHeader.addEventListener('click', () => {
      empresaBody.classList.toggle('show');
      empresaHeader.querySelector('.chevron').classList.toggle('rotate');
    });

    empresaDiv.appendChild(empresaHeader);
    empresaDiv.appendChild(empresaBody);

    return empresaDiv;
  }

  /**
   * Crea el elemento HTML de un barco
   */
  crearBarcoElement(buque, partes) {
    const barcoDiv = document.createElement('div');
    barcoDiv.className = 'tablon-barco';

    // Header de barco
    const barcoHeader = document.createElement('div');
    barcoHeader.className = 'tablon-barco-header';
    barcoHeader.innerHTML = `
      <span>🚢 ${buque}</span>
      <svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    `;

    // Body de barco
    const barcoBody = document.createElement('div');
    barcoBody.className = 'collapse';

    // Añadir partes
    Object.entries(partes).forEach(([parte, chapas]) => {
      const parteEl = this.crearParteElement(parte, chapas);
      barcoBody.appendChild(parteEl);
    });

    // Toggle barco
    barcoHeader.addEventListener('click', (e) => {
      e.stopPropagation();
      barcoBody.classList.toggle('show');
      barcoHeader.querySelector('.chevron').classList.toggle('rotate');
    });

    barcoDiv.appendChild(barcoHeader);
    barcoDiv.appendChild(barcoBody);

    return barcoDiv;
  }

  /**
   * Crea el elemento HTML de una parte
   */
  crearParteElement(parte, chapas) {
    const parteDiv = document.createElement('div');
    parteDiv.className = 'tablon-parte';

    // Header de parte
    const parteHeader = document.createElement('div');
    parteHeader.className = 'tablon-parte-header';
    parteHeader.textContent = `Parte ${parte} (${chapas.length} chapas)`;

    parteDiv.appendChild(parteHeader);

    // Añadir chapas
    chapas.forEach(chapa => {
      const chapaEl = this.crearChapaElement(chapa);
      parteDiv.appendChild(chapaEl);
    });

    return parteDiv;
  }

  /**
   * Crea el elemento HTML de una chapa
   */
  crearChapaElement(chapa) {
    const chapaDiv = document.createElement('div');
    chapaDiv.className = 'tablon-chapa';

    chapaDiv.innerHTML = `
      <span class="tablon-chapa-numero">${chapa.chapa}</span>
      <div class="tablon-chapa-info">
        <span class="badge badge-especialidad">${chapa.puesto || 'Sin puesto'}</span>
        <span class="badge badge-turno">🕐 ${chapa.jornada || 'Sin jornada'}</span>
      </div>
    `;

    return chapaDiv;
  }

  /**
   * Muestra/oculta el loading
   */
  showLoading(show) {
    this.elements.loading.style.display = show ? 'block' : 'none';
    this.elements.content.style.display = show ? 'none' : 'block';
  }
}

// Inicializar cuando se carga la página
let tablonInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  // Detectar cuando se navega a la página del tablón
  const observer = new MutationObserver(() => {
    const tablonPage = document.getElementById('tablon-page');
    if (tablonPage && tablonPage.style.display !== 'none') {
      if (!tablonInstance) {
        tablonInstance = new TablonContratacion();
        tablonInstance.init();
      }
    }
  });

  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['style']
  });
});

// Exponer globalmente para debug
if (typeof window !== 'undefined') {
  window.TablonContratacion = TablonContratacion;
}
```

---

## 4. Integrar en el sistema de navegación

Asegúrate de que el archivo `app.js` o el que gestione la navegación incluya la página del tablón:

```javascript
// En el switch/case de páginas
case 'tablon':
  // Cargar la página del tablón
  loadPage('pages/tablon.html', 'tablon-page');
  break;
```

---

## 📝 Notas de Implementación

1. **Optimización:** Los datos se cargan solo una vez por sesión. El botón "Actualizar" recarga los datos.

2. **Filtros:** Se incluyen filtros por texto (chapa, empresa, barco) y por turno.

3. **Diseño responsive:** El tablón se adapta a dispositivos móviles.

4. **Acordeones:** Empresas y barcos son colapsables para facilitar la navegación.

5. **Estadísticas:** Se muestran contadores de chapas, empresas, barcos y partes.

---

## 🎨 Personalización

### Colores de empresas:

Puedes añadir colores específicos por empresa modificando el método `crearEmpresaElement`:

```javascript
const coloresEmpresas = {
  'MSC': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'APM': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'MAERSK': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  // ... más empresas
};

const color = coloresEmpresas[empresa] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
empresaHeader.style.background = color;
```

---

## ✅ Testing

Pasos para probar la implementación:

1. Ejecuta el SQL del calendario de pago en Supabase
2. Copia los archivos HTML y JS en las ubicaciones correctas
3. Recarga la PWA
4. Navega a "Tablón de Contratación"
5. Verifica que:
   - Se carga la última fecha
   - Se muestran las estadísticas
   - Los acordeones funcionan
   - Los filtros aplican correctamente

---

¡Listo! Con esto tendrás un tablón de contratación visual completamente funcional.
