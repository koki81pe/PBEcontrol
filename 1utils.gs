// MOD-001: ENCABEZADO [INICIO]
/*
*****************************************
PROYECTO: PBE Control
ARCHIVO: 1utils.gs
VERSIÓN: 01.14
FECHA: 18/01/2026 11:58 (UTC-5)
*****************************************
*/
// MOD-001: FIN

// MOD-002: MÓDULO UTILS - DECLARACIÓN [INICIO]
var Utils = (function() {
// MOD-002: FIN

// MOD-003: FECHA ACTUAL [INICIO]
/**
 * Obtener fecha actual en formato DD/MM/AAAA
 * Zona horaria: GMT-5 (Lima, Perú)
 */
function fechaHoy() {
  var fecha = new Date();
  var dia = ('0' + fecha.getDate()).slice(-2);
  var mes = ('0' + (fecha.getMonth() + 1)).slice(-2);
  var anio = fecha.getFullYear();
  return dia + '/' + mes + '/' + anio;
}
// MOD-003: FIN

// MOD-004: VALIDAR EMAIL [INICIO]
/**
 * Validar formato de email
 * Regex: [texto]@[dominio].[extension]
 */
function validarEmail(email) {
  var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
// MOD-004: FIN

// MOD-005: EXPORTAR FUNCIONES PÚBLICAS [INICIO]
return {
  fechaHoy: fechaHoy,
  validarEmail: validarEmail
};
// MOD-005: FIN

// MOD-006: CIERRE MÓDULO UTILS [INICIO]
})();
// MOD-006: FIN

// MOD-007: PALETA DE COLORES [INICIO]
var COLORES = {
  rojo: '#FF5733',
  azul: '#3498DB',
  verde: '#2ECC71',
  amarillo: '#F1C40F',
  morado: '#9B59B6',
  naranja: '#E67E22',
  rosa: '#E91E63',
  turquesa: '#1ABC9C'
};
// MOD-007: FIN

// MOD-008: CÓDIGO DE CIERRE [INICIO]
Logger.log('✅ 1utils.gs v01.14 cargado');
// MOD-008: FIN

// MOD-099: NOTAS [INICIO]
/*
DESCRIPCIÓN:
Funciones de utilidad reutilizables para el sistema
Módulo standalone sin dependencias externas

FUNCIONES PÚBLICAS:
- fechaHoy: Retorna fecha actual en formato DD/MM/AAAA
- validarEmail: Valida formato de email con regex

CONSTANTES GLOBALES:
- COLORES: Paleta de 8 colores predefinidos del sistema

CARACTERÍSTICAS:
- Zona horaria: GMT-5 (Lima, Perú)
- Formato de fechas: DD/MM/AAAA
- Validación de email con expresión regular estándar

EJEMPLOS DE USO:
Utils.fechaHoy() → "18/01/2026"
Utils.validarEmail("usuario@dominio.com") → true
Utils.validarEmail("invalido@") → false
var colorPrimario = COLORES.azul; // '#3498DB'

DEPENDENCIAS:
Ninguna - Módulo completamente standalone

CAMBIOS V01.13 → V01.14:
- Remodulación completa según Estándar CodeWorkShop v4.0
- Estructura modular simplificada
- Comentarios consolidados en MOD-099
*/
// MOD-099: FIN
