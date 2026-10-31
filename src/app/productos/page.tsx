import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/empty-state";
import { PRODUCTOS, cooperativaPorId } from "@/lib/mock";

export const metadata = { title: "Productos" };

export default function PaginaProductos() {
  const conCoop = PRODUCTOS.flatMap((producto) => {
    const cooperativa = cooperativaPorId(producto.cooperativaId);
    return cooperativa?.verificacion === "verificado"
      ? [{ producto, cooperativa }]
      : [];
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Catálogo de cooperativas verificadas. {conCoop.length} productos.
      </p>
      {conCoop.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {conCoop.map(({ producto, cooperativa }) => (
            <ProductCard key={producto.id} producto={producto} cooperativa={cooperativa} />
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-6"
          titulo="Aún no hay productos"
          mensaje="Cuando las cooperativas publiquen, los verás aquí."
        />
      )}
    </div>
  );
}
