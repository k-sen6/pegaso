/**
 * Formateo de precios en CUP.
 * Intl "es-CU" no existe en todos los runtimes; usamos es-ES como base
 * con código CUP explícito para consistencia entre servidor y cliente.
 */
export function formatoPrecioCup(precioCup: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "CUP",
    maximumFractionDigits: 0,
  }).format(precioCup);
}
