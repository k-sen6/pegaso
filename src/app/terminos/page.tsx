import Link from "next/link";

export const metadata = { title: "Términos de uso" };

export default function PaginaTerminos() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Términos de uso</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Última actualización: noviembre de 2026.
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">Qué es Pegaso</h2>
          <p className="mt-2">
            Pegaso es una plataforma de contacto que permite a vendedores locales
            publicar productos y a los compradores encontrarlos y comunicarse
            directamente por WhatsApp. Pegaso no vende los productos, no procesa
            pagos y no interviene en la entrega.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Cuentas de vendedor</h2>
          <p className="mt-2">
            Para publicar debes crear una cuenta con un correo válido y ofrecer un
            número de WhatsApp y una dirección de recogida. Eres responsable de la
            veracidad de esos datos y de mantenerlos actualizados.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Productos y precios</h2>
          <p className="mt-2">
            Los precios se muestran en CUP y los fija cada vendedor. El vendedor es
            responsable de la descripción, disponibilidad, calidad y legalidad de lo
            que publica. No se permite publicar bienes o servicios prohibidos por la
            ley.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Pagos y entregas</h2>
          <p className="mt-2">
            El pago y la entrega se acuerdan directamente entre comprador y vendedor.
            Pegaso no garantiza la entrega ni reembolsa pagos. Recomendamos revisar el
            producto al recibirlo.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Conducta</h2>
          <p className="mt-2">
            No está permitido suplantar identidades, publicar contenido engañoso,
            acosar a otros usuarios ni usar la plataforma para actividades ilegales.
            Podemos retirar publicaciones o cuentas que incumplan estas reglas.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Baja de cuenta</h2>
          <p className="mt-2">
            Puedes eliminar tu cuenta desde{" "}
            <Link href="/mi-cuenta" className="text-primary hover:underline">
              Mi cuenta
            </Link>
            . Al hacerlo se borran tu perfil de tienda, tus productos, sus fotos y tus
            datos de acceso.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Contacto</h2>
          <p className="mt-2">
            Dudas o reportes:{" "}
            <a href="mailto:hola@pegaso.cu" className="text-primary hover:underline">
              hola@pegaso.cu
            </a>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
