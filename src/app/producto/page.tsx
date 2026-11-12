"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type {
  Producto,
  Cooperativa,
  Sector,
  EstadoVerificacion,
} from "@/lib/catalogo";
import {
  BadgeCheck,
  ChevronLeft,
  MapPin,
  Truck,
  ShieldCheck,
  ArrowRight,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FotoFicha } from "@/components/foto-ficha";
import { BotonWhatsApp } from "@/components/boton-whatsapp";
import { ProductCard } from "@/components/product-card";
import { VerificacionBadge } from "@/components/coop-card";
import { formatoPrecioCup } from "@/lib/precio";
import { enlaceMapa, mensajeProducto, formatearTelefono } from "@/lib/whatsapp";

interface FichaEstado {
  producto: Producto | null;
  cooperativa: Cooperativa | null;
  relacionados: Producto[];
  fotos: Map<string, string>;
  vivo: boolean;
}

export default function FichaProducto() {
  const [slug, setSlug] = useState("");
  const [urlProducto, setUrlProducto] = useState("");
  const [estado, setEstado] = useState<FichaEstado>({
    producto: null,
    cooperativa: null,
    relacionados: [],
    fotos: new Map(),
    vivo: false,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("slug") ?? "";
    setSlug(s);
    setUrlProducto(window.location.href);
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
        const { data: ven } = await supabase
          .from("vendedores")
          .select("*")
          .eq("id", prod.vendedor_id)
          .maybeSingle();
        if (!vivo) return;

        let relacionados: Producto[] = [];
        if (prod.vendedor_id) {
          const { data: rel } = await supabase
            .from("productos")
            .select("*")
            .eq("vendedor_id", prod.vendedor_id)
            .neq("id", prod.id)
            .order("destacado", { ascending: false })
            .limit(4);
          relacionados = (rel ?? []).map((r) => ({
            id: r.id,
            slug: r.slug,
            nombre: r.nombre,
            descripcion: r.descripcion,
            precio_cup: r.precio_cup,
            sector: r.sector as Sector,
            destacado: r.destacado,
            hue: r.hue ?? 225,
            vendedor_id: r.vendedor_id,
            created_at: r.created_at,
          }));
        }

        const mapaFotos = new Map<string, string>();
        const ids = relacionados.map((r) => r.id);
        if (ids.length > 0) {
          const { data: fotosData } = await supabase
            .from("fotos")
            .select("producto_id, url, created_at")
            .eq("estado", "sincronizada")
            .in("producto_id", ids)
            .order("created_at", { ascending: false });
          for (const f of fotosData ?? []) {
            if (f.producto_id && f.url && !mapaFotos.has(f.producto_id)) {
              mapaFotos.set(f.producto_id, f.url);
            }
          }
        }

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
                telefono: ven.telefono ?? null,
                direccion: ven.direccion ?? null,
                lat: ven.lat ?? null,
                lng: ven.lng ?? null,
                created_at: ven.created_at,
              }
            : null,
          relacionados,
          fotos: mapaFotos,
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
  const mapa = v
    ? enlaceMapa({
        direccion: v.direccion,
        municipio: v.municipio,
        provincia: v.provincia,
        lat: v.lat,
        lng: v.lng,
      })
    : null;
  const mensaje = mensajeProducto({
    vendedor: v?.nombre,
    producto: p.nombre,
    precioCup: p.precio_cup,
    url: urlProducto,
    direccion: v?.direccion,
    mapa,
  });

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
              <>
                <Link
                  href={`/vendedor?slug=${v.slug}`}
                  className="mt-1 flex items-center gap-1.5 font-medium hover:text-primary"
                >
                  <MapPin
                    className="size-3.5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  {v.nombre} · {v.municipio}, {v.provincia}
                  <VerificacionBadge
                    verificacion={v.verificacion}
                    className="ml-auto"
                  />
                </Link>
                {v.direccion && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Recogida: {v.direccion}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                  {mapa && (
                    <a
                      href={mapa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                    >
                      <MapPin className="size-3.5" aria-hidden="true" />
                      Ver en el mapa
                    </a>
                  )}
                  {v.telefono && (
                    <span className="text-muted-foreground">
                      WhatsApp: {formatearTelefono(v.telefono)}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                Vendedor no disponible
              </p>
            )}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border p-3 flex items-center gap-2 bg-muted/40">
              <Truck className="size-4 text-primary shrink-0" aria-hidden="true" />
              <span className="text-sm text-muted-foreground">
                Entrega coordinada con el vendedor
              </span>
            </div>
            <div className="rounded-xl border p-3 flex items-center gap-2 bg-muted/40">
              <ShieldCheck
                className="size-4 text-success shrink-0"
                aria-hidden="true"
              />
              <span className="text-sm text-muted-foreground">
                Pago directo al vendedor
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-2">
            <BotonWhatsApp telefono={v?.telefono} mensaje={mensaje} />
            <Button asChild variant="outline" className="h-11 px-6">
              <Link href={`/vendedor?slug=${v?.slug ?? slug}`}>
                <Store className="size-4 mr-2" aria-hidden="true" />
                Ver tienda y ubicación
              </Link>
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Sin comisiones: acuerdas precio y entrega directo con el vendedor.
          </p>
        </div>
      </div>

      {estado.relacionados.length > 0 && (
        <section className="mt-10" aria-labelledby="relacionados">
          <h2
            id="relacionados"
            className="text-lg font-semibold tracking-tight"
          >
            Más de {v?.nombre ?? "este vendedor"}
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {estado.relacionados.map((r) => (
              <ProductCard
                key={r.id}
                producto={r}
                cooperativa={v}
                fotoUrl={estado.fotos.get(r.id) ?? null}
              />
            ))}
          </div>
        </section>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <Link
          href={`/vendedor?slug=${v?.slug ?? slug}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline underline-offset-4"
        >
          Ver todos los productos de
          {v?.nombre ? " " + v.nombre : " este vendedor"}{" "}
          <ArrowRight />
        </Link>
      </div>
    </article>
  );
}
