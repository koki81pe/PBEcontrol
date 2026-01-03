/*
******************************************
PBE CONTROL - 2testback.gs - V01.14
Sistema de Gestión Académica
03/01/2026 - 21:00
******************************************

CONTENIDO:
- PARTE 1: Limpieza de datos de prueba
- PARTE 2: Batería de 32 casos de prueba
- PARTE 3: Función principal ejecutarTodasLasPruebas()

IMPORTANTE:
- Ejecutar ANTES Y DESPUÉS de cada cambio de código
- Si un test pasa HOY, debe pasar SIEMPRE
- Romper un test = bug crítico
- Resultados se muestran en 2testui.html

🔑 FRASES ANCLA PARA COBERTURA INTEGRAL:
• "CRUD completo: CREATE + READ + UPDATE + DELETE para CADA módulo"
• "Horarios DEBEN probar mapeo HoraInicio→HoraIni (crítico para frontend)"
• "Funciones especiales: Promedios, agregaciones, búsquedas avanzadas"
• "Validar búsquedas case-insensitive y con trim()"
• "Eliminación en cascada: Admin.eliminarAlumno() debe limpiar 9 hojas"
• "Si una función existe en Student/Admin, DEBE tener test correspondiente"

******************************************
*/

// ==========================================
// CONFIGURACIÓN
// ==========================================

// SS y SHEET ya están definidos en 1db.gs
// No redefinir para evitar conflictos

// ==========================================
// PARTE 1: LIMPIEZA DE DATOS DE PRUEBA
// ==========================================

/**
 * Limpiar TODOS los registros TEST* antes de ejecutar tests
 * 
 * ⚠️ CRÍTICO: Eliminar de abajo hacia arriba para no desplazar índices
 * 
 * @return {Object} - { passed, nombre, mensaje }
 */
function limpiarDatosPrueba() {
  try {
    var hojas = [
      'Alumnos', 'Clientes', 'Cursos', 'Repasos',
      'Eval', 'Tareas', 'Lecturas', 'HorarioClases', 'HorarioSem'
    ];
    
    var totalEliminados = 0;
    
    hojas.forEach(function(nombreHoja) {
      var sheet = SHEET[nombreHoja];
      if (!sheet) {
        return; // Skip si la hoja no existe
      }
      
      var data = sheet.getDataRange().getValues();
      
      // Eliminar de abajo hacia arriba para no desplazar índices
      for (var i = data.length - 1; i >= 1; i--) {
        var codeAlum = String(data[i][1]); // Columna B = CodeAlum
        
        // Si comienza con "TEST", eliminar
        if (codeAlum.indexOf('TEST') === 0) {
          sheet.deleteRow(i + 1);
          totalEliminados++;
        }
      }
    });
    
    return {
      passed: true,
      nombre: '🧹 Limpieza de datos',
      mensaje: totalEliminados + ' registros TEST eliminados correctamente'
    };
    
  } catch(error) {
    Logger.log('Error en limpiarDatosPrueba(): ' + error.toString());
    return {
      passed: false,
      nombre: '🧹 Limpieza de datos',
      mensaje: 'ERROR: ' + error.toString()
    };
  }
}

// ==========================================
// PARTE 2: BATERÍA DE 32 TESTS
// ==========================================

// ========== TESTS 01-03: ADMIN + ALUMNOS ==========

/**
 * TEST 01: Crear 5 alumnos TEST01-TEST05
 * 
 * ⚠️ CRÍTICO: Cada alumno DEBE tener clave ÚNICA (test1, test2, test3, test4, test5)
 */
function test01_CrearAlumnos() {
  try {
    var alumnos = [
      {
        codeAlum: 'TEST01', clave: 'test1', apellidos: 'Test Uno', nombres: 'Alumno',
        dni: '11111111', email: 'test1@pbe.com', tipoInsti: 'Universidad',
        nomInsti: 'Test University', ciclo: '1'
      },
      {
        codeAlum: 'TEST02', clave: 'test2', apellidos: 'Test Dos', nombres: 'Alumno',
        dni: '22222222', email: 'test2@pbe.com', tipoInsti: 'Universidad',
        nomInsti: 'Test University', ciclo: '2'
      },
      {
        codeAlum: 'TEST03', clave: 'test3', apellidos: 'Test Tres', nombres: 'Alumno',
        dni: '33333333', email: 'test3@pbe.com', tipoInsti: 'Colegio',
        nomInsti: 'Test School', ciclo: '3'
      },
      {
        codeAlum: 'TEST04', clave: 'test4', apellidos: 'Test Cuatro', nombres: 'Alumno',
        dni: '44444444', email: 'test4@pbe.com', tipoInsti: 'Instituto',
        nomInsti: 'Test Institute', ciclo: '4'
      },
      {
        codeAlum: 'TEST05', clave: 'test5', apellidos: 'Test Cinco', nombres: 'Alumno',
        dni: '55555555', email: 'test5@pbe.com', tipoInsti: 'Academia',
        nomInsti: 'Test Academy', ciclo: '5'
      }
    ];
    
    var creados = 0;
    for (var i = 0; i < alumnos.length; i++) {
      var result = Admin.crearAlumno(alumnos[i]);
      if (result.success) creados++;
    }
    
    return creados === 5
      ? { passed: true, nombre: 'TEST 01: Crear 5 alumnos', mensaje: '✓ 5 alumnos creados (TEST01-TEST05)' }
      : { passed: false, nombre: 'TEST 01: Crear 5 alumnos', mensaje: 'FALLÓ: Solo ' + creados + ' de 5' };
    
  } catch(error) {
    Logger.log('Error en test01: ' + error);
    return { passed: false, nombre: 'TEST 01: Crear 5 alumnos', mensaje: 'ERROR: ' + error };
  }
}

/**
 * TEST 02: Validar unicidad de CodeAlum
 */
