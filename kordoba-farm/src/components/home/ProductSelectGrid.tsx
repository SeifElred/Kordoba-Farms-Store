"use client";

import Link from "next/link";
import Image from "next/image";
import { getProductConfig, formatPriceRange } from "@/lib/utils";
import type { ProductConfig } from "@/lib/content";

const PRODUCT_TYPES = ["half_sheep", "half_goat", "whole_sheep", "whole_goat"] as const;

export function ProductSelectGrid({
  locale,
  occasion,
  products: productsProp,
}: {
  locale: string;
  occasion: string;
  products?: ProductConfig[];
}) {
  const products = productsProp ?? PRODUCT_TYPES.map((productType) => {
    const c = getProductConfig(productType);
    return c ? { productType, ...c } : null;
  }).filter(Boolean) as ProductConfig[];
  return (
    <ul className="mt-6 grid gap-5 sm:mt-8 sm:grid-cols-2 sm:gap-6" role="list">
      {products.map((config) => {
        const { label, minPrice, maxPrice, imageUrl } = config;
        return (
          <li key={config.productType}>
            <Link
              href={`/${locale}/order?occasion=${occasion}&product=${config.productType}`}
              className="group block overflow-hidden rounded-xl border-2 border-[var(--border)] bg-[var(--card)] shadow-sm transition-all hover:border-[var(--primary)]/30 hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[var(--muted)]">
                <Image
                  src={imageUrl}
                  alt={label}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="absolute bottom-2 left-2 rounded-lg bg-[var(--primary)]/95 px-2.5 py-1 text-sm font-semibold text-white shadow">
                  {formatPriceRange(minPrice, maxPrice)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="text-lg font-semibold text-[var(--foreground)]">{label}</span>
                <span className="shrink-0 text-[var(--accent)] font-medium rtl:rotate-180 inline-block" aria-hidden>→</span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
