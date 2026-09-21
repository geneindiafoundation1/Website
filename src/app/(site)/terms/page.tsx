import type { Metadata } from "next";
import Link from "next/link";
import { LegalFact, LegalPage, type LegalSection } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms on which GENE-INDIA Foundation makes this website, its mentorship programs, and its donation channels available.",
};

const { legal } = site;

const SECTIONS: LegalSection[] = [
  {
    heading: "Agreement to these terms",
    body: (
      <p>
        These Terms &amp; Conditions govern your use of {site.url} and any program, event, or service
        the Foundation offers through it. By using this website, contacting us, volunteering, or
        donating, you agree to these terms. If you do not agree, please do not use the site.
      </p>
    ),
  },
  {
    heading: "About the Foundation",
    body: (
      <>
        <p>
          {site.legalName} is a volunteer-driven, apolitical and non-religious foundation that
          connects experienced professionals with students and young professionals across India
          through structured mentorship in health sciences, humanities, engineering, information
          technology, and social sciences.
        </p>
        <div className="info-list legal-facts">
          <LegalFact label="Entity type" value={legal.entityType} />
          <LegalFact label="Registration no." value={legal.registrationNumber} />
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
    heading: "Using this website",
    body: (
      <>
        <p>
          You may read, share, and link to this site freely. You agree not to use it to break the law,
          to submit false or misleading information, to impersonate anyone, to send spam or automated
          submissions through our forms, to attempt to gain access to the administrator area or any
          system we operate, or to disrupt, overload, or probe the site&rsquo;s security.
        </p>
        <p>
          We may withdraw or restrict access to the site, or to any program, where we reasonably
          believe these terms have been broken.
        </p>
      </>
    ),
  },
  {
    heading: "Our programs are free, voluntary, and not guaranteed",
    body: (
      <>
        <p>
          Mentorship and guidance are delivered by volunteers who give their time. Participation is
          voluntary on both sides. We make every effort to match learners with suitable mentors and to
          run programs as described, but we do not guarantee the availability of any particular
          mentor, program, session, or schedule, and we may change or discontinue a program.
        </p>
        <p>
          <strong>
            Nothing we offer is a guarantee of admission, examination result, scholarship, internship,
            employment, promotion, visa, or any other outcome.
          </strong>{" "}
          We do not charge students for mentorship, and we never ask a student to pay a mentor. If
          anyone asks you for money in the Foundation&rsquo;s name, treat it as fraudulent and tell us
          at once.
        </p>
      </>
    ),
  },
  {
    heading: "Guidance is not professional advice",
    body: (
      <p>
        Mentors speak from their own professional experience, and their views are their own rather
        than the Foundation&rsquo;s. Information shared through our programs, blog, or website is
        general and educational. It is not medical, legal, financial, tax, immigration, or other
        professional advice, and you should not rely on it as a substitute for advice from a qualified
        professional who knows your circumstances.
      </p>
    ),
  },
  {
    heading: "Volunteers and mentors",
    body: (
      <p>
        Volunteering is unpaid and creates no employment, agency, partnership, or contractor
        relationship with the Foundation. Volunteers are expected to act with integrity and courtesy,
        to keep participants&rsquo; information confidential, to remain apolitical and non-religious
        in Foundation activities, and to declare any conflict of interest. We may end a volunteering
        arrangement at any time, and a volunteer may step away at any time.
      </p>
    ),
  },
  {
    heading: "Conduct and safeguarding",
    body: (
      <p>
        We expect everyone taking part - learners, mentors, and staff - to behave respectfully.
        Harassment, discrimination, intimidation, or any conduct that makes a participant unsafe is
        not tolerated and will end participation. Because some participants may be under 18, report
        any safeguarding concern to{" "}
        <a href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a> immediately.
      </p>
    ),
  },
  {
    heading: "Donations",
    body: (
      <>
        <p>
          Donations to the Foundation are voluntary contributions made to support its charitable work.
          They are not a purchase, and they do not buy goods, services, membership, mentorship, or any
          preferential treatment.
        </p>
        <p>
          Donations are made directly to the Foundation&rsquo;s bank account or UPI ID - this website
          does not process payments and never handles your card or banking credentials. You are
          responsible for confirming the account details before sending money, and for the accuracy of
          the details you enter in your own banking app. Please read our{" "}
          <Link href="/refund-policy">Refund &amp; Cancellation Policy</Link> before donating.
        </p>
        <p>
          We will accept donations from Indian banks, with an undertaking that the donation is being
          made by an individual on his/her behalf. We will <strong>not</strong> accept donations from
          foreign banking institutions. We reserve the right to refuse accepting donations based on
          our due diligence.
        </p>
        <p>
          We may decline or return a donation at our discretion - for instance where the source is
          unclear, where accepting it would breach any law applying to the Foundation, or where it
          would compromise our independence.
        </p>
      </>
    ),
  },
  {
    heading: "Content and intellectual property",
    body: (
      <>
        <p>
          The name {site.shortName}, the Foundation&rsquo;s logo, and the text, design, images, and
          code of this site belong to the Foundation or its licensors, except where credited
          otherwise. You may quote or share our material with attribution and a link. You may not use
          our name or logo to imply endorsement, partnership, or affiliation without our written
          permission, and you may not reproduce the site&rsquo;s design or content commercially.
        </p>
        <p>
          When you send us a message, a testimonial, or other material, you keep ownership of it and
          give us permission to use it for the purpose you sent it for. We will not publish your name
          or story publicly without asking you first.
        </p>
      </>
    ),
  },
  {
    heading: "Links to other sites",
    body: (
      <p>
        Our site links to other organisations, including our social media profiles. We do not control
        those sites and are not responsible for their content, accuracy, or privacy practices. A link
        is not an endorsement.
      </p>
    ),
  },
  {
    heading: "Availability and accuracy",
    body: (
      <p>
        We try to keep this site accurate and available, but we provide it &ldquo;as is&rdquo;. We do
        not warrant that it will be uninterrupted, error-free, or free of harmful components, and we
        may change, suspend, or withdraw any part of it without notice. Content may become out of date.
      </p>
    ),
  },
  {
    heading: "Limitation of liability",
    body: (
      <p>
        To the fullest extent the law allows, the Foundation, its trustees, officers, volunteers, and
        mentors are not liable for any indirect or consequential loss, or for loss of opportunity,
        income, data, or reputation, arising from your use of this site or participation in our
        programs. Nothing in these terms excludes liability that cannot lawfully be excluded,
        including for death or personal injury caused by negligence, or for fraud.
      </p>
    ),
  },
  {
    heading: "Indemnity",
    body: (
      <p>
        You agree to indemnify the Foundation against claims, losses, and reasonable costs arising
        from your breach of these terms, your misuse of the site, or your infringement of anyone
        else&rsquo;s rights.
      </p>
    ),
  },
  {
    heading: "Privacy",
    body: (
      <p>
        Our <Link href="/privacy">Privacy Policy</Link> explains what personal information we collect
        and how we handle it. It forms part of these terms.
      </p>
    ),
  },
  {
    heading: "Changes to these terms",
    body: (
      <p>
        We may update these terms from time to time. The date at the top of this page reflects the
        current version, and continuing to use the site after a change means you accept the updated
        terms.
      </p>
    ),
  },
  {
    heading: "Governing law",
    body: (
      <p>
        These terms are governed by the laws of India. The courts at {legal.jurisdiction} have
        exclusive jurisdiction over any dispute arising from them, save that we may seek injunctive
        relief in any court of competent jurisdiction. We would much rather resolve any concern
        directly - please write to us first.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms & Conditions"
      intro="The terms on which we make this website, our volunteer-led mentorship programs, and our donation channels available to you."
      sections={SECTIONS}
    />
  );
}
