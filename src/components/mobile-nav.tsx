"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Users, GraduationCap, PiggyBank } from "lucide-react";
import { cn } from "cn";

const ITEMS = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/productos", label: "Productos", icon: ShoppingBag },
  { href: "/cooperativas", label: "Coops.", icon: Users },
  { href: "/formacion", label: "Formación", icon: GraduationCap },
  { href: "/financiamiento", label: "Financio", icon: PiggyBank },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navegación móvil"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden"
    >
      <ul className="mx-auto flex max-w-md">
        {ITEMS.map(({ href, label, icon: Icono }) => {
          const activo = pathname === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={activo ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-[11px]",
                  activo ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icono className="size-5" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
