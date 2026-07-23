"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import type { Dog } from "@/types/database";

export default function DashboardPage() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      setUserEmail(session.user.email ?? null);

      const { data } = await supabase
        .from("dogs")
        .select("*")
        .order("created_at", { ascending: true });

      setDogs(data ?? []);
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

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-navy py-[18px]">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6">
          <a href="/">
            <Image src="/wordmark.png" alt="Dog Dossier" width={180} height={44} className="object-contain" priority />
          </a>
          <div className="flex items-center gap-4">
            <span className="hidden text-[0.85rem] text-cream/50 sm:block">{userEmail}</span>
            <button
              onClick={handleLogout}
              className="rounded-[10px] border border-cream/20 px-4 py-2 font-heading text-[0.9rem] text-cream/70 transition hover:border-cream/40 hover:text-cream"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-6 py-12">
        {/* Page title */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-[2rem] font-extrabold text-navy">Your Dogs</h1>
            <p className="mt-1 font-sub text-[0.95rem] italic text-slate">
              {dogs.length === 0
                ? "Add your first dog to get started."
                : `${dogs.length} dog${dogs.length > 1 ? "s" : ""} in your dossier.`}
            </p>
          </div>
          <a
            href="/dashboard/new"
            className="rounded-[10px] bg-orange px-6 py-3 font-heading text-[0.95rem] font-bold text-cream transition hover:-translate-y-0.5 hover:bg-orange-dark hover:shadow-[0_6px_20px_rgba(234,88,12,0.35)]"
          >
            + Add Dog
          </a>
        </div>

        {/* Dog cards */}
        {dogs.length === 0 ? (
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {dogs.map((dog) => (
              <a
                key={dog.id}
                href={`/dashboard/dog/${dog.id}`}
                className="group rounded-2xl border-t-[3px] border-orange bg-navy p-7 transition hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(30,41,59,0.18)]"
              >
                <div className="mb-4 flex items-center gap-4">
                  {dog.photo_url ? (
                    <div className="relative h-14 w-14 overflow-hidden rounded-full">
                      <Image src={dog.photo_url} alt={dog.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate text-[1.6rem]">
                      🐾
                    </div>
                  )}
                  <div>
                    <h2 className="font-heading text-[1.2rem] font-bold text-cream">{dog.name}</h2>
                    {dog.breed && (
                      <p className="text-[0.85rem] text-cream/50">{dog.breed}</p>
                    )}
                  </div>
                </div>
                <p className="text-[0.85rem] text-cream/40 transition group-hover:text-cream/60">
                  View profile →
                </p>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
