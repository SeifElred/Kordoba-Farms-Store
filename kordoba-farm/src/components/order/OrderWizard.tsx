"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import type { CartLineItem } from "@/contexts/CartContext";
import { formatPrice, formatPriceRange, getLocalDateString } from "@/lib/utils";
import { getWeightBandDisplayLabel } from "@/lib/weight-bands";
import type { ProductWeightOption } from "@/lib/content";
import type { SpecialCutOption } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

const PURPOSES = ["qurban", "aqiqah", "personal"] as const;
const ANIMALS = ["sheep", "goat"] as const;
// Half carcass selection is temporarily disabled; only whole portion is available.
const PORTIONS = ["whole"] as const;

// Fixed weight/price bands for whole carcass.
// We distinguish between personal "لحم ضاني" pricing and Qurban/Aqiqah pricing.
// Labels are rendered per-locale (Arabic uses Arabic wording/digits).
const QURBAN_AQIQAH_BANDS = [
  { id: "whole_28_30", minKg: 28, maxKg: 30, price: 1020 },
  { id: "whole_31_33", minKg: 31, maxKg: 33, price: 1120 },
  { id: "whole_34_36", minKg: 34, maxKg: 36, price: 1250 },
  { id: "whole_37_40", minKg: 37, maxKg: 40, price: 1350 },
  { id: "whole_41_45", minKg: 41, maxKg: 45, price: 1500 },
  { id: "whole_46_50", minKg: 46, maxKg: 50, price: 1675 },
  { id: "whole_51_55", minKg: 51, maxKg: 55, price: 1850 },
  { id: "whole_56_60", minKg: 56, maxKg: 60, price: 1950 },
  { id: "whole_61_65", minKg: 61, maxKg: 65, price: 2050 },
  { id: "whole_66_70", minKg: 66, maxKg: 70, price: 2200 },
  { id: "whole_71_75", minKg: 71, maxKg: 75, price: 2400 },
  { id: "whole_76_80", minKg: 76, maxKg: 80, price: 2550 },
] as const;

// Personal "لحم ضاني" pricing bands (with age info).
const PERSONAL_BANDS = [
  // 45–55 days
  { id: "personal_17_20", minKg: 17, maxKg: 20, price: 750, minAgeDays: 45, maxAgeDays: 55 },
  // 60–80 days
  { id: "personal_21_26", minKg: 21, maxKg: 26, price: 825, minAgeDays: 60, maxAgeDays: 80 },
  // 3–5 months
  { id: "personal_28_30", minKg: 28, maxKg: 30, price: 1000, minAgeMonths: 3, maxAgeMonths: 5 },
  { id: "personal_31_33", minKg: 31, maxKg: 33, price: 1120, minAgeMonths: 3, maxAgeMonths: 5 },
  { id: "personal_34_36", minKg: 34, maxKg: 36, price: 1220, minAgeMonths: 3, maxAgeMonths: 5 },
  { id: "personal_37_40", minKg: 37, maxKg: 40, price: 1320, minAgeMonths: 3, maxAgeMonths: 5 },
] as const;

function formatKgRangeLabel(locale: string, minKg: number, maxKg: number): string {
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar" : locale);
  if (locale === "ar") return `${nf.format(minKg)} إلى ${nf.format(maxKg)} كغ`;
  return `${nf.format(minKg)} – ${nf.format(maxKg)} kg`;
}

function formatPersonalBandLabel(
  locale: string,
  band: (typeof PERSONAL_BANDS)[number],
): string {
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar" : locale);
  const weightPart =
    locale === "ar"
      ? `${nf.format(band.minKg)} إلى ${nf.format(band.maxKg)} كغ`
      : `${nf.format(band.minKg)} – ${nf.format(band.maxKg)} kg`;
  if ("minAgeDays" in band && band.minAgeDays && band.maxAgeDays) {
    if (locale === "ar") {
      return `عمر ${nf.format(band.minAgeDays)} إلى ${nf.format(
        band.maxAgeDays,
      )} يوم · ${weightPart}`;
    }
    return `Age ${band.minAgeDays}–${band.maxAgeDays} days · ${weightPart}`;
  }
  if ("minAgeMonths" in band && band.minAgeMonths && band.maxAgeMonths) {
    if (locale === "ar") {
      return `عمر ${nf.format(band.minAgeMonths)} إلى ${nf.format(
        band.maxAgeMonths,
      )} شهر · ${weightPart}`;
    }
    return `Age ${band.minAgeMonths}–${band.maxAgeMonths} months · ${weightPart}`;
  }
  return weightPart;
}

