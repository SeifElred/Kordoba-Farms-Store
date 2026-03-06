import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { buildPageMetadata, getCoreSeoKeywords, getLocalizedUrl, SEO_BASE_URL } from "@/lib/seo";
import { getAllBlogPosts } from "@/lib/blog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  const isMs = locale === "ms";
  const isZh = locale === "zh";
  return buildPageMetadata({
    locale,
    pathname: "/blog",
    title: isAr
      ? "المدونة – دليل العقيقة والأضحية في ماليزيا"
      : isMs
        ? "Blog – Panduan Aqiqah & Korban Malaysia"
        : isZh
          ? "博客 – 马来西亚阿奇卡与古尔邦指南"
          : "Blog – Aqiqah & Qurban Guides in Malaysia",
    description: isAr
      ? "مقالات وأسئلة شائعة عن العقيقة والأضحية: كيف تحجز، متى تقيم، أين نوصّل. كوالالمبور، شيراس، أمبانغ، سردانغ، بوتراجايا."
      : isMs
        ? "Artikel dan soalan lazim Aqiqah & Korban: cara tempah, bila buat, kawasan penghantaran. KL, Cheras, Ampang, Serdang, Putrajaya."
        : isZh
          ? "阿奇卡与古尔邦常见问题与指南：如何预订、何时进行、配送区域。吉隆坡、蕉赖、安邦、沙登、布城。"
          : "Guides and FAQs on Aqiqah and Qurban: how to book, when to do it, where we deliver. Kuala Lumpur, Cheras, Ampang, Serdang, Putrajaya.",
    keywords: getCoreSeoKeywords(locale),
  });
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "ar" | "en" | "ms" | "zh")) notFound();
  setRequestLocale(locale);

  const posts = getAllBlogPosts();
  const contentByLocale = (post: (typeof posts)[0]) => post[locale === "ar" ? "ar" : locale === "ms" ? "ms" : locale === "zh" ? "zh" : "en"];
  const blogUrl = getLocalizedUrl(locale, "/blog");
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SEO_BASE_URL },
      { "@type": "ListItem", position: 2, name: locale === "ar" ? "المدونة" : locale === "ms" ? "Blog" : locale === "zh" ? "博客" : "Blog", item: blogUrl },
    ],
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <h1 className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
        {locale === "ar"
          ? "المدونة"
          : locale === "ms"
            ? "Blog"
            : locale === "zh"
              ? "博客"
              : "Blog"}
      </h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)] sm:text-base">
        {locale === "ar"
          ? "إجابات وأدلة حول العقيقة والأضحية في ماليزيا."
          : locale === "ms"
            ? "Jawapan dan panduan tentang Aqiqah dan Korban di Malaysia."
            : locale === "zh"
              ? "马来西亚阿奇卡与古尔邦的解答与指南。"
              : "Answers and guides on Aqiqah and Qurban in Malaysia."}
      </p>
      <ul className="mt-8 space-y-6">
        {posts.map((post) => {
          const c = contentByLocale(post);
          return (
            <li key={post.slug}>
              <article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm sm:p-5">
                <time
                  dateTime={post.date}
                  className="text-xs text-[var(--muted-foreground)]"
                >
                  {post.date}
                </time>
                <h2 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
                  <Link
                    href={`/${locale}/blog/${post.slug}`}
                    className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 rounded-[var(--radius)]"
                  >
                    {c.title}
                  </Link>
                </h2>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  {c.excerpt}
                </p>
                <Link
                  href={`/${locale}/blog/${post.slug}`}
                  className="mt-3 inline-block text-sm font-medium text-[var(--primary)] hover:underline"
                >
                  {locale === "ar"
                    ? "اقرأ المزيد"
                    : locale === "ms"
                      ? "Baca lagi"
                      : locale === "zh"
                        ? "阅读更多"
                        : "Read more"}
                </Link>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
