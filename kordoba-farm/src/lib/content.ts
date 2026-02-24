import { prisma } from "@/lib/prisma";
import { PRODUCT_DEFAULTS } from "@/lib/utils";
import type { SpecialCutOption } from "@/lib/utils";

const SPECIAL_CUTS_FALLBACK: SpecialCutOption[] = [
  { id: "arabic_8", label: "تقطيع عربى 8 قطع", imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80" },
  { id: "arabic_4", label: "تقطيع عربى 4 قطع", imageUrl: "https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80" },
  { id: "arabic_half_length", label: "تقطيع عربى نص طول", imageUrl: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&q=80" },
  { id: "fridge_medium", label: "تقطيع ثلاجه (قطع متوسطة)", imageUrl: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&q=80" },
  { id: "full_ghozy", label: "غوزي كامل", imageUrl: "https://images.unsplash.com/photo-1615937691194-96f16275d74c?w=400&q=80" },
  { id: "salona_small", label: "تقطيع صالونه(قطع صغيرة)", imageUrl: "https://images.unsplash.com/photo-1615937691172-6119668cae97?w=400&q=80" },
  { id: "biryani_large", label: "تقطيع برياني(قطع كبيرة)", imageUrl: "https://images.unsplash.com/photo-1615937691172-6119668cae97?w=400&q=80" },
  { id: "hadrami_joints", label: "حضرمي مفاصل", imageUrl: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80" },
  { id: "awlaqi_joints", label: "عولقي مفاصل", imageUrl: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80" },
  { id: "maftah", label: "مفطح", imageUrl: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&q=80" },
];

export type ProductConfig = {
  productType: string;
  label: string;
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
  } catch {
    // ignore invalid JSON
  }
  return imageUrl;
}

/** Get all products from DB, or fallback to static defaults. Resolves image per locale. */
export async function getProducts(locale?: string, occasion?: string): Promise<ProductConfig[]> {
  try {
    const rows = await prisma.product.findMany({ orderBy: { sortOrder: "asc" } });
    if (rows.length === 0) {
      return Object.entries(PRODUCT_DEFAULTS).map(([productType, p]) => ({
        productType,
        label: p.label,
        minPrice: p.minPrice,
        maxPrice: p.maxPrice,
        imageUrl: p.imageUrl,
      }));
    }
    return rows.map((p) => ({
      productType: p.productType,
      label: p.label,
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
  label: string;
  price: number;
  sortOrder: number;
};

/** Get weight options enabled for a product (from global WeightOption + ProductWeight junction). Empty if none. */
export async function getProductWeights(productType: string): Promise<ProductWeightOption[]> {
  try {
    const rows = await prisma.productWeight.findMany({
      where: { productType },
      include: { weightOption: true },
      orderBy: { sortOrder: "asc" },
    });
    return rows.map((r) => ({
      id: r.weightOption.id,
      label: r.weightOption.label,
      price: r.weightOption.price,
      sortOrder: r.sortOrder,
    }));
  } catch (err) {
    console.error("getProductWeights: returning empty weights due to DB error", err);
    return [];
  }
}

/** Get all special cuts from DB, or fallback to static. Single image per cut. */
export async function getSpecialCuts(): Promise<SpecialCutOption[]> {
  try {
    const rows = await prisma.specialCut.findMany({ orderBy: { sortOrder: "asc" } });
    if (rows.length === 0) return SPECIAL_CUTS_FALLBACK;
    return rows.map((r) => ({
      id: r.cutId,
      label: r.label,
      imageUrl: r.imageUrl,
      videoUrl: r.videoUrl ?? undefined,
    }));
  } catch (err) {
    console.error("getSpecialCuts: falling back to static defaults due to DB error", err);
    return SPECIAL_CUTS_FALLBACK;
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
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    return row?.value ?? null;
  } catch (err) {
    console.error("getSiteSetting: returning null due to DB error", err);
    return null;
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
