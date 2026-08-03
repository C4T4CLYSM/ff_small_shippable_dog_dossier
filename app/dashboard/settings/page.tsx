"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export default function SettingsPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = "/login"; return; }
      setUserEmail(session.user.email ?? null);
      setLoading(false);
    }
    load();
  }, []);

  async function handleDeleteAccount() {
    if (deleteConfirmText !== "DELETE") return;
    setDeleting(true);
    setDeleteError(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = "/login"; return; }

    const res = await fetch("/api/delete-account", {
      method: "POST",
      headers: { "Authorization": `Bearer ${session.access_token}` },
    });

    if (res.ok) {
      await supabase.auth.signOut();
      window.location.href = "/?deleted=1";
    } else {
      setDeleting(false);
      setDeleteError("Something went wrong. Please try again.");
    }
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
      <header className="sticky top-0 z-50 bg-navy py-[18px]">
        <div className="flex items-center justify-between px-6 lg:px-10">
          <a href="/dashboard">
            <Image src="/wordmark.png" alt="Dog Dossier" width={180} height={44} className="object-contain" />
          </a>
          <a href="/dashboard" className="font-heading text-[0.9rem] text-cream/60 transition hover:text-cream">
            ← Back to dashboard
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-[640px] px-6 py-12">
        <h1 className="mb-8 font-heading text-[2rem] font-extrabold text-navy">Account Settings</h1>

        {/* Account info */}
        <div className="mb-6 rounded-2xl bg-navy p-7">
          <h2 className="mb-4 font-heading text-[1.1rem] font-extrabold text-cream">Account</h2>
          <div>
            <p className="text-[0.78rem] font-bold uppercase tracking-wide text-cream/40">Email</p>
            <p className="mt-1 text-[0.95rem] text-cream/80">{userEmail}</p>
          </div>
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl border border-red-200 p-7">
          <h2 className="mb-2 font-heading text-[1.1rem] font-extrabold text-red-600">Danger Zone</h2>
          <p className="mb-6 text-[0.9rem] leading-relaxed text-slate">
            Permanently delete your account and all associated data — including every dog profile, photo, routine, and share link. This cannot be undone.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded-[10px] border border-red-300 px-5 py-2.5 font-heading text-[0.9rem] font-bold text-red-600 transition hover:bg-red-50"
            >
              Delete My Account
            </button>
          ) : (
            <div className="rounded-xl bg-red-50 p-5">
              <p className="mb-3 text-[0.9rem] font-bold text-red-700">
                Type <span className="font-mono font-extrabold">DELETE</span> to permanently delete your account:
              </p>
              <input
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="mb-4 w-full rounded-xl border border-red-200 bg-white px-4 py-3 font-mono text-[0.95rem] text-navy outline-none focus:border-red-400"
              />
              {deleteError && (
                <p className="mb-3 text-[0.85rem] text-red-600">{deleteError}</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== "DELETE" || deleting}
                  className="rounded-[10px] bg-red-600 px-5 py-2.5 font-heading text-[0.9rem] font-bold text-white transition hover:bg-red-700 disabled:opacity-40"
                >
                  {deleting ? "Deleting..." : "Confirm Delete"}
                </button>
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); setDeleteError(null); }}
                  className="rounded-[10px] border border-red-200 px-5 py-2.5 font-heading text-[0.9rem] text-red-600 transition hover:bg-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
