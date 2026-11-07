"use client";

import { useSyncExternalStore } from "react";
import { ui, uiServidor } from "@/store/ui";
import { TEMA_ARCHIVO } from "@/lib/mock/temas";

/**
 * Isla cliente: solo descarga la imagen real si el usuario la pidió.
 * Sin opt-in, muestra el placeholder gradiente determinista (0 bytes de red).
 */
export function ImagenOptin({
  temaId,
  alt,
  priorizar,
}: {
  temaId: string;
  alt: string;
  priorizar?: boolean;
}) {
  const { imagenes } = useSyncExternalStore(
    ui.suscribir,
    ui.obtener,
    () => uiServidor
  );

  if (imagenes) {
    return (
      <img
        src={`/pegaso/img/${TEMA_ARCHIVO[temaId] ?? "generica"}.avif`}
        alt={alt}
        {...(priorizar ? { fetchPriority: "high" as const } : { loading: "lazy" as const })}
        decoding="async"
        className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        onError={(e) => e.currentTarget.remove()}
      />
    );
  }
  return null;
}
