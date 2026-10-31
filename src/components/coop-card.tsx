import Link from "next/link";
import { BadgeCheck, Clock, MapPin, XCircle } from "lucide-react";
import type { Cooperativa } from "@/lib/mock";
import { NOMBRE_SECTOR } from "@/lib/mock/types";
import { cn } from "cn";

const VERIFICACION_UI: Record<
  Cooperativa["verificacion"],
  { texto: string; clase: string; icono?: React.ComponentType<{ className?: string }> }
> = {
  verificado: {
    texto: "Verificada",
    clase: "border-success/40 text-success bg-success/10",
    icono: BadgeCheck,
  },
  pendiente: {
    texto: "En revisión",
    clase: "border-warning/40 text-warning bg-warning/10",
    icono: Clock,
  },
  rechazado: {
    texto: "Rechazada",
    clase: "border-destructive/40 text-destructive bg-destructive/10",
    icono: XCircle,
  },
};

export function VerificacionBadge({
  verificacion,
  className,
}: {
  verificacion: Cooperativa["verificacion"];
  className?: string;
}) {
  const ui = VERIFICACION_UI[verificacion];
  const Icono = ui.icono;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        ui.clase,
        className
      )}
    >
      {Icono && <Icono className="size-3" aria-hidden="true" />}
      {ui.texto}
    </span>
  );
}

export function CoopCard({ cooperativa }: { cooperativa: Cooperativa }) {
  return (
    <article className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-2">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/15 text-lg font-bold text-primary"
        >
          {cooperativa.nombre.charAt(0)}
        </span>
        <VerificacionBadge verificacion={cooperativa.verificacion} />
      </div>
      <div className="min-h-0">
        <h3 className="font-medium leading-snug">
          <Link href={`/cooperativas/${cooperativa.slug}`} className="hover:underline">
            {cooperativa.nombre}
          </Link>
        </h3>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3 shrink-0" aria-hidden="true" />
          {NOMBRE_SECTOR[cooperativa.sector]} · {cooperativa.provincia}
        </p>
      </div>
      <p className="line-clamp-2 text-sm text-muted-foreground">{cooperativa.descripcion}</p>
      <p className="mt-auto text-xs text-muted-foreground">
        {cooperativa.productosCount} productos publicados
      </p>
    </article>
  );
}
