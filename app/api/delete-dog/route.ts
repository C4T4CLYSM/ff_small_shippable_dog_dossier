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
    .select("id, user_id")
    .eq("id", dogId)
    .single();

  if (!dog || dog.user_id !== user.id) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  // Photos live in a folder named after the dog's id. Don't trust photo_url,
  // which the owner can edit to point at someone else's file.
  const { data: files } = await supabaseAdmin.storage.from("dog-photos").list(dog.id);
  if (files && files.length > 0) {
    await supabaseAdmin.storage.from("dog-photos").remove(files.map(f => `${dog.id}/${f.name}`));
  }

  await supabaseAdmin.from("dogs").delete().eq("id", dogId);

  return Response.json({ success: true });
}