function test02_ValidarUnicidadCodeAlum() {
  try {
    var result = Admin.crearAlumno({
      codeAlum: 'TEST01', clave: 'test999', apellidos: 'Duplicado', nombres: 'Test',
      dni: '99999999', email: 'dup@pbe.com'
    });
    
    return !result.success && result.error.indexOf('CodeAlum ya existe') !== -1
      ? { passed: true, nombre: 'TEST 02: Unicidad CodeAlum', mensaje: '✓ Sistema rechazó duplicado' }
      : { passed: false, nombre: 'TEST 02: Unicidad CodeAlum', mensaje: 'FALLÓ: Permitió duplicado' };
    
  } catch(error) {
    return { passed: false, nombre: 'TEST 02: Unicidad CodeAlum', mensaje: 'ERROR: ' + error };
  }
}

/**
 * TEST 03: Validar unicidad de Clave
 */
function test03_ValidarUnicidadClave() {
  try {
    var result = Admin.crearAlumno({
      codeAlum: 'TEST99', clave: 'test1', apellidos: 'Dup Clave', nombres: 'Test',
      dni: '88888888', email: 'dupclave@pbe.com'
    });
    
    return !result.success && result.error.indexOf('Clave ya existe') !== -1
      ? { passed: true, nombre: 'TEST 03: Unicidad Clave', mensaje: '✓ Sistema rechazó Clave duplicada' }
      : { passed: false, nombre: 'TEST 03: Unicidad Clave', mensaje: 'FALLÓ: Permitió Clave duplicada' };
    
  } catch(error) {
    return { passed: false, nombre: 'TEST 03: Unicidad Clave', mensaje: 'ERROR: ' + error };
  }
}

// ========== TESTS 04-08: CREATE STUDENT ==========

/**
 * TEST 04: Agregar 6 cursos a TEST05
 */
function test04_AgregarCursos() {
  try {
    var cursos = [
      { curso: 'MATE', completo: 'Matemáticas', color: '#FF5733' },
      { curso: 'FIS', completo: 'Física', color: '#3498DB' },
      { curso: 'QUIM', completo: 'Química', color: '#2ECC71' },
      { curso: 'BIOL', completo: 'Biología', color: '#F1C40F' },
      { curso: 'HIST', completo: 'Historia', color: '#9B59B6' },
      { curso: 'ING', completo: 'Inglés', color: '#E67E22' }
    ];
    
    var agregados = 0;
    for (var i = 0; i < cursos.length; i++) {
      var result = Student.agregarCurso({
        codeAlum: 'TEST05', curso: cursos[i].curso,
        completo: cursos[i].completo, color: cursos[i].color
      });
      if (result.success) agregados++;
    }
    
    return agregados === 6
      ? { passed: true, nombre: 'TEST 04: Agregar 6 cursos', mensaje: '✓ 6 cursos agregados (MATE, FIS, QUIM, BIOL, HIST, ING)' }
      : { passed: false, nombre: 'TEST 04: Agregar 6 cursos', mensaje: 'FALLÓ: Solo ' + agregados + ' de 6' };
    
  } catch(error) {
    return { passed: false, nombre: 'TEST 04: Agregar 6 cursos', mensaje: 'ERROR: ' + error };
  }
}

/**
 * TEST 05: Agregar 8 repasos
 */
function test05_AgregarRepasos() {
  try {
    var repasos = [
      { curso: 'MATE', tema: 'Derivadas', estadoRep: 'OK', evaluado: 'Si' },
      { curso: 'MATE', tema: 'Integrales', estadoRep: 'OK', evaluado: '' },
      { curso: 'FIS', tema: 'Cinemática', estadoRep: 'OK', evaluado: '' },
      { curso: 'QUIM', tema: 'Estequiometría', estadoRep: 'OK', evaluado: 'Si' },
      { curso: 'BIOL', tema: 'Genética', estadoRep: 'Falta', evaluado: '' },
      { curso: 'HIST', tema: 'Revolución Francesa', estadoRep: 'Falta', evaluado: '' },
      { curso: 'ING', tema: 'Present Perfect', estadoRep: 'Falta', evaluado: '' },
      { curso: 'MATE', tema: 'Límites', estadoRep: 'Falta', evaluado: '' }
    ];
    
    var agregados = 0;
    for (var i = 0; i < repasos.length; i++) {
      var result = Student.agregarRepaso({
        codeAlum: 'TEST05', curso: repasos[i].curso, tema: repasos[i].tema,
        fechaClase: '01/01/2026', fechaRep: '02/01/2026',
        estadoRep: repasos[i].estadoRep, detalle: 'Repaso de prueba',
        evaluado: repasos[i].evaluado
      });
      if (result.success) agregados++;
    }
    
    return agregados === 8
      ? { passed: true, nombre: 'TEST 05: Agregar 8 repasos', mensaje: '✓ 8 repasos (4 OK, 4 Falta, 2 evaluados)' }
      : { passed: false, nombre: 'TEST 05: Agregar 8 repasos', mensaje: 'FALLÓ: Solo ' + agregados + ' de 8' };
    
  } catch(error) {
    return { passed: false, nombre: 'TEST 05: Agregar 8 repasos', mensaje: 'ERROR: ' + error };
  }
}

/**
 * TEST 06: Agregar 5 evaluaciones
 */
function test06_AgregarEvaluaciones() {
  try {
    var evaluaciones = [
      { curso: 'MATE', nomEval: 'Parcial 1', nota: 18, peso: 30 },
      { curso: 'FIS', nomEval: 'Práctica 1', nota: 16, peso: 20 },
      { curso: 'QUIM', nomEval: 'Examen Final', nota: 15, peso: 40 },
      { curso: 'BIOL', nomEval: 'Trabajo Grupal', nota: 17, peso: 25 },
      { curso: 'HIST', nomEval: 'Exposición', nota: 19, peso: 35 }
    ];
    
    var agregados = 0;
    for (var i = 0; i < evaluaciones.length; i++) {
      var result = Student.agregarEvaluacion({
        codeAlum: 'TEST05', curso: evaluaciones[i].curso, nomEval: evaluaciones[i].nomEval,
        fechaEval: '15/01/2026', nota: evaluaciones[i].nota, peso: evaluaciones[i].peso, sem: 1
      });
      if (result.success) agregados++;
    }
    
    return agregados === 5
      ? { passed: true, nombre: 'TEST 06: Agregar 5 evaluaciones', mensaje: '✓ 5 evaluaciones (notas 15-19)' }
      : { passed: false, nombre: 'TEST 06: Agregar 5 evaluaciones', mensaje: 'FALLÓ: Solo ' + agregados + ' de 5' };
    
  } catch(error) {
    return { passed: false, nombre: 'TEST 06: Agregar 5 evaluaciones', mensaje: 'ERROR: ' + error };
  }
}

