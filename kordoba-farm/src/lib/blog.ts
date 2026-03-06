/**
 * Blog: FAQ-focused posts in ar, en, ms, zh. Rich content, SEO-optimized.
 */

import { BLOG_POSTS } from "@/content/blog-posts";

export type BlogBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

export type BlogPostLocale = {
  title: string;
  description: string;
  excerpt: string;
  body: BlogBlock[];
};

export type BlogPost = {
  slug: string;
  date: string; // YYYY-MM-DD
  en: BlogPostLocale;
  ar: BlogPostLocale;
  ms: BlogPostLocale;
  zh: BlogPostLocale;
};

export const BLOG_SLUGS = [
  "how-to-book-aqiqah-malaysia",
  "how-to-book-qurban-korban-malaysia",
  "aqiqah-vs-qurban-difference",
  "when-to-do-aqiqah-timing",
  "goat-or-sheep-for-aqiqah-qurban",
  "conditions-of-aqiqah-and-qurban",
  "where-we-deliver-cheras-ampang-kl",
  "halal-slaughter-process-video-proof",
  "what-weight-goat-sheep-aqiqah-qurban",
  "about-kordoba-farms-our-story",
  "from-farm-to-table-traceability",
] as const;

export type BlogSlug = (typeof BLOG_SLUGS)[number];

const LOCALES = ["ar", "en", "ms", "zh"] as const;
export type BlogLocale = (typeof LOCALES)[number];

export function getBlogPost(slug: string): BlogPost | null {
  const posts = getAllBlogPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

export function getAllBlogPosts(): BlogPost[] {
  return BLOG_POSTS;
}

export function getPostContent(post: BlogPost, locale: string): BlogPostLocale {
  const safe = LOCALES.includes(locale as BlogLocale) ? locale : "en";
  return post[safe as BlogLocale];
}

export function isBlogSlug(slug: string): slug is BlogSlug {
  return (BLOG_SLUGS as readonly string[]).includes(slug);
}
