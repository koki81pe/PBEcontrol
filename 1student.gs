/*
******************************************
PROYECTO: PBE Control
ARCHIVO: 1student.gs
VERSIÓN: 01.17 CLAUDE
FECHA: 10/01/2026 01:15 (UTC-5)
******************************************

DESCRIPCIÓN:
Lógica de negocio del estudiante. Funciones para panel del estudiante.
NO accede directamente a Sheets, usa módulo DB (excepto MOD-009).

MÓDULOS:
MOD-001: Inicialización Student
MOD-002: Cursos (4 funciones)
MOD-003: Repasos (4 funciones)
MOD-004: Evaluaciones (4 funciones)
MOD-005: Tareas (4 funciones)
MOD-006: Lecturas (4 funciones)
MOD-007: HorarioClases (4 funciones)
MOD-008: HorarioSem (5 funciones)
MOD-009: Configuración Semanas (4 funciones) ← CORREGIDO V01.17
MOD-010: Notas (2 funciones)
MOD-011: Deberes (2 funciones)
MOD-012: Exportación pública
MOD-013: Notas finales

CAMBIOS V01.17 CLAUDE:
✅ FIX CRÍTICO: obtenerConfigSemana() y guardarConfigSemana()
✅ Problema: DB.buscar() no funcionaba con sheet Fechas
✅ Solución: Acceso directo a sheet con getSheetByName()
✅ Ahora detecta correctamente si existe configuración

******************************************
*/