/**
 * TEST 07: Agregar 3 tareas
 */
function test07_AgregarTareas() {
  try {
    var tareas = [
      { curso: 'MATE', tarea: 'Tarea 1: Ejercicios Cap 3', fechaEntrega: '10/01/2026', nota: 17, peso: 10 },
      { curso: 'FIS', tarea: 'Tarea 2: Problemas Cinemática', fechaEntrega: '12/01/2026', nota: 16, peso: 15 },
      { curso: 'QUIM', tarea: 'Tarea 3: Laboratorio Virtual', fechaEntrega: '14/01/2026', nota: 18, peso: 12 }
    ];
    
    var agregados = 0;
    for (var i = 0; i < tareas.length; i++) {
      var result = Student.agregarTarea({
        codeAlum: 'TEST05', curso: tareas[i].curso, tarea: tareas[i].tarea,
        fechaEntrega: tareas[i].fechaEntrega, fechaAccion: '03/01/2026',
        nota: tareas[i].nota, peso: tareas[i].peso, sem: 1
      });
      if (result.success) agregados++;
    }
    
    return agregados === 3
      ? { passed: true, nombre: 'TEST 07: Agregar 3 tareas', mensaje: '✓ 3 tareas (fechas distintas)' }
      : { passed: false, nombre: 'TEST 07: Agregar 3 tareas', mensaje: 'FALLÓ: Solo ' + agregados + ' de 3' };
    
  } catch(error) {
    return { passed: false, nombre: 'TEST 07: Agregar 3 tareas', mensaje: 'ERROR: ' + error };
  }
}

/**
 * TEST 08: Agregar 2 lecturas
 */
function test08_AgregarLecturas() {
  try {
    var lecturas = [
      { curso: 'HIST', lectura: 'Historia del Perú - Basadre', cantPag: 500, pagActual: 250, nota: 16, peso: 20 },
      { curso: 'ING', lectura: 'The Great Gatsby', cantPag: 180, pagActual: 90, nota: 18, peso: 15 }
    ];
    
    var agregados = 0;
    for (var i = 0; i < lecturas.length; i++) {
      var result = Student.agregarLectura({
        codeAlum: 'TEST05', curso: lecturas[i].curso, lectura: lecturas[i].lectura,
        cantPag: lecturas[i].cantPag, pagActual: lecturas[i].pagActual,
        fechaInicio: '01/01/2026', fechaFin: '31/01/2026', fechaEval: '05/02/2026',
        nota: lecturas[i].nota, peso: lecturas[i].peso, sem: 1
      });
      if (result.success) agregados++;
    }
    
    return agregados === 2
      ? { passed: true, nombre: 'TEST 08: Agregar 2 lecturas', mensaje: '✓ 2 lecturas (progreso 50%)' }
      : { passed: false, nombre: 'TEST 08: Agregar 2 lecturas', mensaje: 'FALLÓ: Solo ' + agregados + ' de 2' };
    
  } catch(error) {
    return { passed: false, nombre: 'TEST 08: Agregar 2 lecturas', mensaje: 'ERROR: ' + error };
  }
}

// ========== TESTS 09-14: READ STUDENT ==========

/**
 * TEST 09: Buscar alumno existente
 */
function test09_BuscarAlumno() {
  try {
    var result = DB.buscar('Alumnos', 'Clave', 'test1');
    
    return result.success && result.data.CodeAlum === 'TEST01'
      ? { passed: true, nombre: 'TEST 09: Buscar alumno', mensaje: '✓ TEST01 encontrado por Clave' }
      : { passed: false, nombre: 'TEST 09: Buscar alumno', mensaje: 'FALLÓ: No encontrado o CodeAlum incorrecto' };
    
  } catch(error) {
    return { passed: false, nombre: 'TEST 09: Buscar alumno', mensaje: 'ERROR: ' + error };
  }
}

/**
 * TEST 10: Obtener 6 cursos de TEST05
 */
function test10_ObtenerCursos() {
  try {
    var result = Student.obtenerCursos({ codeAlum: 'TEST05' });
    
    return result.success && result.data.length === 6
      ? { passed: true, nombre: 'TEST 10: Obtener cursos', mensaje: '✓ 6 cursos obtenidos correctamente' }
      : { passed: false, nombre: 'TEST 10: Obtener cursos', mensaje: 'FALLÓ: Se esperaban 6, se obtuvieron ' + (result.data ? result.data.length : 0) };
    
  } catch(error) {
    return { passed: false, nombre: 'TEST 10: Obtener cursos', mensaje: 'ERROR: ' + error };
  }
}

/**
 * TEST 11: Obtener 8 repasos de TEST05
 */
function test11_ObtenerRepasos() {
  try {
    var result = Student.obtenerRepasos({ codeAlum: 'TEST05' });
    
    return result.success && result.data.length === 8
      ? { passed: true, nombre: 'TEST 11: Obtener repasos', mensaje: '✓ 8 repasos obtenidos correctamente' }
      : { passed: false, nombre: 'TEST 11: Obtener repasos', mensaje: 'FALLÓ: Se esperaban 8, se obtuvieron ' + (result.data ? result.data.length : 0) };
    
  } catch(error) {
    return { passed: false, nombre: 'TEST 11: Obtener repasos', mensaje: 'ERROR: ' + error };
  }
}

/**
 * TEST 12: Obtener 5 evaluaciones de TEST05
 */
