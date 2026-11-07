// Pipeline de imágenes reales (Openverse API → sharp AVIF/WebP ≤ 40 KB).
// Es el mismo paso de siempre, pero con caché, logging y rate-limit seguros.
// Sustrato: descarga dentro del repositorio y reutiliza public/img ya existente.
import { mkdirSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(new URL("..", import.meta.url).pathname);
const DEST = path.join(ROOT, "public", "img");
mkdirSync(DEST, { recursive: true });

const TEMAS = JSON.parse(
  readFileSync(path.join(ROOT, "src/lib/mock/temas.json"), "utf8")
);

const ANON = {
  headers: {
    "User-Agent": "PegasoPipeline/0.1 (contacto@pegaso.cu) node-fetch",
    Accept: "application/json",
  },
};

const DORMIR = (ms) => new Promise((r) => setTimeout(r, ms));

async function buscar(termino) {
  const url =
    "https://api.openverse.org/v1/images/?q=" +
    encodeURIComponent(termino) +
    "&license_type=commercial&modification=all&extension=jpg,png&page_size=5";
  const r = await fetch(url, { headers: ANON.headers });
  if (!r.ok) throw new Error(`openverse ${r.status}`);
  return r.json();
}

async function descargar(urlDestino, destino) {
  const r = await fetch(urlDestino, { headers: ANON.headers });
  if (!r.ok) throw new Error(`descarga ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < 6_000) throw new Error("imagen pequeña");
  const wb = await sharp(buf)
    .resize(640, 480, { fit: "cover", position: "attention" })
    .modulate({ saturation: 1.05 })
    .avif({ quality: 40 })
    .toBuffer();
  if (wb.length > 40_000) {
    // recomprime un pelín más justo
    const wb2 = await sharp(buf)
      .resize(640, 480, { fit: "cover", position: "attention" })
      .modulate({ saturation: 1.05 })
      .avif({ quality: 24 })
      .toBuffer();
    writeFileSync(destino, wb2);
    return wb2.length;
  }
  writeFileSync(destino, wb);
  return wb.length;
}

// Puntos de partida: 1 intento por tema + 1 fallback.
async function main() {
  let ok = 0;
  for (const { tema, terminos } of TEMAS) {
    const arch = path.join(DEST, `p-${tema}.avif`);
    if (existsSync(arch)) {
      ok++;
      continue;
    }
    let hecho = false;
    for (const t of terminos) {
      if (hecho) break;
      try {
        const json = await buscar(t);
        await DORMIR(15_000); // memoria de cortesía para el API anónimo
        for (const hit of json.results ?? []) {
          const src = hit.url;
          try {
            const bytes = await descargar(src, arch);
            ok++;
            hecho = true;
            console.log(`ok ${tema} <- ${src} (${bytes} b)`);
            break;
          } catch (e) {
            console.log(`  falla ${tema} url ${e.message}`);
          }
          await DORMIR(2_000);
        }
      } catch (e) {
        console.log(`  termino ${tema}: ${e.message}`);
        await DORMIR(60_000); // cortesía extra si hubo 429
      }
    }
    if (!hecho) console.log(`STALL ${tema}`);
  }
  console.log(`resultado: ${ok}/${TEMAS.length} temas con imagen`);
}

main();
