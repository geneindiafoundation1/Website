import nodemailer from "nodemailer";
import { Resend } from "resend";

const from =
  process.env.EMAIL_FROM || "GENE-INDIA Foundation <info@geneindiafoundation.org>";
/** EMAIL_TO may list several addresses, comma-separated. */
const to = process.env.EMAIL_TO || "";
const recipients = to
  .split(",")
  .map((address) => address.trim())
  .filter(Boolean);

const smtpHost = process.env.SMTP_HOST?.trim();
const smtpUser = process.env.SMTP_USER?.trim();
const smtpPass = process.env.SMTP_PASS;
const smtpPort = Number(process.env.SMTP_PORT) || 465;
const smtpSecure = process.env.SMTP_SECURE
  ? process.env.SMTP_SECURE !== "false"
  : smtpPort === 465;

const smtpReady = Boolean(smtpHost && smtpUser && smtpPass && to);
const apiKey = process.env.RESEND_API_KEY?.trim();
const resendReady = Boolean(apiKey && to);

export const emailEnabled = smtpReady || resendReady;

const transporter = smtpReady
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPass },
    })
  : null;

const resend = resendReady ? new Resend(apiKey) : null;

type Mail = { to: string | string[]; subject: string; html: string; replyTo?: string };

async function send({ to: recipient, subject, html, replyTo }: Mail) {
  if (transporter) {
    await transporter.sendMail({
      from,
      to: recipient,
      subject,
      html,
      replyTo,
    });
    return;
  }

  if (!resend) {
    console.info(`[email disabled] would send "${subject}" to ${recipient}`);
    return;
  }

  const { error } = await resend.emails.send({
    from,
    to: recipient,
    subject,
    html,
    replyTo,
  });
  if (error) throw new Error(error.message);
}

const shell = (title: string, inner: string) => `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.6;color:#0f1c2b;max-width:560px">
    <h2 style="font-family:Georgia,serif;color:#134a80;margin:0 0 16px">${title}</h2>
    ${inner}
    <hr style="border:0;border-top:1px solid #d5dfeb;margin:28px 0 12px">
    <p style="font-size:12px;color:#6e8296;margin:0">GENE-INDIA Foundation · Global Education and Networking for Excellence</p>
  </div>`;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const row = (label: string, value: string) =>
  `<p style="margin:0 0 6px"><strong>${label}:</strong> ${esc(value)}</p>`;

export async function sendContactEmails(data: {
  name: string;
  email: string;
  topic: string;
  message: string;
}) {
  await send({
    to: recipients,
    replyTo: data.email,
    subject: `Contact form - ${data.topic}`,
    html: shell(
      "New message from the website",
      row("Name", data.name) +
        row("Email", data.email) +
        row("Topic", data.topic) +
        `<p style="margin:16px 0 0;white-space:pre-wrap">${esc(data.message)}</p>`,
    ),
  });

  await send({
    to: data.email,
    subject: "We've received your message - GENE-INDIA Foundation",
    html: shell(
      `Thank you, ${esc(data.name.split(" ")[0])}`,
      `<p style="margin:0 0 12px">We've received your message and someone from the foundation will get back to you within two working days.</p>
       <p style="margin:0;color:#4e5a56">You wrote:</p>
       <blockquote style="margin:8px 0 0;padding-left:14px;border-left:3px solid #c2611f;color:#4e5a56;white-space:pre-wrap">${esc(
         data.message,
       )}</blockquote>`,
    ),
  });
}

export async function sendDonationEmails(data: {
  name: string;
  email: string;
  amount: number;
  mode: string;
  reference: string;
  note: string;
}) {
  const amount = `₹${data.amount.toLocaleString("en-IN")}`;

  await send({
    to: recipients,
    replyTo: data.email,
    subject: `Donation reported - ${amount} from ${data.name}`,
    html: shell(
      "A donor has reported a contribution",
      row("Name", data.name) +
        row("Email", data.email) +
        row("Amount", amount) +
        row("Paid via", data.mode) +
        row("Reference", data.reference || "-") +
        (data.note ? `<p style="margin:16px 0 0;white-space:pre-wrap">${esc(data.note)}</p>` : "") +
        `<p style="margin:20px 0 0;padding:12px;background:#f4f5f2;border-left:3px solid #c2611f;font-size:14px">
           Verify this amount against the bank statement before issuing an 80G receipt.
         </p>`,
    ),
  });

  await send({
    to: data.email,
    subject: "Thank you for supporting GENE-INDIA Foundation",
    html: shell(
      `Thank you, ${esc(data.name.split(" ")[0])}`,
      `<p style="margin:0 0 12px">We're grateful for your contribution of <strong>${amount}</strong> via ${esc(
        data.mode,
      )}.</p>
       <p style="margin:0 0 12px">Because we accept donations directly to our bank and UPI, there are no transaction fees - 100% of what you gave goes to running volunteer-led mentorship programs for students across India.</p>
       <p style="margin:0;color:#4e5a56">Our team will verify the transfer and follow up with your official receipt.</p>`,
    ),
  });
}
