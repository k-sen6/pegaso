"use client";

import { WifiOff } from "lucide-react";
import { useRed } from "@/store/red";

export function OfflineBanner() {
  const online = useRed();
  if (online) return null;

  return (
    <div
      role="status"
      className="fixed left-1/2 top-[calc(env(safe-area-inset-top)+10px)] z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full border border-warning/40 bg-card/95 px-3.5 py-2 text-xs font-medium shadow-premium backdrop-blur-xl"
    >
      <WifiOff className="size-3.5 text-warning" aria-hidden="true" />
      Sin conexión · mostrando datos guardados
    </div>
  );
}
