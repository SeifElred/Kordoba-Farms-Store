import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildPageMetadata, getCoreSeoKeywords, getLocalizedAreaSentence } from "@/lib/seo";
import { HomeFAQ } from "@/components/home/HomeFAQ";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (locale === "ar") {
    return buildPageMetadata({
      locale,
      pathname: "/faq",
      title: "الأسئلة الشائعة – مزارع قرطبة",
      description:
        "إجابات على أهم الأسئلة حول حجز الأضاحي والعقائق، الوزن والقطع، التوصيل والتوزيع كصدقة في ماليزيا وكوالالمبور والمناطق التي نخدمها مثل شيراس وأمبانغ وسردانغ.",
      keywords: getCoreSeoKeywords(locale),
    });
  }
  if (locale === "ms") {
    return buildPageMetadata({
      locale,
      pathname: "/faq",
      title: "Soalan lazim Aqiqah & Korban – Tempah kambing biri-biri Malaysia",
      description:
        "Soalan lazim: Cara tempah Aqiqah dan Korban di Malaysia. Pilihan kambing dan biri-biri, penghantaran ke Cheras, Ampang, Serdang, Sri Kembangan, Cyberjaya, Putrajaya. Sembelihan halal, video bukti.",
      keywords: getCoreSeoKeywords(locale),
    });
  }
  if (locale === "zh") {
    return buildPageMetadata({
      locale,
      pathname: "/faq",
      title: "常见问题 – 科尔多巴农场",
      description:
        "解答关于古尔邦、阿奇卡预订、重量与切割选择、配送和慈善分发的常见问题，覆盖马来西亚、吉隆坡及蕉赖、安邦、沙登等周边服务区域。",
      keywords: getCoreSeoKeywords(locale),
    });
  }
  return buildPageMetadata({
    locale,
    pathname: "/faq",
    title: "Aqiqah & Qurban FAQ – Book goat & sheep Malaysia",
    description:
      "FAQ: How to book Aqiqah and Qurban in Malaysia. Goat and sheep options, delivery to Cheras, Ampang, Serdang, Sri Kembangan, Cyberjaya, Putrajaya. Halal slaughter, video proof, charity distribution.",
    keywords: getCoreSeoKeywords(locale),
  });
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("faq");
  const faqKeys = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9"] as const;
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqKeys.map((key) => ({
      "@type": "Question",
      name: t(key),
      acceptedAnswer: {
        "@type": "Answer",
        text: t(key.replace("q", "a") as "a1" | "a2" | "a3" | "a4" | "a5" | "a6" | "a7" | "a8" | "a9"),
      },
    })),
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <p className="mb-6 text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
        {getLocalizedAreaSentence(locale)}
      </p>
      <HomeFAQ />
    </div>
  );
}

