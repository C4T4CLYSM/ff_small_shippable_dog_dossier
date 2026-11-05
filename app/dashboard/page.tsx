"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import type { Dog, DogSafety, DogRoutine, DogBehavior } from "@/types/database";
import SiteFooter from "@/app/components/SiteFooter";

type SafetySummary = Pick<DogSafety, "dog_id" | "emergency_contact_phone" | "vet_name" | "vet_phone" | "microchip_number">;
type RoutineSummary = Pick<DogRoutine, "dog_id" | "feeding_schedule" | "walk_schedule">;
type BehaviorSummary = Pick<DogBehavior, "dog_id" | "good_with_kids" | "good_with_dogs" | "good_with_cats" | "known_fears" | "known_commands">;

type DogCard = {
  dog: Dog;
  photoCount: number;
  linkCount: number;
  percent: number;
  done: string[];     // sections that are filled in
  missing: string[];  // most useful details still to add
};

// What makes a profile "complete". Each item counts equally towards the percentage.
function summarize(
  dog: Dog,
  safety: SafetySummary | undefined,
  routine: RoutineSummary | undefined,
  behavior: BehaviorSummary | undefined,
  photoCount: number,
  linkCount: number,
): DogCard {
  const checks: { ok: boolean; missing: string }[] = [
    { ok: photoCount > 0 || !!dog.photo_url, missing: "No photos" },
    { ok: !!safety?.emergency_contact_phone, missing: "No emergency contact" },
    { ok: !!(safety?.vet_name || safety?.vet_phone), missing: "No vet" },
    { ok: !!safety?.microchip_number, missing: "No microchip" },
    { ok: !!(dog.date_of_birth && dog.weight_lbs), missing: "Basic info missing" },
    { ok: !!(routine && (routine.feeding_schedule?.length || routine.walk_schedule)), missing: "No routine" },
    { ok: !!(behavior && (behavior.good_with_kids || behavior.good_with_dogs || behavior.good_with_cats
      || behavior.known_fears || behavior.known_commands)), missing: "No behavior notes" },
  ];
  const [, emergency, vet, , , routineOk, behaviorOk] = checks.map(c => c.ok);
  const done = [
    emergency && vet && "Safety",
    routineOk && "Routine",
    behaviorOk && "Behavior",
  ].filter((s): s is string => !!s);

  return {
    dog,
    photoCount,
    linkCount,
    percent: Math.round((checks.filter(c => c.ok).length / checks.length) * 100),
    done,
    missing: checks.filter(c => !c.ok).map(c => c.missing),
  };
}

function age(dateOfBirth: string | null) {
  if (!dateOfBirth) return null;
  const born = new Date(dateOfBirth);
  const now = new Date();
  const months = (now.getFullYear() - born.getFullYear()) * 12 + now.getMonth() - born.getMonth()
    - (now.getDate() < born.getDate() ? 1 : 0);
  if (months < 0) return null;
  if (months < 12) return `${months} month${months === 1 ? "" : "s"}`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"}`;
}

function countBy(rows: { dog_id: string }[] | null) {
  const counts: Record<string, number> = {};
  for (const r of rows ?? []) counts[r.dog_id] = (counts[r.dog_id] ?? 0) + 1;
  return counts;
}

