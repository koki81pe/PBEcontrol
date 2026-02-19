// MOD-001: ENCABEZADO [INICIO]
/*
*****************************************
PROYECTO: PBE Control
ARCHIVO: 1student.gs
VERSIÓN: 01.30
FECHA: 19/02/2026 13:27 (UTC-5)
*****************************************
*/
// MOD-001: FIN

// MOD-002: INICIALIZACIÓN [INICIO]
var Student = (function() {
// MOD-002: FIN
  
// MOD-003: CURSOS [INICIO]
function obtenerCursos(params) {
  try {
    return DB.obtenerPorAlumno('Cursos', params.codeAlum);
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
          return { success: false, error: 'El curso ' + params.curso + ' ya existe. Usa otro nombre corto' };
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
    if (!params.rowNumber) {
      return { success: false, error: 'Falta rowNumber' };
    }

    var existentes = DB.obtenerPorAlumno('Cursos', params.codeAlum);
    if (!existentes.success) {
      return { success: false, error: 'No se pudieron obtener los cursos' };
    }

    var cursoActual = null;
    for (var i = 0; i < existentes.data.length; i++) {
      if (existentes.data[i]._rowNumber === params.rowNumber) {
        cursoActual = existentes.data[i];
        break;
      }
    }

    if (!cursoActual) {
      return { success: false, error: 'Curso no encontrado' };
    }

    // Validar unicidad si el nombre corto cambió
    var nombreViejo = cursoActual.Curso;
    var nombreNuevo = params.curso || nombreViejo;

    if (nombreNuevo !== nombreViejo) {
      for (var j = 0; j < existentes.data.length; j++) {
        if (existentes.data[j]._rowNumber !== params.rowNumber &&
            existentes.data[j].Curso === nombreNuevo) {
          return { success: false, error: 'El curso ' + nombreNuevo + ' ya existe. Usa otro nombre corto' };
        }
      }
    }

    // Actualizar en hoja Cursos
    cursoActual.Curso = nombreNuevo;
    cursoActual.Completo = params.completo || cursoActual.Completo;
    cursoActual.Color = params.color || cursoActual.Color;

    var result = DB.actualizar('Cursos', cursoActual);
    if (!result.success) {
      return result;
    }

    // Propagar nombre si cambió
    if (nombreNuevo !== nombreViejo) {
      DB.propagarNombreCurso(params.codeAlum, nombreViejo, nombreNuevo);
    }

    return { success: true, message: 'Curso actualizado' };
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
    if (params.rowNumber) {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName('Repasos');
      
      if (!sheet) {
        return { success: false, error: 'Hoja no encontrada: Repasos' };
      }
      
      var data = sheet.getDataRange().getValues();
      var headers = data[0];
      
      var rowIndex = params.rowNumber - 1;
      if (rowIndex < 1 || rowIndex >= data.length) {
        return { success: false, error: 'Número de fila inválido' };
      }
      
      var repaso = {};
      for (var i = 0; i < headers.length; i++) {
        repaso[headers[i]] = data[rowIndex][i];
      }
      repaso._rowNumber = params.rowNumber;
      
      repaso.Curso = params.curso || repaso.Curso;
      repaso.Tema = params.tema || repaso.Tema;
      repaso.FechaClase = params.fechaClase || repaso.FechaClase;
      repaso.FechaRep = params.fechaRep || repaso.FechaRep;
      repaso.EstadoRep = params.estadoRep || repaso.EstadoRep;
      repaso.Detalle = params.detalle || repaso.Detalle;
      repaso.Evaluado = params.evaluado || repaso.Evaluado;
      
      return DB.actualizar('Repasos', repaso);
    }
    
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
    if (params.rowNumber) {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName('Eval');
      
      if (!sheet) {
        return { success: false, error: 'Hoja no encontrada: Eval' };
      }
      
      var data = sheet.getDataRange().getValues();
      var headers = data[0];
      
      var rowIndex = params.rowNumber - 1;
      if (rowIndex < 1 || rowIndex >= data.length) {
        return { success: false, error: 'Número de fila inválido' };
      }
      
      var evaluacion = {};
      for (var i = 0; i < headers.length; i++) {
        evaluacion[headers[i]] = data[rowIndex][i];
      }
      evaluacion._rowNumber = params.rowNumber;
      
      evaluacion.Curso = params.curso || evaluacion.Curso;
      evaluacion.NomEval = params.nomEval || evaluacion.NomEval;
      evaluacion.FechaEval = params.fechaEval || evaluacion.FechaEval;
      evaluacion.Nota = params.nota || evaluacion.Nota;
      evaluacion.Peso = params.peso || evaluacion.Peso;
      evaluacion.Sem = params.sem || evaluacion.Sem;
      
      return DB.actualizar('Eval', evaluacion);
    }
    
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
    if (params.rowNumber) {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName('Tareas');
      
      if (!sheet) {
        return { success: false, error: 'Hoja no encontrada: Tareas' };
      }
      
      var data = sheet.getDataRange().getValues();
      var headers = data[0];
      
      var rowIndex = params.rowNumber - 1;
      if (rowIndex < 1 || rowIndex >= data.length) {
        return { success: false, error: 'Número de fila inválido' };
      }
      
      var tarea = {};
      for (var i = 0; i < headers.length; i++) {
        tarea[headers[i]] = data[rowIndex][i];
      }
      tarea._rowNumber = params.rowNumber;
      
      tarea.Curso = params.curso || tarea.Curso;
      tarea.Tarea = params.tarea || tarea.Tarea;
      tarea.FechaEntrega = params.fechaEntrega || tarea.FechaEntrega;
      tarea.FechaAccion = params.fechaAccion || tarea.FechaAccion;
      tarea.Nota = params.nota || tarea.Nota;
      tarea.Peso = params.peso || tarea.Peso;
      tarea.Sem = params.sem || tarea.Sem;
      
      return DB.actualizar('Tareas', tarea);
    }
    
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
    if (params.rowNumber) {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName('Lecturas');
      
      if (!sheet) {
        return { success: false, error: 'Hoja no encontrada: Lecturas' };
      }
      
      var data = sheet.getDataRange().getValues();
      var headers = data[0];
      
      var rowIndex = params.rowNumber - 1;
      if (rowIndex < 1 || rowIndex >= data.length) {
        return { success: false, error: 'Número de fila inválido' };
      }
      
      var lectura = {};
      for (var i = 0; i < headers.length; i++) {
        lectura[headers[i]] = data[rowIndex][i];
      }
      lectura._rowNumber = params.rowNumber;
      
      lectura.Curso = params.curso || lectura.Curso;
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
    }
    
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
    // ✅ FIX V01.22: Si viene rowNumber, lo usamos directamente
    if (params.rowNumber) {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName('HorarioClases');
      
      if (!sheet) {
        return { success: false, error: 'Hoja no encontrada: HorarioClases' };
      }
      
      var data = sheet.getDataRange().getValues();
      var headers = data[0];
      
      // Leer registro actual de la fila específica
      var rowIndex = params.rowNumber - 1;
      if (rowIndex < 1 || rowIndex >= data.length) {
        return { success: false, error: 'Número de fila inválido' };
      }
      
      var clase = {};
      for (var i = 0; i < headers.length; i++) {
        clase[headers[i]] = data[rowIndex][i];
      }
      clase._rowNumber = params.rowNumber;
      
      // Actualizar campos
      clase.Curso = params.curso || clase.Curso;
      clase.HoraInicio = params.horaIni || params.horaInicio || clase.HoraInicio;
      clase.HoraFin = params.horaFin || clase.HoraFin;
      clase.Detalle = params.detalle || clase.Detalle;
      
      return DB.actualizar('HorarioClases', clase);
    }
    
    // Fallback: Si NO viene rowNumber (compatibilidad)
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
    if (params.rowNumber) {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName('HorarioSem');
      
      if (!sheet) {
        return { success: false, error: 'Hoja no encontrada: HorarioSem' };
      }
      
      var data = sheet.getDataRange().getValues();
      var headers = data[0];
      
      var rowIndex = params.rowNumber - 1;
      if (rowIndex < 1 || rowIndex >= data.length) {
        return { success: false, error: 'Número de fila inválido' };
      }
      
      var actividad = {};
      for (var i = 0; i < headers.length; i++) {
        actividad[headers[i]] = data[rowIndex][i];
      }
      actividad._rowNumber = params.rowNumber;
      
      actividad.Actividad = params.actividad || actividad.Actividad;
      actividad.HoraInicio = params.horaInicio || actividad.HoraInicio;
      actividad.HoraFin = params.horaFin || actividad.HoraFin;
      
      if (params.fechaHS) {
        if (params.fechaHS.match(/^\d{4}-\d{2}-\d{2}$/)) {
          actividad.FechaHS = convertirISOaDDMMAAAA(params.fechaHS);
        } else if (params.fechaHS.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
          actividad.FechaHS = params.fechaHS;
        } else {
          Logger.log('⚠️ Formato de fecha no reconocido: ' + params.fechaHS);
        }
      }
      
      actividad.TipoAct = params.tipoAct || actividad.TipoAct;
      actividad.Color = params.color || actividad.Color;
      actividad.Sem = params.sem || actividad.Sem;
      
      return DB.actualizar('HorarioSem', actividad);
    }
    
    var result = DB.buscar('HorarioSem', 'CodeAlum', params.codeAlum);
    if (!result.success) {
      return { success: false, error: 'Actividad no encontrada' };
    }
    
    var actividad = result.data;
    actividad.Actividad = params.actividad || actividad.Actividad;
    actividad.HoraInicio = params.horaInicio || actividad.HoraInicio;
    actividad.HoraFin = params.horaFin || actividad.HoraFin;
    
    if (params.fechaHS) {
      if (params.fechaHS.match(/^\d{4}-\d{2}-\d{2}$/)) {
        actividad.FechaHS = convertirISOaDDMMAAAA(params.fechaHS);
      } else if (params.fechaHS.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        actividad.FechaHS = params.fechaHS;
      } else {
        Logger.log('⚠️ Formato de fecha no reconocido: ' + params.fechaHS);
      }
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

// MOD-010: CONFIG SEMANAS V5 [INICIO]

// MOD-010-001: OBTENER CONFIG SEMANA [INICIO]
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
        var config = {
          FechaReg: data[i][0],
          CodeAlum: data[i][codeAlumIdx],
          FechaInicio: data[i][fechaInicioIdx]
        };
        
        // Agregar FechaFin si existe la columna y tiene valor
        if (fechaFinIdx !== -1 && data[i][fechaFinIdx]) {
          config.FechaFin = data[i][fechaFinIdx];
        }
        
        return { success: true, data: config };
      }
    }
    
    return { success: false, error: 'Configuración no encontrada para el alumno' };
  } catch(error) {
    Logger.log('Error en Student.obtenerConfigSemana(): ' + error.toString());
    return { success: false, error: 'Error al obtener configuración de semana' };
  }
}
// MOD-010-001: FIN

// MOD-010-002: GUARDAR CONFIG SEMANA [INICIO]
function guardarConfigSemana(params) {
  try {
    var codeAlum = params.codeAlum;
    var fechaInicio = params.fechaInicio; // Viene en formato ISO desde frontend
    var fechaFin = params.fechaFin; // Viene en formato ISO desde frontend
    
    // ✅ CONVERTIR a Date de JavaScript
    var fechaInicioDate = new Date(fechaInicio);
    var fechaFinDate = new Date(fechaFin);
    
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
    
    // Si no existe columna FechaFin, retornar error
    if (fechaFinIdx === -1) {
      return { success: false, error: 'Columna FechaFin no encontrada en hoja Fechas' };
    }
    
    // Buscar si ya existe configuración para este alumno
    for (var i = 1; i < data.length; i++) {
      if (data[i][codeAlumIdx] === codeAlum) {
        // ✅ Actualizar registro existente con Date
        var cellInicio = sheet.getRange(i + 1, fechaInicioIdx + 1);
        cellInicio.setNumberFormat('dd/mm/yyyy').setValue(fechaInicioDate);
        
        var cellFin = sheet.getRange(i + 1, fechaFinIdx + 1);
        cellFin.setNumberFormat('dd/mm/yyyy').setValue(fechaFinDate);
        
        Logger.log('✅ Config actualizada como Date: ' + fechaInicioDate + ' a ' + fechaFinDate);
        
        // Generar todas las semanas automáticamente
        var resultSemanas = generarTodasSemanas({
          codeAlum: codeAlum,
          fechaInicio: fechaInicio,
          fechaFin: fechaFin
        });
        
        if (!resultSemanas.success) {
          Logger.log('⚠️ Error al generar semanas: ' + resultSemanas.error);
        } else {
          Logger.log('✅ ' + resultSemanas.data + ' semanas generadas automáticamente');
        }
        
        return { success: true, semanas: resultSemanas.data };
      }
    }
    
    // ✅ Si no existe, crear nuevo registro con Date
    var nuevaFila = [];
    for (var j = 0; j < headers.length; j++) {
      if (headers[j] === 'FechaReg') {
        nuevaFila.push(Utils.fechaHoy());
      } else if (headers[j] === 'CodeAlum') {
        nuevaFila.push(codeAlum);
      } else if (headers[j] === 'FechaInicio') {
        nuevaFila.push(fechaInicioDate);
      } else if (headers[j] === 'FechaFin') {
        nuevaFila.push(fechaFinDate);
      } else {
        nuevaFila.push('');
      }
    }
    
    sheet.appendRow(nuevaFila);
    
    // Formatear las celdas de fecha
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, fechaInicioIdx + 1).setNumberFormat('dd/mm/yyyy');
    sheet.getRange(lastRow, fechaFinIdx + 1).setNumberFormat('dd/mm/yyyy');
    
    Logger.log('✅ Nueva config creada como Date: ' + fechaInicioDate + ' a ' + fechaFinDate);
    
    // Generar todas las semanas automáticamente
    var resultSemanas = generarTodasSemanas({
      codeAlum: codeAlum,
      fechaInicio: fechaInicio,
      fechaFin: fechaFin
    });
    
    if (!resultSemanas.success) {
      Logger.log('⚠️ Error al generar semanas: ' + resultSemanas.error);
    } else {
      Logger.log('✅ ' + resultSemanas.data + ' semanas generadas automáticamente');
    }
    
    return { success: true, semanas: resultSemanas.data };
  } catch(error) {
    Logger.log('Error en Student.guardarConfigSemana(): ' + error.toString());
    return { success: false, error: 'Error al guardar configuración: ' + error.toString() };
  }
}
// MOD-010-002: FIN

