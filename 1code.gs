/*
******************************************
PROYECTO: PBE Control
ARCHIVO: 1code.gs
VERSIÓN: 01.27 CLAUDE
FECHA: 09/01/2026 (UTC-5)
******************************************

DESCRIPCIÓN:
Router principal, include(), autenticación y wrappers para google.script.run.
Limpieza automática de Date/Time objects para serialización correcta.

MÓDULOS:
MOD-001: Router Principal (doGet)
MOD-002: Include dinámico
MOD-003: Autenticación
MOD-004: Funciones auxiliares de limpieza
MOD-005: Wrappers Student - Cursos (4)
MOD-006: Wrappers Student - Repasos (4)
MOD-007: Wrappers Student - Evaluaciones (4)
MOD-008: Wrappers Student - Tareas (4)
MOD-009: Wrappers Student - Lecturas (4)
MOD-010: Wrappers Student - HorarioClases (4)
MOD-011: Wrappers Student - HorarioSem (4)
MOD-012: Wrappers Student - Config Semanas (4) ← NUEVO V01.27
MOD-013: Wrappers Student - Notas (2)
MOD-014: Wrappers Student - Deberes (2)
MOD-015: Wrappers Admin (3)
MOD-016: Notas finales

CAMBIOS V01.27 CLAUDE:
✅ Aplicado estándar CodeWorkshop completo
✅ Agregado MOD-012: Config Semanas (4 wrappers)
  - studentObtenerConfigSemana()
  - studentGuardarConfigSemana()
  - studentCopiarSemana()
  - studentLimpiarSemana()
✅ Soporte completo para HorarioSemanal V01.22
✅ Total: 35 wrappers Student + 3 Admin = 38 wrappers

CAMBIOS V01.26 CLAUDE:
✅ FIX CRÍTICO: Detección y formateo de datetime.time objects
✅ isTimeValue() detecta time objects disfrazados de Date
✅ formatearTimeHH_MM() extrae hora correcta
✅ Resultado: HoraInicio "30/12/1899" → "08:00"

CAMBIOS V01.25 CLAUDE:
✅ FIX CRÍTICO: Fechas formateadas a DD/MM/AAAA
✅ formatearFechaDD_MM_AAAA() para formato corto
✅ Resuelve filtros de fecha que fallaban

******************************************
*/

// MOD-001: ROUTER PRINCIPAL [INICIO]
/**
 * Router principal del sistema
 * Maneja 3 casos: Login (base), Panel Student, Panel Admin
 */
