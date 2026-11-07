"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, CircleArrowRight, User } from "lucide-react";
import { cn } from "cn";

/**
 * Navegación inferior exclusiva de la PWA/app móvil.
 * El web usa header superior; esta es solo para app instalada.
 */
const NAV_ITEMS = [
  { href: "/", label: "Inicio", icono: Home },
  { href: "/productos", label: "Buscar", icono: ShoppingBag },
  { href: "/mi-cuenta", label: "Mis reservas", icono: CircleArrowRight },
  { href: "/mi-cuenta", label: "Cuenta", icono: User },
] as const;

export function BottomNav() {
  const pathname = usePathname() ?? "/";
  return (
    <nav
      aria-label="Navegación inferior (app)"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center h-[72px] bg-card border-t border-background/80 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-premium",
        "hidden",
        "bottom-nav-app"
      )}
    >
      {NAV_ITEMS.map((item) => {
        const activa = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icono = item.icono;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={activa ? "page" : undefined}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors duration-200 touch-target min-w-[72px]",
              activa
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <Icono className="size-5" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
