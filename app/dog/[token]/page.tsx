"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { Dog, DogSafety, DogRoutine, DogBehavior, DogShareLink } from "@/types/database";

type CompatLabel = "yes" | "no" | "caution";

const compatEmoji: Record<CompatLabel, string> = {
  yes: "✅",
  no: "❌",
  caution: "⚠️",
};

export default function PublicProfilePage() {
  const { token } = useParams<{ token: string }>();
  const [link, setLink] = useState<DogShareLink | null>(null);
  const [dog, setDog] = useState<Dog | null>(null);
  const [safety, setSafety] = useState<DogSafety | null>(null);
  const [routine, setRoutine] = useState<DogRoutine | null>(null);
  const [behavior, setBehavior] = useState<DogBehavior | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: linkData } = await supabase
        .from("dog_share_links")
        .select("*")
        .eq("token", token)
        .single();

      if (!linkData) { setNotFound(true); setLoading(false); return; }
      setLink(linkData);

      const { data: dogData } = await supabase
        .from("dogs")
        .select("*")
        .eq("id", linkData.dog_id)
        .single();

      if (!dogData) { setNotFound(true); setLoading(false); return; }
      setDog(dogData);

      const [safetyRes, routineRes, behaviorRes] = await Promise.all([
        linkData.show_safety ? supabase.from("dog_safety").select("*").eq("dog_id", linkData.dog_id).single() : null,
        linkData.show_routine ? supabase.from("dog_routine").select("*").eq("dog_id", linkData.dog_id).single() : null,
        linkData.show_behavior ? supabase.from("dog_behavior").select("*").eq("dog_id", linkData.dog_id).single() : null,
      ]);

      if (safetyRes) setSafety(safetyRes.data);
      if (routineRes) setRoutine(routineRes.data);
      if (behaviorRes) setBehavior(behaviorRes.data);
      setLoading(false);
    }

    load();
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="font-heading text-navy">Loading profile...</p>
      </div>
    );
  }

  if (notFound || !dog || !link) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
        <p className="mb-2 font-heading text-[1.4rem] font-extrabold text-navy">Profile not found</p>
        <p className="font-sub text-[1rem] italic text-slate">This link may have been removed or is no longer active.</p>
        <a href="/" className="mt-8 font-heading text-[0.9rem] text-orange hover:underline">← Go to Dog Dossier</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-navy px-6 py-5">
        <div className="mx-auto flex max-w-[720px] items-center justify-between">
          <a href="/">
            <Image src="/wordmark.png" alt="Dog Dossier" width={140} height={34} className="object-contain" />
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-[720px] px-6 py-10">
        {/* Dog hero */}
        <div className="mb-8 flex items-center gap-5">
          {dog.photo_url ? (
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border-4 border-orange">
              <Image src={dog.photo_url} alt={dog.name} fill className="object-cover" />
            </div>
          ) : (
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full border-4 border-orange bg-navy text-[2rem]">🐾</div>
          )}
          <div>
            <h1 className="font-heading text-[2rem] font-extrabold text-navy">{dog.name}</h1>
            {dog.breed && <p className="font-sub text-[1rem] italic text-slate">{dog.breed}</p>}
            {link.label && (
              <p className="mt-1 inline-block rounded-full bg-orange/10 px-3 py-0.5 font-heading text-[0.78rem] font-bold text-orange">
                {link.label}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Basics */}
          {link.show_basics && (
            <Card title="Basic Info">
              <Grid>
                <Stat label="Sex" value={dog.sex} capitalize />
                <Stat label="Date of Birth" value={dog.date_of_birth} />
                <Stat label="Weight" value={dog.weight_lbs ? `${dog.weight_lbs} lbs` : null} />
                <Stat label="Coat Color" value={dog.coat_color} capitalize />
                <Stat label="Spayed / Neutered" value={dog.spayed_neutered ? "Yes" : "No"} />
              </Grid>
            </Card>
          )}

          {/* Safety */}
          {link.show_safety && safety && (
            <Card title="🚨 Safety Info">
              <Grid>
                <Stat label="Emergency Contact" value={safety.emergency_contact_name} />
                <Stat label="Emergency Phone" value={safety.emergency_contact_phone} />
                <Stat label="Vet" value={safety.vet_name} />
                <Stat label="Vet Phone" value={safety.vet_phone} />
                <Stat label="Vet Address" value={safety.vet_address} />
                <Stat label="Microchip" value={safety.microchip_number} />
              </Grid>
              {safety.medical_conditions && (
                <Note label="Medical Conditions" value={safety.medical_conditions} />
              )}
              {safety.allergies && (
                <Note label="Allergies" value={safety.allergies} />
              )}
              {safety.medications && safety.medications.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-[0.78rem] font-bold uppercase tracking-wide text-slate">Medications</p>
                  <div className="flex flex-col gap-2">
                    {safety.medications.map((med, i) => (
                      <div key={i} className="rounded-xl bg-cream px-4 py-3">
                        <p className="font-heading text-[0.95rem] font-bold text-navy">{med.name}</p>
                        <p className="text-[0.85rem] text-slate">{med.dose} · {med.frequency}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Routine */}
          {link.show_routine && routine && (
            <Card title="📅 Daily Routine">
              {routine.feeding_schedule && routine.feeding_schedule.length > 0 && (
                <div className="mb-4">
                  <p className="mb-2 text-[0.78rem] font-bold uppercase tracking-wide text-slate">Feeding Schedule</p>
                  <div className="flex flex-col gap-2">
                    {routine.feeding_schedule.map((f, i) => (
                      <div key={i} className="rounded-xl bg-cream px-4 py-3">
                        <p className="font-heading text-[0.95rem] font-bold text-navy">{f.time}</p>
                        <p className="text-[0.85rem] text-slate">{f.amount} of {f.food_brand}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Grid>
                <Stat label="Walk Schedule" value={routine.walk_schedule} />
                <Stat label="Potty Schedule" value={routine.potty_schedule} />
                <Stat label="Sleep Location" value={routine.sleep_location} />
                <Stat label="Exercise Level" value={routine.exercise_level} capitalize />
                <Stat label="Crate Trained" value={routine.crate_trained ? "Yes" : "No"} />
              </Grid>
            </Card>
          )}

          {/* Behavior */}
          {link.show_behavior && behavior && (
            <Card title="🐾 Behavior">
              <div className="mb-4 grid grid-cols-3 gap-3">
                {(["good_with_kids", "good_with_dogs", "good_with_cats"] as const).map(key => {
                  const val = behavior[key] as CompatLabel | null;
                  const label = key === "good_with_kids" ? "Kids" : key === "good_with_dogs" ? "Dogs" : "Cats";
                  return (
                    <div key={key} className="flex flex-col items-center rounded-xl bg-cream px-3 py-4 text-center">
                      <p className="text-[1.4rem]">{val ? compatEmoji[val] : "—"}</p>
                      <p className="mt-1 font-heading text-[0.8rem] font-bold text-navy">{label}</p>
                      {val && <p className="text-[0.78rem] capitalize text-slate">{val}</p>}
                    </div>
                  );
                })}
              </div>
              {behavior.known_fears && <Note label="Known Fears / Triggers" value={behavior.known_fears} />}
              {behavior.known_commands && <Note label="Commands They Know" value={behavior.known_commands} />}
              {behavior.leash_behavior && <Note label="Leash Behavior" value={behavior.leash_behavior} />}
              {behavior.additional_notes && <Note label="Additional Notes" value={behavior.additional_notes} />}
            </Card>
          )}
        </div>

        <p className="mt-10 text-center text-[0.8rem] text-slate/50">
          Powered by <a href="/" className="text-orange hover:underline">Dog Dossier</a>
        </p>
      </main>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border-t-[3px] border-orange bg-white p-6 shadow-[0_4px_24px_rgba(30,41,59,0.07)]">
      <h2 className="mb-4 font-heading text-[1.05rem] font-extrabold text-navy">{title}</h2>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
}

function Stat({ label, value, capitalize }: { label: string; value: string | number | null | undefined; capitalize?: boolean }) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <p className="text-[0.72rem] font-bold uppercase tracking-wide text-slate">{label}</p>
      <p className={`mt-0.5 text-[0.95rem] text-navy ${capitalize ? "capitalize" : ""}`}>{String(value)}</p>
    </div>
  );
}

function Note({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-4">
      <p className="mb-1 text-[0.72rem] font-bold uppercase tracking-wide text-slate">{label}</p>
      <p className="text-[0.95rem] text-navy">{value}</p>
    </div>
  );
}
