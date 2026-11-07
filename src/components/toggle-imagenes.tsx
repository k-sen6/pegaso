"use client";

import { useSyncExternalStore } from "react";
import { Image as ImageIcon } from "lucide-react";
import { ui, uiServidor } from "@/store/ui";
import { cn } from "cn";

export function ToggleImagenes({ className }: { className?: string }) {
  const { imagenes } = useSyncExternalStore(
    ui.suscribir,
    ui.obtener,
    () => uiServidor
  );

  return (
    <button
      type="button"
      onClick={ui.toggleImagenes}
      role="switch"
      aria-checked={imagenes}
      title={imagenes ? "Imágenes: encendidas" : "Imágenes: apagadas (modo 2G)"}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-md transition-colors",
        imagenes
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
        className
      )}
    >
      <ImageIcon className="size-4" aria-hidden="true" />
      <span className="sr-only">Imágenes reales: {imagenes ? "encendidas" : "apagadas"}</span>
    </button>
  );
}
