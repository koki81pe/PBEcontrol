/*
******************************************
PBE CONTROL - 2testfront.gs - V01.17 CLAUDE
Sistema de Gestión Académica
05/01/2026 - 23:00
******************************************

CAMBIOS V01.17 CLAUDE:
✅ NUEVO: testBackendCursos() - Prueba backend directo Student.obtenerCursos
✅ ACTUALIZADO: generarReporteFrontend() - Incluye test de backend directo

CAMBIOS V01.16 CLAUDE:
✅ NUEVO: testFrontendWrapperTEST05() - Prueba flujo completo frontend→backend
✅ NUEVO: testAutenticacionTEST05() - Prueba flujo de autenticación
✅ ACTUALIZADO: generarReporteFrontend() - Incluye tests de wrappers
✅ Detección exhaustiva de problemas: null, undefined, errores

CONTENIDO COMPLETO:
1. testFrontend(): Validación general de archivos.
2. testArchivoHTML(): Validador individual con try-catch.
3. testArchivoEspecifico(): Debug profundo de un solo archivo.
4. testPorCategoria(): Validación lógica por módulos (Base, Tabs, Subtabs).
5. testAutenticacionTEST05(): Test de autenticación con test5
6. testFrontendWrapperTEST05(): Prueba studentObtenerCursos wrapper
7. testBackendCursos(): NUEVO V01.17 - Prueba backend directo Student.obtenerCursos
8. generarReporteFrontend(): Motor de reporte (ACTUALIZADO V01.17).
9. mostrarResultadosUI(): Renderizado en modal de Google Sheets.
10. testRapido(): Booleano simple para validaciones internas.
11. listarArchivosHTML(): Auditoría de archivos existentes vs esperados.

IMPORTANTE:
- Total archivos validados: 16 (Se eliminaron 8modals y 8navbar).
- Compatible con 2testui.html y Utils.gs.
- Prueba el FLUJO COMPLETO que haría 5atabcursos.html
- Test de backend directo para aislar problemas en wrapper vs backend
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
// 5. testAutenticacionTEST05()
// ==========================================
/**
 * TEST FRONTEND: Autenticación de TEST05
 * Simula el flujo de 3index.html → autenticar()
 */
function testAutenticacionTEST05() {
  Logger.log('='.repeat(60));
  Logger.log('TEST FRONTEND: Autenticación TEST05');
  Logger.log('='.repeat(60));
  
  try {
    // 1. Simular parámetros del frontend
    var params = { clave: 'test5' };
    Logger.log('1. Params enviados: ' + JSON.stringify(params));
    
    // 2. Llamar a autenticar (como lo hace 3index.html)
    var result = autenticar(params);
    
    // 3. Análisis del resultado
    Logger.log('2. Análisis del resultado:');
    Logger.log('   Tipo: ' + typeof result);
    Logger.log('   Es null: ' + (result === null));
    Logger.log('   Es undefined: ' + (result === undefined));
    
    if (!result) {
      Logger.log('❌ FALLO: autenticar() retornó null/undefined');
      return { 
        passed: false, 
        nombre: 'Autenticación TEST05', 
        mensaje: 'autenticar() retornó null/undefined' 
      };
    }
    
    Logger.log('   Contenido: ' + JSON.stringify(result));
    
    // 4. Validar estructura
    if (result.success && result.user) {
      Logger.log('3. Usuario autenticado:');
      Logger.log('   type: ' + result.user.type);
      Logger.log('   codeAlum: ' + result.user.codeAlum);
      Logger.log('   nombre: ' + result.user.nombre);
      Logger.log('   email: ' + result.user.email);
      
      // Validar que sea TEST05
      if (result.user.codeAlum === 'TEST05') {
        Logger.log('✅ SUCCESS: TEST05 autenticado correctamente');
        return { 
          passed: true, 
          nombre: 'Autenticación TEST05', 
          mensaje: '✓ Autenticación exitosa: ' + result.user.nombre 
        };
      } else {
        Logger.log('❌ FALLO: CodeAlum incorrecto: ' + result.user.codeAlum);
        return { 
          passed: false, 
          nombre: 'Autenticación TEST05', 
          mensaje: 'CodeAlum incorrecto: ' + result.user.codeAlum 
        };
      }
    } else {
      Logger.log('❌ FALLO: ' + (result.error || 'Estructura de respuesta inválida'));
      return { 
        passed: false, 
        nombre: 'Autenticación TEST05', 
        mensaje: result.error || 'Estructura inválida' 
      };
    }
    
  } catch(error) {
    Logger.log('💥 EXCEPCIÓN:');
    Logger.log('   Message: ' + error.message);
    Logger.log('   Stack: ' + error.stack);
    return { 
      passed: false, 
      nombre: 'Autenticación TEST05', 
      mensaje: 'EXCEPCIÓN: ' + error.message 
    };
  } finally {
    Logger.log('='.repeat(60));
  }
}

