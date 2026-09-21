import nodemailer from "nodemailer";
import { Resend } from "resend";

/** Netlify often stores the surrounding quotes if they were pasted in. */
function env(name: string) {
  let value = process.env[name]?.trim() || "";
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }
  return value;
}

function fromAddress() {
  return env("EMAIL_FROM") || "GENE-INDIA Foundation <info@geneindiafoundation.org>";
}

function recipients() {
  return env("EMAIL_TO")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
}

function smtpReady() {
  return Boolean(env("SMTP_HOST") && env("SMTP_USER") && env("SMTP_PASS") && recipients().length);
}

function resendReady() {
  return Boolean(env("RESEND_API_KEY") && recipients().length);
}

export function emailEnabled() {
  return smtpReady() || resendReady();
}

type Mail = { to: string | string[]; subject: string; html: string; replyTo?: string };

async function send({ to: recipient, subject, html, replyTo }: Mail) {
  if (smtpReady()) {
    const port = Number(env("SMTP_PORT")) || 465;
    const secure = env("SMTP_SECURE") ? env("SMTP_SECURE") !== "false" : port === 465;
    const transporter = nodemailer.createTransport({
      host: env("SMTP_HOST"),
      port,
      secure,
      auth: { user: env("SMTP_USER"), pass: env("SMTP_PASS") },
    });
    await transporter.sendMail({
      from: fromAddress(),
      to: recipient,
      subject,
      html,
      replyTo,
    });
    return;
  }

  const apiKey = env("RESEND_API_KEY");
  if (!apiKey || !recipients().length) {
    console.info(`[email disabled] would send "${subject}" to ${recipient}`);
    return;
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: fromAddress(),
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
    to: recipients(),
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
    to: recipients(),
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
