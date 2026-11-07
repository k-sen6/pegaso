"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MapPin, Clock, Truck, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { VerificacionBadge } from "@/components/coop-card";
import type { Cooperativa, Producto, Sector, EstadoVerificacion } from "@/lib/mock/types";

interface VendedorEstado {
  cooperativa: Cooperativa | null;
  productos: Producto[];
  vivo: boolean;
}

export default function VendedorClient({
  slug,
}: {
  slug: string;
}) {
  const [estado, setEstado] = useState<VendedorEstado>({
    cooperativa: null,
    productos: [],
    vivo: false,
  });

  useEffect(() => {
    if (!slug) return;
    let vivo = true;
    (async () => {
      try {
        const { supabase } = await import("@/lib/supabase");
        if (!supabase || !vivo) return;
        const { data: ven, error: errV } = await supabase
          .from("vendedores")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();
        if (errV || !ven || !vivo) return;
        const { data: prods, error: errP } = await supabase
          .from("productos")
          .select("*")
          .eq("vendedor_id", ven.id)
          .order("destacado", { ascending: false });
        if (!vivo) return;
        setEstado({
          cooperativa: {
            id: ven.id,
            slug: ven.slug,
            nombre: ven.nombre,
            sector: ven.sector as Sector,
            provincia: ven.provincia,
            municipio: ven.municipio,
            descripcion: ven.descripcion,
            verificacion: ven.verificacion as EstadoVerificacion,
            nivel: "basico",
            productosCount: (prods ?? []).length,
          },
          productos: (prods ?? []).map((p) => ({
            id: p.id,
            slug: p.slug,
            nombre: p.nombre,
            descripcion: p.descripcion,
            precioCup: p.precio_cup,
            sector: p.sector as Sector,
            destacado: p.destacado,
            emoji: "▦",
            hue: p.hue ?? 225,
            cooperativaId: ven.id,
          })),
          vivo: true,
        });
      } catch {
        // sin red: queda vacío
      }
    })();
    return () => {
      vivo = false;
    };
  }, [slug]);

  if (!estado.cooperativa) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-center">
        <p className="text-muted-foreground">Cargando vendedor…</p>
      </div>
    );
  }

  const c = estado.cooperativa;
  const verificado = c.verificacion === "verificado";
  const tieneProductos = estado.productos.length > 0;

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
            </p>
          </div>
          <div className="flex items-center gap-2">
            <VerificacionBadge verificacion={c.verificacion} />
            {verificado && (
              <span className="inline-flex items-center gap-1 rounded-full border border-success/40 bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                <ShieldCheck className="size-3 shrink-0" aria-hidden="true" />
                Verificado
              </span>
            )}
          </div>
        </div>
        <p className="mt-3 max-w-2xl text-pretty text-muted-foreground">
          {c.descripcion}
        </p>
      </div>

      {c.verificacion !== "verificado" && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-warning">
          <Clock className="size-3.5" aria-hidden="true" />
          Este vendedor aún no está verificado para publicar productos.
        </p>
      )}

      {/* Productos del vendedor */}
      {tieneProductos && (
        <section aria-labelledby="productos-vendedor" className="mt-10">
          <div className="flex items-baseline justify-between gap-2">
            <h2 id="productos-vendedor" className="text-xl font-semibold tracking-tight">
              Productos de {c.nombre} ({estado.productos.length})
            </h2>
            <Link
              href="/productos"
              className="text-sm font-medium text-primary hover:underline underline-offset-4"
            >
              Ver todo el catálogo <ArrowRight className="size-4 ml-1" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {estado.productos.map((p) => (
              <ProductCard
                key={p.id}
                producto={p}
                cooperativa={c}
                fotoUrl={null}
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
          <Button asChild size="lg" className="h-11 px-6">
            <Link href={`https://wa.me/?text=Hola ${c.nombre}, vi tu producto en Pegaso y me interesa.`}>
              <Truck className="size-4" aria-hidden="true" />
              Escríbelo por WhatsApp
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-11 px-6">
            <Link href="/productos">
              Ver otros productos
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
