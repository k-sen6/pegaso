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
  runtimeCaching: [
    {
      // Navegaciones a páginas no precacheadas: cache + refresco en fondo
      urlPattern: ({ request, url }) =>
        request.mode === "navigate" && url.pathname.startsWith("/pegaso/"),
      handler: "StaleWhileRevalidate",
      options: { cacheName: "paginas", expiration: { maxEntries: 60 } },
    },
    {
      // Imágenes: cache-first (peso es lo más caro en 2G)
      urlPattern: /\.(?:png|jpe?g|gif|webp|avif|svg)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "imagenes",
        expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 },
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
