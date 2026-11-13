// Genera iconos adaptativos, legacy y splash de Android desde la marca Pegaso.
// Uso: node tools/iconos-android.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const GLIFO = `
<g fill="none" stroke="#ffffff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
  <path d="M11 6v13.2"/>
  <path d="M11 6h4.5a3.55 3.55 0 0 1 0 7.1H11"/>
  <path d="M2.6 7.2c3.2-2.3 6-2.9 7.8-1.4 1.7 1.3 1 3.1-.5 4.2-1.3.9-2.7.8-4.4-.3"/>
  <path d="M2.6 7.2l2.4 2.4-1.4 1.8"/>
</g>`;

const DEFS = `<defs>
<linearGradient id="g" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
  <stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#0284c7"/>
</linearGradient>
</defs>`;

function iconoLegacy() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${DEFS}
    <rect width="24" height="24" rx="5.4" fill="url(#g)"/>
    <g transform="translate(2.6 2.6) scale(0.78)">${GLIFO}</g>
  </svg>`;
}

function iconoAdaptativo() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="108" height="108" viewBox="0 0 108 108">
    <g transform="translate(31 31) scale(1.92)">${GLIFO}</g>
  </svg>`;
}

function splash(ancho, alto) {
  const lado = Math.round(Math.min(ancho, alto) * 0.30);
  const x = (ancho - lado) / 2;
  const y = (alto - lado) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${alto}" viewBox="0 0 ${ancho} ${alto}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#0284c7"/>
      </linearGradient>
      <radialGradient id="brillo" cx="50%" cy="50%" r="50%">
        <stop offset="0" stop-color="#0ea5e9" stop-opacity="0.30"/>
        <stop offset="1" stop-color="#020617" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${ancho}" height="${alto}" fill="#020617"/>
    <circle cx="${ancho / 2}" cy="${alto / 2}" r="${lado * 1.15}" fill="url(#brillo)"/>
    <g transform="translate(${x} ${y}) scale(${lado / 24})">
      <rect width="24" height="24" rx="5.4" fill="url(#g)"/>
      <g transform="translate(2.6 2.6) scale(0.78)">${GLIFO}</g>
    </g>
  </svg>`;
}

async function png(svg, ancho, alto, ruta, fondo = null) {
  mkdirSync(ruta.slice(0, ruta.lastIndexOf("/")), { recursive: true });
  let img = sharp(Buffer.from(svg)).resize(ancho, alto);
  if (fondo) img = img.flatten({ background: fondo });
  const buf = await img.png({ compressionLevel: 9 }).toBuffer();
  writeFileSync(ruta, buf);
}

const DENSIDADES = [
  ["mdpi", 1],
  ["hdpi", 1.5],
  ["xhdpi", 2],
  ["xxhdpi", 3],
  ["xxxhdpi", 4],
];

const base = "android/app/src/main/res";

for (const [dens, factor] of DENSIDADES) {
  const legacy = Math.round(48 * factor);
  await png(iconoLegacy(), legacy, legacy, `${base}/mipmap-${dens}/ic_launcher.png`);
  await png(iconoLegacy(), legacy, legacy, `${base}/mipmap-${dens}/ic_launcher_round.png`);
  const fg = Math.round(108 * factor);
  await png(iconoAdaptativo(), fg, fg, `${base}/mipmap-${dens}/ic_launcher_foreground.png`);
}

// Splash legacy: mismas medidas que la plantilla de Capacitor.
const SPLASH = {
  mdpi: [320, 480],
  hdpi: [480, 800],
  xhdpi: [720, 1280],
  xxhdpi: [960, 1600],
  xxxhdpi: [1280, 1920],
};

for (const [dens, [w, h]] of Object.entries(SPLASH)) {
  await png(splash(w, h), w, h, `${base}/drawable-port-${dens}/splash.png`);
  await png(splash(h, w), h, w, `${base}/drawable-land-${dens}/splash.png`);
}

await png(splash(1080, 1920), 1080, 1920, `${base}/drawable/splash.png`);
await png(splash(512, 512), 512, 512, `${base}/drawable/splash_logo.png`);

// Icono adaptativo: fondo degradado + glifo blanco.
writeFileSync(
  `${base}/drawable/ic_launcher_background.xml`,
  `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">
  <gradient android:angle="315" android:startColor="#38bdf8" android:endColor="#0284c7"/>
</shape>
`
);

for (const nombre of ["ic_launcher.xml", "ic_launcher_round.xml"]) {
  writeFileSync(
    `${base}/mipmap-anydpi-v26/${nombre}`,
    `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
  <background android:drawable="@drawable/ic_launcher_background"/>
  <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`
  );
}

console.log("ok iconos y splash de Android");
