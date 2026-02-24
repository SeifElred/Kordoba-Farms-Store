"use client";

import { useEffect, useState } from "react";

export function CrescentDecoration({ themeId }: { themeId: string }) {
  const [reduceMotion, setReduceMotion] = useState(true);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(m.matches);
    const fn = () => setReduceMotion(m.matches);
    m.addEventListener("change", fn);
    return () => m.removeEventListener("change", fn);
  }, []);

  if (themeId !== "ramadan") return null;

  return (
    <div
      className="pointer-events-none absolute right-[8%] top-[6%] z-[0.5] opacity-[0.15]"
      aria-hidden
      style={{
        animation: reduceMotion ? "none" : "crescentFloat ease-in-out infinite",
        animationDuration: "12s",
        willChange: "transform",
      }}
    >
      <svg
        width="72"
        height="72"
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_0_20px_rgba(201,162,39,0.2)]"
      >
        <defs>
          <linearGradient id="crescent-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f4e4bc" />
            <stop offset="100%" stopColor="#c9a227" />
          </linearGradient>
        </defs>
        <circle cx="28" cy="28" r="20" fill="url(#crescent-gold)" />
        <circle cx="36" cy="28" r="16" fill="#2F4F2F" />
      </svg>
    </div>
  );
}
