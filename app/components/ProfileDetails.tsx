"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const inputClass =
  "w-full rounded-xl bg-slate/50 px-4 py-3 text-[0.95rem] text-cream placeholder-cream/30 outline-none ring-1 ring-cream/10 transition focus:ring-orange";

// Optional details about the account holder. Stored in user_profiles, which the
// share-link API never reads.
export default function ProfileDetails({ userId }: { userId: string }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    supabase.from("user_profiles").select("first_name, last_name, phone").eq("user_id", userId).maybeSingle()
      .then(({ data }) => {
        setFirstName(data?.first_name ?? "");
        setLastName(data?.last_name ?? "");
        setPhone(data?.phone ?? "");
        setLoading(false);
      });
  }, [userId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const { error } = await supabase.from("user_profiles").upsert({
      user_id: userId,
      first_name: firstName.trim() || null,
      last_name: lastName.trim() || null,
      phone: phone.trim() || null,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    setMessage(error ? { ok: false, text: "Couldn't save your details. Please try again." } : { ok: true, text: "Details saved." });
  }

  return (
    <div className="mb-6 rounded-2xl bg-navy p-7">
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <h2 className="font-heading text-[1.1rem] font-extrabold text-cream">Your Details</h2>
        <span className="rounded-full bg-cream/10 px-2.5 py-0.5 font-heading text-[0.7rem] font-bold uppercase tracking-wide text-cream/60">
          Optional
        </span>
      </div>
      <p className="mb-6 text-[0.88rem] leading-relaxed text-cream/50">
        All fields are optional. Only you can see them, and they never appear on your dogs&apos; share links.
      </p>

      {loading ? (
        <p className="text-[0.9rem] text-cream/50">Loading...</p>
      ) : (
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="first-name" className="font-heading text-[0.85rem] font-bold text-cream/70">First name</label>
              <input id="first-name" value={firstName} onChange={e => setFirstName(e.target.value)}
                maxLength={100} autoComplete="given-name" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="last-name" className="font-heading text-[0.85rem] font-bold text-cream/70">Last name</label>
              <input id="last-name" value={lastName} onChange={e => setLastName(e.target.value)}
                maxLength={100} autoComplete="family-name" className={inputClass} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="font-heading text-[0.85rem] font-bold text-cream/70">Phone number</label>
            <input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              maxLength={30} autoComplete="tel" className={inputClass} />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" disabled={saving}
              className="rounded-[10px] bg-orange px-5 py-2.5 font-heading text-[0.9rem] font-bold text-cream transition hover:bg-orange-dark disabled:opacity-50">
              {saving ? "Saving..." : "Save Details"}
            </button>
            {message && (
              <p role="status" className={`text-[0.88rem] ${message.ok ? "text-green-400" : "text-red-400"}`}>{message.text}</p>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
