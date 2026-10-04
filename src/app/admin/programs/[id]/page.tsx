import Link from "next/link";
import { notFound } from "next/navigation";
import { SetupNotice } from "../../SetupNotice";
import { saveProgram } from "../../actions";
import { ImageUpload } from "../../ImageUpload";
import { supabaseEnabled } from "@/lib/supabase/config";
import { getServerSupabase } from "@/lib/supabase/server";
import type { Program } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProgramEditor({ params }: { params: Promise<{ id: string }> }) {
  if (!supabaseEnabled) return <SetupNotice />;

  const { id } = await params;
  const isNew = id === "new";

  let program: Program | null = null;
  if (!isNew) {
    const supabase = await getServerSupabase();
    const { data } = await supabase!.from("programs").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    program = data as Program;
  }

  return (
    <>
      <div className="admin-head">
        <h1>{isNew ? "Add program" : "Edit program"}</h1>
        <Link className="btn btn-ghost btn-sm" href="/admin/programs">
          Back to programs
        </Link>
      </div>

      <form action={saveProgram} className="panel">
        {program ? <input type="hidden" name="id" value={program.id} /> : null}

        <div className="two">
          <div className="field">
            <label htmlFor="title">Program name</label>
            <input
              id="title"
              name="title"
              required
              placeholder="The Grand-Round Lecture Series"
              defaultValue={program?.title}
            />
          </div>
          <div className="field">
            <label htmlFor="eyebrow">Label above the name</label>
            <input
              id="eyebrow"
              name="eyebrow"
              required
              placeholder="Flagship program · Monthly lectures"
              defaultValue={program?.eyebrow}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="tagline">Tagline</label>
          <input
            id="tagline"
            name="tagline"
            required
            placeholder="Extraordinary journeys, in their own words."
            defaultValue={program?.tagline}
          />
        </div>

        <ImageUpload name="poster_url" label="Poster" required defaultValue={program?.poster_url ?? ""} />

        <div className="field">
          <label htmlFor="summary">Description</label>
          <textarea id="summary" name="summary" required style={{ minHeight: 200 }} defaultValue={program?.summary} />
          <p className="hint">Leave a blank line between paragraphs.</p>
        </div>

        <div className="field">
          <label htmlFor="details">Key details (one per line, optional)</label>
          <textarea
            id="details"
            name="details"
            style={{ minHeight: 110 }}
            placeholder={"When: Once a month\nWhere: Live on Zoom"}
            defaultValue={program?.details?.join("\n")}
          />
          <p className="hint">Write each line as &ldquo;Label: value&rdquo;.</p>
        </div>

        <div className="field">
          <label htmlFor="highlights">What participants gain (one per line, optional)</label>
          <textarea
            id="highlights"
            name="highlights"
            style={{ minHeight: 150 }}
            placeholder={"Navigate the big decisions: Subject choices, entrance exams, scholarships and admissions."}
            defaultValue={program?.highlights?.join("\n")}
          />
          <p className="hint">
            Write each line as &ldquo;Heading: description&rdquo;. They appear as a numbered list.
          </p>
        </div>

        <div className="field">
          <label htmlFor="tags">Tags (comma separated, optional)</label>
          <input
            id="tags"
            name="tags"
            placeholder="Scientists, Doctors, Engineers"
            defaultValue={program?.tags?.join(", ")}
          />
        </div>

        <div className="field">
          <label htmlFor="audience">Who will benefit most (optional)</label>
          <textarea
            id="audience"
            name="audience"
            style={{ minHeight: 80 }}
            defaultValue={program?.audience}
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
              defaultValue={program?.sort_order ?? 99}
            />
          </div>
          <div className="field" style={{ justifyContent: "flex-end" }}>
            <label style={{ display: "flex", gap: ".55rem", alignItems: "center" }}>
              <input
                type="checkbox"
                name="published"
                defaultChecked={program?.published ?? true}
                style={{ width: "auto" }}
              />
              Show on the website
            </label>
          </div>
        </div>

        <button className="btn btn-primary btn-lg self-start" type="submit">
          {isNew ? "Add program" : "Save changes"}
        </button>
      </form>
    </>
  );
}
