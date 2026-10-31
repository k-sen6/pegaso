import { COOPERATIVAS } from "./cooperativas";
import { CURSOS } from "./cursos";
import { PRODUCTOS, PRODUCTOS_DESTACADOS } from "./productos";

export { COOPERATIVAS, CURSOS, PRODUCTOS, PRODUCTOS_DESTACADOS };
export type { Cooperativa, Producto, Curso, Sector } from "./types";
import type { Cooperativa } from "./types";

/**
 * Iteración 1: cooperativas con productos publicados son solo las
 * verificadas (las pendientes/rechazadas no venden aún).
 */
export function cooperativaPorId(id: string): Cooperativa | undefined {
  return COOPERATIVAS.find((c) => c.id === id);
}
