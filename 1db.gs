// MOD-001: ENCABEZADO [INICIO]
/*
*****************************************
PROYECTO: PBE Control
ARCHIVO: 1db.gs
VERSIÓN: 01.14
FECHA: 18/01/2026 14:48 (UTC-5)
*****************************************
*/
// MOD-001: FIN

// MOD-002: CONFIGURACIÓN GLOBAL - SPREADSHEET [INICIO]
var SS = SpreadsheetApp.openById('13bAsdOddT0INxXwjPQAsvlQg3xm-KMZnpTchzbwUw6s');
// MOD-002: FIN

// MOD-003: CONFIGURACIÓN GLOBAL - HOJAS [INICIO]
var SHEET = {
  Alumnos: SS.getSheetByName('Alumnos'),
  Clientes: SS.getSheetByName('Clientes'),
  Cursos: SS.getSheetByName('Cursos'),
  Repasos: SS.getSheetByName('Repasos'),
  Eval: SS.getSheetByName('Eval'),
  Tareas: SS.getSheetByName('Tareas'),
  Lecturas: SS.getSheetByName('Lecturas'),
  HorarioClases: SS.getSheetByName('HorarioClases'),
  HorarioSem: SS.getSheetByName('HorarioSem'),
  Opciones: SS.getSheetByName('Opciones'),
  Admin: SS.getSheetByName('Admin')
};
// MOD-003: FIN

// MOD-004: MÓDULO DB - DECLARACIÓN [INICIO]
var DB = (function() {
// MOD-004: FIN

// MOD-005: BUSCAR REGISTRO [INICIO]
/**
 * Buscar un registro en una hoja específica
 * Búsqueda case-insensitive por diseño
 */
function buscar(sheetName, columnName, value) {
  try {
    var sheet = SHEET[sheetName];
    if (!sheet) {
      return { success: false, error: 'Hoja no encontrada: ' + sheetName };
    }
    
    var data = sheet.getDataRange().getValues();
    if (data.length === 0) {
      return { success: false, error: 'Hoja vacía' };
    }
    
    var headers = data[0];
    var colIndex = headers.indexOf(columnName);
    
    if (colIndex === -1) {
      return { success: false, error: 'Columna no encontrada: ' + columnName };
    }
    
    var valueLower = String(value).trim().toLowerCase();
    
    for (var i = 1; i < data.length; i++) {
      var cellValue = String(data[i][colIndex]).trim().toLowerCase();
      
      if (cellValue === valueLower) {
        var obj = {};
        for (var j = 0; j < headers.length; j++) {
          obj[headers[j]] = data[i][j];
        }
        obj._rowNumber = i + 1;
        return { success: true, data: obj };
      }
    }
    
    return { success: false, error: 'No se encontró: ' + value };
    
  } catch(error) {
    Logger.log('Error en DB.buscar(): ' + error.toString());
    return { success: false, error: 'Error al buscar registro' };
  }
}
// MOD-005: FIN

// MOD-006: AGREGAR REGISTRO [INICIO]
/**
 * Agregar un nuevo registro a una hoja
 */
function agregar(sheetName, obj) {
  try {
    var sheet = SHEET[sheetName];
    if (!sheet) {
      return { success: false, error: 'Hoja no encontrada: ' + sheetName };
    }
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    var newRow = [];
    for (var i = 0; i < headers.length; i++) {
      newRow.push(obj[headers[i]] || '');
    }
    
    sheet.appendRow(newRow);
    
    return { success: true, message: 'Registro agregado' };
    
  } catch(error) {
    Logger.log('Error en DB.agregar(): ' + error.toString());
    return { success: false, error: 'Error al agregar registro' };
  }
}
// MOD-006: FIN

// MOD-007: ACTUALIZAR REGISTRO [INICIO]
/**
 * Actualizar un registro existente
 * Requiere obj._rowNumber obtenido de buscar()
 */
function actualizar(sheetName, obj) {
  try {
    if (!obj._rowNumber) {
      return { success: false, error: 'Falta _rowNumber en objeto' };
    }
    
    var sheet = SHEET[sheetName];
    if (!sheet) {
      return { success: false, error: 'Hoja no encontrada: ' + sheetName };
    }
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    var updatedRow = [];
    for (var i = 0; i < headers.length; i++) {
      updatedRow.push(obj[headers[i]] || '');
    }
    
    var range = sheet.getRange(obj._rowNumber, 1, 1, headers.length);
    range.setValues([updatedRow]);
    
    return { success: true, message: 'Registro actualizado' };
    
  } catch(error) {
    Logger.log('Error en DB.actualizar(): ' + error.toString());
    return { success: false, error: 'Error al actualizar registro' };
  }
}
// MOD-007: FIN

// MOD-008: ELIMINAR REGISTRO [INICIO]
/**
 * Eliminar un registro por número de fila
 */
function eliminar(sheetName, rowNumber) {
  try {
    var sheet = SHEET[sheetName];
    if (!sheet) {
      return { success: false, error: 'Hoja no encontrada: ' + sheetName };
    }
    
    sheet.deleteRow(rowNumber);
    
    return { success: true, message: 'Registro eliminado' };
    
  } catch(error) {
    Logger.log('Error en DB.eliminar(): ' + error.toString());
    return { success: false, error: 'Error al eliminar registro' };
  }
}
// MOD-008: FIN

// MOD-009: OBTENER POR ALUMNO [INICIO]
/**
 * Obtener TODOS los registros de un alumno específico
 * Uso típico: Student.obtenerCursos() llama a DB.obtenerPorAlumno("Cursos", codeAlum)
 */
function obtenerPorAlumno(sheetName, codeAlum) {
  try {
    var sheet = SHEET[sheetName];
    if (!sheet) {
      return { success: false, error: 'Hoja no encontrada: ' + sheetName };
    }
    
    var data = sheet.getDataRange().getValues();
    if (data.length === 0) {
      return { success: false, error: 'Hoja vacía' };
    }
    
    var headers = data[0];
    var colIndex = headers.indexOf('CodeAlum');
    
    if (colIndex === -1) {
      return { success: false, error: 'Columna CodeAlum no encontrada' };
    }
    
    var results = [];
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][colIndex] === codeAlum) {
        var obj = {};
        for (var j = 0; j < headers.length; j++) {
          obj[headers[j]] = data[i][j];
        }
        obj._rowNumber = i + 1;
        results.push(obj);
      }
    }
    
    return { success: true, data: results };
    
  } catch(error) {
    Logger.log('Error en DB.obtenerPorAlumno(): ' + error.toString());
    return { success: false, error: 'Error al obtener registros del alumno' };
  }
}
// MOD-009: FIN

