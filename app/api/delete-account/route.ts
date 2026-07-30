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

  const userId = user.id;

  const { data: dogs } = await supabaseAdmin
    .from("dogs")
    .select("id, photo_url")
    .eq("user_id", userId);

  if (dogs && dogs.length > 0) {
    const photoPaths = dogs
      .filter(d => d.photo_url)
      .map(d => {
        const match = (d.photo_url as string).match(/\/dog-photos\/(.+?)(\?|$)/);
        return match ? match[1] : null;
      })
      .filter(Boolean) as string[];

    if (photoPaths.length > 0) {
      await supabaseAdmin.storage.from("dog-photos").remove(photoPaths);
    }
  }

  await supabaseAdmin.from("users").delete().eq("id", userId);

  await supabaseAdmin.auth.admin.deleteUser(userId);

  return Response.json({ success: true });
}
