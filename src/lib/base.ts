// Base de rutas y detección de la APK. Next inyecta estas variables en build.
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const ES_APK = process.env.NEXT_PUBLIC_ES_APK === "1";

export function rutaLocal(ruta: string): string {
  return `${BASE}${ruta.startsWith("/") ? ruta : `/${ruta}`}`;
}

export function urlAbsolutaWeb(ruta = "/"): string {
  const limpia = ruta.startsWith("/") ? ruta : `/${ruta}`;
  return `https://k-sen6.github.io/pegaso${limpia}`;
}
