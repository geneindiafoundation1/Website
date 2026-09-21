import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { SocialIcon } from "@/components/SocialIcon";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with GENE-INDIA Foundation - for mentorship, volunteering, partnerships, or donation queries.",
};

export default function ContactPage() {
  return (
    <>
      <div className="phead">
        <div className="wrap">
          <p className="eyebrow">Get in touch</p>
          <h1>Contact us</h1>
          <p className="lede">
            Whether you&rsquo;re a student looking for mentorship, a professional who wants to
            volunteer, or an organisation exploring a partnership - write to us.
          </p>
        </div>
      </div>

      <section className="wrap">
        <div className="cols" data-reveal>
          <div className="panel">
            <ContactForm />
          </div>

          <div className="stack">
            <div>
              <p className="eyebrow">Reach us directly</p>
              <div className="info-list" style={{ marginTop: ".8rem" }}>
                <div>
                  <span>Email</span>
                  <a href={`mailto:${site.email}`}>{site.email}</a>
                </div>
                {/* The registered address and a phone number are deliberately not published. */}
                {site.phone ? (
                  <div>
                    <span>Phone</span>
                    <span className="mono">{site.phone}</span>
                  </div>
                ) : null}
                <div>
                  <span>Hours</span>
                  <span>{site.hours}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="eyebrow">Follow the foundation</p>
              <div className="cta-row" style={{ marginTop: ".9rem" }}>
                {site.social.map((s) => (
                  <a
                    className="btn btn-ghost social-btn"
                    key={s.label}
                    href={s.href}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <SocialIcon name={s.icon} />
                    {s.label}
                  </a>
                ))}
              </div>
            </div>

            <p className="flag">
              GENE-INDIA Foundation is apolitical and non-religious. We welcome participants from
              every state and Union Territory of India.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
