/*
******************************************
PBE CONTROL - 1code.gs - V01.13
Sistema de Gestión Académica
03/01/2026 - 17:00
******************************************

CONTENIDO:
- doGet(): Router principal (usa createTemplateFromFile)
- include(): Inclusión dinámica de HTML
- autenticar(): Login unificado Admin/Estudiante
- 28 WRAPPERS: Funciones puente para google.script.run

IMPORTANTE:
- Este archivo NO contiene lógica de negocio
- Solo conecta frontend con backend (Student, Admin, DB)
- Cada wrapper llama directamente a su módulo
- NUNCA usar route() - usar wrappers específicos

🔑 REGLA DE ORO: "1 wrapper = 1 función específica"
******************************************
*/

// ==========================================
// 1. ROUTER PRINCIPAL - doGet()
// ==========================================

/**
 * Punto de entrada del sistema web
 * ⚠️ CRÍTICO: Usar createTemplateFromFile para páginas con include()
 */
function doGet(e) {
  var page = e.parameter.page;
  
  if (page === 'student') {
    // ✅ Panel estudiante usa include() → createTemplateFromFile
    return HtmlService.createTemplateFromFile('3panelstudent')
      .evaluate()
      .setTitle('PBE Control - Panel Estudiante')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
  if (page === 'admin') {
    // ✅ Panel admin usa include() → createTemplateFromFile
    return HtmlService.createTemplateFromFile('3paneladmin')
      .evaluate()
      .setTitle('PBE Control - Panel Admin')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
  // ✅ Login NO usa include() → createHtmlOutputFromFile
  return HtmlService.createHtmlOutputFromFile('3index')
    .setTitle('PBE Control - Login')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ==========================================
// 2. FUNCIÓN include()
// ==========================================

/**
 * Incluir archivos HTML dentro de templates
 * Uso: <?!= include('4atabcursosyrep'); ?>
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ==========================================
// 3. AUTENTICACIÓN
// ==========================================

/**
 * Autenticar usuario (Admin o Estudiante)
 * 
 * FLUJO:
 * 1. Buscar clave en Admin.User (columna A)
 * 2. Si encuentra → return admin
 * 3. Si NO encuentra → buscar en Alumnos.Clave (columna C)
 * 4. Si encuentra → return student
 * 5. Si NO encuentra → return error
 * 
 * @param {Object} params - { clave }
 * @return {Object} - { success, user: { type, ... } }
 */
function autenticar(params) {
  try {
    var clave = params.clave;
    
    if (!clave) {
      return { success: false, error: 'Ingresa tu clave de acceso' };
    }
    
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
    
    // 3. No encontrado
    return { success: false, error: 'Clave no encontrada. Verifica tu acceso' };
    
  } catch(error) {
    Logger.log('Error en autenticar(): ' + error.toString());
    return { success: false, error: 'Error de autenticación. Intenta nuevamente' };
  }
}

// ==========================================
// 4. WRAPPERS - STUDENT
// ==========================================

// === 4.1 CURSOS ===

function studentObtenerCursos(params) {
  return Student.obtenerCursos(params);
}

function studentAgregarCurso(params) {
  return Student.agregarCurso(params);
}

function studentActualizarCurso(params) {
  return Student.actualizarCurso(params);
}

function studentEliminarCurso(params) {
  return Student.eliminarCurso(params);
}

// === 4.2 REPASOS ===

function studentObtenerRepasos(params) {
  return Student.obtenerRepasos(params);
}

function studentAgregarRepaso(params) {
  return Student.agregarRepaso(params);
}

function studentActualizarRepaso(params) {
  return Student.actualizarRepaso(params);
}

function studentEliminarRepaso(params) {
  return Student.eliminarRepaso(params);
}

// === 4.3 EVALUACIONES ===

function studentObtenerEvaluaciones(params) {
  return Student.obtenerEvaluaciones(params);
}

function studentAgregarEvaluacion(params) {
  return Student.agregarEvaluacion(params);
}

function studentActualizarEvaluacion(params) {
  return Student.actualizarEvaluacion(params);
}

function studentEliminarEvaluacion(params) {
  return Student.eliminarEvaluacion(params);
}

// === 4.4 TAREAS ===

function studentObtenerTareas(params) {
  return Student.obtenerTareas(params);
}

function studentAgregarTarea(params) {
  return Student.agregarTarea(params);
}

function studentActualizarTarea(params) {
  return Student.actualizarTarea(params);
}

function studentEliminarTarea(params) {
  return Student.eliminarTarea(params);
}

// === 4.5 LECTURAS ===

function studentObtenerLecturas(params) {
  return Student.obtenerLecturas(params);
}

function studentAgregarLectura(params) {
  return Student.agregarLectura(params);
}

function studentActualizarLectura(params) {
  return Student.actualizarLectura(params);
}

function studentEliminarLectura(params) {
  return Student.eliminarLectura(params);
}

// === 4.6 HORARIO DE CLASES ===

function studentObtenerHorarioClases(params) {
  return Student.obtenerHorarioClases(params);
}

function studentAgregarHorarioClase(params) {
  return Student.agregarHorarioClase(params);
}

function studentActualizarHorarioClase(params) {
  return Student.actualizarHorarioClase(params);
}

function studentEliminarHorarioClase(params) {
  return Student.eliminarHorarioClase(params);
}

// === 4.7 HORARIO SEMANAL ===

function studentObtenerHorarioSem(params) {
  return Student.obtenerHorarioSem(params);
}

function studentAgregarHorarioSem(params) {
  return Student.agregarHorarioSem(params);
}

function studentEliminarHorarioSem(params) {
  return Student.eliminarHorarioSem(params);
}

// === 4.8 NOTAS ===

function studentObtenerNotasPorCurso(params) {
  return Student.obtenerNotasPorCurso(params);
}

function studentObtenerResumenNotas(params) {
  return Student.obtenerResumenNotas(params);
}

// === 4.9 DEBERES (VISTA UNIFICADA) ===

function studentObtenerTodosDeberes(params) {
  return Student.obtenerTodosDeberes(params);
}

function studentObtenerDeberesPorTipo(params) {
  return Student.obtenerDeberesPorTipo(params);
}

// ==========================================
// 5. WRAPPERS - ADMIN
// ==========================================

function adminCrearAlumno(params) {
  return Admin.crearAlumno(params);
}

function adminBuscarAlumno(params) {
  return Admin.buscarAlumno(params);
}

function adminEliminarAlumno(params) {
  return Admin.eliminarAlumno(params);
}

// ==========================================
// FIN DE 1code.gs
// Total: 34 funciones
// - doGet, include, autenticar (3)
// - Wrappers Student (28)
// - Wrappers Admin (3)
// ==========================================
