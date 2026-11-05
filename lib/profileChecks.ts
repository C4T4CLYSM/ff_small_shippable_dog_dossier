import type { Dog, DogSafety, DogRoutine, DogBehavior } from "@/types/database";

export type SafetySummary = Pick<DogSafety, "emergency_contact_phone" | "vet_name" | "vet_phone" | "microchip_number">;
export type RoutineSummary = Pick<DogRoutine, "feeding_schedule" | "walk_schedule">;
export type BehaviorSummary = Pick<DogBehavior, "good_with_kids" | "good_with_dogs" | "good_with_cats" | "known_fears" | "known_commands">;

// Matches the step names the Edit page reads from ?step=
export type EditStep = "basics" | "safety" | "routine" | "behavior";

export type ProfileCheck = {
  key: string;
  ok: boolean;
  label: string;   // shown once done, e.g. "Vet"
  todo: string;    // checklist link when missing, e.g. "Add vet details"
  missing: string; // short dashboard chip, e.g. "No vet"
  step: EditStep;
};

// What makes a profile "complete". Each check counts equally towards the percentage.
export function profileChecks(
  dog: Pick<Dog, "photo_url" | "date_of_birth" | "weight_lbs">,
  safety: SafetySummary | null | undefined,
  routine: RoutineSummary | null | undefined,
  behavior: BehaviorSummary | null | undefined,
  photoCount: number,
): ProfileCheck[] {
  return [
    {
      key: "photos", ok: photoCount > 0 || !!dog.photo_url, step: "basics",
      label: "Photos", todo: "Add photos", missing: "No photos",
    },
    {
      key: "emergency", ok: !!safety?.emergency_contact_phone, step: "safety",
      label: "Emergency contact", todo: "Add an emergency contact", missing: "No emergency contact",
    },
    {
      key: "vet", ok: !!(safety?.vet_name || safety?.vet_phone), step: "safety",
      label: "Vet", todo: "Add vet details", missing: "No vet",
    },
    {
      key: "microchip", ok: !!safety?.microchip_number, step: "safety",
      label: "Microchip", todo: "Add microchip number", missing: "No microchip",
    },
    {
      key: "basics", ok: !!(dog.date_of_birth && dog.weight_lbs), step: "basics",
      label: "Date of birth and weight", todo: "Add date of birth and weight", missing: "Basic info missing",
    },
    {
      key: "routine", ok: !!(routine && (routine.feeding_schedule?.length || routine.walk_schedule)), step: "routine",
      label: "Routine", todo: "Add a daily routine", missing: "No routine",
    },
    {
      key: "behavior",
      ok: !!(behavior && (behavior.good_with_kids || behavior.good_with_dogs || behavior.good_with_cats
        || behavior.known_fears || behavior.known_commands)),
      step: "behavior",
      label: "Behavior", todo: "Add behavior notes", missing: "No behavior notes",
    },
  ];
}

export function percentComplete(checks: ProfileCheck[]) {
  return Math.round((checks.filter(c => c.ok).length / checks.length) * 100);
}