type ProductConfigMap = Record<string, { label: string; minPrice: number; maxPrice: number; imageUrl: string }>;
type WeightOptionsMap = Record<string, ProductWeightOption[]>;

type WizardState = {
  occasion: string;
  animal: "sheep" | "goat" | "";
  portion: "half" | "whole" | "";
  specialCutId: string;
  specialCutLabel: string;
  slaughterDate: string;
  distribution: string;
  weightSelection: string;
  weightLabel: string;
  videoProof: boolean;
  includeHead: boolean;
  includeStomach: boolean;
  includeIntestines: boolean;
  note: string;
};

const defaultState: WizardState = {
  occasion: "",
  animal: "",
  portion: "",
  specialCutId: "",
  specialCutLabel: "",
  slaughterDate: "",
  distribution: "delivery",
  weightSelection: "",
  weightLabel: "",
  videoProof: false,
  includeHead: false,
  includeStomach: false,
  includeIntestines: false,
  note: "",
};

function stateToProduct(state: WizardState): string {
  if (!state.animal || !state.portion) return "";
  return `${state.portion}_${state.animal}`;
}

function getPriceRange(
  product: string,
  state: WizardState,
  productConfigs: ProductConfigMap,
  weightOptionsByProduct: WeightOptionsMap
): { minPrice: number; maxPrice: number; productLabel: string } {
  const config = productConfigs[product];
  if (!config) return { minPrice: 0, maxPrice: 0, productLabel: product };
  // Whole carcass: use fixed bands (ignore DB weight options for now).
  if (state.portion === "whole" && state.weightSelection) {
    const bands =
      state.occasion === "personal" ? PERSONAL_BANDS : QURBAN_AQIQAH_BANDS;
    const band = bands.find((b) => b.id === state.weightSelection);
    if (band) return { minPrice: band.price, maxPrice: band.price, productLabel: config.label };
  } else {
    const weights = weightOptionsByProduct[product] ?? [];
    if (weights.length > 0 && state.weightSelection) {
      const w = weights.find((x) => x.id === state.weightSelection);
      if (w) return { minPrice: w.price, maxPrice: w.price, productLabel: config.label };
    }
  }
  return { minPrice: config.minPrice, maxPrice: config.maxPrice, productLabel: config.label };
}

export type BreadcrumbItem = { label: string; href: string };