// MOD-001: INICIALIZACIÓN STUDENT [INICIO]
var Student = (function() {
// MOD-001: FIN
  
// MOD-002: CURSOS [INICIO]
/**
 * Obtener todos los cursos del estudiante
 */
function obtenerCursos(params) {
  try {
    var codeAlum = params.codeAlum;
    return DB.obtenerPorAlumno('Cursos', codeAlum);
  } catch(error) {
    Logger.log('Error en Student.obtenerCursos(): ' + error.toString());
    return { success: false, error: 'Error al obtener cursos' };
  }
}

/**
 * Agregar un curso nuevo
 * ⚠️ VALIDACIÓN: Curso NO puede duplicarse para un alumno
 */
function agregarCurso(params) {
  try {
    var existentes = DB.obtenerPorAlumno('Cursos', params.codeAlum);
    
    if (existentes.success) {
      for (var i = 0; i < existentes.data.length; i++) {
        if (existentes.data[i].Curso === params.curso) {
          return {
            success: false,
            error: 'El curso ' + params.curso + ' ya existe. Usa otro nombre corto'
          };
        }
      }
    }
    
    var curso = {
      FechaReg: Utils.fechaHoy(),
      CodeAlum: params.codeAlum,
      Curso: params.curso,
      Completo: params.completo,
      Color: params.color || '#FF5733'
    };
    
    return DB.agregar('Cursos', curso);
  } catch(error) {
    Logger.log('Error en Student.agregarCurso(): ' + error.toString());
    return { success: false, error: 'Error al agregar curso' };
  }
}

/**
 * Actualizar un curso existente
 */
function actualizarCurso(params) {
  try {
    var result = DB.buscar('Cursos', 'CodeAlum', params.codeAlum);
    if (!result.success) {
      return { success: false, error: 'Curso no encontrado' };
    }
    
    var curso = result.data;
    curso.Curso = params.curso || curso.Curso;
    curso.Completo = params.completo || curso.Completo;
    curso.Color = params.color || curso.Color;
    
    return DB.actualizar('Cursos', curso);
  } catch(error) {
    Logger.log('Error en Student.actualizarCurso(): ' + error.toString());
    return { success: false, error: 'Error al actualizar curso' };
  }
}

/**
 * Eliminar un curso
 */
function eliminarCurso(params) {
  try {
    return DB.eliminar('Cursos', params.rowNumber);
  } catch(error) {
    Logger.log('Error en Student.eliminarCurso(): ' + error.toString());
    return { success: false, error: 'Error al eliminar curso' };
  }
}
// MOD-002: FIN

// MOD-003: REPASOS [INICIO]
/**
 * Obtener todos los repasos del estudiante
 */
function obtenerRepasos(params) {
  try {
    var codeAlum = params.codeAlum;
    return DB.obtenerPorAlumno('Repasos', codeAlum);
  } catch(error) {
    Logger.log('Error en Student.obtenerRepasos(): ' + error.toString());
    return { success: false, error: 'Error al obtener repasos' };
  }
}

/**
 * Agregar un repaso nuevo
 * ⚠️ VALIDACIÓN: Curso+Tema NO puede duplicarse
 */
function agregarRepaso(params) {
  try {
    var existentes = DB.obtenerPorAlumno('Repasos', params.codeAlum);
    
    if (existentes.success) {
      for (var i = 0; i < existentes.data.length; i++) {
        if (existentes.data[i].Curso === params.curso && 
            existentes.data[i].Tema === params.tema) {
          return {
            success: false,
            error: 'El tema "' + params.tema + '" ya existe en ' + params.curso
          };
        }
      }
    }
    
    var repaso = {
      FechaReg: Utils.fechaHoy(),
      CodeAlum: params.codeAlum,
      Curso: params.curso,
      Tema: params.tema,
      FechaClase: params.fechaClase,
      FechaRep: params.fechaRep,
      EstadoRep: params.estadoRep || 'Falta',
      Detalle: params.detalle || '',
      Evaluado: params.evaluado || ''
    };
    
    return DB.agregar('Repasos', repaso);
  } catch(error) {
    Logger.log('Error en Student.agregarRepaso(): ' + error.toString());
    return { success: false, error: 'Error al agregar repaso' };
  }
}

/**
 * Actualizar un repaso existente
 */
function actualizarRepaso(params) {
  try {
    var result = DB.buscar('Repasos', 'CodeAlum', params.codeAlum);
    if (!result.success) {
      return { success: false, error: 'Repaso no encontrado' };
    }
    
    var repaso = result.data;
    repaso.Tema = params.tema || repaso.Tema;
    repaso.FechaClase = params.fechaClase || repaso.FechaClase;
    repaso.FechaRep = params.fechaRep || repaso.FechaRep;
    repaso.EstadoRep = params.estadoRep || repaso.EstadoRep;
    repaso.Detalle = params.detalle || repaso.Detalle;
    repaso.Evaluado = params.evaluado || repaso.Evaluado;
    
    return DB.actualizar('Repasos', repaso);
  } catch(error) {
    Logger.log('Error en Student.actualizarRepaso(): ' + error.toString());
    return { success: false, error: 'Error al actualizar repaso' };
  }
}

/**
 * Eliminar un repaso
 */
function eliminarRepaso(params) {
  try {
    return DB.eliminar('Repasos', params.rowNumber);
  } catch(error) {
    Logger.log('Error en Student.eliminarRepaso(): ' + error.toString());
    return { success: false, error: 'Error al eliminar repaso' };
  }
}
// MOD-003: FIN

// MOD-004: EVALUACIONES [INICIO]
/**
 * Obtener todas las evaluaciones del estudiante
 */
function obtenerEvaluaciones(params) {
  try {
    var codeAlum = params.codeAlum;
    return DB.obtenerPorAlumno('Eval', codeAlum);
  } catch(error) {
    Logger.log('Error en Student.obtenerEvaluaciones(): ' + error.toString());
    return { success: false, error: 'Error al obtener evaluaciones' };
  }
}

/**
 * Agregar una evaluación nueva
 * ⚠️ VALIDACIÓN: Curso+NomEval NO puede duplicarse
 */
function agregarEvaluacion(params) {
  try {
    var existentes = DB.obtenerPorAlumno('Eval', params.codeAlum);
    
    if (existentes.success) {
      for (var i = 0; i < existentes.data.length; i++) {
        if (existentes.data[i].Curso === params.curso && 
            existentes.data[i].NomEval === params.nomEval) {
          return {
            success: false,
            error: 'La evaluación "' + params.nomEval + '" ya existe en ' + params.curso
          };
        }
      }
    }
    
    var evaluacion = {
      FechaReg: Utils.fechaHoy(),
      CodeAlum: params.codeAlum,
      Curso: params.curso,
      NomEval: params.nomEval,
      FechaEval: params.fechaEval,
      Nota: params.nota || '',
      Peso: params.peso || '',
      Sem: params.sem || ''
    };
    
    return DB.agregar('Eval', evaluacion);
  } catch(error) {
    Logger.log('Error en Student.agregarEvaluacion(): ' + error.toString());
    return { success: false, error: 'Error al agregar evaluación' };
  }
}

/**
 * Actualizar una evaluación existente
 */
function actualizarEvaluacion(params) {
  try {
    var result = DB.buscar('Eval', 'CodeAlum', params.codeAlum);
    if (!result.success) {
      return { success: false, error: 'Evaluación no encontrada' };
    }
    
    var evaluacion = result.data;
    evaluacion.NomEval = params.nomEval || evaluacion.NomEval;
    evaluacion.FechaEval = params.fechaEval || evaluacion.FechaEval;
    evaluacion.Nota = params.nota || evaluacion.Nota;
    evaluacion.Peso = params.peso || evaluacion.Peso;
    evaluacion.Sem = params.sem || evaluacion.Sem;
    
    return DB.actualizar('Eval', evaluacion);
  } catch(error) {
    Logger.log('Error en Student.actualizarEvaluacion(): ' + error.toString());
    return { success: false, error: 'Error al actualizar evaluación' };
  }
}

/**
 * Eliminar una evaluación
 */
function eliminarEvaluacion(params) {
  try {
    return DB.eliminar('Eval', params.rowNumber);
  } catch(error) {
    Logger.log('Error en Student.eliminarEvaluacion(): ' + error.toString());
    return { success: false, error: 'Error al eliminar evaluación' };
  }
}
// MOD-004: FIN

// MOD-005: TAREAS [INICIO]
/**
 * Obtener todas las tareas del estudiante
 */
function obtenerTareas(params) {
  try {
    var codeAlum = params.codeAlum;
    return DB.obtenerPorAlumno('Tareas', codeAlum);
  } catch(error) {
    Logger.log('Error en Student.obtenerTareas(): ' + error.toString());
    return { success: false, error: 'Error al obtener tareas' };
  }
}

/**
 * Agregar una tarea nueva
 * ⚠️ VALIDACIÓN: Curso+Tarea NO puede duplicarse
 */
function agregarTarea(params) {
  try {
    var existentes = DB.obtenerPorAlumno('Tareas', params.codeAlum);
    
    if (existentes.success) {
      for (var i = 0; i < existentes.data.length; i++) {
        if (existentes.data[i].Curso === params.curso && 
            existentes.data[i].Tarea === params.tarea) {
          return {
            success: false,
            error: 'La tarea "' + params.tarea + '" ya existe en ' + params.curso
          };
        }
      }
    }
    
    var tarea = {
      FechaReg: Utils.fechaHoy(),
      CodeAlum: params.codeAlum,
      Curso: params.curso,
      Tarea: params.tarea,
      FechaEntrega: params.fechaEntrega,
      FechaAccion: params.fechaAccion || '',
      Nota: params.nota || '',
      Peso: params.peso || '',
      Sem: params.sem || ''
    };
    
    return DB.agregar('Tareas', tarea);
  } catch(error) {
    Logger.log('Error en Student.agregarTarea(): ' + error.toString());
    return { success: false, error: 'Error al agregar tarea' };
  }
}

/**
 * Actualizar una tarea existente
 */
function actualizarTarea(params) {
  try {
    var result = DB.buscar('Tareas', 'CodeAlum', params.codeAlum);
    if (!result.success) {
      return { success: false, error: 'Tarea no encontrada' };
    }
    
    var tarea = result.data;
    tarea.Tarea = params.tarea || tarea.Tarea;
    tarea.FechaEntrega = params.fechaEntrega || tarea.FechaEntrega;
    tarea.FechaAccion = params.fechaAccion || tarea.FechaAccion;
    tarea.Nota = params.nota || tarea.Nota;
    tarea.Peso = params.peso || tarea.Peso;
    tarea.Sem = params.sem || tarea.Sem;
    
    return DB.actualizar('Tareas', tarea);
  } catch(error) {
    Logger.log('Error en Student.actualizarTarea(): ' + error.toString());
    return { success: false, error: 'Error al actualizar tarea' };
  }
}

/**
 * Eliminar una tarea
 */
function eliminarTarea(params) {
  try {
    return DB.eliminar('Tareas', params.rowNumber);
  } catch(error) {
    Logger.log('Error en Student.eliminarTarea(): ' + error.toString());
    return { success: false, error: 'Error al eliminar tarea' };
  }
}
// MOD-005: FIN

// MOD-006: LECTURAS [INICIO]
/**
 * Obtener todas las lecturas del estudiante
 */
function obtenerLecturas(params) {
  try {
    var codeAlum = params.codeAlum;
    return DB.obtenerPorAlumno('Lecturas', codeAlum);
  } catch(error) {
    Logger.log('Error en Student.obtenerLecturas(): ' + error.toString());
    return { success: false, error: 'Error al obtener lecturas' };
  }
}

/**
 * Agregar una lectura nueva
 * ⚠️ VALIDACIÓN: Curso+Lectura NO puede duplicarse
 */
function agregarLectura(params) {
  try {
    var existentes = DB.obtenerPorAlumno('Lecturas', params.codeAlum);
    
    if (existentes.success) {
      for (var i = 0; i < existentes.data.length; i++) {
        if (existentes.data[i].Curso === params.curso && 
            existentes.data[i].Lectura === params.lectura) {
          return {
            success: false,
            error: 'La lectura "' + params.lectura + '" ya existe en ' + params.curso
          };
        }
      }
    }
    
    var lectura = {
      FechaReg: Utils.fechaHoy(),
      CodeAlum: params.codeAlum,
      Curso: params.curso,
      Lectura: params.lectura,
      CantPag: params.cantPag,
      PagActual: params.pagActual || 0,
      FechaInicio: params.fechaInicio,
      FechaFin: params.fechaFin,
      FechaEval: params.fechaEval || '',
      Nota: params.nota || '',
      Peso: params.peso || '',
      Sem: params.sem || ''
    };
    
    return DB.agregar('Lecturas', lectura);
  } catch(error) {
    Logger.log('Error en Student.agregarLectura(): ' + error.toString());
    return { success: false, error: 'Error al agregar lectura' };
  }
}

/**
 * Actualizar una lectura existente
 */
function actualizarLectura(params) {
  try {
    var result = DB.buscar('Lecturas', 'CodeAlum', params.codeAlum);
    if (!result.success) {
      return { success: false, error: 'Lectura no encontrada' };
    }
    
    var lectura = result.data;
    lectura.Lectura = params.lectura || lectura.Lectura;
    lectura.CantPag = params.cantPag || lectura.CantPag;
    lectura.PagActual = params.pagActual || lectura.PagActual;
    lectura.FechaInicio = params.fechaInicio || lectura.FechaInicio;
    lectura.FechaFin = params.fechaFin || lectura.FechaFin;
    lectura.FechaEval = params.fechaEval || lectura.FechaEval;
    lectura.Nota = params.nota || lectura.Nota;
    lectura.Peso = params.peso || lectura.Peso;
    lectura.Sem = params.sem || lectura.Sem;
    
    return DB.actualizar('Lecturas', lectura);
  } catch(error) {
    Logger.log('Error en Student.actualizarLectura(): ' + error.toString());
    return { success: false, error: 'Error al actualizar lectura' };
  }
}

/**
 * Eliminar una lectura
 */
function eliminarLectura(params) {
  try {
    return DB.eliminar('Lecturas', params.rowNumber);
  } catch(error) {
    Logger.log('Error en Student.eliminarLectura(): ' + error.toString());
    return { success: false, error: 'Error al eliminar lectura' };
  }
}
// MOD-006: FIN

// MOD-007: HORARIO CLASES [INICIO]
/**
 * Obtener horario de clases del estudiante
 * ⚠️ CRÍTICO: Mapea HoraInicio → HoraIni
 */
function obtenerHorarioClases(params) {
  try {
    var codeAlum = params.codeAlum;
    var result = DB.obtenerPorAlumno('HorarioClases', codeAlum);
    
    if (result.success) {
      result.data = result.data.map(function(item) {
        return {
          FechaReg: item.FechaReg,
          CodeAlum: item.CodeAlum,
          Curso: item.Curso,
          HoraIni: item.HoraInicio,
          HoraFin: item.HoraFin,
          Detalle: item.Detalle,
          _rowNumber: item._rowNumber
        };
      });
    }
    
    return result;
  } catch(error) {
    Logger.log('Error en Student.obtenerHorarioClases(): ' + error.toString());
    return { success: false, error: 'Error al obtener horario de clases' };
  }
}

/**
 * Agregar una clase al horario
 * ⚠️ FLEXIBILIDAD: Acepta horaIni (frontend) o horaInicio (tests)
 */
function agregarHorarioClase(params) {
  try {
    var clase = {
      FechaReg: Utils.fechaHoy(),
      CodeAlum: params.codeAlum,
      Curso: params.curso,
      HoraInicio: params.horaIni || params.horaInicio,
      HoraFin: params.horaFin,
      Detalle: params.detalle || ''
    };
    
    return DB.agregar('HorarioClases', clase);
  } catch(error) {
    Logger.log('Error en Student.agregarHorarioClase(): ' + error.toString());
    return { success: false, error: 'Error al agregar clase al horario' };
  }
}

/**
 * Actualizar una clase del horario
 */
function actualizarHorarioClase(params) {
  try {
    var result = DB.buscar('HorarioClases', 'CodeAlum', params.codeAlum);
    if (!result.success) {
      return { success: false, error: 'Clase no encontrada' };
    }
    
    var clase = result.data;
    clase.Curso = params.curso || clase.Curso;
    clase.HoraInicio = params.horaIni || params.horaInicio || clase.HoraInicio;
    clase.HoraFin = params.horaFin || clase.HoraFin;
    clase.Detalle = params.detalle || clase.Detalle;
    
    return DB.actualizar('HorarioClases', clase);
  } catch(error) {
    Logger.log('Error en Student.actualizarHorarioClase(): ' + error.toString());
    return { success: false, error: 'Error al actualizar clase del horario' };
  }
}

/**
 * Eliminar una clase del horario
 */
function eliminarHorarioClase(params) {
  try {
    return DB.eliminar('HorarioClases', params.rowNumber);
  } catch(error) {
    Logger.log('Error en Student.eliminarHorarioClase(): ' + error.toString());
    return { success: false, error: 'Error al eliminar clase del horario' };
  }
}
// MOD-007: FIN

// MOD-008: HORARIO SEMANAL [INICIO]
/**
 * Obtener horario semanal del estudiante
 */
function obtenerHorarioSem(params) {
  try {
    var codeAlum = params.codeAlum;
    return DB.obtenerPorAlumno('HorarioSem', codeAlum);
  } catch(error) {
    Logger.log('Error en Student.obtenerHorarioSem(): ' + error.toString());
    return { success: false, error: 'Error al obtener horario semanal' };
  }
}

/**
 * Agregar actividad al horario semanal
 */
function agregarHorarioSem(params) {
  try {
    var actividad = {
      FechaReg: Utils.fechaHoy(),
      CodeAlum: params.codeAlum,
      Actividad: params.actividad,
      HoraInicio: params.horaInicio,
      HoraFin: params.horaFin,
      FechaHS: params.fechaHS,
      TipoAct: params.tipoAct || '',
      Color: params.color || '#17a2b8',
      Sem: params.sem || ''
    };
    
    return DB.agregar('HorarioSem', actividad);
  } catch(error) {
    Logger.log('Error en Student.agregarHorarioSem(): ' + error.toString());
    return { success: false, error: 'Error al agregar actividad al horario semanal' };
  }
}

/**
 * V01.16 CLAUDE: Actualizar actividad del horario semanal
 */
function actualizarHorarioSem(params) {
  try {
    var result = DB.buscar('HorarioSem', 'CodeAlum', params.codeAlum);
    if (!result.success) {
      return { success: false, error: 'Actividad no encontrada' };
    }
    
    var actividad = result.data;
    actividad.Actividad = params.actividad || actividad.Actividad;
    actividad.HoraInicio = params.horaInicio || actividad.HoraInicio;
    actividad.HoraFin = params.horaFin || actividad.HoraFin;
    actividad.FechaHS = params.fechaHS || actividad.FechaHS;
    actividad.TipoAct = params.tipoAct || actividad.TipoAct;
    actividad.Color = params.color || actividad.Color;
    actividad.Sem = params.sem || actividad.Sem;
    
    return DB.actualizar('HorarioSem', actividad);
  } catch(error) {
    Logger.log('Error en Student.actualizarHorarioSem(): ' + error.toString());
    return { success: false, error: 'Error al actualizar actividad del horario semanal' };
  }
}

/**
 * Eliminar actividad del horario semanal
 */
function eliminarHorarioSem(params) {
  try {
    return DB.eliminar('HorarioSem', params.rowNumber);
  } catch(error) {
    Logger.log('Error en Student.eliminarHorarioSem(): ' + error.toString());
    return { success: false, error: 'Error al eliminar actividad del horario semanal' };
  }
}
// MOD-008: FIN

// MOD-009: CONFIGURACIÓN SEMANAS [INICIO]
/**
 * V01.17 CLAUDE: Obtener configuración de Semana 1
 * Lee de sheet Fechas el FechaInicio del alumno
 * ✅ FIX: Acceso directo a sheet en lugar de DB.buscar()
 */
function obtenerConfigSemana(params) {
  try {
    var codeAlum = params.codeAlum;
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Fechas');
    
    if (!sheet) {
      return { success: false, error: 'Hoja no encontrada: Fechas' };
    }
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    var codeAlumIdx = headers.indexOf('CodeAlum');
    var fechaInicioIdx = headers.indexOf('FechaInicio');
    var fechaFinIdx = headers.indexOf('FechaFin');
    
    if (codeAlumIdx === -1 || fechaInicioIdx === -1) {
      return { success: false, error: 'Estructura de hoja Fechas incorrecta' };
    }
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][codeAlumIdx] === codeAlum) {
        return {
          success: true,
          data: {
            FechaInicio: data[i][fechaInicioIdx],
            FechaFin: data[i][fechaFinIdx] || ''
          }
        };
      }
    }
    
    return { success: false, error: 'No hay configuración de semanas' };
  } catch(error) {
    Logger.log('Error en Student.obtenerConfigSemana(): ' + error.toString());
    return { success: false, error: 'Error al obtener configuración: ' + error.toString() };
  }
}

