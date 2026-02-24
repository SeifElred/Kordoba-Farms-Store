import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSiteSetting } from "@/lib/content";
import { routing } from "@/i18n/routing";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CartPageClient } from "@/components/cart/CartPageClient";

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

  return (
    <div className="min-h-[60vh]">
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
