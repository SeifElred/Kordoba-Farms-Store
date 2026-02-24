"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

const STORAGE_KEY = "kordoba_lang_chosen";

const LOCALES = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "ms", label: "Bahasa Melayu" },
  { code: "zh", label: "中文" },
] as const;

export function LanguageOverlay() {
  const t = useTranslations("welcomePopup");
  const pathname = usePathname();
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) {
      setShow(false);
      return;
    }
    setShow(true);
  }, []);

  function handleSelect(locale: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, "1");
    setShow(false);
    const segments = pathname.split("/").filter(Boolean);
    const rest = segments.slice(1).join("/");
    const newPath = rest ? `/${locale}/${rest}` : `/${locale}`;
    router.push(newPath);
  }

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="language-overlay-title"
      aria-describedby="language-overlay-desc"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl">
        <h2 id="language-overlay-title" className="text-center text-xl font-semibold text-[var(--foreground)]">
          {t("chooseLanguage")}
        </h2>
        <p id="language-overlay-desc" className="mt-2 text-center text-sm text-[var(--muted-foreground)]">
          {t("chooseLanguageSubtitle")}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {LOCALES.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              onClick={() => handleSelect(code)}
              className="rounded-xl border-2 border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
