import { NextResponse } from "next/server";
import { emailEnabled, sendDonationEmails } from "@/lib/email";
import { getServerSupabase } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export async function POST(request: Request) {
  if (!(await rateLimit(request, "donate"))) {
    return NextResponse.json(
      { error: "Too many submissions from this connection. Please try again shortly." },
      { status: 429 },
    );
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (str(payload.website)) {
    return NextResponse.json({ message: "Thank you." });
  }

  const amount = Number(payload.amount);
  const data = {
    name: str(payload.name).slice(0, 120),
    email: str(payload.email).slice(0, 160),
    amount,
    mode: str(payload.mode).slice(0, 40) || "UPI",
    reference: str(payload.reference).slice(0, 80),
    note: str(payload.note).slice(0, 2000),
  };

  if (!data.name) {
    return NextResponse.json({ error: "Please add your name." }, { status: 400 });
  }
  if (!isEmail(data.email)) {
    return NextResponse.json({ error: "That email address doesn't look right." }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Please enter the amount you donated." }, { status: 400 });
  }

  const supabase = await getServerSupabase();
  if (supabase) {
    const { error } = await supabase.from("donations").insert({ ...data, verified: false });
    if (error) console.error("donation insert:", error.message);
  }

  try {
    await sendDonationEmails(data);
  } catch (error) {
    console.error("donation email:", error);
    return NextResponse.json(
      { error: "We couldn't record that just now. Please email us directly." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    message: emailEnabled()
      ? "Thank you. A confirmation email is on its way, and our team will verify the amount against the bank statement before issuing your receipt."
      : "Thank you - your details were received. (Email delivery is not switched on yet in this environment.)",
  });
}
