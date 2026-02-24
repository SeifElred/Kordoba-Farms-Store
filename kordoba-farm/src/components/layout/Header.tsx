"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useCart } from "@/contexts/CartContext";
import { BRAND_NAME } from "@/lib/constants";

export function Header({ bannerText }: { bannerText?: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { items } = useCart();
  const basePath = pathname.split("/").slice(0, 2).join("/") || "/en";
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-40 shrink-0 bg-[var(--card)] shadow-[0_1px_0_0_var(--border)]">
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
        </div>
      </div>
    </header>
  );
}
