import { NextResponse } from "next/server";
import { SEO_LOCALES, getAlternates, getLocalizedUrl } from "@/lib/seo";
import { BLOG_SLUGS } from "@/lib/blog";

const STATIC_PATHS = ["", "/about", "/faq", "/order", "/corporate", "/live-farm", "/blog"] as const;

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const now = new Date().toISOString().slice(0, 19) + "Z";
  const urlset: string[] = [];

  for (const path of STATIC_PATHS) {
    const changeFrequency =
      path === "" || path === "/order"
        ? "daily"
        : path === "/faq" || path === "/live-farm" || path === "/blog"
          ? "weekly"
          : "monthly";
    const priority =
      path === ""
        ? "1"
        : path === "/order"
          ? "0.95"
          : path === "/faq" || path === "/blog"
            ? "0.8"
            : "0.7";
    const alternates = getAlternates(path).languages as Record<string, string>;
    for (const locale of SEO_LOCALES) {
      const loc = getLocalizedUrl(locale, path);
      const links = Object.entries(alternates)
        .map(
          ([hreflang, href]) =>
            `    <xhtml:link rel="alternate" hreflang="${escapeXml(hreflang)}" href="${escapeXml(href)}"/>`
        )
        .join("\n");
      urlset.push(
        `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>${changeFrequency}</changefreq>\n    <priority>${priority}</priority>\n${links}\n  </url>`
      );
    }
  }

  for (const slug of BLOG_SLUGS) {
    const path = `/blog/${slug}`;
    const alternates = getAlternates(path).languages as Record<string, string>;
    for (const locale of SEO_LOCALES) {
      const loc = getLocalizedUrl(locale, path);
      const links = Object.entries(alternates)
        .map(
          ([hreflang, href]) =>
            `    <xhtml:link rel="alternate" hreflang="${escapeXml(hreflang)}" href="${escapeXml(href)}"/>`
        )
        .join("\n");
      urlset.push(
        `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n${links}\n  </url>`
      );
    }
  }

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    urlset.join("\n") +
    "\n</urlset>";

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
