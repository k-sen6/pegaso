import { CourseCard } from "@/components/course-card";
import { CURSOS } from "@/lib/mock";

export const metadata = { title: "Formación" };

export default function PaginaFormacion() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Formación</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {CURSOS.length} cursos para crear y fortalecer tu cooperativa.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CURSOS.map((curso) => (
          <CourseCard key={curso.id} curso={curso} />
        ))}
      </div>
    </div>
  );
}
