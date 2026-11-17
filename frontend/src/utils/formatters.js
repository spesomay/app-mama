/**
 * Utilidades para formateo de datos en HechoByGaby
 */

/**
 * Formatea un número como moneda en formato argentino (ARS)
 * Ejemplo: 12000 -> "$12.000"
 */
export function formatPrice(amount) {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '$0';
  }
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(Number(amount));
}

/**
 * Formatea una fecha ISO a formato local legible
 * Ejemplo: "2026-11-06T23:13:39.038Z" -> "06/11/2026"
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}
