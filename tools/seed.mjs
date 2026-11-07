// Siembra vendedores y productos en Supabase vía REST (service_role).
// Uso: SUPABASE_SERVICE_KEY=eyJ... node tools/seed.mjs /tmp/opencode/seed.json
import { readFileSync } from "node:fs";

const key = process.env.SUPABASE_SERVICE_KEY;
if (!key) throw new Error("Falta SUPABASE_SERVICE_KEY");
const base = "https://guptzbnzkprdrgilrdrx.supabase.co/rest/v1";
const seed = JSON.parse(readFileSync(process.argv[2], "utf8"));

async function post(tabla, fila) {
  const r = await fetch(`${base}/${tabla}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(fila),
  });
  const t = await r.text();
  return { status: r.status, body: t };
}

const mapa = {};
for (const v of seed.vendors) {
  const r = await post("vendedores", v);
  if (r.status >= 300 && !r.body.includes("duplicate")) {
    console.log("vendedor", v.slug, r.status, r.body.slice(0, 200));
  }
}
const lista = await fetch(`${base}/vendedores?select=id,slug`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});
for (const { id, slug } of await lista.json()) mapa[slug] = id;

for (const p of seed.prods) {
  const { vendedor_slug, ...resto } = p;
  const vendedor_id = mapa[vendedor_slug];
  if (!vendedor_id) { console.log("sin vendedor", p.slug); continue; }
  const r = await post("productos", { ...resto, vendedor_id });
  if (r.status >= 300 && !r.body.includes("duplicate")) {
    console.log("producto", p.slug, r.status, r.body.slice(0, 200));
  }
}

const c1 = await (await fetch(`${base}/vendedores?select=id`, { headers: { apikey: key, Authorization: `Bearer ${key}` } })).json();
const c2 = await (await fetch(`${base}/productos?select=id`, { headers: { apikey: key, Authorization: `Bearer ${key}` } })).json();
console.log(`REALES: ${c1.length} vendedores, ${c2.length} productos`);
