import { MetadataRoute } from "next";
import { SEO_LOCALES, getAlternates, getLocalizedUrl } from "@/lib/seo";

const SITEMAP_REVALIDATE_SECONDS = 60 * 60;

export const dynamic = "force-dynamic";
export const revalidate = SITEMAP_REVALIDATE_SECONDS;

const STATIC_PATHS = ["", "/about", "/faq", "/order", "/corporate", "/live-farm"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths: MetadataRoute.Sitemap = [];
  const now = new Date();
  for (const locale of SEO_LOCALES) {
    for (const path of STATIC_PATHS) {
      staticPaths.push({
        url: getLocalizedUrl(locale, path),
        lastModified: now,
        changeFrequency:
          path === "" || path === "/order"
            ? "daily"
            : path === "/faq" || path === "/live-farm"
              ? "weekly"
              : "monthly",
        priority:
          path === ""
            ? 1
            : path === "/order"
              ? 0.95
              : path === "/faq"
                ? 0.8
                : 0.7,
        alternates: { languages: getAlternates(path).languages as Record<string, string> },
      });
    }
  }

  return staticPaths;
}
