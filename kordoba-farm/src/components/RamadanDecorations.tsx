"use client";

import { useEffect, useState } from "react";

const STAR_POSITIONS: { left: string; top: string; size: number; delay: number }[] = [
  { left: "8%", top: "12%", size: 2, delay: 0 },
  { left: "15%", top: "22%", size: 1, delay: 0.4 },
  { left: "22%", top: "8%", size: 2, delay: 1.2 },
  { left: "35%", top: "18%", size: 1, delay: 0.8 },
  { left: "42%", top: "6%", size: 2, delay: 2 },
  { left: "55%", top: "14%", size: 1, delay: 0.2 },
  { left: "68%", top: "10%", size: 2, delay: 1.6 },
  { left: "78%", top: "20%", size: 1, delay: 0.6 },
  { left: "88%", top: "12%", size: 2, delay: 1 },
  { left: "12%", top: "38%", size: 1, delay: 1.4 },
  { left: "28%", top: "32%", size: 2, delay: 0.3 },
  { left: "48%", top: "28%", size: 1, delay: 1.8 },
  { left: "62%", top: "36%", size: 2, delay: 0.5 },
  { left: "82%", top: "30%", size: 1, delay: 2.2 },
  { left: "5%", top: "52%", size: 2, delay: 0.7 },
  { left: "18%", top: "58%", size: 1, delay: 1.1 },
  { left: "38%", top: "48%", size: 2, delay: 1.5 },
  { left: "58%", top: "54%", size: 1, delay: 0.9 },
  { left: "75%", top: "50%", size: 2, delay: 2.4 },
  { left: "92%", top: "44%", size: 1, delay: 0.1 },
  { left: "10%", top: "72%", size: 1, delay: 1.7 },
  { left: "32%", top: "68%", size: 2, delay: 0.4 },
  { left: "52%", top: "76%", size: 1, delay: 2.1 },
  { left: "70%", top: "70%", size: 2, delay: 1.3 },
  { left: "88%", top: "78%", size: 1, delay: 0.6 },
];

export function RamadanDecorations({ themeId }: { themeId: string }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(true);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(m.matches);
    const fn = () => setPrefersReducedMotion(m.matches);
    m.addEventListener("change", fn);
    return () => m.removeEventListener("change", fn);
  }, []);

  if (themeId !== "ramadan") return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden
    >
      {/* Twinkling stars */}
      {STAR_POSITIONS.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animation: prefersReducedMotion ? "none" : "starTwinkle 2.5s ease-in-out infinite",
            animationDelay: `${star.delay}s`,
            opacity: 0.6,
          }}
        />
      ))}
      {/* Crescent moon */}
      <div
        className="absolute right-[10%] top-[8%] opacity-90"
        style={{
          animation: prefersReducedMotion ? "none" : "crescentGlow 4s ease-in-out infinite",
        }}
      >
        <svg
          width="56"
          height="56"
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_0_12px_rgba(201,162,39,0.5)]"
          aria-hidden
        >
          <circle cx="28" cy="28" r="20" fill="#f4e4bc" />
          <circle cx="36" cy="28" r="16" fill="#1a2744" />
        </svg>
      </div>
      {/* Small accent lantern glow (bottom left) */}
      <div
        className="absolute bottom-[20%] left-[6%] h-12 w-8 rounded-full opacity-30"
        style={{
          background: "radial-gradient(ellipse at center, rgba(201, 162, 39, 0.6) 0%, transparent 70%)",
          animation: prefersReducedMotion ? "none" : "crescentGlow 5s ease-in-out infinite",
          animationDelay: "1s",
        }}
      />
    </div>
  );
}
