import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return Response.json({ paid: false });
  }

  const { data } = await supabase
    .from("paid_emails")
    .select("email")
    .ilike("email", email.trim())
    .single();

  return Response.json({ paid: !!data });
}
