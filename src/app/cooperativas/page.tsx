import { CoopCard } from "@/components/coop-card";
import { COOPERATIVAS } from "@/lib/mock";

export const metadata = { title: "Vendedores" };

export default function PaginaCooperativas() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Vendedores</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Directorio de los {COOPERATIVAS.length} vendedores de Pegaso, en toda Cuba.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {COOPERATIVAS.map((cooperativa) => (
          <CoopCard key={cooperativa.id} cooperativa={cooperativa} />
        ))}
      </div>
    </div>
  );
}
