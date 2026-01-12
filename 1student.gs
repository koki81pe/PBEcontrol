// MOD-001: ENCABEZADO [INICIO]
/*
******************************************
PROYECTO: PBE Control
ARCHIVO: 1student.gs
VERSIÓN: 01.19 CLAUDE
FECHA: 10/01/2026 18:00 (UTC-5)
******************************************
*/
// MOD-001: FIN

// MOD-002: INICIALIZACIÓN [INICIO]
var Student = (function() {
// MOD-002: FIN
  
// MOD-003: CURSOS [INICIO]
function obtenerCursos(params) {
  try {
    var codeAlum = params.codeAlum;
    return DB.obtenerPorAlumno('Cursos', codeAlum);
  } catch(error) {
    Logger.log('Error en Student.obtenerCursos(): ' + error.toString());
    return { success: false, error: 'Error al obtener cursos' };
  }
}

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

function eliminarCurso(params) {
  try {
    return DB.eliminar('Cursos', params.rowNumber);
  } catch(error) {
    Logger.log('Error en Student.eliminarCurso(): ' + error.toString());
    return { success: false, error: 'Error al eliminar curso' };
  }
}
// MOD-003: FIN

// MOD-004: REPASOS [INICIO]
function obtenerRepasos(params) {
  try {
    var codeAlum = params.codeAlum;
    return DB.obtenerPorAlumno('Repasos', codeAlum);
  } catch(error) {
    Logger.log('Error en Student.obtenerRepasos(): ' + error.toString());
    return { success: false, error: 'Error al obtener repasos' };
  }
}

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

function eliminarRepaso(params) {
  try {
    return DB.eliminar('Repasos', params.rowNumber);
  } catch(error) {
    Logger.log('Error en Student.eliminarRepaso(): ' + error.toString());
    return { success: false, error: 'Error al eliminar repaso' };
  }
}
// MOD-004: FIN

// MOD-005: EVALUACIONES [INICIO]
function obtenerEvaluaciones(params) {
  try {
    var codeAlum = params.codeAlum;
    return DB.obtenerPorAlumno('Eval', codeAlum);
  } catch(error) {
    Logger.log('Error en Student.obtenerEvaluaciones(): ' + error.toString());
    return { success: false, error: 'Error al obtener evaluaciones' };
  }
}

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

function eliminarEvaluacion(params) {
  try {
    return DB.eliminar('Eval', params.rowNumber);
  } catch(error) {
    Logger.log('Error en Student.eliminarEvaluacion(): ' + error.toString());
    return { success: false, error: 'Error al eliminar evaluación' };
  }
}
// MOD-005: FIN

// MOD-006: TAREAS [INICIO]
function obtenerTareas(params) {
  try {
    var codeAlum = params.codeAlum;
    return DB.obtenerPorAlumno('Tareas', codeAlum);
  } catch(error) {
    Logger.log('Error en Student.obtenerTareas(): ' + error.toString());
    return { success: false, error: 'Error al obtener tareas' };
  }
}

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

function eliminarTarea(params) {
  try {
    return DB.eliminar('Tareas', params.rowNumber);
  } catch(error) {
    Logger.log('Error en Student.eliminarTarea(): ' + error.toString());
    return { success: false, error: 'Error al eliminar tarea' };
  }
}
// MOD-006: FIN

// MOD-007: LECTURAS [INICIO]
function obtenerLecturas(params) {
  try {
    var codeAlum = params.codeAlum;
    return DB.obtenerPorAlumno('Lecturas', codeAlum);
  } catch(error) {
    Logger.log('Error en Student.obtenerLecturas(): ' + error.toString());
    return { success: false, error: 'Error al obtener lecturas' };
  }
}

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

function eliminarLectura(params) {
  try {
    return DB.eliminar('Lecturas', params.rowNumber);
  } catch(error) {
    Logger.log('Error en Student.eliminarLectura(): ' + error.toString());
    return { success: false, error: 'Error al eliminar lectura' };
  }
}
// MOD-007: FIN

// MOD-008: HORARIO CLASES [INICIO]
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

function eliminarHorarioClase(params) {
  try {
    return DB.eliminar('HorarioClases', params.rowNumber);
  } catch(error) {
    Logger.log('Error en Student.eliminarHorarioClase(): ' + error.toString());
    return { success: false, error: 'Error al eliminar clase del horario' };
  }
}
// MOD-008: FIN

// MOD-009: HORARIO SEMANAL [INICIO]
function obtenerHorarioSem(params) {
  try {
    var codeAlum = params.codeAlum;
    var result = DB.obtenerPorAlumno('HorarioSem', codeAlum);
    
    if (result.success && result.data) {
      result.data = result.data.map(function(item) {
        if (item.FechaHS && typeof item.FechaHS === 'string') {
          if (item.FechaHS.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
            var partes = item.FechaHS.split('/');
            item.FechaHS = partes[2] + '-' + partes[1] + '-' + partes[0];
          }
        }
        return item;
      });
    }
    
    return result;
  } catch(error) {
    Logger.log('Error en Student.obtenerHorarioSem(): ' + error.toString());
    return { success: false, error: 'Error al obtener horario semanal' };
  }
}

function agregarHorarioSem(params) {
  try {
    var fechaHSFormateada = convertirISOaDDMMAAAA(params.fechaHS);
    
    var actividad = {
      FechaReg: Utils.fechaHoy(),
      CodeAlum: params.codeAlum,
      Actividad: params.actividad,
      HoraInicio: params.horaInicio,
      HoraFin: params.horaFin,
      FechaHS: fechaHSFormateada,
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
    
    if (params.fechaHS) {
      actividad.FechaHS = convertirISOaDDMMAAAA(params.fechaHS);
    }
    
    actividad.TipoAct = params.tipoAct || actividad.TipoAct;
    actividad.Color = params.color || actividad.Color;
    actividad.Sem = params.sem || actividad.Sem;
    
    return DB.actualizar('HorarioSem', actividad);
  } catch(error) {
    Logger.log('Error en Student.actualizarHorarioSem(): ' + error.toString());
    return { success: false, error: 'Error al actualizar actividad del horario semanal' };
  }
}

function eliminarHorarioSem(params) {
  try {
    return DB.eliminar('HorarioSem', params.rowNumber);
  } catch(error) {
    Logger.log('Error en Student.eliminarHorarioSem(): ' + error.toString());
    return { success: false, error: 'Error al eliminar actividad del horario semanal' };
  }
}
// MOD-009: FIN

// MOD-010: CONFIG SEMANAS [INICIO]
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
        var fechaInicio = data[i][fechaInicioIdx];
        var fechaFin = data[i][fechaFinIdx] || '';
        
        if (fechaInicio instanceof Date) {
          fechaInicio = Utilities.formatDate(fechaInicio, 
            Session.getScriptTimeZone(), 'yyyy-MM-dd');
        } else if (typeof fechaInicio === 'string') {
          if (fechaInicio.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
            var partes = fechaInicio.split('/');
            fechaInicio = partes[2] + '-' + partes[1] + '-' + partes[0];
          }
        }
        
        if (fechaFin instanceof Date) {
          fechaFin = Utilities.formatDate(fechaFin, 
            Session.getScriptTimeZone(), 'yyyy-MM-dd');
        } else if (typeof fechaFin === 'string' && fechaFin.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
          var partesFin = fechaFin.split('/');
          fechaFin = partesFin[2] + '-' + partesFin[1] + '-' + partesFin[0];
        }
        
        return {
          success: true,
          data: {
            FechaInicio: fechaInicio,
            FechaFin: fechaFin
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
        var cell = sheet.getRange(i + 1, fechaInicioIdx + 1);
        cell.setNumberFormat('@').setValue(fechaInicio);
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
    
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, fechaInicioIdx + 1).setNumberFormat('@');
    
    return { success: true };
  } catch(error) {
    Logger.log('Error en Student.guardarConfigSemana(): ' + error.toString());
    return { success: false, error: 'Error al guardar configuración: ' + error.toString() };
  }
}

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
// MOD-010: FIN

// MOD-011: GESTIÓN SEMANAS [INICIO]
function obtenerSemanas(codeAlum) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Semanas');
    
    if (!sheet) {
      return { success: false, error: 'Hoja no encontrada: Semanas' };
    }
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    var codeAlumIdx = headers.indexOf('CodeAlum');
    var fechaInicioIdx = headers.indexOf('FechaInicio');
    var fechaFinIdx = headers.indexOf('FechaFin');
    var semanaIdx = headers.indexOf('Semana');
    
    if (codeAlumIdx === -1 || fechaInicioIdx === -1 || fechaFinIdx === -1 || semanaIdx === -1) {
      return { success: false, error: 'Estructura de hoja Semanas incorrecta' };
    }
    
    var semanas = [];
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][codeAlumIdx] === codeAlum) {
        semanas.push({
          FechaReg: data[i][0],
          CodeAlum: data[i][codeAlumIdx],
          FechaInicio: data[i][fechaInicioIdx],
          FechaFin: data[i][fechaFinIdx],
          Semana: data[i][semanaIdx],
          _rowNumber: i + 1
        });
      }
    }
    
    semanas.sort(function(a, b) {
      return parseInt(a.Semana) - parseInt(b.Semana);
    });
    
    return { success: true, data: semanas };
  } catch(error) {
    Logger.log('Error en Student.obtenerSemanas(): ' + error.toString());
    return { success: false, error: 'Error al obtener semanas' };
  }
}

