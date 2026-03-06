import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  getProductsMap,
  getProductWeightsByProduct,
  getSpecialCuts,
  getSiteSettings,
} from "@/lib/content";
import { buildPageMetadata, getCoreSeoKeywords, SEO_BASE_URL } from "@/lib/seo";
import { getProductLabel } from "@/lib/utils";
import { OrderWizard } from "@/components/order/OrderWizard";
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
      pathname: "/order",
      title: "إتمام الطلب – أضحية، عقيقة أو لحم ضاني",
      description:
        "اختر المناسبة والوزن وطريقة التقطيع وتاريخ الذبح لإتمام طلب الأضحية أو العقيقة أو اللحم في ماليزيا وكوالالمبور مع خدمة إلى شيراس وأمبانغ وتامان ملاواتي وسردانغ وسري كمبانغان وسيبرجايا وبوتراجايا.",
      keywords: getCoreSeoKeywords(locale),
    });
  }
  if (locale === "ms") {
    return buildPageMetadata({
      locale,
      pathname: "/order",
      title: "Tempah Korban atau Aqiqah – Pesanan kambing & biri-biri",
      description:
        "Pilih kambing atau biri-biri, berat, potongan dan tarikh sembelihan. Kami hantar Korban dan Aqiqah ke KL, Cheras, Ampang, Taman Melawati, Serdang, Sri Kembangan, Cyberjaya, Putrajaya. Halal, boleh kesan.",
      keywords: getCoreSeoKeywords(locale),
    });
  }
  if (locale === "zh") {
    return buildPageMetadata({
      locale,
      pathname: "/order",
      title: "提交订单 – 古尔邦、阿奇卡或自用羊肉",
      description:
        "选择场合、重量区间、切割方式和屠宰日期，完成您在马来西亚、吉隆坡及蕉赖、安邦、塔曼美拉瓦蒂、沙登、史里肯邦安、赛城和布城的古尔邦、阿奇卡或家庭自用清真羊肉订单。",
      keywords: getCoreSeoKeywords(locale),
    });
  }
  return buildPageMetadata({
    locale,
    pathname: "/order",
    title: "Book Qurban or Aqiqah – Goat & Sheep order",
    description:
      "Choose goat or sheep, weight, cut style and slaughter date. We deliver Qurban and Aqiqah to Kuala Lumpur, Cheras, Ampang, Taman Melawati, Serdang, Sri Kembangan, Cyberjaya, Putrajaya. Halal, traceable.",
    keywords: getCoreSeoKeywords(locale),
  });
}

// All four products: half only for personal; whole for qurban, aqiqah, personal.
const PRODUCT_TYPES = ["half_sheep", "half_goat", "whole_sheep", "whole_goat"] as const;

const DEFAULT_SHEEP_IMAGE =
  "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&q=80";
const DEFAULT_GOAT_IMAGE =
  "https://images.unsplash.com/photo-1578645510387-c3e02018f305?w=800&q=80";

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ step?: string; occasion?: string; edit?: string; product?: string }>;
}) {
  const { locale } = await params;
  const { step, occasion, edit, product: productParam } = await searchParams;
  setRequestLocale(locale);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SEO_BASE_URL}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Order",
        item: `${SEO_BASE_URL}/${locale}/order`,
      },
    ],
  };

  const [specialCuts, productsMap, weightsByProduct, siteSettings] = await Promise.all([
    getSpecialCuts(locale),
    getProductsMap(locale, occasion),
    getProductWeightsByProduct([...PRODUCT_TYPES], occasion),
    getSiteSettings([
      "delivery_transport_note",
      "animal_image_sheep",
      "animal_image_goat",
    ]),
  ]);

  const productConfigs: Record<string, { label: string; minPrice: number; maxPrice: number; imageUrl: string }> = {};
  const weightOptionsByProduct: Record<string, { id: string; bandId?: string | null; label: string; price: number; sortOrder: number; occasionScope?: string | null }[]> = {};
  PRODUCT_TYPES.forEach((pt) => {
    const config = productsMap[pt] ?? null;
    if (config) {
      const localizedLabel = locale === "ar" ? getProductLabel(pt) : config.label;
      productConfigs[pt] = { ...config, label: localizedLabel };
    }
    const weights = weightsByProduct[pt] ?? [];
    weightOptionsByProduct[pt] = Array.isArray(weights) ? weights : [];
  });

  return (
    <div className="min-h-[60vh]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <OrderWizard
        locale={locale}
        initialStep={step ? parseInt(step, 10) : undefined}
        initialOccasion={occasion ?? undefined}
        initialProduct={productParam ?? undefined}
        editItemId={edit ?? undefined}
        specialCuts={specialCuts}
        productConfigs={productConfigs}
        weightOptionsByProduct={weightOptionsByProduct}
        animalImages={{
          sheep: (siteSettings.animal_image_sheep ?? "").trim() || DEFAULT_SHEEP_IMAGE,
          goat: (siteSettings.animal_image_goat ?? "").trim() || DEFAULT_GOAT_IMAGE,
        }}
        deliveryTransportNote={siteSettings.delivery_transport_note ?? undefined}
      />
      <HowItWorks locale={locale} />
    </div>
  );
}
