"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    window.location.href = "/dashboard";
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://dogdossier.app/reset-password",
    });
    if (error) { setError(error.message); setLoading(false); return; }
    setResetSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav header */}
      <header className="bg-navy py-[18px]">
        <div className="mx-auto max-w-[1100px] px-6">
          <a href="/">
            <Image src="/wordmark-logo.png" alt="Dog Dossier" width={180} height={44} className="object-contain" />
          </a>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-80px)]">
        {/* Left brand panel — desktop only */}
        <div className="hidden lg:flex lg:w-[45%] flex-col justify-center bg-navy px-16 py-20">
          <h2 className="mb-4 font-heading text-[2rem] font-extrabold leading-tight text-cream">
            Your dog&apos;s information,<br />always at hand.
          </h2>
          <p className="mb-10 font-sub text-[1rem] italic text-cream/60">
            One profile. Every caregiver covered.
          </p>
          <ul className="flex flex-col gap-5">
            {[
              "Shareable links and QR codes for walkers, vets, and sitters",
              "Emergency contacts and medical info in one place",
              "Update once — everyone sees the latest",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-[6px] h-2 w-2 flex-shrink-0 rounded-full bg-orange" />
                <span className="text-[0.95rem] leading-relaxed text-cream/70">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right form panel */}
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-[420px]">

            {forgotMode ? (
              resetSent ? (
                <div className="rounded-2xl bg-navy p-10 text-center shadow-[0_20px_60px_rgba(30,41,59,0.18)]">
                  <p className="mb-2 font-heading text-[1.3rem] font-extrabold text-cream">Check your email</p>
                  <p className="mb-6 font-sub text-[0.95rem] italic text-cream/60">
                    We sent a reset link to <span className="text-cream/80">{email}</span>.
                  </p>
                  <button
                    onClick={() => { setForgotMode(false); setResetSent(false); }}
                    className="font-heading text-[0.9rem] text-orange hover:underline"
                  >
                    ← Back to login
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl bg-navy p-10 shadow-[0_20px_60px_rgba(30,41,59,0.18)]">
                  <h1 className="mb-2 font-heading text-[1.6rem] font-extrabold text-cream">Reset password</h1>
                  <p className="mb-8 font-sub text-[0.95rem] italic text-cream/60">
                    Enter your email and we&apos;ll send you a reset link.
                  </p>
                  <form onSubmit={handleForgotPassword} className="flex flex-col gap-5">
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
                    {error && (
                      <p className="rounded-xl bg-red-500/10 px-4 py-3 text-[0.9rem] text-red-400">{error}</p>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-2 rounded-[10px] bg-orange py-3.5 font-heading text-[1rem] font-bold text-cream transition hover:bg-orange-dark disabled:opacity-50"
                    >
                      {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                  </form>
                  <button
                    onClick={() => { setForgotMode(false); setError(null); }}
                    className="mt-6 block w-full text-center font-heading text-[0.85rem] text-cream/40 transition hover:text-cream/70"
                  >
                    ← Back to login
                  </button>
                </div>
              )
            ) : (
              <div className="rounded-2xl bg-navy p-10 shadow-[0_20px_60px_rgba(30,41,59,0.18)]">
                <h1 className="mb-2 font-heading text-[1.6rem] font-extrabold text-cream">Welcome back</h1>
                <p className="mb-8 font-sub text-[0.95rem] italic text-cream/60">
                  Log in to manage your dog profiles.
                </p>
                <form onSubmit={handleLogin} className="flex flex-col gap-5">
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
                    <div className="flex items-center justify-between">
                      <label className="font-heading text-[0.85rem] font-bold text-cream/70">Password</label>
                      <button
                        type="button"
                        onClick={() => { setForgotMode(true); setError(null); }}
                        className="font-heading text-[0.8rem] text-orange transition hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Your password"
                      className="rounded-xl bg-slate/50 px-4 py-3 text-[0.95rem] text-cream placeholder-cream/30 outline-none ring-1 ring-cream/10 transition focus:ring-orange"
                    />
                  </div>
                  {error && (
                    <p className="rounded-xl bg-red-500/10 px-4 py-3 text-[0.9rem] text-red-400">{error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 rounded-[10px] bg-orange py-3.5 font-heading text-[1rem] font-bold text-cream transition hover:bg-orange-dark disabled:opacity-50"
                  >
                    {loading ? "Logging in..." : "Log in"}
                  </button>
                </form>
                <p className="mt-6 text-center text-[0.85rem] text-cream/40">
                  Don&apos;t have an account?{" "}
                  <a href="/signup" className="text-orange hover:underline">Sign up</a>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
