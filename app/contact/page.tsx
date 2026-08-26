"use client";

import { useState } from "react";
import Image from "next/image";
import SiteFooter from "@/app/components/SiteFooter";

type Status = "idle" | "loading" | "success" | "error";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      setStatus("success");
    } else {
      setStatus("error");
      setErrorMsg(data.error || "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="sticky top-0 z-50 bg-navy py-[18px]">
        <div className="flex items-center justify-between px-6 lg:px-10">
          <a href="/">
            <Image src="/wordmark.png" alt="Dog Dossier" width={180} height={44} className="object-contain" />
          </a>
          <a href="/" className="font-heading text-[0.9rem] text-cream/60 transition hover:text-cream">
            ← Back
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[620px] flex-1 px-6 py-16">
        <h1 className="mb-2 font-heading text-[2.2rem] font-extrabold text-navy">Contact Us</h1>
        <p className="mb-10 font-sub text-[1rem] italic text-slate">
          Have a question or feedback? We'd love to hear from you.
        </p>

        {status === "success" ? (
          <div className="rounded-2xl bg-navy px-8 py-10 text-center">
            <p className="font-heading text-[1.2rem] font-bold text-cream">Message sent!</p>
            <p className="mt-2 font-sub text-[0.95rem] italic text-cream/60">
              Thanks for reaching out. We'll get back to you soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="font-heading text-[0.8rem] font-bold uppercase tracking-wide text-navy/50">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={update("name")}
                  placeholder="Your name"
                  className="rounded-xl border border-navy/15 bg-white px-4 py-3 text-[0.95rem] text-navy placeholder-slate/40 outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/10"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-heading text-[0.8rem] font-bold uppercase tracking-wide text-navy/50">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={update("email")}
                  placeholder="your@email.com"
                  className="rounded-xl border border-navy/15 bg-white px-4 py-3 text-[0.95rem] text-navy placeholder-slate/40 outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/10"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-heading text-[0.8rem] font-bold uppercase tracking-wide text-navy/50">Subject</label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={update("subject")}
                placeholder="What's this about?"
                className="rounded-xl border border-navy/15 bg-white px-4 py-3 text-[0.95rem] text-navy placeholder-slate/40 outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/10"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-heading text-[0.8rem] font-bold uppercase tracking-wide text-navy/50">Message</label>
              <textarea
                required
                rows={6}
                value={form.message}
                onChange={update("message")}
                placeholder="Your message..."
                className="resize-none rounded-xl border border-navy/15 bg-white px-4 py-3 text-[0.95rem] text-navy placeholder-slate/40 outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/10"
              />
            </div>

            {status === "error" && (
              <p className="text-[0.85rem] text-red-500">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="self-start rounded-xl bg-orange px-8 py-3.5 font-heading text-[0.95rem] font-bold text-cream transition hover:-translate-y-0.5 hover:bg-orange-dark hover:shadow-[0_6px_20px_rgba(234,88,12,0.35)] disabled:opacity-50"
            >
              {status === "loading" ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
