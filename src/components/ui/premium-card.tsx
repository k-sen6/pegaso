"use client";

import { cn } from "cn";

/**
 * Tarjeta premium base. Usa las utilidades de globals.css (card-premium).
 * Sin dependencias de shadcn para mantener el bundle bajo.
 */
export function PremiumCard({
  children,
  className,
  hoverable = true,
  padding = "p-5",
}: {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: string;
}) {
  return (
    <div
      className={cn(
        "card-premium relative overflow-hidden",
        padding,
        hoverable && "",
        className
      )}
    >
      {children}
    </div>
  );
}