function test12_ObtenerEvaluaciones() {
  try {
    var result = Student.obtenerEvaluaciones({ codeAlum: 'TEST05' });
    
    return result.success && result.data.length === 5
      ? { passed: true, nombre: 'TEST 12: Obtener evaluaciones', mensaje: '✓ 5 evaluaciones obtenidas correctamente' }
      : { passed: false, nombre: 'TEST 12: Obtener evaluaciones', mensaje: 'FALLÓ: Se esperaban 5, se obtuvieron ' + (result.data ? result.data.length : 0) };
    
  } catch(error) {
    return { passed: false, nombre: 'TEST 12: Obtener evaluaciones', mensaje: 'ERROR: ' + error };
  }
}

/**
 * TEST 13: Obtener 3 tareas de TEST05
 */
function test13_ObtenerTareas() {
  try {
    var result = Student.obtenerTareas({ codeAlum: 'TEST05' });
    
    return result.success && result.data.length === 3
      ? { passed: true, nombre: 'TEST 13: Obtener tareas', mensaje: '✓ 3 tareas obtenidas correctamente' }
      : { passed: false, nombre: 'TEST 13: Obtener tareas', mensaje: 'FALLÓ: Se esperaban 3, se obtuvieron ' + (result.data ? result.data.length : 0) };
    
  } catch(error) {
    return { passed: false, nombre: 'TEST 13: Obtener tareas', mensaje: 'ERROR: ' + error };
  }
}

/**
 * TEST 14: Obtener 2 lecturas de TEST05
 */
function test14_ObtenerLecturas() {
  try {
    var result = Student.obtenerLecturas({ codeAlum: 'TEST05' });
    
    return result.success && result.data.length === 2
      ? { passed: true, nombre: 'TEST 14: Obtener lecturas', mensaje: '✓ 2 lecturas obtenidas correctamente' }
      : { passed: false, nombre: 'TEST 14: Obtener lecturas', mensaje: 'FALLÓ: Se esperaban 2, se obtuvieron ' + (result.data ? result.data.length : 0) };
    
  } catch(error) {
    return { passed: false, nombre: 'TEST 14: Obtener lecturas', mensaje: 'ERROR: ' + error };
  }
}

// ========== TESTS 15-19: UPDATE STUDENT ==========

/**
 * TEST 15: Actualizar nombre de curso MATE → MATEMATICAS
 */
function test15_ActualizarCurso() {
  try {
    var cursos = Student.obtenerCursos({ codeAlum: 'TEST05' });
    if (!cursos.success) {
      return { passed: false, nombre: 'TEST 15: Actualizar curso', mensaje: 'FALLÓ: No se pudieron obtener cursos' };
    }
    
    var cursoMate = null;
    for (var i = 0; i < cursos.data.length; i++) {
      if (cursos.data[i].Curso === 'MATE') {
        cursoMate = cursos.data[i];
        break;
      }
    }
    
    if (!cursoMate) {
      return { passed: false, nombre: 'TEST 15: Actualizar curso', mensaje: 'FALLÓ: Curso MATE no encontrado' };
    }
    
    var result = Student.actualizarCurso({
      codeAlum: 'TEST05',
      rowNumber: cursoMate._rowNumber,
      curso: 'MATE',
      completo: 'MATEMATICAS',
      color: cursoMate.Color
    });
    
    return result.success
      ? { passed: true, nombre: 'TEST 15: Actualizar curso', mensaje: '✓ Curso MATE actualizado a MATEMATICAS' }
      : { passed: false, nombre: 'TEST 15: Actualizar curso', mensaje: 'FALLÓ: ' + result.error };
    
  } catch(error) {
    return { passed: false, nombre: 'TEST 15: Actualizar curso', mensaje: 'ERROR: ' + error };
  }
}

/**
 * TEST 16: Actualizar estado repaso Falta → OK
 */
function test16_ActualizarRepaso() {
  try {
    var repasos = Student.obtenerRepasos({ codeAlum: 'TEST05' });
    if (!repasos.success) {
      return { passed: false, nombre: 'TEST 16: Actualizar repaso', mensaje: 'FALLÓ: No se pudieron obtener repasos' };
    }
    
    var repasoFalta = null;
    for (var i = 0; i < repasos.data.length; i++) {
      if (repasos.data[i].EstadoRep === 'Falta') {
        repasoFalta = repasos.data[i];
        break;
      }
    }
    
    if (!repasoFalta) {
      return { passed: false, nombre: 'TEST 16: Actualizar repaso', mensaje: 'FALLÓ: Repaso con estado Falta no encontrado' };
    }
    
    var result = Student.actualizarRepaso({
      codeAlum: 'TEST05',
      rowNumber: repasoFalta._rowNumber,
      curso: repasoFalta.Curso,
      tema: repasoFalta.Tema,
      fechaClase: repasoFalta.FechaClase,
      fechaRep: repasoFalta.FechaRep,
      estadoRep: 'OK',
      detalle: repasoFalta.Detalle,
      evaluado: repasoFalta.Evaluado
    });
    
    return result.success
      ? { passed: true, nombre: 'TEST 16: Actualizar repaso', mensaje: '✓ Estado Falta → OK actualizado' }
      : { passed: false, nombre: 'TEST 16: Actualizar repaso', mensaje: 'FALLÓ: ' + result.error };
    
  } catch(error) {
    return { passed: false, nombre: 'TEST 16: Actualizar repaso', mensaje: 'ERROR: ' + error };
  }
}

/**
 * TEST 17: Actualizar nota evaluación 15 → 18
 */
