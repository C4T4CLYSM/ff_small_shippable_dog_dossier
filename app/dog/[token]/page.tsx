"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import type { Dog, DogSafety, DogRoutine, DogBehavior, DogShareLink } from "@/types/database";

type CompatLabel = "yes" | "no" | "caution";

const compatConfig: Record<CompatLabel, { label: string; bg: string; text: string; dot: string }> = {
  yes:     { label: "Yes",     bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500"  },
  no:      { label: "No",      bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-500"    },
  caution: { label: "Caution", bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-400"  },
};

const compatLabels: Record<string, string> = {
  good_with_kids: "Kids",
  good_with_dogs: "Dogs",
  good_with_cats: "Cats",
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
      const res = await fetch(`/api/profile/${token}`);
      if (!res.ok) { setNotFound(true); setLoading(false); return; }
      const data = await res.json();
      if (data.error) { setNotFound(true); setLoading(false); return; }
      setLink(data.link);
      setDog(data.dog);
      setSafety(data.safety);
      setRoutine(data.routine);
      setBehavior(data.behavior);
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
      <header className="bg-navy px-6 py-[18px]">
        <div className="mx-auto max-w-[720px]">
          <a href="/">
            <Image src="/wordmark.png" alt="Dog Dossier" width={140} height={34} className="object-contain" />
          </a>
        </div>
      </header>

      {/* Dog hero */}
      <div className="bg-navy px-6 pb-16 pt-10 text-center">
        <div className="mx-auto max-w-[720px]">
          {dog.photo_url ? (
            <div className="relative mx-auto mb-5 h-32 w-32 overflow-hidden rounded-full border-4 border-orange shadow-[0_0_0_6px_rgba(234,88,12,0.15)]">
              <Image src={dog.photo_url} alt={dog.name} fill className="object-cover" />
            </div>
          ) : (
            <div className="mx-auto mb-5 flex h-32 w-32 items-center justify-center rounded-full border-4 border-orange bg-slate text-[3rem] shadow-[0_0_0_6px_rgba(234,88,12,0.15)]">🐾</div>
          )}
          <h1 className="font-heading text-[2.2rem] font-extrabold tracking-tight text-cream">{dog.name}</h1>
          {dog.breed && <p className="mt-1 font-sub text-[1rem] italic text-cream/60">{dog.breed}</p>}
          {link.label && (
            <span className="mt-3 inline-block rounded-full bg-orange/20 px-4 py-1 font-heading text-[0.8rem] font-bold text-orange">
              {link.label}
            </span>
          )}
        </div>
      </div>

      {/* Profile sections */}
      <main className="mx-auto max-w-[720px] px-6 py-10">
        <div className="flex flex-col gap-5">

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
            <Card title="Safety Info" alert>
              {(safety.emergency_contact_name || safety.emergency_contact_phone) && (
                <div className="mb-5 rounded-xl bg-red-50 px-4 py-4">
                  <p className="mb-2 text-[0.72rem] font-bold uppercase tracking-wide text-red-500">Emergency Contact</p>
                  {safety.emergency_contact_name && (
                    <p className="font-heading text-[1rem] font-bold text-red-800">{safety.emergency_contact_name}</p>
                  )}
                  {safety.emergency_contact_phone && (
                    <a href={`tel:${safety.emergency_contact_phone}`}
                      className="mt-0.5 block font-heading text-[1rem] text-red-700 hover:underline">
                      {safety.emergency_contact_phone}
                    </a>
                  )}
                </div>
              )}
              <Grid>
                <Stat label="Vet" value={safety.vet_name} />
                <Stat label="Vet Phone" value={safety.vet_phone} />
                <Stat label="Vet Address" value={safety.vet_address} />
                <Stat label="Microchip" value={safety.microchip_number} />
              </Grid>
              {safety.medical_conditions && <Note label="Medical Conditions" value={safety.medical_conditions} />}
              {safety.allergies && <Note label="Allergies" value={safety.allergies} />}
              {safety.medications && safety.medications.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-[0.72rem] font-bold uppercase tracking-wide text-slate">Medications</p>
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
            <Card title="Daily Routine">
              {routine.feeding_schedule && routine.feeding_schedule.length > 0 && (
                <div className="mb-5">
                  <p className="mb-2 text-[0.72rem] font-bold uppercase tracking-wide text-slate">Feeding Schedule</p>
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
            <Card title="Behavior">
              <div className="mb-5 grid grid-cols-3 gap-3">
                {(["good_with_kids", "good_with_dogs", "good_with_cats"] as const).map(key => {
                  const val = behavior[key] as CompatLabel | null;
                  const config = val ? compatConfig[val] : null;
                  return (
                    <div key={key} className={`flex flex-col items-center rounded-xl px-3 py-4 text-center ${config ? config.bg : "bg-slate-50"}`}>
                      {config && <span className={`mb-2 h-2.5 w-2.5 rounded-full ${config.dot}`} />}
                      <p className="font-heading text-[0.85rem] font-bold text-navy">{compatLabels[key]}</p>
                      {config && <p className={`mt-0.5 text-[0.75rem] font-bold capitalize ${config.text}`}>{config.label}</p>}
                      {!val && <p className="mt-0.5 text-[0.75rem] text-slate">—</p>}
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
      </main>

      {/* Footer */}
      <footer className="mt-6 bg-navy px-6 py-10 text-center">
        <a href="/">
          <Image src="/wordmark.png" alt="Dog Dossier" width={130} height={32} className="mx-auto object-contain" />
        </a>
        <p className="mt-3 font-sub text-[0.9rem] italic text-cream/50">Your dog deserves a dossier.</p>
        <a
          href="https://buy.stripe.com/5kQ3cu1xZcu78CLfF6cjS01"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-block rounded-[10px] bg-orange px-6 py-3 font-heading text-[0.9rem] font-bold text-cream transition hover:-translate-y-0.5 hover:bg-orange-dark"
        >
          Create your dog&apos;s profile
        </a>
        <p className="mt-8 text-[0.78rem] text-cream/30">© 2026 Dog Dossier. All rights reserved.</p>
      </footer>
    </div>
  );
}

function Card({ title, children, alert = false }: { title: string; children: React.ReactNode; alert?: boolean }) {
  return (
    <div className={`rounded-2xl bg-white p-6 shadow-[0_2px_16px_rgba(30,41,59,0.08)] ${alert ? "border-l-4 border-red-300" : ""}`}>
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
