// Genera public/sw.js precacheando el export estático de Next.
// Estrategia: stale-while-revalidate — abre desde cache y actualiza
// en segundo plano cuando hay red (auto-sincroniza con el repo).
import { generateSW } from "workbox-build";

const NAVEGAVEL = {
  urlPattern: ({ request, url }) =>
    request.mode === "navigate" && url.pathname.startsWith("/pegaso/"),
  handler: "StaleWhileRevalidate",
  options: { cacheName: "paginas", expiration: { maxEntries: 40 } },
};

const ESTATICOS = {
  urlPattern: ({ url }) => url.origin === self.location.origin,
  handler: "StaleWhileRevalidate",
};
