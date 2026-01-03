/*
******************************************
PBE CONTROL - 1student.gs - V01.15
Sistema de Gestión Académica
03/01/2026 - 23:30
******************************************

CONTENIDO:
- Lógica de negocio del estudiante
- Funciones para panel del estudiante
- NO accede directamente a Sheets (usa DB)

CATEGORÍAS:
- Cursos: obtener, agregar, actualizar, eliminar
- Repasos: obtener, agregar, actualizar, eliminar
- Evaluaciones: obtener, agregar, actualizar, eliminar
- Tareas: obtener, agregar, actualizar, eliminar
- Lecturas: obtener, agregar, actualizar, eliminar
- HorarioClases: obtener, agregar, actualizar, eliminar
- HorarioSem: obtener, agregar, eliminar
- Notas: obtenerPorCurso, obtenerResumen
- Deberes: obtenerTodos, obtenerPorTipo

IMPORTANTE:
- NUNCA acceder a SHEET directamente
- SIEMPRE usar DB para operaciones de datos
- Retorna siempre { success, data/error }
- VALIDACIONES: Un alumno NO puede tener registros duplicados

🔑 REGLAS DE UNICIDAD:
• Curso: Nombre corto único por alumno
• Repaso: Curso+Tema único por alumno
• Evaluación: Curso+NomEval único por alumno
• Tarea: Curso+Tarea único por alumno
• Lectura: Curso+Lectura único por alumno

******************************************
*/

// ==========================================
// MÓDULO STUDENT - LÓGICA DEL ESTUDIANTE
// ==========================================

