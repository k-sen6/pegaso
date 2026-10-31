"use client";

import { useEffect, useState } from "react";
import { cn } from "cn";

type Estado = "online" | "offline";

/**
 * Iteración 1: online/offline real via eventos del navegador.
 * Iteración 5: añade "Sincronizando…" / "Todo sincronizado" con PowerSync.
 */
export function ConnectionIndicator({ className }: { className?: string }) {
  const [estado, setEstado] = useState<Estado>("online");
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
    const f = (nuevo: Estado) => () => setEstado(nuevo);
    window.addEventListener("online", f("online"));
    window.addEventListener("offline", f("offline"));
    setEstado(navigator.onLine ? "online" : "offline");
    return () => {
      window.removeEventListener("online", f("online"));
      window.removeEventListener("offline", f("offline"));
    };
  }, []);

  if (!montado) return null;

  return (
    <span
      role="status"
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs", className)}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          estado === "online" ? "bg-success" : "bg-destructive"
        )}
      />
      {estado === "online" ? "En línea" : "Sin conexión"}
    </span>
  );
}
