import { notFound } from "next/navigation";
import { MapPin, Clock } from "lucide-react";
import { COOPERATIVAS, PRODUCTOS } from "@/lib/mock";import { NOMBRE_SECTOR } from "@/lib/mock/types";
import { ProductCard } from "@/components/product-card";
import { VerificacionBadge } from "@/components/coop-card";

export function generateStaticParams() {
  return COOPERATIVAS.map((c) => ({ slug: c.slug }));
}

function cooperativaPorSlug(slug: string) {
  return COOPERATIVAS.find((c) => c.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const coop = cooperativaPorSlug(slug);
  if (!coop) return { title: "Vendedor" };
  return { title: coop.nombre, description: coop.descripcion ?? undefined };
}

export default async function PaginaVendedor({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const coop = cooperativaPorSlug(slug);
  if (!coop) notFound();

  const publicar = coop.verificacion === "verificado";
  const productos = publicar ? PRODUCTOS.filter((p) => p.cooperativaId === coop.id) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-14">
      <div
        className="mt-6 rounded-2xl border p-6"
        style={{
          background:
            "radial-gradient(24rem 12rem at 85% -30%, oklch(0.75 0.10 230 / 0.16), transparent 70%)",
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{coop.nombre}</h1>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" aria-hidden="true" />
                {NOMBRE_SECTOR[coop.sector]} · {coop.municipio}, {coop.provincia}
              </span>
            </p>
          </div>
          <VerificacionBadge verificacion={coop.verificacion} />
        </div>
        <p className="mt-3 max-w-2xl text-pretty text-muted-foreground">{coop.descripcion}</p>
        {coop.verificacion !== "verificado" && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-warning">
            <Clock className="size-3.5" aria-hidden="true" />
            Este vendedor aún no publica productos en el catálogo.
          </p>
        )}
      </div>

      {productos.length > 0 && (
        <section aria-labelledby="productos-vendedor" className="mt-8">
          <h2 id="productos-vendedor" className="text-xl font-semibold tracking-tight">
            Productos de {coop.nombre} ({productos.length})
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {productos.map((p) => (
              <ProductCard key={p.id} producto={p} cooperativa={coop} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
