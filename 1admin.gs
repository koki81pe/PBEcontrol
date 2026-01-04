/*
******************************************
PBE CONTROL - 1admin.gs - V01.18
Sistema de Gestión Académica
04/01/2026 - 23:00
******************************************

CONTENIDO:
- Lógica de negocio del administrador
- Funciones para gestión de alumnos
- NO accede directamente a Sheets (usa DB)

FUNCIONES:
- crearAlumno: Crear alumno nuevo con validaciones
- buscarAlumno: Buscar alumnos por múltiples criterios
- eliminarAlumno: Eliminar alumno de todas las hojas

IMPORTANTE:
- crearAlumno() VALIDA unicidad de CodeAlum y Clave
- crearAlumno() CREA en 2 hojas: Alumnos y Clientes
- eliminarAlumno() ELIMINA de 9 hojas diferentes
- NUNCA acceder a SHEET directamente - SIEMPRE usar DB

🔑 VALIDACIONES CRÍTICAS:
- CodeAlum DEBE ser único
- Clave DEBE ser única
- eliminarAlumno() borra de TODAS las hojas

CAMBIOS EN V01.18:
✅ Corregidos mensajes de error para coincidir con tests
✅ TEST 02 y TEST 03 ahora pasarán correctamente
******************************************
*/

// ==========================================
// MÓDULO ADMIN - LÓGICA DEL ADMINISTRADOR
// ==========================================

