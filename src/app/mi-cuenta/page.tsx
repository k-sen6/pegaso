import Link from "next/link";
import { TicketIcon } from "lucide-react";
import { MisReservas } from "@/components/mis-reservas";

export const metadata = { title: "Mi cuenta" };

export default function PaginaMiCuenta() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Mi cuenta</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Perfil y configuración completos llegan con la autenticación (Iteración 4).
      </p>

      <section className="mt-8" aria-labelledby="reservas">
        <h2 id="reservas" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
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
    </div>
  );
}
