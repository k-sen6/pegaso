// Genera public/../out/sw.js tras el export estático de Next.
// Estrategia: stale-while-revalidate — abre desde cache y actualiza en
// segundo plano cuando hay red (auto-sincroniza con el repo).
// Uso:  node tools/generar-sw.mjs
import { generateSW } from "workbox-build";

const result = await generateSW({
  swDest: "out/sw.js",
  globDirectory: "out",
  globPatterns: ["**/*.html", "**/*.js", "**/*.css", "**/*.woff2", "**/*.json", "**/*.svg", "**/*.png"],
  maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    {
      // Navegaciones: RED PRIMERO (máx 4 s) con caché como red de seguridad.
      // Así el teléfono muestra la versión nueva al refrescar (con conexión),
      // y queda lo último disponible si no hay señal.
      urlPattern: ({ request, url }) =>
        request.mode === "navigate" && url.pathname.startsWith("/pegaso/"),
      handler: "NetworkFirst",
      options: {
        cacheName: "paginas",
        networkTimeoutSeconds: 4,
        expiration: { maxEntries: 60 },
      },
    },
    {
      // Imágenes: cache-first (peso es lo más caro en 2G), pero con
      // expiración corta para que un rediseño de catálogo las refresque.
      urlPattern: /\.(?:png|jpe?g|gif|webp|avif|svg)$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "imagenes",
        expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 7 },
      },
    },
    {
      // Fuentes: cache-first para siempre
      urlPattern: /\.(?:woff2?|ttf)$/i,
      handler: "CacheFirst",
      options: { cacheName: "fuentes", expiration: { maxEntries: 30 } },
    },
  ],
  navigateFallback: "/pegaso/",
});

console.log(`sw.js: ${result.count} archivos precacheados, ${result.warnings.length} avisos`);
result.warnings.forEach((w) => console.warn(w));
