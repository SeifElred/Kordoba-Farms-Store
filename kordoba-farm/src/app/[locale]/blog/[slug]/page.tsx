import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { buildPageMetadata, getCoreSeoKeywords, getLocalizedUrl, SEO_BASE_URL } from "@/lib/seo";
import { getBlogPost, getPostContent } from "@/lib/blog";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const { BLOG_SLUGS } = await import("@/lib/blog");
  const locales = ["ar", "en", "ms", "zh"] as const;
  return locales.flatMap((locale) =>
    BLOG_SLUGS.map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Blog" };
  const c = getPostContent(post, locale);
  return buildPageMetadata({
    locale,
    pathname: `/blog/${slug}`,
    title: c.title,
    description: c.description,
    keywords: getCoreSeoKeywords(locale),
  });
}

function BlogBody({ blocks }: { blocks: { type: string; text?: string; items?: string[] }[] }) {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert prose-p:text-[var(--muted-foreground)] prose-headings:text-[var(--foreground)] prose-li:text-[var(--muted-foreground)]">
      {blocks.map((block, i) => {
        if (block.type === "h2") {
          return (
            <h2 key={i} className="mt-8 text-xl font-semibold text-[var(--foreground)] first:mt-0 sm:mt-10 sm:text-2xl">
              {block.text}
            </h2>
          );
        }
        if (block.type === "h3") {
          return (
            <h3 key={i} className="mt-5 text-lg font-semibold text-[var(--foreground)] sm:mt-6">
              {block.text}
            </h3>
          );
        }
        if (block.type === "p") {
          return (
            <p key={i} className="mt-2 leading-relaxed text-[var(--muted-foreground)] sm:mt-3">
              {block.text}
            </p>
          );
        }
        if (block.type === "ul" && block.items) {
          return (
            <ul key={i} className="mt-2 list-inside list-disc space-y-1 text-[var(--muted-foreground)] sm:mt-3">
              {block.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          );
        }
        return null;
      })}
    </div>
  );
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!routing.locales.includes(locale as "ar" | "en" | "ms" | "zh")) notFound();
  setRequestLocale(locale);

  const post = getBlogPost(slug);
  if (!post) notFound();

  const c = getPostContent(post, locale);
  const postUrl = getLocalizedUrl(locale, `/blog/${slug}`);
  const blogUrl = getLocalizedUrl(locale, "/blog");
  const homeUrl = SEO_BASE_URL;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: c.title,
    description: c.description,
    url: postUrl,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Organization", name: "Kordoba Farms", url: SEO_BASE_URL },
    publisher: { "@type": "Organization", name: "Kordoba Farms", logo: { "@type": "ImageObject", url: `${SEO_BASE_URL}/icon.png` } },
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: homeUrl },
      { "@type": "ListItem", position: 2, name: locale === "ar" ? "المدونة" : locale === "ms" ? "Blog" : locale === "zh" ? "博客" : "Blog", item: blogUrl },
      { "@type": "ListItem", position: 3, name: c.title, item: postUrl },
    ],
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-[var(--muted-foreground)]">
        <Link href={`/${locale}/blog`} className="hover:text-[var(--foreground)] hover:underline">
          {locale === "ar" ? "المدونة" : locale === "ms" ? "Blog" : locale === "zh" ? "博客" : "Blog"}
        </Link>
        <span className="mx-2" aria-hidden>/</span>
        <span className="font-medium text-[var(--foreground)]">{c.title}</span>
      </nav>
      <article>
        <time dateTime={post.date} className="text-xs text-[var(--muted-foreground)]">
          {post.date}
        </time>
        <h1 className="mt-1 text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
          {c.title}
        </h1>
        <div className="mt-6 sm:mt-8">
          <BlogBody blocks={c.body} />
        </div>
      </article>
      <div className="mt-10 border-t border-[var(--border)] pt-6">
        <Link
          href={`/${locale}/blog`}
          className="text-sm font-medium text-[var(--primary)] hover:underline"
        >
          {locale === "ar"
            ? "← العودة إلى المدونة"
            : locale === "ms"
              ? "← Kembali ke Blog"
              : locale === "zh"
                ? "← 返回博客"
                : "← Back to Blog"}
        </Link>
      </div>
    </div>
  );
}
