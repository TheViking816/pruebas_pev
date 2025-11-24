/**
 * Google Apps Script para obtener datos de Noray (Previsión de demanda y Chapero)
 *
 * INSTRUCCIONES DE DESPLIEGUE:
 * 1. Ve a https://script.google.com y crea un nuevo proyecto
 * 2. Pega este código
 * 3. Despliega como aplicación web:
 *    - Ejecutar como: Tu cuenta
 *    - Quién tiene acceso: Cualquier persona
 * 4. Copia la URL del despliegue y actualízala en app.js en la función cargarDatosNoray
 *
 * IMPORTANTE: Las URLs correctas de Noray son:
 * - Previsión: https://noray.cpevalencia.com/PrevisionDemanda.asp
 * - Chapero: https://noray.cpevalencia.com/Chapero.asp
 */

// URLs CORRECTAS de las páginas de Noray
var URL_PREVISION = 'https://noray.cpevalencia.com/PrevisionDemanda.asp';
var URL_CHAPERO = 'https://noray.cpevalencia.com/Chapero.asp';

function doGet(e) {
  var action = e.parameter.action || 'all';
  var result = {};

  try {
    if (action === 'all' || action === 'prevision') {
      var previsionData = obtenerPrevision();
      result.demandas = previsionData.demandas;
      result.htmlPrevision = previsionData.html; // Enviar HTML crudo también
    }

    if (action === 'all' || action === 'chapero') {
      var chaperoData = obtenerChapero();
      result.fijos = chaperoData.fijos;
      result.htmlChapero = chaperoData.html; // Enviar HTML crudo también
    }

    result.success = true;
    result.timestamp = new Date().toISOString();

  } catch (error) {
    result.success = false;
    result.error = error.message;
    result.timestamp = new Date().toISOString();
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function obtenerPrevision() {
  var demandas = {
    '08-14': { gruas: 0, coches: 0 },
    '14-20': { gruas: 0, coches: 0 },
    '20-02': { gruas: 0, coches: 0 }
  };

  var html = '';

  try {
    var response = UrlFetchApp.fetch(URL_PREVISION, {
      'muteHttpExceptions': true,
      'followRedirects': true
    });

    html = response.getContentText();
    Logger.log('HTML Prevision obtenido, longitud: ' + html.length);

    // Solo parsear si tenemos HTML válido (no Cloudflare)
    if (html.indexOf('Just a moment') === -1 && html.indexOf('GRUAS') !== -1) {
      demandas = parsearPrevisionHTML(html);
    } else {
      Logger.log('HTML no válido o bloqueado por Cloudflare');
    }

  } catch (error) {
    Logger.log('Error obteniendo previsión: ' + error.message);
  }

  return { demandas: demandas, html: html };
}

function parsearPrevisionHTML(html) {
  var demandas = {
    '08-14': { gruas: 0, coches: 0 },
    '14-20': { gruas: 0, coches: 0 },
    '20-02': { gruas: 0, coches: 0 }
  };

  try {
    // Buscar secciones por jornada
    // La estructura tiene TDazul para 08-14, TDverde para 14-20, TDrojo para 20-02

    // 08-14: buscar desde TDazul hasta TDverde
    var idx0814Start = html.indexOf('TDazul');
    var idx0814End = html.indexOf('TDverde');
    if (idx0814Start !== -1 && idx0814End !== -1 && idx0814End > idx0814Start) {
      var seccion0814 = html.substring(idx0814Start, idx0814End);
      demandas['08-14'].gruas = extraerGruas(seccion0814);
      demandas['08-14'].coches = extraerCoches(seccion0814);
    }

    // 14-20: buscar desde TDverde hasta TDrojo
    var idx1420Start = html.indexOf('TDverde');
    var idx1420End = html.indexOf('TDrojo');
    if (idx1420Start !== -1 && idx1420End !== -1 && idx1420End > idx1420Start) {
      var seccion1420 = html.substring(idx1420Start, idx1420End);
      demandas['14-20'].gruas = extraerGruas(seccion1420);
      demandas['14-20'].coches = extraerCoches(seccion1420);
    }

    // 20-02: buscar desde TDrojo hasta el final de la tabla
    var idx2002Start = html.indexOf('TDrojo');
    if (idx2002Start !== -1) {
      var resto = html.substring(idx2002Start);
      var idx2002End = resto.indexOf('</TABLE>');
      if (idx2002End === -1) idx2002End = resto.indexOf('Equipos Previstos');
      if (idx2002End === -1) idx2002End = resto.length;
      var seccion2002 = resto.substring(0, idx2002End);
      demandas['20-02'].gruas = extraerGruas(seccion2002);
      demandas['20-02'].coches = extraerCoches(seccion2002);
    }

    Logger.log('Demandas parseadas: ' + JSON.stringify(demandas));

  } catch (error) {
    Logger.log('Error parseando previsión: ' + error.message);
  }

  return demandas;
}

function extraerGruas(seccion) {
  if (!seccion) return 0;

  try {
    // Buscar la fila de GRUAS y extraer el valor de ASIGNADOS
    // Formato: GRUAS<TD...>X<TD...>X<TD...>X<TD...>X<TD...>X<Th...>NUMERO
    var idxGruas = seccion.indexOf('GRUAS');
    if (idxGruas === -1) return 0;

    var despuesGruas = seccion.substring(idxGruas);

    // Buscar el <Th que contiene el número de ASIGNADOS
    var idxTh = despuesGruas.indexOf('<Th');
    if (idxTh === -1) return 0;

    var despuesTh = despuesGruas.substring(idxTh);

    // Extraer el número dentro del <Th>
    var match = despuesTh.match(/<Th[^>]*>(\d+)/i);
    if (match) {
      return parseInt(match[1]) || 0;
    }
  } catch (error) {
    Logger.log('Error extrayendo gruas: ' + error.message);
  }

  return 0;
}

function extraerCoches(seccion) {
  if (!seccion) return 0;

  try {
    // Buscar GRUPO III y extraer el valor de ROLON (4ta columna de números)
    var idxGrupo3 = seccion.indexOf('GRUPO III');
    if (idxGrupo3 === -1) return 0;

    var despuesGrupo3 = seccion.substring(idxGrupo3);

    // La estructura es: GRUPO III<TD>num1<TD>num2<TD>num3<TD>num4(ROLON)
    // Buscamos los <TD con nowrap y extraemos el 4to número
    var tdPattern = /<TD[^>]*nowrap>(\d*)/gi;
    var numeros = [];
    var match;

    while ((match = tdPattern.exec(despuesGrupo3)) !== null && numeros.length < 5) {
      numeros.push(parseInt(match[1]) || 0);
    }

    // El ROLON es el 4to número (índice 3)
    if (numeros.length >= 4) {
      return numeros[3];
    }
  } catch (error) {
    Logger.log('Error extrayendo coches: ' + error.message);
  }

  return 0;
}

function obtenerChapero() {
  var fijos = 0;
  var html = '';

  try {
    var response = UrlFetchApp.fetch(URL_CHAPERO, {
      'muteHttpExceptions': true,
      'followRedirects': true
    });

    html = response.getContentText();
    Logger.log('HTML Chapero obtenido, longitud: ' + html.length);

    // Solo parsear si tenemos HTML válido (no Cloudflare)
    if (html.indexOf('Just a moment') === -1) {
      // Buscar "No contratado (XXX)" en el HTML
      var match = html.match(/No\s*contratado\s*\((\d+)\)/i);
      if (match) {
        fijos = parseInt(match[1]) || 0;
        Logger.log('Fijos encontrados: ' + fijos);
      } else {
        // Alternativa: contar elementos con fondo chapab.jpg
        var bgMatches = html.match(/background='imagenes\/chapab\.jpg'/gi);
        if (bgMatches) {
          fijos = bgMatches.length;
          Logger.log('Fijos contados por imagen: ' + fijos);
        }
      }
    } else {
      Logger.log('HTML bloqueado por Cloudflare');
    }

  } catch (error) {
    Logger.log('Error obteniendo chapero: ' + error.message);
  }

  return { fijos: fijos, html: html };
}

// Función de prueba
function testParsing() {
  Logger.log('=== PROBANDO PREVISIÓN ===');
  var prevision = obtenerPrevision();
  Logger.log('Demandas: ' + JSON.stringify(prevision.demandas));
  Logger.log('HTML tiene Cloudflare: ' + (prevision.html.indexOf('Just a moment') !== -1));

  Logger.log('=== PROBANDO CHAPERO ===');
  var chapero = obtenerChapero();
  Logger.log('Fijos: ' + chapero.fijos);
  Logger.log('HTML tiene Cloudflare: ' + (chapero.html.indexOf('Just a moment') !== -1));
}
