import { SetupNotice } from "../SetupNotice";
import { deleteMessage } from "../actions";
import { formatDateTime } from "@/lib/content";
import { canEdit } from "@/lib/admin-role";
import { supabaseEnabled } from "@/lib/supabase/config";
import { selectLive } from "@/lib/supabase/live";
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
  const { data: rows, error } = await selectLive<Row>(async (filterTrashed) => {
    let query = supabase!.from("messages").select("*");
    if (filterTrashed) query = query.is("deleted_at", null);
    return query
      .order("created_at", { ascending: false })
      // Tie-break so rows sharing a timestamp keep a fixed order between loads.
      .order("id", { ascending: false })
      .limit(100);
  });
  if (error) console.error("admin messages:", error.message);
  const editable = await canEdit();

  return (
    <>
      <div className="admin-head">
        <h1>Messages</h1>
        <p className="hint">Newest first - latest 100 from the contact form</p>
      </div>

      <div className="rows">
        {error ? (
          <p className="empty">Could not load messages. Refresh and try again.</p>
        ) : rows.length === 0 ? (
          <p className="empty">No messages yet.</p>
        ) : (
          rows.map((row) => (
            <details key={row.id} open className="message-item">
              <summary>
                <div className="meta" style={{ marginBottom: ".35rem" }}>
                  <span>{row.topic}</span>
                  <span>·</span>
                  <span>{formatDateTime(row.created_at)}</span>
                </div>
                <div className="row-title">
                  {row.name} - <span className="mono">{row.email}</span>
                </div>
              </summary>
              <p className="message-body">
                {row.message?.trim() ? row.message : "No message text was saved with this enquiry."}
              </p>
              <p className="hint" style={{ marginTop: ".45rem" }}>
                <a href={`mailto:${row.email}`}>Reply to {row.email}</a>
              </p>
              {editable ? (
                <form action={deleteMessage} style={{ marginTop: ".7rem" }}>
                  <input type="hidden" name="id" value={row.id} />
                  <button className="btn btn-ghost btn-sm" type="submit">
                    Delete message
                  </button>
                </form>
              ) : null}
            </details>
          ))
        )}
      </div>
    </>
  );
}
