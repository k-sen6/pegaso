// Utilidades de WhatsApp y ubicación. Sin dependencias ni red.

/**
 * Normaliza un teléfono cubano a dígitos internacionales sin "+".
 * Acepta "+53 5 123 4567", "05 123 4567", "51234567", "5351234567".
 */
export function normalizarTelefono(bruto: string | null | undefined): string {
  let d = (bruto ?? "").replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("53")) d = d.slice(2);
  d = d.replace(/^0+/, "");
  if (d.length === 8) return `53${d}`;
  if (d.length > 8) return `53${d.slice(-8)}`;
  return d;
}

export function telefonoValido(bruto: string | null | undefined): boolean {
  return normalizarTelefono(bruto).length === 10;
}

/** Formato legible: +53 5 123 4567 */
export function formatearTelefono(bruto: string | null | undefined): string {
  const d = normalizarTelefono(bruto);
  if (d.length !== 10) return bruto ?? "";
  const n = d.slice(2);
  return `+53 ${n.slice(0, 1)} ${n.slice(1, 4)} ${n.slice(4)}`;
}

export function enlaceWhatsApp(
  telefono: string | null | undefined,
  mensaje: string
): string | null {
  const d = normalizarTelefono(telefono);
  if (d.length !== 10) return null;
  return `https://wa.me/${d}?text=${encodeURIComponent(mensaje)}`;
}

export function mensajeProducto(opciones: {
  vendedor?: string | null;
  producto: string;
  precioCup: number;
  url: string;
  direccion?: string | null;
  mapa?: string | null;
}): string {
  const lineas = [
    `Hola${opciones.vendedor ? ` ${opciones.vendedor}` : ""}, me interesa ${opciones.producto} (${opciones.precioCup} CUP) que vi en Pegaso.`,
  ];
  if (opciones.direccion) lineas.push(`Ubicación: ${opciones.direccion}`);
  if (opciones.mapa) lineas.push(opciones.mapa);
  lineas.push(opciones.url);
  return lineas.join("\n");
}

export function enlaceMapa(opciones: {
  direccion?: string | null;
  municipio?: string | null;
  provincia?: string | null;
  lat?: number | null;
  lng?: number | null;
}): string | null {
  if (
    typeof opciones.lat === "number" &&
    typeof opciones.lng === "number" &&
    Number.isFinite(opciones.lat) &&
    Number.isFinite(opciones.lng)
  ) {
    return `https://www.google.com/maps/search/?api=1&query=${opciones.lat},${opciones.lng}`;
  }
  const partes = [
    opciones.direccion,
    opciones.municipio,
    opciones.provincia,
    "Cuba",
  ].filter((x): x is string => Boolean(x && x.trim()));
  if (partes.length < 2) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    partes.join(", ")
  )}`;
}

/** URL absoluta de una ficha de producto (respeta el basePath /pegaso). */
export function urlProducto(slug: string): string {
  if (typeof window === "undefined") {
    return `https://k-sen6.github.io/pegaso/producto/?slug=${encodeURIComponent(slug)}`;
  }
  const base = window.location.pathname.startsWith("/pegaso") ? "/pegaso" : "";
  return `${window.location.origin}${base}/producto/?slug=${encodeURIComponent(slug)}`;
}

export function mensajeTienda(opciones: {
  vendedor?: string | null;
  url: string;
  direccion?: string | null;
  mapa?: string | null;
}): string {
  const lineas = [
    `Hola${opciones.vendedor ? ` ${opciones.vendedor}` : ""}, vi tu tienda en Pegaso y me interesa un producto.`,
  ];
  if (opciones.direccion) lineas.push(`Ubicación: ${opciones.direccion}`);
  if (opciones.mapa) lineas.push(opciones.mapa);
  if (opciones.url) lineas.push(opciones.url);
  return lineas.join("\n");
}
