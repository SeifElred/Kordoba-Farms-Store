import type { Metadata } from "next";

export const SEO_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://store.kordobafarms.com";

export const SEO_GBP_URL = process.env.NEXT_PUBLIC_GBP_URL ?? "";
export const SEO_WHATSAPP_URL = process.env.NEXT_PUBLIC_WHATSAPP_LINK ?? "";

export const SEO_LOCALES = ["ar", "en", "ms", "zh"] as const;
export type SeoLocale = (typeof SEO_LOCALES)[number];

export const PRIORITY_SERVICE_AREAS = [
  "Cheras",
  "Ampang",
  "Taman Melawati",
  "Serdang",
  "Sri Kembangan",
  "Cyberjaya",
  "Putrajaya",
] as const;

const HREFLANG_BY_LOCALE: Record<SeoLocale, string> = {
  ar: "ar-MY",
  en: "en-MY",
  ms: "ms-MY",
  zh: "zh-MY",
};

const OG_LOCALE_BY_LOCALE: Record<SeoLocale, string> = {
  ar: "ar_MY",
  en: "en_MY",
  ms: "ms_MY",
  zh: "zh_MY",
};

type SeoMetadataInput = {
  locale: string;
  pathname: string;
  title: string;
  description: string;
  keywords?: string[];
  robots?: Metadata["robots"];
};

