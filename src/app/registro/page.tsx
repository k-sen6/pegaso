import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = { title: "Registro" };

/** Iteración 1: pantalla de entrada al flujo. Formulario real en Iteración 4. */
export default function PaginaRegistro() {
  return (
    <div className="mx-auto max-w-md px-4 py-12 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Crear cuenta</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        El registro con email y contraseña llega en la siguiente iteración.
        Mientras tanto, navega el catálogo y los cursos.
      </p>
      <Button asChild className="mt-6">
        <Link href="/productos">Ver productos</Link>
      </Button>
    </div>
  );
}
