"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { BRAND_NAME } from "@/lib/constants";

export function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();
  const base = `/${locale}`;

  return (
    <footer
      className="mt-auto shrink-0 border-t border-[var(--border)] bg-[var(--card)] py-4 text-[var(--muted-foreground)]"
      style={{ paddingBottom: "max(1rem, var(--safe-bottom))" }}
      role="contentinfo"
    >
      <div
        className="mx-auto flex max-w-3xl flex-col items-center gap-2 px-4 text-center sm:flex-row sm:justify-between sm:items-center sm:gap-4 sm:text-left"
        style={{
          paddingInlineStart: "max(1rem, var(--safe-left))",
          paddingInlineEnd: "max(1rem, var(--safe-right))",
        }}
      >
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs sm:justify-start">
          <Link href={base} className="font-semibold text-[var(--primary)] hover:opacity-90">
            {BRAND_NAME}
          </Link>
          <span className="text-[var(--border)]" aria-hidden>·</span>
          <Link href={`${base}/order`} className="hover:text-[var(--foreground)]">{t("order")}</Link>
          <span className="text-[var(--border)]" aria-hidden>·</span>
          <Link href={`${base}/faq`} className="hover:text-[var(--foreground)]">{t("faq")}</Link>
          <span className="text-[var(--border)]" aria-hidden>·</span>
          <Link href={`${base}/about`} className="hover:text-[var(--foreground)]">{t("about")}</Link>
        </div>
        <p className="text-xs">
          © {new Date().getFullYear()} {t("company")}
        </p>
      </div>
    </footer>
  );
}