export default function DashboardPage() {
  const [cards, setCards] = useState<DogCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [initial, setInitial] = useState("?");
  const [isFounder, setIsFounder] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      const userId = session.user.id;
      const [dogsRes, userRes, profileRes, safetyRes, routineRes, behaviorRes, photosRes, linksRes] = await Promise.all([
        supabase.from("dogs").select("*").order("created_at", { ascending: true }),
        supabase.from("users").select("is_founder").eq("id", userId).maybeSingle(),
        supabase.from("user_profiles").select("first_name").eq("user_id", userId).maybeSingle(),
        supabase.from("dog_safety").select("dog_id, emergency_contact_phone, vet_name, vet_phone, microchip_number"),
        supabase.from("dog_routine").select("dog_id, feeding_schedule, walk_schedule"),
        supabase.from("dog_behavior").select("dog_id, good_with_kids, good_with_dogs, good_with_cats, known_fears, known_commands"),
        supabase.from("dog_photos").select("dog_id"),
        supabase.from("dog_share_links").select("dog_id"),
      ]);

      const name = profileRes.data?.first_name?.trim() || null;
      setFirstName(name);
      setInitial((name ?? session.user.email ?? "?").charAt(0).toUpperCase());
      setIsFounder(!!userRes.data?.is_founder);

      const safety = new Map((safetyRes.data ?? []).map(s => [s.dog_id, s]));
      const routine = new Map((routineRes.data ?? []).map(r => [r.dog_id, r]));
      const behavior = new Map((behaviorRes.data ?? []).map(b => [b.dog_id, b]));
      const photoCounts = countBy(photosRes.data);
      const linkCounts = countBy(linksRes.data);

      setCards((dogsRes.data ?? []).map(dog => summarize(
        dog, safety.get(dog.id), routine.get(dog.id), behavior.get(dog.id),
        photoCounts[dog.id] ?? 0, linkCounts[dog.id] ?? 0,
      )));
      setLoading(false);
    }

    load();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="font-heading text-navy">Loading...</p>
      </div>
    );
  }

  const totalLinks = cards.reduce((n, c) => n + c.linkCount, 0);
  const averagePercent = cards.length
    ? Math.round(cards.reduce((n, c) => n + c.percent, 0) / cards.length)
    : 0;

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-navy py-[18px]">
        <div className="flex items-center justify-between px-6 lg:px-10">
          <a href="/">
            <Image src="/wordmark.png" alt="Dog Dossier" width={180} height={44} className="object-contain" priority />
          </a>

          {/* Wider screens: both buttons */}
          <div className="hidden items-center gap-4 sm:flex">
            <a
              href="/dashboard/settings"
              className="rounded-[10px] border border-cream/20 px-4 py-2 font-heading text-[0.9rem] text-cream/70 transition hover:border-cream/40 hover:text-cream"
            >
              Settings
            </a>
            <button
              onClick={handleLogout}
              className="rounded-[10px] border border-cream/20 px-4 py-2 font-heading text-[0.9rem] text-cream/70 transition hover:border-cream/40 hover:text-cream"
            >
              Log out
            </button>
          </div>

          {/* Phones: a menu behind the account initial */}
          <div className="relative sm:hidden">
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Account menu"
              aria-expanded={menuOpen}
              className="grid h-9 w-9 place-items-center rounded-full bg-orange font-heading text-[0.85rem] font-extrabold text-cream"
            >
              {initial}
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-11 w-44 overflow-hidden rounded-xl bg-white py-1 shadow-[0_12px_32px_rgba(30,41,59,0.25)]">
                  <a href="/dashboard/settings" className="block px-4 py-2.5 font-heading text-[0.9rem] text-navy hover:bg-cream">
                    Settings
                  </a>
                  <button onClick={handleLogout} className="block w-full px-4 py-2.5 text-left font-heading text-[0.9rem] text-navy hover:bg-cream">
                    Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1100px] flex-1 px-6 py-12">
        {/* Greeting */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            {isFounder && (
              <p className="mb-1.5 flex items-center gap-2 font-heading text-[0.72rem] font-bold uppercase tracking-[0.14em] text-orange-dark">
                <span aria-hidden="true" className="h-0.5 w-[18px] bg-orange" />
                Founding member
              </p>
            )}
            <h1 className="font-heading text-[2rem] font-extrabold leading-tight tracking-tight text-navy">
              {firstName ? `Hi, ${firstName}` : "Welcome back"}
            </h1>
            <p className="mt-1 font-sub text-[0.95rem] italic text-slate">
              {cards.length === 0
                ? "Add your first dog to get started."
                : "Everything your dogs’ people need, in one place."}
            </p>
          </div>
          <a
            href="/dashboard/new"
            className="rounded-[10px] bg-orange px-6 py-3 font-heading text-[0.95rem] font-bold text-cream transition hover:-translate-y-0.5 hover:bg-orange-dark hover:shadow-[0_6px_20px_rgba(234,88,12,0.35)]"
          >
            + Add Dog
          </a>
        </div>

        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-navy/20 py-24 text-center">
            <p className="mb-6 font-heading text-[1.1rem] text-navy/40">No dogs yet</p>
            <a
              href="/dashboard/new"
              className="rounded-[10px] bg-orange px-6 py-3 font-heading text-[0.95rem] font-bold text-cream transition hover:bg-orange-dark"
            >
              + Add your first dog
            </a>
          </div>
        ) : (
          <>
            {/* At a glance */}
            <div className="mb-8 grid grid-cols-3 gap-3 sm:gap-4">
              <Stat value={cards.length} label={cards.length === 1 ? "Dog in your dossier" : "Dogs in your dossier"} short="Dogs" />
              <Stat value={totalLinks} label={totalLinks === 1 ? "Share link" : "Share links"} short="Share links" />
              <Stat value={`${averagePercent}%`} label="Profiles complete" short="Complete" />
            </div>

            {/* Dog cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map(card => <DogCardView key={card.dog.id} card={card} />)}

              <a
                href="/dashboard/new"
                className="group flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-navy/20 p-6 text-center transition hover:border-orange"
              >
                <span className="grid h-12 w-12 place-items-center rounded-full bg-white font-heading text-[1.6rem] text-orange shadow-[0_2px_10px_rgba(30,41,59,0.08)] transition group-hover:scale-105">
                  +
                </span>
                <span className="font-heading text-[1rem] font-bold text-navy">Add another dog</span>
                <span className="text-[0.85rem] text-slate">Every dog gets its own profile and share links.</span>
              </a>
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function Stat({ value, label, short }: { value: string | number; label: string; short: string }) {
  return (
    <div className="rounded-2xl bg-white px-3 py-3 shadow-[0_2px_12px_rgba(30,41,59,0.06)] sm:px-5 sm:py-4">
      <p className="font-heading text-[1.25rem] font-extrabold leading-tight text-navy sm:text-[1.6rem]">{value}</p>
      <p className="text-[0.7rem] text-slate sm:hidden">{short}</p>
      <p className="hidden text-[0.8rem] text-slate sm:block">{label}</p>
    </div>
  );
}

function DogCardView({ card }: { card: DogCard }) {
  const { dog, photoCount, percent, done, missing } = card;
  const href = `/dashboard/dog/${dog.id}`;
  const details = [dog.breed, age(dog.date_of_birth)].filter(Boolean).join(" · ");

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-navy text-cream transition hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(30,41,59,0.18)]">
      <a href={href} className="relative block aspect-[4/3] bg-slate" aria-label={`View ${dog.name}'s profile`}>
        {dog.photo_url ? (
          <Image
            src={dog.photo_url}
            alt={dog.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
            className="object-cover object-[center_30%]"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-[3rem]">🐾</span>
        )}
        {photoCount > 1 && (
          <span className="absolute bottom-2.5 left-2.5 rounded-full bg-navy/75 px-2.5 py-0.5 font-heading text-[0.72rem] font-semibold text-white">
            {photoCount} photos
          </span>
        )}
      </a>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h2 className="font-heading text-[1.2rem] font-extrabold leading-tight">
            <a href={href} className="hover:underline">{dog.name}</a>
          </h2>
          {details && <p className="mt-0.5 text-[0.85rem] text-cream/60">{details}</p>}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {done.map(d => (
            <span key={d} className="rounded-full bg-cream/10 px-2.5 py-0.5 text-[0.72rem] font-semibold text-cream/80">
              <span className="text-green-400">✓</span> {d}
            </span>
          ))}
          {missing.slice(0, 2).map(m => (
            <span key={m} className="rounded-full bg-cream/10 px-2.5 py-0.5 text-[0.72rem] font-semibold text-cream/80">
              <span className="font-extrabold text-orange">!</span> {m}
            </span>
          ))}
          {missing.length === 0 && (
            <span className="rounded-full bg-cream/10 px-2.5 py-0.5 text-[0.72rem] font-semibold text-cream/80">
              <span className="text-green-400">✓</span> Profile complete
            </span>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex justify-between text-[0.75rem] text-cream/60">
            <span>Profile</span>
            <span>{percent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-cream/10" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={`${dog.name}'s profile is ${percent}% complete`}>
            <div className="h-full rounded-full bg-orange" style={{ width: `${percent}%` }} />
          </div>
        </div>

        <div className="mt-auto grid grid-cols-3 gap-2">
          <a href={href} className="rounded-[9px] bg-orange py-2 text-center font-heading text-[0.82rem] font-bold transition hover:bg-orange-dark">View</a>
          <a href={`${href}/edit`} className="rounded-[9px] bg-cream/10 py-2 text-center font-heading text-[0.82rem] font-bold transition hover:bg-cream/20">Edit</a>
          <a href={`${href}#share-links`} className="rounded-[9px] bg-cream/10 py-2 text-center font-heading text-[0.82rem] font-bold transition hover:bg-cream/20">Share</a>
        </div>
      </div>
    </div>
  );
}
