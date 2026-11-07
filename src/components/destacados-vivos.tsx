"use client";

import { useMemo } from "react";
import { ProductCard } from "@/components/product-card";
import { useCatalogoVivo } from "@/lib/catalogo";
import { PRODUCTOS_DESTACADOS, cooperativaPorId } from "@/lib/mock";

/**
 * Productos destacados: mock al instante, luego Supabase en vivo.
 */
export function DestacadosVivos() {
  const { productos, cooperativas, vivo } = useCatalogoVivo();

  const destacados = useMemo(() => {
    if (!vivo) return PRODUCTOS_DESTACADOS;
    const remotos = productos.filter((p) => p.destacado);
    return remotos.length > 0 ? remotos.slice(0, 8) : productos.slice(0, 8);
  }, [productos, vivo]);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {destacados.map((producto) => {
        const coop = cooperativas.get(producto.cooperativaId) ?? cooperativaPorId(producto.cooperativaId);
        if (!coop) return null;
        return <ProductCard key={producto.id} producto={producto} cooperativa={coop} />;
      })}
    </div>
  );
}
