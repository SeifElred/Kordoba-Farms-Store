import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { PRODUCT_DEFAULTS } from "@/lib/utils";
import type { SpecialCutOption } from "@/lib/utils";

const SPECIAL_CUTS_FALLBACK: SpecialCutOption[] = [
  { id: "arabic_8", label: "تقطيع عربى 8 قطع", imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80" },
  { id: "arabic_4", label: "تقطيع عربى 4 قطع", imageUrl: "https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80" },
  { id: "arabic_half_length", label: "تقطيع عربى نص طول", imageUrl: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&q=80" },
  { id: "fridge_medium", label: "تقطيع ثلاجه (قطع متوسطة)", imageUrl: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&q=80" },
  { id: "salona_small", label: "تقطيع صالونه (قطع صغيرة)", imageUrl: "https://images.unsplash.com/photo-1615937691172-6119668cae97?w=400&q=80" },
  { id: "biryani_large", label: "تقطيع برياني (قطع كبيرة)", imageUrl: "https://images.unsplash.com/photo-1615937691172-6119668cae97?w=400&q=80" },
  { id: "hadrami_joints", label: "حضرمي مفاصل", imageUrl: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80" },
  { id: "maftah", label: "مفطح", imageUrl: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&q=80" },
];

// Short-lived cache to make the order flow feel instant without changing user-facing behavior.
const CONTENT_REVALIDATE_SECONDS = 15;

const getCachedProductRows = unstable_cache(
  async () => prisma.product.findMany({ orderBy: { sortOrder: "asc" } }),
  ["content-products"],
  { revalidate: CONTENT_REVALIDATE_SECONDS }
);

const getCachedProductWeightRows = unstable_cache(
  async () =>
    prisma.productWeight.findMany({
      include: { weightOption: true },
      orderBy: [{ productType: "asc" }, { sortOrder: "asc" }],
    }),
  ["content-product-weights"],
  { revalidate: CONTENT_REVALIDATE_SECONDS }
);

const getCachedSpecialCutRows = unstable_cache(
  async () => prisma.specialCut.findMany({ orderBy: { sortOrder: "asc" } }),
  ["content-special-cuts"],
  { revalidate: CONTENT_REVALIDATE_SECONDS }
);

const getCachedSiteSettingRows = unstable_cache(
  async () => prisma.siteSetting.findMany(),
  ["content-site-settings"],
  { revalidate: CONTENT_REVALIDATE_SECONDS }
);

export type ProductConfig = {
  productType: string;
  label: string;
  enabled?: boolean;
  minPrice: number;
  maxPrice: number;
  imageUrl: string;
};

function resolveImageUrl(
  imageUrl: string,
  imageUrlByLocale: string | null,
  locale: string,
  occasion?: string,
): string {
  if (!imageUrlByLocale) return imageUrl;
  try {
    const map = JSON.parse(imageUrlByLocale) as Record<string, string>;
    const loc = locale ?? "en";
    // Prefer most specific keys first: occasion+locale, then occasion-only, then locale-only
    if (occasion) {
      const occLocKey = `${occasion}:${loc}`;
      const occKey = occasion;
      if (map[occLocKey]?.trim()) return map[occLocKey].trim();
      if (map[occKey]?.trim()) return map[occKey].trim();
    }
    if (map[loc]?.trim()) return map[loc].trim();
    // If MS/ZH aren't explicitly overridden, reuse EN by default (unless you split them).
    if ((loc === "ms" || loc === "zh") && map.en?.trim()) return map.en.trim();
  } catch {
    // ignore invalid JSON
  }
  return imageUrl;
}

/** Get all products from DB, or fallback to static defaults. Resolves image per locale. */
export async function getProducts(locale?: string, occasion?: string): Promise<ProductConfig[]> {
  try {
    const rows = await getCachedProductRows();
    const enabledRows = rows.filter((p) => p.enabled);
    if (enabledRows.length === 0) {
      return Object.entries(PRODUCT_DEFAULTS).map(([productType, p]) => ({
        productType,
        label: p.label,
        minPrice: p.minPrice,
        maxPrice: p.maxPrice,
        imageUrl: p.imageUrl,
      }));
    }
    return enabledRows.map((p) => ({
      productType: p.productType,
      label: p.label,
      enabled: p.enabled,
      minPrice: p.minPrice,
      maxPrice: p.maxPrice,
      imageUrl: resolveImageUrl(p.imageUrl, p.imageUrlByLocale, locale ?? "en", occasion),
    }));
  } catch (err) {
    console.error("getProducts: falling back to static defaults due to DB error", err);
    return Object.entries(PRODUCT_DEFAULTS).map(([productType, p]) => ({
      productType,
      label: p.label,
      minPrice: p.minPrice,
      maxPrice: p.maxPrice,
      imageUrl: p.imageUrl,
    }));
  }
}

/** Get product configs keyed by productType with a single products query. */
export async function getProductsMap(
  locale?: string,
  occasion?: string
): Promise<Record<string, ProductConfig>> {
  const products = await getProducts(locale, occasion);
  return Object.fromEntries(products.map((p) => [p.productType, p]));
}

/** Admin-only: includes disabled products. */
export async function getAllProductsMap(
  locale?: string,
  occasion?: string
): Promise<Record<string, ProductConfig>> {
  try {
    const rows = await getCachedProductRows();
    return Object.fromEntries(
      rows.map((p) => [
        p.productType,
        {
          productType: p.productType,
          label: p.label,
          enabled: p.enabled,
          minPrice: p.minPrice,
          maxPrice: p.maxPrice,
          imageUrl: resolveImageUrl(p.imageUrl, p.imageUrlByLocale, locale ?? "en", occasion),
        },
      ])
    );
  } catch (err) {
    console.error("getAllProductsMap: falling back to defaults due to DB error", err);
    return Object.fromEntries(
      Object.entries(PRODUCT_DEFAULTS).map(([productType, p]) => [
        productType,
        { productType, label: p.label, enabled: true, minPrice: p.minPrice, maxPrice: p.maxPrice, imageUrl: p.imageUrl },
      ])
    );
  }
}

/** Get one product config by productType. Resolves image per locale. */
export async function getProductConfig(
  productType: string,
  locale?: string,
  occasion?: string,
): Promise<ProductConfig | null> {
  const products = await getProducts(locale, occasion);
  return products.find((p) => p.productType === productType) ?? null;
}

export type ProductWeightOption = {
  id: string;
  bandId?: string | null;
  label: string;
  price: number;
  sortOrder: number;
  /** "qurban_aqiqah" | "personal" — filter by occasion in wizard */
  occasionScope?: string | null;
};

/** Get weight options enabled for a product. Optionally filter by occasion (qurban/aqiqah -> qurban_aqiqah, personal -> personal). */
export async function getProductWeights(
  productType: string,
  occasion?: string
): Promise<ProductWeightOption[]> {
  try {
    const rows = (await getCachedProductWeightRows()).filter(
      (r) => r.productType === productType
    );
    let list = rows.map((r) => ({
      id: r.weightOption.id,
      bandId: r.weightOption.bandId ?? undefined,
      label: r.weightOption.label,
      price: r.weightOption.price,
      sortOrder: r.sortOrder,
      occasionScope: r.weightOption.occasionScope ?? undefined,
    }));
    if (occasion === "personal") {
      list = list.filter((x) => x.occasionScope === "personal");
    } else if (occasion === "qurban" || occasion === "aqiqah") {
      list = list.filter((x) => x.occasionScope === "qurban_aqiqah");
    }
    return list;
  } catch (err) {
    console.error("getProductWeights: returning empty weights due to DB error", err);
    return [];
  }
}

/** Get weight options for multiple product types in a single query, grouped by productType. */
export async function getProductWeightsByProduct(
  productTypes: string[],
  occasion?: string
): Promise<Record<string, ProductWeightOption[]>> {
  try {
    const rows = (await getCachedProductWeightRows()).filter((r) =>
      productTypes.includes(r.productType)
    );

    const grouped: Record<string, ProductWeightOption[]> = Object.fromEntries(
      productTypes.map((pt) => [pt, []])
    );

    const scope =
      occasion === "personal"
        ? "personal"
        : occasion === "qurban" || occasion === "aqiqah"
          ? "qurban_aqiqah"
          : null;

    for (const r of rows) {
      const option: ProductWeightOption = {
        id: r.weightOption.id,
        bandId: r.weightOption.bandId ?? undefined,
        label: r.weightOption.label,
        price: r.weightOption.price,
        sortOrder: r.sortOrder,
        occasionScope: r.weightOption.occasionScope ?? undefined,
      };

      if (scope && option.occasionScope !== scope) continue;
      grouped[r.productType].push(option);
    }

    return grouped;
  } catch (err) {
    console.error("getProductWeightsByProduct: returning empty weights due to DB error", err);
    return Object.fromEntries(productTypes.map((pt) => [pt, []]));
  }
}

function localizeCutLabel(id: string, fallbackLabel: string, locale: string): string {
  const loc = locale || "en";
  const map: Record<string, Record<string, string>> = {
    arabic_8: {
      ar: "تقطيع عربى 8 قطع",
      en: "Arabic cut – 8 pieces",
      ms: "Potongan Arab – 8 bahagian",
      zh: "阿拉伯切法 – 8 块",
    },
    arabic_4: {
      ar: "تقطيع عربى 4 قطع",
      en: "Arabic cut – 4 pieces",
      ms: "Potongan Arab – 4 bahagian",
      zh: "阿拉伯切法 – 4 块",
    },
    arabic_half_length: {
      ar: "تقطيع عربى نص طول",
      en: "Arabic long cut",
      ms: "Potongan Arab memanjang",
      zh: "阿拉伯长条切法",
    },
    fridge_medium: {
      ar: "تقطيع ثلاجه (قطع متوسطة)",
      en: "Fridge cut (medium pieces)",
      ms: "Potongan peti sejuk (sederhana)",
      zh: "冷藏切块（中块）",
    },
    salona_small: {
      ar: "تقطيع صالونه (قطع صغيرة)",
      en: "Salona cut (small stew pieces)",
      ms: "Potongan salona (kecil untuk gulai)",
      zh: "沙洛娜炖菜切块（小块）",
    },
    biryani_large: {
      ar: "تقطيع برياني (قطع كبيرة)",
      en: "Biryani cut (large pieces)",
      ms: "Potongan briyani (besar)",
      zh: "手抓饭切块（大块）",
    },
    hadrami_joints: {
      ar: "حضرمي مفاصل",
      en: "Hadrami joints",
      ms: "Sendi Hadrami",
      zh: "哈德拉米关节切块",
    },
    maftah: {
      ar: "مفطح",
      en: "Maftah / mandi style",
      ms: "Maftah / mandi",
      zh: "马夫塔 / 曼迪风格切法",
    },
  };
  const byId = map[id];
  if (byId && byId[loc]) return byId[loc];
  if (byId && byId.en) return byId.en;
  return fallbackLabel;
}

/** Get all special cuts from DB, or fallback to static. Single image per cut. */
export async function getSpecialCuts(locale?: string): Promise<SpecialCutOption[]> {
  try {
    const rows = await getCachedSpecialCutRows();
    const loc = locale ?? "en";
    if (rows.length === 0) {
      return SPECIAL_CUTS_FALLBACK.map((c) => ({
        ...c,
        label: localizeCutLabel(c.id, c.label, loc),
      }));
    }
    // Filter out deprecated cuts (e.g. "غوزي كامل", "عولقي مفاصل") even if still in DB.
    const filtered = rows.filter(
      (r) => r.cutId !== "full_ghozy" && r.cutId !== "awlaqi_joints",
    );
    return filtered.map((r) => ({
      id: r.cutId,
      label: localizeCutLabel(r.cutId, r.label, loc),
      imageUrl: resolveImageUrl(r.imageUrl, r.imageUrlByLocale, loc),
      videoUrl: r.videoUrl ?? undefined,
    }));
  } catch (err) {
    console.error("getSpecialCuts: falling back to static defaults due to DB error", err);
    const loc = locale ?? "en";
    return SPECIAL_CUTS_FALLBACK.map((c) => ({
      ...c,
      label: localizeCutLabel(c.id, c.label, loc),
    }));
  }
}

/** Build nested object from flat keys (e.g. "nav.home" -> { nav: { home: "..." } }). */
function nestKeys(flat: Record<string, string>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split(".");
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current) || typeof current[part] !== "object") {
        current[part] = {};
      }
      current = current[part] as Record<string, unknown>;
    }
    current[parts[parts.length - 1]] = value;
  }
  return result;
}

/** Get all translations for a locale as nested messages object, or null if none. */
export async function getMessagesForLocale(locale: string): Promise<Record<string, unknown> | null> {
  try {
    const rows = await prisma.translation.findMany({
      where: { locale },
    });
    if (rows.length === 0) return null;
    const flat: Record<string, string> = {};
    for (const r of rows) {
      flat[r.key] = r.value;
    }
    return nestKeys(flat) as Record<string, unknown>;
  } catch (err) {
    console.error("getMessagesForLocale: returning null due to DB error", err);
    return null;
  }
}

/** Theme IDs for seasonal/welcoming templates (default, ramadan, eid). */
export const THEME_IDS = ["default", "ramadan", "eid"] as const;
export type ThemeId = (typeof THEME_IDS)[number];

const ORDER_MESSAGE_TEMPLATE_KEYS: Record<ThemeId, string> = {
  default: "order_message_template",
  ramadan: "order_message_template_ramadan",
  eid: "order_message_template_eid",
};

/** Get the order message template for the currently active theme. */
export async function getActiveOrderMessageTemplate(): Promise<string | null> {
  try {
    const active = (await getSiteSetting("active_theme")) as ThemeId | null;
    const theme: ThemeId = active && THEME_IDS.includes(active) ? active : "default";
    const key = ORDER_MESSAGE_TEMPLATE_KEYS[theme];
    return getSiteSetting(key);
  } catch (err) {
    console.error("getActiveOrderMessageTemplate: returning null due to DB error", err);
    return null;
  }
}

const THEME_BANNER_KEYS: Record<ThemeId, string> = {
  default: "theme_banner_text_default",
  ramadan: "theme_banner_text_ramadan",
  eid: "theme_banner_text_eid",
};
const THEME_HERO_HEADING_KEYS: Record<ThemeId, string> = {
  default: "theme_hero_heading_default",
  ramadan: "theme_hero_heading_ramadan",
  eid: "theme_hero_heading_eid",
};
const THEME_HERO_SUBTITLE_KEYS: Record<ThemeId, string> = {
  default: "theme_hero_subtitle_default",
  ramadan: "theme_hero_subtitle_ramadan",
  eid: "theme_hero_subtitle_eid",
};

export type ActiveThemeData = {
  themeId: ThemeId;
  bannerText: string | null;
  heroHeading: string | null;
  heroSubtitle: string | null;
};

/** Get site-wide theme data for the active theme (banner, hero heading/subtitle). */
export async function getActiveThemeData(): Promise<ActiveThemeData> {
  try {
    const active = (await getSiteSetting("active_theme")) as ThemeId | null;
    const themeId: ThemeId = active && THEME_IDS.includes(active) ? active : "default";
    const [bannerText, heroHeading, heroSubtitle] = await Promise.all([
      getSiteSetting(THEME_BANNER_KEYS[themeId]),
      getSiteSetting(THEME_HERO_HEADING_KEYS[themeId]),
      getSiteSetting(THEME_HERO_SUBTITLE_KEYS[themeId]),
    ]);
    return {
      themeId,
      bannerText: bannerText ?? null,
      heroHeading: heroHeading ?? null,
      heroSubtitle: heroSubtitle ?? null,
    };
  } catch (err) {
    console.error("getActiveThemeData: falling back to default theme due to DB error", err);
    return {
      themeId: "default",
      bannerText: null,
      heroHeading: null,
      heroSubtitle: null,
    };
  }
}

/** Get a site setting by key, or null. */
export async function getSiteSetting(key: string): Promise<string | null> {
  try {
    const rows = await getCachedSiteSettingRows();
    const row = rows.find((r) => r.key === key);
    return row ? row.value : null;
  } catch (err) {
    console.error("getSiteSetting: returning null due to DB error", err);
    return null;
  }
}

/** Get multiple site settings in one query. Missing keys are returned as null. */
export async function getSiteSettings(
  keys: string[]
): Promise<Record<string, string | null>> {
  try {
    const rows = (await getCachedSiteSettingRows()).filter((r) =>
      keys.includes(r.key)
    );
    const map = new Map(rows.map((r) => [r.key, r.value]));
    return Object.fromEntries(keys.map((key) => [key, map.get(key) ?? null]));
  } catch (err) {
    console.error("getSiteSettings: returning nulls due to DB error", err);
    return Object.fromEntries(keys.map((key) => [key, null]));
  }
}

/** Get cities list (JSON array string) from settings, or null. */
export async function getCities(): Promise<string[]> {
  const raw = await getSiteSetting("cities");
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}