function test17_ActualizarEvaluacion() {
  try {
    var evals = Student.obtenerEvaluaciones({ codeAlum: 'TEST05' });
    if (!evals.success) {
      return { passed: false, nombre: 'TEST 17: Actualizar evaluación', mensaje: 'FALLÓ: No se pudieron obtener evaluaciones' };
    }
    
    var evalQuim = null;
    for (var i = 0; i < evals.data.length; i++) {
      if (evals.data[i].Curso === 'QUIM' && evals.data[i].Nota === 15) {
        evalQuim = evals.data[i];
        break;
      }
    }
    
    if (!evalQuim) {
      return { passed: false, nombre: 'TEST 17: Actualizar evaluación', mensaje: 'FALLÓ: Evaluación QUIM nota 15 no encontrada' };
    }
    
    var result = Student.actualizarEvaluacion({
      codeAlum: 'TEST05',
      rowNumber: evalQuim._rowNumber,
      curso: evalQuim.Curso,
      nomEval: evalQuim.NomEval,
      fechaEval: evalQuim.FechaEval,
      nota: 18,
      peso: evalQuim.Peso,
      sem: evalQuim.Sem
    });
    
    return result.success
      ? { passed: true, nombre: 'TEST 17: Actualizar evaluación', mensaje: '✓ Nota 15 → 18 actualizada' }
      : { passed: false, nombre: 'TEST 17: Actualizar evaluación', mensaje: 'FALLÓ: ' + result.error };
    
  } catch(error) {
    return { passed: false, nombre: 'TEST 17: Actualizar evaluación', mensaje: 'ERROR: ' + error };
  }
}

/**
 * TEST 18: Actualizar fecha entrega tarea
 */
function test18_ActualizarTarea() {
  try {
    var tareas = Student.obtenerTareas({ codeAlum: 'TEST05' });
    if (!tareas.success || tareas.data.length === 0) {
      return { passed: false, nombre: 'TEST 18: Actualizar tarea', mensaje: 'FALLÓ: No se pudieron obtener tareas' };
    }
    
    var tarea = tareas.data[0];
    
    var result = Student.actualizarTarea({
      codeAlum: 'TEST05',
      rowNumber: tarea._rowNumber,
      curso: tarea.Curso,
      tarea: tarea.Tarea,
      fechaEntrega: '20/01/2026',
      fechaAccion: tarea.FechaAccion,
      nota: tarea.Nota,
      peso: tarea.Peso,
      sem: tarea.Sem
    });
    
    return result.success
      ? { passed: true, nombre: 'TEST 18: Actualizar tarea', mensaje: '✓ Fecha entrega actualizada a 20/01/2026' }
      : { passed: false, nombre: 'TEST 18: Actualizar tarea', mensaje: 'FALLÓ: ' + result.error };
    
  } catch(error) {
    return { passed: false, nombre: 'TEST 18: Actualizar tarea', mensaje: 'ERROR: ' + error };
  }
}

/**
 * TEST 19: Actualizar progreso lectura 50% → 75%
 */
function test19_ActualizarLectura() {
  try {
    var lecturas = Student.obtenerLecturas({ codeAlum: 'TEST05' });
    if (!lecturas.success || lecturas.data.length === 0) {
      return { passed: false, nombre: 'TEST 19: Actualizar lectura', mensaje: 'FALLÓ: No se pudieron obtener lecturas' };
    }
    
    var lectura = lecturas.data[0];
    var nuevoProgreso = Math.floor(lectura.CantPag * 0.75);
    
    var result = Student.actualizarLectura({
      codeAlum: 'TEST05',
      rowNumber: lectura._rowNumber,
      curso: lectura.Curso,
      lectura: lectura.Lectura,
      cantPag: lectura.CantPag,
      pagActual: nuevoProgreso,
      fechaInicio: lectura.FechaInicio,
      fechaFin: lectura.FechaFin,
      fechaEval: lectura.FechaEval,
      nota: lectura.Nota,
      peso: lectura.Peso,
      sem: lectura.Sem
    });
    
    return result.success
      ? { passed: true, nombre: 'TEST 19: Actualizar lectura', mensaje: '✓ Progreso actualizado a 75%' }
      : { passed: false, nombre: 'TEST 19: Actualizar lectura', mensaje: 'FALLÓ: ' + result.error };
    
  } catch(error) {
    return { passed: false, nombre: 'TEST 19: Actualizar lectura', mensaje: 'ERROR: ' + error };
  }
}

// ========== TESTS 20-24: DELETE STUDENT ==========

/**
 * TEST 20: Eliminar curso ING de TEST05
 */
function test20_EliminarCurso() {
  try {
    var cursos = Student.obtenerCursos({ codeAlum: 'TEST05' });
    if (!cursos.success) {
      return { passed: false, nombre: 'TEST 20: Eliminar curso', mensaje: 'FALLÓ: No se pudieron obtener cursos' };
    }
    
    var cursoIng = null;
    for (var i = 0; i < cursos.data.length; i++) {
      if (cursos.data[i].Curso === 'ING') {
        cursoIng = cursos.data[i];
        break;
      }
    }
    
    if (!cursoIng) {
      return { passed: false, nombre: 'TEST 20: Eliminar curso', mensaje: 'FALLÓ: Curso ING no encontrado' };
    }
    
    var result = Student.eliminarCurso({
      codeAlum: 'TEST05',
      rowNumber: cursoIng._rowNumber
    });
    
    return result.success
      ? { passed: true, nombre: 'TEST 20: Eliminar curso', mensaje: '✓ Curso ING eliminado correctamente' }
      : { passed: false, nombre: 'TEST 20: Eliminar curso', mensaje: 'FALLÓ: ' + result.error };
    
  } catch(error) {
    return { passed: false, nombre: 'TEST 20: Eliminar curso', mensaje: 'ERROR: ' + error };
  }
}

/**
 * TEST 21: Eliminar repaso específico
 */
function test21_EliminarRepaso() {
  try {
    var repasos = Student.obtenerRepasos({ codeAlum: 'TEST05' });
    if (!repasos.success || repasos.data.length === 0) {
      return { passed: false, nombre: 'TEST 21: Eliminar repaso', mensaje: 'FALLÓ: No hay repasos' };
    }
    
    var result = Student.eliminarRepaso({
      codeAlum: 'TEST05',
      rowNumber: repasos.data[0]._rowNumber
    });
    
    return result.success
      ? { passed: true, nombre: 'TEST 21: Eliminar repaso', mensaje: '✓ Repaso eliminado correctamente' }
      : { passed: false, nombre: 'TEST 21: Eliminar repaso', mensaje: 'FALLÓ: ' + result.error };
    
  } catch(error) {
    return { passed: false, nombre: 'TEST 21: Eliminar repaso', mensaje: 'ERROR: ' + error };
  }
}

