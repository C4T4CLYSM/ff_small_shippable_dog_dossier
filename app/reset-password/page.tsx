"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError(error.message); setLoading(false); return; }
    setSuccess(true);
    setTimeout(() => { window.location.href = "/dashboard"; }, 2000);
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-50 bg-navy py-[18px]">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6">
          <a href="/">
            <Image src="/wordmark.png" alt="Dog Dossier" width={160} height={40} className="object-contain sm:w-[220px]" priority />
          </a>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px] rounded-2xl bg-navy p-10 shadow-[0_20px_60px_rgba(30,41,59,0.18)]">
          {success ? (
            <div className="text-center">
              <p className="mb-2 font-heading text-[1.3rem] font-extrabold text-cream">Password updated!</p>
              <p className="font-sub text-[0.95rem] italic text-cream/60">Taking you to your dashboard...</p>
            </div>
          ) : !ready ? (
            <p className="text-center font-heading text-[0.95rem] text-cream/60">Verifying your link...</p>
          ) : (
            <>
              <h1 className="mb-2 font-heading text-[1.6rem] font-extrabold text-cream">New password</h1>
              <p className="mb-8 font-sub text-[0.95rem] italic text-cream/60">
                Enter a new password for your account.
              </p>
              <form onSubmit={handleReset} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="font-heading text-[0.85rem] font-bold text-cream/70">New password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="rounded-xl bg-slate/50 px-4 py-3 text-[0.95rem] text-cream placeholder-cream/30 outline-none ring-1 ring-cream/10 transition focus:ring-orange"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-heading text-[0.85rem] font-bold text-cream/70">Confirm password</label>
                  <input
                    type="password"
                    required
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Repeat your password"
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
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
