// Genera un snapshot del catálogo para el primer arranque sin red.
// Uso: node tools/snapshot-catalogo.mjs
// Escribe public/data/catalogo.json (se copia a out/ en el build).
import { mkdirSync, writeFileSync } from "node:fs";

const URL_BASE =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://guptzbnzkprdrgilrdrx.supabase.co";
const ANON =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1cHR6Ym56a3ByZHJnaWxyZHJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwMTc0NDcsImV4cCI6MjEwOTU5MzQ0N30.-lIwFwPSCOp77QiiemTJL8PlR6fPaa3ir4-T-GnSpiE";

const SELECT =
  "id,slug,nombre,sector,provincia,municipio,descripcion,verificacion,foto_url,telefono,direccion,lat,lng,created_at," +
  "productos(id,slug,nombre,descripcion,precio_cup,sector,destacado,hue,vendedor_id,created_at," +
  "fotos(url,card_url,thumb_url,estado,created_at))";

function vacio() {
  return { ts: Date.now(), productos: [], vendedores: [], fotos: {} };
}

async function main() {
  let snap = vacio();
  try {
    const res = await fetch(
      `${URL_BASE}/rest/v1/vendedores?select=${encodeURIComponent(SELECT)}&order=nombre`,
      {
        headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
        signal: AbortSignal.timeout(15000),
      }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const filas = await res.json();

    const vendedores = [];
    const productos = [];
    const fotos = {};

    for (const v of filas) {
      vendedores.push({
        id: v.id,
        slug: v.slug,
        nombre: v.nombre,
        sector: v.sector,
        provincia: v.provincia,
        municipio: v.municipio,
        descripcion: v.descripcion,
        verificacion: v.verificacion,
        foto_url: v.foto_url,
        telefono: v.telefono ?? null,
        direccion: v.direccion ?? null,
        lat: v.lat ?? null,
        lng: v.lng ?? null,
        created_at: v.created_at,
      });

      for (const p of v.productos ?? []) {
        productos.push({
          id: p.id,
          slug: p.slug,
          nombre: p.nombre,
          descripcion: p.descripcion,
          precio_cup: p.precio_cup,
          sector: p.sector,
          destacado: p.destacado,
          hue: p.hue ?? 225,
          vendedor_id: p.vendedor_id,
          created_at: p.created_at,
        });

        const validas = (p.fotos ?? [])
          .filter((f) => f.url && f.estado === "sincronizada")
          .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
        const f = validas[0];
        if (f?.url) {
          fotos[p.id] = {
            thumb: f.thumb_url ?? f.url,
            card: f.card_url ?? f.url,
            full: f.url,
          };
        }
      }
    }

    productos.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    snap = { ts: Date.now(), productos, vendedores, fotos };
  } catch (e) {
    console.warn(`snapshot: sin datos (${e.message}); se usa vacío`);
  }

  mkdirSync("public/data", { recursive: true });
  writeFileSync("public/data/catalogo.json", JSON.stringify(snap));
  console.log(
    `ok public/data/catalogo.json (${snap.vendedores.length} vendedores, ${snap.productos.length} productos)`
  );
}

main();