// ==========================================
// 6. testFrontendWrapperTEST05()
// ==========================================
/**
 * TEST FRONTEND: Simular llamada desde 5atabcursos.html
 * Este test replica EXACTAMENTE lo que el navegador haría:
 * 1. Llama a studentObtenerCursos({ codeAlum: 'TEST05' })
 * 2. Valida que NO retorne null
 * 3. Valida la estructura de la respuesta
 * 4. Valida que los cursos existan
 */
function testFrontendWrapperTEST05() {
  Logger.log('='.repeat(60));
  Logger.log('TEST FRONTEND: Wrapper studentObtenerCursos (TEST05)');
  Logger.log('='.repeat(60));
  
  try {
    // 1. Simular parámetros del frontend
    var params = { codeAlum: 'TEST05' };
    Logger.log('1. Params enviados desde frontend: ' + JSON.stringify(params));
    
    // 2. Llamar al wrapper (como lo hace google.script.run)
    Logger.log('2. Llamando a studentObtenerCursos()...');
    var result = studentObtenerCursos(params);
    
    // 3. Análisis exhaustivo del resultado
    Logger.log('3. Análisis del resultado:');
    Logger.log('   Tipo: ' + typeof result);
    Logger.log('   Es null: ' + (result === null));
    Logger.log('   Es undefined: ' + (result === undefined));
    
    // ⚠️ DETECCIÓN DEL PROBLEMA: Si result es null
    if (result === null) {
      Logger.log('❌ PROBLEMA DETECTADO: studentObtenerCursos() retornó NULL');
      Logger.log('   Esto causa el error: Cannot read properties of null');
      return { 
        passed: false, 
        nombre: 'Wrapper studentObtenerCursos', 
        mensaje: 'FALLO CRÍTICO: Retorna NULL en lugar de objeto {success, data/error}' 
      };
    }
    
    if (result === undefined) {
      Logger.log('❌ PROBLEMA DETECTADO: studentObtenerCursos() retornó UNDEFINED');
      return { 
        passed: false, 
        nombre: 'Wrapper studentObtenerCursos', 
        mensaje: 'FALLO: Retorna UNDEFINED' 
      };
    }
    
    // 4. Validar estructura del objeto
    Logger.log('   Contenido: ' + JSON.stringify(result));
    
    if (!result.hasOwnProperty('success')) {
      Logger.log('❌ FALLO: Objeto no tiene propiedad "success"');
      return { 
        passed: false, 
        nombre: 'Wrapper studentObtenerCursos', 
        mensaje: 'Falta propiedad "success"' 
      };
    }
    
    // 5. Validar respuesta exitosa
    if (result.success) {
      if (!result.data || !Array.isArray(result.data)) {
        Logger.log('❌ FALLO: success=true pero data no es array');
        return { 
          passed: false, 
          nombre: 'Wrapper studentObtenerCursos', 
          mensaje: 'data no es array' 
        };
      }
      
      Logger.log('4. Cursos obtenidos:');
      Logger.log('   Total: ' + result.data.length);
      
      result.data.forEach(function(curso, i) {
        Logger.log('   [' + (i+1) + '] ' + curso.Curso + ': ' + curso.Completo + ' (' + curso.Color + ')');
      });
      
      // Validar que tenga al menos 5 cursos (TEST05 debe tener 5)
      if (result.data.length >= 5) {
        Logger.log('✅ SUCCESS: ' + result.data.length + ' cursos obtenidos correctamente');
        return { 
          passed: true, 
          nombre: 'Wrapper studentObtenerCursos', 
          mensaje: '✓ ' + result.data.length + ' cursos (MATE, FIS, QUIM, BIOL, HIST)' 
        };
      } else {
        Logger.log('⚠️ ADVERTENCIA: Solo ' + result.data.length + ' cursos (esperados 5)');
        return { 
          passed: false, 
          nombre: 'Wrapper studentObtenerCursos', 
          mensaje: 'Solo ' + result.data.length + ' cursos, esperados 5' 
        };
      }
      
    } else {
      // Error en la respuesta
      Logger.log('❌ ERROR en result: ' + result.error);
      return { 
        passed: false, 
        nombre: 'Wrapper studentObtenerCursos', 
        mensaje: 'ERROR: ' + result.error 
      };
    }
    
  } catch(error) {
    Logger.log('💥 EXCEPCIÓN CAPTURADA:');
    Logger.log('   Message: ' + error.message);
    Logger.log('   Stack: ' + error.stack);
    return { 
      passed: false, 
      nombre: 'Wrapper studentObtenerCursos', 
      mensaje: 'EXCEPCIÓN: ' + error.message 
    };
  } finally {
    Logger.log('='.repeat(60));
  }
}

