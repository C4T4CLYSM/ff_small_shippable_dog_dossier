"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { Dog, DogSafety, DogRoutine, DogBehavior, DogShareLink } from "@/types/database";

export default function DogProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [dog, setDog] = useState<Dog | null>(null);
  const [safety, setSafety] = useState<DogSafety | null>(null);
  const [routine, setRoutine] = useState<DogRoutine | null>(null);
  const [behavior, setBehavior] = useState<DogBehavior | null>(null);
  const [shareLinks, setShareLinks] = useState<DogShareLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [creatingLink, setCreatingLink] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const [newLinkVisibility, setNewLinkVisibility] = useState({
    show_basics: true,
    show_safety: true,
    show_routine: true,
    show_behavior: true,
  });

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = "/login"; return; }

      const [dogRes, safetyRes, routineRes, behaviorRes, linksRes] = await Promise.all([
        supabase.from("dogs").select("*").eq("id", id).single(),
        supabase.from("dog_safety").select("*").eq("dog_id", id).single(),
        supabase.from("dog_routine").select("*").eq("dog_id", id).single(),
        supabase.from("dog_behavior").select("*").eq("dog_id", id).single(),
        supabase.from("dog_share_links").select("*").eq("dog_id", id).order("created_at", { ascending: true }),
      ]);

      if (!dogRes.data || dogRes.data.user_id !== session.user.id) {
        window.location.href = "/dashboard";
        return;
      }

      setDog(dogRes.data);
      setSafety(safetyRes.data);
      setRoutine(routineRes.data);
      setBehavior(behaviorRes.data);
      setShareLinks(linksRes.data ?? []);
      setLoading(false);
    }

    load();
  }, [id]);

  async function createShareLink() {
    if (!newLinkLabel.trim() || !dog) return;
    setCreatingLink(true);

    const { data, error } = await supabase
      .from("dog_share_links")
      .insert({ dog_id: dog.id, label: newLinkLabel.trim(), ...newLinkVisibility })
      .select()
      .single();

    if (!error && data) {
      setShareLinks(prev => [...prev, data]);
      setNewLinkLabel("");
      setNewLinkVisibility({ show_basics: true, show_safety: true, show_routine: true, show_behavior: true });
    }
    setCreatingLink(false);
  }

  async function deleteShareLink(linkId: string) {
    await supabase.from("dog_share_links").delete().eq("id", linkId);
    setShareLinks(prev => prev.filter(l => l.id !== linkId));
  }

  function copyLink(token: string) {
    navigator.clipboard.writeText(`https://dogdossier.app/dog/${token}`);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="font-heading text-navy">Loading...</p>
      </div>
    );
  }

  if (!dog) return null;

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

      <main className="mx-auto max-w-[1100px] px-6 py-12">
        {/* Dog header */}
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {dog.photo_url ? (
              <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-orange">
                <Image src={dog.photo_url} alt={dog.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-navy text-[2.5rem]">🐾</div>
            )}
            <div>
              <h1 className="font-heading text-[2rem] font-extrabold text-navy">{dog.name}</h1>
              {dog.breed && <p className="font-sub text-[1rem] italic text-slate">{dog.breed}</p>}
            </div>
          </div>
          <a
            href={`/dashboard/dog/${dog.id}/edit`}
            className="rounded-[10px] bg-orange px-5 py-2.5 font-heading text-[0.9rem] font-bold text-cream transition hover:-translate-y-0.5 hover:bg-orange-dark"
          >
            Edit Profile
          </a>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Basics */}
          <Section title="Basic Info">
            <Row label="Sex" value={dog.sex} />
            <Row label="Date of Birth" value={dog.date_of_birth} />
            <Row label="Weight" value={dog.weight_lbs ? `${dog.weight_lbs} lbs` : null} />
            <Row label="Coat Color" value={dog.coat_color} />
            <Row label="Spayed / Neutered" value={dog.spayed_neutered ? "Yes" : "No"} />
          </Section>

          {/* Safety */}
          <Section title="Safety Info">
            <Row label="Emergency Contact" value={safety?.emergency_contact_name} />
            <Row label="Emergency Phone" value={safety?.emergency_contact_phone} />
            <Row label="Vet" value={safety?.vet_name} />
            <Row label="Vet Phone" value={safety?.vet_phone} />
            <Row label="Vet Address" value={safety?.vet_address} />
            <Row label="Microchip" value={safety?.microchip_number} />
            <Row label="Medical Conditions" value={safety?.medical_conditions} />
            <Row label="Allergies" value={safety?.allergies} />
            {safety?.medications && safety.medications.length > 0 && (
              <div className="mt-2">
                <p className="mb-1 text-[0.8rem] font-bold uppercase tracking-wide text-cream/40">Medications</p>
                {safety.medications.map((med, i) => (
                  <p key={i} className="text-[0.9rem] text-cream/80">
                    {med.name} — {med.dose} — {med.frequency}
                  </p>
                ))}
              </div>
            )}
          </Section>

          {/* Routine */}
          <Section title="Daily Routine">
            <Row label="Walk Schedule" value={routine?.walk_schedule} />
            <Row label="Potty Schedule" value={routine?.potty_schedule} />
            <Row label="Sleep Location" value={routine?.sleep_location} />
            <Row label="Exercise Level" value={routine?.exercise_level} />
            <Row label="Crate Trained" value={routine?.crate_trained ? "Yes" : "No"} />
            {routine?.feeding_schedule && routine.feeding_schedule.length > 0 && (
              <div className="mt-2">
                <p className="mb-1 text-[0.8rem] font-bold uppercase tracking-wide text-cream/40">Feeding</p>
                {routine.feeding_schedule.map((f, i) => (
                  <p key={i} className="text-[0.9rem] text-cream/80">
                    {f.time} — {f.amount} of {f.food_brand}
                  </p>
                ))}
              </div>
            )}
          </Section>

          {/* Behavior */}
          <Section title="Behavior">
            <Row label="Good with Kids" value={behavior?.good_with_kids} />
            <Row label="Good with Dogs" value={behavior?.good_with_dogs} />
            <Row label="Good with Cats" value={behavior?.good_with_cats} />
            <Row label="Known Fears" value={behavior?.known_fears} />
            <Row label="Commands" value={behavior?.known_commands} />
            <Row label="Leash Behavior" value={behavior?.leash_behavior} />
            <Row label="Additional Notes" value={behavior?.additional_notes} />
          </Section>
        </div>

        {/* Share Links */}
        <div className="mt-10 rounded-2xl bg-navy p-8">
          <h2 className="mb-6 font-heading text-[1.3rem] font-extrabold text-cream">Share Links</h2>

          {shareLinks.length === 0 && (
            <p className="mb-6 text-[0.9rem] text-cream/40">No share links yet. Create one below.</p>
          )}

          {shareLinks.map(link => (
            <div key={link.id} className="mb-4 flex items-center justify-between rounded-xl bg-slate/30 px-5 py-4">
              <div>
                <p className="font-heading text-[0.95rem] font-bold text-cream">{link.label}</p>
                <p className="mt-0.5 text-[0.8rem] text-cream/40">
                  {[link.show_basics && "Basics", link.show_safety && "Safety", link.show_routine && "Routine", link.show_behavior && "Behavior"]
                    .filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => copyLink(link.token)}
                  className="rounded-lg bg-orange px-4 py-2 font-heading text-[0.85rem] font-bold text-cream transition hover:bg-orange-dark">
                  {copiedToken === link.token ? "Copied!" : "Copy Link"}
                </button>
                <button onClick={() => deleteShareLink(link.id)}
                  className="rounded-lg border border-cream/10 px-3 py-2 font-heading text-[0.85rem] text-cream/40 transition hover:border-red-400/40 hover:text-red-400">
                  Delete
                </button>
              </div>
            </div>
          ))}

          {/* Create new link */}
          <div className="mt-6 rounded-xl border border-cream/10 p-5">
            <p className="mb-4 font-heading text-[0.95rem] font-bold text-cream">Create a new share link</p>
            <input
              value={newLinkLabel}
              onChange={e => setNewLinkLabel(e.target.value)}
              placeholder='e.g. "For my walker" or "For my vet"'
              className="mb-4 w-full rounded-xl bg-slate/40 px-4 py-3 text-[0.95rem] text-cream placeholder-cream/30 outline-none ring-1 ring-cream/10 transition focus:ring-orange"
            />
            <p className="mb-3 font-heading text-[0.8rem] font-bold text-cream/50">Visible sections:</p>
            <div className="mb-5 flex flex-wrap gap-3">
              {(["show_basics", "show_safety", "show_routine", "show_behavior"] as const).map(key => {
                const label = key.replace("show_", "").charAt(0).toUpperCase() + key.replace("show_", "").slice(1);
                return (
                  <button key={key} type="button"
                    onClick={() => setNewLinkVisibility(p => ({ ...p, [key]: !p[key] }))}
                    className={`rounded-lg px-4 py-2 font-heading text-[0.85rem] font-bold transition ${
                      newLinkVisibility[key] ? "bg-orange text-cream" : "bg-slate/40 text-cream/40"
                    }`}>
                    {label}
                  </button>
                );
              })}
            </div>
            <button onClick={createShareLink} disabled={creatingLink || !newLinkLabel.trim()}
              className="rounded-xl bg-orange px-6 py-3 font-heading text-[0.9rem] font-bold text-cream transition hover:bg-orange-dark disabled:opacity-40">
              {creatingLink ? "Creating..." : "Create Link"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-navy p-7">
      <h2 className="mb-5 font-heading text-[1.1rem] font-extrabold text-cream">{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number | boolean | null | undefined }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[0.78rem] font-bold uppercase tracking-wide text-cream/40">{label}</p>
      <p className="text-[0.95rem] capitalize text-cream/80">{String(value)}</p>
    </div>
  );
}
