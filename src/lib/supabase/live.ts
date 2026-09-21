function missingDeletedAt(error: { code?: string; message?: string } | null | undefined) {
  if (!error) return false;
  const message = error.message ?? "";
  return error.code === "42703" || message.includes("deleted_at");
}

/**
 * Prefer live (not trashed) rows. If `audit-and-trash.sql` has not been run yet,
 * `deleted_at` is missing and we fall back to an unfiltered read so lists are
 * not silently empty.
 */
export async function selectLive<T>(
  query: (
    filterTrashed: boolean,
  ) => PromiseLike<{ data: T[] | null; error: { code?: string; message?: string } | null }>,
): Promise<{ data: T[]; error: { code?: string; message?: string } | null }> {
  const first = await query(true);
  if (!first.error) return { data: first.data ?? [], error: null };
  if (!missingDeletedAt(first.error)) return { data: [], error: first.error };

  const second = await query(false);
  return { data: second.data ?? [], error: second.error };
}

export { missingDeletedAt };
