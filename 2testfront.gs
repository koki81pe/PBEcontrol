/*
******************************************
PBE CONTROL - 2testfront.gs - V01.13
Sistema de Gestión Académica
03/01/2026 - 20:00
******************************************

CONTENIDO:
- testFrontend(): Verificar que los 18 archivos HTML existan
- testArchivoHTML(): Verificar archivo individual
- generarReporteFrontend(): Generar reporte detallado

IMPORTANTE:
- ⚠️ PASO 0 CRÍTICO: Verificar archivos ANTES de ejecutar sistema
- Si falta un archivo → Sistema puede mostrar página en blanco
- Ejecutar después de cada cambio en archivos HTML
- Resultados se muestran en Logger y UI (opcional)

🔑 PRINCIPIO: "Validar TODOS los archivos HTML antes de desplegar"
******************************************
*/

// ==========================================
// FUNCIÓN PRINCIPAL: testFrontend()
// ==========================================

/**
 * Verificar que TODOS los 18 archivos HTML existan
 * 
 * ⚠️ PASO 0 CRÍTICO: Ejecutar ANTES de usar el sistema
 * 
 * Lista de archivos (18 total):
 * - Base: 3 archivos
 * - Tabs principales: 3 archivos
 * - Sub-tabs Cursos: 2 archivos
 * - Sub-tabs Deberes: 4 archivos
 * - Sub-tabs Planning: 4 archivos
 * - Componentes: 2 archivos
 * 
 * @return {Object} - { success, totalArchivos, existentes, faltantes: [] }
 */
function testFrontend() {
  Logger.log('====================================');
  Logger.log('INICIANDO TEST FRONTEND - PBE CONTROL');
  Logger.log('====================================');
  
  var archivos = [
    // === BASE (3 archivos) ===
    '3index',
    '3paneladmin',
    '3panelstudent',
    
    // === TABS PRINCIPALES - Contenedores (3 archivos) ===
    '4atabcursosyrep',
    '4btabdeberes',
    '4ctabplanning',
    
    // === SUB-TABS CURSOS (2 archivos) ===
    '5atabcursos',
    '5atabrepasos',
    
    // === SUB-TABS DEBERES (4 archivos) ===
    '6btabtodos',
    '6btabeval',
    '6btabtareas',
    '6btablecturas',
    
    // === SUB-TABS PLANNING (4 archivos) ===
    '7ctabhorarioclase',
    '7ctabhorariosem',
    '7ctabnotas',
    '7ctabcalendario',
    
    // === COMPONENTES (2 archivos) ===
    '8modals',
    '8navbar'
  ];
  
  var faltantes = [];
  var existentes = 0;
  
  Logger.log('Verificando ' + archivos.length + ' archivos HTML...');
  Logger.log('');
  
  // Verificar cada archivo
  archivos.forEach(function(nombre) {
    var resultado = testArchivoHTML(nombre);
    
    if (resultado.existe) {
      existentes++;
      Logger.log('✓ ' + nombre + '.html - EXISTE');
    } else {
      faltantes.push(nombre + '.html');
      Logger.log('✗ ' + nombre + '.html - FALTA');
    }
  });
  
  Logger.log('');
  Logger.log('====================================');
  Logger.log('RESUMEN:');
  Logger.log('Total archivos: ' + archivos.length);
  Logger.log('Existentes: ' + existentes);
  Logger.log('Faltantes: ' + faltantes.length);
  Logger.log('====================================');
  
  // Si hay archivos faltantes, mostrar lista
  if (faltantes.length > 0) {
    Logger.log('');
    Logger.log('❌ ARCHIVOS FALTANTES:');
    faltantes.forEach(function(archivo) {
      Logger.log('  - ' + archivo);
    });
    Logger.log('');
    Logger.log('⚠️ ADVERTENCIA: El sistema puede fallar sin estos archivos');
    Logger.log('');
    
    return {
      success: false,
      totalArchivos: archivos.length,
      existentes: existentes,
      faltantes: faltantes
    };
  }
  
  // Todos los archivos existen
  Logger.log('');
  Logger.log('✅ Todos los 18 archivos HTML existen');
  Logger.log('✅ Sistema listo para ejecutarse');
  Logger.log('');
  
  return {
    success: true,
    totalArchivos: archivos.length,
    existentes: existentes,
    faltantes: []
  };
}