function doGet(e) {
  var page = e.parameter.page;
  var scriptUrl = ScriptApp.getService().getUrl(); 
  
  if (page === 'student') {
    var template = HtmlService.createTemplateFromFile('3panelstudent');
    template.scriptUrl = scriptUrl; 
    return template.evaluate()
      .setTitle('PBE Control - Panel Estudiante')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
  
  if (page === 'admin') {
    var template = HtmlService.createTemplateFromFile('3paneladmin');
    template.scriptUrl = scriptUrl;
    return template.evaluate()
      .setTitle('PBE Control - Panel Admin')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
  
  var template = HtmlService.createTemplateFromFile('3index');
  template.scriptUrl = scriptUrl; 
  
  return template.evaluate()
    .setTitle('PBE Control - Acceso')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
// MOD-001: FIN

// MOD-002: INCLUDE DINÁMICO [INICIO]
/**
 * Inclusión dinámica de HTML
 * Indispensable para las pestañas
 */
function include(filename) {
  var template = HtmlService.createTemplateFromFile(filename);
  return template.evaluate().getContent();
}
// MOD-002: FIN

// MOD-003: AUTENTICACIÓN [INICIO]
/**
 * Autenticación unificada Admin/Estudiante
 */
function autenticar(params) {
  try {
    var clave = params.clave;
    if (!clave) return { success: false, error: 'Ingresa tu clave de acceso' };
    
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
// MOD-003: FIN

// MOD-004: FUNCIONES AUXILIARES DE LIMPIEZA [INICIO]
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
 */
function cleanDataForSerialization(result) {
  if (!result || !result.success || !result.data) {
    return result;
  }
  
  if (Array.isArray(result.data)) {
    result.data = result.data.map(function(item) {
      return cleanObject(item);
    });
  } else {
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
 * datetime.time(8, 0) se serializa como Date con fecha epoch 30/12/1899
 * La clave: el año es 1899 o 1900 (fecha base de Excel/Sheets para times)
 */
function isTimeValue(value) {
  if (!(value instanceof Date)) {
    return false;
  }
  
  var year = value.getFullYear();
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
      
      if (value instanceof Date && isTimeValue(value)) {
        cleaned[key] = formatearTimeHH_MM(value);
      }
      else if (value instanceof Date) {
        cleaned[key] = formatearFechaDD_MM_AAAA(value);
      } 
      else if (value === null || value === undefined) {
        cleaned[key] = '';
      }
      else {
        cleaned[key] = value;
      }
    }
  }
  
  return cleaned;
}
// MOD-004: FIN

// MOD-005: WRAPPERS STUDENT - CURSOS [INICIO]
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
// MOD-005: FIN

// MOD-006: WRAPPERS STUDENT - REPASOS [INICIO]
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
// MOD-006: FIN

// MOD-007: WRAPPERS STUDENT - EVALUACIONES [INICIO]
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
// MOD-007: FIN

// MOD-008: WRAPPERS STUDENT - TAREAS [INICIO]
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
// MOD-008: FIN

// MOD-009: WRAPPERS STUDENT - LECTURAS [INICIO]
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
// MOD-009: FIN

// MOD-010: WRAPPERS STUDENT - HORARIO CLASES [INICIO]
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
// MOD-010: FIN

// MOD-011: WRAPPERS STUDENT - HORARIO SEMANAL [INICIO]
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
// MOD-011: FIN

// MOD-012: WRAPPERS STUDENT - CONFIGURACIÓN SEMANAS [INICIO]
/**
 * V01.27 CLAUDE: Wrappers para gestión de semanas
 * Soporte completo para HorarioSemanal V01.22
 */
function studentObtenerConfigSemana(params) {
  var result = Student.obtenerConfigSemana(params);
  return cleanDataForSerialization(result);
}

function studentGuardarConfigSemana(params) {
  var result = Student.guardarConfigSemana(params);
  return cleanDataForSerialization(result);
}

function studentCopiarSemana(params) {
  var result = Student.copiarSemana(params);
  return cleanDataForSerialization(result);
}

function studentLimpiarSemana(params) {
  var result = Student.limpiarSemana(params);
  return cleanDataForSerialization(result);
}
// MOD-012: FIN

// MOD-013: WRAPPERS STUDENT - NOTAS [INICIO]
function studentObtenerNotasPorCurso(params) { 
  var result = Student.obtenerNotasPorCurso(params);
  return cleanDataForSerialization(result);
}

function studentObtenerResumenNotas(params) { 
  var result = Student.obtenerResumenNotas(params);
  return cleanDataForSerialization(result);
}
// MOD-013: FIN

// MOD-014: WRAPPERS STUDENT - DEBERES [INICIO]
function studentObtenerTodosDeberes(params) { 
  var result = Student.obtenerTodosDeberes(params);
  return cleanDataForSerialization(result);
}

function studentObtenerDeberesPorTipo(params) { 
  var result = Student.obtenerDeberesPorTipo(params);
  return cleanDataForSerialization(result);
}
// MOD-014: FIN

// MOD-015: WRAPPERS ADMIN [INICIO]
function adminCrearAlumno(params) { 
  return Admin.crearAlumno(params); 
}

function adminBuscarAlumno(params) { 
  return Admin.buscarAlumno(params); 
}

function adminEliminarAlumno(params) { 
  return Admin.eliminarAlumno(params); 
}
// MOD-015: FIN

// MOD-016: NOTAS [INICIO]
/*
DESCRIPCIÓN:
Router principal del sistema PBE Control con wrappers para
serialización correcta de datos hacia el frontend.

DEPENDENCIAS:
● MOD-005 a MOD-014: Requieren módulo Student funcional
● MOD-015: Requiere módulo Admin funcional
● MOD-004: Funciones de limpieza críticas para Date/Time

MÓDULOS:
MOD-001: Router Principal (1 función)
MOD-002: Include dinámico (1 función)
MOD-003: Autenticación (1 función)
MOD-004: Limpieza de datos (5 funciones)
MOD-005 a MOD-014: Wrappers Student (35 funciones)
MOD-015: Wrappers Admin (3 funciones)
MOD-016: Notas

TOTAL FUNCIONES: 46
- Router y utilidades: 8
- Wrappers Student: 35
- Wrappers Admin: 3

LIMPIEZA AUTOMÁTICA:
Todos los wrappers Student aplican cleanDataForSerialization():
1. Detecta time objects (años 1899/1900)
2. Formatea times como "HH:MM"
3. Formatea fechas como "DD/MM/AAAA"
4. Convierte null/undefined a string vacío

CAMPOS QUE SE LIMPIAN:
- FechaReg, FechaEval, FechaClase, etc. → DD/MM/AAAA
- HoraInicio, HoraFin → HH:MM
- Valores null/undefined → ""

ADVERTENCIAS:
● MOD-004: isTimeValue() crítico para detectar time objects
● MOD-004: Procesar time values ANTES de fechas en cleanObject()
● MOD-012: Wrappers nuevos V01.27 para HorarioSemanal

PRÓXIMAS MEJORAS:
● Agregar caché de datos frecuentes
● Implementar compresión para arrays grandes
● Agregar logging de errores de serialización
*/
// MOD-016: FIN
