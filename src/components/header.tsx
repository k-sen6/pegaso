import Link from "next/link";
import { CircleUserRound } from "lucide-react";
import { Logo } from "@/components/logo";
import { ConnectionIndicator } from "@/components/connection-indicator";
import { ToggleTema } from "@/components/toggle-tema";
import { ToggleImagenes } from "@/components/toggle-imagenes";

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Productos" },
  { href: "/cooperativas", label: "Vendedores" },
  { href: "/formacion", label: "Formación" },
  { href: "/financiamiento", label: "Financiamiento" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="shrink-0" aria-label="Pegaso, inicio">
          <Logo />
        </Link>
        <nav aria-label="Navegación principal" className="hidden md:flex md:items-center md:gap-1 md:text-sm">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ConnectionIndicator className="hidden sm:inline-flex text-muted-foreground" />
          <ToggleImagenes />
          <ToggleTema />
          <Link
            href="/mi-cuenta"
            aria-label="Mi cuenta"
            className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <CircleUserRound className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}
