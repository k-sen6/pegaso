import { Catalogo } from "@/components/catalogo";

export const metadata = { title: "Productos" };

export default function PaginaProductos() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Productos</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Catálogo de vendedores verificados.
      </p>
      <div className="mt-8">
        <Catalogo />
      </div>
    </div>
  );
}