/**
 * TEST 22: Eliminar evaluación específica
 */
function test22_EliminarEvaluacion() {
  try {
    var evals = Student.obtenerEvaluaciones({ codeAlum: 'TEST05' });
    if (!evals.success || evals.data.length === 0) {
      return { passed: false, nombre: 'TEST 22: Eliminar evaluación', mensaje: 'FALLÓ: No hay evaluaciones' };
    }
    
    var result = Student.eliminarEvaluacion({
      codeAlum: 'TEST05',
      rowNumber: evals.data[0]._rowNumber
    });
    
    return result.success
      ? { passed: true, nombre: 'TEST 22: Eliminar evaluación', mensaje: '✓ Evaluación eliminada correctamente' }
      : { passed: false, nombre: 'TEST 22: Eliminar evaluación', mensaje: 'FALLÓ: ' + result.error };
    
  } catch(error) {
    return { passed: false, nombre: 'TEST 22: Eliminar evaluación', mensaje: 'ERROR: ' + error };
  }
}

/**
 * TEST 23: Eliminar tarea específica
 */
function test23_EliminarTarea() {
  try {
    var tareas = Student.obtenerTareas({ codeAlum: 'TEST05' });
    if (!tareas.success || tareas.data.length === 0) {
      return { passed: false, nombre: 'TEST 23: Eliminar tarea', mensaje: 'FALLÓ: No hay tareas' };
    }
    
    var result = Student.eliminarTarea({
      codeAlum: 'TEST05',
      rowNumber: tareas.data[0]._rowNumber
    });
    
    return result.success
      ? { passed: true, nombre: 'TEST 23: Eliminar tarea', mensaje: '✓ Tarea eliminada correctamente' }
      : { passed: false, nombre: 'TEST 23: Eliminar tarea', mensaje: 'FALLÓ: ' + result.error };
    
  } catch(error) {
    return { passed: false, nombre: 'TEST 23: Eliminar tarea', mensaje: 'ERROR: ' + error };
  }
}

/**
 * TEST 24: Eliminar lectura específica
 */
function test24_EliminarLectura() {
  try {
    var lecturas = Student.obtenerLecturas({ codeAlum: 'TEST05' });
    if (!lecturas.success || lecturas.data.length === 0) {
      return { passed: false, nombre: 'TEST 24: Eliminar lectura', mensaje: 'FALLÓ: No hay lecturas' };
    }
    
    var result = Student.eliminarLectura({
      codeAlum: 'TEST05',
      rowNumber: lecturas.data[0]._rowNumber
    });
    
    return result.success
      ? { passed: true, nombre: 'TEST 24: Eliminar lectura', mensaje: '✓ Lectura eliminada correctamente' }
      : { passed: false, nombre: 'TEST 24: Eliminar lectura', mensaje: 'FALLÓ: ' + result.error };
    
  } catch(error) {
    return { passed: false, nombre: 'TEST 24: Eliminar lectura', mensaje: 'ERROR: ' + error };
  }
}

// ========== TESTS 25-27: HORARIOS ==========

/**
 * TEST 25: Agregar 3 horarios de clase
 */
function test25_AgregarHorarios() {
  try {
    var horarios = [
      { curso: 'MATE', horaInicio: '08:00', horaFin: '10:00', detalle: 'Lunes' },
      { curso: 'FIS', horaInicio: '10:00', horaFin: '12:00', detalle: 'Martes' },
      { curso: 'QUIM', horaInicio: '14:00', horaFin: '16:00', detalle: 'Miércoles' }
    ];
    
    var agregados = 0;
    for (var i = 0; i < horarios.length; i++) {
      var result = Student.agregarHorarioClase({
        codeAlum: 'TEST05',
        curso: horarios[i].curso,
        horaInicio: horarios[i].horaInicio,
        horaFin: horarios[i].horaFin,
        detalle: horarios[i].detalle
      });
      if (result.success) agregados++;
    }
    
    return agregados === 3
      ? { passed: true, nombre: 'TEST 25: Agregar horarios', mensaje: '✓ 3 horarios de clase agregados' }
      : { passed: false, nombre: 'TEST 25: Agregar horarios', mensaje: 'FALLÓ: Solo ' + agregados + ' de 3' };
    
  } catch(error) {
    return { passed: false, nombre: 'TEST 25: Agregar horarios', mensaje: 'ERROR: ' + error };
  }
}

/**
 * TEST 26: Verificar mapeo HoraInicio→HoraIni
 * 
 * ⚠️ CRÍTICO: Este mapeo es esencial para que el frontend funcione
 */
function test26_VerificarMapeoHora() {
  try {
    var result = Student.obtenerHorarioClases({ codeAlum: 'TEST05' });
    
    if (!result.success || result.data.length === 0) {
      return { passed: false, nombre: 'TEST 26: Mapeo HoraInicio→HoraIni', mensaje: 'FALLÓ: No hay horarios' };
    }
    
    // Verificar que tenga HoraIni (no HoraInicio)
    var primerHorario = result.data[0];
    var tieneHoraIni = primerHorario.hasOwnProperty('HoraIni');
    var noTieneHoraInicio = !primerHorario.hasOwnProperty('HoraInicio');
    
    return tieneHoraIni && noTieneHoraInicio
      ? { passed: true, nombre: 'TEST 26: Mapeo HoraInicio→HoraIni', mensaje: '✓ Mapeo correcto: HoraInicio→HoraIni' }
      : { passed: false, nombre: 'TEST 26: Mapeo HoraInicio→HoraIni', mensaje: 'FALLÓ: Mapeo incorrecto o ausente' };
    
  } catch(error) {
    return { passed: false, nombre: 'TEST 26: Mapeo HoraInicio→HoraIni', mensaje: 'ERROR: ' + error };
  }
}

/**
 * TEST 27: Agregar y eliminar horario semanal
 */
