"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { enlaceWhatsApp } from "@/lib/whatsapp";
import { cn } from "cn";

/**
 * CTA de WhatsApp. Si el vendedor no tiene número válido, muestra un estado
 * deshabilitado en lugar de un enlace roto.
 */
export function BotonWhatsApp({
  telefono,
  mensaje,
  children,
  compacto = false,
  variant = "default",
  className,
}: {
  telefono: string | null | undefined;
  mensaje: string;
  children?: React.ReactNode;
  compacto?: boolean;
  variant?: "default" | "outline" | "ghost" | "secondary";
  className?: string;
}) {
  const href = enlaceWhatsApp(telefono, mensaje);

  if (!href) {
    if (compacto) return null;
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground",
          className
        )}
      >
        <MessageCircle className="size-4 shrink-0" aria-hidden="true" />
        {compacto ? null : "El vendedor aún no añadió WhatsApp"}
      </span>
    );
  }

  return (
    <Button
      asChild
      variant={variant}
      size={compacto ? "icon" : "lg"}
      className={cn(
        compacto
          ? "size-10 rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#1ebe5b]"
          : "h-11 px-6 bg-[#25D366] text-white hover:bg-[#1ebe5b]",
        className
      )}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className={compacto ? "size-5" : "size-4"} aria-hidden="true" />
        {compacto ? null : children ?? "Contactar por WhatsApp"}
      </a>
    </Button>
  );
}
