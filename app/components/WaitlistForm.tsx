"use client";

import { useState } from "react";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "duplicate">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, website }),
    });

    const data = await res.json();

    if (res.ok) {
      setStatus("success");
    } else if (res.status === 409) {
      setStatus("duplicate");
    } else {
      setStatus("error");
      setErrorMsg(data.error || "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl bg-navy px-8 py-6 text-center">
        <p className="font-heading text-[1.1rem] font-bold text-cream">You&apos;re on the list!</p>
        <p className="mt-1 font-sub text-[0.9rem] italic text-cream/60">
          We&apos;ll reach out when Dog Dossier is ready for you.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Honeypot: hidden from people, bots fill it in */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={e => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          maxLength={254}
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 rounded-xl border border-navy/20 bg-white px-5 py-3.5 text-[0.95rem] text-navy placeholder-slate/40 outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/10"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-xl bg-navy px-7 py-3.5 font-heading text-[0.95rem] font-bold text-cream transition hover:bg-slate disabled:opacity-50"
        >
          {status === "loading" ? "Joining..." : "Join waitlist"}
        </button>
      </div>
      {(status === "error" || status === "duplicate") && (
        <p className="mt-3 text-center text-[0.85rem] text-red-500">
          {status === "duplicate" ? "You're already on the waitlist!" : errorMsg}
        </p>
      )}
    </form>
  );
}
