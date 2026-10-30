"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

type Found = { phone: string };

export default function PhotoGallery({
  photos,
  dogName,
  found = null,
  header = null,
}: {
  photos: string[];
  dogName: string;
  found?: Found | null;
  header?: React.ReactNode;
}) {
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(false);
  // Width ÷ height of the main photo. The frame takes this shape, so it hugs the photo.
  const [ratio, setRatio] = useState(3 / 4);

  if (photos.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-4">
        {header}
        <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-slate text-[4rem] shadow-[0_0_0_3px_#EA580C]">
          🐾
        </div>
      </div>
    );
  }

  const index = Math.min(current, photos.length - 1);

  function measure(e: React.SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
    if (index === 0 && w && h) setRatio(Math.min(2, Math.max(0.5, w / h)));
  }

  return (
    // The column is as wide as the frame (capped by the page width and a maximum height),
    // so the header lines up with the photo's edges
    <div className="mx-auto flex flex-col gap-4" style={{ width: `min(100%, calc(min(75vh, 640px) * ${ratio}))` }}>
      {header}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Open photo ${index + 1} of ${photos.length} full screen`}
        style={{ aspectRatio: ratio }}
        className="group relative w-full cursor-zoom-in overflow-hidden rounded-2xl bg-navy shadow-[0_0_0_3px_#EA580C]"
      >
        <Image
          src={photos[index]}
          alt={`${dogName}, photo ${index + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 720px"
          priority
          onLoad={measure}
          className="object-contain transition duration-300 group-hover:scale-[1.02]"
        />
        {photos.length > 1 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-navy/75 px-2.5 py-1 font-heading text-[0.75rem] font-semibold tabular-nums text-white">
            {index + 1} / {photos.length}
          </span>
        )}
        <span className="absolute bottom-3 right-3 rounded-full bg-navy/75 px-2.5 py-1 font-heading text-[0.75rem] font-semibold text-white">
          ⤢ Tap to enlarge
        </span>
      </button>

      {photos.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2">
          {photos.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index}
              className={`relative h-16 w-16 overflow-hidden rounded-xl outline outline-2 outline-offset-2 transition ${
                i === index ? "opacity-100 outline-orange" : "opacity-60 outline-transparent hover:opacity-100"
              }`}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {open && (
        <Lightbox
          photos={photos}
          dogName={dogName}
          start={index}
          found={found}
          onChange={setCurrent}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function Lightbox({
  photos,
  dogName,
  start,
  found,
  onChange,
  onClose,
}: {
  photos: string[];
  dogName: string;
  start: number;
  found: Found | null;
  onChange: (i: number) => void;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(start);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);

  const go = useCallback((i: number) => {
    const next = (i + photos.length) % photos.length;
    setIndex(next);
    onChange(next);
  }, [photos.length, onChange]);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      opener?.focus();
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") go(index - 1);
      else if (e.key === "ArrowRight") go(index + 1);
      else if (e.key === "Tab" && dialogRef.current) {
        // Keep keyboard focus inside the viewer
        const items = dialogRef.current.querySelectorAll<HTMLElement>("button, a[href]");
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [index, go, onClose]);

  // Swipe left/right to change photo, swipe down to close
  function onPointerDown(e: React.PointerEvent) {
    pointer.current = { x: e.clientX, y: e.clientY };
  }
  function onPointerUp(e: React.PointerEvent) {
    if (!pointer.current) return;
    const dx = e.clientX - pointer.current.x;
    const dy = e.clientY - pointer.current.y;
    pointer.current = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1));
    else if (dy > 80 && Math.abs(dy) > Math.abs(dx)) onClose();
  }

  const many = photos.length > 1;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Photos of ${dogName}`}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      className="fixed inset-0 z-[60] grid grid-rows-[auto_minmax(0,1fr)_auto] bg-[#0a0f1c]/[0.97] text-white [touch-action:pinch-zoom]"
    >
      <div className="flex items-center justify-between px-4 py-3">
        <span className="font-heading text-[0.9rem] font-semibold tabular-nums text-white/75">
          {many ? `${index + 1} / ${photos.length}` : dogName}
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close photo viewer"
          className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-[1.25rem] transition hover:bg-white/25"
        >
          ✕
        </button>
      </div>

      <div className="relative min-h-0">
        <div className="pointer-events-none absolute inset-0 sm:inset-x-16">
          <Image
            key={photos[index]}
            src={photos[index]}
            alt={`${dogName}, photo ${index + 1} of ${photos.length}`}
            fill
            sizes="100vw"
            priority
            draggable={false}
            className="select-none object-contain"
          />
        </div>
        {many && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-[1.6rem] transition hover:bg-white/25 sm:grid"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-[1.6rem] transition hover:bg-white/25 sm:grid"
            >
              ›
            </button>
          </>
        )}
      </div>

      <div className="flex flex-col items-center gap-3 px-4 pb-5 pt-3">
        {many && (
          <div className="flex flex-wrap justify-center gap-2">
            {photos.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index}
                className={`relative h-12 w-12 overflow-hidden rounded-lg outline outline-2 outline-offset-2 transition ${
                  i === index ? "opacity-100 outline-orange" : "opacity-50 outline-transparent hover:opacity-100"
                }`}
              >
                <Image src={src} alt="" fill sizes="48px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
        {found && (
          <a
            href={`tel:${found.phone}`}
            className="flex flex-wrap items-center justify-center gap-x-2 rounded-xl bg-orange px-5 py-3 text-center font-heading text-[0.95rem] font-semibold text-white transition hover:bg-orange-dark"
          >
            Found {dogName}? Call <span className="font-extrabold tabular-nums">{found.phone}</span>
          </a>
        )}
      </div>
    </div>
  );
}
