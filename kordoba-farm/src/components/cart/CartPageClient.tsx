"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import type { CartLineItem } from "@/contexts/CartContext";
import { formatPriceRange, formatPrice } from "@/lib/utils";
import { getWeightBandDisplayLabel } from "@/lib/weight-bands";
import { ShoppingBag, Pencil, Trash2, CreditCard, ShieldCheck, Lock } from "lucide-react";

const WHATSAPP_FALLBACK = process.env.NEXT_PUBLIC_WHATSAPP_LINK ?? "https://wa.me/60123456789";

function buildCartOrderMessage(
  items: CartLineItem[],
  purposeLabels: Record<string, string>,
  distLabels: Record<string, string>,
  hint: string
): string {
  const lines = [
    "*New order – Kordoba Farms*",
    "",
    `*Items (${items.length})*`,
    ...items.flatMap((item, i) => {
      const purpose = purposeLabels[item.occasion] ?? item.occasion;
      const dist = distLabels[item.distribution] ?? item.distribution;
      const includes: string[] = [];
      if (item.includeHead) includes.push("Head");
      if (item.includeStomach) includes.push("Stomach");
      if (item.includeIntestines) includes.push("Intestines");
      const orderIncludes = includes.length ? includes.join(", ") : "—";
      return [
        "",
        `*${i + 1}. ${item.productLabel}*`,
        `Occasion: ${purpose}`,
        `Slaughter date: ${item.slaughterDate || "TBD"}`,
        `Distribution: ${dist}`,
        `Cut: ${item.specialCutLabel || "—"}`,
        `Price: ${formatPriceRange(item.minPrice, item.maxPrice)}`,
        `Video proof: ${item.videoProof ? "Yes" : "No"}`,
        `Includes: ${orderIncludes}`,
        ...(item.note?.trim() ? [`Note: ${item.note.trim()}`] : []),
      ];
    }),
    "",
    hint,
  ];
  return lines.join("\n");
}

export function CartPageClient({
  locale,
  whatsappLink,
}: {
  locale: string;
  whatsappLink?: string | null;
}) {
  const t = useTranslations("cart");
  const tPurpose = useTranslations("purpose");
  const tOrder = useTranslations("orderDetails");
  const tWizard = useTranslations("orderWizard");
  const tAnimal = useTranslations("animal");
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

  function handleCompleteOrder() {
    if (items.length === 0) return;
    const message = buildCartOrderMessage(
      items,
      purposeLabels,
      distLabels,
      t("completeOrderHint")
    );
    const base = (whatsappLink?.trim() || WHATSAPP_FALLBACK).replace(/\/$/, "");
    const separator = base.includes("?") ? "&" : "?";
    const url = `${base}${separator}text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

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
                <p className="mt-1 text-xl font-bold text-[var(--primary)]">{item.productLabel}</p>
                <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
                  {item.specialCutLabel && `${item.specialCutLabel} · `}
                  {item.slaughterDate && `${item.slaughterDate} · `}
                  {distLabels[item.distribution] ?? item.distribution}
                </p>
                {(item.weightLabel || item.weightSelection) && (
                  <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
                    <span className="font-medium text-[var(--foreground)]">{t("weightAndAge")}:</span>{" "}
                    {item.weightLabel || getWeightBandDisplayLabel(item.weightSelection, item.occasion, locale) || item.weightSelection}
                  </p>
                )}
                {(item.occasion === "qurban" || item.occasion === "aqiqah") && (
                  <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                    {tAnimal("weightAgeNote")}
                  </p>
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
          Secure payment
        </span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-[var(--primary)]" aria-hidden />
          100% Halal
        </span>
        <span className="flex items-center gap-1.5">
          <CreditCard className="h-4 w-4 text-[var(--primary)]" aria-hidden />
          Card & FPX
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
      <button
        type="button"
        onClick={handleCompleteOrder}
        className="w-full rounded-[var(--radius)] border-2 border-[var(--primary)]/50 bg-transparent px-4 py-3 font-medium text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      >
        {t("completeOrder")}
      </button>
      <p className="text-center text-xs text-[var(--muted-foreground)]">
        {t("completeOrderHint")}
      </p>
    </div>
  );
}