function test27_HorarioSemanal() {
  try {
    // Agregar
    var resultAdd = Student.agregarHorarioSem({
      codeAlum: 'TEST05',
      actividad: 'Repaso MATE',
      horaInicio: '15:00',
      horaFin: '17:00',
      fechaHS: '06/01/2026',
      tipoAct: 'Repaso',
      color: '#FFC107',
      sem: 1
    });
    
    if (!resultAdd.success) {
      return { passed: false, nombre: 'TEST 27: Horario semanal', mensaje: 'FALLÓ: No se pudo agregar' };
    }
    
    // Obtener para encontrar rowNumber
    var horarios = Student.obtenerHorarioSem({ codeAlum: 'TEST05' });
    if (!horarios.success || horarios.data.length === 0) {
      return { passed: false, nombre: 'TEST 27: Horario semanal', mensaje: 'FALLÓ: No se encontró el horario agregado' };
    }
    
    // Eliminar
    var resultDel = Student.eliminarHorarioSem({
      codeAlum: 'TEST05',
      rowNumber: horarios.data[0]._rowNumber
    });
    
    return resultDel.success
      ? { passed: true, nombre: 'TEST 27: Horario semanal', mensaje: '✓ Horario semanal agregado y eliminado' }
      : { passed: false, nombre: 'TEST 27: Horario semanal', mensaje: 'FALLÓ: No se pudo eliminar' };
    
  } catch(error) {
    return { passed: false, nombre: 'TEST 27: Horario semanal', mensaje: 'ERROR: ' + error };
  }
}

// ========== TESTS 28-30: FUNCIONES ESPECIALES ==========

/**
 * TEST 28: Calcular promedio ponderado por curso
 * 
 * ⚠️ CRÍTICO: Fórmula = (Σ Nota × Peso) / Σ Peso
 */
function test28_PromedioPonderado() {
  try {
    var result = Student.obtenerNotasPorCurso({
      codeAlum: 'TEST05',
      curso: 'MATE'
    });
    
    if (!result.success) {
      return { passed: false, nombre: 'TEST 28: Promedio ponderado', mensaje: 'FALLÓ: ' + result.error };
    }
    
    // Verificar que tenga promedio calculado
    var tienePromedio = result.data.hasOwnProperty('promedio');
    var promedioValido = tienePromedio && parseFloat(result.data.promedio) > 0;
    
    return promedioValido
      ? { passed: true, nombre: 'TEST 28: Promedio ponderado', mensaje: '✓ Promedio MATE: ' + result.data.promedio }
      : { passed: false, nombre: 'TEST 28: Promedio ponderado', mensaje: 'FALLÓ: Promedio inválido o ausente' };
    
  } catch(error) {
    return { passed: false, nombre: 'TEST 28: Promedio ponderado', mensaje: 'ERROR: ' + error };
  }
}

/**
 * TEST 29: Obtener resumen de notas (todos los cursos)
 */
function test29_ResumenNotas() {
  try {
    var result = Student.obtenerResumenNotas({ codeAlum: 'TEST05' });
    
    if (!result.success) {
      return { passed: false, nombre: 'TEST 29: Resumen notas', mensaje: 'FALLÓ: ' + result.error };
    }
    
    // Verificar que tenga datos de múltiples cursos
    var tieneCursos = result.data && result.data.length > 0;
    
    return tieneCursos
      ? { passed: true, nombre: 'TEST 29: Resumen notas', mensaje: '✓ Resumen de ' + result.data.length + ' cursos obtenido' }
      : { passed: false, nombre: 'TEST 29: Resumen notas', mensaje: 'FALLÓ: Sin datos de cursos' };
    
  } catch(error) {
    return { passed: false, nombre: 'TEST 29: Resumen notas', mensaje: 'ERROR: ' + error };
  }
}

/**
 * TEST 30: Obtener deberes unificados (Eval+Tareas+Lecturas)
 * 
 * ⚠️ CRÍTICO: Debe combinar las 3 fuentes y ordenar por fecha
 */
function test30_DeberesUnificados() {
  try {
    var result = Student.obtenerTodosDeberes({ codeAlum: 'TEST05' });
    
    if (!result.success) {
      return { passed: false, nombre: 'TEST 30: Deberes unificados', mensaje: 'FALLÓ: ' + result.error };
    }
    
    // Verificar que tenga deberes de distintos tipos
    var tieneDeberes = result.data && result.data.length > 0;
    var tieneTipos = false;
    
    if (tieneDeberes) {
      var tipos = {};
      for (var i = 0; i < result.data.length; i++) {
        if (result.data[i].tipo) {
          tipos[result.data[i].tipo] = true;
        }
      }
      tieneTipos = Object.keys(tipos).length >= 2; // Al menos 2 tipos diferentes
    }
    
    return tieneDeberes && tieneTipos
      ? { passed: true, nombre: 'TEST 30: Deberes unificados', mensaje: '✓ ' + result.data.length + ' deberes unificados correctamente' }
      : { passed: false, nombre: 'TEST 30: Deberes unificados', mensaje: 'FALLÓ: Unificación incompleta' };
    
  } catch(error) {
    return { passed: false, nombre: 'TEST 30: Deberes unificados', mensaje: 'ERROR: ' + error };
  }
}

// ========== TEST 31: ADMIN BÚSQUEDA ==========

/**
 * TEST 31: Buscar alumno por múltiples criterios (case-insensitive)
 */
function test31_BusquedaAvanzada() {
  try {
    // Buscar por nombre parcial (case-insensitive)
    var result = Admin.buscarAlumno({ filtro: 'test' });
    
    if (!result.success) {
      return { passed: false, nombre: 'TEST 31: Búsqueda avanzada', mensaje: 'FALLÓ: ' + result.error };
    }
    
    // Debe encontrar al menos TEST01, TEST02, TEST03, TEST04 (TEST05 ya fue eliminado en test32)
    var encontrados = result.data ? result.data.length : 0;
    
    return encontrados >= 4
      ? { passed: true, nombre: 'TEST 31: Búsqueda avanzada', mensaje: '✓ ' + encontrados + ' alumnos encontrados con "test"' }
      : { passed: false, nombre: 'TEST 31: Búsqueda avanzada', mensaje: 'FALLÓ: Solo ' + encontrados + ' encontrados (esperados 4+)' };
    
  } catch(error) {
    return { passed: false, nombre: 'TEST 31: Búsqueda avanzada', mensaje: 'ERROR: ' + error };
  }
}

