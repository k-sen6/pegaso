"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Users, GraduationCap, PiggyBank } from "lucide-react";
import { cn } from "cn";

const ITEMS = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/productos", label: "Productos", icon: ShoppingBag },
  { href: "/cooperativas", label: "Vendedores", icon: Users },
  { href: "/formacion", label: "Formación", icon: GraduationCap },
  { href: "/financiamiento", label: "Financiamiento", icon: PiggyBank },
];

/** Quita basePath, slash final y query para comparar rutas con/fromulas. */
function rutaLimpia(pathname: string): string {
  const sinBase = pathname.replace(/^\/pegaso/, "");
  const sinSlash = sinBase.replace(/\/+$/, "");
  return sinSlash === "" ? "/" : sinSlash;
}

export function MobileNav() {
  const pathname = usePathname();
  const ruta = rutaLimpia(pathname ?? "/");
  return (
    <nav
      aria-label="Navegación móvil"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden"
    >
      <ul className="mx-auto flex max-w-md">
        {ITEMS.map(({ href, label, icon: Icono }) => {
          const activo = ruta === href || (href !== "/" && ruta.startsWith(`${href}/`));
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={activo ? "page" : undefined}
                className="flex flex-col items-center gap-0.5 py-1.5"
              >
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full transition-colors",
                    activo ? "bg-primary/15 text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icono className="size-5" aria-hidden="true" />
                </span>
                <span
                  className={cn(
                    "max-w-full truncate px-0.5 text-[10px] leading-tight",
                    activo ? "font-semibold text-primary" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
