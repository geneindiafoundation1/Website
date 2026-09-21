import Link from "next/link";
import { notFound } from "next/navigation";
import { SetupNotice } from "../../SetupNotice";
import { NoPermission } from "../../NoPermission";
import { saveMember } from "../../actions";
import { ImageUpload } from "../../ImageUpload";
import { canEdit } from "@/lib/admin-role";
import { supabaseEnabled } from "@/lib/supabase/config";
import { getServerSupabase } from "@/lib/supabase/server";
import type { Member } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function MemberEditor({ params }: { params: Promise<{ id: string }> }) {
  if (!supabaseEnabled) return <SetupNotice />;
  if (!(await canEdit()))
    return <NoPermission what="add or edit team members" back="/admin/team" backLabel="Back to team" />;

  const { id } = await params;
  const isNew = id === "new";

  let member: Member | null = null;
  if (!isNew) {
    const supabase = await getServerSupabase();
    const { data } = await supabase!.from("team_members").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    member = data as Member;
  }

  return (
    <>
      <div className="admin-head">
        <h1>{isNew ? "Add team member" : "Edit team member"}</h1>
        <Link className="btn btn-ghost btn-sm" href="/admin/team">
          Back to team
        </Link>
      </div>

      <form action={saveMember} className="panel">
        {member ? <input type="hidden" name="id" value={member.id} /> : null}

        <div className="two">
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" required defaultValue={member?.name} />
          </div>
          <div className="field">
            <label htmlFor="role">Role</label>
            <input
              id="role"
              name="role"
              required
              placeholder="Director · Interventional Cardiology"
              defaultValue={member?.role}
            />
          </div>
        </div>

        <ImageUpload name="photo_url" label="Photo" required defaultValue={member?.photo_url ?? ""} />

        <div className="field">
          <label htmlFor="bio">Biography</label>
          <textarea id="bio" name="bio" required style={{ minHeight: 260 }} defaultValue={member?.bio} />
          <p className="hint">Leave a blank line between paragraphs.</p>
        </div>

        <div className="field">
          <label htmlFor="tags">Highlights (comma separated)</label>
          <input
            id="tags"
            name="tags"
            required
            placeholder="450+ papers, Padma Shri"
            defaultValue={member?.tags?.join(", ")}
          />
        </div>

        <div className="two">
          <div className="field">
            <label htmlFor="sort_order">Display order</label>
            <input
              id="sort_order"
              name="sort_order"
              required
              type="number"
              min={1}
              defaultValue={member?.sort_order ?? 99}
            />
          </div>
          <div className="field" style={{ justifyContent: "flex-end" }}>
            <label style={{ display: "flex", gap: ".55rem", alignItems: "center" }}>
              <input
                type="checkbox"
                name="published"
                defaultChecked={member?.published ?? true}
                style={{ width: "auto" }}
              />
              Show on the Team page
            </label>
          </div>
        </div>

        <button className="btn btn-primary btn-lg self-start" type="submit">
          {isNew ? "Add member" : "Save changes"}
        </button>
      </form>
    </>
  );
}
