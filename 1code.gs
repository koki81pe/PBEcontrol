/*
******************************************
PBE CONTROL - 1code.gs - V01.26 CLAUDE
Sistema de Gestión Académica
09/01/2026 - 00:30
******************************************

CONTENIDO:
- doGet(): Router principal (Lógica MallaU con procesamiento de Templates)
- include(): Inclusión dinámica de HTML (Indispensable para las pestañas)
- autenticar(): Login unificado Admin/Estudiante
- 31 WRAPPERS: Funciones puente para google.script.run

CAMBIOS V01.26 CLAUDE:
✅ FIX CRÍTICO: Detección y formateo correcto de datetime.time objects
✅ Problema: time(8,0) se convertía a Date "30/12/1899" en lugar de "08:00"
✅ Solución: Nueva función isTimeValue() detecta time objects disfrazados de Date
✅ Solución: Nueva función formatearTimeHH_MM() extrae hora correctamente
✅ Resultado: HoraInicio y HoraFin ahora llegan como "08:00" al frontend

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

******************************************
*/

// ==========================================
// 1. ROUTER PRINCIPAL - doGet()
// ==========================================

function doGet(e) {
  var page = e.parameter.page;
  var scriptUrl = ScriptApp.getService().getUrl(); 
  
  // 1. Caso Estudiante (?page=student)
  if (page === 'student') {
    var template = HtmlService.createTemplateFromFile('3panelstudent');
    template.scriptUrl = scriptUrl; 
    return template.evaluate()
      .setTitle('PBE Control - Panel Estudiante')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
  
  // 2. Caso Administrador (?page=admin)
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
// 2. FUNCIÓN include()
// ==========================================

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
// 4. FUNCIONES AUXILIARES - LIMPIEZA DE DATOS
// V01.26 CLAUDE
// ==========================================

/**
 * Limpiar objetos para serialización de google.script.run
 * 
 * EVOLUCIÓN:
 * V01.24: Convierte Date a String
 * V01.25: Formatea fechas como DD/MM/AAAA
 * V01.26: Detecta y formatea time objects correctamente
 * 
 * PROBLEMA V01.25:
 * datetime.time(8, 0) del Sheet se convierte a Date object
 * pero representa SOLO la hora, no una fecha completa
 * formatearFechaDD_MM_AAAA() le sacaba la fecha epoch "30/12/1899"
 * 
 * SOLUCIÓN V01.26:
 * Detectar si un Date es realmente un TIME VALUE
 * Extraer hora con getHours() y getMinutes() en lugar de getDate()
 * 
 * CAMPOS QUE SE LIMPIAN:
 * - Fechas (FechaReg, FechaEval, etc.) → DD/MM/AAAA
 * - Horas (HoraInicio, HoraFin) → HH:MM
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
  var mes = fecha.getMonth() + 1;
  var anio = fecha.getFullYear();
  
  dia = dia < 10 ? '0' + dia : dia;
  mes = mes < 10 ? '0' + mes : mes;
  
  return dia + '/' + mes + '/' + anio;
}

/**
 * V01.26 CLAUDE: Detectar si un Date object es realmente un TIME VALUE
 * 
 * ¿Cómo identificar?
 * datetime.time(8, 0) se serializa como Date con fecha epoch 30/12/1899
 * La clave: el año es 1899 (fecha base de Excel/Google Sheets para times)
 */
function isTimeValue(value) {
  if (!(value instanceof Date)) {
    return false;
  }
  
  var year = value.getFullYear();
  
  // Si el año es 1899 o 1900, es un time value disfrazado
  // Google Sheets usa 30/12/1899 como fecha base para times
  return (year === 1899 || year === 1900);
}

/**
 * V01.26 CLAUDE: Formatear time value a HH:MM
 */
function formatearTimeHH_MM(timeValue) {
  if (!(timeValue instanceof Date)) {
    return '';
  }
  
  try {
    var horas = timeValue.getHours();
    var minutos = timeValue.getMinutes();
    
    horas = horas < 10 ? '0' + horas : horas;
    minutos = minutos < 10 ? '0' + minutos : minutos;
    
    return horas + ':' + minutos;
  } catch(e) {
    Logger.log('Error formateando time: ' + e.toString());
    return '';
  }
}

/**
 * Limpiar un objeto individual
 * V01.26: Detecta y formatea time objects correctamente
 * V01.25: Convierte Dates a DD/MM/AAAA y preserva _rowNumber
 */
function cleanObject(obj) {
  var cleaned = {};
  
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var value = obj[key];
      
      // ✅ V01.26: Detectar time values ANTES de fechas
      if (value instanceof Date && isTimeValue(value)) {
        cleaned[key] = formatearTimeHH_MM(value);
      }
      // ✅ V01.25: Convertir Date a DD/MM/AAAA
      else if (value instanceof Date) {
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
// V01.26 CLAUDE: Time objects formateados como HH:MM
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
// FIN DE 1code.gs V01.26 CLAUDE
// ==========================================
// RESUMEN:
// - 1 Router (doGet)
// - 1 Include con procesamiento de templates anidados
// - 1 Autenticación
// - 5 Funciones auxiliares de limpieza (V01.26: +2 nuevas)
// - 31 Wrappers Student (TODOS con limpieza V01.24-26)
// - 3 Wrappers Admin (sin cambios)
// TOTAL: 42 funciones
//
// CAMBIOS V01.26 CLAUDE:
// ✅ isTimeValue(): Detecta time objects disfrazados de Date
// ✅ formatearTimeHH_MM(): Extrae hora correcta de time value
// ✅ cleanObject(): Procesa time values ANTES de fechas
// ✅ Soluciona: HoraInicio "30/12/1899" → "08:00"
// ✅ Resuelve: Horario de clases ahora muestra las clases
// ==========================================
