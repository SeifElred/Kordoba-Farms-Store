"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQ_KEYS = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9"] as const;

export function HomeFAQ() {
  const t = useTranslations("faq");
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="mx-auto max-w-2xl pt-8 sm:pt-10" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="mb-4 text-center text-lg font-semibold text-[var(--foreground)] sm:mb-5 sm:text-xl">
        {t("title")}
      </h2>
      <ul className="flex flex-col gap-2" role="list">
        {FAQ_KEYS.map((key) => {
          const isOpen = openId === key;
          const aKey = key.replace("q", "a") as "a1" | "a2" | "a3" | "a4" | "a5" | "a6" | "a7" | "a8" | "a9";
          return (
            <li key={key}>
              <div
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm transition-colors hover:border-[var(--primary)]/20"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : key)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start font-medium text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-inset sm:px-5 sm:py-3.5"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${key}`}
                  id={`faq-question-${key}`}
                >
                  <span className="text-sm sm:text-base">{t(key)}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[var(--muted-foreground)] transition-transform ${isOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>
                {isOpen && (
                  <div
                    id={`faq-answer-${key}`}
                    role="region"
                    aria-labelledby={`faq-question-${key}`}
                  >
                    <p className="border-t border-[var(--border)] px-4 py-3 text-sm leading-relaxed text-[var(--muted-foreground)] sm:px-5 sm:py-3.5">
                      {t(aKey)}
                    </p>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
