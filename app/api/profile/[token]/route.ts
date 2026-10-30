import { createClient } from "@supabase/supabase-js";
import { photoUrl } from "@/lib/dogPhotos";

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
    ? "name, breed, photo_url, show_found_bar, sex, date_of_birth, weight_lbs, coat_color, spayed_neutered"
    : "name, breed, photo_url, show_found_bar";

  const { data: dogRow } = await supabase
    .from("dogs")
    .select(dogColumns)
    .eq("id", link.dog_id)
    .single();

  if (!dogRow) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  const [safetyRes, routineRes, behaviorRes, photosRes] = await Promise.all([
    link.show_safety ? supabase.from("dog_safety").select("*").eq("dog_id", link.dog_id).single() : Promise.resolve(null),
    link.show_routine ? supabase.from("dog_routine").select("*").eq("dog_id", link.dog_id).single() : Promise.resolve(null),
    link.show_behavior ? supabase.from("dog_behavior").select("*").eq("dog_id", link.dog_id).single() : Promise.resolve(null),
    supabase.from("dog_photos").select("path").eq("dog_id", link.dog_id).order("position"),
  ]);

  const { dog_id: _dogId, ...publicLink } = link;
  const { show_found_bar: showFoundBar, ...dog } = dogRow as unknown as Record<string, unknown>;

  const photos = (photosRes.data ?? []).map(p => photoUrl(p.path));
  if (photos.length === 0 && typeof dog.photo_url === "string") photos.push(dog.photo_url);

  // The "Found?" button only appears when the owner turned it on and this link shows Safety info
  const phone = safetyRes?.data?.emergency_contact_phone;
  const found = showFoundBar && link.show_safety && phone ? { phone } : null;

  return Response.json({
    link: publicLink,
    dog,
    photos,
    found,
    safety: safetyRes?.data ?? null,
    routine: routineRes?.data ?? null,
    behavior: behaviorRes?.data ?? null,
  });
}
