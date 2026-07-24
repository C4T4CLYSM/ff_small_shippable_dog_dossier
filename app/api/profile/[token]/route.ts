import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const { data: link } = await supabase
    .from("dog_share_links")
    .select("*")
    .eq("token", token)
    .single();

  if (!link) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  const { data: dog } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", link.dog_id)
    .single();

  if (!dog) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  const [safetyRes, routineRes, behaviorRes] = await Promise.all([
    link.show_safety ? supabase.from("dog_safety").select("*").eq("dog_id", link.dog_id).single() : Promise.resolve(null),
    link.show_routine ? supabase.from("dog_routine").select("*").eq("dog_id", link.dog_id).single() : Promise.resolve(null),
    link.show_behavior ? supabase.from("dog_behavior").select("*").eq("dog_id", link.dog_id).single() : Promise.resolve(null),
  ]);

  return Response.json({
    link,
    dog,
    safety: safetyRes?.data ?? null,
    routine: routineRes?.data ?? null,
    behavior: behaviorRes?.data ?? null,
  });
}
