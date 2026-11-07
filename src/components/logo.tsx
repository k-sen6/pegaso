import { cn } from "cn";

/**
 * Marca de Pegaso: loseta redondeada con degradado cielo y glifo blanco
 * "P con ala". El glifo es la misma forma que usan los iconos PNG
 * (generados desde este SVG en tools/iconos-logo.mjs).
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 24 24" className="size-8 shrink-0" role="img" aria-label="Pegaso">
        <defs>
          <linearGradient id="pegaso-g" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#38bdf8" />
            <stop offset="1" stopColor="#0284c7" />
          </linearGradient>
        </defs>
        <rect x="0.5" y="0.5" width="23" height="23" rx="6" fill="url(#pegaso-g)" />
        <g fill="none" stroke="#ffffff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 6v13.2" />
          <path d="M11 6h4.5a3.55 3.55 0 0 1 0 7.1H11" />
          <path d="M2.6 7.2c3.2-2.3 6-2.9 7.8-1.4 1.7 1.3 1 3.1-.5 4.2-1.3.9-2.7.8-4.4-.3" />
          <path d="M2.6 7.2l2.4 2.4-1.4 1.8" />
        </g>
      </svg>
      <span className="flex flex-col leading-none">
        <span className="text-lg font-semibold tracking-tight">Pegaso</span>
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Que tu negocio vuele
        </span>
      </span>
    </span>
  );
}