/**
 * V01.17 CLAUDE: Guardar configuración de Semana 1
 * Guarda FechaInicio en sheet Fechas
 * ✅ FIX: Acceso directo a sheet en lugar de DB
 */
function guardarConfigSemana(params) {
  try {
    var codeAlum = params.codeAlum;
    var fechaInicio = params.fechaInicio;
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Fechas');
    
    if (!sheet) {
      return { success: false, error: 'Hoja no encontrada: Fechas' };
    }
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    var codeAlumIdx = headers.indexOf('CodeAlum');
    var fechaInicioIdx = headers.indexOf('FechaInicio');
    var fechaRegIdx = headers.indexOf('FechaReg');
    
    if (codeAlumIdx === -1 || fechaInicioIdx === -1) {
      return { success: false, error: 'Estructura de hoja Fechas incorrecta' };
    }
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][codeAlumIdx] === codeAlum) {
        sheet.getRange(i + 1, fechaInicioIdx + 1).setValue(fechaInicio);
        return { success: true };
      }
    }
    
    var nuevaFila = [];
    for (var j = 0; j < headers.length; j++) {
      if (headers[j] === 'FechaReg') {
        nuevaFila.push(Utils.fechaHoy());
      } else if (headers[j] === 'CodeAlum') {
        nuevaFila.push(codeAlum);
      } else if (headers[j] === 'FechaInicio') {
        nuevaFila.push(fechaInicio);
      } else {
        nuevaFila.push('');
      }
    }
    
    sheet.appendRow(nuevaFila);
    return { success: true };
  } catch(error) {
    Logger.log('Error en Student.guardarConfigSemana(): ' + error.toString());
    return { success: false, error: 'Error al guardar configuración: ' + error.toString() };
  }
}

