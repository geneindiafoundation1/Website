import type { Metadata } from "next";
import Link from "next/link";
import { DonorForm } from "@/components/DonorForm";
import { UpiQr } from "@/components/UpiQr";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Donate to GENE-INDIA Foundation by bank transfer or UPI. No payment gateway means zero transaction fees - 100% of your donation reaches the foundation.",
};

export default function DonatePage() {
  const { bank } = site;

  return (
    <>
      <div className="phead">
        <div className="wrap">
          <p className="eyebrow">Support the cause</p>
          <h1>100% of your donation reaches the foundation</h1>
          <p className="lede">
            Donations go directly to the foundation&rsquo;s bank account or UPI. There is no payment
            gateway and no card handling, which means zero transaction fees.
          </p>
        </div>
      </div>

      <section className="wrap">
        <div className="cols" data-reveal>
          <div>
            <p className="eyebrow">Step 1 - Send your contribution</p>
            <h2 style={{ fontSize: "var(--step-2)", marginBlock: ".7rem 1.2rem" }}>
              {bank.ready ? "Bank transfer or UPI" : "Coming shortly"}
            </h2>
            {bank.ready ? (
              <div className="panel">
                <div className="info-list">
                  <div>
                    <span>Account name</span>
                    <span>{bank.accountName}</span>
                  </div>
                  <div>
                    <span>Account no.</span>
                    <span className="mono">{bank.accountNumber}</span>
                  </div>
                  <div>
                    <span>IFSC</span>
                    <span className="mono">{bank.ifsc}</span>
                  </div>
                  <div>
                    <span>Bank &amp; branch</span>
                    <span>{bank.bank}</span>
                  </div>
                  <div>
                    <span>UPI ID</span>
                    <span className="mono">{bank.upi}</span>
                  </div>
                </div>
                <UpiQr />
              </div>
            ) : (
              /* No placeholder account numbers are ever published - see site.bank.ready. */
              <div className="panel">
                <div className="notice">
                  <p>
                    <strong>Our donation account is being opened.</strong>
                  </p>
                  <p style={{ marginTop: ".6rem" }}>
                    The foundation&rsquo;s bank account and UPI ID will be published here as soon as
                    they are active. Until then, please write to us and we will get back to you
                    personally about how to contribute.
                  </p>
                </div>
                <div className="cta-row" style={{ marginTop: "1.2rem" }}>
                  <a className="btn btn-primary" href={`mailto:${site.email}`}>
                    Email {site.email}
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="panel sticky" hidden={!bank.ready}>
            <p className="eyebrow">Step 2 - Tell us it&rsquo;s you</p>
            <h2 style={{ fontSize: "var(--step-1)", marginBlock: ".6rem .4rem" }}>Donor details</h2>
            <p className="hint" style={{ marginBottom: "1.2rem" }}>
              After paying, fill this in so we can thank you and issue a receipt.
            </p>
            <DonorForm />
          </div>
        </div>
      </section>

      <hr className="rule" />

      <section className="wrap">
        <div className="grid-3 stagger" data-reveal>
          <div className="card">
            <h3>Zero fees</h3>
            <p>
              No payment gateway means no transaction charges - the foundation keeps every rupee you
              give.
            </p>
          </div>
          <div className="card">
            <h3>Self-reported, then verified</h3>
            <p>
              Your form triggers a thank-you email immediately. Each amount is verified against the
              bank statement before {site.legal.reg80G ? "any official 80G receipt" : "a receipt"} is
              issued.
            </p>
          </div>
          <div className="card">
            <h3>Where it goes</h3>
            <p>Directly into running volunteer-led mentorship programs for students across India.</p>
          </div>
        </div>

        <p className="hint donate-legal">
          We accept donations from Indian banks, with an undertaking that the donation is being made
          by an individual on his/her behalf. We do not accept donations from foreign banking
          institutions, and we may refuse a donation after due diligence. Please read our{" "}
          <Link href="/refund-policy">Refund &amp; Cancellation Policy</Link> and{" "}
          <Link href="/terms">Terms &amp; Conditions</Link> before donating.
        </p>
      </section>
    </>
  );
}
