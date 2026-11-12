import Link from "next/link";
import { Mail, MessageCircle, MapPin } from "lucide-react";

export const metadata = { title: "Contacto" };

export default function PaginaContacto() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Contacto</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        ¿Un problema con un pedido, una cuenta o una publicación? Escríbenos.
      </p>

      <div className="mt-8 grid gap-3">
        <a
          href="mailto:hola@pegaso.cu?subject=Soporte%20Pegaso"
          className="flex items-start gap-3 rounded-xl border bg-card p-5 transition-colors hover:border-primary/50"
        >
          <Mail className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <span>
            <span className="block font-medium">Correo de soporte</span>
            <span className="block text-sm text-muted-foreground">
              hola@pegaso.cu
            </span>
          </span>
        </a>

        <a
          href="https://wa.me/5350000000?text=Hola%2C%20necesito%20ayuda%20con%20Pegaso."
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 rounded-xl border bg-card p-5 transition-colors hover:border-primary/50"
        >
          <MessageCircle
            className="mt-0.5 size-5 shrink-0 text-[#25D366]"
            aria-hidden="true"
          />
          <span>
            <span className="block font-medium">WhatsApp de soporte</span>
            <span className="block text-sm text-muted-foreground">
              +53 5 000 0000
            </span>
          </span>
        </a>

        <div className="flex items-start gap-3 rounded-xl border bg-card p-5">
          <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <span>
            <span className="block font-medium">Cómo funciona</span>
            <span className="block text-sm text-muted-foreground">
              Pegaso conecta compradores y vendedores; el pago y la entrega se
              acuerdan directamente con cada vendedor.
            </span>
          </span>
        </div>
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        Antes de escribir, revisa los{" "}
        <Link href="/terminos" className="text-primary hover:underline">
          términos
        </Link>{" "}
        y la{" "}
        <Link href="/privacidad" className="text-primary hover:underline">
          política de privacidad
        </Link>
        .
      </p>
    </article>
  );
}