/**
 * V01.16 CLAUDE: Copiar actividades de semana anterior
 * Busca todas las actividades entre fechaInicioOrigen y fechaFinOrigen,
 * las duplica sumando 7 días a cada FechaHS
 */
function copiarSemana(params) {
  try {
    var codeAlum = params.codeAlum;
    var fechaInicioOrigen = new Date(params.fechaInicioOrigen);
    var fechaFinOrigen = new Date(params.fechaFinOrigen);
    var fechaInicioDestino = new Date(params.fechaInicioDestino);
    
    var todasActividades = DB.obtenerPorAlumno('HorarioSem', codeAlum);
    
    if (!todasActividades.success) {
      return { success: true, data: 0 };
    }
    
    var actividadesACopiar = [];
    
    for (var i = 0; i < todasActividades.data.length; i++) {
      var act = todasActividades.data[i];
      var fechaAct = new Date(act.FechaHS);
      
      if (fechaAct >= fechaInicioOrigen && fechaAct <= fechaFinOrigen) {
        actividadesACopiar.push(act);
      }
    }
    
    var copiadas = 0;
    
    for (var j = 0; j < actividadesACopiar.length; j++) {
      var original = actividadesACopiar[j];
      var fechaOriginal = new Date(original.FechaHS);
      
      var diffDias = Math.floor((fechaOriginal - fechaInicioOrigen) / (1000 * 60 * 60 * 24));
      
      var nuevaFecha = new Date(fechaInicioDestino);
      nuevaFecha.setDate(nuevaFecha.getDate() + diffDias);
      
      var nuevaActividad = {
        FechaReg: Utils.fechaHoy(),
        CodeAlum: codeAlum,
        Actividad: original.Actividad,
        HoraInicio: original.HoraInicio,
        HoraFin: original.HoraFin,
        FechaHS: formatearFechaISO(nuevaFecha),
        TipoAct: original.TipoAct,
        Color: original.Color,
        Sem: original.Sem
      };
      
      var resultado = DB.agregar('HorarioSem', nuevaActividad);
      if (resultado.success) {
        copiadas++;
      }
    }
    
    return { success: true, data: copiadas };
  } catch(error) {
    Logger.log('Error en Student.copiarSemana(): ' + error.toString());
    return { success: false, error: 'Error al copiar semana' };
  }
}

