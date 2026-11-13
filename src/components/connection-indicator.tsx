"use client";

import { useRed } from "@/store/red";
import { cn } from "cn";

export function ConnectionIndicator({ className }: { className?: string }) {
  const online = useRed();

  return (
    <span
      role="status"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs",
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          online ? "bg-success" : "bg-warning"
        )}
      />
      {online ? "En línea" : "Sin conexión"}
    </span>
  );
}
