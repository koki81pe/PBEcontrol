// MOD-001: ENCABEZADO [INICIO]
/*
*****************************************
PROYECTO: PBE Control
ARCHIVO: 1admin.gs
VERSIÓN: 01.19
FECHA: 18/01/2026 14:40 (UTC-5)
*****************************************
*/
// MOD-001: FIN

// MOD-002: MÓDULO ADMIN - DECLARACIÓN [INICIO]
var Admin = (function() {
// MOD-002: FIN

// MOD-003: CREAR ALUMNO [INICIO]
/**
 * Crear un alumno nuevo
 * Valida unicidad de CodeAlum y Clave
 * Agrega a hojas Alumnos y Clientes
 */
function crearAlumno(params) {
  try {
    // Validación 1: Unicidad de CodeAlum
    var existeCode = DB.buscar('Alumnos', 'CodeAlum', params.codeAlum);
    if (existeCode.success) {
      return {
        success: false,
        error: 'CodeAlum ya existe. Usa otro código'
      };
    }
    
    // Validación 2: Unicidad de Clave
    var existeClave = DB.buscar('Alumnos', 'Clave', params.clave);
    if (existeClave.success) {
      return {
        success: false,
        error: 'Clave ya existe. Usa otra clave'
      };
    }
    
    // Crear en hoja Alumnos
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
    
    // Crear en hoja Clientes
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
// MOD-003: FIN

// MOD-004: BUSCAR ALUMNO [INICIO]
/**
 * Buscar alumnos por múltiples criterios
 * Busca en: CodeAlum, Nombres, Apellidos, DNI
 * Búsqueda case-insensitive
 */
function buscarAlumno(params) {
  try {
    var sheet = SHEET.Alumnos;
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    var filtro = params.filtro ? params.filtro.toLowerCase().trim() : '';
    
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
      
      var codeAlum = String(row[1]).toLowerCase().trim();
      var apellidos = String(row[3]).toLowerCase().trim();
      var nombres = String(row[4]).toLowerCase().trim();
      var dni = String(row[5]).toLowerCase().trim();
      
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
// MOD-004: FIN

// MOD-005: ELIMINAR ALUMNO [INICIO]
/**
 * Eliminar alumno de TODAS las hojas del sistema
 * Elimina de 9 hojas diferentes
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
    
    hojas.forEach(function(nombreHoja) {
      var result = DB.eliminarPorAlumno(nombreHoja, codeAlum);
      
      if (result.success) {
        eliminados += result.eliminados || 0;
      } else {
        errores.push(nombreHoja + ': ' + result.error);
      }
    });
    
    if (errores.length > 0) {
      Logger.log('Errores al eliminar alumno: ' + errores.join(', '));
      return {
        success: true,
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
// MOD-005: FIN

// MOD-006: EXPORTAR FUNCIONES PÚBLICAS [INICIO]
return {
  crearAlumno: crearAlumno,
  buscarAlumno: buscarAlumno,
  eliminarAlumno: eliminarAlumno
};
// MOD-006: FIN

// MOD-007: CIERRE MÓDULO ADMIN [INICIO]
})();
// MOD-007: FIN

// MOD-008: CÓDIGO DE CIERRE [INICIO]
Logger.log('✅ 1admin.gs v01.19 cargado');
// MOD-008: FIN

// MOD-099: NOTAS [INICIO]
/*
DESCRIPCIÓN:
Sistema de Gestión Académica - Módulo Administrador
Lógica de negocio para gestión de alumnos

FUNCIONES PÚBLICAS:
- crearAlumno: Crear alumno nuevo con validaciones de unicidad
- buscarAlumno: Buscar alumnos por múltiples criterios
- eliminarAlumno: Eliminar alumno de todas las hojas del sistema

DEPENDENCIAS:
- DB: Módulo de acceso a base de datos
- Utils: Funciones utilitarias (fechaHoy)
- SHEET: Objeto global con referencias a hojas

VALIDACIONES CRÍTICAS:
- crearAlumno valida que CodeAlum sea único
- crearAlumno valida que Clave sea única
- crearAlumno crea en 2 hojas: Alumnos y Clientes
- eliminarAlumno elimina de 9 hojas diferentes

HOJAS AFECTADAS POR ELIMINACIÓN:
Alumnos, Clientes, Cursos, Repasos, Eval, Tareas, Lecturas, HorarioClases, HorarioSem

ADVERTENCIAS:
- NUNCA acceder a SHEET directamente, SIEMPRE usar DB
- Mensajes de error corregidos en v01.18 para tests
- eliminarAlumno borra de TODAS las hojas relacionadas

CAMBIOS V01.18 → V01.19:
- Remodulación completa según Estándar CodeWorkShop v4.0
- Comentarios excesivos movidos a MOD-099
- Estructura modular clara y ordenada
*/
// MOD-099: FIN
