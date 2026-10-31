import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BadgeCheck, FileDown, PiggyBank } from "lucide-react";

export const metadata = { title: "Financiamiento" };

const CRITERIOS = [
  "Estar legalizada o en proceso como cooperativa o trabajador por cuenta propia (NAE).",
  "Sectores priorizados: agroalimentario, energías renovables, TIC e industrias creativas.",
  "Participación destacada de mujeres y jóvenes en la dirección del proyecto.",
  "2 o más trabajadores asociados, o plan claro de incorporación.",
];

export default function PaginaFinanciamiento() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <span className="flex size-12 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <PiggyBank className="size-6" aria-hidden="true" />
      </span>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        Financiamiento internacional para tu cooperativa
      </h1>
      <p className="mt-3 text-muted-foreground">
        El programa <strong>NAE (Nuevos Actores Económicos)</strong> —financiado por la
        Unión Europea e implementado por el PNUD, la Cooperación Francesa y el MEP—
        entrega hasta <strong className="text-foreground">40 000 USD por iniciativa</strong> a
        proyectos priorizados.
      </p>
      <h2 className="mt-8 font-semibold">¿Quién puede aplicar?</h2>
      <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
        {CRITERIOS.map((c) => (
          <li key={c} className="flex items-start gap-2">
            <BadgeCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
            {c}
          </li>
        ))}
      </ul>
      <h2 className="mt-8 font-semibold">Materiales de preparación</h2>
      <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
        <FileDown className="size-4 shrink-0 text-primary" aria-hidden="true" />
        Guía de solvencia documental y modelo de concepto (descarga offline disponible al inscribirte).
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/registro" className="h-9 px-4">Evaluar mi elegibilidad</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/formacion" className="h-9 px-4">Preparar con un curso</Link>
        </Button>
      </div>
    </div>
  );
}
