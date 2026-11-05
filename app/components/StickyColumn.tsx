"use client";

import { useEffect, useRef, useState } from "react";

const HEADER_GAP = 112; // room for the sticky site header
const BOTTOM_GAP = 24;

// On wide screens the column stays in view while the column beside it scrolls.
// If it is taller than the window, it scrolls until its bottom is visible, then stays.
export default function StickyColumn({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState(HEADER_GAP);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setTop(Math.min(HEADER_GAP, window.innerHeight - el.offsetHeight - BOTTOM_GAP));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div ref={ref} style={{ top }} className="flex flex-col gap-6 lg:sticky">
      {children}
    </div>
  );
}
