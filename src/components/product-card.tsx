import Link from "next/link";
import { BadgeCheck, MapPin, Heart } from "lucide-react";
import type { Producto, Cooperativa } from "@/lib/mock";
import { formatoPrecioCup } from "@/lib/precio";
import { cn } from "cn";
import { ImagenOptin } from "@/components/imagen-optin";

/** Portada determinista sin red: gradiente por hue del producto. */
function Portada({ producto, className }: { producto: Producto; className?: string }) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-lg",
        className
      )}
      style={{
        background: `linear-gradient(135deg, oklch(0.85 0.08 220), oklch(0.55 0.11 235))`,
      }}
    >
      <ImagenOptin alt={producto.nombre} />
      <span className="text-4xl select-none">{producto.emoji}</span>
    </div>
  );
}

export function ProductCard({
  producto,
  cooperativa,
  className,
}: {
  producto: Producto;
  cooperativa: Cooperativa;
  className?: string;
}) {
  const verificado = cooperativa.verificacion === "verificado";
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border bg-card shadow-[var(--shadow-card)]",
        className
      )}
    >
      <Link
        href={`/productos/${producto.slug}`}
        className="focus-visible:outline-none"
        aria-label={`${producto.nombre}, ${formatoPrecioCup(producto.precioCup)}`}
      >
        <Portada producto={producto} className="aspect-[4/3]" />
      </Link>
      <button
        type="button"
        aria-label={`Guardar ${producto.nombre} en favoritos`}
        className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-full bg-background/80 text-muted-foreground transition-colors hover:text-primary"
      >
        <Heart className="size-4" aria-hidden="true" />
      </button>
      <div className="flex flex-col gap-1 p-3">
        <h3 className="truncate font-medium leading-snug">
          <Link href={`/productos/${producto.slug}`} className="hover:underline">
            {producto.nombre}
          </Link>
        </h3>
        <p className="font-semibold text-primary">{formatoPrecioCup(producto.precioCup)}</p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3 shrink-0" aria-hidden="true" />
          <span className="truncate">
            {cooperativa.nombre} · {cooperativa.provincia}
          </span>
          {verificado && <BadgeCheck className="ml-auto size-3.5 shrink-0 text-success" aria-label="Cooperativa verificada" />}
        </p>
      </div>
    </article>
  );
}
