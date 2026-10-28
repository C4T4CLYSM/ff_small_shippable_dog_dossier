import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const { data: link } = await supabase
    .from("dog_share_links")
    .select("dog_id, label, show_basics, show_safety, show_routine, show_behavior")
    .eq("token", token)
    .single();

  if (!link) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  // Only send what the public page shows; never the owner's user_id
  const dogColumns = link.show_basics
    ? "name, breed, photo_url, sex, date_of_birth, weight_lbs, coat_color, spayed_neutered"
    : "name, breed, photo_url";

  const { data: dog } = await supabase
    .from("dogs")
    .select(dogColumns)
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

  const { dog_id: _dogId, ...publicLink } = link;

  return Response.json({
    link: publicLink,
    dog,
    safety: safetyRes?.data ?? null,
    routine: routineRes?.data ?? null,
    behavior: behaviorRes?.data ?? null,
  });
}
