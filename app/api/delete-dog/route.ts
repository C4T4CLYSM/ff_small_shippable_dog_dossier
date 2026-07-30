import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = authHeader.slice(7);

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { dogId } = await req.json();

  const { data: dog } = await supabaseAdmin
    .from("dogs")
    .select("id, user_id, photo_url")
    .eq("id", dogId)
    .single();

  if (!dog || dog.user_id !== user.id) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  if (dog.photo_url) {
    const match = (dog.photo_url as string).match(/\/dog-photos\/(.+?)(\?|$)/);
    if (match) {
      await supabaseAdmin.storage.from("dog-photos").remove([match[1]]);
    }
  }

  await supabaseAdmin.from("dogs").delete().eq("id", dogId);

  return Response.json({ success: true });
}