// ==========================================
// FUNCIÓN AUXILIAR: testArchivoHTML()
// ==========================================

/**
 * Verificar que un archivo HTML específico exista
 * 
 * Método: Intentar crear HtmlOutput desde el archivo
 * Si no existe → HtmlService lanza error
 * 
 * @param {string} nombre - Nombre del archivo (sin extensión .html)
 * @return {Object} - { existe: true/false, nombre, error }
 */
function testArchivoHTML(nombre) {
  try {
    // Intentar crear HtmlOutput desde el archivo
    HtmlService.createHtmlOutputFromFile(nombre);
    
    // Si llega aquí, el archivo existe
    return {
      existe: true,
      nombre: nombre + '.html',
      error: null
    };
    
  } catch(error) {
    // Si hay error, el archivo no existe
    return {
      existe: false,
      nombre: nombre + '.html',
      error: error.toString()
    };
  }
}

// ==========================================
// FUNCIÓN: testArchivoEspecifico()
// ==========================================

/**
 * Probar un archivo específico con información detallada
 * 
 * Útil para debugging cuando un archivo específico falla
 * 
 * @param {string} nombre - Nombre del archivo (sin extensión)
 * @return {Object} - { existe, nombre, error, detalles }
 */
function testArchivoEspecifico(nombre) {
  Logger.log('====================================');
  Logger.log('TEST ARCHIVO ESPECÍFICO: ' + nombre + '.html');
  Logger.log('====================================');
  
  var resultado = testArchivoHTML(nombre);
  
  if (resultado.existe) {
    Logger.log('✓ Archivo EXISTE: ' + nombre + '.html');
    
    // Intentar obtener contenido para verificar que no esté vacío
    try {
      var content = HtmlService.createHtmlOutputFromFile(nombre).getContent();
      var longitud = content.length;
      
      Logger.log('  Tamaño: ' + longitud + ' caracteres');
      
      if (longitud === 0) {
        Logger.log('  ⚠️ ADVERTENCIA: Archivo vacío');
        resultado.detalles = 'Archivo existe pero está vacío';
      } else {
        Logger.log('  ✓ Archivo tiene contenido');
        resultado.detalles = 'Archivo válido con ' + longitud + ' caracteres';
      }
      
    } catch(error) {
      Logger.log('  ⚠️ Error al leer contenido: ' + error.toString());
      resultado.detalles = 'Archivo existe pero no se pudo leer: ' + error.toString();
    }
    
  } else {
    Logger.log('✗ Archivo FALTA: ' + nombre + '.html');
    Logger.log('  Error: ' + resultado.error);
    resultado.detalles = 'Archivo no encontrado';
  }
  
  Logger.log('====================================');
  
  return resultado;
}

// ==========================================
// FUNCIÓN: testPorCategoria()
// ==========================================

/**
 * Verificar archivos organizados por categoría
 * 
 * Muestra resultados agrupados por:
 * - Base
 * - Tabs principales
 * - Sub-tabs
 * - Componentes
 * 
 * @return {Object} - { success, categorias: {} }
 */
