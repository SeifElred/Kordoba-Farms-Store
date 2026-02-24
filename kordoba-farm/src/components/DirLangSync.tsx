"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";

/** Syncs document direction and language when locale changes (e.g. client-side language switch). */
export function DirLangSync() {
  const locale = useLocale();

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("lang", locale);
    root.setAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    root.setAttribute("data-locale", locale);
  }, [locale]);

  return null;
}