function crearSemana(params) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Semanas');
    
    if (!sheet) {
      return { success: false, error: 'Hoja no encontrada: Semanas' };
    }
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    var codeAlumIdx = headers.indexOf('CodeAlum');
    var semanaIdx = headers.indexOf('Semana');
    
    if (codeAlumIdx === -1 || semanaIdx === -1) {
      return { success: false, error: 'Estructura de hoja Semanas incorrecta' };
    }
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][codeAlumIdx] === params.codeAlum && 
          data[i][semanaIdx] === params.semana) {
        return { 
          success: false, 
          error: 'La Semana ' + params.semana + ' ya existe' 
        };
      }
    }
    
    var fechaInicioFormateada = convertirISOaDDMMAAAA(params.fechaInicio);
    var fechaFinFormateada = convertirISOaDDMMAAAA(params.fechaFin);
    
    var nuevaFila = [];
    for (var j = 0; j < headers.length; j++) {
      if (headers[j] === 'FechaReg') {
        nuevaFila.push(Utils.fechaHoy());
      } else if (headers[j] === 'CodeAlum') {
        nuevaFila.push(params.codeAlum);
      } else if (headers[j] === 'FechaInicio') {
        nuevaFila.push(fechaInicioFormateada);
      } else if (headers[j] === 'FechaFin') {
        nuevaFila.push(fechaFinFormateada);
      } else if (headers[j] === 'Semana') {
        nuevaFila.push(params.semana);
      } else {
        nuevaFila.push('');
      }
    }
    
    sheet.appendRow(nuevaFila);
    
    var lastRow = sheet.getLastRow();
    var fechaInicioCol = headers.indexOf('FechaInicio') + 1;
    var fechaFinCol = headers.indexOf('FechaFin') + 1;
    
    sheet.getRange(lastRow, fechaInicioCol).setNumberFormat('@');
    sheet.getRange(lastRow, fechaFinCol).setNumberFormat('@');
    
    return { success: true, data: lastRow };
  } catch(error) {
    Logger.log('Error en Student.crearSemana(): ' + error.toString());
    return { success: false, error: 'Error al crear semana' };
  }
}

