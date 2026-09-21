import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description:
    "How GENE-INDIA Foundation handles donation refunds, duplicate or mistaken transfers, cancellations, and receipts.",
};

const { legal } = site;

const SECTIONS: LegalSection[] = [
  {
    heading: "What this policy covers",
    body: (
      <p>
        This policy applies to voluntary donations made to {site.legalName} in support of its
        charitable work.
      </p>
    ),
  },
  {
    heading: "How donations reach us",
    body: (
      <>
        <p>
          You make donations <strong>directly</strong> from your bank account or UPI app to the
          Foundation&rsquo;s account. This website does not operate a payment gateway and never
          receives your card number, CVV, PIN, UPI PIN, or net-banking credentials.
        </p>
        <p>
          Because the transfer happens inside your own banking app, check the account name, account
          number, IFSC, or UPI ID carefully before you confirm it. Once a bank or UPI transfer is
          complete, we can&rsquo;t reverse it &mdash; only refund it, as described below.
        </p>
        <p>
          We will accept donations from Indian banks, with an undertaking that the donation is being
          made by an individual on his/her behalf. We will <strong>not</strong> accept donations from
          foreign banking institutions. We reserve the right to refuse accepting donations based on
          our due diligence.
        </p>
      </>
    ),
  },
  {
    heading: "Donations are generally non-refundable",
    body: (
      <p>
        A donation is a voluntary gift, not a purchase. Once received, funds are committed to
        the Foundation&rsquo;s programs, so donations are ordinarily{" "}
        <strong>final and non-refundable</strong>. Please give only what you intend to give, and only
        what you can comfortably afford.
      </p>
    ),
  },
  {
    heading: "When we will refund",
    body: (
      <>
        <p>
          We recognise that genuine mistakes happen. We will refund a donation where:
        </p>
        <p>
          the same donation was sent <strong>more than once by accident</strong>; an{" "}
          <strong>incorrect amount</strong> was transferred - for example, an extra digit; the transfer
          was made to us <strong>in error</strong> and was intended for someone else; the transfer was{" "}
          <strong>unauthorised</strong>, meaning it was made from your account without your knowledge
          or consent; or we are <strong>unable to accept</strong> the donation and decide to return it.
        </p>
        <p>
          Tell us within <strong>{legal.refundWindowDays} days</strong> of the transfer. We will still
          consider a later request on its merits, particularly where an unauthorised transaction is
          involved, but the sooner you write the easier it is to verify.
        </p>
      </>
    ),
  },
  {
    heading: "How to request a refund",
    body: (
      <>
        <p>
          Email <a href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a> from the address you
          gave us, with the subject line &ldquo;Refund request&rdquo;, and include:
        </p>
        <p>
          the donor&rsquo;s name as it appears on the transfer; the amount and the date it was sent;
          the method used - UPI or bank transfer; the UPI transaction ID or bank UTR/reference number;
          and a short explanation of what went wrong.
        </p>
        <p>
          The reference number matters most - it is what lets us find your transfer on our bank
          statement. You may also reach us through the <Link href="/contact">contact form</Link>, but
          please do not send bank account details, card details, or any password or PIN through it; we
          will never ask you for those.
        </p>
      </>
    ),
  },
  {
    heading: "How we process it",
    body: (
      <>
        <p>
          We acknowledge every refund request. We then verify the transfer against the
          Foundation&rsquo;s bank records, which is why we need the reference number. If the request
          is approved, we return the refund to the{" "}
          <strong>same account or UPI ID it came from</strong> - we cannot pay a refund to a different
          account, as that is how we protect donors against fraud.
        </p>
        <p>
          We will normally process approved refunds within{" "}
          <strong>{legal.refundProcessingDays} working days</strong> of verification. How quickly the
          money then appears depends on your bank. We refund the amount we actually received; any bank
          charge your bank or ours levies on the original transfer is outside our control.
        </p>
        <p>If we cannot approve a request, we will tell you why, in writing.</p>
      </>
    ),
  },
  {
    heading: "Cancelling a pledge or recurring gift",
    body: (
      <p>
        If you have pledged support or set up a recurring transfer or standing instruction with your
        bank or UPI app, you remain in control and can cancel it there at any time. Please also let us
        know so our records stay accurate. Cancelling stops future transfers; it does not by itself
        refund contributions already made, which are dealt with under the sections above.
      </p>
    ),
  },
  {
    heading: "Failed or incomplete transfers",
    body: (
      <p>
        If money leaves your account but the transfer fails or isn&rsquo;t credited to us, the banking
        system usually reverses it automatically within a few working days. Your bank or UPI provider
        is best placed to trace it, so raise it with them first. Tell us as well, with the reference
        number, and we will confirm whether anything reached our account.
      </p>
    ),
  },
  {
    heading: "Receipts and acknowledgements",
    body: (
      <>
        <p>
          When you tell us about a donation through the website, we send an acknowledgement by email.
          A formal receipt is issued once the contribution has been verified against our bank
          statement, so please keep your UPI transaction ID or bank UTR number.
        </p>
        {legal.reg80G ? (
          <p>
            The Foundation holds 80G registration ({legal.reg80G}), and receipts issued for eligible
            donations may be used to claim deduction under the Income-tax Act, 1961, subject to the
            conditions in force at the time.
          </p>
        ) : (
          <p>
            Please do not assume a donation is eligible for tax deduction unless we confirm it in
            writing on your receipt.
          </p>
        )}
      </>
    ),
  },
  {
    heading: "Changes to this policy",
    body: (
      <p>
        We may update this policy as the Foundation&rsquo;s donation channels change. The date at the
        top of this page reflects the current version, and the policy in force when you donated
        applies to that donation.
      </p>
    ),
  },
  {
    heading: "Contact us",
    body: (
      <>
        <p>
          For anything to do with a donation, a refund, or a receipt, write to{" "}
          <a href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a>. We aim to reply promptly
          and to resolve concerns fairly.
        </p>
        {legal.postalAddress ? <p>You may also write to us at {legal.postalAddress}.</p> : null}
        <p>
          See also our <Link href="/terms">Terms &amp; Conditions</Link> and{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </>
    ),
  },
];

export default function RefundPolicyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Refund & Cancellation Policy"
      intro="Donations are voluntary gifts and are ordinarily final - but genuine mistakes happen, and this page explains exactly when and how we refund them."
      sections={SECTIONS}
      closing={
        <>
          Sent a donation twice, or typed the wrong amount? Email{" "}
          <a href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a> within{" "}
          {legal.refundWindowDays} days with your UPI transaction ID or bank UTR number, and we will
          put it right.
        </>
      }
    />
  );
}
