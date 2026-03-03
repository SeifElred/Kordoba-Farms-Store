/**
 * Weight band definitions and display labels (including age for personal).
 * Shared so cart and order wizard show the same weight/age text.
 */

const QURBAN_AQIQAH_IDS = [
  "whole_28_30", "whole_31_33", "whole_34_36", "whole_37_40",
  "whole_41_45", "whole_46_50", "whole_51_55", "whole_56_60",
  "whole_61_65", "whole_66_70", "whole_71_75", "whole_76_80",
] as const;

const PERSONAL_BANDS = [
  { id: "personal_17_20", minKg: 17, maxKg: 20, minAgeDays: 45, maxAgeDays: 55 },
  { id: "personal_21_26", minKg: 21, maxKg: 26, minAgeDays: 60, maxAgeDays: 80 },
  { id: "personal_28_30", minKg: 28, maxKg: 30, minAgeMonths: 3, maxAgeMonths: 5 },
  { id: "personal_31_33", minKg: 31, maxKg: 33, minAgeMonths: 3, maxAgeMonths: 5 },
  { id: "personal_34_36", minKg: 34, maxKg: 36, minAgeMonths: 3, maxAgeMonths: 5 },
  { id: "personal_37_40", minKg: 37, maxKg: 40, minAgeMonths: 3, maxAgeMonths: 5 },
] as const;

const QURBAN_KG: Record<string, { minKg: number; maxKg: number }> = {};
[[28, 30], [31, 33], [34, 36], [37, 40], [41, 45], [46, 50], [51, 55], [56, 60], [61, 65], [66, 70], [71, 75], [76, 80]].forEach(([minKg, maxKg], i) => {
  QURBAN_KG[QURBAN_AQIQAH_IDS[i]] = { minKg, maxKg };
});

function formatKg(locale: string, minKg: number, maxKg: number): string {
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar" : locale);
  if (locale === "ar") return `${nf.format(minKg)} إلى ${nf.format(maxKg)} كغ`;
  return `${nf.format(minKg)} – ${nf.format(maxKg)} kg`;
}

/**
 * Returns display label for a weight band, including age for personal bands.
 * Use when weightLabel is missing (e.g. old cart item) or to ensure age is shown.
 */
export function getWeightBandDisplayLabel(
  weightSelectionId: string,
  occasion: string,
  locale: string
): string {
  if (!weightSelectionId) return "";

  const nf = new Intl.NumberFormat(locale === "ar" ? "ar" : locale === "zh" ? "zh" : locale);

  if (occasion === "personal") {
    const band = PERSONAL_BANDS.find((b) => b.id === weightSelectionId);
    if (!band) return weightSelectionId;
    const weightPart = formatKg(locale, band.minKg, band.maxKg);
    if ("minAgeDays" in band && band.minAgeDays != null && band.maxAgeDays != null) {
      if (locale === "ar") return `عمر ${nf.format(band.minAgeDays)} إلى ${nf.format(band.maxAgeDays)} يوم · ${weightPart}`;
      if (locale === "ms") return `Umur ${nf.format(band.minAgeDays)}–${nf.format(band.maxAgeDays)} hari · ${weightPart}`;
      if (locale === "zh") return `月龄 ${nf.format(band.minAgeDays)}–${nf.format(band.maxAgeDays)} 天 · ${weightPart}`;
      return `Age ${band.minAgeDays}–${band.maxAgeDays} days · ${weightPart}`;
    }
    if ("minAgeMonths" in band && band.minAgeMonths != null && band.maxAgeMonths != null) {
      if (locale === "ar") return `عمر ${nf.format(band.minAgeMonths)} إلى ${nf.format(band.maxAgeMonths)} شهر · ${weightPart}`;
      if (locale === "ms") return `Umur ${nf.format(band.minAgeMonths)}–${nf.format(band.maxAgeMonths)} bulan · ${weightPart}`;
      if (locale === "zh") return `月龄 ${nf.format(band.minAgeMonths)}–${nf.format(band.maxAgeMonths)} 个月 · ${weightPart}`;
      return `Age ${band.minAgeMonths}–${band.maxAgeMonths} months · ${weightPart}`;
    }
    return weightPart;
  }

  const kg = QURBAN_KG[weightSelectionId];
  if (kg) return formatKg(locale, kg.minKg, kg.maxKg);
  return weightSelectionId;
}
