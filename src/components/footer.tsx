import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 sm:grid-cols-3 text-sm">
        <div>
          <p className="font-semibold">Pegaso</p>
          <p className="mt-2 text-muted-foreground">
            Plataforma que conecta cooperativas cubanas verificadas con compradores y
            oportunidades de financiamiento internacional.
          </p>
        </div>
        <nav aria-label="Enlaces del sitio" className="grid gap-2 content-start">
          <Link href="/productos" className="text-muted-foreground hover:text-foreground">Productos</Link>
          <Link href="/cooperativas" className="text-muted-foreground hover:text-foreground">Cooperativas</Link>
          <Link href="/formacion" className="text-muted-foreground hover:text-foreground">Formación</Link>
          <Link href="/financiamiento" className="text-muted-foreground hover:text-foreground">Financiamiento</Link>
        </nav>
        <div className="text-muted-foreground">
          <p className="font-semibold text-foreground">Marco legal</p>
          <p className="mt-2">
            Operamos bajo el Decreto-Ley 89/2024 de cooperativas no agropecuarias y el
            programa NAE (UE / PNUD / MEP).
          </p>
          <p className="mt-4">Contacto: hola@pegaso.cu</p>
          <p className="mt-4 text-xs">© 2026 Pegaso</p>
        </div>
      </div>
    </footer>
  );
}
