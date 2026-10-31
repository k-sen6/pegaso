// Pipeline de imágenes de demostración:
// 1) descarga la mejor foto real (Openverse/Flickr, licencia comercial)
// 2) re-comprime con sharp a AVIF + WebP (320w y 640w), < 40 KB por imagen
// Salida: public/img/<tema>-<w>.avif / .webp  +  public/img/creditos.json
// Uso: node tools/imagenes.mjs
import { mkdir, writeFile, readFile, stat } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import sharp from "sharp";

const RAW = new URL("../../../../../../../tmp/opencode/pegaso-img/raw", import.meta.url)
  .pathname;

const TEMAS = [
  // [archivo, query de busqueda]
  ["agro",       "potatoes harvest market"],
  ["mango",      "mango fruit"],
  ["tomate",     "tomatoes fresh market"],
  ["cafe",       "coffee beans roasted"],
  ["queso",      "cheese wheel"],
  ["miel",       "honey jar beeswax"],
  ["telar",      "weaving loom textile"],
  ["camisa",     "linen shirt stitching"],
  ["ceramica",   "ceramic pottery bowls"],
  ["tic",        "laptop code retailer"],
  ["cuero",      "leather bag handmade"],
  ["catering",   "buffet event catering"],
  ["general",    "caribbean market fruits"],
];

const WIDTHS = [320, 640];

async function descargar(tema, query) {
  for (let intento = 0; intento < 3; intento++) {
    await new Promise((r) => setTimeout(r, intento ? 4000 : 0));
    const res = await fetch(
      `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}` +
        `&license_type=commercial&mature=false&size=medium&page_size=5`
    );
    if (!res.ok) continue;
    const texto = await res.text();
    if (!texto.startsWith("{")) continue; // rate limit devolvio HTML
    const json = JSON.parse(texto);
    return (json.results ?? []).filter(
      (r) => r.width >= 600 && /\.(jpe?g)$/i.test(r.url)
    );
  }
  throw new Error(`openverse no disponible para ${tema}`);
}

async function bajar(url, destino) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(destino, buf);
  return buf.length;
}

async function comprimir(origen, nombreTema) {
  const salida = [];
  for (const w of WIDTHS) {
    for (const fmt of ["avif", "webp"]) {
      const img = sharp(origen).resize(w, undefined, { withoutEnlargement: true });
      const archivo = `public/img/${nombreTema}-${w}.${fmt}`;
      const opts =
        fmt === "avif"
          ? { avif: { quality: 45, effort: 5 } }
          : { webp: { quality: 62 } };
      const { info } = await img.toFormat(fmt, opts).toFile(archivo);
      const { size } = await stat(archivo);
      salida.push({ archivo, size: Math.round(size / 1024) + "KB", w: info.width });
    }
  }
  return salida;
}

await mkdir("public/img", { recursive: true });
await mkdir(RAW, { recursive: true });
const creditos = {};
const informe = [];

for (const [tema, query] of TEMAS) {
  let ok = false;
  try {
    for (const c of await descargar(tema, query)) {
    try {
      const origen = `${RAW}/${tema}.jpg`;
      const bytes = await bajar(c.url, origen);
      const img = sharp(origen);
      const meta = await img.metadata();
      if (meta.width < 600) continue;
      await comprimir(origen, tema);
      creditos[tema] = {
        autor: c.creator ?? "-",
        licencia: c.license ?? "-",
        origen: c.foreign_landing_url,
        bytes,
      };
      ok = true;
      break;
    } catch {
      continue; // probar siguiente candidato
    }
    }
  } catch (e) {
    console.error(`descarga ${tema}: ${e.message}`);
  }
  informe.push({ tema, ok });
  console.log(ok ? `ok  ${tema}` : `FALLO ${tema}`); process.stdout.write("");
}

await writeFile("public/img/creditos.json", JSON.stringify(creditos, null, 2));
console.table(informe);
