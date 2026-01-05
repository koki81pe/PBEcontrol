/*
******************************************
PBE CONTROL - 2testfront.gs - V01.15
Sistema de Gestión Académica
05/01/2026 - 13:00
******************************************

CONTENIDO COMPLETO:
1. testFrontend(): Validación general de archivos.
2. testArchivoHTML(): Validador individual con try-catch.
3. testArchivoEspecifico(): Debug profundo de un solo archivo.
4. testPorCategoria(): Validación lógica por módulos (Base, Tabs, Subtabs).
5. generarReporteFrontend(): Motor de reporte para el sistema.
6. mostrarResultadosUI(): Renderizado en modal de Google Sheets.
7. testRapido(): Booleano simple para validaciones internas.
8. listarArchivosHTML(): Auditoría de archivos existentes vs esperados.
9. incluir() / include(): Alias para soporte de renderizado.

IMPORTANTE:
- Total archivos validados: 16 (Se eliminaron 8modals y 8navbar).
- Compatible con 2testui.html y Utils.gs.
******************************************
*/

// ==========================================
// CONFIGURACIÓN GLOBAL DE ARCHIVOS
// ==========================================
const ARCHIVOS_ESPERADOS = [
  '3index', '3paneladmin', '3panelstudent',
  '4atabcursosyrep', '4btabdeberes', '4ctabplanning',
  '5atabcursos', '5atabrepasos',
  '6btabtodos', '6btabeval', '6btabtareas', '6btablecturas',
  '7ctabhorarioclase', '7ctabhorariosem', '7ctabnotas', '7ctabcalendario'
];

// ==========================================
// 1. FUNCIÓN PRINCIPAL: testFrontend()
// ==========================================
function testFrontend() {
  Logger.log('====================================');
  Logger.log('INICIANDO TEST FRONTEND - PBE CONTROL');
  Logger.log('====================================');
  
  var faltantes = [];
  var existentes = 0;
  
  Logger.log('Verificando ' + ARCHIVOS_ESPERADOS.length + ' archivos HTML...');
  Logger.log('');
  
  ARCHIVOS_ESPERADOS.forEach(function(nombre) {
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
  Logger.log('Total esperados: ' + ARCHIVOS_ESPERADOS.length);
  Logger.log('Existentes: ' + existentes);
  Logger.log('Faltantes: ' + faltantes.length);
  Logger.log('====================================');
  
  if (faltantes.length > 0) {
    Logger.log('❌ ARCHIVOS FALTANTES detectados.');
    return { success: false, total: ARCHIVOS_ESPERADOS.length, existentes: existentes, faltantes: faltantes };
  }
  
  Logger.log('✅ Todos los archivos HTML existen.');
  return { success: true, total: ARCHIVOS_ESPERADOS.length, existentes: existentes, faltantes: [] };
}

// ==========================================
// 2. FUNCIÓN AUXILIAR: testArchivoHTML()
// ==========================================
function testArchivoHTML(nombre) {
  try {
    HtmlService.createHtmlOutputFromFile(nombre);
    return { existe: true, nombre: nombre + '.html', error: null };
  } catch(error) {
    return { existe: false, nombre: nombre + '.html', error: error.toString() };
  }
}

// ==========================================
// 3. FUNCIÓN DE DEBUG: testArchivoEspecifico()
// ==========================================
function testArchivoEspecifico(nombre) {
  Logger.log('TEST DETALLADO: ' + nombre);
  var resultado = testArchivoHTML(nombre);
  if (resultado.existe) {
    var content = HtmlService.createHtmlOutputFromFile(nombre).getContent();
    Logger.log('✓ Existe. Tamaño: ' + content.length + ' caracteres.');
  } else {
    Logger.log('✗ No encontrado. Error: ' + resultado.error);
  }
}

// ==========================================
// 4. FUNCIÓN: testPorCategoria()
// ==========================================
function testPorCategoria() {
  var categorias = {
    'Base (3)': ['3index', '3paneladmin', '3panelstudent'],
    'Tabs Principales (3)': ['4atabcursosyrep', '4btabdeberes', '4ctabplanning'],
    'Sub-tabs Cursos (2)': ['5atabcursos', '5atabrepasos'],
    'Sub-tabs Deberes (4)': ['6btabtodos', '6btabeval', '6btabtareas', '6btablecturas'],
    'Sub-tabs Planning (4)': ['7ctabhorarioclase', '7ctabhorariosem', '7ctabnotas', '7ctabcalendario']
  };
  
  var resultados = {};
  var todoOk = true;
  
  for (var cat in categorias) {
    var faltantes = [];
    categorias[cat].forEach(function(n) {
      if (!testArchivoHTML(n).existe) { faltantes.push(n); todoOk = false; }
    });
    resultados[cat] = { total: categorias[cat].length, faltantes: faltantes };
  }
  return { success: todoOk, detalle: resultados };
}

// ==========================================
// 5. FUNCIÓN REPORTE: generarReporteFrontend()
// ==========================================
function generarReporteFrontend() {
  Logger.log('GENERANDO REPORTE INTEGRAL...');
  var general = testFrontend();
  var categorias = testPorCategoria();
  
  var fecha;
  try { fecha = Utils.fechaHoy(); } 
  catch(e) { fecha = Utilities.formatDate(new Date(), "GMT-5", "dd/MM/yyyy HH:mm"); }

  var reporte = {
    fecha: fecha,
    general: general,
    categorias: categorias,
    listo: general.success && categorias.success
  };

  mostrarResultadosUI(reporte);
  return reporte;
}

// ==========================================
// 6. FUNCIÓN UI: mostrarResultadosUI()
// ==========================================
function mostrarResultadosUI(resultados) {
  try {
    var template = HtmlService.createTemplateFromFile('2testui');
    template.resultados = JSON.stringify(resultados);
    var html = template.evaluate().setWidth(900).setHeight(700);
    SpreadsheetApp.getUi().showModalDialog(html, '🧪 Test Frontend PBE Control');
  } catch(e) {
    Logger.log('⚠️ No se pudo abrir el modal UI. Ver Logger para resultados.');
  }
}

// ==========================================
// 7. FUNCIÓN: testRapido()
// ==========================================
function testRapido() {
  return ARCHIVOS_ESPERADOS.every(function(n) {
    try { HtmlService.createHtmlOutputFromFile(n); return true; } 
    catch(e) { return false; }
  });
}

// ==========================================
// 8. FUNCIÓN: listarArchivosHTML()
// ==========================================
function listarArchivosHTML() {
  Logger.log('AUDITORÍA DE ARCHIVOS:');
  ARCHIVOS_ESPERADOS.forEach(function(n) {
    var e = testArchivoHTML(n).existe ? '✓' : '✗';
    Logger.log(e + ' ' + n);
  });
}
