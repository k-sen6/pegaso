import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Formación" };

export default function PaginaFormacion() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Formación</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Los cursos gratuitos estarán disponibles próximamente.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed text-muted-foreground">
        <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <div className="h-12 w-12 rounded-full bg-muted/50 mx-auto" />
        </div>
        <p>Aún no hay cursos publicados</p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href="/productos">Ver productos</Link>
        </Button>
      </div>
    </div>
  );
}
