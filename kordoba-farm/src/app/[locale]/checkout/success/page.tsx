import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default async function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "ar" | "en" | "ms" | "zh")) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("checkout");

  return (
    <div className="min-h-[60vh]">
      <div className="mx-auto max-w-xl px-4 py-12 sm:py-16">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm sm:p-10">
          <div className="flex justify-center">
            <CheckCircle2
              className="h-16 w-16 text-[var(--primary)]"
              aria-hidden
            />
          </div>
          <h1 className="mt-6 text-center text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
            {t("thankYou")}
          </h1>
          <p className="mt-3 text-center text-[var(--muted-foreground)]">
            {t("paymentSuccess")}
          </p>

          <section className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 p-5" aria-labelledby="what-next">
            <h2 id="what-next" className="text-lg font-semibold text-[var(--foreground)]">
              {t("whatHappensNext")}
            </h2>
            <ol className="mt-4 list-inside list-decimal space-y-2 text-sm text-[var(--muted-foreground)]">
              <li>{t("nextStep1")}</li>
              <li>{t("nextStep2")}</li>
              <li>{t("nextStep3")}</li>
            </ol>
          </section>

          <div className="mt-8 flex justify-center">
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-3 font-medium text-white transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              {t("backToHome")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
