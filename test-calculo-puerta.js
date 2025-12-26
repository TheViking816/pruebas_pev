// Test para verificar cálculo de distancia a puerta con disponibilidades parciales
// Caso: Chapa 410, posición 461 (OC), puerta OC en 498

// Constantes del censo
const LIMITE_SP = 455;
const INICIO_OC = 456;
const FIN_OC = 519;

// Simular un censo con diferentes disponibilidades
// Para este test, vamos a simular algunos usuarios en rojo, naranja, amarillo, azul y verde
const censoSimulado = [];

// Llenar censo SP (1-455) - todos verdes para simplificar
for (let i = 1; i <= LIMITE_SP; i++) {
  censoSimulado.push({ posicion: i, color: 'green', chapa: `${i}` });
}

// Llenar censo OC (456-519) con diferentes colores para probar
// Vamos a poner algunos ejemplos:
for (let i = INICIO_OC; i <= FIN_OC; i++) {
  let color = 'green'; // Por defecto verde

  // Algunos rojos (no disponibles)
  if (i === 460 || i === 470 || i === 500) {
    color = 'red';
  }
  // Algunos naranjas (0.25)
  else if (i === 465 || i === 505) {
    color = 'orange';
  }
  // Algunos amarillos (0.5)
  else if (i === 475 || i === 510) {
    color = 'yellow';
  }
  // Algunos azules (0.75)
  else if (i === 485 || i === 515) {
    color = 'blue';
  }

  censoSimulado.push({ posicion: i, color: color, chapa: `${i}` });
}

// Función para obtener peso según color (igual que en el código real)
function getPesoDisponibilidad(posicion, censo) {
  const item = censo.find(c => c.posicion === posicion);
  if (!item) return 0;

  switch(item.color) {
    case 'red': return 0;
    case 'orange': return 0.25;
    case 'yellow': return 0.50;
    case 'blue': return 0.75;
    case 'green': return 1.00;
    default: return 0;
  }
}

// Función para contar disponibles entre dos posiciones (COPIA del código real)
function contarDisponiblesEntre(desde, hasta, esUsuarioSP, censo) {
  let disponibles = 0;

  if (desde <= hasta) {
    // Rango directo
    for (let pos = desde + 1; pos <= hasta; pos++) {
      disponibles += getPesoDisponibilidad(pos, censo);
    }
  } else {
    // Rango con vuelta: desde -> fin + inicio -> hasta
    if (esUsuarioSP) {
      for (let pos = desde + 1; pos <= LIMITE_SP; pos++) {
        disponibles += getPesoDisponibilidad(pos, censo);
      }
      for (let pos = 1; pos <= hasta; pos++) {
        disponibles += getPesoDisponibilidad(pos, censo);
      }
    } else {
      for (let pos = desde + 1; pos <= FIN_OC; pos++) {
        disponibles += getPesoDisponibilidad(pos, censo);
      }
      for (let pos = INICIO_OC; pos <= hasta; pos++) {
        disponibles += getPesoDisponibilidad(pos, censo);
      }
    }
  }

  return disponibles;
}

// Test del caso específico
console.log('=== TEST CÁLCULO DISTANCIA A PUERTA ===\n');
console.log('Caso: Chapa 410, posición 461 (OC)');
console.log('Puerta OC actual: 498');
console.log('Usuario en posición: 461\n');

const posicionUsuario = 461;
const ultimaPuertaLaborable = 498;
const esUsuarioSP = posicionUsuario <= LIMITE_SP;

console.log(`Usuario es ${esUsuarioSP ? 'SP' : 'OC'}\n`);

// Calcular distancia (COPIA del código real - CORREGIDO: no cuenta al usuario)
let distancia;
if (posicionUsuario > ultimaPuertaLaborable) {
  // Usuario está delante: contar de puerta+1 hasta usuario-1 (NO contar usuario)
  console.log('Usuario está DELANTE de la puerta');
  distancia = contarDisponiblesEntre(ultimaPuertaLaborable, posicionUsuario - 1, esUsuarioSP, censoSimulado);
} else if (posicionUsuario < ultimaPuertaLaborable) {
  // Usuario está detrás, hay que dar la vuelta
  console.log('Usuario está DETRÁS de la puerta (censo da la vuelta)\n');

  if (esUsuarioSP) {
    distancia = contarDisponiblesEntre(ultimaPuertaLaborable, LIMITE_SP, esUsuarioSP, censoSimulado) +
                contarDisponiblesEntre(0, posicionUsuario - 1, esUsuarioSP, censoSimulado);
  } else {
    const parte1 = contarDisponiblesEntre(ultimaPuertaLaborable, FIN_OC, esUsuarioSP, censoSimulado);
    const parte2 = contarDisponiblesEntre(INICIO_OC - 1, posicionUsuario - 1, esUsuarioSP, censoSimulado);

    console.log(`Parte 1 (de puerta ${ultimaPuertaLaborable} hasta fin ${FIN_OC}):`);
    console.log(`  Posiciones: ${ultimaPuertaLaborable + 1} a ${FIN_OC}`);
    console.log(`  Distancia efectiva: ${parte1.toFixed(2)}`);

    console.log(`\nParte 2 (de inicio ${INICIO_OC} hasta usuario-1 ${posicionUsuario - 1}):`);
    console.log(`  Posiciones: ${INICIO_OC} a ${posicionUsuario - 1} (NO cuenta usuario)`);
    console.log(`  Distancia efectiva: ${parte2.toFixed(2)}`);

    distancia = parte1 + parte2;
  }
} else {
  // Misma posición
  console.log('Usuario en la MISMA posición que la puerta');
  distancia = 0;
}

const posicionesLaborable = Math.round(distancia * 100) / 100;

console.log(`\n=== RESULTADO ===`);
console.log(`Distancia efectiva: ${posicionesLaborable} posiciones`);

// Mostrar detalles de disponibilidad en el rango
console.log(`\n=== DETALLE DE DISPONIBILIDADES ===`);
console.log('De puerta 498 hasta fin 519:');
for (let i = 499; i <= 519; i++) {
  const item = censoSimulado.find(c => c.posicion === i);
  const peso = getPesoDisponibilidad(i, censoSimulado);
  console.log(`  Pos ${i}: ${item.color} (peso: ${peso})`);
}

console.log('\nDe inicio 456 hasta usuario-1 (460) - NO cuenta al usuario:');
for (let i = 456; i <= 460; i++) {
  const item = censoSimulado.find(c => c.posicion === i);
  const peso = getPesoDisponibilidad(i, censoSimulado);
  console.log(`  Pos ${i}: ${item.color} (peso: ${peso})`);
}

// Cálculo manual esperado
console.log(`\n=== VERIFICACIÓN MANUAL ===`);
const posicionesReales = (519 - 498) + (460 - 456 + 1); // Sin contar al usuario
console.log(`Posiciones absolutas (sin pesos, SIN contar usuario): ${posicionesReales}`);
console.log(`Posiciones efectivas (con pesos): ${posicionesLaborable}`);
console.log(`Diferencia: ${(posicionesReales - posicionesLaborable).toFixed(2)} (usuarios no disponibles o parcialmente disponibles)`);
