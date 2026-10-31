import { WifiOff } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const metadata = { title: "Sin conexión" };

export default function PaginaOffline() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-lg bg-warning/15 text-warning">
        <WifiOff className="size-6" aria-hidden="true" />
      </span>
      <h1 className="mt-4 text-xl font-semibold tracking-tight">Estás sin conexión</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        No se pudo cargar esta página ahora mismo. Tus cambios guardados se
        sincronizarán cuando vuelva la señal.
      </p>
      <Link href="/" className={`${buttonVariants()} mt-6`}>
        Reintentar
      </Link>
    </div>
  );
}
