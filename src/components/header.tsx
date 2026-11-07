"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CircleUserRound, Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { ConnectionIndicator } from "@/components/connection-indicator";
import { ToggleTema } from "@/components/toggle-tema";
import { ToggleImagenes } from "@/components/toggle-imagenes";
import { cn } from "cn";

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Productos" },
  { href: "/cooperativas", label: "Vendedores" },
  { href: "/formacion", label: "Formación" },
  { href: "/financiamiento", label: "Financiamiento" },
];

export function Header() {
  const pathname = usePathname() ?? "/";
  const [abierto, setAbierto] = useState(false);

  const activa = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="shrink-0" aria-label="Pegaso, inicio">
          <Logo />
        </Link>

        <nav
          aria-label="Navegación principal"
          className={cn(
            "hidden md:flex md:items-center md:gap-1 md:text-sm",
            abierto && "flex flex-col absolute top-16 left-0 right-0 bg-background border-b border-background/50 p-4 gap-2 md:static md:border-0 md:p-0 md:flex-row md:gap-1 md:bg-transparent"
          )}
        >
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={activa(n.href) ? "page" : undefined}
              onClick={() => setAbierto(false)}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                activa(n.href)
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-primary",
              )}
            >
              {n.label}
            </Link>
          ))}
          <div className="md:hidden mt-3 flex items-center gap-3 border-t border-background/50 pt-3">
            <ToggleImagenes />
            <ToggleTema />
            <Link
              href="/mi-cuenta"
              aria-label="Mi cuenta"
              className="inline-flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <CircleUserRound className="size-5" aria-hidden="true" />
            </Link>
          </div>
        </nav>

        <div className="flex items-center gap-2">
          <ConnectionIndicator className="hidden sm:inline-flex text-muted-foreground" />
          <ToggleImagenes className="hidden sm:inline-flex" />
          <ToggleTema className="hidden sm:inline-flex" />
          <Link
            href="/mi-cuenta"
            aria-label="Mi cuenta"
            className="inline-flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <CircleUserRound className="size-5" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() => setAbierto(!abierto)}
            aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
            className="md:hidden inline-flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {abierto ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
