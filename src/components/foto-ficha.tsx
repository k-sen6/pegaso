"use client";

import { PortadaOptin } from "@/components/portada-optin";
import type { Producto, FotoProducto } from "@/lib/catalogo";

/**
 * Portada de la ficha: usa la foto ya cargada por la página (sin consultas
 * extra) o cae al arte local. Offline siempre tiene algo que mostrar.
 */
export function FotoFicha({
  producto,
  foto,
}: {
  producto: Producto;
  foto?: FotoProducto | null;
}) {
  return (
    <PortadaOptin
      temaId="generica"
      hue={producto.hue ?? 225}
      nombre={producto.nombre}
      priorizar
      fotoUrl={foto?.card ?? foto?.thumb ?? null}
      className="aspect-[4/3] rounded-xl"
    />
  );
}