// ==========================================
// 7. NUEVO V01.17: testBackendCursos()
// ==========================================
/**
 * TEST BACKEND DIRECTO: Student.obtenerCursos
 * Bypasea el wrapper para probar el backend puro
 * 
 * DIFERENCIA con testFrontendWrapperTEST05():
 * - testFrontendWrapperTEST05() → Llama a studentObtenerCursos() (wrapper en 1code.gs)
 * - testBackendCursos() → Llama a Student.obtenerCursos() (backend directo en 1student.gs)
 * 
 * Esto ayuda a identificar si el problema está en:
 * a) El wrapper (1code.gs)
 * b) El backend (1student.gs)
 * c) La capa de datos (1db.gs)
 */
function testBackendCursos() {
  Logger.log('='.repeat(60));
  Logger.log('TEST BACKEND DIRECTO: Student.obtenerCursos');
  Logger.log('='.repeat(60));
  
  try {
    // 1. Parámetros
    var params = { codeAlum: 'TEST05' };
    Logger.log('1. Llamando Student.obtenerCursos() DIRECTO con: ' + JSON.stringify(params));
    Logger.log('   (Bypaseando el wrapper studentObtenerCursos)');
    
    // 2. Llamar DIRECTAMENTE al backend (sin wrapper)
    var result = Student.obtenerCursos(params);
    
    // 3. Análisis
    Logger.log('2. Análisis del resultado:');
    Logger.log('   Tipo: ' + typeof result);
    Logger.log('   Es null: ' + (result === null));
    Logger.log('   Es undefined: ' + (result === undefined));
    
    if (result === null) {
      Logger.log('❌ PROBLEMA: Student.obtenerCursos() retorna NULL');
      Logger.log('   Posible causa: DB.obtenerPorAlumno() falló');
      Logger.log('   Revisar: 1student.gs y 1db.gs');
      return { 
        passed: false, 
        nombre: 'Backend Student.obtenerCursos', 
        mensaje: 'Backend retorna NULL - revisar 1student.gs y 1db.gs' 
      };
    }
    
    if (result === undefined) {
      Logger.log('❌ PROBLEMA: Student.obtenerCursos() retorna UNDEFINED');
      return { 
        passed: false, 
        nombre: 'Backend Student.obtenerCursos', 
        mensaje: 'Backend retorna UNDEFINED' 
      };
    }
    
    Logger.log('   Contenido: ' + JSON.stringify(result));
    
    // 4. Validar estructura
    if (result.success) {
      Logger.log('3. Backend exitoso:');
      Logger.log('   Cursos encontrados: ' + result.data.length);
      
      result.data.forEach(function(curso, i) {
        Logger.log('   [' + (i+1) + '] ' + curso.Curso + ' - ' + curso.Completo + ' (' + curso.Color + ')');
      });
      
      if (result.data.length >= 5) {
        Logger.log('✅ SUCCESS: Backend funciona correctamente');
        Logger.log('   Si el wrapper falla pero el backend funciona → problema en 1code.gs');
        return { 
          passed: true, 
          nombre: 'Backend Student.obtenerCursos', 
          mensaje: '✓ Backend OK: ' + result.data.length + ' cursos' 
        };
      } else {
        Logger.log('⚠️ WARNING: Solo ' + result.data.length + ' cursos');
        return { 
          passed: false, 
          nombre: 'Backend Student.obtenerCursos', 
          mensaje: 'Solo ' + result.data.length + ' cursos, esperados 5' 
        };
      }
      
    } else {
      Logger.log('❌ ERROR: ' + result.error);
      return { 
        passed: false, 
        nombre: 'Backend Student.obtenerCursos', 
        mensaje: 'ERROR: ' + result.error 
      };
    }
    
  } catch(error) {
    Logger.log('💥 EXCEPCIÓN:');
    Logger.log('   Message: ' + error.message);
    Logger.log('   Stack: ' + error.stack);
    return { 
      passed: false, 
      nombre: 'Backend Student.obtenerCursos', 
      mensaje: 'EXCEPCIÓN: ' + error.message 
    };
  } finally {
    Logger.log('='.repeat(60));
  }
}

