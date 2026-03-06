import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getActiveThemeData } from "@/lib/content";
import { buildPageMetadata, getCoreSeoKeywords, getLocalizedAreaSentence, getAreaKeywordSentences } from "@/lib/seo";
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
    return buildPageMetadata({
      locale,
      pathname: "",
      title: "عقيقة وأضاحي ماليزيا – خروف وماعز | مزارع قرطبة",
      description:
        "احجز العقيقة والأضاحي في ماليزيا. خروف وماعز حلال للعقيقة والأضحية ولحم شخصي. توصيل إلى كوالالمبور، شيراس، أمبانغ، تامان ملاواتي، سردانغ، سري كمبانغان، سيبرجايا، بوتراجايا. تتبع كامل وذبح شرعي.",
      keywords: getCoreSeoKeywords(locale),
    });
  }
  if (locale === "ms") {
    return buildPageMetadata({
      locale,
      pathname: "",
      title: "Tempah Aqiqah & Korban Malaysia – Kambing & Biri-biri | Kordoba Farms",
      description:
        "Tempah Aqiqah dan Korban di Malaysia. Kambing dan biri-biri halal untuk Aqiqah, Korban dan daging peribadi. Penghantaran ke KL, Cheras, Ampang, Taman Melawati, Serdang, Sri Kembangan, Cyberjaya, Putrajaya. Boleh kesan, sembelihan ikut syariah.",
      keywords: getCoreSeoKeywords(locale),
    });
  }
  if (locale === "zh") {
    return buildPageMetadata({
      locale,
      pathname: "",
      title: "马来西亚阿奇卡与古尔邦 | 羊与山羊 – 科尔多巴农场",
      description:
        "在马来西亚预订阿奇卡与古尔邦。清真羊与山羊供阿奇卡、古尔邦及家庭自用。配送到吉隆坡、蕉赖、安邦、塔曼美拉瓦蒂、沙登、史里肯邦安、赛城、布城。可追溯、符合教法屠宰。",
      keywords: getCoreSeoKeywords(locale),
    });
  }
  return buildPageMetadata({
    locale,
    pathname: "",
    title: "Aqiqah & Qurban Malaysia | Goat & Sheep – Kordoba Farms",
    description:
      "Book Aqiqah and Qurban in Malaysia. Halal goat and sheep for Aqiqah, Qurban and personal meat. Delivery to Kuala Lumpur, Cheras, Ampang, Taman Melawati, Serdang, Sri Kembangan, Cyberjaya, Putrajaya. Traceable, Shariah-compliant slaughter.",
    keywords: getCoreSeoKeywords(locale),
  });
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
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-4 shadow-sm sm:px-5">
          <h2 className="text-sm font-semibold text-[var(--foreground)] sm:text-base">
            {locale === "ar"
              ? "التغطية والخدمة في كوالالمبور وما حولها"
              : locale === "ms"
                ? "Liputan penghantaran di Kuala Lumpur & kawasan sekitar"
                : locale === "zh"
                  ? "吉隆坡及周边地区配送服务"
                  : "Delivery coverage in Kuala Lumpur and nearby areas"}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
            {getLocalizedAreaSentence(locale)}
          </p>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[var(--muted-foreground)]" aria-label={locale === "ar" ? "مناطق التوصيل" : locale === "ms" ? "Kawasan penghantaran" : locale === "zh" ? "配送区域" : "Delivery areas"}>
            {getAreaKeywordSentences(locale).map(({ area, sentence }) => (
              <li key={area}>
                <span className="font-medium text-[var(--foreground)]">{area}:</span> {sentence}
              </li>
            ))}
          </ul>
        </div>
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

