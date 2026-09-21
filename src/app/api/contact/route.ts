import { NextResponse } from "next/server";
import { emailEnabled, sendContactEmails } from "@/lib/email";
import { getServerSupabase } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export async function POST(request: Request) {
  if (!(await rateLimit(request, "contact"))) {
    return NextResponse.json(
      { error: "Too many messages from this connection. Please try again in a few minutes." },
      { status: 429 },
    );
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: silently accept so bots don't learn anything.
  if (str(payload.website)) {
    return NextResponse.json({ message: "Thank you." });
  }

  const data = {
    name: str(payload.name).slice(0, 120),
    email: str(payload.email).slice(0, 160),
    topic: str(payload.topic).slice(0, 120) || "General enquiry",
    message: str(payload.message).slice(0, 4000),
  };

  if (!data.name || !data.message) {
    return NextResponse.json({ error: "Please add your name and a message." }, { status: 400 });
  }
  if (!isEmail(data.email)) {
    return NextResponse.json({ error: "That email address doesn't look right." }, { status: 400 });
  }

  const supabase = await getServerSupabase();
  if (supabase) {
    const { error } = await supabase.from("messages").insert(data);
    if (error) console.error("contact insert:", error.message);
  }

  try {
    await sendContactEmails(data);
  } catch (error) {
    console.error("contact email:", error);
    return NextResponse.json(
      { error: "We couldn't send that just now. Please email us directly." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    message: emailEnabled()
      ? "Thank you - your message is on its way. We'll get back to you within two working days."
      : "Thank you - your message was received. (Email delivery is not switched on yet in this environment.)",
  });
}
