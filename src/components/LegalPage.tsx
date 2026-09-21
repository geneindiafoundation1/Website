import Link from "next/link";
import { site } from "@/lib/site";

/**
 * Shared shell for the privacy, terms, and refund pages - same page head,
 * same measure, same "last updated" line, so the three read as one set.
 *
 * Sections are numbered from the array rather than by hand, so inserting one
 * never leaves the numbering wrong.
 */

export type LegalSection = {
  heading: string;
  body: React.ReactNode;
};

export function LegalPage({
  eyebrow,
  title,
  intro,
  sections,
  closing,
}: {
  eyebrow: string;
  title: string;
  intro: React.ReactNode;
  sections: LegalSection[];
  closing?: React.ReactNode;
}) {
  return (
    <>
      <div className="phead">
        <div className="wrap">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="lede">{intro}</p>
          <p className="legal-updated">Last updated {site.legal.updated}</p>
        </div>
      </div>

      <section className="wrap legal">
        {sections.map((section, i) => (
          <section className="legal-sec" key={section.heading}>
            <h2>
              <span className="legal-n" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              {section.heading}
            </h2>
            <div className="prose">{section.body}</div>
          </section>
        ))}

        {closing ? <div className="flag legal-close">{closing}</div> : null}

        <p className="legal-foot">
          Questions about this policy? Email{" "}
          <a href={`mailto:${site.legal.contactEmail}`}>{site.legal.contactEmail}</a> or use the{" "}
          <Link href="/contact">contact form</Link>. See also our{" "}
          <Link href="/privacy">Privacy Policy</Link>, <Link href="/terms">Terms &amp; Conditions</Link>,
          and <Link href="/refund-policy">Refund &amp; Cancellation Policy</Link>.
        </p>
      </section>
    </>
  );
}

/** Renders a labelled line only when the underlying value has been filled in. */
export function LegalFact({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
