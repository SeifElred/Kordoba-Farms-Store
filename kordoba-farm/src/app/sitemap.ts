import { MetadataRoute } from "next";
import { SEO_LOCALES, getAlternates, getLocalizedUrl } from "@/lib/seo";
import { BLOG_SLUGS } from "@/lib/blog";

const SITEMAP_REVALIDATE_SECONDS = 60 * 60;

export const dynamic = "force-dynamic";
export const revalidate = SITEMAP_REVALIDATE_SECONDS;

const STATIC_PATHS = ["", "/about", "/faq", "/order", "/corporate", "/live-farm", "/blog"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];
  for (const path of STATIC_PATHS) {
    const changeFrequency =
      path === "" || path === "/order"
        ? "daily"
        : path === "/faq" || path === "/live-farm" || path === "/blog"
          ? "weekly"
          : "monthly";
    const priority =
      path === ""
        ? 1
        : path === "/order"
          ? 0.95
          : path === "/faq" || path === "/blog"
            ? 0.8
            : 0.7;
    const alternates = getAlternates(path).languages as Record<string, string>;
    for (const locale of SEO_LOCALES) {
      entries.push({
        url: getLocalizedUrl(locale, path),
        lastModified: now,
        changeFrequency,
        priority,
        alternates: { languages: alternates },
      });
    }
  }

  // Blog posts
  for (const slug of BLOG_SLUGS) {
    const path = `/blog/${slug}`;
    const alternates = getAlternates(path).languages as Record<string, string>;
    for (const locale of SEO_LOCALES) {
      entries.push({
        url: getLocalizedUrl(locale, path),
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
        alternates: { languages: alternates },
      });
    }
  }

  return entries;
}
