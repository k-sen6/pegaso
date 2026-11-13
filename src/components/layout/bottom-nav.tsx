"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, Store, User, type LucideIcon } from "lucide-react";
import { cn } from "cn";

interface ItemNav {
  href: string;
  label: string;
  icono: LucideIcon;
  exacto?: boolean;
  destacado?: boolean;
}

const NAV_ITEMS: ItemNav[] = [
  { href: "/", label: "Inicio", icono: Home, exacto: true },
  { href: "/productos", label: "Buscar", icono: Search },
  { href: "/mi-cuenta#productos", label: "Publicar", icono: PlusCircle, destacado: true },
  { href: "/vendedores", label: "Vendedores", icono: Store },
  { href: "/mi-cuenta", label: "Cuenta", icono: User },
];

function vibrar() {
  void import("@capacitor/haptics")
    .then(({ Haptics, ImpactStyle }) =>
      Haptics.impact({ style: ImpactStyle.Light })
    )
    .catch(() => {});
}

export function BottomNav() {
  const pathname = usePathname() ?? "/";

  return (
    <nav
      aria-label="Navegación inferior"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 items-end justify-around",
        "bottom-nav-app border-t border-border bg-card/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
      )}
    >
      {NAV_ITEMS.map((item) => {
        const activa = item.exacto
          ? pathname === item.href
          : !item.destacado &&
            (pathname === item.href || pathname.startsWith(item.href + "/"));
        const Icono = item.icono;
        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={vibrar}
            aria-current={activa ? "page" : undefined}
            className={cn(
              "flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
              activa ? "text-primary" : "text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "grid size-9 place-items-center rounded-full transition-all",
                item.destacado &&
                  "-mt-5 size-12 bg-primary text-primary-foreground shadow-[0_8px_24px_-6px_var(--primary)]",
                activa && !item.destacado && "bg-primary/12"
              )}
            >
              <Icono
                className={cn(item.destacado ? "size-6" : "size-5")}
                aria-hidden="true"
              />
            </span>
            <span className={cn(item.destacado && "-mt-1")}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
