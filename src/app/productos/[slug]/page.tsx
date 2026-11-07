import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, MapPin, ChevronLeft } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { VerificacionBadge } from "@/components/coop-card";
import { BotonesReservar } from "@/components/botones-reservar";
import { PortadaOptin } from "@/components/portada-optin";
import { TEMA_DE_PRODUCTO } from "@/lib/mock/temas";
import {
  PRODUCTOS,
  cooperativaPorId,
  productoPorSlug,
  relacionados,
} from "@/lib/mock";
import { NOMBRE_SECTOR } from "@/lib/mock/types";
import { formatoPrecioCup } from "@/lib/precio";

export function generateStaticParams() {
  return PRODUCTOS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const producto = productoPorSlug(slug);
  if (!producto) return { title: "Producto" };
  return { title: producto.nombre, description: producto.descripcion };
}

export default async function FichaProducto({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const producto = productoPorSlug(slug);
  if (!producto) notFound();

  const cooperativa = cooperativaPorId(producto.cooperativaId)!;
  const archivo = relacionados(producto);

  return (
    <article className="mx-auto max-w-3xl px-4 py-6">
      <Link
        href="/productos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        Productos
      </Link>

      <div className="mt-4 grid gap-6 sm:grid-cols-2">
        {/* Portada: foto real por defecto, placeholder en modo 2G */}
        <PortadaOptin
          temaId={TEMA_DE_PRODUCTO[producto.id] ?? "generica"}
          hue={producto.hue ?? 225}
          nombre={producto.nombre}
          priorizar
          className="aspect-[4/3] rounded-xl"
        />

        <div>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <BadgeCheck className="size-4 text-success" aria-hidden="true" />
            {NOMBRE_SECTOR[producto.sector]}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {producto.nombre}
          </h1>
          <p className="mt-2 text-2xl font-bold text-primary">
            {formatoPrecioCup(producto.precioCup)}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">{producto.descripcion}</p>

          <div className="mt-4 rounded-lg border bg-card p-3 text-sm">
            <p className="font-medium">Vendido por</p>
            <Link
              href={`/cooperativas/${cooperativa.slug}`}
              className="mt-0.5 flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              {cooperativa.nombre} · {cooperativa.provincia}
              <VerificacionBadge verificacion={cooperativa.verificacion} className="ml-auto" />
            </Link>
          </div>

          <div className="mt-5">
            <BotonesReservar producto={producto} />
          </div>
        </div>
      </div>

      {archivo.length > 0 && (
        <section className="mt-10" aria-labelledby="relacionados">
          <h2 id="relacionados" className="text-lg font-semibold tracking-tight">
            También te puede interesar
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {archivo.map((p) => (
              <ProductCard
                key={p.id}
                producto={p}
                cooperativa={cooperativaPorId(p.cooperativaId)!}
              />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
