"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Producto, Cooperativa, Sector, EstadoVerificacion } from "@/lib/catalogo";
import {
  BadgeCheck,
  ChevronLeft,
  MapPin,
  Truck,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FotoFicha } from "@/components/foto-ficha";
import { BotonesReservar } from "@/components/botones-reservar";
import { VerificacionBadge } from "@/components/coop-card";

import { formatoPrecioCup } from "@/lib/precio";

interface FichaEstado {
  producto: Producto | null;
  cooperativa: Cooperativa | null;
  vivo: boolean;
}

export default function FichaProducto() {
  const [slug, setSlug] = useState("");
  const [estado, setEstado] = useState<FichaEstado>({
    producto: null,
    cooperativa: null,
    vivo: false,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("slug") ?? "";
    setSlug(s);
    if (!s) return;
    let vivo = true;
    (async () => {
      try {
        const { supabase } = await import("@/lib/supabase");
        if (!supabase || !vivo) return;
        const { data: prod, error: errP } = await supabase
          .from("productos")
          .select("*")
          .eq("slug", s)
          .maybeSingle();
        if (errP || !prod || !vivo) return;
        const { data: ven, error: errV } = await supabase
          .from("vendedores")
          .select("*")
          .eq("id", prod.vendedor_id)
          .maybeSingle();
        if (!vivo) return;
setEstado({
          vivo: true,
          producto: {
            id: prod.id,
            slug: prod.slug,
            nombre: prod.nombre,
            descripcion: prod.descripcion,
            precio_cup: prod.precio_cup,
            sector: prod.sector as Sector,
            destacado: prod.destacado,
            hue: prod.hue ?? 225,
            vendedor_id: prod.vendedor_id,
            created_at: prod.created_at,
            emoji: "▦",
            cooperativaId: prod.vendedor_id,
          },
          cooperativa: ven
            ? {
                id: ven.id,
                slug: ven.slug,
                nombre: ven.nombre,
                sector: ven.sector as Sector,
                provincia: ven.provincia,
                municipio: ven.municipio,
                descripcion: ven.descripcion,
                verificacion: ven.verificacion as EstadoVerificacion,
                foto_url: ven.foto_url,
                created_at: ven.created_at,
              }
            : null,
        });
      } catch {
        // sin red: queda vacío (offline-first)
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);

  if (!slug) {
    return (
      <article className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-muted-foreground">Producto no especificado.</p>
      </article>
    );
  }

  if (!estado.producto) {
    return (
      <article className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-muted-foreground">Cargando producto…</p>
      </article>
    );
  }

  const p = estado.producto;
  const v = estado.cooperativa;
  const verificado = v?.verificacion === "verificado";

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
        <FotoFicha producto={p} />

        <div>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <BadgeCheck className="size-4 text-success" aria-hidden="true" />
            {p.sector.charAt(0).toUpperCase() + p.sector.slice(1)}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {p.nombre}
          </h1>
          <p className="mt-2 text-3xl font-bold tracking-tight text-primary">
            {formatoPrecioCup(p.precio_cup)}
          </p>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
            {p.descripcion}
          </p>

          <div className="mt-4 rounded-xl border bg-card p-4 text-sm shadow-[var(--shadow-card)]">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Vendido por
            </p>
            {v ? (
              <Link
                href={`/cooperativa?slug=${v.slug}`}
                className="mt-1 flex items-center gap-1.5 font-medium hover:text-primary"
              >
                <MapPin className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
                {v.nombre} · {v.provincia}
                <VerificacionBadge verificacion={v.verificacion} className="ml-auto" />
              </Link>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                Vendedor no disponible
              </p>
            )}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border p-3 flex items-center gap-2 bg-muted/40">
              <Truck className="size-4 text-primary shrink-0" aria-hidden="true" />
              <span className="text-sm text-muted-foreground">Entrega coordinada con el vendedor</span>
            </div>
            <div className="rounded-xl border p-3 flex items-center gap-2 bg-muted/40">
              <ShieldCheck className="size-4 text-success shrink-0" aria-hidden="true" />
              <span className="text-sm text-muted-foreground">Pago directo al vendedor</span>
              </div>
          </div>

          <div className="mt-6">
            <BotonesReservar producto={{ id: p.id, slug: p.slug, nombre: p.nombre, precioCup: p.precio_cup }} />
          </div>
        </div>
      </div>

      <section className="mt-10" aria-labelledby="relacionados">
        <h2 id="relacionados" className="text-lg font-semibold tracking-tight">
          También te puede interesar
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <p className="col-span-full text-sm text-muted-foreground">
            Más productos de {v?.nombre ?? "este vendedor"} en su directorio.
          </p>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <Link
          href={`/cooperativa?slug=${v?.slug ?? slug}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline underline-offset-4"
        >
          Ver todos los productos de{v?.nombre ? " " + v.nombre : " este vendedor"} <ArrowRight />
        </Link>
      </div>
    </article>
  );
}
