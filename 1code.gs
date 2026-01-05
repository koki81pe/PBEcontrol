/*
******************************************
PBE CONTROL - 1code.gs - V01.23 CLAUDE
Sistema de Gestión Académica
05/01/2026 - 20:30
******************************************

CONTENIDO:
- doGet(): Router principal (Lógica MallaU con procesamiento de Templates)
- include(): Inclusión dinámica de HTML (Indispensable para las pestañas)
- autenticar(): Login unificado Admin/Estudiante
- 31 WRAPPERS: Funciones puente para google.script.run

CAMBIOS V01.22:
- CORRECCIÓN CRÍTICA en include(): Ahora procesa templates anidados
- Cambio: createHtmlOutputFromFile → createTemplateFromFile + evaluate()
- Esto permite que los <?!= include() ?> dentro de sub-tabs se procesen correctamente
- Sin este cambio, los sub-tabs mostraban texto literal: <?!= include('archivo'); ?>
- Agregado wrapper faltante: studentActualizarHorarioSem

CAMBIOS V01.21:
- Se cambió createHtmlOutputFromFile por createTemplateFromFile en doGet().
- Se agregó .evaluate() a cada retorno para procesar los comandos <?!= include() ?>.
- Se mantiene la inyección de scriptUrl para redirecciones seguras.
******************************************
*/

// ==========================================
// 1. ROUTER PRINCIPAL - doGet()
// ==========================================

