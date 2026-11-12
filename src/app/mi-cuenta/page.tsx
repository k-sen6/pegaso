import { Store, UploadCloud } from "lucide-react";
import { SesionPanel } from "@/components/sesion-panel";
import { PerfilTienda } from "@/components/vendor/perfil-tienda";
import PanelProductosVendedor from "@/components/vendor/panel-productos";

export const metadata = { title: "Mi cuenta" };

export default function PaginaMiCuenta() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Mi cuenta</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Perfil de tu tienda y productos publicados.
      </p>

      <SesionPanel />

      <div className="mt-8">
        <PerfilTienda />
      </div>

      <section className="mt-12" aria-labelledby="productos">
        <h2
          id="productos"
          className="flex items-center gap-2 text-lg font-bold tracking-tight"
        >
          <UploadCloud className="size-5 text-primary" aria-hidden="true" />
          Mis productos
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sube productos con imagen, precio y descripción. Se guardan en tu
          catálogo y se ven en la tienda.
        </p>
        <div className="mt-4">
          <PanelProductosVendedor mostrarTitulo={false} />
        </div>
      </section>

      <p className="mt-10 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Store className="size-3.5" aria-hidden="true" />
        Pegaso · compra local, pago directo al vendedor.
      </p>
    </div>
  );
}