// MOD-010-003: GENERAR TODAS SEMANAS [INICIO]
function generarTodasSemanas(params) {
  try {
    var codeAlum = params.codeAlum;
    var fechaInicio = params.fechaInicio; // Formato ISO
    var fechaFin = params.fechaFin; // Formato ISO
    
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
    
    if (codeAlumIdx === -1) {
      return { success: false, error: 'Estructura de hoja Semanas incorrecta' };
    }
    
    // PASO 1: Eliminar todas las semanas anteriores del alumno
    Logger.log('🗑️ Eliminando semanas anteriores del alumno ' + codeAlum);
    for (var i = data.length - 1; i >= 1; i--) {
      if (data[i][codeAlumIdx] === codeAlum) {
        sheet.deleteRow(i + 1);
      }
    }
    
    // PASO 2: Calcular semanas desde inicio hasta fin
    var inicio = new Date(fechaInicio + 'T00:00:00');
    var fin = new Date(fechaFin + 'T00:00:00');
    
    // Ajustar inicio al lunes de esa semana
    var diaSemanaInicio = inicio.getDay();
    var diasHastaLunes = diaSemanaInicio === 0 ? 6 : diaSemanaInicio - 1;
    var primerLunes = new Date(inicio);
    primerLunes.setDate(primerLunes.getDate() - diasHastaLunes);
    
    Logger.log('📅 Primer lunes: ' + primerLunes.toISOString().split('T')[0]);
    Logger.log('📅 Fecha fin: ' + fin.toISOString().split('T')[0]);
    
    // PASO 3: Generar semanas consecutivas
    var numSemana = 1;
    var lunesActual = new Date(primerLunes);
    var semanasGeneradas = 0;
    
    while (lunesActual <= fin) {
      var domingo = new Date(lunesActual);
      domingo.setDate(domingo.getDate() + 6);
      
      // ✅ Guardar como Date, no como string
      var fechaInicioSemana = new Date(lunesActual);
      var fechaFinSemana = new Date(domingo);
      
      // Crear fila para esta semana
      var nuevaFila = [];
      for (var j = 0; j < headers.length; j++) {
        if (headers[j] === 'FechaReg') {
          nuevaFila.push(Utils.fechaHoy());
        } else if (headers[j] === 'CodeAlum') {
          nuevaFila.push(codeAlum);
        } else if (headers[j] === 'FechaInicio') {
          nuevaFila.push(fechaInicioSemana);
        } else if (headers[j] === 'FechaFin') {
          nuevaFila.push(fechaFinSemana);
        } else if (headers[j] === 'Semana') {
          nuevaFila.push(numSemana);
        } else {
          nuevaFila.push('');
        }
      }
      
      sheet.appendRow(nuevaFila);
      
      // Formatear celdas de fecha
      var lastRow = sheet.getLastRow();
      if (fechaInicioIdx !== -1) {
        sheet.getRange(lastRow, fechaInicioIdx + 1).setNumberFormat('dd/mm/yyyy');
      }
      if (fechaFinIdx !== -1) {
        sheet.getRange(lastRow, fechaFinIdx + 1).setNumberFormat('dd/mm/yyyy');
      }
      
      semanasGeneradas++;
      
      Logger.log('✅ Semana ' + numSemana + ': ' + 
                 fechaInicioSemana.toISOString().split('T')[0] + ' → ' + 
                 fechaFinSemana.toISOString().split('T')[0]);
      
      // Avanzar al siguiente lunes
      lunesActual.setDate(lunesActual.getDate() + 7);
      numSemana++;
    }
    
    Logger.log('🎉 Total semanas generadas: ' + semanasGeneradas);
    
    return { success: true, data: semanasGeneradas };
  } catch(error) {
    Logger.log('Error en Student.generarTodasSemanas(): ' + error.toString());
    return { success: false, error: 'Error al generar semanas: ' + error.toString() };
  }
}
// MOD-010-003: FIN

