// Aplica todas las migraciones SQL de supabase/migrations en orden. Se ejecuta:
//   SUPABASE_DB_URL=postgres://... npx tsx tools/supabase.ts
// (La URL con password va SOLO en variable de entorno; nunca en el repo.)
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import postgres from "postgres";

async function main() {
  const url = process.env.SUPABASE_DB_URL;
  if (!url) throw new Error("Falta SUPABASE_DB_URL");

  const sql = postgres(url, { ssl: "require", prepare: false });
  const dir = join(process.cwd(), "supabase", "migrations");
  const archivos = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const archivo of archivos) {
    const contenido = readFileSync(join(dir, archivo), "utf8");
    await sql.unsafe(contenido);
    console.log(`aplicado: ${archivo}`);
  }

  await sql.end();
  console.log("migraciones completas");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
