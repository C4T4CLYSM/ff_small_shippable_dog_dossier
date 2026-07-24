"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

const STEPS = ["Basics", "Safety", "Routine", "Behavior"];

type BasicsData = {
  name: string;
  breed: string;
  date_of_birth: string;
  weight_lbs: string;
  sex: "male" | "female" | "";
  spayed_neutered: boolean;
  coat_color: string;
};

type SafetyData = {
  emergency_contact_name: string;
  emergency_contact_phone: string;
  vet_name: string;
  vet_phone: string;
  vet_address: string;
  microchip_number: string;
  medical_conditions: string;
  allergies: string;
  medications: { name: string; dose: string; frequency: string }[];
};

type RoutineData = {
  walk_schedule: string;
  potty_schedule: string;
  crate_trained: boolean;
  sleep_location: string;
  exercise_level: "low" | "medium" | "high" | "";
  feeding_schedule: { time: string; amount: string; food_brand: string }[];
};

type BehaviorData = {
  good_with_kids: "yes" | "no" | "caution" | "";
  good_with_dogs: "yes" | "no" | "caution" | "";
  good_with_cats: "yes" | "no" | "caution" | "";
  known_fears: string;
  known_commands: string;
  leash_behavior: string;
  additional_notes: string;
};

export default function NewDogPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [basics, setBasics] = useState<BasicsData>({
    name: "", breed: "", date_of_birth: "", weight_lbs: "",
    sex: "", spayed_neutered: false, coat_color: "",
  });

  const [safety, setSafety] = useState<SafetyData>({
    emergency_contact_name: "", emergency_contact_phone: "",
    vet_name: "", vet_phone: "", vet_address: "",
    microchip_number: "", medical_conditions: "", allergies: "",
    medications: [],
  });

  const [routine, setRoutine] = useState<RoutineData>({
    walk_schedule: "", potty_schedule: "", crate_trained: false,
    sleep_location: "", exercise_level: "",
    feeding_schedule: [{ time: "", amount: "", food_brand: "" }],
  });

  const [behavior, setBehavior] = useState<BehaviorData>({
    good_with_kids: "", good_with_dogs: "", good_with_cats: "",
    known_fears: "", known_commands: "", leash_behavior: "", additional_notes: "",
  });

  async function handleFinish() {
    setLoading(true);
    setError(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = "/login"; return; }

    // Create dog
    const { data: dog, error: dogError } = await supabase
      .from("dogs")
      .insert({
        user_id: session.user.id,
        name: basics.name,
        breed: basics.breed || null,
        date_of_birth: basics.date_of_birth || null,
        weight_lbs: basics.weight_lbs ? parseFloat(basics.weight_lbs) : null,
        sex: basics.sex || null,
        spayed_neutered: basics.spayed_neutered,
        coat_color: basics.coat_color || null,
      })
      .select()
      .single();

    if (dogError || !dog) {
      setError(`Failed to create dog profile: ${dogError?.message ?? "unknown error"}`);
      setLoading(false);
      return;
    }

    // Save safety, routine, behavior in parallel
    await Promise.all([
      supabase.from("dog_safety").insert({ dog_id: dog.id, ...safety }),
      supabase.from("dog_routine").insert({
        dog_id: dog.id,
        feeding_schedule: routine.feeding_schedule,
        walk_schedule: routine.walk_schedule || null,
        potty_schedule: routine.potty_schedule || null,
        crate_trained: routine.crate_trained,
        sleep_location: routine.sleep_location || null,
        exercise_level: routine.exercise_level || null,
      }),
      supabase.from("dog_behavior").insert({
        dog_id: dog.id,
        good_with_kids: behavior.good_with_kids || null,
        good_with_dogs: behavior.good_with_dogs || null,
        good_with_cats: behavior.good_with_cats || null,
        known_fears: behavior.known_fears || null,
        known_commands: behavior.known_commands || null,
        leash_behavior: behavior.leash_behavior || null,
        additional_notes: behavior.additional_notes || null,
      }),
    ]);

    window.location.href = `/dashboard/dog/${dog.id}`;
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-50 bg-navy py-[18px]">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6">
          <a href="/dashboard">
            <Image src="/wordmark.png" alt="Dog Dossier" width={180} height={44} className="object-contain" />
          </a>
          <a href="/dashboard" className="font-heading text-[0.9rem] text-cream/60 hover:text-cream">
            ← Back to dashboard
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-[620px] px-6 py-12">
        {/* Step indicator */}
        <div className="mb-10 flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full font-heading text-[0.85rem] font-bold transition ${
                i === step ? "bg-orange text-cream" :
                i < step ? "bg-navy text-cream" :
                "bg-navy/20 text-navy/40"
              }`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`hidden font-heading text-[0.85rem] font-bold sm:block ${
                i === step ? "text-navy" : "text-navy/30"
              }`}>{label}</span>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-6 ${i < step ? "bg-navy" : "bg-navy/20"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-navy p-8 shadow-[0_12px_40px_rgba(30,41,59,0.12)]">
          {/* Step 1: Basics */}
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <h2 className="font-heading text-[1.4rem] font-extrabold text-cream">Basic Info</h2>
              <Field label="Dog's Name *">
                <input required value={basics.name} onChange={e => setBasics(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Luna" className={inputClass} />
              </Field>
              <Field label="Breed">
                <input value={basics.breed} onChange={e => setBasics(p => ({ ...p, breed: e.target.value }))}
                  placeholder="e.g. Belgian Tervuren" className={inputClass} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Date of Birth">
                  <input type="date" value={basics.date_of_birth} onChange={e => setBasics(p => ({ ...p, date_of_birth: e.target.value }))}
                    className={inputClass} />
                </Field>
                <Field label="Weight (lbs)">
                  <input type="number" value={basics.weight_lbs} onChange={e => setBasics(p => ({ ...p, weight_lbs: e.target.value }))}
                    placeholder="e.g. 55" className={inputClass} />
                </Field>
              </div>
              <Field label="Sex">
                <div className="flex gap-3">
                  {(["male", "female"] as const).map(s => (
                    <button key={s} type="button" onClick={() => setBasics(p => ({ ...p, sex: s }))}
                      className={`flex-1 rounded-xl py-2.5 font-heading text-[0.9rem] font-bold capitalize transition ${
                        basics.sex === s ? "bg-orange text-cream" : "bg-slate/40 text-cream/60 hover:bg-slate/60"
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Coat Color / Markings">
                <input value={basics.coat_color} onChange={e => setBasics(p => ({ ...p, coat_color: e.target.value }))}
                  placeholder="e.g. Black and tan" className={inputClass} />
              </Field>
              <label className="flex cursor-pointer items-center gap-3">
                <input type="checkbox" checked={basics.spayed_neutered} onChange={e => setBasics(p => ({ ...p, spayed_neutered: e.target.checked }))}
                  className="h-4 w-4 accent-orange" />
                <span className="font-heading text-[0.9rem] text-cream/70">Spayed / Neutered</span>
              </label>
            </div>
          )}

          {/* Step 2: Safety */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <h2 className="font-heading text-[1.4rem] font-extrabold text-cream">Safety Info</h2>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Emergency Contact Name">
                  <input value={safety.emergency_contact_name} onChange={e => setSafety(p => ({ ...p, emergency_contact_name: e.target.value }))}
                    placeholder="Full name" className={inputClass} />
                </Field>
                <Field label="Emergency Contact Phone">
                  <input value={safety.emergency_contact_phone} onChange={e => setSafety(p => ({ ...p, emergency_contact_phone: e.target.value }))}
                    placeholder="+1 (555) 000-0000" className={inputClass} />
                </Field>
              </div>
              <Field label="Vet Name">
                <input value={safety.vet_name} onChange={e => setSafety(p => ({ ...p, vet_name: e.target.value }))}
                  placeholder="e.g. Happy Paws Clinic" className={inputClass} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Vet Phone">
                  <input value={safety.vet_phone} onChange={e => setSafety(p => ({ ...p, vet_phone: e.target.value }))}
                    placeholder="+1 (555) 000-0000" className={inputClass} />
                </Field>
                <Field label="Microchip Number">
                  <input value={safety.microchip_number} onChange={e => setSafety(p => ({ ...p, microchip_number: e.target.value }))}
                    placeholder="Optional" className={inputClass} />
                </Field>
              </div>
              <Field label="Vet Address">
                <input value={safety.vet_address} onChange={e => setSafety(p => ({ ...p, vet_address: e.target.value }))}
                  placeholder="Street, City, State" className={inputClass} />
              </Field>
              <Field label="Medical Conditions">
                <textarea value={safety.medical_conditions} onChange={e => setSafety(p => ({ ...p, medical_conditions: e.target.value }))}
                  placeholder="e.g. Hip dysplasia, epilepsy..." rows={2} className={inputClass} />
              </Field>
              <Field label="Allergies">
                <textarea value={safety.allergies} onChange={e => setSafety(p => ({ ...p, allergies: e.target.value }))}
                  placeholder="e.g. Chicken, pollen..." rows={2} className={inputClass} />
              </Field>
              <Field label="Medications">
                {safety.medications.map((med, i) => (
                  <div key={i} className="mb-3 grid grid-cols-3 gap-2">
                    <input value={med.name} onChange={e => setSafety(p => ({ ...p, medications: p.medications.map((m, j) => j === i ? { ...m, name: e.target.value } : m) }))}
                      placeholder="Name" className={inputClass} />
                    <input value={med.dose} onChange={e => setSafety(p => ({ ...p, medications: p.medications.map((m, j) => j === i ? { ...m, dose: e.target.value } : m) }))}
                      placeholder="Dose" className={inputClass} />
                    <input value={med.frequency} onChange={e => setSafety(p => ({ ...p, medications: p.medications.map((m, j) => j === i ? { ...m, frequency: e.target.value } : m) }))}
                      placeholder="Frequency" className={inputClass} />
                  </div>
                ))}
                <button type="button" onClick={() => setSafety(p => ({ ...p, medications: [...p.medications, { name: "", dose: "", frequency: "" }] }))}
                  className="mt-1 font-heading text-[0.85rem] text-orange hover:underline">
                  + Add medication
                </button>
              </Field>
            </div>
          )}

          {/* Step 3: Routine */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <h2 className="font-heading text-[1.4rem] font-extrabold text-cream">Daily Routine</h2>
              <Field label="Feeding Schedule">
                {routine.feeding_schedule.map((feed, i) => (
                  <div key={i} className="mb-3 grid grid-cols-3 gap-2">
                    <input value={feed.time} onChange={e => setRoutine(p => ({ ...p, feeding_schedule: p.feeding_schedule.map((f, j) => j === i ? { ...f, time: e.target.value } : f) }))}
                      placeholder="Time" className={inputClass} />
                    <input value={feed.amount} onChange={e => setRoutine(p => ({ ...p, feeding_schedule: p.feeding_schedule.map((f, j) => j === i ? { ...f, amount: e.target.value } : f) }))}
                      placeholder="Amount" className={inputClass} />
                    <input value={feed.food_brand} onChange={e => setRoutine(p => ({ ...p, feeding_schedule: p.feeding_schedule.map((f, j) => j === i ? { ...f, food_brand: e.target.value } : f) }))}
                      placeholder="Food brand" className={inputClass} />
                  </div>
                ))}
                <button type="button" onClick={() => setRoutine(p => ({ ...p, feeding_schedule: [...p.feeding_schedule, { time: "", amount: "", food_brand: "" }] }))}
                  className="mt-1 font-heading text-[0.85rem] text-orange hover:underline">
                  + Add feeding
                </button>
              </Field>
              <Field label="Walk Schedule">
                <input value={routine.walk_schedule} onChange={e => setRoutine(p => ({ ...p, walk_schedule: e.target.value }))}
                  placeholder="e.g. 7am, 12pm, 6pm — 30 min each" className={inputClass} />
              </Field>
              <Field label="Potty Schedule">
                <input value={routine.potty_schedule} onChange={e => setRoutine(p => ({ ...p, potty_schedule: e.target.value }))}
                  placeholder="e.g. Every 4 hours" className={inputClass} />
              </Field>
              <Field label="Sleep Location">
                <input value={routine.sleep_location} onChange={e => setRoutine(p => ({ ...p, sleep_location: e.target.value }))}
                  placeholder="e.g. Dog bed in bedroom" className={inputClass} />
              </Field>
              <Field label="Exercise Level">
                <div className="flex gap-3">
                  {(["low", "medium", "high"] as const).map(level => (
                    <button key={level} type="button" onClick={() => setRoutine(p => ({ ...p, exercise_level: level }))}
                      className={`flex-1 rounded-xl py-2.5 font-heading text-[0.9rem] font-bold capitalize transition ${
                        routine.exercise_level === level ? "bg-orange text-cream" : "bg-slate/40 text-cream/60 hover:bg-slate/60"
                      }`}>
                      {level}
                    </button>
                  ))}
                </div>
              </Field>
              <label className="flex cursor-pointer items-center gap-3">
                <input type="checkbox" checked={routine.crate_trained} onChange={e => setRoutine(p => ({ ...p, crate_trained: e.target.checked }))}
                  className="h-4 w-4 accent-orange" />
                <span className="font-heading text-[0.9rem] text-cream/70">Crate trained</span>
              </label>
            </div>
          )}

          {/* Step 4: Behavior */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <h2 className="font-heading text-[1.4rem] font-extrabold text-cream">Behavior</h2>
              {(["good_with_kids", "good_with_dogs", "good_with_cats"] as const).map(key => (
                <Field key={key} label={key === "good_with_kids" ? "Good with kids?" : key === "good_with_dogs" ? "Good with dogs?" : "Good with cats?"}>
                  <div className="flex gap-3">
                    {(["yes", "no", "caution"] as const).map(val => (
                      <button key={val} type="button" onClick={() => setBehavior(p => ({ ...p, [key]: val }))}
                        className={`flex-1 rounded-xl py-2.5 font-heading text-[0.9rem] font-bold capitalize transition ${
                          behavior[key] === val ? "bg-orange text-cream" : "bg-slate/40 text-cream/60 hover:bg-slate/60"
                        }`}>
                        {val}
                      </button>
                    ))}
                  </div>
                </Field>
              ))}
              <Field label="Known Fears / Triggers">
                <textarea value={behavior.known_fears} onChange={e => setBehavior(p => ({ ...p, known_fears: e.target.value }))}
                  placeholder="e.g. Thunderstorms, strangers, loud noises..." rows={2} className={inputClass} />
              </Field>
              <Field label="Commands They Know">
                <input value={behavior.known_commands} onChange={e => setBehavior(p => ({ ...p, known_commands: e.target.value }))}
                  placeholder="e.g. Sit, stay, come, leave it" className={inputClass} />
              </Field>
              <Field label="Leash Behavior">
                <input value={behavior.leash_behavior} onChange={e => setBehavior(p => ({ ...p, leash_behavior: e.target.value }))}
                  placeholder="e.g. Pulls on leash, reactive to other dogs" className={inputClass} />
              </Field>
              <Field label="Additional Notes">
                <textarea value={behavior.additional_notes} onChange={e => setBehavior(p => ({ ...p, additional_notes: e.target.value }))}
                  placeholder="Anything else a caretaker should know..." rows={3} className={inputClass} />
              </Field>
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-[0.9rem] text-red-400">{error}</p>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)}
                className="rounded-xl border border-cream/20 px-6 py-3 font-heading text-[0.9rem] text-cream/70 transition hover:border-cream/40 hover:text-cream">
                ← Back
              </button>
            ) : <div />}

            {step < STEPS.length - 1 ? (
              <button onClick={() => {
                if (step === 0 && !basics.name.trim()) { setError("Dog's name is required."); return; }
                setError(null);
                setStep(s => s + 1);
              }}
                className="rounded-xl bg-orange px-6 py-3 font-heading text-[0.9rem] font-bold text-cream transition hover:bg-orange-dark">
                Next →
              </button>
            ) : (
              <button onClick={handleFinish} disabled={loading}
                className="rounded-xl bg-orange px-6 py-3 font-heading text-[0.9rem] font-bold text-cream transition hover:bg-orange-dark disabled:opacity-50">
                {loading ? "Saving..." : "Save Profile"}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-heading text-[0.85rem] font-bold text-cream/70">{label}</label>
      {children}
    </div>
  );
}

const inputClass = "w-full rounded-xl bg-slate/40 px-4 py-3 text-[0.95rem] text-cream placeholder-cream/30 outline-none ring-1 ring-cream/10 transition focus:ring-orange resize-none";