// MOD-010-004: COPIAR SEMANA [INICIO]
function copiarSemana(params) {
  try {
    var codeAlum = params.codeAlum;
    var fechaInicioOrigen = new Date(params.fechaInicioOrigen + 'T00:00:00');
    var fechaFinOrigen = new Date(params.fechaFinOrigen + 'T00:00:00');
    var fechaInicioDestino = new Date(params.fechaInicioDestino + 'T00:00:00');
    
    // Validar fechas
    if (isNaN(fechaInicioOrigen.getTime()) || isNaN(fechaFinOrigen.getTime()) || isNaN(fechaInicioDestino.getTime())) {
      Logger.log('❌ copiarSemana: Fechas inválidas');
      return { success: false, error: 'Fechas inválidas' };
    }
    
    Logger.log('📋 Copiando actividades de ' + params.fechaInicioOrigen + ' a ' + params.fechaInicioDestino);
    
    var todasActividades = DB.obtenerPorAlumno('HorarioSem', codeAlum);
    
    if (!todasActividades.success) {
      Logger.log('⚠️ No se pudieron obtener actividades');
      return { success: true, data: 0 };
    }
    
    var actividadesACopiar = [];
    
    // Filtrar actividades dentro del rango de origen
    for (var i = 0; i < todasActividades.data.length; i++) {
      var act = todasActividades.data[i];
      var fechaAct = parsearFechaDDMMAAAABackend(act.FechaHS);
      
      if (fechaAct >= fechaInicioOrigen && fechaAct <= fechaFinOrigen) {
        actividadesACopiar.push(act);
      }
    }
    
    Logger.log('📋 Actividades a copiar: ' + actividadesACopiar.length);
    
    var copiadas = 0;
    
    // Copiar cada actividad ajustando la fecha
    for (var j = 0; j < actividadesACopiar.length; j++) {
      var original = actividadesACopiar[j];
      var fechaOriginal = parsearFechaDDMMAAAABackend(original.FechaHS);
      
      // Calcular diferencia en días desde el inicio de la semana origen
      var diffDias = Math.floor((fechaOriginal - fechaInicioOrigen) / (1000 * 60 * 60 * 24));
      
      // Calcular nueva fecha sumando la diferencia al inicio de destino
      var nuevaFecha = new Date(fechaInicioDestino);
      nuevaFecha.setDate(nuevaFecha.getDate() + diffDias);
      
      // Formatear fecha a DD/MM/AAAA
      var dia = String(nuevaFecha.getDate()).padStart(2, '0');
      var mes = String(nuevaFecha.getMonth() + 1).padStart(2, '0');
      var anio = nuevaFecha.getFullYear();
      var fechaFormateada = dia + '/' + mes + '/' + anio;
      
      // Crear nueva actividad
      var nuevaActividad = {
        FechaReg: Utils.fechaHoy(),
        CodeAlum: codeAlum,
        Actividad: original.Actividad,
        HoraInicio: original.HoraInicio,
        HoraFin: original.HoraFin,
        FechaHS: fechaFormateada,
        TipoAct: original.TipoAct,
        Color: original.Color,
        Sem: original.Sem
      };
      
      var resultado = DB.agregar('HorarioSem', nuevaActividad);
      if (resultado.success) {
        copiadas++;
      }
    }
    
    Logger.log('✅ Actividades copiadas: ' + copiadas);
    return { success: true, data: copiadas };
    
  } catch(error) {
    Logger.log('Error en Student.copiarSemana(): ' + error.toString());
    return { success: false, error: 'Error al copiar semana' };
  }
}
// MOD-010-004: FIN

