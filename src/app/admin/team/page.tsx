import Link from "next/link";
import { SetupNotice } from "../SetupNotice";
import { deleteMember } from "../actions";
import { getTeam } from "@/lib/content";
import { supabaseEnabled } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default async function AdminTeam() {
  if (!supabaseEnabled) return <SetupNotice />;
  const team = await getTeam({ includeDrafts: true });

  return (
    <>
      <div className="admin-head">
        <h1>Team members</h1>
        <Link className="btn btn-primary btn-sm" href="/admin/team/new">
          Add member
        </Link>
      </div>

      <div className="rows">
        {team.length === 0 ? (
          <p className="empty">No team members yet.</p>
        ) : (
          team.map((member) => (
            <div className="row" key={member.id}>
              <div>
                <div className="row-title">{member.name}</div>
                <div className="hint">{member.role}</div>
              </div>
              <span className={member.published ? "pill live" : "pill"}>
                {member.published ? "Live" : "Hidden"}
              </span>
              <div style={{ display: "flex", gap: ".4rem" }}>
                <Link className="btn btn-ghost btn-sm" href={`/admin/team/${member.id}`}>
                  Edit
                </Link>
                <form action={deleteMember}>
                  <input type="hidden" name="id" value={member.id} />
                  <button className="btn btn-ghost btn-sm" type="submit">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
