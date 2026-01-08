/*
******************************************
PBE CONTROL - 1code.gs - V01.25 CLAUDE
Sistema de Gestión Académica
07/01/2026 - 23:45
******************************************

CONTENIDO:
- doGet(): Router principal (Lógica MallaU con procesamiento de Templates)
- include(): Inclusión dinámica de HTML (Indispensable para las pestañas)
- autenticar(): Login unificado Admin/Estudiante
- 31 WRAPPERS: Funciones puente para google.script.run

CAMBIOS V01.25 CLAUDE:
✅ FIX CRÍTICO: Fechas formateadas a DD/MM/AAAA en lugar de Date.toString()
✅ Problema: Fechas mostraban formato largo en inglés ("Mon Jan 05 2026...")
✅ Solución: Nueva función formatearFechaDD_MM_AAAA() para formato corto
✅ Resuelve filtros de fecha que fallaban por formato incompatible
✅ Función auxiliar actualizada: cleanObject()

CAMBIOS V01.24 CLAUDE:
✅ FIX CRÍTICO: Limpieza de objetos en TODOS los wrappers
✅ Problema: google.script.run no serializa Date objects → retorna NULL
✅ Solución: Convertir Date a String antes de retornar
✅ Aplicado a los 31 wrappers de Student
✅ Función auxiliar: cleanDataForSerialization()

CAMBIOS V01.23:
- Agregado wrapper faltante: studentActualizarHorarioSem

CAMBIOS V01.22:
- CORRECCIÓN CRÍTICA en include(): Ahora procesa templates anidados
- Cambio: createHtmlOutputFromFile → createTemplateFromFile + evaluate()
- Esto permite que los <?!= include() ?> dentro de sub-tabs se procesen correctamente
- Sin este cambio, los sub-tabs mostraban texto literal: <?!= include('archivo'); ?>

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
// 4. FUNCIÓN AUXILIAR - LIMPIEZA DE DATOS
// V01.25 CLAUDE
// ==========================================

/**
 * Limpiar objetos para serialización de google.script.run
 * 
 * PROBLEMA V01.23:
 * google.script.run NO puede serializar Date objects
 * Resultado: retorna NULL al frontend
 * 
 * SOLUCIÓN V01.24:
 * Convertir todos los campos problemáticos a String
 * 
 * MEJORA V01.25:
 * Formatear fechas como DD/MM/AAAA en lugar de Date.toString()
 * Esto resuelve:
 * - Fechas mostraban formato largo en inglés
 * - Filtros de fecha fallaban por formato incompatible
 * 
 * CAMPOS QUE SE LIMPIAN:
 * - FechaReg: Date → DD/MM/AAAA
 * - FechaClase: Date → DD/MM/AAAA
 * - FechaRep: Date → DD/MM/AAAA
 * - FechaEval: Date → DD/MM/AAAA
 * - FechaEntrega: Date → DD/MM/AAAA
 * - FechaAccion: Date → DD/MM/AAAA
 * - FechaInicio: Date → DD/MM/AAAA
 * - FechaFin: Date → DD/MM/AAAA
 * - FechaHS: Date → DD/MM/AAAA
 * - HoraInicio: mantener como String
 * - HoraFin: mantener como String
 * 
 * @param {Object} result - Respuesta de Student.* functions
 * @return {Object} - Objeto limpio serializable
 */
function cleanDataForSerialization(result) {
  if (!result || !result.success || !result.data) {
    return result;
  }
  
  // Si data es un array, limpiar cada item
  if (Array.isArray(result.data)) {
    result.data = result.data.map(function(item) {
      return cleanObject(item);
    });
  } else {
    // Si data es un objeto, limpiarlo directamente
    result.data = cleanObject(result.data);
  }
  
  return result;
}

/**
 * Formatear Date a DD/MM/AAAA
 * V01.25 CLAUDE
 */
function formatearFechaDD_MM_AAAA(fecha) {
  if (!fecha || !(fecha instanceof Date)) {
    return '';
  }
  
  var dia = fecha.getDate();
  var mes = fecha.getMonth() + 1; // Mes base 0
  var anio = fecha.getFullYear();
  
  // Agregar cero a la izquierda si es necesario
  dia = dia < 10 ? '0' + dia : dia;
  mes = mes < 10 ? '0' + mes : mes;
  
  return dia + '/' + mes + '/' + anio;
}

/**
 * Limpiar un objeto individual
 * V01.25: Convierte Dates a DD/MM/AAAA y preserva _rowNumber
 */
function cleanObject(obj) {
  var cleaned = {};
  
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var value = obj[key];
      
      // Convertir Date a DD/MM/AAAA
      if (value instanceof Date) {
        cleaned[key] = formatearFechaDD_MM_AAAA(value);
      } 
      // Convertir null/undefined a string vacío
      else if (value === null || value === undefined) {
        cleaned[key] = '';
      }
      // Preservar el resto tal cual
      else {
        cleaned[key] = value;
      }
    }
  }
  
  return cleaned;
}

// ==========================================
// 5. WRAPPERS - STUDENT (31 Funciones)
// V01.25 CLAUDE: Fechas en formato DD/MM/AAAA
// V01.24 CLAUDE: TODOS CON LIMPIEZA
// ==========================================

// ==========================================
// CURSOS (4 wrappers)
// ==========================================

function studentObtenerCursos(params) { 
  var result = Student.obtenerCursos(params);
  return cleanDataForSerialization(result);
}

function studentAgregarCurso(params) { 
  var result = Student.agregarCurso(params);
  return cleanDataForSerialization(result);
}

function studentActualizarCurso(params) { 
  var result = Student.actualizarCurso(params);
  return cleanDataForSerialization(result);
}

