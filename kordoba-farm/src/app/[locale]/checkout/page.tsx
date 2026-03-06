import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getSiteSetting } from "@/lib/content";
import { CheckoutPageClient } from "@/components/checkout/CheckoutPageClient";

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ intent?: string }>;
}) {
  const { locale } = await params;
  const { intent } = await searchParams;
  if (!routing.locales.includes(locale as "ar" | "en" | "ms" | "zh")) notFound();
  setRequestLocale(locale);

  const [t, tPurpose, whatsappLink] = await Promise.all([
    getTranslations("checkout"),
    getTranslations("purpose"),
    getSiteSetting("whatsapp_link"),
  ]);

  const purposeLabels: Record<string, string> = {
    qurban: tPurpose("qurban"),
    aqiqah: tPurpose("aqiqah"),
    personal: tPurpose("personal"),
  };

  return (
    <div className="min-h-[60vh]">
      <div className="hero-strip -mx-4 mb-6 rounded-b-2xl px-4 pb-8 pt-6 sm:-mx-6 sm:mb-8 sm:px-6 sm:pb-10 sm:pt-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-2 text-sm text-white/90">
            {t("securePayment")}
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Suspense
          fallback={
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-sm">
              Loading…
            </div>
          }
        >
          <CheckoutPageClient locale={locale} purposeLabels={purposeLabels} intentWhatsapp={intent === "whatsapp"} whatsappLink={whatsappLink ?? undefined} />
        </Suspense>
      </div>
    </div>
  );
}
