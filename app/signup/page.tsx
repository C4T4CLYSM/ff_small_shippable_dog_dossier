"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Verify payment before allowing account creation
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 py-12">
      <a href="/">
        <Image src="/wordmark.png" alt="Dog Dossier" width={200} height={48} className="mb-10 object-contain" />
      </a>

      <div className="w-full max-w-[420px] rounded-2xl bg-navy p-10 shadow-[0_20px_60px_rgba(30,41,59,0.18)]">
        <h1 className="mb-2 font-heading text-[1.6rem] font-extrabold text-cream">
          Create your account
        </h1>
        <p className="mb-8 font-sub text-[0.95rem] italic text-cream/60">
          Use the email you paid with on Stripe.
        </p>

        <form onSubmit={handleSignup} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="font-heading text-[0.85rem] font-bold text-cream/70">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-xl bg-slate/50 px-4 py-3 text-[0.95rem] text-cream placeholder-cream/30 outline-none ring-1 ring-cream/10 transition focus:ring-orange"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-heading text-[0.85rem] font-bold text-cream/70">
              Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="rounded-xl bg-slate/50 px-4 py-3 text-[0.95rem] text-cream placeholder-cream/30 outline-none ring-1 ring-cream/10 transition focus:ring-orange"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-500/10 px-4 py-3 text-[0.9rem] text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-xl bg-orange py-3.5 font-heading text-[1rem] font-bold text-cream transition hover:bg-orange-dark disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-[0.85rem] text-cream/40">
          Already have an account?{" "}
          <a href="/login" className="text-orange hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
