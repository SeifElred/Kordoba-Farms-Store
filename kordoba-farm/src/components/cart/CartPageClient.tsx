"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { formatPriceRange, formatPrice } from "@/lib/utils";
import { getWeightBandDisplayLabel } from "@/lib/weight-bands";
import { getSpecialCutDisplayLabel } from "@/lib/special-cut-labels";
import { ShoppingBag, Pencil, Trash2, CreditCard, ShieldCheck, Lock } from "lucide-react";

function getCartWeightDisplay(
  weightLabel: string | undefined,
  weightSelection: string | undefined,
  occasion: string,
  locale: string
) {
  const label = weightLabel?.trim();
  if (label) return label;

  const selection = weightSelection?.trim();
  if (!selection) return "";

  const localizedBand = getWeightBandDisplayLabel(selection, occasion, locale);
  if (localizedBand && localizedBand !== selection) return localizedBand;

  // New carts store a DB UUID in weightSelection, which is not user-facing.
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(selection)) {
    return "";
  }

  return selection;
}

export function CartPageClient({
  locale,
}: {
  locale: string;
  whatsappLink?: string | null;
}) {
  const t = useTranslations("cart");
  const tPurpose = useTranslations("purpose");
  const tOrder = useTranslations("orderDetails");
  const tWizard = useTranslations("orderWizard");
  const tAnimal = useTranslations("animal");
  const tProduct = useTranslations("product");
  const searchParams = useSearchParams();
  const added = searchParams.get("added") === "1";

  const { items, removeItem } = useCart();

  const purposeLabels: Record<string, string> = {
    qurban: tPurpose("qurban"),
    aqiqah: tPurpose("aqiqah"),
    personal: tPurpose("personal"),
  };
  const distLabels: Record<string, string> = {
    delivery: tOrder("delivery"),
    pickup: tOrder("pickup"),
    donate: tOrder("donate"),
  };
  const productLabels: Record<string, string> = {
    whole_sheep: tProduct("whole_sheep"),
    whole_goat: tProduct("whole_goat"),
    half_sheep: tProduct("half_sheep"),
    half_goat: tProduct("half_goat"),
  };

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-sm">
        <ShoppingBag className="mx-auto h-12 w-12 text-[var(--muted-foreground)]" />
        <h2 className="mt-4 text-lg font-semibold text-[var(--foreground)]">{t("empty")}</h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">{t("emptyHint")}</p>
        <Link href={`/${locale}/order`} className="btn-primary mt-6 inline-flex justify-center">
          {tWizard("step1Title")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {added && (
        <div className="rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/5 px-4 py-3 text-center text-sm font-medium text-[var(--primary)]">
          {t("itemAdded")}
        </div>
      )}

      <ul className="flex flex-col gap-4" role="list">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm sm:p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                  {t("occasion")}
                </p>
                <p className="mt-0.5 text-lg font-semibold text-[var(--foreground)]">
                  {purposeLabels[item.occasion] ?? item.occasion}
                </p>
                <p className="mt-1 text-xl font-bold text-[var(--primary)]">
                  {productLabels[item.product] ?? item.productLabel}
                </p>
                <div className="mt-0.5 flex flex-wrap gap-1.5">
                  {item.specialCutLabel && (
                    <span className="rounded-md border border-[var(--border)] bg-[var(--muted)]/50 px-2 py-0.5 text-xs text-[var(--muted-foreground)]">
                      {getSpecialCutDisplayLabel(locale, item.specialCutId, item.specialCutLabel)}
                    </span>
                  )}
                  {item.slaughterDate && (
                    <span className="rounded-md border border-[var(--border)] bg-[var(--muted)]/50 px-2 py-0.5 text-xs text-[var(--muted-foreground)]">
                      {item.slaughterDate}
                    </span>
                  )}
                  <span className="rounded-md border border-[var(--border)] bg-[var(--muted)]/50 px-2 py-0.5 text-xs text-[var(--muted-foreground)]">
                    {distLabels[item.distribution] ?? item.distribution}
                  </span>
                </div>
                {getCartWeightDisplay(item.weightLabel, item.weightSelection, item.occasion, locale) && (
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {t("weightAndAge")}:
                    </span>
                    <span className="rounded-md border border-[var(--border)] bg-[var(--muted)]/50 px-2 py-0.5 text-xs text-[var(--muted-foreground)]">
                      {getCartWeightDisplay(item.weightLabel, item.weightSelection, item.occasion, locale)}
                    </span>
                    {(item.occasion === "qurban" || item.occasion === "aqiqah") &&
                      item.product.includes("sheep") && (
                        <span className="rounded-md border border-[var(--primary)]/40 bg-[var(--primary)]/15 px-2 py-0.5 text-xs text-[var(--primary)]">
                          {tAnimal("sheepAgeBadge")}
                        </span>
                      )}
                    {(item.occasion === "qurban" || item.occasion === "aqiqah") &&
                      item.product.includes("goat") && (
                        <span className="rounded-md border border-[var(--primary)]/40 bg-[var(--primary)]/15 px-2 py-0.5 text-xs text-[var(--primary)]">
                          {tAnimal("goatAgeBadge")}
                        </span>
                      )}
                  </div>
                )}
                <p className="mt-1 text-base font-semibold text-[var(--foreground)]">
                  {formatPriceRange(item.minPrice, item.maxPrice)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/${locale}/order?edit=${encodeURIComponent(item.id)}`}
                  className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  aria-label={t("editItem")}
                >
                  <Pencil className="h-4 w-4" />
                  {t("editItem")}
                </Link>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:border-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  aria-label={t("removeItem")}
                >
                  <Trash2 className="h-4 w-4" />
                  {t("removeItem")}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Order total */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
        <div className="flex justify-between text-lg font-bold text-[var(--foreground)]">
          <span>{t("orderSummary")}</span>
          <span className="text-[var(--primary)]">
            {formatPrice(items.reduce((s, i) => s + i.minPrice, 0))}
          </span>
        </div>
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap items-center justify-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 px-4 py-3 text-xs text-[var(--muted-foreground)]">
        <span className="flex items-center gap-1.5">
          <Lock className="h-4 w-4 text-[var(--primary)]" aria-hidden />
          {t("trustSecure")}
        </span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-[var(--primary)]" aria-hidden />
          {t("trustHalal")}
        </span>
        <span className="flex items-center gap-1.5">
          <CreditCard className="h-4 w-4 text-[var(--primary)]" aria-hidden />
          {t("trustCardFpx")}
        </span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/${locale}/order`}
          className="flex flex-1 justify-center rounded-[var(--radius)] border-2 border-[var(--border)] bg-[var(--background)] px-4 py-3.5 font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        >
          {t("addAnotherItem")}
        </Link>
        <Link
          href={`/${locale}/checkout`}
          className="btn-primary flex flex-1 items-center justify-center gap-2"
        >
          <CreditCard className="h-5 w-5" aria-hidden />
          {t("proceedToCheckout")}
        </Link>
      </div>
      <p className="text-center text-sm text-[var(--muted-foreground)]">
        {t("payOnlineHint")}
      </p>

      <div className="relative py-2">
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--background)] px-2 text-xs text-[var(--muted-foreground)]">
          {t("orCompleteViaWhatsApp")}
        </span>
        <hr className="border-[var(--border)]" />
      </div>
      <Link
        href={`/${locale}/checkout?intent=whatsapp`}
        className="flex w-full items-center justify-center rounded-[var(--radius)] border-2 border-[var(--primary)]/50 bg-transparent px-4 py-3 font-medium text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      >
        {t("completeOrder")}
      </Link>
      <p className="text-center text-xs text-[var(--muted-foreground)]">
        {t("completeOrderHint")}
      </p>
    </div>
  );
}
