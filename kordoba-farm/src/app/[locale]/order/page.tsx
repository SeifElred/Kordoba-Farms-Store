import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  getProductsMap,
  getProductWeightsByProduct,
  getSpecialCuts,
  getSiteSettings,
} from "@/lib/content";
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
    return {
      title: "إتمام الطلب – أضحية، عقيقة أو لحم ضاني",
      description:
        "إختر المناسبة، الوزن، طريقة التقطيع، وتاريخ الذبح لإنهاء طلب الأضحية أو العقيقة أو لحم الضاني مع مزارع قرطبة.",
    };
  }
  if (locale === "ms") {
    return {
      title: "Buat pesanan – Korban, Aqiqah atau daging peribadi",
      description:
        "Pilih acara, julat berat, jenis potongan dan tarikh sembelihan untuk melengkapkan pesanan Korban, Aqiqah atau daging kambing peribadi anda.",
    };
  }
  if (locale === "zh") {
    return {
      title: "提交订单 – 古尔邦、阿奇卡或自用羊肉",
      description:
        "选择场合、重量区间、切割方式和屠宰日期，完成您的古尔邦、阿奇卡或家庭自用清真羊肉订单。",
    };
  }
  return {
    title: "Complete your order – Qurban, Aqiqah or personal lamb",
    description:
      "Choose occasion, weight band, cut style and slaughter date to complete your Qurban, Aqiqah or personal lamb order with Kordoba Farms.",
  };
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
