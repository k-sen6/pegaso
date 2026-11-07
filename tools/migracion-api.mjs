// Aplica SQL en Supabase vía Management API (token sbp_ personal).
// Uso: SUPABASE_MGMT_TOKEN=sbp_xxx node tools/migracion-api.mjs [archivo.sql]
import { readFileSync } from "node:fs";

const token = process.env.SUPABASE_MGMT_TOKEN;
if (!token) throw new Error("Falta SUPABASE_MGMT_TOKEN");
const REF = process.env.SUPABASE_REF ?? "guptzbnzkprdrgilrdrx";
const archivo = process.argv[2] ?? "supabase/migrations/0001_schema.sql";
const query = readFileSync(archivo, "utf8");

const r = await fetch(
  `https://api.supabase.com/v1/projects/${REF}/database/query`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query }),
  }
);
const texto = await r.text();
console.log(`HTTP ${r.status}`);
console.log(texto.slice(0, 900));
if (!r.ok) process.exit(1);
