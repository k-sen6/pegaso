import Link from "next/link";
import { Package, ShieldCheck, BookOpen, Landmark } from "lucide-react";

/** Hash del build (lo inyecta el workflow de Pages; local = "dev"). */
const BUILD = (process.env.NEXT_PUBLIC_BUILD ?? "dev").slice(0, 7);

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 text-sm sm:grid-cols-4">
        <div className="sm:col-span-1">
          <p className="font-semibold tracking-tight text-foreground">Pegaso</p>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            Plataforma que conecta vendedores cubanos verificados con compradores y
            oportunidades de financiamiento internacional.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">© 2026 Pegaso · build {BUILD}</p>
        </div>
        <nav aria-label="Enlaces del sitio" className="grid gap-2.5 content-start">
          <p className="font-medium text-foreground">Sitio</p>
          {[
            { href: "/productos", label: "Productos", Icono: Package },
            { href: "/cooperativas", label: "Vendedores", Icono: ShieldCheck },
            { href: "/formacion", label: "Formación", Icono: BookOpen },
            { href: "/financiamiento", label: "Financiamiento", Icono: Landmark },
          ].map(({ href, label, Icono }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icono className="size-3.5 shrink-0" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="text-muted-foreground sm:col-span-2">
          <p className="font-medium text-foreground">Marco legal</p>
          <p className="mt-2 leading-relaxed">
            Operamos bajo el Decreto-Ley 89/2024 de cooperativas no agropecuarias y el
            programa NAE (UE / PNUD / MEP).
          </p>
          <p className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs">
            <span>Contacto: hola@pegaso.cu</span>
            <span>Soporte offline garantizado (PWA instalable)</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
