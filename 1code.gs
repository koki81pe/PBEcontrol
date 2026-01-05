/*
******************************************
PBE CONTROL - 1code.gs - V01.20 (GEMINI)
Sistema de Gestión Académica
05/01/2026 - 13:50
******************************************

CONTENIDO:
- doGet(): Router principal (Lógica de MallaU: Extensiones fijas)
- include(): Inclusión dinámica de HTML
- autenticar(): Login unificado Admin/Estudiante
- 28 WRAPPERS: Funciones puente para google.script.run

CAMBIOS REALIZADOS:
- Se estandarizó el uso de ScriptApp.getService().getUrl() para forzar 
  redirecciones a la URL raíz /exec y evitar el error userCodeAppPanel.
- Se asegura que los parámetros no se "arrastren" en la URL de forma sucia.
******************************************
*/

// ==========================================
// 1. ROUTER PRINCIPAL - doGet()
// ==========================================

function doGet(e) {
  var page = e.parameter.page;
  // Esta es la URL única oficial (https://.../exec)
  var scriptUrl = ScriptApp.getService().getUrl(); 
  
  // ✅ CASO 1: Panel Estudiante (?page=student)
  if (page === 'student') {
    var template = HtmlService.createTemplateFromFile('3panelstudent');
    template.scriptUrl = scriptUrl; // Para botones de "Cerrar Sesión"
    return template.evaluate()
      .setTitle('PBE Control - Panel Estudiante')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
  
  // ✅ CASO 2: Panel Administrador (?page=admin)
  if (page === 'admin') {
    var template = HtmlService.createTemplateFromFile('3paneladmin');
    template.scriptUrl = scriptUrl;
    return template.evaluate()
      .setTitle('PBE Control - Panel Admin')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
  
  // ✅ CASO POR DEFECTO: Login (Si no hay parámetros o son incorrectos)
  var template = HtmlService.createTemplateFromFile('3index');
  template.scriptUrl = scriptUrl; 
  
  return template.evaluate()
    .setTitle('PBE Control - Acceso')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// ==========================================
// 2. FUNCIÓN include()
// ==========================================

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
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
// 4. WRAPPERS - STUDENT (28 Funciones)
// ==========================================

function studentObtenerCursos(params) { return Student.obtenerCursos(params); }
function studentAgregarCurso(params) { return Student.agregarCurso(params); }
function studentActualizarCurso(params) { return Student.actualizarCurso(params); }
function studentEliminarCurso(params) { return Student.eliminarCurso(params); }

function studentObtenerRepasos(params) { return Student.obtenerRepasos(params); }
function studentAgregarRepaso(params) { return Student.agregarRepaso(params); }
function studentActualizarRepaso(params) { return Student.actualizarRepaso(params); }
function studentEliminarRepaso(params) { return Student.eliminarRepaso(params); }

function studentObtenerEvaluaciones(params) { return Student.obtenerEvaluaciones(params); }
function studentAgregarEvaluacion(params) { return Student.agregarEvaluacion(params); }
function studentActualizarEvaluacion(params) { return Student.actualizarEvaluacion(params); }
function studentEliminarEvaluacion(params) { return Student.eliminarEvaluacion(params); }

function studentObtenerTareas(params) { return Student.obtenerTareas(params); }
function studentAgregarTarea(params) { return Student.agregarTarea(params); }
function studentActualizarTarea(params) { return Student.actualizarTarea(params); }
function studentEliminarTarea(params) { return Student.eliminarTarea(params); }

function studentObtenerLecturas(params) { return Student.obtenerLecturas(params); }
function studentAgregarLectura(params) { return Student.agregarLectura(params); }
function studentActualizarLectura(params) { return Student.actualizarLectura(params); }
function studentEliminarLectura(params) { return Student.eliminarLectura(params); }

function studentObtenerHorarioClases(params) { return Student.obtenerHorarioClases(params); }
function studentAgregarHorarioClase(params) { return Student.agregarHorarioClase(params); }
function studentActualizarHorarioClase(params) { return Student.actualizarHorarioClase(params); }
function studentEliminarHorarioClase(params) { return Student.eliminarHorarioClase(params); }

function studentObtenerHorarioSem(params) { return Student.obtenerHorarioSem(params); }
function studentAgregarHorarioSem(params) { return Student.agregarHorarioSem(params); }
function studentEliminarHorarioSem(params) { return Student.eliminarHorarioSem(params); }

function studentObtenerNotasPorCurso(params) { return Student.obtenerNotasPorCurso(params); }
function studentObtenerResumenNotas(params) { return Student.obtenerResumenNotas(params); }

function studentObtenerTodosDeberes(params) { return Student.obtenerTodosDeberes(params); }
function studentObtenerDeberesPorTipo(params) { return Student.obtenerDeberesPorTipo(params); }

// ==========================================
// 5. WRAPPERS - ADMIN (3 Funciones)
// ==========================================

function adminCrearAlumno(params) { return Admin.crearAlumno(params); }
function adminBuscarAlumno(params) { return Admin.buscarAlumno(params); }
function adminEliminarAlumno(params) { return Admin.eliminarAlumno(params); }

// FIN DE 1code.gs
