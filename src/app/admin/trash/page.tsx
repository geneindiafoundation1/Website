import { SetupNotice } from "../SetupNotice";
import { NoPermission } from "../NoPermission";
import { restoreItem } from "../actions";
import { canEdit } from "@/lib/admin-role";
import { formatDateTime } from "@/lib/content";
import { supabaseEnabled } from "@/lib/supabase/config";
import { getServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Trashed = {
  id: string;
  label: string;
  table: "posts" | "team_members" | "messages" | "donations";
  kind: string;
  deleted_at: string;
};

const SOURCES = [
  { table: "posts" as const, kind: "Blog post", label: "title" },
  { table: "team_members" as const, kind: "Team member", label: "name" },
  { table: "messages" as const, kind: "Message", label: "name" },
  { table: "donations" as const, kind: "Donation", label: "name" },
];

export default async function AdminTrash() {
  if (!supabaseEnabled) return <SetupNotice />;
  if (!(await canEdit())) return <NoPermission what="see the trash" />;

  const supabase = await getServerSupabase();

  const groups = await Promise.all(
    SOURCES.map(async (source) => {
      const { data } = await supabase!
        .from(source.table)
        .select(`id, ${source.label}, deleted_at`)
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false })
        .limit(100);

      return (data ?? []).map((row) => {
        const record = row as unknown as Record<string, string>;
        return {
          id: record.id,
          label: record[source.label] || "(untitled)",
          table: source.table,
          kind: source.kind,
          deleted_at: record.deleted_at,
        } satisfies Trashed;
      });
    }),
  );

  const items = groups
    .flat()
    .sort((a, b) => (a.deleted_at < b.deleted_at ? 1 : -1));

  return (
    <>
      <div className="admin-head">
        <h1>Trash</h1>
        <p className="hint">Deleted items are kept here and can be restored</p>
      </div>

      <div className="rows">
        {items.length === 0 ? (
          <p className="empty">Nothing in the trash.</p>
        ) : (
          items.map((item) => (
            <div className="row" key={`${item.table}-${item.id}`}>
              <div>
                <div className="row-title">{item.label}</div>
                <div className="hint">
                  {item.kind} · deleted {formatDateTime(item.deleted_at)}
                </div>
              </div>
              <span className="pill">Deleted</span>
              <div style={{ display: "flex", gap: ".4rem" }}>
                <form action={restoreItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="table" value={item.table} />
                  <button className="btn btn-ghost btn-sm" type="submit">
                    Restore
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>

      {items.length > 0 ? (
        <p className="hint" style={{ marginTop: "1rem" }}>
          Items stay here indefinitely and can always be restored. Nothing is ever permanently
          removed from the admin panel.
        </p>
      ) : null}
    </>
  );
}
