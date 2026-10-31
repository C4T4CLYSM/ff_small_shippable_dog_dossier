"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const inputClass =
  "w-full rounded-xl bg-slate/50 px-4 py-3 text-[0.95rem] text-cream placeholder-cream/30 outline-none ring-1 ring-cream/10 transition focus:ring-orange";

export default function ChangePassword({ email }: { email: string }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleChange(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (next.length < 8) { setMessage({ ok: false, text: "Your new password must be at least 8 characters." }); return; }
    if (next !== confirm) { setMessage({ ok: false, text: "The new passwords don't match." }); return; }
    if (next === current) { setMessage({ ok: false, text: "Choose a password different from your current one." }); return; }

    setSaving(true);
    // Check the current password first, so someone at an unlocked computer can't change it
    const { error: checkError } = await supabase.auth.signInWithPassword({ email, password: current });
    if (checkError) {
      setSaving(false);
      setMessage({ ok: false, text: "Your current password is incorrect." });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: next });
    setSaving(false);
    if (error) { setMessage({ ok: false, text: error.message }); return; }
    setCurrent(""); setNext(""); setConfirm("");
    setMessage({ ok: true, text: "Password changed." });
  }

  return (
    <div className="mb-6 rounded-2xl bg-navy p-7">
      <h2 className="mb-6 font-heading text-[1.1rem] font-extrabold text-cream">Change Password</h2>
      <form onSubmit={handleChange} className="flex flex-col gap-5">
        {/* Lets password managers match this form to the account */}
        <input type="email" value={email} autoComplete="username" readOnly hidden />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="current-password" className="font-heading text-[0.85rem] font-bold text-cream/70">Current password</label>
          <input id="current-password" type="password" required value={current} onChange={e => setCurrent(e.target.value)}
            autoComplete="current-password" className={inputClass} />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-password" className="font-heading text-[0.85rem] font-bold text-cream/70">New password</label>
            <input id="new-password" type="password" required minLength={8} value={next} onChange={e => setNext(e.target.value)}
              placeholder="Min. 8 characters" autoComplete="new-password" className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirm-password" className="font-heading text-[0.85rem] font-bold text-cream/70">Confirm new password</label>
            <input id="confirm-password" type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat your new password" autoComplete="new-password" className={inputClass} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={saving}
            className="rounded-[10px] bg-orange px-5 py-2.5 font-heading text-[0.9rem] font-bold text-cream transition hover:bg-orange-dark disabled:opacity-50">
            {saving ? "Changing..." : "Change Password"}
          </button>
          {message && (
            <p role="status" className={`text-[0.88rem] ${message.ok ? "text-green-400" : "text-red-400"}`}>{message.text}</p>
          )}
        </div>
      </form>
    </div>
  );
}
