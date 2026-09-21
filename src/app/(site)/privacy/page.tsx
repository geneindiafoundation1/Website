import type { Metadata } from "next";
import Link from "next/link";
import { LegalFact, LegalPage, type LegalSection } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How GENE-INDIA Foundation collects, uses, stores, and protects personal information submitted through this website.",
};

const { legal } = site;

const SECTIONS: LegalSection[] = [
  {
    heading: "Who we are",
    body: (
      <>
        <p>
          {site.legalName} (&ldquo;the Foundation&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) operates{" "}
          {site.url} and is responsible for the personal information described in this policy. We are
          a volunteer-driven, apolitical, and non-religious foundation that provides mentorship to
          students and young professionals across India.
        </p>
        <div className="info-list legal-facts">
          <LegalFact label="Entity type" value={legal.entityType} />
          <LegalFact label="Registration no." value={legal.registrationNumber} />
          <LegalFact label="PAN" value={legal.pan} />
          <LegalFact label="Registered office" value={legal.postalAddress} />
          <div>
            <span>Email</span>
            <span>
              <a href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a>
            </span>
          </div>
        </div>
      </>
    ),
  },
  {
    heading: "Information we collect",
    body: (
      <>
        <p>We only collect what you choose to send us. Specifically:</p>
        <p>
          <strong>When you use the contact form</strong> - your name, email address, the topic you
          select, and the message you write.
        </p>
        <p>
          <strong>When you tell us about a donation</strong> - your name, email address, the amount,
          the method you used (UPI or bank transfer), an optional payment reference or UTR number, and
          an optional note. This form only <em>notifies</em> us of a transfer you have already made
          through your own bank or UPI app; see the section on payment information below.
        </p>
        <p>
          We will accept donations from Indian banks, with an undertaking that the donation is being
          made by an individual on his/her behalf.
        </p>
        <p>
          We will <strong>not</strong> accept donations from foreign banking institutions. We reserve
          the right to refuse accepting donations based on our due diligence.
        </p>
        <p>
          <strong>When a Foundation administrator signs in</strong> - an email address and password
          used solely to manage website content. Public visitors never create accounts.
        </p>
        <p>
          <strong>Automatically</strong> - to stop spam and abuse, our forms count recent submissions
          per connection. We combine your IP address with the form name and run it through a one-way
          hash before storing it, so we keep a fingerprint that cannot be reversed into an address. We
          do not keep server logs of your browsing for analytics purposes.
        </p>
      </>
    ),
  },
  {
    heading: "Payment information",
    body: (
      <>
        <p>
          <strong>We never see or store your payment details.</strong> The Foundation does not run a
          payment gateway on this website. Donations are made directly from your bank account or UPI
          app to the Foundation&rsquo;s account, which means no card number, CVV, PIN, UPI PIN,
          net-banking credential, or bank login ever passes through this site.
        </p>
        <p>
          If you choose to send us a payment reference or UTR number afterwards, we store it only to
          match your contribution to our bank statement and to issue an acknowledgement.
        </p>
      </>
    ),
  },
  {
    heading: "How we use your information",
    body: (
      <>
        <p>We use what you send us to:</p>
        <p>
          Reply to your enquiry or volunteering interest; acknowledge, verify, and keep a record of
          donations; maintain the Foundation&rsquo;s financial and statutory records; and protect the
          website from spam and automated abuse.
        </p>
        <p>
          We process this information because you have given it to us for these purposes, and because
          we need it to meet our own legal and accounting obligations. We do{" "}
          <strong>not</strong> use your information for automated decision-making or profiling, and we
          do not send marketing email unless you have separately asked us to.
        </p>
      </>
    ),
  },
  {
    heading: "We never sell your information",
    body: (
      <p>
        We do not sell, rent, trade, or otherwise make your personal information available to third
        parties for their own marketing. We do not run advertising on this site and we do not share
        donor or enquiry data with advertisers, data brokers, or fundraising agencies.
      </p>
    ),
  },
  {
    heading: "Who processes data on our behalf",
    body: (
      <>
        <p>
          We rely on a small number of service providers who process data strictly on our
          instructions:
        </p>
        <p>
          <strong>Supabase</strong> - hosts the database that stores form submissions and
          administrator accounts. <strong>Resend</strong> - delivers notification emails to the
          Foundation and acknowledgement emails to you. <strong>Netlify</strong> - hosts and serves
          this website.
        </p>
        <p>
          These providers may store or process information on servers outside India. We share only
          what each provider needs to perform its function. We may also disclose information when
          required by law, a court, or a regulator.
        </p>
      </>
    ),
  },
  {
    heading: "Cookies and local storage",
    body: (
      <>
        <p>
          <strong>This site sets no advertising or analytics cookies</strong>, and it has no
          third-party trackers, pixels, or social-media tracking scripts.
        </p>
        <p>
          If you switch between the light and dark themes, your choice is saved in your own
          browser&rsquo;s local storage so the site remembers it on your next visit. That value never
          leaves your device. Signed-in Foundation administrators additionally receive a session
          cookie that keeps them logged in; this applies only to the private admin area.
        </p>
      </>
    ),
  },
  {
    heading: "How long we keep it",
    body: (
      <>
        <p>
          We keep enquiry messages only as long as needed to deal with them and to keep a reasonable
          record of correspondence. We keep donation records for as long as the law requires the
          Foundation to retain financial records, and generally longer than enquiry messages for that
          reason. Anti-spam fingerprints are short-lived and expire automatically.
        </p>
        <p>
          You may ask us to delete information about you at any time, and we will do so except where
          we are legally required to keep it.
        </p>
      </>
    ),
  },
  {
    heading: "Your rights",
    body: (
      <>
        <p>You may ask us to:</p>
        <p>
          Confirm what personal information we hold about you and give you a copy; correct anything
          inaccurate or incomplete; delete information we no longer need to keep; or stop using your
          information for a particular purpose, including withdrawing consent you previously gave.
        </p>
        <p>
          Write to <a href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a>, and we will
          respond within a reasonable period. We may need to verify your identity first, so that we do
          not disclose one person&rsquo;s information to another. Exercising these rights is free.
        </p>
      </>
    ),
  },
  {
    heading: "Children and young people",
    body: (
      <p>
        Our programs are aimed at students and young professionals, and some participants may be under
        18. In such situations, we will ask one or both parents to join the introductory call, which
        may be recorded. We do not knowingly collect personal information from a child through this
        website without a parent or guardian&rsquo;s involvement. If you believe a child has submitted
        information to us, contact us, and we will delete it.
      </p>
    ),
  },
  {
    heading: "Security",
    body: (
      <p>
        The site is served over an encrypted connection, administrator access is password-protected
        and limited to authorised Foundation members, and form submissions are rate-limited to resist
        abuse. No system is perfectly secure, and we cannot guarantee the security of information
        transmitted over the internet, but we take reasonable steps to protect what you send us and to
        limit who inside the Foundation can see it.
      </p>
    ),
  },
  {
    heading: "Changes to this policy",
    body: (
      <p>
        We may update this policy as the Foundation&rsquo;s activities or the law change. The date at
        the top of this page always reflects the current version. Material changes will be highlighted
        on this page.
      </p>
    ),
  },
  {
    heading: "Contact and grievances",
    body: (
      <>
        <p>
          For any question, request, or complaint about how we handle your personal information, write
          to <a href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a>, or use the{" "}
          <Link href="/contact">contact form</Link>. We aim to acknowledge every request promptly and
          resolve it fairly.
        </p>
        {legal.postalAddress ? <p>You may also write to us at {legal.postalAddress}.</p> : null}
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro="What we collect when you contact us or tell us about a donation, why we collect it, who else can see it, and how to ask us to change or delete it."
      sections={SECTIONS}
      closing={
        <>
          In short: we collect only what you send us through our forms; we never see your card or
          banking credentials; we do not sell or share your details for marketing; and you can ask us
          to delete your information at any time.
        </>
      }
    />
  );
}
