"use client";

import { useSyncExternalStore, type CSSProperties } from "react";
import { ui, uiServidor } from "@/store/ui";
import { TEMA_ARCHIVO } from "@/lib/mock/temas";
import { cn } from "cn";

/**
 * Portada única de productos.
 * - Normal: foto real AVIF (13 KB promedio) + overlay suave. Sin emoji.
 * - Modo 2G (imagenes=false): gradiente determinista + emoji, 0 bytes de red.
 * El gradiente SIEMPRE va debajo de la imagen: si la foto falla (onError),
 * el fondo continúa visible.
 */
export function PortadaOptin({
  temaId,
  hue,
  nombre,
  priorizar,
  className,
}: {
  temaId: string;
  hue: number;
  nombre: string;
  priorizar?: boolean;
  className?: string;
  grande?: boolean;
}) {
  const { imagenes } = useSyncExternalStore(
    ui.suscribir,
    ui.obtener,
    () => uiServidor
  );

  const fondo: CSSProperties = {
    background: `linear-gradient(135deg, oklch(0.86 0.07 ${hue + 10}), oklch(0.56 0.11 ${hue - 18}))`,
  };

  return (
    <div className={cn("relative overflow-hidden group", className)}>
      <span aria-hidden="true" className="absolute inset-0" style={fondo} />
      {imagenes && (
        <>
          <img
            src={`/pegaso/img/${TEMA_ARCHIVO[temaId] ?? "generica"}.avif`}
            alt={nombre}
            {...(priorizar ? { fetchPriority: "high" as const } : { loading: "lazy" as const })}
            decoding="async"
            className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            onError={(e) => e.currentTarget.remove()}
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent"
          />
        </>
      )}
    </div>
  );
}