/**
 * V01.16 CLAUDE: Limpiar todas las actividades de una semana
 * Elimina actividades entre fechaInicio y fechaFin
 * NO toca las clases fijas (HorarioClases)
 */
function limpiarSemana(params) {
  try {
    var codeAlum = params.codeAlum;
    var fechaInicio = new Date(params.fechaInicio);
    var fechaFin = new Date(params.fechaFin);
    
    var todasActividades = DB.obtenerPorAlumno('HorarioSem', codeAlum);
    
    if (!todasActividades.success) {
      return { success: true, data: 0 };
    }
    
    var eliminadas = 0;
    
    for (var i = 0; i < todasActividades.data.length; i++) {
      var act = todasActividades.data[i];
      var fechaAct = new Date(act.FechaHS);
      
      if (fechaAct >= fechaInicio && fechaAct <= fechaFin) {
        var resultado = DB.eliminar('HorarioSem', act._rowNumber);
        if (resultado.success) {
          eliminadas++;
        }
      }
    }
    
    return { success: true, data: eliminadas };
  } catch(error) {
    Logger.log('Error en Student.limpiarSemana(): ' + error.toString());
    return { success: false, error: 'Error al limpiar semana' };
  }
}

/**
 * Helper: Formatear fecha a ISO (YYYY-MM-DD)
 */