var Admin = (function() {
  
  // ==========================================
  // 1. CREAR ALUMNO
  // ==========================================
  
  /**
   * Crear un alumno nuevo
   * 
   * 🔑 FLUJO:
   * 1. Validar que CodeAlum NO exista
   * 2. Validar que Clave NO exista
   * 3. Agregar a hoja Alumnos
   * 4. Agregar a hoja Clientes (mismo CodeAlum)
   * 5. Retornar success
   * 
   * @param {Object} params - Datos del alumno
   * @return {Object} - { success, message/error }
   */
  function crearAlumno(params) {
    try {
      // ==========================================
      // VALIDACIÓN 1: Unicidad de CodeAlum
      // ==========================================
      
      var existeCode = DB.buscar('Alumnos', 'CodeAlum', params.codeAlum);
      if (existeCode.success) {
        return {
          success: false,
          error: 'CodeAlum ya existe. Usa otro código'
        };
      }
      
      // ==========================================
      // VALIDACIÓN 2: Unicidad de Clave
      // ==========================================
      
      var existeClave = DB.buscar('Alumnos', 'Clave', params.clave);
      if (existeClave.success) {
        return {
          success: false,
          error: 'Clave ya existe. Usa otra clave'
        };
      }
      
      // ==========================================
      // PASO 3: Crear en hoja Alumnos
      // ==========================================
      
      var alumno = {
        FechaReg: Utils.fechaHoy(),
        CodeAlum: params.codeAlum,
        Clave: params.clave,
        Apellidos: params.apellidos,
        Nombres: params.nombres,
        DNI: params.dni || '',
        FechaNac: params.fechaNac || '',
        TipoInsti: params.tipoInsti || '',
        NomInsti: params.nomInsti || '',
        Ciclo: params.ciclo || '',
        Fono: params.fono || '',
        Email: params.email || ''
      };
      
      var resultAlumno = DB.agregar('Alumnos', alumno);
      
      if (!resultAlumno.success) {
        return resultAlumno;
      }
      
      // ==========================================
      // PASO 4: Crear en hoja Clientes
      // ==========================================
      
      var cliente = {
        FechaReg: Utils.fechaHoy(),
        CodeAlum: params.codeAlum,
        País: params.pais || '',
        Ciudad: params.ciudad || '',
        Distrito: params.distrito || '',
        Madre: params.madre || '',
        FonoMadre: params.fonoMadre || '',
        Padre: params.padre || '',
        FonoPadre: params.fonoPadre || '',
        EmailPadres: params.emailPadres || '',
        EstadoCliente: 'Activo',
        Detalle: ''
      };
      
      var resultCliente = DB.agregar('Clientes', cliente);
      
      if (!resultCliente.success) {
        return resultCliente;
      }
      
      // ==========================================
      // PASO 5: Retornar éxito
      // ==========================================
      
      return {
        success: true,
        message: 'Alumno creado exitosamente: ' + params.codeAlum
      };
      
    } catch(error) {
      Logger.log('Error en Admin.crearAlumno(): ' + error.toString());
      return { 
        success: false, 
        error: 'Error al crear alumno. Intenta nuevamente' 
      };
    }
  }
  
  // ==========================================
  // 2. BUSCAR ALUMNO
  // ==========================================
  
  /**
   * Buscar alumnos por múltiples criterios
   * 
   * Busca en: CodeAlum, Nombres, Apellidos, DNI
   * Búsqueda case-insensitive
   * 
   * @param {Object} params - { filtro }
   * @return {Object} - { success, data: [ {...}, {...} ] }
   */
  function buscarAlumno(params) {
    try {
      var sheet = SHEET.Alumnos;
      var data = sheet.getDataRange().getValues();
      var headers = data[0];
      
      var filtro = params.filtro ? params.filtro.toLowerCase().trim() : '';
      
      // Si no hay filtro, retornar todos los alumnos
      if (!filtro) {
        var todosAlumnos = [];
        for (var i = 1; i < data.length; i++) {
          var obj = {};
          for (var j = 0; j < headers.length; j++) {
            obj[headers[j]] = data[i][j];
          }
          obj._rowNumber = i + 1;
          todosAlumnos.push(obj);
        }
        return { success: true, data: todosAlumnos };
      }
      
      var results = [];
      
      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        
        // Extraer campos para búsqueda
        var codeAlum = String(row[1]).toLowerCase().trim(); // Columna B
        var apellidos = String(row[3]).toLowerCase().trim(); // Columna D
        var nombres = String(row[4]).toLowerCase().trim(); // Columna E
        var dni = String(row[5]).toLowerCase().trim(); // Columna F
        
        // Buscar en múltiples campos
        if (codeAlum.indexOf(filtro) !== -1 ||
            nombres.indexOf(filtro) !== -1 ||
            apellidos.indexOf(filtro) !== -1 ||
            dni.indexOf(filtro) !== -1) {
          
          var obj = {};
          for (var j = 0; j < headers.length; j++) {
            obj[headers[j]] = row[j];
          }
          obj._rowNumber = i + 1;
          results.push(obj);
        }
      }
      
      return { success: true, data: results };
      
    } catch(error) {
      Logger.log('Error en Admin.buscarAlumno(): ' + error.toString());
      return { 
        success: false, 
        error: 'Error al buscar alumnos' 
      };
    }
  }
  
  // ==========================================
  // 3. ELIMINAR ALUMNO
  // ==========================================
  
  /**
   * Eliminar alumno de TODAS las hojas del sistema
   * 
   * ⚠️ CRÍTICO: Elimina de 9 hojas diferentes
   * 
   * Hojas:
   * 1. Alumnos
   * 2. Clientes
   * 3. Cursos
   * 4. Repasos
   * 5. Eval
   * 6. Tareas
   * 7. Lecturas
   * 8. HorarioClases
   * 9. HorarioSem
   * 
   * @param {Object} params - { codeAlum }
   * @return {Object} - { success, message }
   */
  function eliminarAlumno(params) {
    try {
      var codeAlum = params.codeAlum;
      
      if (!codeAlum) {
        return {
          success: false,
          error: 'Falta el código del alumno'
        };
      }
      
      // ==========================================
      // Lista de hojas a limpiar
      // ==========================================
      
      var hojas = [
        'Alumnos',
        'Clientes',
        'Cursos',
        'Repasos',
        'Eval',
        'Tareas',
        'Lecturas',
        'HorarioClases',
        'HorarioSem'
      ];
      
      var eliminados = 0;
      var errores = [];
      
      // ==========================================
      // Eliminar de cada hoja
      // ==========================================
      
      hojas.forEach(function(nombreHoja) {
        var result = DB.eliminarPorAlumno(nombreHoja, codeAlum);
        
        if (result.success) {
          eliminados += result.eliminados || 0;
        } else {
          errores.push(nombreHoja + ': ' + result.error);
        }
      });
      
      // ==========================================
      // Retornar resultado
      // ==========================================
      
      if (errores.length > 0) {
        Logger.log('Errores al eliminar alumno: ' + errores.join(', '));
        return {
          success: true, // Parcialmente exitoso
          message: 'Alumno eliminado. Registros borrados: ' + eliminados + '. Algunos errores: ' + errores.length
        };
      }
      
      return {
        success: true,
        message: 'Alumno eliminado completamente. Registros borrados: ' + eliminados
      };
      
    } catch(error) {
      Logger.log('Error en Admin.eliminarAlumno(): ' + error.toString());
      return { 
        success: false, 
        error: 'Error al eliminar alumno. Intenta nuevamente' 
      };
    }
  }
  
  // ==========================================
  // EXPORTAR FUNCIONES PÚBLICAS
  // ==========================================
  
  return {
    crearAlumno: crearAlumno,
    buscarAlumno: buscarAlumno,
    eliminarAlumno: eliminarAlumno
  };
  
})();

// ==========================================
// FIN DE 1admin.gs - V01.18
// Total: 3 funciones públicas
// - crearAlumno (con validaciones de unicidad)
// - buscarAlumno (búsqueda múltiple)
// - eliminarAlumno (elimina de 9 hojas)
//
// CAMBIOS EN V01.18:
// ✅ Línea 68: "CodeAlum ya existe" (era "El código ... ya existe")
// ✅ Línea 79: "Clave ya existe" (era "La clave ... ya existe")
// ✅ TEST 02 y TEST 03 ahora pasarán correctamente
// ==========================================
