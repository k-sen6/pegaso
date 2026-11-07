import Link from "next/link";
import { GraduationCap, ShoppingBag, PiggyBank, ArrowRight, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { CoopCard, VerificacionBadge } from "@/components/coop-card";
import {
  COOPERATIVAS,
  PRODUCTOS_DESTACADOS,
  cooperativaPorId,
} from "@/lib/mock";

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

const COMO_FUNCIONA = [
  {
    n: "01",
    titulo: "Explora y reserva",
    txt: "Busca entre productos reales, filtra por sector o provincia y reserva en 1 toque, con o sin señal.",
  },
  {
    n: "02",
    titulo: "Paga al recoger",
    txt: "Efectivo o transferencia, directo al vendedor. Sin intermediarios: tu compra llega íntegra al negocio local.",
  },
  {
    n: "03",
    titulo: "Todo sincroniza solo",
    txt: "Pegaso es offline-first: tus reservas y pedidos se guardan y sincronizan con el vendedor cuando vuelva la red.",
  },
] as const;

export default function Home() {
  const verificadas = COOPERATIVAS.filter((c) => c.verificacion === "verificado");

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        {/* Malla de gradiente azul cielo, 0 bytes de red */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(48rem 24rem at 15% -10%, oklch(0.75 0.10 230 / 0.14), transparent 62%), radial-gradient(40rem 22rem at 92% 8%, oklch(0.62 0.14 250 / 0.16), transparent 60%), radial-gradient(30rem 18rem at 62% 108%, oklch(0.80 0.09 210 / 0.10), transparent 58%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-3 py-1 text-xs font-medium text-success">
            <BadgeCheck className="size-3.5" aria-hidden="true" />
            Vendedores verificados por personas reales
          </p>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl sm:leading-[1.08]">
            Tu vendedor,{" "}
            <span
              className="bg-gradient-to-r from-primary to-[oklch(0.62_0.16_250)] bg-clip-text text-transparent"
            >
              listo para vender y crecer
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground sm:text-lg">
            Pegaso conecta vendedores cubanos con compradores nacionales y
            financiamiento internacional. Funciona aunque la señal se vaya:
            tus cambios se sincronizan cuando vuelva.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="h-11 px-6 shadow-primary/25">
              <Link href="/registro" className="gap-1.5">
                Crear mi cuenta <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 px-6">
              <Link href="/productos">
                Ver productos
              </Link>
            </Button>
          </div>
          <dl className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm sm:gap-x-12">
            {[
              ["8", "vendedores activos"],
              ["38", "productos en catálogo"],
              ["15", "cursos gratuitos"],
            ].map(([n, t]) => (
              <div key={t} className="flex items-baseline gap-2">
                <dt className="sr-only">{t}</dt>
                <dd className="text-2xl font-semibold tracking-tight text-primary">{n}</dd>
                <dd className="text-muted-foreground">{t}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Tres módulos */}
      <section className="mx-auto max-w-6xl px-4 py-14" aria-labelledby="modulos">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Plataforma</p>
        <h2 id="modulos" className="mt-1 text-2xl font-semibold tracking-tight">Tres módulos, un solo lugar</h2>
        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          {MODULOS.map(({ href, icono: Icono, titulo, txt }) => (
            <Link
              key={href}
              href={href}
              className="group relative rounded-xl border bg-card p-6 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              />
              <span className="flex size-11 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 text-primary ring-1 ring-primary/20">
                <Icono className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-semibold">{titulo}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{txt}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Entrar <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Productos destacados */}
      <section className="mx-auto max-w-6xl px-4 pb-6" aria-labelledby="destacados">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Catálogo</p>
            <h2 id="destacados" className="mt-1 text-2xl font-semibold tracking-tight">Productos destacados</h2>
          </div>
          <Link href="/productos" className="text-sm font-medium text-primary hover:underline underline-offset-4">
            Ver todo
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {PRODUCTOS_DESTACADOS.map((producto) => {
            const coop = cooperativaPorId(producto.cooperativaId)!;
            return <ProductCard key={producto.id} producto={producto} cooperativa={coop} />;
          })}
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="mx-auto max-w-6xl px-4 py-10" aria-labelledby="como">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Simple</p>
        <h2 id="como" className="mt-1 text-2xl font-semibold tracking-tight">Cómo funciona</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {COMO_FUNCIONA.map((paso) => (
            <li
              key={paso.n}
              className="rounded-xl border bg-card p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40"
            >
              <span className="font-mono text-xs font-semibold tracking-widest text-primary">{paso.n}</span>
              <h3 className="mt-2 font-semibold">{paso.titulo}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{paso.txt}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Vendedores verificados */}
      <section className="mx-auto max-w-6xl px-4 pb-14" aria-labelledby="coops">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Directorio</p>
            <h2 id="coops" className="mt-1 text-2xl font-semibold tracking-tight">Vendedores verificados</h2>
          </div>
          <Link href="/cooperativas" className="text-sm font-medium text-primary hover:underline underline-offset-4">
            Ver directorio
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {verificadas.slice(0, 4).map((cooperativa) => (
            <CoopCard key={cooperativa.id} cooperativa={cooperativa} />
          ))}
        </div>
      </section>

      {/* CTA registro */}
      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-2">
          <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 text-center sm:p-12">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(32rem 16rem at 8% 0%, oklch(0.75 0.10 230 / 0.18), transparent 65%)",
              }}
            />
            <div className="relative flex flex-col items-center gap-4">
              <VerificacionBadge verificacion="verificado" />
              <h2 className="text-2xl font-semibold tracking-tight max-w-lg text-balance">
                ¿Vendes o quieres comprar con confianza?
              </h2>
              <p className="max-w-md text-pretty text-sm text-muted-foreground sm:text-base">
                Publica tus productos, gestiona tus pedidos y solicita financiamiento NAE en un solo panel.
              </p>
              <Button asChild size="lg" className="h-11 px-6">
                <Link href="/registro" className="gap-1.5">
                  Registrar mi negocio <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
