"use client";

import { useMemo } from "react";
import { ProductCard } from "@/components/product-card";
import { useCatalogoVivo } from "@/lib/catalogo";

export function DestacadosVivos() {
  const { productos, vivo } = useCatalogoVivo();

  const destacados = useMemo(() => {
    if (!vivo) return [];
    return productos.filter((p) => p.destacado).slice(0, 8);
  }, [productos, vivo]);

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
      {destacados.map((producto) => (
        <ProductCard key={producto.id} producto={producto} cooperativa={null} />
      ))}
    </div>
  );
}
