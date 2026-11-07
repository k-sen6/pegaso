"use client";

import Link from "next/link";
import { BadgeCheck, MapPin, Heart } from "lucide-react";
import type { Producto } from "@/lib/catalogo";
import { formatoPrecioCup } from "@/lib/precio";
import { cn } from "cn";
import { PortadaOptin } from "@/components/portada-optin";

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
        aria-label={`${producto.nombre}, ${formatoPrecioCup(producto.precioCup)}`}
      >
        <PortadaOptin
          temaId="generica"
          hue={producto.hue ?? 225}
          nombre={producto.nombre}
          fotoUrl={fotoUrl}
          className="aspect-[4/3] rounded-lg"
        />
      </Link>
      <button
        type="button"
        aria-label={`Guardar ${producto.nombre} en favoritos`}
        className="absolute right-3 top-3 inline-flex size-10 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-sm backdrop-blur-md transition-all hover:scale-110 hover:text-primary active:scale-95"
      >
        <Heart className="size-5" aria-hidden="true" />
      </button>
      <div className="flex flex-col gap-2 p-4">
        <h3 className="truncate font-semibold text-lg leading-snug">
          <Link href={`/producto?slug=${producto.slug}`} className="hover:underline underline-offset-4">
            {producto.nombre}
          </Link>
        </h3>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold leading-none text-primary">
            {formatoPrecioCup(producto.precioCup)}
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
