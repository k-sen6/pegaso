import Link from "next/link";
import { BadgeCheck, MapPin } from "lucide-react";
import type { Cooperativa } from "@/lib/catalogo";
import { cn } from "cn";

const VERIFICACION_UI: Record<
  Cooperativa["verificacion"],
  { texto: string; clase: string; icono?: React.ComponentType<{ className?: string }> }
> = {
  verificado: {
    texto: "Verificado",
    clase: "border-success/40 text-success bg-success/10",
    icono: BadgeCheck,
  },
  pendiente: {
    texto: "En revisión",
    clase: "border-warning/40 text-warning bg-warning/10",
    icono: BadgeCheck,
  },
  rechazado: {
    texto: "Rechazado",
    clase: "border-destructive/40 text-destructive bg-destructive/10",
    icono: BadgeCheck,
  },
};

export function VerificacionBadge({
  verificacion,
  className,
}: {
  verificacion: Cooperativa["verificacion"];
  className?: string;
}) {
  if (verificacion !== "verificado") return null;
  const ui = VERIFICACION_UI[verificacion];
  const Icono = ui.icono;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
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
    <article className="group flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <span
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-lg font-bold text-primary ring-1 ring-primary/20"
        >
          {cooperativa.nombre.charAt(0)}
        </span>
        <VerificacionBadge verificacion={cooperativa.verificacion} />
      </div>
      <div className="min-h-0">
        <h3 className="font-semibold leading-snug">
          <Link href={`/vendedor?slug=${cooperativa.slug}`} className="hover:underline underline-offset-4">
            {cooperativa.nombre}
          </Link>
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3 shrink-0" aria-hidden="true" />
          {(cooperativa.sector === "agroalimentario"
  ? "Agroalimentario"
  : cooperativa.sector === "textil"
  ? "Textil"
  : cooperativa.sector === "artesania"
  ? "Artesanía"
  : cooperativa.sector === "servicios"
  ? "Servicios"
  : cooperativa.sector === "tic"
  ? "TIC"
  : cooperativa.sector)}{" · "}{cooperativa.provincia}
        </p>
      </div>
      <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{cooperativa.descripcion}</p>
      <p className="mt-auto text-xs text-muted-foreground">
        {typeof cooperativa.productosCount === "number"
          ? `${cooperativa.productosCount} productos publicados`
          : "Ver tienda"}
      </p>
    </article>
  );
}