function studentEliminarCurso(params) { 
  var result = Student.eliminarCurso(params);
  return cleanDataForSerialization(result);
}

// ==========================================
// REPASOS (4 wrappers)
// ==========================================

function studentObtenerRepasos(params) { 
  var result = Student.obtenerRepasos(params);
  return cleanDataForSerialization(result);
}

function studentAgregarRepaso(params) { 
  var result = Student.agregarRepaso(params);
  return cleanDataForSerialization(result);
}

function studentActualizarRepaso(params) { 
  var result = Student.actualizarRepaso(params);
  return cleanDataForSerialization(result);
}

function studentEliminarRepaso(params) { 
  var result = Student.eliminarRepaso(params);
  return cleanDataForSerialization(result);
}

// ==========================================
// EVALUACIONES (4 wrappers)
// ==========================================

function studentObtenerEvaluaciones(params) { 
  var result = Student.obtenerEvaluaciones(params);
  return cleanDataForSerialization(result);
}

function studentAgregarEvaluacion(params) { 
  var result = Student.agregarEvaluacion(params);
  return cleanDataForSerialization(result);
}

function studentActualizarEvaluacion(params) { 
  var result = Student.actualizarEvaluacion(params);
  return cleanDataForSerialization(result);
}

function studentEliminarEvaluacion(params) { 
  var result = Student.eliminarEvaluacion(params);
  return cleanDataForSerialization(result);
}

// ==========================================
// TAREAS (4 wrappers)
// ==========================================

function studentObtenerTareas(params) { 
  var result = Student.obtenerTareas(params);
  return cleanDataForSerialization(result);
}

function studentAgregarTarea(params) { 
  var result = Student.agregarTarea(params);
  return cleanDataForSerialization(result);
}

function studentActualizarTarea(params) { 
  var result = Student.actualizarTarea(params);
  return cleanDataForSerialization(result);
}

function studentEliminarTarea(params) { 
  var result = Student.eliminarTarea(params);
  return cleanDataForSerialization(result);
}

// ==========================================
// LECTURAS (4 wrappers)
// ==========================================

function studentObtenerLecturas(params) { 
  var result = Student.obtenerLecturas(params);
  return cleanDataForSerialization(result);
}

function studentAgregarLectura(params) { 
  var result = Student.agregarLectura(params);
  return cleanDataForSerialization(result);
}

function studentActualizarLectura(params) { 
  var result = Student.actualizarLectura(params);
  return cleanDataForSerialization(result);
}

function studentEliminarLectura(params) { 
  var result = Student.eliminarLectura(params);
  return cleanDataForSerialization(result);
}

// ==========================================
// HORARIO CLASES (4 wrappers)
// ==========================================

function studentObtenerHorarioClases(params) { 
  var result = Student.obtenerHorarioClases(params);
  return cleanDataForSerialization(result);
}

function studentAgregarHorarioClase(params) { 
  var result = Student.agregarHorarioClase(params);
  return cleanDataForSerialization(result);
}

function studentActualizarHorarioClase(params) { 
  var result = Student.actualizarHorarioClase(params);
  return cleanDataForSerialization(result);
}

function studentEliminarHorarioClase(params) { 
  var result = Student.eliminarHorarioClase(params);
  return cleanDataForSerialization(result);
}

// ==========================================
// HORARIO SEMANAL (4 wrappers)
// ==========================================

function studentObtenerHorarioSem(params) { 
  var result = Student.obtenerHorarioSem(params);
  return cleanDataForSerialization(result);
}

function studentAgregarHorarioSem(params) { 
  var result = Student.agregarHorarioSem(params);
  return cleanDataForSerialization(result);
}

function studentActualizarHorarioSem(params) { 
  var result = Student.actualizarHorarioSem(params);
  return cleanDataForSerialization(result);
}

function studentEliminarHorarioSem(params) { 
  var result = Student.eliminarHorarioSem(params);
  return cleanDataForSerialization(result);
}

// ==========================================
// NOTAS Y RESÚMENES (2 wrappers)
// ==========================================

function studentObtenerNotasPorCurso(params) { 
  var result = Student.obtenerNotasPorCurso(params);
  return cleanDataForSerialization(result);
}

function studentObtenerResumenNotas(params) { 
  var result = Student.obtenerResumenNotas(params);
  return cleanDataForSerialization(result);
}

// ==========================================
// DEBERES (VISTAS UNIFICADAS) (2 wrappers)
// ==========================================

function studentObtenerTodosDeberes(params) { 
  var result = Student.obtenerTodosDeberes(params);
  return cleanDataForSerialization(result);
}

function studentObtenerDeberesPorTipo(params) { 
  var result = Student.obtenerDeberesPorTipo(params);
  return cleanDataForSerialization(result);
}

// ==========================================
// 6. WRAPPERS - ADMIN (3 Funciones)
// Sin cambios - Admin no retorna Dates problemáticos
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
// FIN DE 1code.gs V01.24 CLAUDE
// ==========================================
// RESUMEN:
// - 1 Router (doGet)
// - 1 Include con procesamiento de templates anidados
// - 1 Autenticación
// - 2 Funciones auxiliares de limpieza (NUEVO V01.24)
// - 31 Wrappers Student (TODOS con limpieza V01.24)
// - 3 Wrappers Admin (sin cambios)
// TOTAL: 39 funciones
//
// CAMBIOS V01.24 CLAUDE:
// ✅ cleanDataForSerialization(): Limpia Date objects
// ✅ cleanObject(): Convierte valores problemáticos a String
// ✅ Aplicado a TODOS los 31 wrappers de Student
// ✅ Soluciona: "Cannot read properties of null"
// ✅ google.script.run ahora puede serializar correctamente
// ==========================================
