import { SetupNotice } from "../SetupNotice";
import { formatDateTime } from "@/lib/content";
import { supabaseEnabled } from "@/lib/supabase/config";
import { getServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Entry = {
  id: number;
  actor_email: string | null;
  action: string;
  entity: string;
  label: string | null;
  changes: Record<string, { from: string; to: string }> | null;
  created_at: string;
};

const ENTITY_NAMES: Record<string, string> = {
  posts: "blog post",
  team_members: "team member",
  messages: "message",
  donations: "donation",
};

const ACTION_WORDS: Record<string, string> = {
  created: "created",
  updated: "edited",
  trashed: "moved to trash",
  restored: "restored",
  purged: "permanently deleted",
};

export default async function AdminActivity() {
  if (!supabaseEnabled) return <SetupNotice />;

  const supabase = await getServerSupabase();
  const { data, error } = await supabase!
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(200);

  const entries = (data ?? []) as Entry[];

  return (
    <>
      <div className="admin-head">
        <h1>Activity</h1>
        <p className="hint">Every change made by a signed-in member, most recent first</p>
      </div>

      {error ? (
        <div className="notice err">
          The activity log isn&rsquo;t set up yet. Run{" "}
          <code className="mono">supabase/audit-and-trash.sql</code> in the Supabase SQL editor.
        </div>
      ) : null}

      <div className="rows">
        {entries.length === 0 && !error ? (
          <p className="empty">No activity recorded yet.</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} style={{ padding: "1.1rem", borderBottom: "1px solid var(--line)" }}>
              <div className="meta" style={{ marginBottom: ".35rem" }}>
                <span>{formatDateTime(entry.created_at)}</span>
                <span>·</span>
                <span>{entry.actor_email || "unknown account"}</span>
              </div>
              <div className="row-title">
                {ACTION_WORDS[entry.action] || entry.action}{" "}
                {ENTITY_NAMES[entry.entity] || entry.entity}
                {entry.label ? ` - ${entry.label}` : ""}
              </div>

              {entry.changes ? (
                <ul className="changes">
                  {Object.entries(entry.changes).map(([field, diff]) => (
                    <li key={field}>
                      <span className="field">{field.replace(/_/g, " ")}</span>
                      <span className="from">{diff.from || "(empty)"}</span>
                      <span aria-hidden="true">→</span>
                      <span className="to">{diff.to || "(empty)"}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))
        )}
      </div>
    </>
  );
}
