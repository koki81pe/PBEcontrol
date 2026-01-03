/*
******************************************
PBE CONTROL - 1utils.gs - V01.13
Sistema de Gestión Académica
03/01/2026 - 20:00
******************************************

CONTENIDO:
- Funciones de utilidad reutilizables
- Manejo de fechas (formato DD/MM/AAAA)
- Validaciones (email, etc.)
- Paleta de colores predefinida

FUNCIONES:
- fechaHoy: Retorna fecha actual en formato DD/MM/AAAA
- validarEmail: Valida formato de email
- COLORES: Paleta de colores del sistema

IMPORTANTE:
- Módulo standalone (no depende de otros)
- Zona horaria: GMT-5 (Lima, Perú)
- Formato de fechas: DD/MM/AAAA

🔑 FORMATO DE FECHAS: "Todas las fechas en DD/MM/AAAA, zona horaria GMT-5 (Lima)"
******************************************
*/

// ==========================================
// MÓDULO UTILS - FUNCIONES DE UTILIDAD
// ==========================================

var Utils = (function() {
  
  // ==========================================
  // 1. MANEJO DE FECHAS
  // ==========================================
  
  /**
   * Obtener fecha actual en formato DD/MM/AAAA
   * 
   * Zona horaria: GMT-5 (Lima, Perú)
   * 
   * @return {string} - Fecha en formato DD/MM/AAAA
   * 
   * Ejemplo:
   * Utils.fechaHoy() → "03/01/2026"
   */
  function fechaHoy() {
    var fecha = new Date();
    var dia = ('0' + fecha.getDate()).slice(-2);
    var mes = ('0' + (fecha.getMonth() + 1)).slice(-2);
    var anio = fecha.getFullYear();
    return dia + '/' + mes + '/' + anio;
  }
  
  // ==========================================
  // 2. VALIDACIONES
  // ==========================================
  
  /**
   * Validar formato de email
   * 
   * Regex: [texto]@[dominio].[extension]
   * 
   * @param {string} email - Email a validar
   * @return {boolean} - true si es válido, false si no
   * 
   * Ejemplo:
   * Utils.validarEmail("jorge@example.com") → true
   * Utils.validarEmail("jorge@") → false
   * Utils.validarEmail("jorge.com") → false
   */
  function validarEmail(email) {
    var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
  
  // ==========================================
  // EXPORTAR FUNCIONES PÚBLICAS
  // ==========================================
  
  return {
    fechaHoy: fechaHoy,
    validarEmail: validarEmail
  };
  
})();

// ==========================================
// 3. PALETA DE COLORES DEL SISTEMA
// ==========================================

/**
 * Paleta de colores predefinida
 * 
 * Uso:
 * var color = COLORES.rojo; // '#FF5733'
 * var color = COLORES.azul; // '#3498DB'
 */
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

// ==========================================
// FIN DE 1utils.gs
// Total: 2 funciones públicas + COLORES
// - fechaHoy(): Formato DD/MM/AAAA
// - validarEmail(): Validación con regex
// - COLORES: 8 colores predefinidos
// ==========================================