// MOD-010-005: LIMPIAR SEMANA [INICIO]
function limpiarSemana(params) {
  try {
    var codeAlum = params.codeAlum;
    var fechaInicio = new Date(params.fechaInicio + 'T00:00:00');
    var fechaFin = new Date(params.fechaFin + 'T00:00:00');
    
    // Validar fechas
    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      Logger.log('❌ limpiarSemana: Fechas inválidas');
      return { success: false, error: 'Fechas inválidas' };
    }
    
    Logger.log('🗑️ Limpiando semana de ' + params.fechaInicio + ' a ' + params.fechaFin);
    
    var todasActividades = DB.obtenerPorAlumno('HorarioSem', codeAlum);
    
    if (!todasActividades.success) {
      Logger.log('⚠️ No se pudieron obtener actividades');
      return { success: true, data: 0 };
    }
    
    var eliminadas = 0;
    
    for (var i = 0; i < todasActividades.data.length; i++) {
      var act = todasActividades.data[i];
      var fechaAct = parsearFechaDDMMAAAABackend(act.FechaHS);
      
      if (fechaAct >= fechaInicio && fechaAct <= fechaFin) {
        var resultado = DB.eliminar('HorarioSem', act._rowNumber);
        if (resultado.success) {
          eliminadas++;
        }
      }
    }
    
    Logger.log('✅ Actividades eliminadas: ' + eliminadas);
    return { success: true, data: eliminadas };
    
  } catch(error) {
    Logger.log('Error en Student.limpiarSemana(): ' + error.toString());
    return { success: false, error: 'Error al limpiar semana' };
  }
}
// MOD-010-005: FIN

