import Link from "next/link";
import { Clock, FileDown } from "lucide-react";
import type { Curso } from "@/lib/mock";
import { cn } from "cn";

const NIVEL_CLASE: Record<Curso["nivel"], string> = {
  basico: "border-info/40 text-info bg-info/10",
  intermedio: "border-warning/40 text-warning bg-warning/10",
  avanzado: "border-destructive/40 text-destructive bg-destructive/10",
};

const FORMATO_TXT: Record<Curso["formato"], string> = {
  presencial: "Presencial",
  "semi-presencial": "Semi-presencial",
  virtual: "Virtual",
};

export function CourseCard({ curso }: { curso: Curso }) {
  return (
    <article className="group flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-xs font-medium capitalize",
            NIVEL_CLASE[curso.nivel]
          )}
        >
          {curso.nivel}
        </span>
        {curso.descargable && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            <FileDown className="size-3" aria-hidden="true" />
            Descargable offline
          </span>
        )}
      </div>
      <h3 className="font-medium leading-snug">
        <Link href={`/formacion/${curso.slug}`} className="hover:underline underline-offset-4">
          {curso.titulo}
        </Link>
      </h3>
      <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{curso.descripcion}</p>
      <p className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="size-3" aria-hidden="true" />
        {curso.duracionHoras} h · {FORMATO_TXT[curso.formato]}
      </p>
    </article>
  );
}
