"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { formatPriceRange, getProductConfig } from "@/lib/utils";

type OrderSummaryProps = {
  locale: string;
  productType: string;
  occasion: string;
  minPrice?: number;
  maxPrice?: number;
  /** If true, show "Change product" link to choose-product */
  showChangeLink?: boolean;
  className?: string;
};

export function OrderSummary({
  locale,
  productType,
  occasion,
  minPrice,
  maxPrice,
  showChangeLink = true,
  className,
}: OrderSummaryProps) {
  const t = useTranslations("cart");
  const tPurpose = useTranslations("purpose");
  const config = getProductConfig(productType);
  if (!config) return null;

  const priceMin = minPrice ?? config.minPrice;
  const priceMax = maxPrice ?? config.maxPrice;
  const occasionKey = ["qurban", "aqiqah", "personal"].includes(occasion) ? occasion : "personal";
  const occasionLabel = tPurpose(occasionKey);

  return (
    <div
      className={
        "rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm sm:p-5 " +
        (className ?? "")
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
            {t("orderSummary")}
          </p>
          <p className="mt-0.5 font-semibold text-[var(--foreground)]">
            {config.label}
          </p>
          <p className="text-sm text-[var(--muted-foreground)]">
            {occasionLabel} · {formatPriceRange(priceMin, priceMax)}
          </p>
        </div>
        {showChangeLink && (
          <Link
            href={`/${locale}/choose-product${occasion ? `?occasion=${occasion}` : ""}`}
            className="shrink-0 rounded-[var(--radius)] text-sm font-medium text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
          >
            {t("changeProduct")}
          </Link>
        )}
      </div>
    </div>
  );
}
