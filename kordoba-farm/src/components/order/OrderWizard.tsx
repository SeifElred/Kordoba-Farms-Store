"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import type { CartLineItem } from "@/contexts/CartContext";
import { formatPrice, formatPriceRange, getLocalDateString } from "@/lib/utils";
import type { ProductWeightOption } from "@/lib/content";
import type { SpecialCutOption } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

const PURPOSES = ["qurban", "aqiqah", "personal"] as const;
const ANIMALS = ["sheep", "goat"] as const;
const PORTIONS = ["half", "whole"] as const;

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
  const weights = weightOptionsByProduct[product] ?? [];
  if (weights.length > 0 && state.weightSelection) {
    const w = weights.find((x) => x.id === state.weightSelection);
    if (w) return { minPrice: w.price, maxPrice: w.price, productLabel: config.label };
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

  const startStep =
    initialProduct && (initialProduct === "half_sheep" || initialProduct === "half_goat" || initialProduct === "whole_sheep" || initialProduct === "whole_goat")
      ? 4
      : initialOccasion && !editItemId
        ? 2
        : initialStep ?? 1;
  const [step, setStep] = useState(Math.min(7, Math.max(1, startStep)));
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
  const weightOptions = product ? (weightOptionsByProduct[product] ?? []) : [];

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
    if (!productType || !state.occasion || !state.specialCutId) return;
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
      weightLabel: state.weightLabel || undefined,
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
  }, [state, productConfigs, weightOptionsByProduct, editItemId, addItem, updateItem, router, locale]);

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
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            {tCommon("back")}
          </button>
        )}
      </div>

      {/* Step 1: Purpose */}
      {step === 1 && (
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
                  <div className="relative aspect-[4/3] bg-[var(--muted)]">
                    <Image src={animalImages[a]} alt={tWizard(a)} fill className="object-cover" sizes="50vw" />
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
                    <div className="relative aspect-[4/3] bg-[var(--muted)]">
                      <Image src={cfg.imageUrl} alt={tWizard(p)} fill className="object-cover" sizes="50vw" />
                    </div>
                  )}
                  <div className="p-4">
                    <span className="text-lg font-semibold text-[var(--foreground)]">{tWizard(p)}</span>
                    {cfg && (
                      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                        {formatPriceRange(cfg.minPrice, cfg.maxPrice)}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            disabled={!state.portion}
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
            {specialCuts.map((cut) => {
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
                  <div className="relative aspect-[4/3] bg-[var(--muted)]">
                    <Image src={cut.imageUrl} alt={cut.label} fill className="object-cover" sizes="50vw" />
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
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">{tAnimal("weightSelection")}</label>
                <select
                  className="input-base w-full"
                  value={state.weightSelection}
                  onChange={(e) => {
                    const opt = weightOptions.find((w) => w.id === e.target.value);
                    set({ weightSelection: e.target.value, weightLabel: opt?.label ?? "" });
                  }}
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

      {/* Step 7: Notes + Add to cart */}
      {step === 7 && (
        <div className="space-y-6">
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
                {weightOptions.length > 0 && state.weightSelection
                  ? (() => {
                      const w = weightOptions.find((x) => x.id === state.weightSelection);
                      return w ? formatPrice(w.price) : formatPriceRange(config.minPrice, config.maxPrice);
                    })()
                  : formatPriceRange(config.minPrice, config.maxPrice)}
              </p>
            </div>
          )}
          <button type="button" onClick={handleAddToCart} className="btn-primary w-full">
            {editItemId ? tWizard("addToCart") : tWizard("addToCart")}
          </button>
        </div>
      )}
    </div>
      </div>
    </>
  );
}
