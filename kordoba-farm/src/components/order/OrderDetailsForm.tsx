"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useLocale } from "next-intl";
import { Play } from "lucide-react";
import { formatPrice, formatPriceRange, getProductConfig, getLocalDateString, SPECIAL_CUTS } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ProductConfig, ProductWeightOption } from "@/lib/content";
import type { SpecialCutOption } from "@/lib/utils";

const PRODUCT_TYPES = ["half_sheep", "half_goat", "whole_sheep", "whole_goat"] as const;

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">
      {children}
    </h2>
  );
}

export function OrderDetailsForm({
  productType,
  occasion,
  productConfig: productConfigProp,
  specialCuts: specialCutsProp,
  weightOptions: weightOptionsProp = [],
  deliveryTransportNote,
}: {
  productType: string;
  occasion: string;
  productConfig?: ProductConfig | null;
  specialCuts?: SpecialCutOption[];
  weightOptions?: ProductWeightOption[];
  /** Shown under delivery option when distribution is delivery (e.g. "We use LalaMove for transportation."). Editable in admin Settings. */
  deliveryTransportNote?: string | null;
}) {
  const t = useTranslations("animal");
  const tOrder = useTranslations("orderDetails");
  const locale = useLocale();
  const configFromUtils = getProductConfig(productType);
  const config = productConfigProp ?? configFromUtils;
  const specialCuts = specialCutsProp ?? SPECIAL_CUTS;
  const weightOptions = weightOptionsProp ?? [];

  const [slaughterDate, setSlaughterDate] = useState("");
  const [distribution, setDistribution] = useState("delivery");
  const [videoProof, setVideoProof] = useState(false);
  const [weightSelection, setWeightSelection] = useState(weightOptions.length > 0 ? "" : "as_is");
  const [selectedCutId, setSelectedCutId] = useState<string>("");
  const [includeHead, setIncludeHead] = useState(false);
  const [includeStomach, setIncludeStomach] = useState(false);
  const [includeIntestines, setIncludeIntestines] = useState(false);
  const [note, setNote] = useState("");

  if (!config || !PRODUCT_TYPES.includes(productType as (typeof PRODUCT_TYPES)[number])) {
    return (
      <p className="text-[var(--muted-foreground)]">{tOrder("invalidProduct")}</p>
    );
  }

  const { label, minPrice, maxPrice, imageUrl } = config;
  const specialCut = selectedCutId
    ? specialCuts.find((c) => c.id === selectedCutId)?.label ?? selectedCutId
    : "";

  const selectedWeight = weightOptions.find((w) => w.id === weightSelection);
  const displayPrice = selectedWeight
    ? formatPrice(selectedWeight.price)
    : formatPriceRange(minPrice, maxPrice);
  const checkoutMin = selectedWeight ? selectedWeight.price : minPrice;
  const checkoutMax = selectedWeight ? selectedWeight.price : maxPrice;

  const today = getLocalDateString(new Date());
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  const maxDate = getLocalDateString(oneYearFromNow);

  const canProceed =
    slaughterDate.trim() !== "" &&
    selectedCutId !== "" &&
    (weightOptions.length > 0 ? selectedWeight != null : weightSelection.trim() !== "");

  const checkoutParams = new URLSearchParams({
    product: productType,
    occasion: occasion || "qurban",
    totalMin: String(checkoutMin),
    totalMax: String(checkoutMax),
    slaughter: slaughterDate || "TBD",
    dist: distribution,
    videoProof: String(videoProof),
    weightSel: weightSelection || "as_is",
    specialCut,
    head: String(includeHead),
    stomach: String(includeStomach),
    intestines: String(includeIntestines),
    note,
  });
  if (selectedWeight) checkoutParams.set("weightLabel", selectedWeight.label);

  return (
    <div className="space-y-8">
      {/* Product block */}
      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="flex flex-col sm:flex-row">
          <div className="relative h-44 w-full shrink-0 sm:h-auto sm:w-44 sm:min-h-[140px]">
            <Image
              src={imageUrl}
              alt={label}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 176px"
              priority
            />
          </div>
          <div className="flex flex-1 flex-col justify-center p-4 sm:p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              {tOrder("yourProduct")}
            </p>
            <p className="mt-0.5 text-xl font-bold text-[var(--foreground)]">{label}</p>
            <p className="mt-1 text-lg font-semibold text-[var(--primary)]">
              {displayPrice}
            </p>
          </div>
        </div>
      </section>

      {/* Special cuts */}
      <section>
        <SectionTitle>{tOrder("chooseCut")}</SectionTitle>
        <p className="mb-4 text-sm text-[var(--muted-foreground)]">
          {tOrder("chooseCutSubtitle")}
        </p>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {specialCuts.map((cut) => {
            const isSelected = selectedCutId === cut.id;
            return (
              <div
                key={cut.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedCutId(cut.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedCutId(cut.id);
                  }
                }}
                className={cn(
                  "group relative overflow-hidden rounded-xl border-2 bg-[var(--card)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
                  isSelected
                    ? "border-[var(--primary)] shadow-md ring-2 ring-[var(--primary)]/20"
                    : "border-[var(--border)] hover:border-[var(--primary)]/40"
                )}
              >
                <div className="relative aspect-[4/3] bg-[var(--muted)]">
                  <Image
                    src={cut.imageUrl}
                    alt={cut.label}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 200px"
                  />
                  {cut.videoUrl && (
                    <a
                      href={cut.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute end-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
                      aria-label={tOrder("watchVideo")}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Play className="h-4 w-4 fill-current" />
                    </a>
                  )}
                  {isSelected && (
                    <div className="absolute inset-0 bg-[var(--primary)]/10 pointer-events-none" aria-hidden />
                  )}
                </div>
                <p className="p-2.5 text-center text-sm font-medium text-[var(--foreground)]">
                  {cut.label}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Delivery & date */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm sm:p-5">
        <SectionTitle>{tOrder("deliveryOptions")}</SectionTitle>
        <div className="space-y-4">
          <div>
            <label htmlFor="slaughter-date" className="mb-1 block text-sm font-medium text-[var(--foreground)]">
              {t("slaughterDate")}
            </label>
            <input
              id="slaughter-date"
              type="date"
              min={today}
              max={maxDate}
              className="input-base w-full"
              value={slaughterDate}
              onChange={(e) => setSlaughterDate(e.target.value)}
              aria-required="true"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
              {t("distribution")}
            </label>
            <select
              className="input-base w-full"
              value={distribution}
              onChange={(e) => setDistribution(e.target.value)}
            >
              <option value="delivery">{tOrder("delivery")}</option>
              <option value="pickup">{tOrder("pickup")}</option>
              <option value="donate">{tOrder("donate")}</option>
            </select>
            {distribution === "delivery" && (deliveryTransportNote ?? "We use LalaMove for transportation.").trim() && (
              <p className="mt-1.5 text-sm text-[var(--muted-foreground)]" role="note">
                {(deliveryTransportNote ?? "We use LalaMove for transportation.").trim()}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Order extras */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm sm:p-5">
        <SectionTitle>{tOrder("orderExtras")}</SectionTitle>
        <div className="space-y-4">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--border)] p-3">
            <input
              type="checkbox"
              checked={videoProof}
              onChange={(e) => setVideoProof(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--border)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
            />
            <span className="text-sm font-medium">{t("videoProof")}</span>
          </label>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
              {t("weightSelection")}
            </label>
            <select
              className="input-base w-full"
              value={weightSelection}
              onChange={(e) => setWeightSelection(e.target.value)}
            >
              {weightOptions.length > 0 ? (
                <>
                  <option value="">{tOrder("chooseWeight")}</option>
                  {weightOptions.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.label} — {formatPrice(w.price)}
                    </option>
                  ))}
                </>
              ) : (
                <>
                  <option value="as_is">{tOrder("weightAsIs")}</option>
                  <option value="range">{tOrder("weightRange")}</option>
                </>
              )}
            </select>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-[var(--foreground)]">
              {t("orderIncludes")}
            </p>
            <div className="flex flex-wrap gap-3">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeHead}
                  onChange={(e) => setIncludeHead(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
                />
                <span className="text-sm">{t("includeHead")}</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeStomach}
                  onChange={(e) => setIncludeStomach(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
                />
                <span className="text-sm">{t("includeStomach")}</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeIntestines}
                  onChange={(e) => setIncludeIntestines(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
                />
                <span className="text-sm">{t("includeIntestines")}</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm sm:p-5">
        <SectionTitle>{tOrder("notes")}</SectionTitle>
        <textarea
          className="input-base w-full min-h-[88px] resize-y"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={tOrder("notesPlaceholder")}
        />
      </section>

      {canProceed ? (
        <Link
          href={`/${locale}/checkout?${checkoutParams.toString()}`}
          className="btn-primary flex w-full justify-center"
        >
          {t("addToOrder")}
        </Link>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            disabled
            className="btn-primary flex w-full cursor-not-allowed justify-center"
          >
            {t("addToOrder")}
          </button>
          <p className="text-center text-sm text-[var(--muted-foreground)]">
            {tOrder("completeRequiredToProceed")}
          </p>
        </div>
      )}
    </div>
  );
}
