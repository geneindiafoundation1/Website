/**
 * Snapshot of the live Supabase data. Free-plan projects have no restore-able
 * backups, so we dump the tables ourselves.
 *
 * Add SUPABASE_SERVICE_ROLE_KEY to .env.local (Project Settings → API), then:
 *
 *   npm run backup
 *
 * Writes backups/YYYY-MM-DD/database.json plus any files from the media bucket.
 * Keep that folder private — it contains messages and donation details.
 */

import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const TABLES = [
  "posts",
  "team_members",
  "messages",
  "donations",
  "activity_log",
  "admins",
];

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

async function fetchAll(supabase, table) {
  const pageSize = 1000;
  const rows = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .range(from, from + pageSize - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...(data || []));
    if (!data || data.length < pageSize) break;
  }
  return rows;
}

async function listMedia(supabase, prefix = "") {
  const { data, error } = await supabase.storage.from("media").list(prefix || undefined, {
    limit: 1000,
    sortBy: { column: "name", order: "asc" },
  });
  if (error) {
    console.warn("storage list skipped:", error.message);
    return [];
  }
  const files = [];
  for (const item of data || []) {
    const full = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id) files.push(full);
    else files.push(...(await listMedia(supabase, full)));
  }
  return files;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
        "Add the service_role key from Supabase → Project Settings → API to .env.local.",
    );
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const stamp = new Date().toISOString().slice(0, 10);
  const dir = path.join(root, "backups", stamp);
  await mkdir(dir, { recursive: true });

  const dump = {
    taken_at: new Date().toISOString(),
    tables: {},
    media: [],
  };

  for (const table of TABLES) {
    dump.tables[table] = await fetchAll(supabase, table);
    console.log(`${table}: ${dump.tables[table].length} rows`);
  }

  dump.media = await listMedia(supabase);
  if (dump.media.length) {
    const mediaDir = path.join(dir, "media");
    await mkdir(mediaDir, { recursive: true });
    for (const objectPath of dump.media) {
      const { data, error } = await supabase.storage.from("media").download(objectPath);
      if (error || !data) {
        console.warn("skip media", objectPath, error?.message);
        continue;
      }
      const dest = path.join(mediaDir, objectPath);
      await mkdir(path.dirname(dest), { recursive: true });
      await writeFile(dest, Buffer.from(await data.arrayBuffer()));
    }
  }
  console.log(`media: ${dump.media.length} files`);

  const jsonPath = path.join(dir, "database.json");
  await writeFile(jsonPath, JSON.stringify(dump, null, 2));
  console.log(`Wrote ${path.relative(root, jsonPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
