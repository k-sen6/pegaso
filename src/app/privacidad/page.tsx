import Link from "next/link";

export const metadata = { title: "Privacidad" };

export default function PaginaPrivacidad() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Privacidad</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Última actualización: noviembre de 2026.
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Qué datos guardamos
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Correo electrónico y contraseña cifrada (para iniciar sesión).</li>
            <li>Nombre de la tienda, sector, provincia, municipio y descripción.</li>
            <li>WhatsApp y dirección de recogida.</li>
            <li>Coordenadas del mapa, solo si decides activarlas.</li>
            <li>Fotos y datos de los productos que publicas.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Qué información es pública
          </h2>
          <p className="mt-2">
            El nombre de la tienda, sector, provincia, municipio, descripción,
            WhatsApp, dirección y productos son visibles para cualquier visitante.
            Las coordenadas se publican solo si las activas. No publiques datos que
            no quieras compartir.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Para qué los usamos
          </h2>
          <p className="mt-2">
            Para mostrar tu tienda y tus productos, permitir que los compradores te
            contacten por WhatsApp y mantener tu cuenta. No vendemos datos a terceros
            ni los usamos para publicidad.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Dónde se alojan
          </h2>
          <p className="mt-2">
            La cuenta, el catálogo y las fotos se guardan en Supabase (PostgreSQL y
            Storage). El sitio se publica como aplicación estática. Las fotos se
            comprimen en tu dispositivo antes de subirse.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Tus derechos
          </h2>
          <p className="mt-2">
            Puedes corregir tus datos desde{" "}
            <Link href="/mi-cuenta" className="text-primary hover:underline">
              Mi cuenta
            </Link>{" "}
            y eliminar tu cuenta y tus datos desde esa misma página. También puedes
            escribir a{" "}
            <a href="mailto:hola@pegaso.cu" className="text-primary hover:underline">
              hola@pegaso.cu
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Cookies</h2>
          <p className="mt-2">
            Usamos almacenamiento local del navegador para mantener la sesión y el
            funcionamiento sin conexión. No usamos cookies publicitarias.
          </p>
        </section>
      </div>
    </article>
  );
}
