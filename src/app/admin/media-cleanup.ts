import type { getServerSupabase } from "@/lib/supabase/server";

type Supabase = NonNullable<Awaited<ReturnType<typeof getServerSupabase>>>;

const BUCKET = "media";
/** A file this new may belong to a form someone is still filling in. */
const GRACE_MS = 24 * 60 * 60 * 1000;

/** Every column that can point at an uploaded image. */
const IMAGE_COLUMNS = [
  { table: "posts", column: "cover_url" },
  { table: "team_members", column: "photo_url" },
  { table: "programs", column: "poster_url" },
] as const;

type StoredFile = { path: string; createdAt: number };

async function listFiles(supabase: Supabase, prefix = ""): Promise<StoredFile[]> {
  const { data, error } = await supabase.storage.from(BUCKET).list(prefix || undefined, {
    limit: 1000,
    sortBy: { column: "name", order: "asc" },
  });
  if (error) throw new Error(`listing ${prefix || "media"}: ${error.message}`);

  const files: StoredFile[] = [];
  for (const item of data ?? []) {
    const path = prefix ? `${prefix}/${item.name}` : item.name;
    // Supabase's marker for an empty folder - not an image.
    if (item.name === ".emptyFolderPlaceholder") continue;
    // Folders come back without an id.
    if (item.id) files.push({ path, createdAt: Date.parse(item.created_at ?? "") || Date.now() });
    else files.push(...(await listFiles(supabase, path)));
  }
  return files;
}

/** ".../storage/v1/object/public/media/poster_url/abc.webp" → "poster_url/abc.webp" */
function storagePath(url: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const at = url.indexOf(marker);
  return at === -1 ? null : decodeURIComponent(url.slice(at + marker.length).split("?")[0]);
}

/**
 * Deletes uploaded images that nothing uses any more - left behind when a photo
 * is replaced, an item is deleted forever, or an upload is abandoned - so the
 * free 1 GB of storage isn't slowly filled with orphans.
 *
 * Kept: anything referenced by any row, trashed rows included (they can still
 * be restored), each one's ".thumb.webp" companion, and anything uploaded in the
 * last 24 hours. If any lookup fails, nothing is deleted.
 */
export async function removeUnusedImages(supabase: Supabase): Promise<number> {
  const keep = new Set<string>();
  for (const { table, column } of IMAGE_COLUMNS) {
    const { data, error } = await supabase.from(table).select(column).not(column, "is", null);
    if (error) throw new Error(`reading ${table}: ${error.message}`);
    for (const row of (data ?? []) as unknown as Record<string, string>[]) {
      const path = storagePath(row[column]);
      if (!path) continue;
      keep.add(path);
      keep.add(path.replace(/\.[a-z0-9]+$/i, ".thumb.webp"));
    }
  }

  const cutoff = Date.now() - GRACE_MS;
  const unused = (await listFiles(supabase))
    .filter((file) => !keep.has(file.path) && file.createdAt < cutoff)
    .map((file) => file.path);

  for (let i = 0; i < unused.length; i += 100) {
    const { error } = await supabase.storage.from(BUCKET).remove(unused.slice(i, i + 100));
    if (error) throw new Error(`removing images: ${error.message}`);
  }
  return unused.length;
}
