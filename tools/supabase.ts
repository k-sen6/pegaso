// Aplica el esquema y seeds en Supabase. Se ejecuta:
//   SUPABASE_DB_URL=... npx tsx tools/supabase.ts
// (La URL (con password) va SOLO en variable de entorno; nunca en el repo.)
import { readFileSync } from "node:fs";
import postgres from "postgres";
import { COOPERATIVAS, PRODUCTOS } from "../src/lib/mock/index";

async function main() {
  const url = process.env.SUPABASE_DB_URL;
  if (!url) throw new Error("Falta SUPABASE_DB_URL");

  const sql = postgres(url, { ssl: "require", prepare: false });

  const schema = readFileSync("supabase/migrations/0001_schema.sql", "utf8");
  await sql.unsafe(schema);
  console.log("esquema aplicado");

  const ids: Record<string, string> = {};
  for (const v of COOPERATIVAS) {
    const [row] = await sql`
      insert into public.vendedores (slug, nombre, sector, provincia, municipio, descripcion, verificacion)
      values (${v.slug}, ${v.nombre}, ${v.sector}, ${v.provincia}, ${v.municipio}, ${v.descripcion}, ${v.verificacion})
      on conflict (slug) do nothing
      returning id
    `;
    if (row) ids[v.slug] = row.id;
  }
  console.log(`vendedores: ${Object.keys(ids).length} insertados`);

  const existentes = await sql`select slug, id from public.vendedores`;
  for (const r of existentes) ids[r.slug] = r.id;

  const slugPorId = Object.fromEntries(COOPERATIVAS.map((v) => [v.id, v.slug]));
  let productos = 0;
  for (const p of PRODUCTOS) {
    const vendedorId = ids[slugPorId[p.cooperativaId]];
    if (!vendedorId) continue;
    const [row] = await sql`
      insert into public.productos (slug, nombre, descripcion, precio_cup, sector, destacado, hue, vendedor_id)
      values (${p.slug}, ${p.nombre}, ${p.descripcion}, ${p.precioCup}, ${p.sector}, ${p.destacado}, ${p.hue ?? 225}, ${vendedorId})
      on conflict (slug) do nothing
      returning id
    `;
    if (row) productos++;
  }
  console.log(`productos: ${productos} insertados`);

  const v = await sql`select count(*)::text as n from public.vendedores`;
  const pr = await sql`select count(*)::text as n from public.productos`;
  console.log(`totales: ${v[0].n} vendedores, ${pr[0].n} productos`);

  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