function testPorCategoria() {
  Logger.log('====================================');
  Logger.log('TEST FRONTEND POR CATEGORÍA');
  Logger.log('====================================');
  Logger.log('');
  
  var categorias = {
    'Base (3 archivos)': ['3index', '3paneladmin', '3panelstudent'],
    'Tabs Principales (3 archivos)': ['4atabcursosyrep', '4btabdeberes', '4ctabplanning'],
    'Sub-tabs Cursos (2 archivos)': ['5atabcursos', '5atabrepasos'],
    'Sub-tabs Deberes (4 archivos)': ['6btabtodos', '6btabeval', '6btabtareas', '6btablecturas'],
    'Sub-tabs Planning (4 archivos)': ['7ctabhorarioclase', '7ctabhorariosem', '7ctabnotas', '7ctabcalendario'],
    'Componentes (2 archivos)': ['8modals', '8navbar']
  };
  
  var resultados = {};
  var todoExiste = true;
  
  // Verificar cada categoría
  for (var categoria in categorias) {
    Logger.log('📁 ' + categoria);
    
    var archivos = categorias[categoria];
    var existentes = 0;
    var faltantes = [];
    
    archivos.forEach(function(nombre) {
      var resultado = testArchivoHTML(nombre);
      
      if (resultado.existe) {
        existentes++;
        Logger.log('  ✓ ' + nombre + '.html');
      } else {
        faltantes.push(nombre + '.html');
        todoExiste = false;
        Logger.log('  ✗ ' + nombre + '.html - FALTA');
      }
    });
    
    resultados[categoria] = {
      total: archivos.length,
      existentes: existentes,
      faltantes: faltantes
    };
    
    Logger.log('');
  }
  
  Logger.log('====================================');
  Logger.log('RESUMEN POR CATEGORÍA:');
  Logger.log('====================================');
  
  for (var cat in resultados) {
    var res = resultados[cat];
    var estado = res.existentes === res.total ? '✓' : '✗';
    Logger.log(estado + ' ' + cat + ': ' + res.existentes + '/' + res.total);
    
    if (res.faltantes.length > 0) {
      Logger.log('  Faltantes: ' + res.faltantes.join(', '));
    }
  }
  
  Logger.log('====================================');
  
  if (todoExiste) {
    Logger.log('✅ Todas las categorías completas');
  } else {
    Logger.log('❌ Algunas categorías tienen archivos faltantes');
  }
  
  Logger.log('');
  
  return {
    success: todoExiste,
    categorias: resultados
  };
}

// ==========================================
// FUNCIÓN: generarReporteFrontend()
// ==========================================

/**
 * Generar reporte completo de frontend
 * 
 * Incluye:
 * - Test general (18 archivos)
 * - Test por categoría
 * - Estadísticas
 * 
 * @return {Object} - Reporte completo
 */
function generarReporteFrontend() {
  Logger.log('');
  Logger.log('╔════════════════════════════════════════╗');
  Logger.log('║  REPORTE COMPLETO FRONTEND - PBE       ║');
  Logger.log('╚════════════════════════════════════════╝');
  Logger.log('');
  
  // Test general
  var testGeneral = testFrontend();
  
  Logger.log('');
  Logger.log('────────────────────────────────────────');
  Logger.log('');
  
  // Test por categoría
  var testCategorias = testPorCategoria();
  
  // Generar reporte final
  var reporte = {
    fecha: Utils.fechaHoy(),
    testGeneral: testGeneral,
    testCategorias: testCategorias,
    sistemaListo: testGeneral.success && testCategorias.success
  };
  
  Logger.log('');
  Logger.log('╔════════════════════════════════════════╗');
  Logger.log('║  CONCLUSIÓN                            ║');
  Logger.log('╚════════════════════════════════════════╝');
  
  if (reporte.sistemaListo) {
    Logger.log('');
    Logger.log('✅ SISTEMA FRONTEND: OK');
    Logger.log('✅ Todos los 18 archivos HTML existen');
    Logger.log('✅ Sistema listo para ejecutarse');
    Logger.log('');
  } else {
    Logger.log('');
    Logger.log('❌ SISTEMA FRONTEND: CON ERRORES');
    Logger.log('❌ Faltan ' + testGeneral.faltantes.length + ' archivo(s)');
    Logger.log('⚠️  El sistema NO está listo para ejecutarse');
    Logger.log('');
    Logger.log('Archivos faltantes:');
    testGeneral.faltantes.forEach(function(archivo) {
      Logger.log('  - ' + archivo);
    });
    Logger.log('');
  }
  
  return reporte;
}

// ==========================================
// FUNCIÓN: mostrarResultadosUI()
// ==========================================

/**
 * Mostrar resultados en UI (opcional)
 * 
 * Si existe 2testui.html, mostrar resultados ahí
 * Si no, mostrar solo en Logger
 * 
 * @param {Object} resultados - Resultados del test
 */