function eliminarSemana(params) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Semanas');
    
    if (!sheet) {
      return { success: false, error: 'Hoja no encontrada: Semanas' };
    }
    
    sheet.deleteRow(params.rowNumber);
    
    return { success: true };
  } catch(error) {
    Logger.log('Error en Student.eliminarSemana(): ' + error.toString());
    return { success: false, error: 'Error al eliminar semana' };
  }
}
// MOD-011: FIN

// MOD-012: NOTAS [INICIO]
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
// MOD-012: FIN

// MOD-013: DEBERES [INICIO]
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
// MOD-013: FIN

// MOD-014: HELPERS [INICIO]
function formatearFechaISO(fecha) {
  var year = fecha.getFullYear();
  var month = String(fecha.getMonth() + 1).padStart(2, '0');
  var day = String(fecha.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

function convertirISOaDDMMAAAA(fechaISO) {
  if (!fechaISO) return '';
  var partes = fechaISO.split('-');
  return partes[2] + '/' + partes[1] + '/' + partes[0];
}
// MOD-014: FIN

// MOD-015: EXPORTACIÓN [INICIO]
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
  obtenerSemanas: obtenerSemanas,
  crearSemana: crearSemana,
  eliminarSemana: eliminarSemana,
  obtenerNotasPorCurso: obtenerNotasPorCurso,
  obtenerResumenNotas: obtenerResumenNotas,
  obtenerTodosDeberes: obtenerTodosDeberes,
  obtenerDeberesPorTipo: obtenerDeberesPorTipo
};
// MOD-015: FIN

})();

// MOD-016: NOTAS [INICIO]
/*
CAMBIOS V01.19 CLAUDE:
✅ Gestión de hoja Semanas (3 funciones nuevas)
✅ Fix formato fechas HorarioSem: ISO → DD/MM/AAAA al guardar
✅ Fix formato fechas HorarioSem: DD/MM/AAAA → ISO al leer
✅ Helpers: convertirISOaDDMMAAAA(), formatearFechaISO()
✅ Modularización CodeWorkshop estándar

MÓDULOS:
MOD-001: Encabezado
MOD-002: Inicialización
MOD-003: Cursos (4 funciones)
MOD-004: Repasos (4 funciones)
MOD-005: Evaluaciones (4 funciones)
MOD-006: Tareas (4 funciones)
MOD-007: Lecturas (4 funciones)
MOD-008: HorarioClases (4 funciones)
MOD-009: HorarioSem (4 funciones) - FIX formato fechas
MOD-010: Config Semanas (4 funciones)
MOD-011: Gestión Semanas (3 funciones) - NUEVO V01.19
MOD-012: Notas (2 funciones)
MOD-013: Deberes (2 funciones)
MOD-014: Helpers (2 funciones)
MOD-015: Exportación
MOD-016: Notas

TOTAL FUNCIONES: 38

HOJA SEMANAS:
FechaReg | CodeAlum | FechaInicio | FechaFin | Semana
Formato fechas: DD/MM/AAAA

HOJA HORARIO SEMANAL:
FechaReg | CodeAlum | Actividad | HoraInicio | HoraFin | FechaHS | TipoAct | Color | Sem
Formato FechaHS: DD/MM/AAAA (guardado) → ISO (lectura)
*/
// MOD-016: FIN
