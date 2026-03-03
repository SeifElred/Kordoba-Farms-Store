"use client";

import { ShieldCheck, Truck, Lock, Heart } from "lucide-react";

const BADGES: { icon: React.ElementType; key: string }[] = [
  { icon: ShieldCheck, key: "halal" },
  { icon: Lock, key: "secure" },
  { icon: Truck, key: "traceability" },
  { icon: Heart, key: "quality" },
];

const LABELS: Record<string, Record<string, string>> = {
  halal: {
    en: "100% Halal",
    ar: "حلال ١٠٠٪",
    ms: "100% Halal",
    zh: "100% 清真",
  },
  secure: {
    en: "Secure payment",
    ar: "دفع آمن",
    ms: "Bayaran selamat",
    zh: "安全支付",
  },
  traceability: {
    en: "Full traceability",
    ar: "تتبع كامل",
    ms: "Kebolehkesanan penuh",
    zh: "全程可追溯",
  },
  quality: {
    en: "Premium quality",
    ar: "جودة متميزة",
    ms: "Kualiti premium",
    zh: "优质品质",
  },
};

export function TrustBadges({ locale }: { locale: string }) {
  const loc = locale in LABELS.halal ? locale : "en";
  return (
    <section className="mx-auto max-w-2xl px-4 py-6 sm:px-6" aria-label="Trust badges">
      <div className="flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-6 py-5 shadow-sm">
        {BADGES.map(({ icon: Icon, key }) => (
          <div
            key={key}
            className="flex items-center gap-2 text-sm font-medium text-[var(--muted-foreground)]"
          >
            <Icon className="h-5 w-5 text-[var(--primary)]" aria-hidden />
            <span>{(LABELS as Record<string, Record<string, string>>)[key]?.[loc] ?? (LABELS as Record<string, Record<string, string>>)[key]?.en}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
