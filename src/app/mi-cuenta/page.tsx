import Link from "next/link";
import { TicketIcon, UploadCloud } from "lucide-react";
import { MisReservas } from "@/components/mis-reservas";
import { SesionPanel } from "@/components/sesion-panel";
import PanelProductosVendedor from "@/components/vendor/panel-productos";

export const metadata = { title: "Mi cuenta" };

export default function PaginaMiCuenta() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Mi cuenta</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Perfil, reservas y productos de tu tienda.
      </p>

      <SesionPanel />

      <section className="mt-8" aria-labelledby="reservas">
        <h2 id="reservas" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <TicketIcon className="size-5 text-primary" aria-hidden="true" />
          Mis reservas
        </h2>
        <MisReservas />
        <p className="mt-3 text-xs text-muted-foreground">
          Buscas algo más?{" "}
          <Link href="/productos" className="text-primary hover:underline">
            Volver al catálogo
          </Link>
        </p>
      </section>

      <section className="mt-12" aria-labelledby="productos">
        <h2 id="productos" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <UploadCloud className="size-5 text-primary" aria-hidden="true" />
          Mis productos
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sube productos con imagen, precio y descripción. Se guardan en tu catálogo y se ven en la tienda.
        </p>
        <div className="mt-4">
          <PanelProductosVendedor mostrarTitulo={false} />
        </div>
      </section>
    </div>
  );
}
