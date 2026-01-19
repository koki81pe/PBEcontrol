// MOD-001: ENCABEZADO [INICIO]
/*
******************************************
PROYECTO: PBE Control
ARCHIVO: 1code.gs
VERSIÓN: 01.28
FECHA: 10/01/2026 18:30 (UTC-5)
******************************************
*/
// MOD-001: FIN

// MOD-002: ROUTER PRINCIPAL [INICIO]
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
// MOD-002: FIN

// MOD-003: INCLUDE DINÁMICO [INICIO]
function include(filename) {
  var template = HtmlService.createTemplateFromFile(filename);
  return template.evaluate().getContent();
}
// MOD-003: FIN

// MOD-004: AUTENTICACIÓN [INICIO]
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
// MOD-004: FIN

// MOD-005: LIMPIEZA DE DATOS [INICIO]
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

function isTimeValue(value) {
  if (!(value instanceof Date)) {
    return false;
  }
  
  var year = value.getFullYear();
  return (year === 1899 || year === 1900);
}

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
// MOD-005: FIN

// MOD-006: WRAPPERS CURSOS [INICIO]
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
// MOD-006: FIN

// MOD-007: WRAPPERS REPASOS [INICIO]
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
// MOD-007: FIN

// MOD-008: WRAPPERS EVALUACIONES [INICIO]
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
// MOD-008: FIN

// MOD-009: WRAPPERS TAREAS [INICIO]
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
// MOD-009: FIN

// MOD-010: WRAPPERS LECTURAS [INICIO]
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
// MOD-010: FIN

// MOD-011: WRAPPERS HORARIO CLASES [INICIO]
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
// MOD-011: FIN

// MOD-012: WRAPPERS HORARIO SEMANAL [INICIO]
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
// MOD-012: FIN

// MOD-013: WRAPPERS CONFIG SEMANAS [INICIO]
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
// MOD-013: FIN

// MOD-014: WRAPPERS GESTIÓN SEMANAS [INICIO]
function studentObtenerSemanas(params) {
  var result = Student.obtenerSemanas(params.codeAlum);
  return cleanDataForSerialization(result);
}

function studentCrearSemana(params) {
  var result = Student.crearSemana(params);
  return cleanDataForSerialization(result);
}

function studentEliminarSemana(params) {
  var result = Student.eliminarSemana(params);
  return cleanDataForSerialization(result);
}
// MOD-014: FIN

// MOD-015: WRAPPERS NOTAS [INICIO]
function studentObtenerNotasPorCurso(params) { 
  var result = Student.obtenerNotasPorCurso(params);
  return cleanDataForSerialization(result);
}

function studentObtenerResumenNotas(params) { 
  var result = Student.obtenerResumenNotas(params);
  return cleanDataForSerialization(result);
}
// MOD-015: FIN

// MOD-016: WRAPPERS DEBERES [INICIO]
function studentObtenerTodosDeberes(params) { 
  var result = Student.obtenerTodosDeberes(params);
  return cleanDataForSerialization(result);
}

function studentObtenerDeberesPorTipo(params) { 
  var result = Student.obtenerDeberesPorTipo(params);
  return cleanDataForSerialization(result);
}
// MOD-016: FIN

// MOD-017: WRAPPERS ADMIN [INICIO]
function adminCrearAlumno(params) { 
  return Admin.crearAlumno(params); 
}

function adminBuscarAlumno(params) { 
  return Admin.buscarAlumno(params); 
}

function adminEliminarAlumno(params) { 
  return Admin.eliminarAlumno(params); 
}
// MOD-017: FIN

// MOD-018: NOTAS [INICIO]
/*
CAMBIOS V01.28 CLAUDE+ fix mod coment:
- Se corrigió etiquetado de comentarios para identificar los MOD el 17/01/2026
✅ Agregado MOD-014: Gestión Semanas (3 wrappers)
  - studentObtenerSemanas()
  - studentCrearSemana()
  - studentEliminarSemana()
✅ Soporte completo para hoja Semanas
✅ Total: 38 wrappers Student + 3 Admin = 41 wrappers

MÓDULOS:
MOD-001: Encabezado
MOD-002: Router Principal (1 función)
MOD-003: Include dinámico (1 función)
MOD-004: Autenticación (1 función)
MOD-005: Limpieza de datos (5 funciones)
MOD-006: Wrappers Cursos (4)
MOD-007: Wrappers Repasos (4)
MOD-008: Wrappers Evaluaciones (4)
MOD-009: Wrappers Tareas (4)
MOD-010: Wrappers Lecturas (4)
MOD-011: Wrappers HorarioClases (4)
MOD-012: Wrappers HorarioSem (4)
MOD-013: Wrappers Config Semanas (4)
MOD-014: Wrappers Gestión Semanas (3) ← NUEVO V01.28
MOD-015: Wrappers Notas (2)
MOD-016: Wrappers Deberes (2)
MOD-017: Wrappers Admin (3)
MOD-018: Notas

TOTAL FUNCIONES: 49
- Router y utilidades: 8
- Wrappers Student: 38
- Wrappers Admin: 3

LIMPIEZA AUTOMÁTICA:
Todos los wrappers Student aplican cleanDataForSerialization():
1. Detecta time objects (años 1899/1900)
2. Formatea times como "HH:MM"
3. Formatea fechas como "DD/MM/AAAA"
4. Convierte null/undefined a string vacío

ADVERTENCIAS CRÍTICAS:
● MOD-005: isTimeValue() procesa times ANTES de fechas
● MOD-014: obtenerSemanas() recibe codeAlum directo, no params completo
*/
// MOD-018: FIN
