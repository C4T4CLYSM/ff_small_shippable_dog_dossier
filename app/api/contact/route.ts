import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { name, email, subject, message, website } = await req.json();

  // Honeypot: the hidden "website" field is only filled in by bots
  if (website) {
    return NextResponse.json({ ok: true });
  }

  if (
    typeof name !== "string" || typeof email !== "string" ||
    typeof subject !== "string" || typeof message !== "string" ||
    !name.trim() || !email.includes("@") || !subject.trim() || !message.trim()
  ) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  if (name.length > 100 || email.length > 254 || subject.length > 200 || message.length > 5000) {
    return NextResponse.json({ error: "One of the fields is too long." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("contact_messages")
    .insert({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

  if (error) {
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