// MOD-010: ELIMINAR POR ALUMNO [INICIO]
/**
 * Eliminar TODOS los registros de un alumno en una hoja
 * Uso: Admin.eliminarAlumno() llama a esta función para cada hoja
 */
function eliminarPorAlumno(sheetName, codeAlum) {
  try {
    var sheet = SHEET[sheetName];
    if (!sheet) {
      return { success: false, error: 'Hoja no encontrada: ' + sheetName };
    }
    
    var data = sheet.getDataRange().getValues();
    if (data.length === 0) {
      return { success: true, eliminados: 0 };
    }
    
    var headers = data[0];
    var colIndex = headers.indexOf('CodeAlum');
    
    if (colIndex === -1) {
      return { success: true, eliminados: 0 };
    }
    
    var eliminados = 0;
    
    for (var i = data.length - 1; i >= 1; i--) {
      if (data[i][colIndex] === codeAlum) {
        sheet.deleteRow(i + 1);
        eliminados++;
      }
    }
    
    return { success: true, eliminados: eliminados };
    
  } catch(error) {
    Logger.log('Error en DB.eliminarPorAlumno(): ' + error.toString());
    return { success: false, error: 'Error al eliminar registros del alumno' };
  }
}
// MOD-010: FIN

// MOD-011: EXPORTAR FUNCIONES PÚBLICAS [INICIO]
return {
  buscar: buscar,
  agregar: agregar,
  actualizar: actualizar,
  eliminar: eliminar,
  obtenerPorAlumno: obtenerPorAlumno,
  eliminarPorAlumno: eliminarPorAlumno
};
// MOD-011: FIN

// MOD-012: CIERRE MÓDULO DB [INICIO]
})();
// MOD-012: FIN

// MOD-013: CÓDIGO DE CIERRE [INICIO]
Logger.log('✅ 1db.gs v01.14 cargado');
// MOD-013: FIN

// MOD-099: NOTAS [INICIO]
/*
DESCRIPCIÓN:
Capa de acceso a datos (CRUD genérico) para Google Sheets
ÚNICA capa autorizada para leer/escribir en Google Sheets

FUNCIONES PÚBLICAS:
- buscar: Buscar registro por columna y valor (case-insensitive)
- agregar: Agregar nuevo registro a una hoja
- actualizar: Actualizar registro existente (requiere _rowNumber)
- eliminar: Eliminar registro por número de fila
- obtenerPorAlumno: Obtener todos los registros de un alumno
- eliminarPorAlumno: Eliminar todos los registros de un alumno

PRINCIPIO ARQUITECTÓNICO CRÍTICO:
DB es la ÚNICA capa que accede directamente a Google Sheets
Student y Admin NUNCA acceden a SHEET directamente

HOJAS DISPONIBLES:
Alumnos, Clientes, Cursos, Repasos, Eval, Tareas, Lecturas,
HorarioClases, HorarioSem, Opciones, Admin

CARACTERÍSTICAS:
- Todas las búsquedas son case-insensitive por diseño
- Retorna siempre formato { success, data/error }
- Funciones eliminarPorAlumno eliminan de abajo hacia arriba
- _rowNumber se incluye automáticamente en objetos retornados

DEPENDENCIAS:
- SpreadsheetApp (Google Apps Script)
- Spreadsheet ID: 13bAsdOddT0INxXwjPQAsvlQg3xm-KMZnpTchzbwUw6s

CAMBIOS V01.13 → V01.14:
- Remodulación completa según Estándar CodeWorkShop v4.0
- Estructura modular clara y ordenada
- Comentarios consolidados en MOD-099
*/
// MOD-099: FIN
