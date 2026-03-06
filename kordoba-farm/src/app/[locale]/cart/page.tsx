import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSiteSetting } from "@/lib/content";
import { routing } from "@/i18n/routing";
import { buildPageMetadata, SEO_BASE_URL } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CartPageClient } from "@/components/cart/CartPageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    pathname: "/cart",
    title:
      locale === "ar"
        ? "سلة الطلب"
        : locale === "ms"
          ? "Troli pesanan"
          : locale === "zh"
            ? "购物车"
            : "Order cart",
    description:
      locale === "ar"
        ? "راجع عناصر سلتك قبل الدفع."
        : locale === "ms"
          ? "Semak item troli anda sebelum pembayaran."
          : locale === "zh"
            ? "在付款前检查您的购物车商品。"
            : "Review your cart items before checkout.",
    robots: { index: false, follow: false },
  });
}

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "ar" | "en" | "ms" | "zh")) notFound();
  setRequestLocale(locale);
  const [t, tNav, whatsappLink] = await Promise.all([
    getTranslations("cart"),
    getTranslations("nav"),
    getSiteSetting("whatsapp_link"),
  ]);
  const breadcrumbItems = [
    { label: tNav("home"), href: "/" },
    { label: tNav("shop"), href: "/order" },
    { label: tNav("cart") },
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: tNav("home"),
        item: `${SEO_BASE_URL}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: tNav("shop"),
        item: `${SEO_BASE_URL}/${locale}/order`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: tNav("cart"),
        item: `${SEO_BASE_URL}/${locale}/cart`,
      },
    ],
  };

  return (
    <div className="min-h-[60vh]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="hero-strip -mx-4 mb-6 rounded-b-2xl px-4 pb-8 pt-6 sm:-mx-6 sm:mb-8 sm:px-6 sm:pb-10 sm:pt-8">
        <div className="mx-auto max-w-2xl">
          <Breadcrumbs items={breadcrumbItems} className="mb-4 text-white/80" />
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-2 text-sm text-white/90">{t("subtitle")}</p>
        </div>
      </div>
      <div className="mx-auto max-w-2xl">
        <Suspense fallback={<div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-sm">Loading...</div>}>
          <CartPageClient locale={locale} whatsappLink={whatsappLink ?? undefined} />
        </Suspense>
      </div>
    </div>
  );
}
