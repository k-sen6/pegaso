"use client";

import { useEffect, useState } from "react";
import { useUi } from "@/store/ui";

/**
 * Isla client: muestra la imagen real del producto SOLO si el usuario
 * activó el modo de descarga de imágenes. Cero bytes de red con el
 * interruptor apagado; con él encendido, carga perezosa nativa.
 * Ruta esperada: /pegaso/img/p-<id>-640.webp (pipeline de imágenes, fase en curso).
 */
export function ImagenOptin({ alt }: { alt: string }) {
  const imagenes = useUi((s) => s.imagenes);
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  if (!montado || !imagenes) return null;

  return (
    <img
      src="/pegaso/img/p-generico-640.webp"
      alt={alt}
      loading="lazy"
      decoding="async"
      className="absolute inset-0 size-full object-cover"
      onError={(e) => e.currentTarget.remove()}
    />
  );
}
