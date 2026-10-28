import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return Response.json({ paid: false });
  }

  // ilike treats % and _ as wildcards, so escape them for an exact match
  const pattern = email.trim().replace(/[\\%_]/g, "\\$&");

  const { data } = await supabase
    .from("paid_emails")
    .select("email")
    .ilike("email", pattern)
    .single();

  return Response.json({ paid: !!data });
}
