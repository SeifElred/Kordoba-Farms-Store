import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getActiveThemeData } from "@/lib/content";
import { PurposeGrid } from "@/components/home/PurposeGrid";
import { TrustBadges } from "@/components/home/TrustBadges";
import { HowItWorks } from "@/components/layout/HowItWorks";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (locale === "ar") {
    return {
      title: "مزارع قرطبة – أضاحي وعقائق ولحم ضاني أونلاين",
      description:
        "احجز الأضحية أو العقيقة أو لحم الضاني أونلاين مع مزارع قرطبة في ماليزيا. التزام كامل بالذبح الشرعي، فيديو إثبات، وتوصيل أو توزيع صدقة بالنيابة عنك.",
    };
  }
  if (locale === "ms") {
    return {
      title: "Kordoba Farms – Korban, Aqiqah & daging kambing premium",
      description:
        "Tempah Korban, Aqiqah dan daging kambing premium secara online di Malaysia. Sembelihan halal ikut syariah, pilihan video bukti dan penghantaran atau agihan derma.",
    };
  }
  if (locale === "zh") {
    return {
      title: "Kordoba Farms – 古尔邦、阿奇卡与家庭清真羊肉",
      description:
        "在线预订古尔邦、阿奇卡与家庭自用清真羊肉。遵循教法的清真屠宰，可选屠宰视频证明，支持送货上门或慈善分发。",
    };
  }
  return {
    title: "Kordoba Farms – Online Qurban, Aqiqah & lamb in Malaysia",
    description:
      "Order Qurban, Aqiqah and premium lamb online in Malaysia with Kordoba Farms. Fully Shariah-compliant slaughter, optional video proof, and home delivery or charity distribution.",
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, theme] = await Promise.all([
    getTranslations("purpose"),
    getActiveThemeData(),
  ]);
  const tFaq = await getTranslations("faq");
  const heroHeading = theme.heroHeading?.trim() || t("title");
  const heroSubtitle = theme.heroSubtitle?.trim() || t("subtitle");

  return (
    <div>
      <div className="hero-strip -mx-4 rounded-b-2xl px-4 pb-8 pt-6 sm:-mx-6 sm:px-6 sm:pb-10 sm:pt-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="animate-in text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {heroHeading}
          </h1>
          <p className="animate-in animate-in-delay-1 mt-3 text-base leading-relaxed text-white/90 sm:text-lg">
            {heroSubtitle}
          </p>
        </div>
      </div>
      <TrustBadges locale={locale} />
      <section className="mx-auto max-w-2xl pt-6 sm:pt-8 space-y-6">
        <PurposeGrid />
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-4 shadow-sm sm:px-5 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {tFaq("title")}
              </p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {locale === "ar"
                  ? "اطّلع على أهم الأسئلة الشائعة حول الطلب، الأضحية، العقيقة والتوصيل."
                  : locale === "ms"
                    ? "Lihat soalan lazim tentang pesanan, Korban, Aqiqah dan penghantaran."
                    : locale === "zh"
                      ? "查看关于下单、古尔邦、阿奇卡和配送的常见问题。"
                      : "See the most common questions about ordering, Qurban, Aqiqah and delivery."}
              </p>
            </div>
            <div className="sm:text-end">
              <a
                href={`/${locale}/faq`}
                className="inline-flex items-center justify-center rounded-lg border border-[var(--primary)]/40 px-3 py-1.5 text-xs font-medium text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors"
              >
                {locale === "ar"
                  ? "عرض الأسئلة الشائعة"
                  : locale === "ms"
                    ? "Lihat Soalan Lazim"
                    : locale === "zh"
                      ? "查看常见问题"
                      : "View FAQ"}
              </a>
            </div>
          </div>
        </div>
      </section>
      <HowItWorks locale={locale} />
    </div>
  );
}