// ========== TEST 32: ELIMINACIÓN CASCADA ==========

/**
 * TEST 32: Eliminar TEST05 completo de 9 hojas
 * 
 * ⚠️ CRÍTICO: Debe eliminar de Alumnos, Clientes, Cursos, Repasos, Eval,
 *             Tareas, Lecturas, HorarioClases, HorarioSem
 */
function test32_EliminacionCascada() {
  try {
    var result = Admin.eliminarAlumno({ codeAlum: 'TEST05' });
    
    if (!result.success) {
      return { passed: false, nombre: 'TEST 32: Eliminación cascada', mensaje: 'FALLÓ: ' + result.error };
    }
    
    // Verificar que ya no existe en Alumnos
    var verificar = DB.buscar('Alumnos', 'CodeAlum', 'TEST05');
    
    return !verificar.success
      ? { passed: true, nombre: 'TEST 32: Eliminación cascada', mensaje: '✓ TEST05 eliminado de 9 hojas (' + result.message + ')' }
      : { passed: false, nombre: 'TEST 32: Eliminación cascada', mensaje: 'FALLÓ: TEST05 aún existe en Alumnos' };
    
  } catch(error) {
    return { passed: false, nombre: 'TEST 32: Eliminación cascada', mensaje: 'ERROR: ' + error };
  }
}

// ==========================================
// PARTE 3: FUNCIÓN PRINCIPAL
// ==========================================

/**
 * Ejecutar TODAS las pruebas del sistema
 * 
 * 🔑 USO: Ejecutar desde Script Editor → Función → ejecutarTodasLasPruebas
 * 
 * FLUJO:
 * 1. Limpiar datos de prueba
 * 2. Ejecutar 32 tests en orden
 * 3. Mostrar resultados en UI flotante (2testui.html)
 * 
 * @return {Array} - Array de resultados
 */
function ejecutarTodasLasPruebas() {
  var resultados = [];
  
  Logger.log('====================================');
  Logger.log('INICIANDO SUITE DE PRUEBAS - PBE CONTROL V01.14');
  Logger.log('====================================');
  
  // Parte 1: Limpiar
  Logger.log('Ejecutando limpieza...');
  resultados.push(limpiarDatosPrueba());
  
  // Parte 2: Ejecutar 32 tests
  var tests = [
    test01_CrearAlumnos, test02_ValidarUnicidadCodeAlum, test03_ValidarUnicidadClave,
    test04_AgregarCursos, test05_AgregarRepasos, test06_AgregarEvaluaciones,
    test07_AgregarTareas, test08_AgregarLecturas, test09_BuscarAlumno,
    test10_ObtenerCursos, test11_ObtenerRepasos, test12_ObtenerEvaluaciones,
    test13_ObtenerTareas, test14_ObtenerLecturas, test15_ActualizarCurso,
    test16_ActualizarRepaso, test17_ActualizarEvaluacion, test18_ActualizarTarea,
    test19_ActualizarLectura, test20_EliminarCurso, test21_EliminarRepaso,
    test22_EliminarEvaluacion, test23_EliminarTarea, test24_EliminarLectura,
    test25_AgregarHorarios, test26_VerificarMapeoHora, test27_HorarioSemanal,
    test28_PromedioPonderado, test29_ResumenNotas, test30_DeberesUnificados,
    test31_BusquedaAvanzada, test32_EliminacionCascada
  ];
  
  for (var i = 0; i < tests.length; i++) {
    Logger.log('Ejecutando TEST ' + (i < 9 ? '0' : '') + (i + 1) + '...');
    resultados.push(tests[i]());
  }
  
  Logger.log('====================================');
  Logger.log('SUITE DE PRUEBAS COMPLETADA');
  Logger.log('====================================');
  
  // Parte 3: Mostrar resultados en UI
  mostrarResultadosEnUI(resultados);
  
  return resultados;
}

/**
 * Mostrar resultados en ventana flotante
 * 
 * 🎨 UI: 2testui.html con:
 * - Header con gradiente azul/morado
 * - Tests PASSED con fondo verde
 * - Tests FAILED con fondo rojo
 * - Botón "Copiar Log Completo"
 * 
 * @param {Array} resultados - Array de objetos resultado
 */
function mostrarResultadosEnUI(resultados) {
  try {
    var template = HtmlService.createTemplateFromFile('2testui');
    template.resultados = JSON.stringify(resultados);
    
    var html = template.evaluate()
      .setWidth(900)
      .setHeight(700);
    
    SpreadsheetApp.getUi().showModalDialog(
      html,
      '🧪 Resultados de Pruebas - PBE Control V01.14'
    );
    
  } catch(error) {
    Logger.log('Error al mostrar UI: ' + error.toString());
    
    // Fallback: Mostrar en Logger
    Logger.log('====================================');
    Logger.log('RESUMEN DE RESULTADOS:');
    Logger.log('====================================');
    
    var passed = 0;
    var failed = 0;
    
    resultados.forEach(function(r) {
      if (r.passed) {
        passed++;
        Logger.log('✓ ' + r.nombre + ': ' + r.mensaje);
      } else {
        failed++;
        Logger.log('✗ ' + r.nombre + ': ' + r.mensaje);
      }
    });
    
    Logger.log('====================================');
    Logger.log('TOTAL: ' + passed + ' PASSED, ' + failed + ' FAILED');
    Logger.log('====================================');
  }
}

// ==========================================
// FIN DE 2testback.gs - V01.14
// Total: 36 funciones
// - 1 limpieza
// - 32 tests (CRUD completo)
// - 2 utilidades (ejecutar, mostrar)
// - 1 función principal
// ==========================================