function mostrarResultadosUI(resultados) {
  try {
    // Intentar mostrar en UI
    var template = HtmlService.createTemplateFromFile('2testui');
    template.resultados = JSON.stringify(resultados);
    
    var html = template.evaluate()
      .setWidth(900)
      .setHeight(700);
    
    SpreadsheetApp.getUi().showModalDialog(
      html,
      '🧪 Resultados Test Frontend - PBE Control'
    );
    
  } catch(error) {
    // Si falla, solo mostrar en Logger
    Logger.log('Nota: No se pudo mostrar UI (2testui.html no disponible)');
    Logger.log('Resultados mostrados solo en Logger');
  }
}

// ==========================================
// FUNCIÓN: testRapido()
// ==========================================

/**
 * Test rápido - Solo verificar si todos existen
 * 
 * Sin logging detallado, solo retorna true/false
 * Útil para validaciones rápidas en otros scripts
 * 
 * @return {boolean} - true si todos existen, false si falta alguno
 */
function testRapido() {
  var archivos = [
    '3index', '3paneladmin', '3panelstudent',
    '4atabcursosyrep', '4btabdeberes', '4ctabplanning',
    '5atabcursos', '5atabrepasos',
    '6btabtodos', '6btabeval', '6btabtareas', '6btablecturas',
    '7ctabhorarioclase', '7ctabhorariosem', '7ctabnotas', '7ctabcalendario',
    '8modals', '8navbar'
  ];
  
  for (var i = 0; i < archivos.length; i++) {
    try {
      HtmlService.createHtmlOutputFromFile(archivos[i]);
    } catch(error) {
      return false; // Si falla alguno, retornar false
    }
  }
  
  return true; // Todos existen
}

// ==========================================
// FUNCIÓN: listarArchivosHTML()
// ==========================================

/**
 * Listar TODOS los archivos HTML del proyecto
 * 
 * Útil para ver qué archivos existen realmente
 * vs qué archivos DEBERÍA haber
 * 
 * @return {Array} - Lista de nombres de archivos HTML
 */
function listarArchivosHTML() {
  Logger.log('====================================');
  Logger.log('LISTANDO ARCHIVOS HTML DEL PROYECTO');
  Logger.log('====================================');
  Logger.log('');
  
  // Lista de archivos esperados
  var esperados = [
    '3index', '3paneladmin', '3panelstudent',
    '4atabcursosyrep', '4btabdeberes', '4ctabplanning',
    '5atabcursos', '5atabrepasos',
    '6btabtodos', '6btabeval', '6btabtareas', '6btablecturas',
    '7ctabhorarioclase', '7ctabhorariosem', '7ctabnotas', '7ctabcalendario',
    '8modals', '8navbar',
    '2testui' // También el archivo de UI de tests
  ];
  
  var existentes = [];
  var faltantes = [];
  
  esperados.forEach(function(nombre) {
    try {
      HtmlService.createHtmlOutputFromFile(nombre);
      existentes.push(nombre + '.html');
      Logger.log('✓ ' + nombre + '.html');
    } catch(error) {
      faltantes.push(nombre + '.html');
      Logger.log('✗ ' + nombre + '.html - NO ENCONTRADO');
    }
  });
  
  Logger.log('');
  Logger.log('====================================');
  Logger.log('RESUMEN:');
  Logger.log('Archivos esperados: ' + esperados.length);
  Logger.log('Archivos existentes: ' + existentes.length);
  Logger.log('Archivos faltantes: ' + faltantes.length);
  Logger.log('====================================');
  
  if (faltantes.length > 0) {
    Logger.log('');
    Logger.log('Archivos que faltan:');
    faltantes.forEach(function(archivo) {
      Logger.log('  - ' + archivo);
    });
  }
  
  Logger.log('');
  
  return {
    esperados: esperados.length,
    existentes: existentes,
    faltantes: faltantes
  };
}

// ==========================================
// FIN DE 2testfront.gs
// Total: 9 funciones
// - testFrontend() - Principal
// - testArchivoHTML() - Auxiliar
// - testArchivoEspecifico() - Debug
// - testPorCategoria() - Categorizado
// - generarReporteFrontend() - Reporte completo
// - mostrarResultadosUI() - UI opcional
// - testRapido() - Validación rápida
// - listarArchivosHTML() - Listar archivos
// ==========================================
