"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import type { CartLineItem } from "@/contexts/CartContext";
import { formatPrice, formatPriceRange, getLocalDateString } from "@/lib/utils";
import { getWeightBandDisplayLabel } from "@/lib/weight-bands";
import { getSpecialCutDisplayLabel } from "@/lib/special-cut-labels";
import type { ProductWeightOption } from "@/lib/content";
import type { SpecialCutOption } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CalendarSelector } from "@/components/ui/CalendarSelector";

const PURPOSES = ["qurban", "aqiqah", "personal"] as const;
const ANIMALS = ["sheep", "goat"] as const;
// Half only for personal; qurban/aqiqah get whole only.
const PORTIONS = ["half", "whole"] as const;

const WIZARD_DRAFT_KEY = "kordoba_order_draft";

type ProductConfigMap = Record<string, { label: string; minPrice: number; maxPrice: number; imageUrl: string }>;
type WeightOptionWithScope = ProductWeightOption & { occasionScope?: string | null };
type WeightOptionsMap = Record<string, WeightOptionWithScope[]>;

function getLocalizedWeightOptionLabel(
  option: WeightOptionWithScope,
  occasion: string,
  locale: string
): string {
  if (option.bandId) {
    const localized = getWeightBandDisplayLabel(option.bandId, occasion, locale);
    if (localized && localized !== option.bandId) return localized;
  }
  return option.label;
}

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
  /** Shown under delivery option (e.g. "We use LalaMove"). Editable in admin Settings. */
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

  const resolvedStartStep =
    initialStep ??
    (initialProduct &&
    (initialProduct === "half_sheep" ||
      initialProduct === "half_goat" ||
      initialProduct === "whole_sheep" ||
      initialProduct === "whole_goat")
      ? 4
      : hasInitialOccasion
        ? 2
        : 1);

  const [step, setStep] = useState(() =>
    Math.min(7, Math.max(1, resolvedStartStep))
  );
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    if (step >= 5) router.prefetch(`/${locale}/cart`);
  }, [step, locale, router]);
  const [draftReady, setDraftReady] = useState(false);
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
  const availablePortionsForStep3 = useMemo(() => {
    const candidatePortions =
      state.occasion === "personal" ? PORTIONS : (["whole"] as const);
    return candidatePortions.filter((p) => {
      const productType = `${p}_${state.animal}`;
      return !!productConfigs[productType];
    });
  }, [state.occasion, state.animal, productConfigs]);
  // Weight options for current product filtered by occasion (qurban/aqiqah -> qurban_aqiqah, personal -> personal)
  const weightOptionsForStep3 = useMemo(() => {
    if (!product) return [];
    const list = weightOptionsByProduct[product] ?? [];
    const scope = state.occasion === "personal" ? "personal" : "qurban_aqiqah";
    return list.filter((o) => o.occasionScope === scope);
  }, [product, state.occasion, weightOptionsByProduct]);
  const selectedWeightDisplay = useMemo(() => {
    if (!state.weightSelection) return "";
    const selectedOption = (weightOptionsByProduct[product] ?? []).find(
      (option) => option.id === state.weightSelection
    );
    if (selectedOption) {
      return getLocalizedWeightOptionLabel(selectedOption, state.occasion, locale);
    }
    return (
      getWeightBandDisplayLabel(state.weightSelection, state.occasion, locale) ||
      state.weightLabel ||
      state.weightSelection
    );
  }, [
    locale,
    product,
    state.occasion,
    state.weightLabel,
    state.weightSelection,
    weightOptionsByProduct,
  ]);

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

  // No half in Qurban or Aqiqah — only Personal can choose half. Force whole for qurban/aqiqah.
  useEffect(() => {
    if (state.occasion === "aqiqah" || state.occasion === "qurban") {
      if (state.portion === "half") {
        setState((s) => ({ ...s, portion: "whole", weightSelection: "", weightLabel: "" }));
      }
    }
  }, [state.occasion, state.portion]);

  // If state is inconsistent with current step (e.g. after a bad restore), step back so the user sees options.
  useEffect(() => {
    if (!draftReady) return;
    if (step === 3 && state.portion) {
      const currentProductType = `${state.portion}_${state.animal}`;
      if (!productConfigs[currentProductType]) {
        setState((s) => ({ ...s, portion: "", weightSelection: "", weightLabel: "" }));
      }
    }
    if (step >= 4 && !state.animal) {
      setStep(2);
      return;
    }
    const p = stateToProduct(state);
    if (step >= 4 && (!p || !productConfigs[p])) {
      setStep(3);
    }
    // Intentionally omit full state to avoid running on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftReady, step, state.animal, state.portion, productConfigs]);

  // Initial hydration: prefer edit mode, then draft from sessionStorage, then URL props.
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
        setDraftReady(true);
        return;
      }
      // if editItemId but no item found, fall through to normal init
      setDraftReady(true);
    }

    // For non-edit flows, try to restore a saved draft.
    if (typeof window !== "undefined" && !editItemId) {
      try {
        const raw = window.sessionStorage.getItem(WIZARD_DRAFT_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as {
            step?: number;
            state?: Partial<WizardState>;
          } | null;
          if (parsed && parsed.state) {
            const draft = parsed.state;
            setState((s) => ({
              ...s,
              ...draft,
              occasion: initialOccasion || draft.occasion || s.occasion,
            }));
            if (parsed.step && parsed.step >= 1 && parsed.step <= 7) {
              setStep(parsed.step);
            }
            setDraftReady(true);
            return;
          }
        }
      } catch {
        // ignore draft errors
      }
    }

    // Fallback: honor initialOccasion / initialProduct when no draft restored.
    // Never allow half_sheep/half_goat for Qurban or Aqiqah — treat as whole.
    if (initialProduct && (initialProduct === "half_sheep" || initialProduct === "half_goat" || initialProduct === "whole_sheep" || initialProduct === "whole_goat")) {
      setState((s) => {
        const occasion = s.occasion || initialOccasion || "";
        const isHalf = initialProduct.startsWith("half");
        const noHalfAllowed = occasion === "qurban" || occasion === "aqiqah";
        return {
          ...s,
          occasion: s.occasion || initialOccasion || "",
          animal: initialProduct.includes("sheep") ? "sheep" : "goat",
          portion: isHalf && noHalfAllowed ? "whole" : isHalf ? "half" : "whole",
        };
      });
      setStep(4);
      setDraftReady(true);
    } else if (initialOccasion && !editItemId) {
      setState((s) => ({ ...s, occasion: initialOccasion }));
      setDraftReady(true);
    } else {
      setDraftReady(true);
    }
  }, [editItemId, initialOccasion, initialProduct, getItemById]);

  // Keep URL in sync with current step and occasion so refresh / language change
  // doesn't always send the user back to the beginning, but avoid redundant replaces.
  useEffect(() => {
    if (!draftReady) return;
    const params = new URLSearchParams();
    if (state.occasion) params.set("occasion", state.occasion);
    if (step) params.set("step", String(step));
    if (editItemId) params.set("edit", editItemId);
    if (initialProduct) params.set("product", initialProduct);
    const qs = params.toString();
    const href = qs ? `/${locale}/order?${qs}` : `/${locale}/order`;

    if (typeof window !== "undefined") {
      const current = window.location.pathname + window.location.search;
      if (current === href) return;
    }

    router.replace(href);
  }, [draftReady, step, state.occasion, editItemId, initialProduct, locale, router]);

  // Persist draft so switching languages / refresh keeps the user's selections.
  useEffect(() => {
    if (typeof window === "undefined" || editItemId || !draftReady) return;
    try {
      const payload = JSON.stringify({
        step,
        state,
      });
      window.sessionStorage.setItem(WIZARD_DRAFT_KEY, payload);
    } catch {
      // ignore storage errors
    }
  }, [draftReady, step, state, editItemId]);

  const set = useCallback((patch: Partial<WizardState>) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);

  const clearDraft = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.removeItem(WIZARD_DRAFT_KEY);
    } catch {
      // ignore storage errors
    }
  }, []);

  const canProceedStep5 = state.slaughterDate.trim() !== "" && state.specialCutId !== "";

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
      weightOptionId: state.weightSelection || undefined,
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
    clearDraft();
    router.push(`/${locale}/cart?added=1`);
    setTimeout(() => setIsAddingToCart(false), 3000);
  }, [state, productConfigs, weightOptionsByProduct, editItemId, addItem, updateItem, clearDraft, router, locale, isAddingToCart]);

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
                    setState({
                      ...defaultState,
                      occasion: key,
                    });
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
            {availablePortionsForStep3.map((p) => {
              const productType = `${p}_${state.animal}` as const;
              const cfg = productConfigs[productType];
              const isSelected = state.portion === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => set({ portion: p, weightSelection: "", weightLabel: "" })}
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
          {(state.portion === "half" || state.portion === "whole") && (
            <div className="space-y-3">
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                {tAnimal("weightSelection")}
              </label>
              {state.occasion !== "personal" && state.portion === "whole" && (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/35 px-4 py-3 text-xs sm:text-sm text-[var(--foreground)]">
                  <p className="mb-2 text-center text-[11px] font-semibold tracking-wide text-[var(--primary)] sm:text-xs">
                    {locale === "ar"
                      ? "شروط العمر للأضحية والعقيقة"
                      : locale === "ms"
                        ? "Syarat umur Korban & Aqiqah"
                        : locale === "zh"
                          ? "古尔邦与阿奇卡的年龄条件"
                          : "Age conditions for Qurban & Aqiqah"}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/90 px-3 py-2">
                      <p className="text-[11px] font-semibold text-[var(--foreground)]">
                        {locale === "ar"
                          ? "الخروف"
                          : locale === "ms"
                            ? "Biri-biri"
                            : locale === "zh"
                              ? "绵羊"
                              : "Sheep"}
                      </p>
                      <p className="mt-0.5 text-xs sm:text-sm">
                        {locale === "ar" ? "أكبر من ٦ أشهر." : ""}
                        {locale === "ms" ? "Lebih 6 bulan." : ""}
                        {locale === "zh" ? "大于 6 个月。" : ""}
                        {locale === "en" ? "More than 6 months." : ""}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/90 px-3 py-2">
                      <p className="text-[11px] font-semibold text-[var(--foreground)]">
                        {locale === "ar"
                          ? "الماعز"
                          : locale === "ms"
                            ? "Kambing"
                            : locale === "zh"
                              ? "山羊"
                              : "Goat"}
                      </p>
                      <p className="mt-0.5 text-xs sm:text-sm">
                        {locale === "ar" ? "أكبر من سنة واحدة." : ""}
                        {locale === "ms" ? "Lebih satu tahun." : ""}
                        {locale === "zh" ? "大于 1 年。" : ""}
                        {locale === "en" ? "More than one year." : ""}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {weightOptionsForStep3.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2" role="list">
                  {weightOptionsForStep3.map((o) => {
                    const localizedLabel = getLocalizedWeightOptionLabel(
                      o,
                      state.occasion,
                      locale
                    );
                    const isSelected = state.weightSelection === o.id;
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() =>
                          set({
                            weightSelection: o.id,
                            weightLabel: localizedLabel,
                          })
                        }
                        className={cn(
                          "rounded-2xl border-2 px-4 py-3 text-start transition-all",
                          isSelected
                            ? "border-[var(--primary)] bg-[var(--primary)]/10 ring-2 ring-[var(--primary)]/20"
                            : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/40 hover:bg-[var(--muted)]/20"
                        )}
                        aria-pressed={isSelected}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold leading-6 text-[var(--foreground)]">
                              {localizedLabel}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-full bg-[var(--muted)] px-2.5 py-1 text-xs font-semibold text-[var(--foreground)]">
                            {formatPrice(o.price)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--muted)]/20 px-4 py-3 text-sm text-[var(--muted-foreground)]">
                  {tOrder("chooseWeight")}
                </div>
              )}
            </div>
          )}
          <button
            type="button"
            disabled={
              !state.portion || !state.weightSelection
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
            <div className="min-w-0 space-y-4 sm:flex sm:items-start sm:gap-4 sm:space-y-0 sm:justify-between">
              <div className="w-full max-w-xs mx-auto sm:w-1/2 sm:max-w-none lg:w-[320px] sm:mx-0">
                <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
                  {tAnimal("slaughterDate")}
                </label>
                <CalendarSelector
                  locale={locale}
                  selected={state.slaughterDate ? new Date(state.slaughterDate) : undefined}
                  onSelect={(date) => {
                    if (!date) return;
                    set({ slaughterDate: getLocalDateString(date) });
                  }}
                />
              </div>
              <div className="mt-4 w-full max-w-xs mx-auto sm:mt-0 sm:flex-1 sm:max-w-none sm:mx-0">
                <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">{tAnimal("distribution")}</label>
                <div className="grid grid-cols-1 gap-2">
                  {(["delivery", "pickup", "donate"] as const).map((value) => {
                    const selected = state.distribution === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => set({ distribution: value })}
                        className={cn(
                          "flex flex-col items-start rounded-xl border px-3 py-2 text-start text-xs sm:text-sm transition-colors",
                          selected
                            ? "border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--foreground)]"
                            : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/50"
                        )}
                      >
                        <span className="font-semibold">
                          {tOrder(value)}
                        </span>
                        <span className="mt-0.5 text-[10px] sm:text-xs text-[var(--muted-foreground)]">
                          {value === "delivery"
                            ? tOrder("deliveryDesc")
                            : value === "pickup"
                              ? tOrder("pickupDesc")
                              : tOrder("donateDesc")}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {state.distribution === "delivery" && (
                  <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
                    {deliveryTransportNote?.trim() || tOrder("deliveryTransportNote")}
                  </p>
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
            onClick={() => setStep(7)}
            className="btn-primary flex w-full items-center justify-center gap-2"
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
          <section className="rounded-2xl border-2 border-[var(--primary)]/20 bg-[var(--card)] p-4 sm:p-5" dir="auto">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">
              {tOrder("summaryTitle")}
            </h2>

            {/* Product & price — works LTR and RTL */}
            {config && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[var(--muted)]/30 px-4 py-3">
                <div className="min-w-0 flex-1 text-start">
                  <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                    {tOrder("occasionLabel")} · {state.occasion ? (t(state.occasion as "qurban" | "aqiqah" | "personal") ?? state.occasion) : tOrder("none")}
                  </p>
                  <p className="mt-0.5 font-semibold text-[var(--foreground)]">{config.label}</p>
                </div>
                <p className="shrink-0 text-end text-lg font-bold text-[var(--primary)]">
                  {product
                    ? (() => {
                        const { minPrice, maxPrice } = getPriceRange(product, state, productConfigs, weightOptionsByProduct);
                        return minPrice === maxPrice ? formatPrice(minPrice) : formatPriceRange(minPrice, maxPrice);
                      })()
                    : formatPriceRange(config.minPrice, config.maxPrice)}
                </p>
              </div>
            )}

            {/* Detail rows — direction-safe alignment */}
            <dl className="divide-y divide-[var(--border)]/80 text-sm">
              {selectedWeightDisplay && (
                <div className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <dt className="shrink-0 text-start text-[var(--muted-foreground)]">{tOrder("weightAndAge")}</dt>
                  <dd className="flex min-w-0 flex-wrap justify-end gap-1.5 text-end">
                    <span className="rounded-md border border-[var(--border)] bg-[var(--muted)]/50 px-2 py-0.5 text-xs text-[var(--muted-foreground)]">
                      {selectedWeightDisplay}
                    </span>
                    {(state.occasion === "qurban" || state.occasion === "aqiqah") && state.animal === "sheep" && (
                      <span className="rounded-md border border-[var(--primary)]/40 bg-[var(--primary)]/15 px-2 py-0.5 text-xs text-[var(--primary)]">
                        {tAnimal("sheepAgeBadge")}
                      </span>
                    )}
                    {(state.occasion === "qurban" || state.occasion === "aqiqah") && state.animal === "goat" && (
                      <span className="rounded-md border border-[var(--primary)]/40 bg-[var(--primary)]/15 px-2 py-0.5 text-xs text-[var(--primary)]">
                        {tAnimal("goatAgeBadge")}
                      </span>
                    )}
                  </dd>
                </div>
              )}
              {state.specialCutLabel && (
                <div className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <dt className="shrink-0 text-start text-[var(--muted-foreground)]">{tOrder("chooseCut")}</dt>
                  <dd className="min-w-0 text-end">
                    <span className="inline-block rounded-md border border-[var(--border)] bg-[var(--muted)]/50 px-2 py-0.5 text-xs text-[var(--foreground)]">
                      {getSpecialCutDisplayLabel(locale, state.specialCutId, state.specialCutLabel)}
                    </span>
                  </dd>
                </div>
              )}
              {state.slaughterDate && (
                <div className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <dt className="shrink-0 text-start text-[var(--muted-foreground)]">{tAnimal("slaughterDate")}</dt>
                  <dd className="font-medium text-[var(--foreground)] text-end">{state.slaughterDate}</dd>
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-2 py-3">
                <dt className="shrink-0 text-start text-[var(--muted-foreground)]">{tAnimal("distribution")}</dt>
                <dd className="font-medium text-[var(--foreground)] text-end">{tOrder(state.distribution)}</dd>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 py-3">
                <dt className="shrink-0 text-start text-[var(--muted-foreground)]">{tAnimal("videoProof")}</dt>
                <dd className="font-medium text-[var(--foreground)] text-end">{state.videoProof ? tCommon("yes") : tCommon("no")}</dd>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 py-3">
                <dt className="shrink-0 text-start text-[var(--muted-foreground)]">{tAnimal("orderIncludes")}</dt>
                <dd className="min-w-0 max-w-[65%] text-end font-medium text-[var(--foreground)]">
                  {[state.includeHead && tAnimal("includeHead"), state.includeStomach && tAnimal("includeStomach"), state.includeIntestines && tAnimal("includeIntestines")].filter(Boolean).join(", ") || tOrder("none")}
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
