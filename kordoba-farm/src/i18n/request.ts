import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { getMessagesForLocale } from "@/lib/content";

export const locales = ["ar", "en", "ms", "zh"] as const;
export type Locale = (typeof locales)[number];

/** Deep-merge DB overrides into file messages so we never have missing keys. */
function deepMergeMessages(
  base: Record<string, unknown>,
  overrides: Record<string, unknown> | null
): Record<string, unknown> {
  if (!overrides || Object.keys(overrides).length === 0) return base;
  const out = { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    const baseVal = base[key];
    if (
      value != null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      baseVal != null &&
      typeof baseVal === "object" &&
      !Array.isArray(baseVal)
    ) {
      (out as Record<string, unknown>)[key] = deepMergeMessages(
        baseVal as Record<string, unknown>,
        value as Record<string, unknown>
      );
    } else {
      (out as Record<string, unknown>)[key] = value;
    }
  }
  return out;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }
  const [fromDb, fileMessages] = await Promise.all([
    getMessagesForLocale(locale),
    import(`../messages/${locale}.json`).then((m) => m.default as Record<string, unknown>),
  ]);
  const messages = deepMergeMessages(fileMessages, fromDb);
  return {
    locale,
    messages,
    timeZone: "Asia/Kuala_Lumpur",
    now: new Date(),
  };
});