var Student = (function() {
  
  // ==========================================
  // 1. CURSOS
  // ==========================================
  
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
   * 
   * ⚠️ VALIDACIÓN: Curso NO puede duplicarse para un alumno
   */
  function agregarCurso(params) {
    try {
      // ==========================================
      // VALIDACIÓN: Unicidad de Curso
      // ==========================================
      
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
      
      // ==========================================
      // Agregar curso
      // ==========================================
      
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
      // Buscar el curso por _rowNumber
      var result = DB.buscar('Cursos', 'CodeAlum', params.codeAlum);
      if (!result.success) {
        return { success: false, error: 'Curso no encontrado' };
      }
      
      // Actualizar campos
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
  
  // ==========================================
  // 2. REPASOS
  // ==========================================
  
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
   * 
   * ⚠️ VALIDACIÓN: Curso+Tema NO puede duplicarse
   */
  function agregarRepaso(params) {
    try {
      // ==========================================
      // VALIDACIÓN: Unicidad de Curso+Tema
      // ==========================================
      
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
      
      // ==========================================
      // Agregar repaso
      // ==========================================
      
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
  
  // ==========================================
  // 3. EVALUACIONES
  // ==========================================
  
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
   * 
   * ⚠️ VALIDACIÓN: Curso+NomEval NO puede duplicarse
   */
  function agregarEvaluacion(params) {
    try {
      // ==========================================
      // VALIDACIÓN: Unicidad de Curso+NomEval
      // ==========================================
      
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
      
      // ==========================================
      // Agregar evaluación
      // ==========================================
      
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
  
  // ==========================================
  // 4. TAREAS
  // ==========================================
  
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
   * 
   * ⚠️ VALIDACIÓN: Curso+Tarea NO puede duplicarse
   */
  function agregarTarea(params) {
    try {
      // ==========================================
      // VALIDACIÓN: Unicidad de Curso+Tarea
      // ==========================================
      
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
      
      // ==========================================
      // Agregar tarea
      // ==========================================
      
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
  
  // ==========================================
  // 5. LECTURAS
  // ==========================================
  
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
   * 
   * ⚠️ VALIDACIÓN: Curso+Lectura NO puede duplicarse
   */
  function agregarLectura(params) {
    try {
      // ==========================================
      // VALIDACIÓN: Unicidad de Curso+Lectura
      // ==========================================
      
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
      
      // ==========================================
      // Agregar lectura
      // ==========================================
      
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
  
  // ==========================================
  // 6. HORARIO DE CLASES
  // ==========================================
  
  /**
   * Obtener horario de clases del estudiante
   * ⚠️ CRÍTICO: Mapea HoraInicio → HoraIni
   */
  function obtenerHorarioClases(params) {
    try {
      var codeAlum = params.codeAlum;
      var result = DB.obtenerPorAlumno('HorarioClases', codeAlum);
      
      if (result.success) {
        // ⚠️ MAPEO CRÍTICO: HoraInicio → HoraIni
        result.data = result.data.map(function(item) {
          return {
            FechaReg: item.FechaReg,
            CodeAlum: item.CodeAlum,
            Curso: item.Curso,
            HoraIni: item.HoraInicio, // ← MAPEO
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
   * 
   * ⚠️ FLEXIBILIDAD: Acepta horaIni (frontend) o horaInicio (tests)
   */
  function agregarHorarioClase(params) {
    try {
      var clase = {
        FechaReg: Utils.fechaHoy(),
        CodeAlum: params.codeAlum,
        Curso: params.curso,
        HoraInicio: params.horaIni || params.horaInicio, // ← Acepta ambos
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
  
  // ==========================================
  // 7. HORARIO SEMANAL
  // ==========================================
  
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
  
  // ==========================================
  // 8. NOTAS
  // ==========================================
  
  /**
   * Obtener promedio ponderado de un curso específico
   * Combina: Eval + Tareas + Lecturas
   */
  function obtenerNotasPorCurso(params) {
    try {
      var codeAlum = params.codeAlum;
      var curso = params.curso;
      
      // Obtener evaluaciones del curso
      var eval = DB.obtenerPorAlumno('Eval', codeAlum);
      var evalCurso = eval.success ? 
        eval.data.filter(function(e) { return e.Curso === curso; }) : [];
      
      // Obtener tareas del curso
      var tareas = DB.obtenerPorAlumno('Tareas', codeAlum);
      var tareasCurso = tareas.success ? 
        tareas.data.filter(function(t) { return t.Curso === curso; }) : [];
      
      // Obtener lecturas del curso
      var lecturas = DB.obtenerPorAlumno('Lecturas', codeAlum);
      var lecturasCurso = lecturas.success ? 
        lecturas.data.filter(function(l) { return l.Curso === curso; }) : [];
      
      // Calcular promedio ponderado
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
      
      // Obtener todos los cursos del estudiante
      var cursosResult = DB.obtenerPorAlumno('Cursos', codeAlum);
      if (!cursosResult.success) {
        return { success: false, error: 'No se pudieron obtener los cursos' };
      }
      
      var resumen = [];
      
      // Para cada curso, calcular promedio
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
  
  // ==========================================
  // 9. DEBERES (VISTA UNIFICADA)
  // ==========================================
  
  /**
   * Obtener todos los deberes (Eval + Tareas + Lecturas)
   */
  function obtenerTodosDeberes(params) {
    try {
      var codeAlum = params.codeAlum;
      var deberes = [];
      
      // Obtener evaluaciones
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
      
      // Obtener tareas
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
      
      // Obtener lecturas
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
      
      // Ordenar por fecha (más próxima primero)
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
      var tipo = params.tipo; // 'Evaluación', 'Tarea', 'Lectura'
      
      var sheetName = tipo === 'Evaluación' ? 'Eval' : 
                      tipo === 'Tarea' ? 'Tareas' : 'Lecturas';
      
      return DB.obtenerPorAlumno(sheetName, codeAlum);
    } catch(error) {
      Logger.log('Error en Student.obtenerDeberesPorTipo(): ' + error.toString());
      return { success: false, error: 'Error al obtener deberes por tipo' };
    }
  }
  
  // ==========================================
  // EXPORTAR FUNCIONES PÚBLICAS
  // ==========================================
  
  return {
    // Cursos
    obtenerCursos: obtenerCursos,
    agregarCurso: agregarCurso,
    actualizarCurso: actualizarCurso,
    eliminarCurso: eliminarCurso,
    // Repasos
    obtenerRepasos: obtenerRepasos,
    agregarRepaso: agregarRepaso,
    actualizarRepaso: actualizarRepaso,
    eliminarRepaso: eliminarRepaso,
    // Evaluaciones
    obtenerEvaluaciones: obtenerEvaluaciones,
    agregarEvaluacion: agregarEvaluacion,
    actualizarEvaluacion: actualizarEvaluacion,
    eliminarEvaluacion: eliminarEvaluacion,
    // Tareas
    obtenerTareas: obtenerTareas,
    agregarTarea: agregarTarea,
    actualizarTarea: actualizarTarea,
    eliminarTarea: eliminarTarea,
    // Lecturas
    obtenerLecturas: obtenerLecturas,
    agregarLectura: agregarLectura,
    actualizarLectura: actualizarLectura,
    eliminarLectura: eliminarLectura,
    // HorarioClases
    obtenerHorarioClases: obtenerHorarioClases,
    agregarHorarioClase: agregarHorarioClase,
    actualizarHorarioClase: actualizarHorarioClase,
    eliminarHorarioClase: eliminarHorarioClase,
    // HorarioSem
    obtenerHorarioSem: obtenerHorarioSem,
    agregarHorarioSem: agregarHorarioSem,
    eliminarHorarioSem: eliminarHorarioSem,
    // Notas
    obtenerNotasPorCurso: obtenerNotasPorCurso,
    obtenerResumenNotas: obtenerResumenNotas,
    // Deberes
    obtenerTodosDeberes: obtenerTodosDeberes,
    obtenerDeberesPorTipo: obtenerDeberesPorTipo
  };
  
})();

// ==========================================
// FIN DE 1student.gs - V01.15
// Total: 31 funciones públicas
// - Cursos (4), Repasos (4), Evaluaciones (4)
// - Tareas (4), Lecturas (4), HorarioClases (4)
// - HorarioSem (3), Notas (2), Deberes (2)
//
// CAMBIOS EN V01.15:
// ✅ Validación de unicidad en agregarCurso()
// ✅ Validación de unicidad en agregarRepaso()
// ✅ Validación de unicidad en agregarEvaluacion()
// ✅ Validación de unicidad en agregarTarea()
// ✅ Validación de unicidad en agregarLectura()
// ✅ Flexibilidad horaIni/horaInicio en agregarHorarioClase()
// ==========================================
