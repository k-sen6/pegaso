import Link from "next/link";
import { BadgeCheck, MapPin, Heart } from "lucide-react";
import type { Producto, Cooperativa } from "@/lib/mock";
import { formatoPrecioCup } from "@/lib/precio";
import { cn } from "cn";
import { PortadaOptin } from "@/components/portada-optin";
import { TEMA_DE_PRODUCTO, TEMA_DE_SLUG } from "@/lib/mock/temas";

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
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg",
        className
      )}
    >
      <Link
        href={`/productos/${producto.slug}`}
        className="focus-visible:outline-none"
        aria-label={`${producto.nombre}, ${formatoPrecioCup(producto.precioCup)}`}
      >
        <PortadaOptin
          temaId={TEMA_DE_PRODUCTO[producto.id] ?? TEMA_DE_SLUG[producto.slug] ?? "generica"}
          hue={producto.hue ?? 225}
          nombre={producto.nombre}
          className="aspect-[4/3] rounded-lg"
        />
      </Link>
      <button
        type="button"
        aria-label={`Guardar ${producto.nombre} en favoritos`}
        className="absolute right-2.5 top-2.5 inline-flex size-8 items-center justify-center rounded-full bg-background/85 text-muted-foreground shadow-sm backdrop-blur transition-all hover:scale-105 hover:text-primary active:scale-95"
      >
        <Heart className="size-4" aria-hidden="true" />
      </button>
      <div className="flex flex-col gap-1.5 p-3.5">
        <h3 className="truncate font-medium leading-snug">
          <Link href={`/productos/${producto.slug}`} className="hover:underline underline-offset-4">
            {producto.nombre}
          </Link>
        </h3>
        <p className="text-lg font-semibold leading-none text-primary">
          {formatoPrecioCup(producto.precioCup)}
        </p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3 shrink-0" aria-hidden="true" />
          <span className="truncate">
            {cooperativa.nombre} · {cooperativa.provincia}
          </span>
          {verificado && <BadgeCheck className="ml-auto size-3.5 shrink-0 text-success" aria-label="Vendedor verificado" />}
        </p>
      </div>
    </article>
  );
}
