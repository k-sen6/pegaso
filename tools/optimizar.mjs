// Optimizador reutilizable de imágenes de vendedor.
// Uso: node tools/optimizar.mjs <archivo.jpg|png>...  (o una carpeta entera)
// Aplica el MISMO tratamiento del pipeline inicial: 640x480 cover "attention",
// saturación 1.05, AVIF quality 40 (fallback q24 si pasa de 40 KB).
// Salida: public/img/<nombre>.avif
import { mkdirSync, readFileSync, writeFileSync, existsSync, statSync, readdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(new URL("..", import.meta.url).pathname);
const DEST = path.join(ROOT, "public", "img");
mkdirSync(DEST, { recursive: true });

const MAX_BYTES = 40_000;

async function optimizar(origen) {
  const base = path.basename(origen, path.extname(origen)).toLowerCase();
  const nombre = base.replace(/[^a-z0-9-_]/g, "").slice(0, 48) || "imagen";
  const destino = path.join(DEST, `${nombre}.avif`);
  if (existsSync(destino)) {
    console.log(`ya existe: ${destino} (bórralo si quieres regenerar)`);
    return;
  }
  const meta = await sharp(origen).metadata();
  if (meta.width < 200 || meta.height < 200) {
    console.log(`muy pequeña, se omite: ${origen}`);
    return;
  }
  for (const q of [40, 32, 24]) {
    const buf = await sharp(origen)
      .resize(640, 480, { fit: "cover", position: "attention" })
      .modulate({ saturation: 1.05 })
      .avif({ quality: q })
      .toBuffer();
    if (buf.length <= MAX_BYTES || q === 24) {
      writeFileSync(destino, buf);
      console.log(`${path.basename(origen)} -> ${destino} (${buf.length} bytes, q${q})`);
      return;
    }
  }
}

async function main() {
  const objetivos = [];
  for (const arg of process.argv.slice(2)) {
    const p = path.resolve(arg);
    if (!existsSync(p)) {
      console.log(`no existe: ${p}`);
      continue;
    }
    if (statSync(p).isDirectory()) {
      objetivos.push(
        ...readdirSync(p)
          .filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))
          .map((f) => path.join(p, f))
      );
    } else {
      objetivos.push(p);
    }
  }
  if (objetivos.length === 0) {
    console.log("uso: node tools/optimizar.mjs <imagen|carpeta>...");
    return;
  }
  for (const o of objetivos) await optimizar(o);
}

main();
