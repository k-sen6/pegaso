import Link from "next/link";
import { Download, Smartphone, WifiOff, Zap } from "lucide-react";
import { Logo } from "@/components/logo";

export const metadata = {
  title: "Descargar para Android",
  description:
    "Instala Pegaso en tu Android: catálogo local, modo sin conexión y publicación de productos pensada para redes lentas.",
};

const ENLACE =
  "https://github.com/k-sen6/pegaso/releases/latest/download/pegaso.apk";

const BENEFICIOS = [
  {
    icono: Zap,
    titulo: "Abre al instante",
    texto: "El catálogo vive en tu teléfono; la red solo lo actualiza.",
  },
  {
    icono: WifiOff,
    titulo: "Funciona sin datos",
    texto: "Navega y comparte productos aunque se caiga la señal.",
  },
  {
    icono: Smartphone,
    titulo: "Se siente nativa",
    texto: "Pantalla completa, gestos, botón atrás y compartir.",
  },
];

export default function DescargarPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="rounded-2xl border bg-card p-6 shadow-premium sm:p-8">
        <Logo />
        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          Pegaso para Android
        </h1>
        <p className="mt-2 text-pretty text-muted-foreground">
          La versión instalable: más rápida, con catálogo guardado y pensada
          para conexiones lentas. Sin tiendas ni intermediarios.
        </p>

        <a
          href={ENLACE}
          className="btn-premium mt-6 w-full text-base"
          aria-label="Descargar Pegaso APK"
        >
          <Download className="mr-2 size-5" aria-hidden="true" />
          Descargar APK
        </a>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Android 7 o superior · APK firmada · se actualiza desde Ajustes
        </p>

        <div className="mt-8 grid gap-3">
          {BENEFICIOS.map((b) => {
            const Icono = b.icono;
            return (
              <div
                key={b.titulo}
                className="flex items-start gap-3 rounded-xl border bg-background/60 p-4"
              >
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary">
                  <Icono className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-medium">{b.titulo}</p>
                  <p className="text-sm text-muted-foreground">{b.texto}</p>
                </div>
              </div>
            );
          })}
        </div>

        <ol className="mt-8 space-y-2 text-sm text-muted-foreground">
          <li>1. Pulsa “Descargar APK”.</li>
          <li>2. Abre el archivo y permite instalar apps de esta fuente.</li>
          <li>3. Instala, entra y publica tu primer producto.</li>
        </ol>

        <div className="mt-8 flex flex-wrap items-center gap-4 border-t pt-5 text-sm">
          <Link href="/" className="font-medium text-primary hover:underline">
            Seguir en la web
          </Link>
          <Link
            href="/terminos"
            className="text-muted-foreground hover:text-foreground"
          >
            Términos
          </Link>
          <Link
            href="/privacidad"
            className="text-muted-foreground hover:text-foreground"
          >
            Privacidad
          </Link>
        </div>
      </div>
    </div>
  );
}