function formatearFechaISO(fecha) {
  var year = fecha.getFullYear();
  var month = String(fecha.getMonth() + 1).padStart(2, '0');
  var day = String(fecha.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}
// MOD-009: FIN

// MOD-010: NOTAS [INICIO]
/**
 * Obtener promedio ponderado de un curso específico
 * Combina: Eval + Tareas + Lecturas
 */
function obtenerNotasPorCurso(params) {
  try {
    var codeAlum = params.codeAlum;
    var curso = params.curso;
    
    var eval = DB.obtenerPorAlumno('Eval', codeAlum);
    var evalCurso = eval.success ? 
      eval.data.filter(function(e) { return e.Curso === curso; }) : [];
    
    var tareas = DB.obtenerPorAlumno('Tareas', codeAlum);
    var tareasCurso = tareas.success ? 
      tareas.data.filter(function(t) { return t.Curso === curso; }) : [];
    
    var lecturas = DB.obtenerPorAlumno('Lecturas', codeAlum);
    var lecturasCurso = lecturas.success ? 
      lecturas.data.filter(function(l) { return l.Curso === curso; }) : [];
    
    var totalNota = 0;
    var totalPeso = 0;
    
    evalCurso.forEach(function(item) {
      if (item.Nota && item.Peso) {
        totalNota += parseFloat(item.Nota) * parseFloat(item.Peso);
        totalPeso += parseFloat(item.Peso);
      }
    });
    
    tareasCurso.forEach(function(item) {
      if (item.Nota && item.Peso) {
        totalNota += parseFloat(item.Nota) * parseFloat(item.Peso);
        totalPeso += parseFloat(item.Peso);
      }
    });
    
    lecturasCurso.forEach(function(item) {
      if (item.Nota && item.Peso) {
        totalNota += parseFloat(item.Nota) * parseFloat(item.Peso);
        totalPeso += parseFloat(item.Peso);
      }
    });
    
    var promedio = totalPeso > 0 ? (totalNota / totalPeso).toFixed(2) : 0;
    
    return {
      success: true,
      data: {
        curso: curso,
        promedio: promedio,
        evaluaciones: evalCurso.length,
        tareas: tareasCurso.length,
        lecturas: lecturasCurso.length
      }
    };
  } catch(error) {
    Logger.log('Error en Student.obtenerNotasPorCurso(): ' + error.toString());
    return { success: false, error: 'Error al obtener notas del curso' };
  }
}

/**
 * Obtener resumen de notas de todos los cursos
 */
function obtenerResumenNotas(params) {
  try {
    var codeAlum = params.codeAlum;
    
    var cursosResult = DB.obtenerPorAlumno('Cursos', codeAlum);
    if (!cursosResult.success) {
      return { success: false, error: 'No se pudieron obtener los cursos' };
    }
    
    var resumen = [];
    
    cursosResult.data.forEach(function(curso) {
      var notasCurso = obtenerNotasPorCurso({
        codeAlum: codeAlum,
        curso: curso.Curso
      });
      
      if (notasCurso.success) {
        resumen.push({
          curso: curso.Curso,
          completo: curso.Completo,
          color: curso.Color,
          promedio: notasCurso.data.promedio,
          evaluaciones: notasCurso.data.evaluaciones,
          tareas: notasCurso.data.tareas,
          lecturas: notasCurso.data.lecturas
        });
      }
    });
    
    return { success: true, data: resumen };
  } catch(error) {
    Logger.log('Error en Student.obtenerResumenNotas(): ' + error.toString());
    return { success: false, error: 'Error al obtener resumen de notas' };
  }
}
// MOD-010: FIN

// MOD-011: DEBERES [INICIO]
/**
 * Obtener todos los deberes (Eval + Tareas + Lecturas)
 */
function obtenerTodosDeberes(params) {
  try {
    var codeAlum = params.codeAlum;
    var deberes = [];
    
    var eval = DB.obtenerPorAlumno('Eval', codeAlum);
    if (eval.success) {
      eval.data.forEach(function(item) {
        deberes.push({
          tipo: 'Evaluación',
          curso: item.Curso,
          nombre: item.NomEval,
          fecha: item.FechaEval,
          nota: item.Nota,
          peso: item.Peso,
          _rowNumber: item._rowNumber
        });
      });
    }
    
    var tareas = DB.obtenerPorAlumno('Tareas', codeAlum);
    if (tareas.success) {
      tareas.data.forEach(function(item) {
        deberes.push({
          tipo: 'Tarea',
          curso: item.Curso,
          nombre: item.Tarea,
          fecha: item.FechaEntrega,
          nota: item.Nota,
          peso: item.Peso,
          _rowNumber: item._rowNumber
        });
      });
    }
    
    var lecturas = DB.obtenerPorAlumno('Lecturas', codeAlum);
    if (lecturas.success) {
      lecturas.data.forEach(function(item) {
        deberes.push({
          tipo: 'Lectura',
          curso: item.Curso,
          nombre: item.Lectura,
          fecha: item.FechaEval,
          nota: item.Nota,
          peso: item.Peso,
          progreso: item.PagActual && item.CantPag ? 
            ((item.PagActual / item.CantPag) * 100).toFixed(0) + '%' : '0%',
          _rowNumber: item._rowNumber
        });
      });
    }
    
    deberes.sort(function(a, b) {
      if (!a.fecha) return 1;
      if (!b.fecha) return -1;
      return new Date(a.fecha) - new Date(b.fecha);
    });
    
    return { success: true, data: deberes };
  } catch(error) {
    Logger.log('Error en Student.obtenerTodosDeberes(): ' + error.toString());
    return { success: false, error: 'Error al obtener todos los deberes' };
  }
}

/**
 * Obtener deberes filtrados por tipo
 */
function obtenerDeberesPorTipo(params) {
  try {
    var codeAlum = params.codeAlum;
    var tipo = params.tipo;
    
    var sheetName = tipo === 'Evaluación' ? 'Eval' : 
                    tipo === 'Tarea' ? 'Tareas' : 'Lecturas';
    
    return DB.obtenerPorAlumno(sheetName, codeAlum);
  } catch(error) {
    Logger.log('Error en Student.obtenerDeberesPorTipo(): ' + error.toString());
    return { success: false, error: 'Error al obtener deberes por tipo' };
  }
}
// MOD-011: FIN

// MOD-012: EXPORTACIÓN PÚBLICA [INICIO]
return {
  obtenerCursos: obtenerCursos,
  agregarCurso: agregarCurso,
  actualizarCurso: actualizarCurso,
  eliminarCurso: eliminarCurso,
  obtenerRepasos: obtenerRepasos,
  agregarRepaso: agregarRepaso,
  actualizarRepaso: actualizarRepaso,
  eliminarRepaso: eliminarRepaso,
  obtenerEvaluaciones: obtenerEvaluaciones,
  agregarEvaluacion: agregarEvaluacion,
  actualizarEvaluacion: actualizarEvaluacion,
  eliminarEvaluacion: eliminarEvaluacion,
  obtenerTareas: obtenerTareas,
  agregarTarea: agregarTarea,
  actualizarTarea: actualizarTarea,
  eliminarTarea: eliminarTarea,
  obtenerLecturas: obtenerLecturas,
  agregarLectura: agregarLectura,
  actualizarLectura: actualizarLectura,
  eliminarLectura: eliminarLectura,
  obtenerHorarioClases: obtenerHorarioClases,
  agregarHorarioClase: agregarHorarioClase,
  actualizarHorarioClase: actualizarHorarioClase,
  eliminarHorarioClase: eliminarHorarioClase,
  obtenerHorarioSem: obtenerHorarioSem,
  agregarHorarioSem: agregarHorarioSem,
  actualizarHorarioSem: actualizarHorarioSem,
  eliminarHorarioSem: eliminarHorarioSem,
  obtenerConfigSemana: obtenerConfigSemana,
  guardarConfigSemana: guardarConfigSemana,
  copiarSemana: copiarSemana,
  limpiarSemana: limpiarSemana,
  obtenerNotasPorCurso: obtenerNotasPorCurso,
  obtenerResumenNotas: obtenerResumenNotas,
  obtenerTodosDeberes: obtenerTodosDeberes,
  obtenerDeberesPorTipo: obtenerDeberesPorTipo
};
// MOD-012: FIN

})();