// MOD-010-006: HELPER PARSEAR FECHA [INICIO]
function parsearFechaDDMMAAAABackend(fechaStr) {
  if (!fechaStr) return new Date('invalid');
  
  var str = String(fechaStr).trim();
  
  // Formato DD/MM/AAAA
  var match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    var dia = parseInt(match[1], 10);
    var mes = parseInt(match[2], 10) - 1;
    var anio = parseInt(match[3], 10);
    return new Date(anio, mes, dia);
  }
  
  return new Date(str);
}
// MOD-010-006: FIN

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
    
    var fechaInicioDate = parsearFechaISO(params.fechaInicio);
    var fechaFinDate = parsearFechaISO(params.fechaFin);
    
    var nuevaFila = [];
    for (var j = 0; j < headers.length; j++) {
      if (headers[j] === 'FechaReg') {
        nuevaFila.push(Utils.fechaHoy());
      } else if (headers[j] === 'CodeAlum') {
        nuevaFila.push(params.codeAlum);
      } else if (headers[j] === 'FechaInicio') {
        nuevaFila.push(fechaInicioDate);
      } else if (headers[j] === 'FechaFin') {
        nuevaFila.push(fechaFinDate);
      } else if (headers[j] === 'Semana') {
        nuevaFila.push(params.semana);
      } else {
        nuevaFila.push('');
      }
    }
    
    sheet.appendRow(nuevaFila);
    
    Logger.log('✅ Semana ' + params.semana + ' creada con Utils.fechaHoy()');
    
    return { success: true, data: sheet.getLastRow() };
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
  if (!fecha || !(fecha instanceof Date)) {
    Logger.log('⚠️ formatearFechaISO: fecha inválida');
    return '';
  }
  
  var year = fecha.getFullYear();
  var month = String(fecha.getMonth() + 1).padStart(2, '0');
  var day = String(fecha.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

function parsearFechaISO(fechaISO) {
  if (!fechaISO || typeof fechaISO !== 'string') {
    Logger.log('⚠️ parsearFechaISO: entrada inválida');
    return new Date();
  }
  
  var partes = fechaISO.split('-');
  if (partes.length !== 3) {
    Logger.log('⚠️ parsearFechaISO: formato incorrecto');
    return new Date();
  }
  
  var anio = parseInt(partes[0], 10);
  var mes = parseInt(partes[1], 10) - 1;
  var dia = parseInt(partes[2], 10);
  
  return new Date(anio, mes, dia);
}

function convertirISOaDDMMAAAA(fechaISO) {
  if (!fechaISO || typeof fechaISO !== 'string') {
    return '';
  }
  
  var partes = fechaISO.split('-');
  if (partes.length !== 3) {
    return '';
  }
  
  return partes[2] + '/' + partes[1] + '/' + partes[0];
}
// MOD-014: FIN

// MOD-015: OBTENER NOTAS GRID [INICIO]
function obtenerNotasGrid(params) {
  try {
    var codeAlum = params.codeAlum;

    // Obtener FechaInicio de clases desde hoja Fechas
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetFechas = ss.getSheetByName('Fechas');
    if (!sheetFechas) {
      return { success: false, error: 'Hoja no encontrada: Fechas' };
    }

    var dataFechas = sheetFechas.getDataRange().getValues();
    var headersFechas = dataFechas[0];
    var codeAlumIdxF = headersFechas.indexOf('CodeAlum');
    var fechaInicioIdxF = headersFechas.indexOf('FechaInicio');

    var fechaInicioClases = null;
    for (var f = 1; f < dataFechas.length; f++) {
      if (dataFechas[f][codeAlumIdxF] === codeAlum) {
        fechaInicioClases = dataFechas[f][fechaInicioIdxF];
        break;
      }
    }

    if (!fechaInicioClases) {
      return { success: false, error: 'No hay fecha de inicio configurada' };
    }

    // Calcular lunes de la Semana 1
    var fechaBase = (fechaInicioClases instanceof Date)
      ? new Date(fechaInicioClases)
      : parsearFechaISO(fechaInicioClases);
    fechaBase.setHours(0, 0, 0, 0);
    var diaSemana = fechaBase.getDay(); // 0=dom, 1=lun...
    var diasHastaLunes = diaSemana === 0 ? 6 : diaSemana - 1;
    var lunesSem1 = new Date(fechaBase);
    lunesSem1.setDate(lunesSem1.getDate() - diasHastaLunes);

    // Obtener cursos del alumno
    var cursosResult = DB.obtenerPorAlumno('Cursos', codeAlum);
    if (!cursosResult.success || !cursosResult.data.length) {
      return { success: true, data: [] };
    }

    // Obtener deberes con peso de las 3 hojas
    var evalResult    = DB.obtenerPorAlumno('Eval',    codeAlum);
    var tareasResult  = DB.obtenerPorAlumno('Tareas',  codeAlum);
    var lecturasResult = DB.obtenerPorAlumno('Lecturas', codeAlum);

    var todosDeberes = [];

    if (evalResult.success) {
      evalResult.data.forEach(function(item) {
        if (item.Peso && item.Peso !== '') {
          todosDeberes.push({
            tipo:      'eval',
            rowNumber: item._rowNumber,
            curso:     item.Curso,
            nombre:    item.NomEval,
            fecha:     _formatearFecha(item.FechaEval),
            fechaObj:  _parsearFechaGrid(item.FechaEval),
            nota:      item.Nota !== undefined ? item.Nota : '',
            peso:      item.Peso,
            fechaEval: _formatearFecha(item.FechaEval)
          });
        }
      });
    }

    if (tareasResult.success) {
      tareasResult.data.forEach(function(item) {
        if (item.Peso && item.Peso !== '') {
          todosDeberes.push({
            tipo:      'tarea',
            rowNumber: item._rowNumber,
            curso:     item.Curso,
            nombre:    item.Tarea,
            fecha:     _formatearFecha(item.FechaEntrega),
            fechaObj:  _parsearFechaGrid(item.FechaEntrega),
            nota:      item.Nota !== undefined ? item.Nota : '',
            peso:      item.Peso,
            fechaEntrega: _formatearFecha(item.FechaEntrega),
            fechaAccion:  _formatearFecha(item.FechaAccion)
          });
        }
      });
    }

    if (lecturasResult.success) {
      lecturasResult.data.forEach(function(item) {
        if (item.Peso && item.Peso !== '') {
          todosDeberes.push({
            tipo:      'lect',
            rowNumber: item._rowNumber,
            curso:     item.Curso,
            nombre:    item.Lectura,
            fecha:     _formatearFecha(item.FechaEval),
            fechaObj:  _parsearFechaGrid(item.FechaEval),
            nota:      item.Nota !== undefined ? item.Nota : '',
            peso:      item.Peso,
            fechaInicio: _formatearFecha(item.FechaInicio),
            fechaFin:    _formatearFecha(item.FechaFin),
            fechaEval:   _formatearFecha(item.FechaEval),
            cantPag:     item.CantPag  || '',
            pagActual:   item.PagActual || ''
          });
        }
      });
    }

    // Construir resultado agrupado por curso
    var resultado = [];

    cursosResult.data.forEach(function(curso) {
      var deberesDelCurso = todosDeberes.filter(function(d) {
        return d.curso === curso.Curso;
      });

      // Calcular semana para cada deber
      deberesDelCurso.forEach(function(d) {
        d.semana = _calcularSemana(d.fechaObj, lunesSem1);
      });

      // Ordenar por fecha
      deberesDelCurso.sort(function(a, b) {
        if (!a.fechaObj) return 1;
        if (!b.fechaObj) return -1;
        return a.fechaObj - b.fechaObj;
      });

      // Limpiar fechaObj antes de retornar (no serializable)
      deberesDelCurso.forEach(function(d) {
        delete d.fechaObj;
      });

      resultado.push({
        curso:    curso.Curso,
        completo: curso.Completo,
        color:    curso.Color || '#667eea',
        deberes:  deberesDelCurso
      });
    });

    return { success: true, data: resultado };

  } catch(error) {
    Logger.log('Error en Student.obtenerNotasGrid(): ' + error.toString());
    return { success: false, error: 'Error al obtener notas grid' };
  }
}

// Helper: calcular número de semana dado una fecha y el lunes base
function _calcularSemana(fechaObj, lunesSem1) {
  if (!fechaObj || isNaN(fechaObj.getTime())) return null;
  var diff = fechaObj - lunesSem1;
  if (diff < 0) return null;
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 7)) + 1;
}

