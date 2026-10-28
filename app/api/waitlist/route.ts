import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { email, website } = await req.json();

  // Honeypot: the hidden "website" field is only filled in by bots
  if (website) {
    return NextResponse.json({ success: true });
  }

  if (!email || typeof email !== "string" || !email.includes("@") || email.length > 254) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("waitlist")
    .insert({ email: email.toLowerCase().trim() });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "You're already on the waitlist!" }, { status: 409 });
    }
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
