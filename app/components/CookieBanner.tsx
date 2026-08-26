"use client";

import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem("cookie_consent", "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-cream/10 bg-navy px-6 py-5 shadow-[0_-4px_24px_rgba(0,0,0,0.2)]">
      <div className="mx-auto flex max-w-[900px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.85rem] leading-relaxed text-cream/70">
          We use essential cookies to keep you logged in and make the app work.
          We do not use tracking or advertising cookies.{" "}
          <a href="/privacy" className="text-orange underline hover:text-orange-dark">
            Learn more
          </a>
        </p>
        <div className="flex shrink-0 gap-3">
          <button onClick={decline}
            className="rounded-xl border border-cream/20 px-5 py-2.5 font-heading text-[0.85rem] text-cream/60 transition hover:border-cream/40 hover:text-cream">
            Decline
          </button>
          <button onClick={accept}
            className="rounded-xl bg-orange px-5 py-2.5 font-heading text-[0.85rem] font-bold text-cream transition hover:bg-orange-dark">
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
