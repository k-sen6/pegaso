"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "cn";

export function ToggleTema({ className }: { className?: string }) {
  const [montado, setMontado] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMontado(true), []);

  if (!montado) return <span className={cn("size-9", className)} aria-hidden="true" />;

  const oscuro = resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(oscuro ? "light" : "dark")}
      aria-label={oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        className
      )}
    >
      {oscuro ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
    </button>
  );
}
