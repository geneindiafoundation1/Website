import Link from "next/link";
import { SetupNotice } from "../SetupNotice";
import { deleteProgram } from "../actions";
import { supabaseEnabled } from "@/lib/supabase/config";
import { selectLive } from "@/lib/supabase/live";
import { getServerSupabase } from "@/lib/supabase/server";
import type { Program } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPrograms() {
  if (!supabaseEnabled) return <SetupNotice />;

  // Read the table directly rather than through getPrograms, so a missing
  // table shows a setup message instead of the seed programs (which can't be edited).
  const supabase = await getServerSupabase();
  const { data: programs, error } = await selectLive<Program>(async (filterTrashed) => {
    let query = supabase!.from("programs").select("*");
    if (filterTrashed) query = query.is("deleted_at", null);
    return query.order("sort_order", { ascending: true });
  });

  return (
    <>
      <div className="admin-head">
        <h1>Programs</h1>
        <Link className="btn btn-primary btn-sm" href="/admin/programs/new">
          Add program
        </Link>
      </div>

      {error ? (
        <div className="notice err">
          The programs table has not been created yet. Run{" "}
          <code className="mono">supabase/programs.sql</code> in the Supabase SQL editor, then reload
          this page. Until then the website shows the two built-in flagship programs.
        </div>
      ) : null}

      <div className="rows">
        {error ? null : programs.length === 0 ? (
          <p className="empty">No programs yet.</p>
        ) : (
          programs.map((program) => (
            <div className="row" key={program.id}>
              <div>
                <div className="row-title">{program.title}</div>
                <div className="hint">{program.eyebrow}</div>
              </div>
              <span className={program.published ? "pill live" : "pill"}>
                {program.published ? "Live" : "Hidden"}
              </span>
              <div style={{ display: "flex", gap: ".4rem" }}>
                <Link className="btn btn-ghost btn-sm" href={`/admin/programs/${program.id}`}>
                  Edit
                </Link>
                <form action={deleteProgram}>
                  <input type="hidden" name="id" value={program.id} />
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