// Helper: parsear fecha DD/MM/AAAA o Date a objeto Date
function _parsearFechaGrid(valor) {
  if (!valor) return null;
  if (valor instanceof Date) {
    var d = new Date(valor);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  var str = String(valor).trim();
  var match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
  }
  return null;
}

// Helper: formatear fecha a DD/MM/AAAA
function _formatearFecha(valor) {
  if (!valor) return '';
  if (valor instanceof Date) {
    var dia = String(valor.getDate()).padStart(2, '0');
    var mes = String(valor.getMonth() + 1).padStart(2, '0');
    return dia + '/' + mes + '/' + valor.getFullYear();
  }
  return String(valor);
}
// MOD-015: FIN

// MOD-016: EXPORTACIÓN [INICIO]
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
  obtenerDeberesPorTipo: obtenerDeberesPorTipo,
  obtenerNotasGrid: obtenerNotasGrid
};
// MOD-016: FIN

// MOD-017: CIERRE [INICIO]
})();
// MOD-017: FIN

// MOD-099: NOTAS [INICIO]
/*
DESCRIPCIÓN:
Lógica de negocio para gestión académica del alumno.
Única capa entre frontend y DB.

CRÍTICO:
- actualizarCurso() propaga cambio de nombre a Repasos, Eval, Tareas,
  Lecturas y HorarioClases vía DB.propagarNombreCurso()
- Student NUNCA accede a SpreadsheetApp directamente, solo vía DB
- obtenerNotasGrid() accede a SpreadsheetApp solo para leer hoja Fechas
  (FechaInicio no está en DB). Todo lo demás va por DB.

DEPENDENCIAS:
- DB    → 1db.gs
- Utils → 1utils.gs

CAMBIOS V01.29 → V01.30:
- Agregado MOD-015: obtenerNotasGrid()
  Retorna deberes con peso agrupados por curso, con semana calculada
  al vuelo desde FechaInicio de hoja Fechas
- MOD-015 (Exportación) renombrado a MOD-016
- MOD-016 (Cierre) renombrado a MOD-017
*/
// MOD-099: FIN
