"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, X, Home, HelpCircle, BookOpen } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useCart } from "@/contexts/CartContext";
import { BRAND_NAME } from "@/lib/constants";

export function Header({ bannerText }: { bannerText?: string }) {
  const t = useTranslations("nav");
  const tFaq = useTranslations("faq");
  const locale = useLocale();
  const pathname = usePathname();
  const { items } = useCart();
  const basePath = pathname.split("/").slice(0, 2).join("/") || "/en";
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 shrink-0 bg-[var(--card)] shadow-[0_1px_0_0_var(--border)]">
      {bannerText?.trim() ? (
        <div className="bg-[var(--primary)] px-4 py-1.5 text-center text-xs font-medium tracking-wide text-white/95 sm:px-6">
          {bannerText.trim()}
        </div>
      ) : null}
      <div
        className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4 sm:h-14 sm:px-6"
        style={{ paddingInlineStart: "max(1rem, var(--safe-left))", paddingInlineEnd: "max(1rem, var(--safe-right))" }}
      >
        <Link
          href={basePath}
          className="shrink-0 rounded-[var(--radius)] text-lg font-semibold tracking-tight text-[var(--primary)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 sm:text-xl"
        >
          {BRAND_NAME}
        </Link>

        <div className="flex items-center gap-2">
          {mounted && (
            <div className="shrink-0">
              <LanguageSwitcher />
            </div>
          )}
          <Link
            href={`${basePath}/cart`}
            aria-label={t("cart")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 sm:h-10 sm:w-10 sm:rounded-xl"
          >
            <span className="relative inline-block">
              <ShoppingBag className="h-5 w-5" aria-hidden />
              {items.length > 0 && (
                <span className="absolute -end-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[10px] font-bold text-white" aria-hidden>
                  {items.length > 99 ? "99+" : items.length}
                </span>
              )}
            </span>
          </Link>
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 sm:h-10 sm:w-10 sm:rounded-xl"
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:z-50">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 h-full w-full bg-black/40"
          />
          {/* Side drawer */}
          <nav
            className={`absolute top-0 h-full w-64 max-w-[80vw] bg-[var(--card)] shadow-xl border-[var(--border)] ${
              locale === "ar" ? "left-0 border-r" : "right-0 border-l"
            }`}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
              <span className="text-sm font-semibold text-[var(--foreground)]">
                {locale === "ar" ? "القائمة" : locale === "ms" ? "Menu" : locale === "zh" ? "菜单" : "Menu"}
              </span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="flex flex-col gap-1 px-3 py-3 text-sm">
              <Link
                href={basePath}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-[var(--foreground)] hover:bg-[var(--muted)]"
                onClick={() => setMenuOpen(false)}
              >
                <Home className="h-4 w-4 text-[var(--muted-foreground)]" aria-hidden />
                <span>{t("home")}</span>
              </Link>
              <Link
                href={`${basePath}/blog`}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-[var(--foreground)] hover:bg-[var(--muted)]"
                onClick={() => setMenuOpen(false)}
              >
                <BookOpen className="h-4 w-4 text-[var(--muted-foreground)]" aria-hidden />
                <span>{t("blog")}</span>
              </Link>
              <Link
                href={`${basePath}/faq`}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-[var(--foreground)] hover:bg-[var(--muted)]"
                onClick={() => setMenuOpen(false)}
              >
                <HelpCircle className="h-4 w-4 text-[var(--muted-foreground)]" aria-hidden />
                <span>
                  {locale === "ar"
                    ? tFaq("title")
                    : "FAQ"}
                </span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
