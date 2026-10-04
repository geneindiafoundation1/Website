import Link from "next/link";
import { splitLine } from "@/lib/content";
import { responsiveSrcSet, thumbUrl } from "@/lib/thumb";
import type { Program } from "@/lib/types";

/** Compact card for the home page; links to the program's block on /programs. */
export function ProgramCard({ program }: { program: Program }) {
  return (
    <Link prefetch={false} className="program-card" href={`/programs#${program.slug}`}>
      <div className="program-thumb">
        {program.poster_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbUrl(program.poster_url)} alt={`${program.title} poster`} loading="lazy" />
        ) : null}
      </div>
      <div className="program-card-body">
        <p className="eyebrow">{program.eyebrow}</p>
        <h3>{program.title}</h3>
        <p className="program-tagline">{program.tagline}</p>
        {program.details.length ? (
          <p className="program-facts">
            {program.details.map((line) => splitLine(line).value).join(" · ")}
          </p>
        ) : null}
        <span className="program-more">Learn more</span>
      </div>
    </Link>
  );
}

/** Full program block for the /programs page. */
export function ProgramFeature({ program }: { program: Program }) {
  return (
    <article className="program" id={program.slug}>
      <div className="program-poster">
        {program.poster_url ? (
          <a href={program.poster_url} target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={program.poster_url}
              srcSet={responsiveSrcSet(program.poster_url, 600, 1000)}
              sizes="(max-width: 760px) min(92vw, 480px), 470px"
              alt={`${program.title} poster`}
              loading="lazy"
            />
          </a>
        ) : null}
      </div>

      <div className="program-copy">
        <p className="eyebrow">{program.eyebrow}</p>
        <h2>{program.title}</h2>
        {program.tagline ? <p className="program-tagline">{program.tagline}</p> : null}

        <div className="prose">
          {program.summary
            .split(/\n\s*\n/)
            .map((para) => para.trim())
            .filter(Boolean)
            .map((para, i) => (
              <p key={i}>{para}</p>
            ))}
        </div>

        {program.tags.length ? (
          <div className="tags">
            {program.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {program.details.length ? (
          <div className="info-list">
            {program.details.map((line) => {
              const { label, value } = splitLine(line);
              return (
                <div key={line}>
                  <span>{label || "Details"}</span>
                  <span>{value}</span>
                </div>
              );
            })}
          </div>
        ) : null}

        {program.highlights.length ? (
          <>
            <p className="eyebrow">What you&rsquo;ll gain</p>
            <ol className="program-gains">
              {program.highlights.map((line) => {
                const { label, value } = splitLine(line);
                return (
                  <li key={line}>
                    {label ? <strong>{label}</strong> : null}
                    <span>{value}</span>
                  </li>
                );
              })}
            </ol>
          </>
        ) : null}

        {program.audience ? (
          <div className="flag">
            <strong>Who will benefit most:</strong> {program.audience}
          </div>
        ) : null}
      </div>
    </article>
  );
}
