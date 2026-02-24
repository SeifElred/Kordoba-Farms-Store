"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Baby, Beef, User, ChevronRight } from "lucide-react";

type AccentKey = "amber" | "primary" | "gold";

const purposes: { key: "aqiqah" | "qurban" | "personal"; slug: string; icon: typeof Baby; accent: AccentKey }[] = [
  { key: "aqiqah", slug: "aqiqah", icon: Baby, accent: "amber" },
  { key: "qurban", slug: "qurban", icon: Beef, accent: "primary" },
  { key: "personal", slug: "personal", icon: User, accent: "gold" },
];

const accentStyles: Record<AccentKey, string> = {
  amber: "bg-amber-50 border-amber-200/80 text-amber-800 hover:border-amber-400/60 hover:bg-amber-50/90 [&_.icon-wrap]:bg-amber-100 [&_.icon-wrap]:text-amber-700",
  primary: "bg-[#f0f7f4] border-[var(--primary)]/20 text-[var(--primary)] hover:border-[var(--primary)]/40 hover:bg-[#e8f2ef] [&_.icon-wrap]:bg-[var(--primary)]/15 [&_.icon-wrap]:text-[var(--primary)]",
  gold: "bg-[#faf8f2] border-[var(--accent)]/30 text-[var(--accent-foreground)] hover:border-[var(--accent)]/50 hover:bg-[#f5f2e8] [&_.icon-wrap]:bg-[var(--accent)]/20 [&_.icon-wrap]:text-[var(--accent-foreground)]",
};

export function PurposeGrid() {
  const t = useTranslations("purpose");
  const locale = useLocale();
  const [loadingKey, setLoadingKey] = useState<"aqiqah" | "qurban" | "personal" | null>(null);

  return (
    <div className="space-y-1">
      <ul className="flex flex-col gap-3 sm:gap-4" role="list">
        {purposes.map((item, i) => {
          const Icon = item.icon;
          const styles = accentStyles[item.accent];
          const staggerClass =
            i === 0 ? "stagger-in stagger-in-1" : i === 1 ? "stagger-in stagger-in-2" : i === 2 ? "stagger-in stagger-in-3" : "";
          return (
            <li key={item.key} className={staggerClass}>
              <Link
                href={`/${locale}/order?occasion=${item.slug}&step=2`}
                onClick={() => setLoadingKey(item.key)}
                className={`group flex min-h-[80px] items-center gap-4 rounded-2xl border-2 px-5 py-4 shadow-sm transition-all hover:shadow-md active:scale-[0.99] sm:min-h-[88px] sm:gap-5 sm:px-6 sm:py-5 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 ${styles} ${
                  loadingKey === item.key ? "opacity-70 pointer-events-none" : ""
                }`}
              >
                <span className="icon-wrap flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors sm:h-14 sm:w-14">
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="block text-base font-semibold sm:text-lg">
                    {t(item.key)}
                  </span>
                  <span className="mt-0.5 block text-sm leading-snug text-[var(--muted-foreground)]">
                    {t(`${item.key}Desc`)}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-xs sm:text-sm text-[var(--muted-foreground)]">
                  {loadingKey === item.key ? "Loading..." : null}
                  <ChevronRight className="h-5 w-5 shrink-0 text-[var(--muted-foreground)] transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 sm:h-6 sm:w-6" aria-hidden />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
