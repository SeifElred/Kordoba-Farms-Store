import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getProductConfig, getProductWeights, getSpecialCuts, getSiteSetting } from "@/lib/content";
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

// Half carcass products are temporarily disabled (only whole products are loaded).
const PRODUCT_TYPES = ["whole_sheep", "whole_goat"] as const;

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

  const [specialCuts, deliveryTransportNote, sheepImageSetting, goatImageSetting, ...rest] = await Promise.all([
    getSpecialCuts(),
    getSiteSetting("delivery_transport_note"),
    getSiteSetting("animal_image_sheep"),
    getSiteSetting("animal_image_goat"),
    ...PRODUCT_TYPES.map((pt) => getProductConfig(pt, locale, occasion)),
    ...PRODUCT_TYPES.map((pt) => getProductWeights(pt)),
  ]);

  const productConfigs: Record<string, { label: string; minPrice: number; maxPrice: number; imageUrl: string }> = {};
  const weightOptionsByProduct: Record<string, { id: string; label: string; price: number; sortOrder: number }[]> = {};
  const n = PRODUCT_TYPES.length;
  PRODUCT_TYPES.forEach((pt, i) => {
    const config = rest[i] as { label: string; minPrice: number; maxPrice: number; imageUrl: string } | null;
    if (config) productConfigs[pt] = config;
    const weights = rest[n + i] as { id: string; label: string; price: number; sortOrder: number }[];
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
          sheep: (sheepImageSetting ?? "").trim() || DEFAULT_SHEEP_IMAGE,
          goat: (goatImageSetting ?? "").trim() || DEFAULT_GOAT_IMAGE,
        }}
        deliveryTransportNote={deliveryTransportNote ?? undefined}
      />
      <HowItWorks locale={locale} />
    </div>
  );
}
