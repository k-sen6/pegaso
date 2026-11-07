// Regenera los iconos PNG de la PWA desde el glifo de marca (logo.tsx).
// Uso: node tools/iconos-logo.mjs
import { writeFileSync } from "node:fs";
import sharp from "sharp";

const base = `
<rect width="24" height="24" fill="url(#g)"/>
<g fill="none" stroke="#ffffff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
  <path d="M11 6v13.2"/>
  <path d="M11 6h4.5a3.55 3.55 0 0 1 0 7.1H11"/>
  <path d="M2.6 7.2c3.2-2.3 6-2.9 7.8-1.4 1.7 1.3 1 3.1-.5 4.2-1.3.9-2.7.8-4.4-.3"/>
  <path d="M2.6 7.2l2.4 2.4-1.4 1.8"/>
</g>`;

function svg(paraMaskable = false) {
  const grupo = paraMaskable
    ? `<g transform="translate(3.4 3.4) scale(0.72)">${base}</g>`
    : base;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
<defs><linearGradient id="g" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#0284c7"/>
</linearGradient></defs>${grupo}</svg>`;
}

async function raster(nombre, size, paraMaskable) {
  const ruta = `public/icons/${nombre}`;
  await sharp(Buffer.from(svg(paraMaskable)), { density: 96 })
    .resize(size, size)
    .flatten({ background: "#0284c7" })
    .png({ compressionLevel: 9 })
    .toBuffer()
    .then((b) => writeFileSync(ruta, b));
  console.log(`ok ${ruta} ${size}px`);
}

for (const [n, s, m] of [
  ["icon-512.png", 512, false],
  ["icon-192.png", 192, false],
  ["icon-maskable.png", 432, true],
]) {
  await raster(n, s, m);
}
// favicon.ico simple desde el PNG 64 (encabezado ICO)
const png64 = await sharp(Buffer.from(svg(false)), { density: 96 }).resize(64, 64).png().toBuffer();
const ico = Buffer.concat([
  Buffer.from([0, 0, 1, 0, 1, 0, 64, 64, 0, 0, 1, 0, 32, 0]),
  Buffer.from(new Uint32Array([png64.length, 22]).buffer),
  png64,
]);
writeFileSync("src/app/favicon.ico", ico);
console.log("ok src/app/favicon.ico");
