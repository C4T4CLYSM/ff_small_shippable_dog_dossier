"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

const INSTAGRAM_URL = "https://www.instagram.com/dogdossier/";
const STRIPE_LINK = "https://buy.stripe.com/5kQ3cu1xZcu78CLfF6cjS01";

const IconInstagram = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/check-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    const { paid } = await res.json();

    if (!paid) {
      setError("No payment found for this email. Please purchase founder access first.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <div className="min-h-screen bg-navy">
      {/* Nav header */}
      <header className="sticky top-0 z-50 bg-navy py-[18px]">
        <div className="px-6 lg:px-10">
          <a href="/">
            <Image src="/wordmark.png" alt="Dog Dossier" width={160} height={40} className="object-contain sm:w-[220px]" priority />
          </a>
        </div>
      </header>

      <main className="flex flex-col min-h-[calc(100vh-80px)] bg-cream lg:bg-navy lg:flex-row">
        {/* Mobile-only headline */}
        <div className="lg:hidden px-6 pb-6 pt-10">
          <h2 className="font-heading text-[1.8rem] font-extrabold leading-tight text-navy">
            Your dog deserves<br />a dossier.
          </h2>
          <p className="mt-2 font-sub text-[1rem] italic text-slate">
            Set up in minutes. Share instantly.
          </p>
        </div>

        {/* Left form panel — cream with rounded right corners on desktop */}
        <div className="flex flex-1 items-center justify-center bg-cream px-6 py-12 lg:rounded-r-[2.5rem]">
          <div className="w-full max-w-[420px]">
            <div className="rounded-2xl bg-navy p-10 shadow-[0_20px_60px_rgba(30,41,59,0.18)]">
              <h1 className="mb-2 font-heading text-[1.6rem] font-extrabold text-cream">Create your account</h1>
              <p className="mb-8 font-sub text-[0.95rem] italic text-cream/60">
                Use the email you paid with on Stripe.
              </p>
              <form onSubmit={handleSignup} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="font-heading text-[0.85rem] font-bold text-cream/70">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="rounded-xl bg-slate/50 px-4 py-3 text-[0.95rem] text-cream placeholder-cream/30 outline-none ring-1 ring-cream/10 transition focus:ring-orange"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-heading text-[0.85rem] font-bold text-cream/70">Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="rounded-xl bg-slate/50 px-4 py-3 text-[0.95rem] text-cream placeholder-cream/30 outline-none ring-1 ring-cream/10 transition focus:ring-orange"
                  />
                </div>
                {error && (
                  <div className="rounded-xl bg-red-500/10 px-4 py-3">
                    <p className="text-[0.9rem] text-red-400">{error}</p>
                    {error.includes("purchase founder access") && (
                      <a href={STRIPE_LINK} target="_blank" rel="noopener noreferrer"
                        className="mt-2 block font-heading text-[0.85rem] font-bold text-orange hover:underline">
                        Buy founder access →
                      </a>
                    )}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 rounded-[10px] bg-orange py-3.5 font-heading text-[1rem] font-bold text-cream transition hover:bg-orange-dark disabled:opacity-50"
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>
              </form>
              <p className="mt-6 text-center text-[0.85rem] text-cream/40">
                Already have an account?{" "}
                <a href="/login" className="text-orange hover:underline">Log in</a>
              </p>
            </div>
          </div>
        </div>

        {/* Right brand panel — desktop only */}
        <div className="relative hidden overflow-hidden lg:flex lg:w-[45%] flex-col justify-center px-16 py-20">
          <Image src="/signup-hero.png" alt="" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-navy/60" />
          <div className="relative z-10">
            <h2 className="mb-4 font-heading text-[2rem] font-extrabold leading-tight text-cream">
              Your dog deserves<br />a dossier.
            </h2>
            <p className="mb-10 font-sub text-[1rem] italic text-cream/60">
              Set up in minutes. Share instantly.
            </p>
            <ul className="flex flex-col gap-5">
              {[
                "Health records, medications, and allergies in one place",
                "Custom share links for walkers, vets, and boarding",
                "Your dog's info is always current — update once, share forever",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-[6px] h-2 w-2 flex-shrink-0 rounded-full bg-orange" />
                  <span className="text-[0.95rem] leading-relaxed text-cream/70">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-12 border-t border-cream/10 pt-8">
              <p className="font-sub text-[0.85rem] italic text-cream/40">
                Haven&apos;t purchased yet?{" "}
                <a href={STRIPE_LINK} target="_blank" rel="noopener noreferrer"
                  className="text-orange hover:underline">
                  Get founder access for $29 →
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-navy px-6 lg:px-10 py-10">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-6 border-b border-cream/10 pb-8">
            <a href="/">
              <Image src="/wordmark.png" alt="Dog Dossier" width={150} height={40} className="object-contain" />
            </a>
            <nav className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <a href="/" className="font-heading text-[0.85rem] text-cream/50 transition hover:text-cream">Home</a>
              <a href="/privacy" className="font-heading text-[0.85rem] text-cream/50 transition hover:text-cream">Privacy Policy</a>
              <a href="/terms" className="font-heading text-[0.85rem] text-cream/50 transition hover:text-cream">Terms of Use</a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="font-heading text-[0.85rem] text-cream/50 transition hover:text-cream">Contact</a>
            </nav>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-6">
            <span className="text-[0.82rem] text-cream/40">© 2026 Dog Dossier. All rights reserved.</span>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-cream/40 transition hover:text-cream/80">
              <IconInstagram />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
