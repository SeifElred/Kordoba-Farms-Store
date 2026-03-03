import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { HomeFAQ } from "@/components/home/HomeFAQ";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (locale === "ar") {
    return {
      title: "الأسئلة الشائعة – مزارع قرطبة",
      description:
        "إجابات على أهم الأسئلة حول حجز الأضاحي والعقائق، اختيار الوزن والقطع، التوصيل، والتوزيع كصدقة.",
    };
  }
  if (locale === "ms") {
    return {
      title: "Soalan lazim – Kordoba Farms",
      description:
        "Jawapan kepada soalan lazim tentang tempahan Korban dan Aqiqah, pilihan berat dan potongan, penghantaran dan agihan derma.",
    };
  }
  if (locale === "zh") {
    return {
      title: "常见问题 – 科尔多巴农场",
      description:
        "解答关于古尔邦、阿奇卡预订、重量与切割选择、配送和慈善分发的常见问题。",
    };
  }
  return {
    title: "FAQ – Kordoba Farms",
    description:
      "Answers to common questions about Qurban and Aqiqah bookings, weight and cut selection, delivery and charity distribution.",
  };
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <HomeFAQ />
    </div>
  );
}

