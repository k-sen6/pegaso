import Link from "next/link";
import { TicketIcon, UploadCloud } from "lucide-react";
import { MisReservas } from "@/components/mis-reservas";
import { SubirFoto } from "@/components/subida-foto";

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

      <section className="mt-10" aria-labelledby="subir">
        <h2 id="subir" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <UploadCloud className="size-5 text-primary" aria-hidden="true" />
          Subir fotos de mi producto
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tu foto se comprime a ~150 KB en el propio teléfono y entra en cola local hasta conectar el backend.
        </p>
        <div className="mt-4">
          <SubirFoto />
        </div>
      </section>
    </div>
  );
}