// ==========================================
// 8. FUNCIÓN REPORTE: generarReporteFrontend()
// ACTUALIZADA V01.17 CLAUDE
// ==========================================
function generarReporteFrontend() {
  Logger.log('====================================');
  Logger.log('GENERANDO REPORTE INTEGRAL...');
  Logger.log('====================================');
  
  var general = testFrontend();
  var categorias = testPorCategoria();
  
  // Tests de wrappers y backend
  Logger.log('');
  Logger.log('====================================');
  Logger.log('EJECUTANDO TESTS DE WRAPPERS Y BACKEND...');
  Logger.log('====================================');
  
  var testAuth = testAutenticacionTEST05();
  var testWrapper = testFrontendWrapperTEST05();
  var testBackend = testBackendCursos(); // NUEVO V01.17
  
  var fecha;
  try { fecha = Utils.fechaHoy(); } 
  catch(e) { fecha = Utilities.formatDate(new Date(), "GMT-5", "dd/MM/yyyy HH:mm"); }

  var reporte = {
    fecha: fecha,
    general: general,
    categorias: categorias,
    wrappers: {
      autenticacion: testAuth,
      obtenerCursosWrapper: testWrapper,
      obtenerCursosBackend: testBackend // NUEVO V01.17
    },
    listo: general.success && categorias.success && testAuth.passed && testWrapper.passed && testBackend.passed
  };
  
  Logger.log('');
  Logger.log('====================================');
  Logger.log('RESUMEN FINAL:');
  Logger.log('====================================');
  Logger.log('Archivos HTML: ' + (general.success ? '✅ OK' : '❌ FALLO'));
  Logger.log('Categorías: ' + (categorias.success ? '✅ OK' : '❌ FALLO'));
  Logger.log('Autenticación TEST05: ' + (testAuth.passed ? '✅ OK' : '❌ FALLO'));
  Logger.log('Wrapper studentObtenerCursos: ' + (testWrapper.passed ? '✅ OK' : '❌ FALLO'));
  Logger.log('Backend Student.obtenerCursos: ' + (testBackend.passed ? '✅ OK' : '❌ FALLO')); // NUEVO V01.17
  Logger.log('====================================');
  Logger.log('SISTEMA: ' + (reporte.listo ? '✅ OPERATIVO' : '❌ CON PROBLEMAS'));
  Logger.log('====================================');

  mostrarResultadosUI(reporte);
  return reporte;
}

// ==========================================
// 9. FUNCIÓN UI: mostrarResultadosUI()
// ==========================================
function mostrarResultadosUI(resultados) {
  try {
    var template = HtmlService.createTemplateFromFile('2testui');
    template.resultados = JSON.stringify(resultados);
    var html = template.evaluate().setWidth(900).setHeight(700);
    SpreadsheetApp.getUi().showModalDialog(html, '🧪 Test Frontend PBE Control V01.17 CLAUDE');
  } catch(e) {
    Logger.log('⚠️ No se pudo abrir el modal UI. Ver Logger para resultados.');
  }
}

// ==========================================
// 10. FUNCIÓN: testRapido()
// ==========================================
function testRapido() {
  return ARCHIVOS_ESPERADOS.every(function(n) {
    try { HtmlService.createHtmlOutputFromFile(n); return true; } 
    catch(e) { return false; }
  });
}

// ==========================================
// 11. FUNCIÓN: listarArchivosHTML()
// ==========================================
function listarArchivosHTML() {
  Logger.log('AUDITORÍA DE ARCHIVOS:');
  ARCHIVOS_ESPERADOS.forEach(function(n) {
    var e = testArchivoHTML(n).existe ? '✓' : '✗';
    Logger.log(e + ' ' + n);
  });
}

// ==========================================
// FIN DE 2testfront.gs V01.17 CLAUDE
// ==========================================
// RESUMEN:
// - Tests de archivos HTML (existencia e integridad)
// - Test de autenticación completa
// - Test de wrapper studentObtenerCursos
// - NUEVO V01.17: Test de backend directo Student.obtenerCursos
// - Reporte integral con TODAS las validaciones
// 
// DIAGNÓSTICO:
// Si wrapper falla pero backend funciona → problema en 1code.gs
// Si ambos fallan → problema en 1student.gs o 1db.gs
// Si ambos funcionan → problema en el frontend o timing
// ==========================================
