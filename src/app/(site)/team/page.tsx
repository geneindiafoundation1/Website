import type { Metadata } from "next";
import Link from "next/link";
import { FieldGlyph } from "@/components/FieldGlyph";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { glyphFor } from "@/lib/field-glyph";
import { getTeam } from "@/lib/content";

export const metadata: Metadata = {
  title: "Team",
  description:
    "The directors and volunteers guiding GENE-INDIA Foundation - professionals from medicine and science.",
};

export const revalidate = 60;

function initials(name: string) {
  return name
    .replace(/^(Padma Shri|Dr\.|Mr\.|Ms\.|Mrs\.|Prof\.)\s*/gi, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default async function TeamPage() {
  const team = await getTeam();

  return (
    <>
      <div className="phead">
        <div className="wrap">
          <p className="eyebrow">The people</p>
          <h1>Directors</h1>
          <p className="lede">
            GENE-INDIA Foundation is guided by professionals from medicine and science who give their
            time because they remember what it felt like to need guidance and not find it.
          </p>
        </div>
      </div>

      <section className="wrap" style={{ paddingTop: 0 }}>
        {team.map((member) => (
          <article className="person" key={member.id} data-reveal>
            <div className="person-head">
              <h3>{member.name}</h3>
              <p className="role">{member.role}</p>
              {member.tags?.length ? (
                <div className="tags">
                  {member.tags.map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="person-media">
              <div className="avatar" aria-hidden={!member.photo_url}>
                {member.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.photo_url} alt={member.name} loading="lazy" />
                ) : (
                  initials(member.name)
                )}
              </div>
              <FieldGlyph kind={glyphFor(member.role, member.tags)} />
            </div>

            <div className="person-body">
              <div className="prose">
                {member.bio
                  .split(/\n\s*\n/)
                  .map((para) => para.trim())
                  .filter(Boolean)
                  .map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
              </div>
            </div>

            {member.video ? (
              <YouTubeEmbed videoId={member.video.id} title={member.video.title} />
            ) : null}
          </article>
        ))}
      </section>

      <div className="band">
        <section className="wrap band-split" data-reveal>
          <div>
            <h2 style={{ fontSize: "var(--step-2)" }}>Mentor a student</h2>
            <p style={{ marginTop: ".5rem", maxWidth: "52ch" }}>
              Every program we run is delivered by volunteers with hands-on professional expertise.
              If that sounds like you, we&rsquo;d like to hear from you.
            </p>
          </div>
          <Link className="btn btn-primary btn-lg" href="/contact">
            Volunteer with us
          </Link>
        </section>
      </div>
    </>
  );
}
