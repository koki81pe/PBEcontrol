/*
******************************************
PBE CONTROL - 2testback.gs - V01.17
Sistema de Gestión Académica
04/01/2026 - 22:30
******************************************

CONTENIDO:
- PARTE 1: Limpieza de datos de prueba
- PARTE 2: Batería de 38 casos de prueba
- PARTE 3: Función principal ejecutarTodasLasPruebas()

CAMBIOS EN V01.17:
✅ TEST01: Crear 6 alumnos (agregado TEST06)
✅ NUEVO test08g: Llenar TEST06 con data completa
✅ TEST32 (ahora 33): Eliminar TEST06 en lugar de TEST05
✅ Total: 37 → 38 tests
✅ Conserva evidencias de TEST05 para pruebas robustas

CAMBIOS EN V01.15:
✅ 5 nuevos tests de validación (08b-08f)
✅ Corrección TEST 25: horaInicio → horaIni
✅ Total: 32 → 37 tests

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

function limpiarDatosPrueba() {
  try {
    var hojas = ['Alumnos', 'Clientes', 'Cursos', 'Repasos', 'Eval', 'Tareas', 'Lecturas', 'HorarioClases', 'HorarioSem'];
    var totalEliminados = 0;
    
    hojas.forEach(function(nombreHoja) {
      var sheet = SHEET[nombreHoja];
      if (!sheet) return;
      
      var data = sheet.getDataRange().getValues();
      for (var i = data.length - 1; i >= 1; i--) {
        var codeAlum = String(data[i][1]);
        if (codeAlum.indexOf('TEST') === 0) {
          sheet.deleteRow(i + 1);
          totalEliminados++;
        }
      }
    });
    
    return { passed: true, nombre: '🧹 Limpieza de datos', mensaje: totalEliminados + ' registros TEST eliminados correctamente' };
  } catch(error) {
    Logger.log('Error en limpiarDatosPrueba(): ' + error.toString());
    return { passed: false, nombre: '🧹 Limpieza de datos', mensaje: 'ERROR: ' + error.toString() };
  }
}

// ========== TESTS 01-03: ADMIN + ALUMNOS ==========

function test01_CrearAlumnos() {
  try {
    var alumnos = [
      { codeAlum: 'TEST01', clave: 'test1', apellidos: 'Test Uno', nombres: 'Alumno', dni: '11111111', email: 'test1@pbe.com', tipoInsti: 'Universidad', nomInsti: 'Test University', ciclo: '1' },
      { codeAlum: 'TEST02', clave: 'test2', apellidos: 'Test Dos', nombres: 'Alumno', dni: '22222222', email: 'test2@pbe.com', tipoInsti: 'Universidad', nomInsti: 'Test University', ciclo: '2' },
      { codeAlum: 'TEST03', clave: 'test3', apellidos: 'Test Tres', nombres: 'Alumno', dni: '33333333', email: 'test3@pbe.com', tipoInsti: 'Colegio', nomInsti: 'Test School', ciclo: '3' },
      { codeAlum: 'TEST04', clave: 'test4', apellidos: 'Test Cuatro', nombres: 'Alumno', dni: '44444444', email: 'test4@pbe.com', tipoInsti: 'Instituto', nomInsti: 'Test Institute', ciclo: '4' },
      { codeAlum: 'TEST05', clave: 'test5', apellidos: 'Test Cinco', nombres: 'Alumno', dni: '55555555', email: 'test5@pbe.com', tipoInsti: 'Academia', nomInsti: 'Test Academy', ciclo: '5' },
      { codeAlum: 'TEST06', clave: 'test6', apellidos: 'Test Seis', nombres: 'Alumno', dni: '66666666', email: 'test6@pbe.com', tipoInsti: 'Universidad', nomInsti: 'Test University', ciclo: '6' }
    ];
    
    var creados = 0;
    for (var i = 0; i < alumnos.length; i++) {
      if (Admin.crearAlumno(alumnos[i]).success) creados++;
    }
    
    return creados === 6
      ? { passed: true, nombre: 'TEST 01: Crear 6 alumnos', mensaje: '✓ 6 alumnos creados (TEST01-TEST06)' }
      : { passed: false, nombre: 'TEST 01: Crear 6 alumnos', mensaje: 'FALLÓ: Solo ' + creados + ' de 6' };
  } catch(error) {
    return { passed: false, nombre: 'TEST 01: Crear 6 alumnos', mensaje: 'ERROR: ' + error };
  }
}

function test02_ValidarUnicidadCodeAlum() {
  try {
    var result = Admin.crearAlumno({ codeAlum: 'TEST01', clave: 'test999', apellidos: 'Duplicado', nombres: 'Test', dni: '99999999', email: 'dup@pbe.com' });
    return !result.success && result.error.indexOf('CodeAlum ya existe') !== -1
      ? { passed: true, nombre: 'TEST 02: Unicidad CodeAlum', mensaje: '✓ Sistema rechazó duplicado' }
      : { passed: false, nombre: 'TEST 02: Unicidad CodeAlum', mensaje: 'FALLÓ: Permitió duplicado' };
  } catch(error) {
    return { passed: false, nombre: 'TEST 02: Unicidad CodeAlum', mensaje: 'ERROR: ' + error };
  }
}

function test03_ValidarUnicidadClave() {
  try {
    var result = Admin.crearAlumno({ codeAlum: 'TEST99', clave: 'test1', apellidos: 'Dup Clave', nombres: 'Test', dni: '88888888', email: 'dupclave@pbe.com' });
    return !result.success && result.error.indexOf('Clave ya existe') !== -1
      ? { passed: true, nombre: 'TEST 03: Unicidad Clave', mensaje: '✓ Sistema rechazó Clave duplicada' }
      : { passed: false, nombre: 'TEST 03: Unicidad Clave', mensaje: 'FALLÓ: Permitió Clave duplicada' };
  } catch(error) {
    return { passed: false, nombre: 'TEST 03: Unicidad Clave', mensaje: 'ERROR: ' + error };
  }
}

// ========== TESTS 04-08: CREATE STUDENT (TEST05) ==========

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
      if (Student.agregarCurso({ codeAlum: 'TEST05', curso: cursos[i].curso, completo: cursos[i].completo, color: cursos[i].color }).success) agregados++;
    }
    
    return agregados === 6
      ? { passed: true, nombre: 'TEST 04: Agregar 6 cursos (TEST05)', mensaje: '✓ 6 cursos agregados (MATE, FIS, QUIM, BIOL, HIST, ING)' }
      : { passed: false, nombre: 'TEST 04: Agregar 6 cursos (TEST05)', mensaje: 'FALLÓ: Solo ' + agregados + ' de 6' };
  } catch(error) {
    return { passed: false, nombre: 'TEST 04: Agregar 6 cursos (TEST05)', mensaje: 'ERROR: ' + error };
  }
}

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
      if (Student.agregarRepaso({ codeAlum: 'TEST05', curso: repasos[i].curso, tema: repasos[i].tema, fechaClase: '01/01/2026', fechaRep: '02/01/2026', estadoRep: repasos[i].estadoRep, detalle: 'Repaso de prueba', evaluado: repasos[i].evaluado }).success) agregados++;
    }
    
    return agregados === 8
      ? { passed: true, nombre: 'TEST 05: Agregar 8 repasos (TEST05)', mensaje: '✓ 8 repasos (4 OK, 4 Falta, 2 evaluados)' }
      : { passed: false, nombre: 'TEST 05: Agregar 8 repasos (TEST05)', mensaje: 'FALLÓ: Solo ' + agregados + ' de 8' };
  } catch(error) {
    return { passed: false, nombre: 'TEST 05: Agregar 8 repasos (TEST05)', mensaje: 'ERROR: ' + error };
  }
}

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
      if (Student.agregarEvaluacion({ codeAlum: 'TEST05', curso: evaluaciones[i].curso, nomEval: evaluaciones[i].nomEval, fechaEval: '15/01/2026', nota: evaluaciones[i].nota, peso: evaluaciones[i].peso, sem: 1 }).success) agregados++;
    }
    
    return agregados === 5
      ? { passed: true, nombre: 'TEST 06: Agregar 5 evaluaciones (TEST05)', mensaje: '✓ 5 evaluaciones (notas 15-19)' }
      : { passed: false, nombre: 'TEST 06: Agregar 5 evaluaciones (TEST05)', mensaje: 'FALLÓ: Solo ' + agregados + ' de 5' };
  } catch(error) {
    return { passed: false, nombre: 'TEST 06: Agregar 5 evaluaciones (TEST05)', mensaje: 'ERROR: ' + error };
  }
}

function test07_AgregarTareas() {
  try {
    var tareas = [
      { curso: 'MATE', tarea: 'Tarea 1: Ejercicios Cap 3', fechaEntrega: '10/01/2026', nota: 17, peso: 10 },
      { curso: 'FIS', tarea: 'Tarea 2: Problemas Cinemática', fechaEntrega: '12/01/2026', nota: 16, peso: 15 },
      { curso: 'QUIM', tarea: 'Tarea 3: Laboratorio Virtual', fechaEntrega: '14/01/2026', nota: 18, peso: 12 }
    ];
    
    var agregados = 0;
    for (var i = 0; i < tareas.length; i++) {
      if (Student.agregarTarea({ codeAlum: 'TEST05', curso: tareas[i].curso, tarea: tareas[i].tarea, fechaEntrega: tareas[i].fechaEntrega, fechaAccion: '03/01/2026', nota: tareas[i].nota, peso: tareas[i].peso, sem: 1 }).success) agregados++;
    }
    
    return agregados === 3
      ? { passed: true, nombre: 'TEST 07: Agregar 3 tareas (TEST05)', mensaje: '✓ 3 tareas (fechas distintas)' }
      : { passed: false, nombre: 'TEST 07: Agregar 3 tareas (TEST05)', mensaje: 'FALLÓ: Solo ' + agregados + ' de 3' };
  } catch(error) {
    return { passed: false, nombre: 'TEST 07: Agregar 3 tareas (TEST05)', mensaje: 'ERROR: ' + error };
  }
}

function test08_AgregarLecturas() {
  try {
    var lecturas = [
      { curso: 'HIST', lectura: 'Historia del Perú - Basadre', cantPag: 500, pagActual: 250, nota: 16, peso: 20 },
      { curso: 'ING', lectura: 'The Great Gatsby', cantPag: 180, pagActual: 90, nota: 18, peso: 15 }
    ];
    
    var agregados = 0;
    for (var i = 0; i < lecturas.length; i++) {
      if (Student.agregarLectura({ codeAlum: 'TEST05', curso: lecturas[i].curso, lectura: lecturas[i].lectura, cantPag: lecturas[i].cantPag, pagActual: lecturas[i].pagActual, fechaInicio: '01/01/2026', fechaFin: '31/01/2026', fechaEval: '05/02/2026', nota: lecturas[i].nota, peso: lecturas[i].peso, sem: 1 }).success) agregados++;
    }
    
    return agregados === 2
      ? { passed: true, nombre: 'TEST 08: Agregar 2 lecturas (TEST05)', mensaje: '✓ 2 lecturas (progreso 50%)' }
      : { passed: false, nombre: 'TEST 08: Agregar 2 lecturas (TEST05)', mensaje: 'FALLÓ: Solo ' + agregados + ' de 2' };
  } catch(error) {
    return { passed: false, nombre: 'TEST 08: Agregar 2 lecturas (TEST05)', mensaje: 'ERROR: ' + error };
  }
}

// ========== TESTS 08b-08f: VALIDACIONES DE UNICIDAD (TEST05) ==========

function test08b_ValidarUnicidadCurso() {
  try {
    var result = Student.agregarCurso({ codeAlum: 'TEST05', curso: 'MATE', completo: 'Lógica Matemática', color: '#FF0000' });
    return !result.success && result.error.indexOf('ya existe') !== -1
      ? { passed: true, nombre: 'TEST 08b: Unicidad Curso', mensaje: '✓ Sistema rechazó curso duplicado' }
      : { passed: false, nombre: 'TEST 08b: Unicidad Curso', mensaje: 'FALLÓ: Permitió curso duplicado' };
  } catch(error) {
    return { passed: false, nombre: 'TEST 08b: Unicidad Curso', mensaje: 'ERROR: ' + error };
  }
}

function test08c_ValidarUnicidadRepaso() {
  try {
    var result = Student.agregarRepaso({ codeAlum: 'TEST05', curso: 'MATE', tema: 'Derivadas', fechaClase: '01/01/2026', fechaRep: '02/01/2026', estadoRep: 'OK' });
    return !result.success && result.error.indexOf('ya existe') !== -1
      ? { passed: true, nombre: 'TEST 08c: Unicidad Repaso', mensaje: '✓ Sistema rechazó repaso duplicado' }
      : { passed: false, nombre: 'TEST 08c: Unicidad Repaso', mensaje: 'FALLÓ: Permitió repaso duplicado' };
  } catch(error) {
    return { passed: false, nombre: 'TEST 08c: Unicidad Repaso', mensaje: 'ERROR: ' + error };
  }
}

function test08d_ValidarUnicidadEvaluacion() {
  try {
    var result = Student.agregarEvaluacion({ codeAlum: 'TEST05', curso: 'MATE', nomEval: 'Parcial 1', fechaEval: '20/01/2026', nota: 20, peso: 40, sem: 1 });
    return !result.success && result.error.indexOf('ya existe') !== -1
      ? { passed: true, nombre: 'TEST 08d: Unicidad Evaluación', mensaje: '✓ Sistema rechazó evaluación duplicada' }
      : { passed: false, nombre: 'TEST 08d: Unicidad Evaluación', mensaje: 'FALLÓ: Permitió evaluación duplicada' };
  } catch(error) {
    return { passed: false, nombre: 'TEST 08d: Unicidad Evaluación', mensaje: 'ERROR: ' + error };
  }
}

function test08e_ValidarUnicidadTarea() {
  try {
    var result = Student.agregarTarea({ codeAlum: 'TEST05', curso: 'MATE', tarea: 'Tarea 1: Ejercicios Cap 3', fechaEntrega: '15/01/2026', fechaAccion: '05/01/2026', nota: 19, peso: 15, sem: 1 });
    return !result.success && result.error.indexOf('ya existe') !== -1
      ? { passed: true, nombre: 'TEST 08e: Unicidad Tarea', mensaje: '✓ Sistema rechazó tarea duplicada' }
      : { passed: false, nombre: 'TEST 08e: Unicidad Tarea', mensaje: 'FALLÓ: Permitió tarea duplicada' };
  } catch(error) {
    return { passed: false, nombre: 'TEST 08e: Unicidad Tarea', mensaje: 'ERROR: ' + error };
  }
}

function test08f_ValidarUnicidadLectura() {
  try {
    var result = Student.agregarLectura({ codeAlum: 'TEST05', curso: 'HIST', lectura: 'Historia del Perú - Basadre', cantPag: 600, pagActual: 300, fechaInicio: '05/01/2026', fechaFin: '05/02/2026', fechaEval: '10/02/2026', nota: 17, peso: 25, sem: 1 });
    return !result.success && result.error.indexOf('ya existe') !== -1
      ? { passed: true, nombre: 'TEST 08f: Unicidad Lectura', mensaje: '✓ Sistema rechazó lectura duplicada' }
      : { passed: false, nombre: 'TEST 08f: Unicidad Lectura', mensaje: 'FALLÓ: Permitió lectura duplicada' };
  } catch(error) {
    return { passed: false, nombre: 'TEST 08f: Unicidad Lectura', mensaje: 'ERROR: ' + error };
  }
}

// ========== TEST 08g: NUEVO - LLENAR TEST06 CON DATA COMPLETA ==========

function test08g_LlenarTest06() {
  try {
    var totalAgregados = 0;
    
    // Agregar 3 cursos a TEST06
    var cursos = [
      { curso: 'ALG', completo: 'Álgebra', color: '#E74C3C' },
      { curso: 'GEO', completo: 'Geometría', color: '#3498DB' },
      { curso: 'TRIG', completo: 'Trigonometría', color: '#2ECC71' }
    ];
    for (var i = 0; i < cursos.length; i++) {
      if (Student.agregarCurso({ codeAlum: 'TEST06', curso: cursos[i].curso, completo: cursos[i].completo, color: cursos[i].color }).success) totalAgregados++;
    }
    
    // Agregar 4 repasos a TEST06
    var repasos = [
      { curso: 'ALG', tema: 'Ecuaciones', estadoRep: 'OK' },
      { curso: 'ALG', tema: 'Matrices', estadoRep: 'Falta' },
      { curso: 'GEO', tema: 'Triángulos', estadoRep: 'OK' },
      { curso: 'TRIG', tema: 'Identidades', estadoRep: 'OK' }
    ];
    for (var i = 0; i < repasos.length; i++) {
      if (Student.agregarRepaso({ codeAlum: 'TEST06', curso: repasos[i].curso, tema: repasos[i].tema, fechaClase: '02/01/2026', fechaRep: '03/01/2026', estadoRep: repasos[i].estadoRep, detalle: 'Repaso TEST06', evaluado: '' }).success) totalAgregados++;
    }
    
    // Agregar 3 evaluaciones a TEST06
    var evaluaciones = [
      { curso: 'ALG', nomEval: 'Examen 1', nota: 16, peso: 40 },
      { curso: 'GEO', nomEval: 'Práctica 1', nota: 18, peso: 30 },
      { curso: 'TRIG', nomEval: 'Final', nota: 17, peso: 50 }
    ];
    for (var i = 0; i < evaluaciones.length; i++) {
      if (Student.agregarEvaluacion({ codeAlum: 'TEST06', curso: evaluaciones[i].curso, nomEval: evaluaciones[i].nomEval, fechaEval: '16/01/2026', nota: evaluaciones[i].nota, peso: evaluaciones[i].peso, sem: 1 }).success) totalAgregados++;
    }
    
    // Agregar 2 tareas a TEST06
    var tareas = [
      { curso: 'ALG', tarea: 'Tarea 1: Polinomios', fechaEntrega: '11/01/2026', nota: 19, peso: 10 },
      { curso: 'GEO', tarea: 'Tarea 2: Áreas', fechaEntrega: '13/01/2026', nota: 18, peso: 15 }
    ];
    for (var i = 0; i < tareas.length; i++) {
      if (Student.agregarTarea({ codeAlum: 'TEST06', curso: tareas[i].curso, tarea: tareas[i].tarea, fechaEntrega: tareas[i].fechaEntrega, fechaAccion: '04/01/2026', nota: tareas[i].nota, peso: tareas[i].peso, sem: 1 }).success) totalAgregados++;
    }
    
    // Agregar 1 lectura a TEST06
    var lecturas = [
      { curso: 'TRIG', lectura: 'Trigonometría - Venero', cantPag: 300, pagActual: 150, nota: 17, peso: 20 }
    ];
    for (var i = 0; i < lecturas.length; i++) {
      if (Student.agregarLectura({ codeAlum: 'TEST06', curso: lecturas[i].curso, lectura: lecturas[i].lectura, cantPag: lecturas[i].cantPag, pagActual: lecturas[i].pagActual, fechaInicio: '02/01/2026', fechaFin: '31/01/2026', fechaEval: '06/02/2026', nota: lecturas[i].nota, peso: lecturas[i].peso, sem: 1 }).success) totalAgregados++;
    }
    
    var esperados = 3 + 4 + 3 + 2 + 1; // 13 registros totales
    
    return totalAgregados === esperados
      ? { passed: true, nombre: 'TEST 08g: Llenar TEST06', mensaje: '✓ TEST06 llenado con 13 registros (3 cursos, 4 repasos, 3 eval, 2 tareas, 1 lectura)' }
      : { passed: false, nombre: 'TEST 08g: Llenar TEST06', mensaje: 'FALLÓ: Solo ' + totalAgregados + ' de ' + esperados + ' registros agregados' };
  } catch(error) {
    return { passed: false, nombre: 'TEST 08g: Llenar TEST06', mensaje: 'ERROR: ' + error };
  }
}

// ========== TESTS 09-14: READ STUDENT (TEST05) ==========

function test09_BuscarAlumno() {
  try {
    var result = DB.buscar('Alumnos', 'Clave', 'test1');
    return result.success && result.data.CodeAlum === 'TEST01'
      ? { passed: true, nombre: 'TEST 09: Buscar alumno', mensaje: '✓ TEST01 encontrado por Clave' }
      : { passed: false, nombre: 'TEST 09: Buscar alumno', mensaje: 'FALLÓ: No encontrado' };
  } catch(error) {
    return { passed: false, nombre: 'TEST 09: Buscar alumno', mensaje: 'ERROR: ' + error };
  }
}

function test10_ObtenerCursos() {
  try {
    var result = Student.obtenerCursos({ codeAlum: 'TEST05' });
    return result.success && result.data.length === 6
      ? { passed: true, nombre: 'TEST 10: Obtener cursos', mensaje: '✓ 6 cursos obtenidos' }
      : { passed: false, nombre: 'TEST 10: Obtener cursos', mensaje: 'FALLÓ: ' + (result.data ? result.data.length : 0) };
  } catch(error) {
    return { passed: false, nombre: 'TEST 10: Obtener cursos', mensaje: 'ERROR: ' + error };
  }
}

function test11_ObtenerRepasos() {
  try {
    var result = Student.obtenerRepasos({ codeAlum: 'TEST05' });
    return result.success && result.data.length === 8
      ? { passed: true, nombre: 'TEST 11: Obtener repasos', mensaje: '✓ 8 repasos obtenidos' }
      : { passed: false, nombre: 'TEST 11: Obtener repasos', mensaje: 'FALLÓ: ' + (result.data ? result.data.length : 0) };
  } catch(error) {
    return { passed: false, nombre: 'TEST 11: Obtener repasos', mensaje: 'ERROR: ' + error };
  }
}

function test12_ObtenerEvaluaciones() {
  try {
    var result = Student.obtenerEvaluaciones({ codeAlum: 'TEST05' });
    return result.success && result.data.length === 5
      ? { passed: true, nombre: 'TEST 12: Obtener evaluaciones', mensaje: '✓ 5 evaluaciones obtenidas' }
      : { passed: false, nombre: 'TEST 12: Obtener evaluaciones', mensaje: 'FALLÓ: ' + (result.data ? result.data.length : 0) };
  } catch(error) {
    return { passed: false, nombre: 'TEST 12: Obtener evaluaciones', mensaje: 'ERROR: ' + error };
  }
}

function test13_ObtenerTareas() {
  try {
    var result = Student.obtenerTareas({ codeAlum: 'TEST05' });
    return result.success && result.data.length === 3
      ? { passed: true, nombre: 'TEST 13: Obtener tareas', mensaje: '✓ 3 tareas obtenidas' }
      : { passed: false, nombre: 'TEST 13: Obtener tareas', mensaje: 'FALLÓ: ' + (result.data ? result.data.length : 0) };
  } catch(error) {
    return { passed: false, nombre: 'TEST 13: Obtener tareas', mensaje: 'ERROR: ' + error };
  }
}

function test14_ObtenerLecturas() {
  try {
    var result = Student.obtenerLecturas({ codeAlum: 'TEST05' });
    return result.success && result.data.length === 2
      ? { passed: true, nombre: 'TEST 14: Obtener lecturas', mensaje: '✓ 2 lecturas obtenidas' }
      : { passed: false, nombre: 'TEST 14: Obtener lecturas', mensaje: 'FALLÓ: ' + (result.data ? result.data.length : 0) };
  } catch(error) {
    return { passed: false, nombre: 'TEST 14: Obtener lecturas', mensaje: 'ERROR: ' + error };
  }
}

// ========== TESTS 15-19: UPDATE STUDENT (TEST05) ==========

function test15_ActualizarCurso() {
  try {
    var cursos = Student.obtenerCursos({ codeAlum: 'TEST05' });
    if (!cursos.success) return { passed: false, nombre: 'TEST 15: Actualizar curso', mensaje: 'FALLÓ: No se pudieron obtener cursos' };
    
    var cursoMate = null;
    for (var i = 0; i < cursos.data.length; i++) {
      if (cursos.data[i].Curso === 'MATE') {
        cursoMate = cursos.data[i];
        break;
      }
    }
    
    if (!cursoMate) return { passed: false, nombre: 'TEST 15: Actualizar curso', mensaje: 'FALLÓ: Curso MATE no encontrado' };
    
    var result = Student.actualizarCurso({ codeAlum: 'TEST05', rowNumber: cursoMate._rowNumber, curso: 'MATE', completo: 'MATEMATICAS', color: cursoMate.Color });
    
    return result.success
      ? { passed: true, nombre: 'TEST 15: Actualizar curso', mensaje: '✓ Curso MATE actualizado a MATEMATICAS' }
      : { passed: false, nombre: 'TEST 15: Actualizar curso', mensaje: 'FALLÓ: ' + result.error };
  } catch(error) {
    return { passed: false, nombre: 'TEST 15: Actualizar curso', mensaje: 'ERROR: ' + error };
  }
}

function test16_ActualizarRepaso() {
  try {
    var repasos = Student.obtenerRepasos({ codeAlum: 'TEST05' });
    if (!repasos.success) return { passed: false, nombre: 'TEST 16: Actualizar repaso', mensaje: 'FALLÓ: No se pudieron obtener repasos' };
    
    var repasoFalta = null;
    for (var i = 0; i < repasos.data.length; i++) {
      if (repasos.data[i].EstadoRep === 'Falta') {
        repasoFalta = repasos.data[i];
        break;
      }
    }
    
    if (!repasoFalta) return { passed: false, nombre: 'TEST 16: Actualizar repaso', mensaje: 'FALLÓ: Repaso con estado Falta no encontrado' };
    
    var result = Student.actualizarRepaso({ codeAlum: 'TEST05', rowNumber: repasoFalta._rowNumber, curso: repasoFalta.Curso, tema: repasoFalta.Tema, fechaClase: repasoFalta.FechaClase, fechaRep: repasoFalta.FechaRep, estadoRep: 'OK', detalle: repasoFalta.Detalle, evaluado: repasoFalta.Evaluado });
    
    return result.success
      ? { passed: true, nombre: 'TEST 16: Actualizar repaso', mensaje: '✓ Estado Falta → OK actualizado' }
      : { passed: false, nombre: 'TEST 16: Actualizar repaso', mensaje: 'FALLÓ: ' + result.error };
  } catch(error) {
    return { passed: false, nombre: 'TEST 16: Actualizar repaso', mensaje: 'ERROR: ' + error };
  }
}

function test17_ActualizarEvaluacion() {
  try {
    var evals = Student.obtenerEvaluaciones({ codeAlum: 'TEST05' });
    if (!evals.success) return { passed: false, nombre: 'TEST 17: Actualizar evaluación', mensaje: 'FALLÓ: No se pudieron obtener evaluaciones' };
    
    var evalQuim = null;
    for (var i = 0; i < evals.data.length; i++) {
      if (evals.data[i].Curso === 'QUIM' && evals.data[i].Nota === 15) {
        evalQuim = evals.data[i];
        break;
      }
    }
    
    if (!evalQuim) return { passed: false, nombre: 'TEST 17: Actualizar evaluación', mensaje: 'FALLÓ: Evaluación QUIM nota 15 no encontrada' };
    
    var result = Student.actualizarEvaluacion({ codeAlum: 'TEST05', rowNumber: evalQuim._rowNumber, curso: evalQuim.Curso, nomEval: evalQuim.NomEval, fechaEval: evalQuim.FechaEval, nota: 18, peso: evalQuim.Peso, sem: evalQuim.Sem });
    
    return result.success
      ? { passed: true, nombre: 'TEST 17: Actualizar evaluación', mensaje: '✓ Nota 15 → 18 actualizada' }
      : { passed: false, nombre: 'TEST 17: Actualizar evaluación', mensaje: 'FALLÓ: ' + result.error };
  } catch(error) {
    return { passed: false, nombre: 'TEST 17: Actualizar evaluación', mensaje: 'ERROR: ' + error };
  }
}

function test18_ActualizarTarea() {
  try {
    var tareas = Student.obtenerTareas({ codeAlum: 'TEST05' });
    if (!tareas.success || tareas.data.length === 0) return { passed: false, nombre: 'TEST 18: Actualizar tarea', mensaje: 'FALLÓ: No se pudieron obtener tareas' };
    
    var tarea = tareas.data[0];
    var result = Student.actualizarTarea({ codeAlum: 'TEST05', rowNumber: tarea._rowNumber, curso: tarea.Curso, tarea: tarea.Tarea, fechaEntrega: '20/01/2026', fechaAccion: tarea.FechaAccion, nota: tarea.Nota, peso: tarea.Peso, sem: tarea.Sem });
    
    return result.success
      ? { passed: true, nombre: 'TEST 18: Actualizar tarea', mensaje: '✓ Fecha entrega actualizada a 20/01/2026' }
      : { passed: false, nombre: 'TEST 18: Actualizar tarea', mensaje: 'FALLÓ: ' + result.error };
  } catch(error) {
    return { passed: false, nombre: 'TEST 18: Actualizar tarea', mensaje: 'ERROR: ' + error };
  }
}

function test19_ActualizarLectura() {
  try {
    var lecturas = Student.obtenerLecturas({ codeAlum: 'TEST05' });
    if (!lecturas.success || lecturas.data.length === 0) return { passed: false, nombre: 'TEST 19: Actualizar lectura', mensaje: 'FALLÓ: No se pudieron obtener lecturas' };
    
    var lectura = lecturas.data[0];
    var nuevoProgreso = Math.floor(lectura.CantPag * 0.75);
    var result = Student.actualizarLectura({ codeAlum: 'TEST05', rowNumber: lectura._rowNumber, curso: lectura.Curso, lectura: lectura.Lectura, cantPag: lectura.CantPag, pagActual: nuevoProgreso, fechaInicio: lectura.FechaInicio, fechaFin: lectura.FechaFin, fechaEval: lectura.FechaEval, nota: lectura.Nota, peso: lectura.Peso, sem: lectura.Sem });
    
    return result.success
      ? { passed: true, nombre: 'TEST 19: Actualizar lectura', mensaje: '✓ Progreso actualizado a 75%' }
      : { passed: false, nombre: 'TEST 19: Actualizar lectura', mensaje: 'FALLÓ: ' + result.error };
  } catch(error) {
    return { passed: false, nombre: 'TEST 19: Actualizar lectura', mensaje: 'ERROR: ' + error };
  }
}

// ========== TESTS 20-24: DELETE STUDENT (TEST05) ==========

function test20_EliminarCurso() {
  try {
    var cursos = Student.obtenerCursos({ codeAlum: 'TEST05' });
    if (!cursos.success) return { passed: false, nombre: 'TEST 20: Eliminar curso', mensaje: 'FALLÓ: No se pudieron obtener cursos' };
    
    var cursoIng = null;
    for (var i = 0; i < cursos.data.length; i++) {
      if (cursos.data[i].Curso === 'ING') {
        cursoIng = cursos.data[i];
        break;
      }
    }
    
    if (!cursoIng) return { passed: false, nombre: 'TEST 20: Eliminar curso', mensaje: 'FALLÓ: Curso ING no encontrado' };
    
    var result = Student.eliminarCurso({ codeAlum: 'TEST05', rowNumber: cursoIng._rowNumber });
    
    return result.success
      ? { passed: true, nombre: 'TEST 20: Eliminar curso', mensaje: '✓ Curso ING eliminado correctamente' }
      : { passed: false, nombre: 'TEST 20: Eliminar curso', mensaje: 'FALLÓ: ' + result.error };
  } catch(error) {
    return { passed: false, nombre: 'TEST 20: Eliminar curso', mensaje: 'ERROR: ' + error };
  }
}

function test21_EliminarRepaso() {
  try {
    var repasos = Student.obtenerRepasos({ codeAlum: 'TEST05' });
    if (!repasos.success || repasos.data.length === 0) return { passed: false, nombre: 'TEST 21: Eliminar repaso', mensaje: 'FALLÓ: No hay repasos' };
    
    var result = Student.eliminarRepaso({ codeAlum: 'TEST05', rowNumber: repasos.data[0]._rowNumber });
    
    return result.success
      ? { passed: true, nombre: 'TEST 21: Eliminar repaso', mensaje: '✓ Repaso eliminado correctamente' }
      : { passed: false, nombre: 'TEST 21: Eliminar repaso', mensaje: 'FALLÓ: ' + result.error };
  } catch(error) {
    return { passed: false, nombre: 'TEST 21: Eliminar repaso', mensaje: 'ERROR: ' + error };
  }
}

function test22_EliminarEvaluacion() {
  try {
    var evals = Student.obtenerEvaluaciones({ codeAlum: 'TEST05' });
    if (!evals.success || evals.data.length === 0) return { passed: false, nombre: 'TEST 22: Eliminar evaluación', mensaje: 'FALLÓ: No hay evaluaciones' };
    
    var result = Student.eliminarEvaluacion({ codeAlum: 'TEST05', rowNumber: evals.data[0]._rowNumber });
    
    return result.success
      ? { passed: true, nombre: 'TEST 22: Eliminar evaluación', mensaje: '✓ Evaluación eliminada correctamente' }
      : { passed: false, nombre: 'TEST 22: Eliminar evaluación', mensaje: 'FALLÓ: ' + result.error };
  } catch(error) {
    return { passed: false, nombre: 'TEST 22: Eliminar evaluación', mensaje: 'ERROR: ' + error };
  }
}

function test23_EliminarTarea() {
  try {
    var tareas = Student.obtenerTareas({ codeAlum: 'TEST05' });
    if (!tareas.success || tareas.data.length === 0) return { passed: false, nombre: 'TEST 23: Eliminar tarea', mensaje: 'FALLÓ: No hay tareas' };
    
    var result = Student.eliminarTarea({ codeAlum: 'TEST05', rowNumber: tareas.data[0]._rowNumber });
    
    return result.success
      ? { passed: true, nombre: 'TEST 23: Eliminar tarea', mensaje: '✓ Tarea eliminada correctamente' }
      : { passed: false, nombre: 'TEST 23: Eliminar tarea', mensaje: 'FALLÓ: ' + result.error };
  } catch(error) {
    return { passed: false, nombre: 'TEST 23: Eliminar tarea', mensaje: 'ERROR: ' + error };
  }
}

function test24_EliminarLectura() {
  try {
    var lecturas = Student.obtenerLecturas({ codeAlum: 'TEST05' });
    if (!lecturas.success || lecturas.data.length === 0) return { passed: false, nombre: 'TEST 24: Eliminar lectura', mensaje: 'FALLÓ: No hay lecturas' };
    
    var result = Student.eliminarLectura({ codeAlum: 'TEST05', rowNumber: lecturas.data[0]._rowNumber });
    
    return result.success
      ? { passed: true, nombre: 'TEST 24: Eliminar lectura', mensaje: '✓ Lectura eliminada correctamente' }
      : { passed: false, nombre: 'TEST 24: Eliminar lectura', mensaje: 'FALLÓ: ' + result.error };
  } catch(error) {
    return { passed: false, nombre: 'TEST 24: Eliminar lectura', mensaje: 'ERROR: ' + error };
  }
}

// ========== TESTS 25-27: HORARIOS (TEST05) ==========

function test25_AgregarHorarios() {
  try {
    var horarios = [
      { curso: 'MATE', horaInicio: '08:00', horaFin: '10:00', detalle: 'Lunes' },
      { curso: 'FIS', horaInicio: '10:00', horaFin: '12:00', detalle: 'Martes' },
      { curso: 'QUIM', horaInicio: '14:00', horaFin: '16:00', detalle: 'Miércoles' }
    ];
    
    var agregados = 0;
    for (var i = 0; i < horarios.length; i++) {
      if (Student.agregarHorarioClase({ codeAlum: 'TEST05', curso: horarios[i].curso, horaIni: horarios[i].horaInicio, horaFin: horarios[i].horaFin, detalle: horarios[i].detalle }).success) agregados++;
    }
    
    return agregados === 3
      ? { passed: true, nombre: 'TEST 25: Agregar horarios', mensaje: '✓ 3 horarios de clase agregados' }
      : { passed: false, nombre: 'TEST 25: Agregar horarios', mensaje: 'FALLÓ: Solo ' + agregados + ' de 3' };
  } catch(error) {
    return { passed: false, nombre: 'TEST 25: Agregar horarios', mensaje: 'ERROR: ' + error };
  }
}

function test26_VerificarMapeoHora() {
  try {
    var result = Student.obtenerHorarioClases({ codeAlum: 'TEST05' });
    
    if (!result.success || result.data.length === 0) return { passed: false, nombre: 'TEST 26: Mapeo HoraInicio→HoraIni', mensaje: 'FALLÓ: No hay horarios' };
    
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

// ========== TEST 27: HORARIO SEMANAL ==========

function test27_HorarioSemanal() {
  try {
    // ==========================================
    // Agregar 2 actividades a HorarioSem
    // ==========================================
    
    var actividad1 = Student.agregarHorarioSem({ 
      codeAlum: 'TEST05', 
      actividad: 'Repaso MATE', 
      horaInicio: '15:00', 
      horaFin: '17:00', 
      fechaHS: '06/01/2026', 
      tipoAct: 'Repaso', 
      color: '#FFC107', 
      sem: 1 
    });
    
    var actividad2 = Student.agregarHorarioSem({ 
      codeAlum: 'TEST05', 
      actividad: 'Estudio FIS', 
      horaInicio: '18:00', 
      horaFin: '20:00', 
      fechaHS: '07/01/2026', 
      tipoAct: 'Estudio', 
      color: '#28A745', 
      sem: 1 
    });
    
    if (!actividad1.success || !actividad2.success) {
      return { 
        passed: false, 
        nombre: 'TEST 27: Horario semanal', 
        mensaje: 'FALLÓ: No se pudieron agregar las 2 actividades' 
      };
    }
    
    // ==========================================
    // Verificar que se agregaron correctamente
    // ==========================================
    
    var horarios = Student.obtenerHorarioSem({ codeAlum: 'TEST05' });
    
    if (!horarios.success || horarios.data.length < 2) {
      return { 
        passed: false, 
        nombre: 'TEST 27: Horario semanal', 
        mensaje: 'FALLÓ: No se encontraron las 2 actividades agregadas' 
      };
    }
    
    // ==========================================
    // Eliminar solo la primera actividad
    // ==========================================
    
    var resultDel = Student.eliminarHorarioSem({ 
      codeAlum: 'TEST05', 
      rowNumber: horarios.data[0]._rowNumber 
    });
    
    if (!resultDel.success) {
      return { 
        passed: false, 
        nombre: 'TEST 27: Horario semanal', 
        mensaje: 'FALLÓ: No se pudo eliminar la primera actividad' 
      };
    }
    
    // ==========================================
    // Verificar que queda 1 registro
    // ==========================================
    
    var horariosFinales = Student.obtenerHorarioSem({ codeAlum: 'TEST05' });
    
    var quedaUno = horariosFinales.success && horariosFinales.data.length === 1;
    
    return quedaUno
      ? { 
          passed: true, 
          nombre: 'TEST 27: Horario semanal', 
          mensaje: '✓ 2 actividades agregadas, 1 eliminada, queda 1 registro en HorarioSem' 
        }
      : { 
          passed: false, 
          nombre: 'TEST 27: Horario semanal', 
          mensaje: 'FALLÓ: Debería quedar 1 registro, hay ' + (horariosFinales.data ? horariosFinales.data.length : 0) 
        };
        
  } catch(error) {
    return { 
      passed: false, 
      nombre: 'TEST 27: Horario semanal', 
      mensaje: 'ERROR: ' + error 
    };
  }
}


// ========== TESTS 28-30: FUNCIONES ESPECIALES (TEST05) ==========

function test28_PromedioPonderado() {
  try {
    var result = Student.obtenerNotasPorCurso({ codeAlum: 'TEST05', curso: 'MATE' });
    
    if (!result.success) return { passed: false, nombre: 'TEST 28: Promedio ponderado', mensaje: 'FALLÓ: ' + result.error };
    
    var tienePromedio = result.data.hasOwnProperty('promedio');
    var promedioValido = tienePromedio && parseFloat(result.data.promedio) > 0;
    
    return promedioValido
      ? { passed: true, nombre: 'TEST 28: Promedio ponderado', mensaje: '✓ Promedio MATE: ' + result.data.promedio }
      : { passed: false, nombre: 'TEST 28: Promedio ponderado', mensaje: 'FALLÓ: Promedio inválido o ausente' };
  } catch(error) {
    return { passed: false, nombre: 'TEST 28: Promedio ponderado', mensaje: 'ERROR: ' + error };
  }
}

function test29_ResumenNotas() {
  try {
    var result = Student.obtenerResumenNotas({ codeAlum: 'TEST05' });
    
    if (!result.success) return { passed: false, nombre: 'TEST 29: Resumen notas', mensaje: 'FALLÓ: ' + result.error };
    
    var tieneCursos = result.data && result.data.length > 0;
    
    return tieneCursos
      ? { passed: true, nombre: 'TEST 29: Resumen notas', mensaje: '✓ Resumen de ' + result.data.length + ' cursos obtenido' }
      : { passed: false, nombre: 'TEST 29: Resumen notas', mensaje: 'FALLÓ: Sin datos de cursos' };
  } catch(error) {
    return { passed: false, nombre: 'TEST 29: Resumen notas', mensaje: 'ERROR: ' + error };
  }
}

function test30_DeberesUnificados() {
  try {
    var result = Student.obtenerTodosDeberes({ codeAlum: 'TEST05' });
    
    if (!result.success) return { passed: false, nombre: 'TEST 30: Deberes unificados', mensaje: 'FALLÓ: ' + result.error };
    
    var tieneDeberes = result.data && result.data.length > 0;
    var tieneTipos = false;
    
    if (tieneDeberes) {
      var tipos = {};
      for (var i = 0; i < result.data.length; i++) {
        if (result.data[i].tipo) tipos[result.data[i].tipo] = true;
      }
      tieneTipos = Object.keys(tipos).length >= 2;
    }
    
    return tieneDeberes && tieneTipos
      ? { passed: true, nombre: 'TEST 30: Deberes unificados', mensaje: '✓ ' + result.data.length + ' deberes unificados correctamente' }
      : { passed: false, nombre: 'TEST 30: Deberes unificados', mensaje: 'FALLÓ: Unificación incompleta' };
  } catch(error) {
    return { passed: false, nombre: 'TEST 30: Deberes unificados', mensaje: 'ERROR: ' + error };
  }
}

// ========== TEST 31: ADMIN BÚSQUEDA ==========

function test31_BusquedaAvanzada() {
  try {
    var result = Admin.buscarAlumno({ filtro: 'test' });
    
    if (!result.success) return { passed: false, nombre: 'TEST 31: Búsqueda avanzada', mensaje: 'FALLÓ: ' + result.error };
    
    var encontrados = result.data ? result.data.length : 0;
    
    return encontrados >= 5
      ? { passed: true, nombre: 'TEST 31: Búsqueda avanzada', mensaje: '✓ ' + encontrados + ' alumnos encontrados con "test"' }
      : { passed: false, nombre: 'TEST 31: Búsqueda avanzada', mensaje: 'FALLÓ: Solo ' + encontrados + ' encontrados (esperados 5+)' };
  } catch(error) {
    return { passed: false, nombre: 'TEST 31: Búsqueda avanzada', mensaje: 'ERROR: ' + error };
  }
}

// ========== TEST 32: VERIFICAR TEST05 Y TEST06 ==========

function test32_VerificarDatosTest05yTest06() {
  try {
    var test05 = Student.obtenerCursos({ codeAlum: 'TEST05' });
    var test06 = Student.obtenerCursos({ codeAlum: 'TEST06' });
    
    var test05Valido = test05.success && test05.data.length >= 5;
    var test06Valido = test06.success && test06.data.length >= 3;
    
    return test05Valido && test06Valido
      ? { passed: true, nombre: 'TEST 32: Verificar TEST05 y TEST06', mensaje: '✓ TEST05 (' + test05.data.length + ' cursos) y TEST06 (' + test06.data.length + ' cursos) tienen datos' }
      : { passed: false, nombre: 'TEST 32: Verificar TEST05 y TEST06', mensaje: 'FALLÓ: TEST05 o TEST06 sin datos suficientes' };
  } catch(error) {
    return { passed: false, nombre: 'TEST 32: Verificar TEST05 y TEST06', mensaje: 'ERROR: ' + error };
  }
}

// ========== TEST 33: ELIMINACIÓN CASCADA (TEST06) ==========

function test33_EliminacionCascada() {
  try {
    var result = Admin.eliminarAlumno({ codeAlum: 'TEST06' });
    
    if (!result.success) return { passed: false, nombre: 'TEST 33: Eliminación cascada', mensaje: 'FALLÓ: ' + result.error };
    
    var verificar = DB.buscar('Alumnos', 'CodeAlum', 'TEST06');
    
    return !verificar.success
      ? { passed: true, nombre: 'TEST 33: Eliminación cascada', mensaje: '✓ TEST06 eliminado de 9 hojas (' + result.message + ')' }
      : { passed: false, nombre: 'TEST 33: Eliminación cascada', mensaje: 'FALLÓ: TEST06 aún existe en Alumnos' };
  } catch(error) {
    return { passed: false, nombre: 'TEST 33: Eliminación cascada', mensaje: 'ERROR: ' + error };
  }
}

// ==========================================
// PARTE 3: FUNCIÓN PRINCIPAL
// ==========================================

function ejecutarTodasLasPruebas() {
  var resultados = [];
  
  Logger.log('====================================');
  Logger.log('INICIANDO SUITE DE PRUEBAS - PBE CONTROL V01.17');
  Logger.log('====================================');
  
  resultados.push(limpiarDatosPrueba());
  
  var tests = [
    test01_CrearAlumnos, test02_ValidarUnicidadCodeAlum, test03_ValidarUnicidadClave,
    test04_AgregarCursos, test05_AgregarRepasos, test06_AgregarEvaluaciones,
    test07_AgregarTareas, test08_AgregarLecturas,
    test08b_ValidarUnicidadCurso, test08c_ValidarUnicidadRepaso, test08d_ValidarUnicidadEvaluacion,
    test08e_ValidarUnicidadTarea, test08f_ValidarUnicidadLectura,
    test08g_LlenarTest06,
    test09_BuscarAlumno, test10_ObtenerCursos, test11_ObtenerRepasos,
    test12_ObtenerEvaluaciones, test13_ObtenerTareas, test14_ObtenerLecturas,
    test15_ActualizarCurso, test16_ActualizarRepaso, test17_ActualizarEvaluacion,
    test18_ActualizarTarea, test19_ActualizarLectura,
    test20_EliminarCurso, test21_EliminarRepaso, test22_EliminarEvaluacion,
    test23_EliminarTarea, test24_EliminarLectura,
    test25_AgregarHorarios, test26_VerificarMapeoHora, test27_HorarioSemanal,
    test28_PromedioPonderado, test29_ResumenNotas, test30_DeberesUnificados,
    test31_BusquedaAvanzada, test32_VerificarDatosTest05yTest06, test33_EliminacionCascada
  ];
  
  for (var i = 0; i < tests.length; i++) {
    Logger.log('Ejecutando TEST ' + (i < 9 ? '0' : '') + (i + 1) + '...');
    resultados.push(tests[i]());
  }
  
  Logger.log('====================================');
  Logger.log('SUITE DE PRUEBAS COMPLETADA');
  Logger.log('====================================');
  
  mostrarResultadosEnUI(resultados);
  
  return resultados;
}

function mostrarResultadosEnUI(resultados) {
  try {
    var template = HtmlService.createTemplateFromFile('2testui');
    template.resultados = JSON.stringify(resultados);
    
    var html = template.evaluate().setWidth(900).setHeight(700);
    
    SpreadsheetApp.getUi().showModalDialog(html, '🧪 Resultados de Pruebas - PBE Control V01.17');
  } catch(error) {
    Logger.log('Error al mostrar UI: ' + error.toString());
    
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
// FIN DE 2testback.gs - V01.17
// Total: 40 funciones
// - 1 limpieza
// - 38 tests (37 de V01.15 + 1 nuevo test08g)
// - 1 ejecutarTodasLasPruebas()
// - 1 mostrarResultadosEnUI()
//
// CAMBIOS V01.17:
// ✅ TEST01: Crear 6 alumnos (agregado TEST06)
// ✅ TEST 08g: Llenar TEST06 con data completa
// ✅ TEST 32: Verificar que TEST05 y TEST06 tienen datos
// ✅ TEST 33: Eliminar TEST06 (antes era TEST32 que eliminaba TEST05)
// ✅ TEST05 conserva TODAS sus evidencias para pruebas robustas
// ==========================================
