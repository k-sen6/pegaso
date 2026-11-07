import { COOPERATIVAS } from "./cooperativas";
import { CURSOS } from "./cursos";
import { PRODUCTOS, PRODUCTOS_DESTACADOS } from "./productos";

export { COOPERATIVAS, CURSOS, PRODUCTOS, PRODUCTOS_DESTACADOS };
export type { Cooperativa, Producto, Curso, Sector } from "./types";
import type { Cooperativa, Producto } from "./types";

/**
 * Iteración 1: cooperativas con productos publicados son solo las
 * verificadas (las pendientes/rechazadas no venden aún).
 */
export function cooperativaPorId(id: string): Cooperativa | undefined {
  return COOPERATIVAS.find((c) => c.id === id);
}

export function productoPorSlug(slug: string): Producto | undefined {
  return PRODUCTOS.find((p) => p.slug === slug);
}

/** Productos relacionados: misma cooperativa, luego mismo sector. */
export function relacionados(producto: Producto, max = 4): Producto[] {
  const otros = PRODUCTOS.filter((p) => p.id !== producto.id);
  const mismaCoop = otros.filter((p) => p.cooperativaId === producto.cooperativaId);
  const mismoSector = otros.filter(
    (p) => p.cooperativaId !== producto.cooperativaId && p.sector === producto.sector
  );
  return [...mismaCoop, ...mismoSector].slice(0, max);
}