// MOD-013: NOTAS [INICIO]
/*
DESCRIPCIÓN:
Módulo Student con lógica de negocio del estudiante.
Todas las funciones usan DB para acceso a datos (excepto MOD-009).

DEPENDENCIAS:
● MOD-002 a MOD-008, MOD-010, MOD-011 requieren módulo DB funcional
● MOD-009 accede directamente a sheet Fechas (fix V01.17)

ESTRUCTURA DE DATOS:
Sheet Fechas:
  FechaReg | CodeAlum | FechaInicio | FechaFin

Sheet HorarioSem:
  FechaReg | CodeAlum | Actividad | HoraInicio | HoraFin | FechaHS | TipoAct | Color | Sem

MÓDULOS:
MOD-001: Inicialización
MOD-002: Cursos (4 funciones)
MOD-003: Repasos (4 funciones)
MOD-004: Evaluaciones (4 funciones)
MOD-005: Tareas (4 funciones)
MOD-006: Lecturas (4 funciones)
MOD-007: HorarioClases (4 funciones)
MOD-008: HorarioSem (5 funciones)
MOD-009: Configuración Semanas (4 funciones) - CORREGIDO V01.17
MOD-010: Notas (2 funciones)
MOD-011: Deberes (2 funciones)
MOD-012: Exportación
MOD-013: Notas

TOTAL FUNCIONES: 35

VALIDACIONES:
● Curso: Nombre único por alumno
● Repaso: Curso+Tema único
● Evaluación: Curso+NomEval único
● Tarea: Curso+Tarea único
● Lectura: Curso+Lectura único

ADVERTENCIAS:
● MOD-009: copiarSemana() requiere fechas en formato ISO
● MOD-009: limpiarSemana() NO elimina clases fijas
● MOD-007: obtenerHorarioClases() mapea HoraInicio → HoraIni
● MOD-009: V01.17 usa acceso directo a sheet Fechas (no DB.buscar)

PRÓXIMAS MEJORAS:
● Agregar validación de rangos de fechas en copiarSemana()
● Implementar copiarDia() para copiar un día específico
● Agregar obtenerActividadesPorFecha() para filtros avanzados
*/
// MOD-013: FIN
