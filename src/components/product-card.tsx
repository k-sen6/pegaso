"use client";

import Link from "next/link";
import { BadgeCheck, MapPin } from "lucide-react";
import type { Cooperativa, Producto } from "@/lib/catalogo";
import { formatoPrecioCup } from "@/lib/precio";
import { cn } from "cn";
import { PortadaOptin } from "@/components/portada-optin";
import { BotonWhatsApp } from "@/components/boton-whatsapp";
import { mensajeProducto, urlProducto } from "@/lib/whatsapp";

export function ProductCard({
  producto,
  cooperativa,
  className,
  fotoUrl,
}: {
  producto: Producto;
  cooperativa?: Cooperativa | null;
  className?: string;
  fotoUrl?: string | null;
}) {
  const verificado = cooperativa?.verificacion === "verificado";
  const nombreCoop = cooperativa?.nombre ?? "";
  const provinciaCoop = cooperativa?.provincia ?? "";

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg",
        className
      )}
    >
      <Link
        href={`/producto?slug=${producto.slug}`}
        className="block focus-visible:outline-none"
        aria-label={`${producto.nombre}, ${formatoPrecioCup(producto.precio_cup)}`}
      >
        <PortadaOptin
          temaId="generica"
          hue={producto.hue ?? 225}
          nombre={producto.nombre}
          fotoUrl={fotoUrl}
          className="aspect-[4/3] rounded-lg"
        />
      </Link>
      <BotonWhatsApp
        compacto
        telefono={cooperativa?.telefono}
        mensaje={mensajeProducto({
          vendedor: nombreCoop,
          producto: producto.nombre,
          precioCup: producto.precio_cup,
          url: urlProducto(producto.slug),
        })}
        className="absolute right-3 top-3 z-10"
      />
      <div className="flex flex-col gap-2 p-4">
        <h3 className="truncate font-semibold text-lg leading-snug">
          <Link href={`/producto?slug=${producto.slug}`} className="hover:underline underline-offset-4">
            {producto.nombre}
          </Link>
        </h3>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold leading-none text-primary">
            {formatoPrecioCup(producto.precio_cup)}
          </p>
          {verificado && (
            <BadgeCheck className="size-4 shrink-0 text-success" aria-label="Vendedor verificado" />
          )}
        </div>
        {nombreCoop && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {nombreCoop} · {provinciaCoop}
            </span>
          </p>
        )}
      </div>
    </article>
  );
}
