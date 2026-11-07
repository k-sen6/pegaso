import { cn } from "cn";

/**
 * Logo de Pegaso: monograma "P" con ala integrada.
 * Trazo fino, estilo SaaS; hereda el token text-primary.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6 text-primary"
        aria-hidden="true"
      >
        {/* Ala */}
        <path d="M3 7.5C6.5 5 9 4.5 11 6c1.8 1.4 1.2 3.4-.5 4.5S7 11.2 5.5 10" />
        <path d="M3 7.5 5.5 10 3 12" />
        {/* Asta y panza del P */}
        <path d="M11 6v13" />
        <path d="M11 6h4.5a3.5 3.5 0 0 1 0 7H11" />
        {/* Destello */}
        <path d="M18.5 15.5 20 17M16.5 17.5 18 19" />
      </svg>
      <span className="font-semibold tracking-tight text-lg">Pegaso</span>
    </span>
  );
}
