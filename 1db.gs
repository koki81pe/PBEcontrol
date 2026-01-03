/*
******************************************
PBE CONTROL - 1db.gs - V01.13
Sistema de Gestión Académica
03/01/2026 - 18:00
******************************************

CONTENIDO:
- Capa de acceso a datos (CRUD genérico)
- ÚNICA capa que lee/escribe en Google Sheets
- Funciones: buscar, agregar, actualizar, eliminar, obtenerPorAlumno

IMPORTANTE:
- DB es la ÚNICA capa que accede directamente a Sheets
- Student y Admin NUNCA acceden a SHEET directamente
- Todas las búsquedas son case-insensitive por diseño
- Retorna siempre { success, data/error }

🔑 PRINCIPIO: "DB es la ÚNICA capa que lee/escribe en Google Sheets"
******************************************
*/

// ==========================================
// CONFIGURACIÓN GLOBAL
// ==========================================

var SS = SpreadsheetApp.openById('13bAsdOddT0INxXwjPQAsvlQg3xm-KMZnpTchzbwUw6s');

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

// ==========================================
// MÓDULO DB - CAPA DE ACCESO A DATOS
// ==========================================

var DB = (function() {
  
  // ==========================================
  // 1. BUSCAR - Buscar registro por columna y valor
  // ==========================================
  
  /**
   * Buscar un registro en una hoja específica
   * 
   * 🔑 IMPORTANTE: Búsqueda case-insensitive por diseño
   * 
   * @param {string} sheetName - Nombre de la hoja
   * @param {string} columnName - Nombre de la columna
   * @param {string|number} value - Valor a buscar
   * @return {Object} - { success, data: { ...campos, _rowNumber } }
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
      
      // Búsqueda case-insensitive con trim
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
  
  // ==========================================
  // 2. AGREGAR - Agregar nuevo registro
  // ==========================================
  
  /**
   * Agregar un nuevo registro a una hoja
   * 
   * @param {string} sheetName - Nombre de la hoja
   * @param {Object} obj - Objeto con datos a agregar
   * @return {Object} - { success, message }
   */
  function agregar(sheetName, obj) {
    try {
      var sheet = SHEET[sheetName];
      if (!sheet) {
        return { success: false, error: 'Hoja no encontrada: ' + sheetName };
      }
      
      var data = sheet.getDataRange().getValues();
      var headers = data[0];
      
      // Construir fila en el orden de los headers
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
  
  // ==========================================
  // 3. ACTUALIZAR - Actualizar registro existente
  // ==========================================
  
  /**
   * Actualizar un registro existente
   * 
   * 🔑 IMPORTANTE: Requiere obj._rowNumber obtenido de buscar()
   * 
   * @param {string} sheetName - Nombre de la hoja
   * @param {Object} obj - Objeto con datos actualizados (incluye _rowNumber)
   * @return {Object} - { success, message }
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
      
      // Construir fila actualizada
      var updatedRow = [];
      for (var i = 0; i < headers.length; i++) {
        updatedRow.push(obj[headers[i]] || '');
      }
      
      // Actualizar en el Sheet
      var range = sheet.getRange(obj._rowNumber, 1, 1, headers.length);
      range.setValues([updatedRow]);
      
      return { success: true, message: 'Registro actualizado' };
      
    } catch(error) {
      Logger.log('Error en DB.actualizar(): ' + error.toString());
      return { success: false, error: 'Error al actualizar registro' };
    }
  }
  
  // ==========================================
  // 4. ELIMINAR - Eliminar registro
  // ==========================================
  
  /**
   * Eliminar un registro por número de fila
   * 
   * @param {string} sheetName - Nombre de la hoja
   * @param {number} rowNumber - Número de fila a eliminar (1-indexed)
   * @return {Object} - { success, message }
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
  
  // ==========================================
  // 5. OBTENER POR ALUMNO - Obtener todos los registros de un alumno
  // ==========================================
  
  /**
   * Obtener TODOS los registros de un alumno específico
   * 
   * 🔑 USO TÍPICO: Student.obtenerCursos() llama a DB.obtenerPorAlumno("Cursos", codeAlum)
   * 
   * @param {string} sheetName - Nombre de la hoja
   * @param {string} codeAlum - Código del alumno
   * @return {Object} - { success, data: [ {...}, {...} ] }
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
  
  // ==========================================
  // 6. ELIMINAR POR ALUMNO - Eliminar todos los registros de un alumno
  // ==========================================
  
  /**
   * Eliminar TODOS los registros de un alumno en una hoja
   * 
   * 🔑 USO: Admin.eliminarAlumno() llama a esta función para cada hoja
   * 
   * @param {string} sheetName - Nombre de la hoja
   * @param {string} codeAlum - Código del alumno
   * @return {Object} - { success, eliminados: number }
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
      
      // Eliminar de abajo hacia arriba para no desplazar índices
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
  
  // ==========================================
  // EXPORTAR FUNCIONES PÚBLICAS
  // ==========================================
  
  return {
    buscar: buscar,
    agregar: agregar,
    actualizar: actualizar,
    eliminar: eliminar,
    obtenerPorAlumno: obtenerPorAlumno,
    eliminarPorAlumno: eliminarPorAlumno
  };
  
})();

// ==========================================
// FIN DE 1db.gs
// Total: 6 funciones públicas
// - buscar, agregar, actualizar, eliminar
// - obtenerPorAlumno, eliminarPorAlumno
// ==========================================
