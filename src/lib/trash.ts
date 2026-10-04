/**
 * Days an item stays in the Trash before the daily database job deletes it for
 * good. Must match the interval in supabase/trash-auto-purge.sql.
 */
export const TRASH_DAYS = 10;

/** When an item trashed at `deletedAt` will be deleted permanently. */
export function purgeDate(deletedAt: string): Date {
  return new Date(new Date(deletedAt).getTime() + TRASH_DAYS * 24 * 60 * 60 * 1000);
}
