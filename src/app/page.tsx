"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GraduationCap, ShoppingBag, PiggyBank, ArrowRight, BadgeCheck, MapPin, Truck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { CoopCard, VerificacionBadge } from "@/components/coop-card";
import { PremiumCard } from "@/components/ui/premium-card";
import { useCatalogoVivo } from "@/lib/catalogo";
import type { Cooperativa, Producto } from "@/lib/mock/types";
import { cn } from "cn";

const MODULOS = [
  {
    href: "/formacion",
    icono: GraduationCap,
    titulo: "Formación",
    txt: "Cursos para crear y formalizar tu negocio, con guías descargables para trabajar sin red.",
  },
  {
    href: "/productos",
    icono: ShoppingBag,
    titulo: "Marketplace",
    txt: "Publica tu vitrina, gestiona pedidos y cobra con reservas claras, incluso sin señal.",
  },
  {
    href: "/financiamiento",
    icono: PiggyBank,
    titulo: "Financiamiento",
    txt: "Concurso al programa NAE: hasta 40 000 USD para tu iniciativa, sin intermediarios.",
  },
] as const;

const BENEFICIOS = [
  { icono: Truck, texto: "Entrega coordinada con el vendedor" },
  { icono: ShieldCheck, texto: "Pago directo, sin intermediarios" },
  { icono: BadgeCheck, texto: "Vendedores verificados por personas reales" },
] as const;

export default function Home() {
  const { productos, cooperativas, fotosPorProducto, vivo } = useCatalogoVivo();

  const destacadas = useMemoDestacadas(productos, vivo);
  const verificadas = useMemoVerificadas(cooperativas);

  if (!vivo) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center">
        <div className="animate-pulse rounded-xl bg-muted h-96 flex items-center justify-center">
          <div className="h-24 w-24 rounded-full bg-muted/50 mx-auto" />
        </div>
        <p className="mt-4 text-muted-foreground">Cargando catálogo…</p>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-sky-mesh">
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:py-28 lg:py-32">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-semibold text-success uppercase tracking-wider">
            <BadgeCheck className="size-3" aria-hidden="true" />
            Vendedores verificados por personas reales
          </span>
          <h1 className="mx-auto mt-6 max-w-2xl text-4xl font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Vende sin límites.{" "}
            <span className="text-primary">
              Crece sin fronteras.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl lg:text-2xl">
            Pegaso conecta vendedores con compradores nacionales y
            financiamiento internacional. Funciona aunque la señal se vaya:
            tus cambios se sincronizan cuando vuelva.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="btn-premium h-[56px] px-8 text-lg">
              <Link href="/registro" className="flex items-center gap-2">
                Crear mi cuenta <ArrowRight className="size-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="btn-premium outline h-[56px] px-8 text-lg">
              <Link href="/productos">
                Ver productos
              </Link>
            </Button>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {[
              [cooperativas.size, "vendedores activos"],
              [productos.length, "productos en catálogo"],
              [15, "cursos gratuitos"],
              ["40 000 USD", "hasta en financiamiento NAE"],
            ].map(([n, t], i) => (
              <div key={i} className="flex items-baseline gap-2 text-left">
                <dt className="sr-only">{t}</dt>
                <dd className="text-3xl font-bold text-primary">{n}</dd>
                <dd className="text-sm text-muted-foreground">{t}</dd>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Por qué Pegaso</p>
          <h2 className="text-3xl font-bold tracking-tight">Más que un catálogo</h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {BENEFICIOS.map((b, i) => (
            <PremiumCard key={i} padding="p-6">
              <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <b.icono className="size-6" aria-hidden="true" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{b.texto}</p>
            </PremiumCard>
          ))}
        </div>
      </section>

      {/* Tres módulos */}
      <section className="mx-auto max-w-6xl px-4 py-16 border-t" aria-labelledby="modulos">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Plataforma</p>
          <h2 id="modulos" className="text-3xl font-bold tracking-tight">Tres módulos, un solo lugar</h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {MODULOS.map(({ href, icono: Icono, titulo, txt }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative rounded-2xl border bg-card p-7 shadow-card transition-all duration-300 hover:-translate-y-2 hover:border-primary/50 hover:shadow-premium",
              )}
            >
              <span className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span
                className="flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary ring-1 ring-primary/20 mb-5"
              >
                <Icono className="size-6" aria-hidden="true" />
              </span>
              <h3 className="font-semibold text-lg">{titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{txt}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Entrar <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Productos destacados */}
      <section className="mx-auto max-w-6xl px-4 py-16 border-t" aria-labelledby="destacados">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Catálogo</p>
            <h2 id="destacados" className="mt-1 text-3xl font-bold tracking-tight">Productos destacados</h2>
          </div>
          <Link href="/productos" className="text-sm font-medium text-primary hover:underline underline-offset-4">
            Ver todo
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {destacadas.map((producto) => {
            const coop = cooperativas.get(producto.cooperativaId);
            return (
              <ProductCard
                key={producto.id}
                producto={producto}
                cooperativa={coop ?? null}
                fotoUrl={fotosPorProducto.get(producto.id) ?? null}
              />
            );
          })}
        </div>
      </section>

      {/* Vendedores verificados */}
      <section className="mx-auto max-w-6xl px-4 py-16 border-t" aria-labelledby="coops">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Directorio</p>
            <h2 id="coops" className="mt-1 text-3xl font-bold tracking-tight">Vendedores verificados</h2>
          </div>
          <Link href="/cooperativas" className="text-sm font-medium text-primary hover:underline underline-offset-4">
            Ver directorio
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {verificadas.map((cooperativa) => (
            <CoopCard key={cooperativa.id} cooperativa={cooperativa} />
          ))}
        </div>
      </section>

      {/* CTA registro */}
      <section className="border-t bg-sky-mesh">
        <div className="mx-auto max-w-6xl px-4 py-16 relative overflow-hidden">
          <div className="relative overflow-hidden rounded-2xl border p-8 md:p-12 text-center">
            <div className="relative flex flex-col items-center gap-4">
              <VerificacionBadge verificacion="verificado" className="mb-2" />
              <h2 className="text-3xl font-bold tracking-tight max-w-lg">
                ¿Tienes un negocio o quieres comprar con confianza?
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base lg:text-lg">
                Publica tus productos, gestiona tus pedidos y solicita financiamiento NAE en un solo panel.
              </p>
              <Button asChild size="lg" className="btn-premium mt-6 h-[56px] px-8 text-lg">
                <Link href="/registro" className="flex items-center gap-2">
                  Registrar mi negocio <ArrowRight className="size-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function useMemoDestacadas(productos: Producto[], vivo: boolean) {
  if (!vivo) return [];
  return productos.filter((p) => p.destacado).slice(0, 8);
}

function useMemoVerificadas(cooperativas: Map<string, Cooperativa>) {
  return Array.from(cooperativas.values()).filter((c) => c.verificacion === "verificado").slice(0, 4);
}
