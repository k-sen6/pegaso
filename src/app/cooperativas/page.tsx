import { DirectorioVendedores } from "@/components/directorio-vendedores";

export const metadata = { title: "Vendedores" };

export default function PaginaCooperativas() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Vendedores</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Directorio de los vendedores de Pegaso, en toda Cuba.
      </p>
      <div className="mt-7">
        <DirectorioVendedores />
      </div>
    </div>
  );
}
