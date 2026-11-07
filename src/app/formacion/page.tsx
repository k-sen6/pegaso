import { CourseCard } from "@/components/course-card";
import { CURSOS } from "@/lib/mock";

export const metadata = { title: "Formación" };

export default function PaginaFormacion() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Formación</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {CURSOS.length} cursos gratuitos para crear y fortalecer tu negocio.
      </p>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CURSOS.map((curso) => (
          <CourseCard key={curso.id} curso={curso} />
        ))}
      </div>
    </div>
  );
}
