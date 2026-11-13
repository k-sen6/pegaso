"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MapPin, ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { VerificacionBadge } from "@/components/coop-card";
import { BotonWhatsApp } from "@/components/boton-whatsapp";
import { useCatalogoVivo } from "@/lib/catalogo";
import { enlaceMapa, formatearTelefono, mensajeTienda } from "@/lib/whatsapp";

export default function VendedorClient() {
  const [slug, setSlug] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSlug(params.get("slug") ?? "");
  }, []);

  const { productos, cooperativas, fotosPorProducto, vivo } = useCatalogoVivo();
  const cooperativa = useMemo(
    () => Array.from(cooperativas.values()).find((v) => v.slug === slug) ?? null,
    [cooperativas, slug]
  );
  const productosVendedor = useMemo(
    () =>
      cooperativa
        ? productos
            .filter((p) => p.vendedor_id === cooperativa.id)
            .sort((a, b) => Number(b.destacado) - Number(a.destacado))
        : [],
    [productos, cooperativa]
  );

  if (!slug) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-center">
        <p className="text-muted-foreground">Vendedor no especificado.</p>
      </div>
    );
  }

  if (!cooperativa) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-center">
        <p className="text-muted-foreground">
          {vivo ? "Este vendedor no está disponible." : "Cargando vendedor…"}
        </p>
      </div>
    );
  }

  const c = cooperativa;
  const mapa = enlaceMapa({
    direccion: c.direccion,
    municipio: c.municipio,
    provincia: c.provincia,
    lat: c.lat,
    lng: c.lng,
  });
  const tieneProductos = productosVendedor.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-14">
      {/* Cabecera del vendedor */}
      <div
        className="mt-6 rounded-2xl border p-6"
        style={{
          background:
            "radial-gradient(24rem 12rem at 85% -30%, oklch(0.75 0.10 230 / 0.16), transparent 70%)",
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight">{c.nombre}</h1>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" aria-hidden="true" />
                {c.sector.charAt(0).toUpperCase() + c.sector.slice(1)} ·{" "}
                {c.municipio}, {c.provincia}
              </span>
              {c.telefono && (
                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="size-3.5" aria-hidden="true" />
                  {formatearTelefono(c.telefono)}
                </span>
              )}
            </p>
            {c.direccion && (
              <p className="mt-1 text-sm text-muted-foreground">
                Recogida: {c.direccion}
              </p>
            )}
            {mapa && (
              <a
                href={mapa}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                <MapPin className="size-3.5" aria-hidden="true" />
                Ver ubicación en el mapa
              </a>
            )}
          </div>
          <div className="flex items-center gap-2">
            <VerificacionBadge verificacion={c.verificacion} />
          </div>
        </div>
        <p className="mt-3 max-w-2xl text-pretty text-muted-foreground">
          {c.descripcion}
        </p>
      </div>

      {/* Productos del vendedor */}
      {tieneProductos && (
        <section aria-labelledby="productos-vendedor" className="mt-10">
          <div className="flex items-baseline justify-between gap-2">
            <h2 id="productos-vendedor" className="text-xl font-semibold tracking-tight">
              Productos de {c.nombre} ({productosVendedor.length})
            </h2>
            <Link
              href="/productos"
              className="text-sm font-medium text-primary hover:underline underline-offset-4"
            >
              Ver todo el catálogo <ArrowRight className="size-4 ml-1" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {productosVendedor.map((p) => (
              <ProductCard
                key={p.id}
                producto={p}
                cooperativa={c}
                fotoUrl={fotosPorProducto.get(p.id)?.thumb ?? null}
              />
            ))}
          </div>
        </section>
      )}

      {/* CTA contacto directo (sin auth) */}
      <section className="mt-10 rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-lg font-semibold tracking-tight">Contactar directamente</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sin cuentas ni comisiones: acuerda con{c.nombre ?? "el vendedor"} y paga al recoger.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <BotonWhatsApp
            telefono={c.telefono}
            mensaje={mensajeTienda({
              vendedor: c.nombre,
              url: typeof window !== "undefined" ? window.location.href : "",
              direccion: c.direccion,
              mapa,
            })}
          />
          {mapa ? (
            <Button asChild variant="outline" size="lg" className="h-11 px-6">
              <a href={mapa} target="_blank" rel="noopener noreferrer">
                <MapPin className="size-4 mr-2" aria-hidden="true" />
                Cómo llegar
              </a>
            </Button>
          ) : (
            <Button asChild variant="outline" size="lg" className="h-11 px-6">
              <Link href="/productos">Ver otros productos</Link>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
