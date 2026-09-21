/**
 * Poke the live database so a free-plan Supabase project does not pause.
 * Inactive projects freeze after seven days with no traffic.
 *
 *   npm run keep-alive
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL and a key (service_role preferred; the
 * publishable/anon key is enough because this only reads one published row).
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(path.join(root, ".env.local"));
loadEnvFile(path.join(root, ".env"));

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(
  /\/$/,
  "",
);
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL, and a key (SUPABASE_SERVICE_ROLE_KEY or the publishable key).",
  );
  process.exit(1);
}

const endpoint = `${url}/rest/v1/posts?select=id&limit=1`;
const response = await fetch(endpoint, {
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    Accept: "application/json",
  },
});

if (!response.ok) {
  const body = await response.text();
  console.error(`Keep-alive failed: ${response.status} ${body}`);
  process.exit(1);
}

const rows = await response.json();
console.log(`Database awake. Read ${Array.isArray(rows) ? rows.length : 0} post row(s).`);