function doGet(e) {
  var page = e.parameter.page;
  var scriptUrl = ScriptApp.getService().getUrl(); 
  
  // 1. Caso Estudiante (?page=student)
  // Ahora usa createTemplate para que las pestañas (5atabcursos, etc.) se carguen.
  if (page === 'student') {
    var template = HtmlService.createTemplateFromFile('3panelstudent');
    template.scriptUrl = scriptUrl; 
    return template.evaluate()
      .setTitle('PBE Control - Panel Estudiante')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
  
  // 2. Caso Administrador (?page=admin)
  // Ahora usa createTemplate para que las pestañas (4atabcursosyrep, etc.) se carguen.
  if (page === 'admin') {
    var template = HtmlService.createTemplateFromFile('3paneladmin');
    template.scriptUrl = scriptUrl;
    return template.evaluate()
      .setTitle('PBE Control - Panel Admin')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
  
  // 3. Caso Base (Login / Index)
  var template = HtmlService.createTemplateFromFile('3index');
  template.scriptUrl = scriptUrl; 
  
  return template.evaluate()
    .setTitle('PBE Control - Acceso')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// ==========================================
// 2. FUNCIÓN include() - VERSIÓN CORREGIDA
// ==========================================

/**
 * CORRECCIÓN CRÍTICA V01.22
 * 
 * Fundamental para que funcionen las pestañas separadas en archivos HTML.
 * 
 * CAMBIO: Ahora usa createTemplateFromFile + evaluate() en lugar de
 * createHtmlOutputFromFile. Esto permite procesar includes anidados.
 * 
 * ANTES (V01.21): 
 * return HtmlService.createHtmlOutputFromFile(filename).getContent();
 * - Solo retornaba HTML estático
 * - Los <?!= include() ?> dentro de sub-tabs NO se procesaban
 * - Resultado: Aparecía texto literal "<?!= include('archivo'); ?>"
 * 
 * AHORA (V01.22):
 * var template = HtmlService.createTemplateFromFile(filename);
 * return template.evaluate().getContent();
 * - Crea un template del archivo
 * - Lo evalúa (procesa todos los <?!= include() ?>)
 * - Retorna el contenido HTML procesado
 * - Resultado: Los sub-tabs se cargan correctamente
 * 
 * EJEMPLO DE FLUJO:
 * 1. 3panelstudent.html → <?!= include('4atabcursosyrep'); ?>
 * 2. 4atabcursosyrep.html → <?!= include('5atabcursos'); ?>
 * 3. Ambos niveles se procesan correctamente
 * 
 * @param {string} filename - Nombre del archivo HTML (sin extensión .html)
 * @return {string} - Contenido HTML procesado
 */
function include(filename) {
  var template = HtmlService.createTemplateFromFile(filename);
  return template.evaluate().getContent();
}

// ==========================================
// 3. AUTENTICACIÓN
// ==========================================

function autenticar(params) {
  try {
    var clave = params.clave;
    if (!clave) return { success: false, error: 'Ingresa tu clave de acceso' };
    
    // 1. Buscar en Admin
    var admin = DB.buscar('Admin', 'User', clave);
    if (admin.success) {
      return { 
        success: true, 
        user: { 
          type: 'admin',
          nombre: admin.data.Nombre,
          user: admin.data.User
        }
      };
    }
    
    // 2. Buscar en Alumnos
    var alumno = DB.buscar('Alumnos', 'Clave', clave);
    if (alumno.success) {
      return { 
        success: true, 
        user: { 
          type: 'student',
          codeAlum: alumno.data.CodeAlum,
          nombre: alumno.data.Nombres + ' ' + alumno.data.Apellidos,
          email: alumno.data.Email
        }
      };
    }
    
    return { success: false, error: 'Clave no encontrada' };
  } catch(error) {
    Logger.log('Error en autenticar(): ' + error.toString());
    return { success: false, error: 'Error de servidor' };
  }
}

// ==========================================
// 4. WRAPPERS - STUDENT (31 Funciones)
// ==========================================

// CURSOS
function studentObtenerCursos(params) { 
  Logger.log('🔍 studentObtenerCursos WRAPPER');
  Logger.log('  Params: ' + JSON.stringify(params));
  
  var result = Student.obtenerCursos(params);
  
  Logger.log('  Result type: ' + typeof result);
  Logger.log('  Result is null: ' + (result === null));
  Logger.log('  Result: ' + JSON.stringify(result));
  
  return result;
}
function studentAgregarCurso(params) { return Student.agregarCurso(params); }
function studentActualizarCurso(params) { return Student.actualizarCurso(params); }
function studentEliminarCurso(params) { return Student.eliminarCurso(params); }

// REPASOS
function studentObtenerRepasos(params) { return Student.obtenerRepasos(params); }
function studentAgregarRepaso(params) { return Student.agregarRepaso(params); }
function studentActualizarRepaso(params) { return Student.actualizarRepaso(params); }
function studentEliminarRepaso(params) { return Student.eliminarRepaso(params); }

// EVALUACIONES
function studentObtenerEvaluaciones(params) { return Student.obtenerEvaluaciones(params); }
function studentAgregarEvaluacion(params) { return Student.agregarEvaluacion(params); }
function studentActualizarEvaluacion(params) { return Student.actualizarEvaluacion(params); }
function studentEliminarEvaluacion(params) { return Student.eliminarEvaluacion(params); }

// TAREAS
function studentObtenerTareas(params) { return Student.obtenerTareas(params); }
function studentAgregarTarea(params) { return Student.agregarTarea(params); }
function studentActualizarTarea(params) { return Student.actualizarTarea(params); }
function studentEliminarTarea(params) { return Student.eliminarTarea(params); }

// LECTURAS
function studentObtenerLecturas(params) { return Student.obtenerLecturas(params); }
function studentAgregarLectura(params) { return Student.agregarLectura(params); }
function studentActualizarLectura(params) { return Student.actualizarLectura(params); }
function studentEliminarLectura(params) { return Student.eliminarLectura(params); }

// HORARIO CLASES
function studentObtenerHorarioClases(params) { return Student.obtenerHorarioClases(params); }
function studentAgregarHorarioClase(params) { return Student.agregarHorarioClase(params); }
function studentActualizarHorarioClase(params) { return Student.actualizarHorarioClase(params); }
function studentEliminarHorarioClase(params) { return Student.eliminarHorarioClase(params); }

// HORARIO SEMANAL
function studentObtenerHorarioSem(params) { return Student.obtenerHorarioSem(params); }
function studentAgregarHorarioSem(params) { return Student.agregarHorarioSem(params); }
function studentActualizarHorarioSem(params) { return Student.actualizarHorarioSem(params); }
function studentEliminarHorarioSem(params) { return Student.eliminarHorarioSem(params); }

// NOTAS Y RESÚMENES
function studentObtenerNotasPorCurso(params) { return Student.obtenerNotasPorCurso(params); }
function studentObtenerResumenNotas(params) { return Student.obtenerResumenNotas(params); }

// DEBERES (VISTAS UNIFICADAS)
function studentObtenerTodosDeberes(params) { return Student.obtenerTodosDeberes(params); }
function studentObtenerDeberesPorTipo(params) { return Student.obtenerDeberesPorTipo(params); }

// ==========================================
// 5. WRAPPERS - ADMIN (3 Funciones)
// ==========================================

function adminCrearAlumno(params) { return Admin.crearAlumno(params); }
function adminBuscarAlumno(params) { return Admin.buscarAlumno(params); }
function adminEliminarAlumno(params) { return Admin.eliminarAlumno(params); }

// ==========================================
// FIN DE 1code.gs V01.22
// ==========================================
// RESUMEN:
// - 1 Router (doGet)
// - 1 Include con procesamiento de templates anidados
// - 1 Autenticación
// - 31 Wrappers Student
// - 3 Wrappers Admin
// TOTAL: 37 funciones
// ==========================================
