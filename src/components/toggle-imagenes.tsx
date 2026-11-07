"use client";

import { useEffect, useState } from "react";
import { ImageIcon, ImageOff } from "lucide-react";
import { useUi } from "@/store/ui";
import { cn } from "cn";

export function ToggleImagenes({ className }: { className?: string }) {
  const { imagenes, toggleImagenes } = useUi();
  const [montado, setMontado] = useState(false);

  useEffect(() => setMontado(true), []);

  if (!montado) return <span className={cn("size-9", className)} aria-hidden="true" />;

  return (
    <button
      type="button"
      onClick={toggleImagenes}
      aria-pressed={imagenes}
      aria-label={imagenes ? "Desactivar descarga de imágenes" : "Activar descarga de imágenes"}
      title={imagenes ? "Imágenes activadas" : "Modo ahorro: sin imágenes"}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-foreground",
        imagenes ? "text-primary" : "text-muted-foreground",
        className
      )}
    >
      {imagenes ? <ImageIcon className="size-4" aria-hidden="true" /> : <ImageOff className="size-4" aria-hidden="true" />}
    </button>
  );
}
