import { SetupNotice } from "../SetupNotice";
import { deleteMessage } from "../actions";
import { formatDateTime } from "@/lib/content";
import { canEdit } from "@/lib/admin-role";
import { supabaseEnabled } from "@/lib/supabase/config";
import { getServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  created_at: string;
};

export default async function AdminMessages() {
  if (!supabaseEnabled) return <SetupNotice />;

  const supabase = await getServerSupabase();
  const { data } = await supabase!
    .from("messages")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    // Tie-break so rows sharing a timestamp keep a fixed order between loads.
    .order("id", { ascending: false })
    .limit(100);
  const rows = (data ?? []) as Row[];
  const editable = await canEdit();

  return (
    <>
      <div className="admin-head">
        <h1>Messages</h1>
        <p className="hint">Newest first - latest 100 from the contact form</p>
      </div>

      <div className="rows">
        {rows.length === 0 ? (
          <p className="empty">No messages yet.</p>
        ) : (
          rows.map((row) => (
            <div key={row.id} style={{ padding: "1.1rem", borderBottom: "1px solid var(--line)" }}>
              <div className="meta" style={{ marginBottom: ".4rem" }}>
                <span>{row.topic}</span>
                <span>·</span>
                <span>{formatDateTime(row.created_at)}</span>
              </div>
              <div className="row-title">
                {row.name} -{" "}
                <a href={`mailto:${row.email}`} className="mono">
                  {row.email}
                </a>
              </div>
              <p style={{ color: "var(--ink-soft)", marginTop: ".5rem", whiteSpace: "pre-wrap" }}>
                {row.message}
              </p>
              {editable ? (
                <form action={deleteMessage} style={{ marginTop: ".7rem" }}>
                  <input type="hidden" name="id" value={row.id} />
                  <button className="btn btn-ghost btn-sm" type="submit">
                    Delete message
                  </button>
                </form>
              ) : null}
            </div>
          ))
        )}
      </div>
    </>
  );
}