export function OrderWizard({
  locale,
  initialStep = 1,
  initialOccasion,
  editItemId,
  initialProduct,
  specialCuts,
  productConfigs,
  weightOptionsByProduct,
  deliveryTransportNote,
  animalImages,
  breadcrumbItems = [],
}: {
  locale: string;
  initialStep?: number;
  initialOccasion?: string;
  initialProduct?: string;
  editItemId?: string;
  specialCuts: SpecialCutOption[];
  productConfigs: ProductConfigMap;
  weightOptionsByProduct: WeightOptionsMap;
  animalImages: Record<"sheep" | "goat", string>;
  deliveryTransportNote?: string | null;
  breadcrumbItems?: BreadcrumbItem[];
}) {
  const t = useTranslations("purpose");
  const tOrder = useTranslations("orderDetails");
  const tWizard = useTranslations("orderWizard");
  const tAnimal = useTranslations("animal");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { addItem, updateItem, getItemById } = useCart();

  const hasInitialOccasion = !!initialOccasion && !editItemId;

  const startStep =
    initialProduct && (initialProduct === "half_sheep" || initialProduct === "half_goat" || initialProduct === "whole_sheep" || initialProduct === "whole_goat")
      ? 4
      : hasInitialOccasion
        ? 2
        : initialStep ?? 1;
  const [step, setStep] = useState(Math.min(7, Math.max(1, startStep)));
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [state, setState] = useState<WizardState>(() => {
    const s: WizardState = { ...defaultState, occasion: initialOccasion ?? "" };
    if (initialProduct === "half_sheep" || initialProduct === "half_goat" || initialProduct === "whole_sheep" || initialProduct === "whole_goat") {
      s.animal = initialProduct.includes("sheep") ? "sheep" : "goat";
      s.portion = initialProduct.startsWith("half") ? "half" : "whole";
    }
    return s;
  });

  const product = stateToProduct(state);
  const config = product ? productConfigs[product] : null;
  const wholeBandsLabelById = useMemo(() => {
    const out: Record<string, string> = {};
    for (const b of QURBAN_AQIQAH_BANDS) {
      out[b.id] = formatKgRangeLabel(locale, b.minKg, b.maxKg);
    }
    for (const b of PERSONAL_BANDS) {
      out[b.id] = formatPersonalBandLabel(locale, b);
    }
    return out;
  }, [locale]);

  // For half carcass, only allow a limited set of cutting options.
  const visibleSpecialCuts = useMemo(() => {
    if (state.portion !== "half") return specialCuts;
    const allowedIds = new Set<SpecialCutOption["id"]>([
      "fridge_medium",  // تقطيع ثلاجه (قطع متوسطة)
      "salona_small",   // تقطيع صالونه (قطع صغيرة)
      "biryani_large",  // تقطيع برياني (قطع كبيرة)
    ]);
    return specialCuts.filter((cut) => allowedIds.has(cut.id));
  }, [specialCuts, state.portion]);

  // Ensure half portions are only used for personal orders.
  // For aqiqah and qurban, force "whole" and hide half option.
  useEffect(() => {
    if (state.occasion === "aqiqah" || state.occasion === "qurban") {
      if (state.portion === "half") {
        setState((s) => ({ ...s, portion: "whole" }));
      }
    }
  }, [state.occasion, state.portion]);

  useEffect(() => {
    if (editItemId) {
      const item = getItemById(editItemId);
      if (item) {
        setState({
          occasion: item.occasion,
          animal: item.product.includes("sheep") ? "sheep" : "goat",
          portion: item.product.startsWith("half") ? "half" : "whole",
          specialCutId: item.specialCutId,
          specialCutLabel: item.specialCutLabel,
          slaughterDate: item.slaughterDate,
          distribution: item.distribution,
          weightSelection: item.weightSelection,
          weightLabel: item.weightLabel ?? "",
          videoProof: item.videoProof,
          includeHead: item.includeHead,
          includeStomach: item.includeStomach,
          includeIntestines: item.includeIntestines,
          note: item.note,
        });
        setStep(1);
      } else if (initialProduct && (initialProduct === "half_sheep" || initialProduct === "half_goat" || initialProduct === "whole_sheep" || initialProduct === "whole_goat")) {
        setState((s) => ({
          ...s,
          occasion: s.occasion || initialOccasion || "",
          animal: initialProduct.includes("sheep") ? "sheep" : "goat",
          portion: initialProduct.startsWith("half") ? "half" : "whole",
        }));
        setStep(4);
      }
    } else if (initialOccasion && !editItemId) {
      setState((s) => ({ ...s, occasion: initialOccasion }));
    }
  }, [editItemId, initialOccasion, initialProduct, getItemById]);

  const set = useCallback((patch: Partial<WizardState>) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);

  const canProceedStep5 = state.slaughterDate.trim() !== "" && state.specialCutId !== "";
  const slaughterDateOptions = useMemo(() => {
    const start = new Date();
    const options: { value: string; label: string }[] = [];
    const formatter = new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
    for (let i = 0; i < 60; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      options.push({ value: getLocalDateString(d), label: formatter.format(d) });
    }
    return options;
  }, [locale]);

  const handleAddToCart = useCallback(() => {
    const productType = stateToProduct(state);
    if (!productType || !state.occasion || !state.specialCutId || isAddingToCart) return;
    setIsAddingToCart(true);
    const { minPrice, maxPrice, productLabel } = getPriceRange(
      productType,
      state,
      productConfigs,
      weightOptionsByProduct
    );
    const lineItem: Omit<CartLineItem, "id"> = {
      occasion: state.occasion,
      product: productType,
      specialCutId: state.specialCutId,
      specialCutLabel: state.specialCutLabel,
      slaughterDate: state.slaughterDate,
      distribution: state.distribution,
      weightSelection: state.weightSelection || "as_is",
      weightLabel: state.weightLabel || getWeightBandDisplayLabel(state.weightSelection, state.occasion, locale) || undefined,
      videoProof: state.videoProof,
      includeHead: state.includeHead,
      includeStomach: state.includeStomach,
      includeIntestines: state.includeIntestines,
      note: state.note,
      minPrice,
      maxPrice,
      productLabel,
    };
    if (editItemId) {
      updateItem(editItemId, lineItem);
    } else {
      addItem(lineItem);
    }
    router.push(`/${locale}/cart?added=1`);
  }, [state, productConfigs, weightOptionsByProduct, editItemId, addItem, updateItem, router, locale, isAddingToCart]);

  const stepTitles = [
    tWizard("step1Title"),
    tWizard("step2Title"),
    tWizard("step3Title"),
    tWizard("step4Title"),
    tWizard("step5Title"),
    tWizard("step6Title"),
    tWizard("step7Title"),
  ];
  const stepTitle = stepTitles[step - 1];

  return (
    <>
      <div className="hero-strip -mx-4 mb-6 rounded-b-2xl px-4 pb-8 pt-6 sm:-mx-6 sm:mb-8 sm:px-6 sm:pb-10 sm:pt-8">
        <div className="mx-auto max-w-2xl">
          {breadcrumbItems.length > 0 && (
            <Breadcrumbs items={breadcrumbItems} className="mb-4 text-white/80" />
          )}
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {stepTitle}
          </h1>
        </div>
      </div>
      <div className="mx-auto min-w-0 max-w-2xl">
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-[var(--muted-foreground)]" aria-hidden>
          {step} / 7
        </p>
        {step > 1 && (
          <button
            type="button"
            onClick={() => {
              // If user came from homepage with an occasion, going "back" from step 2
              // should return them to the homepage instead of showing the hidden step 1.
              if (hasInitialOccasion && step === 2) {
                router.push(`/${locale}`);
              } else {
                setStep((s) => s - 1);
              }
            }}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            {tCommon("back")}
          </button>
        )}
      </div>

      {/* Step 1: Purpose */}
      {!hasInitialOccasion && step === 1 && (
        <div className="space-y-4">
          <ul className="flex flex-col gap-3" role="list">
            {PURPOSES.map((key) => {
              const isSelected = state.occasion === key;
              return (
                <li key={key}>
                  <button
                    type="button"
                  onClick={() => {
                    set({ occasion: key });
                    setStep(2);
                  }}
                    className={cn(
                      "w-full rounded-2xl border-2 px-5 py-4 text-start transition-all",
                      isSelected
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 shadow-md"
                        : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/40"
                    )}
                  >
                    <span className="block text-base font-semibold text-[var(--foreground)]">{t(key)}</span>
                    <span className="mt-0.5 block text-sm text-[var(--muted-foreground)]">{t(`${key}Desc`)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Step 2: Animal (sheep / goat) */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {ANIMALS.map((a) => {
              const isSelected = state.animal === a;
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => set({ animal: a })}
                  className={cn(
                    "flex flex-col overflow-hidden rounded-2xl border-2 text-start transition-all",
                    isSelected ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/20" : "border-[var(--border)] hover:border-[var(--primary)]/40"
                  )}
                >
                  <div className="relative aspect-square bg-[var(--muted)]">
                    <Image src={animalImages[a]} alt={tWizard(a)} fill className="object-contain" sizes="50vw" />
                  </div>
                  <div className="p-4">
                    <span className="text-lg font-semibold text-[var(--foreground)]">{tWizard(a)}</span>
                  </div>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            disabled={!state.animal}
            onClick={() => setStep(3)}
            className="btn-primary flex w-full items-center justify-center gap-2"
          >
            {tCommon("next")}
            <ChevronRight className="h-5 w-5 rtl:rotate-180" />
          </button>
        </div>
      )}

      {/* Step 3: Half / Whole */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {(
              state.occasion === "personal" ? PORTIONS : (["whole"] as const)
            ).map((p) => {
              const productType = `${p}_${state.animal}` as const;
              const cfg = productConfigs[productType];
              const isSelected = state.portion === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => set({ portion: p })}
                  className={cn(
                    "flex flex-col overflow-hidden rounded-2xl border-2 text-start transition-all",
                    isSelected ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/20" : "border-[var(--border)] hover:border-[var(--primary)]/40"
                  )}
                >
                  {cfg?.imageUrl && (
                    <div className="relative aspect-square bg-[var(--muted)]">
                      <Image src={cfg.imageUrl} alt={tWizard(p)} fill className="object-contain" sizes="50vw" />
                    </div>
                  )}
                  <div className="p-4">
                    <span className="text-lg font-semibold text-[var(--foreground)]">{tWizard(p)}</span>
                  </div>
                </button>
              );
            })}
          </div>
          {state.portion === "whole" && (
            <div className="space-y-2">
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                {tAnimal("weightSelection")}
              </label>
              {state.occasion !== "personal" && (
                <p className="mb-1 text-xs text-[var(--muted-foreground)]">
                  {tAnimal("weightAgeNote")}
                </p>
              )}
              {/* Weight band selector differs for personal vs qurban/aqiqah */}
              {state.occasion && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-xs sm:text-sm text-[var(--muted-foreground)]">
                  <p className="mb-1 font-medium text-[var(--foreground)]">
                    {state.occasion === "personal"
                      ? locale === "ar"
                        ? "أسعار لحم الضاني (للاستخدام الشخصي)"
                        : "Personal lamb pricing"
                      : locale === "ar"
                        ? "أسعار الغنم في الأضحية والعقيقة"
                        : "Sheep prices for Qurban & Aqiqah"}
                  </p>
                  <ul className="space-y-0.5">
                    {(state.occasion === "personal"
                      ? PERSONAL_BANDS
                      : QURBAN_AQIQAH_BANDS
                    ).map((b) => (
                      <li key={b.id} className="flex items-center justify-between gap-2">
                        <span>{wholeBandsLabelById[b.id]}</span>
                        <span className="font-semibold text-[var(--primary)]">
                          {formatPrice(b.price)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <select
                className="input-base w-full"
                value={state.weightSelection}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  set({
                    weightSelection: selectedId,
                    weightLabel: wholeBandsLabelById[selectedId] ?? "",
                  });
                }}
              >
                <option value="">{tOrder("chooseWeight")}</option>
                {(state.occasion === "personal"
                  ? PERSONAL_BANDS
                  : QURBAN_AQIQAH_BANDS
                ).map((b) => (
                  <option key={b.id} value={b.id}>
                    {(wholeBandsLabelById[b.id] ?? "")} — {formatPrice(b.price)}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            type="button"
            disabled={
              !state.portion || (state.portion === "whole" && !state.weightSelection)
            }
            onClick={() => setStep(4)}
            className="btn-primary flex w-full items-center justify-center gap-2"
          >
            {tCommon("next")}
            <ChevronRight className="h-5 w-5 rtl:rotate-180" />
          </button>
        </div>
      )}

      {/* Step 4: Cutting */}
      {step === 4 && config && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--muted-foreground)]">{tOrder("chooseCutSubtitle")}</p>
          <div className="grid grid-cols-2 gap-3">
            {visibleSpecialCuts.map((cut) => {
              const isSelected = state.specialCutId === cut.id;
              return (
                <button
                  key={cut.id}
                  type="button"
                  onClick={() => set({ specialCutId: cut.id, specialCutLabel: cut.label })}
                  className={cn(
                    "overflow-hidden rounded-xl border-2 text-start transition-all",
                    isSelected ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/20" : "border-[var(--border)] hover:border-[var(--primary)]/40"
                  )}
                >
                  <div className="relative aspect-square bg-[var(--muted)]">
                    <Image src={cut.imageUrl} alt={cut.label} fill className="object-contain" sizes="50vw" />
                  </div>
                  <p className="p-2.5 text-center text-sm font-medium text-[var(--foreground)]">{cut.label}</p>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            disabled={!state.specialCutId}
            onClick={() => setStep(5)}
            className="btn-primary flex w-full items-center justify-center gap-2"
          >
            {tCommon("next")}
            <ChevronRight className="h-5 w-5 rtl:rotate-180" />
          </button>
        </div>
      )}

      {/* Step 5: Date & distribution */}
      {step === 5 && (
        <div className="min-w-0 space-y-6">
          <section className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">
              {tOrder("deliveryOptions")}
            </h2>
            <div className="min-w-0 space-y-4">
              <label htmlFor="wizard-slaughter-date" className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                {tAnimal("slaughterDate")}
              </label>
              <select
                id="wizard-slaughter-date"
                className="input-base w-full"
                value={state.slaughterDate}
                onChange={(e) => set({ slaughterDate: e.target.value })}
                aria-required
              >
                <option value="">{tOrder("selectDate")}</option>
                {slaughterDateOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">{tAnimal("distribution")}</label>
                <select
                  className="input-base w-full"
                  value={state.distribution}
                  onChange={(e) => set({ distribution: e.target.value })}
                >
                  <option value="delivery">{tOrder("delivery")}</option>
                  <option value="pickup">{tOrder("pickup")}</option>
                  <option value="donate">{tOrder("donate")}</option>
                </select>
                {state.distribution === "delivery" && (deliveryTransportNote ?? "").trim() && (
                  <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">{deliveryTransportNote?.trim()}</p>
                )}
              </div>
            </div>
          </section>
          <button
            type="button"
            disabled={!canProceedStep5}
            onClick={() => setStep(6)}
            className="btn-primary flex w-full items-center justify-center gap-2"
          >
            {tCommon("next")}
            <ChevronRight className="h-5 w-5 rtl:rotate-180" />
          </button>
        </div>
      )}

      {/* Step 6: Extras */}
      {step === 6 && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">
              {tOrder("orderExtras")}
            </h2>
            <div className="space-y-4">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--border)] p-3">
                <input
                  type="checkbox"
                  checked={state.videoProof}
                  onChange={(e) => set({ videoProof: e.target.checked })}
                  className="h-4 w-4 rounded border-[var(--border)]"
                />
                <span className="text-sm font-medium">{tAnimal("videoProof")}</span>
              </label>
              {state.portion === "whole" ? (
                <div>
                  <p className="mb-1 text-sm font-medium text-[var(--foreground)]">
                    {tAnimal("weightSelection")}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {state.weightLabel || tOrder("chooseWeight")}
                  </p>
                </div>
              ) : (
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">{tAnimal("weightSelection")}</label>
                  <select
                    className="input-base w-full"
                    value={state.weightSelection}
                    onChange={(e) => {
                      const product = stateToProduct(state);
                      const opts = weightOptionsByProduct[product] ?? [];
                      const opt = opts.find((w) => w.id === e.target.value);
                      set({ weightSelection: e.target.value, weightLabel: opt?.label ?? "" });
                    }}
                  >
                    {(() => {
                      const product = stateToProduct(state);
                      const opts = weightOptionsByProduct[product] ?? [];
                      return opts.length > 0 ? (
                        <>
                          <option value="">{tOrder("chooseWeight")}</option>
                          {opts.map((w) => (
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
                      );
                    })()}
                  </select>
                </div>
              )}
              <div>
                <p className="mb-2 text-sm font-medium text-[var(--foreground)]">{tAnimal("orderIncludes")}</p>
                <div className="flex flex-wrap gap-3">
                  {(["includeHead", "includeStomach", "includeIntestines"] as const).map((key) => (
                    <label key={key} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={state[key]}
                        onChange={(e) => set({ [key]: e.target.checked })}
                        className="h-4 w-4 rounded border-[var(--border)]"
                      />
                      <span className="text-sm">{tAnimal(key)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>
          <button
            type="button"
            disabled={!state.weightSelection}
            onClick={() => setStep(7)}
            className="btn-primary flex w-full items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            {tCommon("next")}
            <ChevronRight className="h-5 w-5 rtl:rotate-180" />
          </button>
        </div>
      )}

      {/* Step 7: Order summary + Notes + Add to cart */}
      {step === 7 && (
        <div className="space-y-6">
          {/* Order summary before adding to cart */}
          <section className="rounded-2xl border-2 border-[var(--primary)]/20 bg-[var(--card)] p-4 sm:p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">
              {tOrder("summaryTitle")}
            </h2>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--muted-foreground)]">{tOrder("occasionLabel")}</dt>
                <dd className="font-medium text-[var(--foreground)] text-end">{state.occasion ? (t(state.occasion as "qurban" | "aqiqah" | "personal") ?? state.occasion) : "—"}</dd>
              </div>
              {config && (
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--muted-foreground)]">{tOrder("yourProduct")}</dt>
                  <dd className="font-medium text-[var(--foreground)] text-end">{config.label}</dd>
                </div>
              )}
              {(state.weightLabel || state.weightSelection) && (
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--muted-foreground)]">{tOrder("weightAndAge")}</dt>
                  <dd className="font-medium text-[var(--foreground)] text-end">
                    {state.weightLabel || getWeightBandDisplayLabel(state.weightSelection, state.occasion, locale) || state.weightSelection}
                  </dd>
                </div>
              )}
              {(state.occasion === "qurban" || state.occasion === "aqiqah") && (
                <p className="rounded-lg bg-[var(--muted)]/40 px-3 py-2 text-xs text-[var(--muted-foreground)]">
                  {tAnimal("weightAgeNote")}
                </p>
              )}
              {state.specialCutLabel && (
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--muted-foreground)]">{tOrder("chooseCut")}</dt>
                  <dd className="font-medium text-[var(--foreground)] text-end">{state.specialCutLabel}</dd>
                </div>
              )}
              {state.slaughterDate && (
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--muted-foreground)]">{tAnimal("slaughterDate")}</dt>
                  <dd className="font-medium text-[var(--foreground)] text-end">{state.slaughterDate}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--muted-foreground)]">{tAnimal("distribution")}</dt>
                <dd className="font-medium text-[var(--foreground)] text-end">{tOrder(state.distribution)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--muted-foreground)]">{tAnimal("videoProof")}</dt>
                <dd className="font-medium text-[var(--foreground)] text-end">{state.videoProof ? "Yes" : "No"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--muted-foreground)]">{tAnimal("orderIncludes")}</dt>
                <dd className="font-medium text-[var(--foreground)] text-end">
                  {[state.includeHead && tAnimal("includeHead"), state.includeStomach && tAnimal("includeStomach"), state.includeIntestines && tAnimal("includeIntestines")].filter(Boolean).join(", ") || "—"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">{tOrder("notes")}</h2>
            <textarea
              className="input-base w-full min-h-[88px] resize-y"
              value={state.note}
              onChange={(e) => set({ note: e.target.value })}
              placeholder={tOrder("notesPlaceholder") as string}
            />
          </section>
          {config && (
            <div className="rounded-xl border-2 border-[var(--primary)]/20 bg-[var(--card)] p-4">
              <p className="text-sm font-medium text-[var(--foreground)]">{config.label}</p>
              <p className="mt-1 text-xl font-bold text-[var(--primary)]">
                {(() => {
                  // Use the same pricing logic as the cart item (bands for whole, DB weights otherwise).
                  if (!product) {
                    return formatPriceRange(config.minPrice, config.maxPrice);
                  }
                  const { minPrice, maxPrice } = getPriceRange(
                    product,
                    state,
                    productConfigs,
                    weightOptionsByProduct,
                  );
                  return minPrice === maxPrice
                    ? formatPrice(minPrice)
                    : formatPriceRange(minPrice, maxPrice);
                })()}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="btn-primary flex w-full items-center justify-center gap-2"
            aria-busy={isAddingToCart}
          >
            {isAddingToCart ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
                {tWizard("addingToCart")}
              </>
            ) : (
              tWizard("addToCart")
            )}
          </button>
        </div>
      )}
    </div>
      </div>
    </>
  );
}
