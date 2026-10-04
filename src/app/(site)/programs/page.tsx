import type { Metadata } from "next";
import Link from "next/link";
import { ProgramFeature } from "@/components/ProgramCard";
import { getPrograms } from "@/lib/content";

export const metadata: Metadata = {
  title: "Programs",
  description:
    "GENE-INDIA Foundation's flagship programs - the Grand-Round Lecture Series and Parents as Pathfinders, a family mentorship program.",
};

// Static until the admin panel changes its content (revalidatePath) - no timed rebuilds.
export const revalidate = false;

export default async function ProgramsPage() {
  const programs = await getPrograms();

  return (
    <>
      <div className="phead">
        <div className="wrap">
          <p className="eyebrow">What we run</p>
          <h1>Flagship programs</h1>
          <p className="lede">
            Volunteer-led programs that bring students, parents and accomplished professionals
            together, open to participants from every state and Union Territory of India.
          </p>
        </div>
      </div>

      <section className="wrap programs">
        {programs.length === 0 ? (
          <p className="lede">New programs are on the way. Check back soon.</p>
        ) : (
          programs.map((program) => <ProgramFeature key={program.id} program={program} />)
        )}
      </section>

      <div className="band">
        <section className="wrap band-split">
          <div>
            <h2 style={{ fontSize: "var(--step-2)" }}>Questions about a program?</h2>
            <p style={{ marginTop: ".5rem", maxWidth: "52ch" }}>
              Tell us which program you&rsquo;re interested in and we&rsquo;ll get back to you with
              dates and joining details.
            </p>
          </div>
          <Link prefetch={false} className="btn btn-primary btn-lg" href="/contact">
            Contact us
          </Link>
        </section>
      </div>
    </>
  );
}
