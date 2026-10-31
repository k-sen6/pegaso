import { cn } from "cn";

type Props = {
  titulo: string;
  mensaje: string;
  accion?: React.ReactNode;
  className?: string;
};

/** Ilustración SVG inline (< 1 KB): pieza incompleta de puzzle. */
export function EmptyState({ titulo, mensaje, accion, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-dashed bg-muted/30 px-6 py-10 text-center",
        className
      )}
    >
      <svg viewBox="0 0 64 64" fill="none" className="size-16 text-muted-foreground/60" aria-hidden="true">
        <rect x="6" y="14" width="30" height="18" rx="3" stroke="currentColor" strokeWidth="2" opacity="0.7" />
        <rect x="40" y="22" width="18" height="28" rx="3" stroke="currentColor" strokeWidth="2" />
        <rect x="14" y="36" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
        <path d="M46 14a4 4 0 0 1 8 0v4h-8v-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="24" cy="43" r="3" fill="currentColor" opacity="0.5" />
      </svg>
      <h2 className="font-medium">{titulo}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">{mensaje}</p>
      {accion && <div className="mt-1">{accion}</div>}
    </div>
  );
}
