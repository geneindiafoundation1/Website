import Link from "next/link";
import { LogoFull } from "./Logo";
import { SocialIcon } from "./SocialIcon";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot">
          <div>
            {/* The full lockup carries the strapline itself, so it is not
                repeated as text underneath. */}
            <LogoFull className="logo-full foot-logo" width={200} />
            <p style={{ color: "var(--ink-soft)", fontSize: ".94rem", maxWidth: "38ch" }}>
              {site.tagline}. A volunteer-driven, apolitical and non-religious foundation mentoring
              students across India.
            </p>
            <ul className="social-row">
              {site.social.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    aria-label={s.label}
                    title={s.label}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <SocialIcon name={s.icon} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Explore</h4>
            <ul>
              {site.nav.slice(0, 4).map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Legal</h4>
            <ul>
              <li>
                <Link href="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms">Terms &amp; Conditions</Link>
              </li>
              <li>
                <Link href="/refund-policy">Refund &amp; Cancellation</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>Get involved</h4>
            <ul>
              <li>
                <Link href="/contact">Contact us</Link>
              </li>
              <li>
                <Link href="/contact">Volunteer as a mentor</Link>
              </li>
              <li>
                <Link href="/donate">Donate</Link>
              </li>
              <li>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="foot-bot">
          <span>
            © {new Date().getFullYear()} {site.legalName}. All rights reserved.
          </span>
          <span className="made-by">
            Made with
            <svg
              className="heart"
              viewBox="0 0 24 24"
              width="13"
              height="13"
              aria-label="love"
              role="img"
            >
              <path
                fill="currentColor"
                d="M12 21s-7.5-4.7-9.6-9.2C.7 8.2 2.5 4.5 6 3.7c2.2-.5 4.4.5 6 2.4 1.6-1.9 3.8-2.9 6-2.4 3.5.8 5.3 4.5 3.6 8.1C19.5 16.3 12 21 12 21Z"
              />
            </svg>
            by Altveen Technologies Pvt Ltd
          </span>
        </div>
      </div>
    </footer>
  );
}
