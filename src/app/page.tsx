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
    txt: "Cursos para crear y formalizar tu cooperativa, con guías descargables para trabajar sin red.",
  },
  {
    href: "/productos",
    icono: ShoppingBag,
    titulo: "Marketplace",
    txt: "Vende y reserva productos de cooperativas verificadas, con vales QR para cobros claros.",
  },
  {
    href: "/financiamiento",
    icono: PiggyBank,
    titulo: "Financiamiento",
    txt: "Concurso al programa NAE: hasta 40 000 USD para tu iniciativa, sin intermediarios.",
  },
] as const;

export default function Home() {
  const verificadas = COOPERATIVAS.filter((c) => c.verificacion === "verificado");

  return (
    <>
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-transparent">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:py-20">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-3 py-1 text-xs font-medium text-success">
            <BadgeCheck className="size-3.5" aria-hidden="true" />
            Cooperativas verificadas por personas reales
          </p>
          <h1 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
           Tu cooperativa, lista para vender y crecer
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground text-balance">
            Pegaso conecta cooperativas cubanas con compradores nacionales y
            financiamiento internacional. Funciona aunque la señal se vaya:
            tus cambios se sincronizan cuando vuelva.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/registro" className="h-9 gap-1.5 px-4">
                Crear mi cuenta <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/productos" className="h-9 gap-1.5 px-4">
                Ver productos
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Tres módulos */}
      <section className="mx-auto max-w-6xl px-4 py-12" aria-labelledby="modulos">
        <h2 id="modulos" className="text-xl font-semibold tracking-tight">Tres módulos, un solo lugar</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {MODULOS.map(({ href, icono: Icono, titulo, txt }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-lg border bg-card p-5 shadow-[var(--shadow-card)] transition-colors hover:border-primary/50"
            >
              <span className="flex size-9 items-center justify-center rounded-md bg-primary/15 text-primary">
                <Icono className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-3 font-medium">{titulo}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{txt}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Entrar <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Productos destacados */}
      <section className="mx-auto max-w-6xl px-4 py-6" aria-labelledby="destacados">
        <div className="flex items-baseline justify-between gap-2">
          <h2 id="destacados" className="text-xl font-semibold tracking-tight">Productos destacados</h2>
          <Link href="/productos" className="text-sm font-medium text-primary hover:underline">
            Ver todo
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {PRODUCTOS_DESTACADOS.map((producto) => {
            const coop = cooperativaPorId(producto.cooperativaId)!;
            return <ProductCard key={producto.id} producto={producto} cooperativa={coop} />;
          })}
        </div>
      </section>

      {/* Cooperativas verificadas */}
      <section className="mx-auto max-w-6xl px-4 py-12" aria-labelledby="coops">
        <div className="flex items-baseline justify-between gap-2">
          <h2 id="coops" className="text-xl font-semibold tracking-tight">Cooperativas verificadas</h2>
          <Link href="/cooperativas" className="text-sm font-medium text-primary hover:underline">
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
      <section className="border-t bg-primary/5">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-12 text-center">
          <h2 className="text-xl font-semibold tracking-tight max-w-lg text-balance">
            ¿Tienes una cooperativa o quieres comprar con confianza?
          </h2>
          <VerificacionBadge verificacion="verificado" />
          <p className="max-w-md text-sm text-muted-foreground">
            Publica tus productos, gestiona tus pedidos y solicita financiamiento NAE en un solo panel.
          </p>
          <Button asChild>
            <Link href="/registro">Registrar mi cooperativa</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