export function normalizePathname(pathname: string): string {
  if (!pathname || pathname === "/") return "";
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

export function getLocalizedUrl(locale: string, pathname = ""): string {
  const normalized = normalizePathname(pathname);
  return `${SEO_BASE_URL}/${locale}${normalized}`;
}

export function getAlternates(pathname = ""): NonNullable<Metadata["alternates"]> {
  const normalized = normalizePathname(pathname);
  const languages = Object.fromEntries(
    SEO_LOCALES.map((locale) => [
      HREFLANG_BY_LOCALE[locale],
      getLocalizedUrl(locale, normalized),
    ])
  );

  return {
    canonical: getLocalizedUrl("en", normalized),
    languages: {
      ...languages,
      "x-default": getLocalizedUrl("en", normalized),
    },
  };
}

export function buildPageMetadata({
  locale,
  pathname,
  title,
  description,
  keywords,
  robots,
}: SeoMetadataInput): Metadata {
  const safeLocale = (SEO_LOCALES.includes(locale as SeoLocale)
    ? locale
    : "en") as SeoLocale;
  const url = getLocalizedUrl(safeLocale, pathname);
  const alternates = getAlternates(pathname);
  // Self-canonical: each locale version is canonical for its own URL (best for multilingual).
  const alternatesWithCanonical = { ...alternates, canonical: url };

  return {
    title,
    description,
    keywords,
    alternates: alternatesWithCanonical,
    robots,
    openGraph: {
      title,
      description,
      url,
      siteName: "Kordoba Farms",
      locale: OG_LOCALE_BY_LOCALE[safeLocale],
      type: "website",
      images: [
        {
          url: `${SEO_BASE_URL}/${safeLocale}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: "Kordoba Farms – Aqiqah & Qurban Malaysia (Goat & Sheep)",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function getLocalizedAreaSentence(locale: string): string {
  if (locale === "ar") {
    return "نخدم كوالالمبور والمناطق القريبة مثل شيراس، أمبانغ، تامان ملاواتي، سردانغ، سري كمبانغان، سيبرجايا وبوتراجايا.";
  }
  if (locale === "ms") {
    return "Kami melayani Kuala Lumpur dan kawasan sekitar seperti Cheras, Ampang, Taman Melawati, Serdang, Sri Kembangan, Cyberjaya dan Putrajaya.";
  }
  if (locale === "zh") {
    return "我们服务于吉隆坡及周边区域，包括蕉赖、安邦、塔曼美拉瓦蒂、沙登、史里肯邦安、赛城和布城。";
  }
  return "We serve Kuala Lumpur and nearby areas including Cheras, Ampang, Taman Melawati, Serdang, Sri Kembangan, Cyberjaya, and Putrajaya.";
}

/** High-intent phrases: aqiqah/qurban/goat/sheep/meat + Malaysia, KL, and each area. */
const CORE_INTENT_KEYWORDS_EN = [
  "Kordoba Farms",
  "Qurban Malaysia",
  "Aqiqah Malaysia",
  "book qurban Malaysia",
  "book aqiqah Malaysia",
  "order qurban online Malaysia",
  "order aqiqah online Malaysia",
  "halal goat Malaysia",
  "halal sheep Malaysia",
  "halal lamb Malaysia",
  "buy goat Malaysia",
  "buy sheep Malaysia",
  "goat for qurban",
  "sheep for qurban",
  "goat for aqiqah",
  "sheep for aqiqah",
  "personal halal meat Malaysia",
  "fresh halal meat delivery",
  "qurban Kuala Lumpur",
  "aqiqah Kuala Lumpur",
  "qurban KL",
  "aqiqah KL",
  "goat delivery KL",
  "lamb delivery KL",
  "qurban Cheras",
  "aqiqah Cheras",
  "qurban Ampang",
  "aqiqah Ampang",
  "qurban Taman Melawati",
  "aqiqah Taman Melawati",
  "qurban Serdang",
  "aqiqah Serdang",
  "qurban Sri Kembangan",
  "aqiqah Sri Kembangan",
  "qurban Cyberjaya",
  "aqiqah Cyberjaya",
  "qurban Putrajaya",
  "aqiqah Putrajaya",
  "goat sheep Cheras",
  "goat sheep Ampang",
  "halal meat delivery Cheras",
  "halal meat delivery Ampang",
  ...PRIORITY_SERVICE_AREAS,
];

const CORE_INTENT_KEYWORDS_MS = [
  "Kordoba Farms",
  "Korban Malaysia",
  "Aqiqah Malaysia",
  "tempah korban",
  "tempah aqiqah",
  "tempah korban online",
  "tempah aqiqah online",
  "kambing korban",
  "biri-biri korban",
  "kambing aqiqah",
  "biri-biri aqiqah",
  "daging kambing",
  "daging biri-biri",
  "daging kambing segar",
  "daging halal Malaysia",
  "beli kambing Malaysia",
  "beli biri-biri",
  "halal goat Malaysia",
  "halal sheep Malaysia",
  "qurban Kuala Lumpur",
  "aqiqah Kuala Lumpur",
  "korban Cheras",
  "aqiqah Cheras",
  "korban Ampang",
  "aqiqah Ampang",
  "korban Taman Melawati",
  "aqiqah Taman Melawati",
  "korban Serdang",
  "aqiqah Serdang",
  "korban Sri Kembangan",
  "aqiqah Sri Kembangan",
  "korban Cyberjaya",
  "aqiqah Cyberjaya",
  "korban Putrajaya",
  "aqiqah Putrajaya",
  ...PRIORITY_SERVICE_AREAS,
];

const CORE_INTENT_KEYWORDS_AR = [
  "مزارع قرطبة",
  "أضاحي ماليزيا",
  "عقيقة ماليزيا",
  "حجز أضحية ماليزيا",
  "حجز عقيقة ماليزيا",
  "أضاحي كوالالمبور",
  "عقيقة كوالالمبور",
  "لحم ضاني حلال",
  "لحم ماعز حلال",
  "خروف للأضحية",
  "خروف للعقيقة",
  "ماعز للأضحية",
  "ماعز للعقيقة",
  "أضاحي شيراس",
  "عقيقة شيراس",
  "أضاحي أمبانغ",
  "عقيقة أمبانغ",
  "أضاحي سردانغ",
  "عقيقة سردانغ",
  "أضاحي سري كمبانغان",
  "عقيقة سري كمبانغان",
  "أضاحي سيبرجايا",
  "عقيقة سيبرجايا",
  "أضاحي بوتراجايا",
  "عقيقة بوتراجايا",
  ...PRIORITY_SERVICE_AREAS,
];

const CORE_INTENT_KEYWORDS_ZH = [
  "科尔多巴农场",
  "马来西亚古尔邦",
  "马来西亚阿奇卡",
  "吉隆坡古尔邦",
  "吉隆坡阿奇卡",
  "预订古尔邦",
  "预订阿奇卡",
  "古尔邦羊",
  "阿奇卡羊",
  "清真羊肉马来西亚",
  "清真羊肉吉隆坡",
  "蕉赖古尔邦",
  "蕉赖阿奇卡",
  "安邦古尔邦",
  "安邦阿奇卡",
  "沙登古尔邦",
  "沙登阿奇卡",
  "史里肯邦安古尔邦",
  "赛城古尔邦",
  "布城古尔邦",
  "布城阿奇卡",
  ...PRIORITY_SERVICE_AREAS,
];

export function getCoreSeoKeywords(locale: string): string[] {
  if (locale === "ar") return Array.from(new Set(CORE_INTENT_KEYWORDS_AR));
  if (locale === "ms") return Array.from(new Set(CORE_INTENT_KEYWORDS_MS));
  if (locale === "zh") return Array.from(new Set(CORE_INTENT_KEYWORDS_ZH));
  return Array.from(new Set(CORE_INTENT_KEYWORDS_EN));
}

/** One sentence per service area for on-page SEO (area + aqiqah/qurban/goat/sheep). */
export function getAreaKeywordSentences(locale: string): { area: string; sentence: string }[] {
  const areas = [...PRIORITY_SERVICE_AREAS];
  if (locale === "ar") {
    const names: Record<string, string> = {
      Cheras: "شيراس",
      Ampang: "أمبانغ",
      "Taman Melawati": "تامان ملاواتي",
      Serdang: "سردانغ",
      "Sri Kembangan": "سري كمبانغان",
      Cyberjaya: "سيبرجايا",
      Putrajaya: "بوتراجايا",
    };
    return areas.map((area) => ({
      area,
      sentence: `نقدم الأضاحي والعقيقة ولحم الضاني والماعز إلى ${names[area] ?? area} مع التوصيل أو التبرع نيابةً عنك.`,
    }));
  }
  if (locale === "ms") {
    return areas.map((area) => ({
      area,
      sentence: `Tempah Korban, Aqiqah atau daging kambing dan biri-biri untuk penghantaran ke ${area}. Kami melayan ${area} dan kawasan berhampiran.`,
    }));
  }
  if (locale === "zh") {
    const names: Record<string, string> = {
      Cheras: "蕉赖",
      Ampang: "安邦",
      "Taman Melawati": "塔曼美拉瓦蒂",
      Serdang: "沙登",
      "Sri Kembangan": "史里肯邦安",
      Cyberjaya: "赛城",
      Putrajaya: "布城",
    };
    return areas.map((area) => ({
      area,
      sentence: `我们为${names[area] ?? area}及周边提供古尔邦、阿奇卡以及羊肉/山羊肉预订与配送服务。`,
    }));
  }
  return areas.map((area) => ({
    area,
    sentence: `Order Qurban, Aqiqah, or fresh halal goat and sheep for delivery to ${area}. We serve ${area} and nearby with traceable, Shariah-compliant slaughter.`,
  }));
}
