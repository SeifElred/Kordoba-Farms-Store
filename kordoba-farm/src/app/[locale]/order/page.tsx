import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProductConfig, getProductWeights, getSpecialCuts, getSiteSetting } from "@/lib/content";
import { OrderWizard } from "@/components/order/OrderWizard";

const PRODUCT_TYPES = ["half_sheep", "half_goat", "whole_sheep", "whole_goat"] as const;

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

  const [specialCuts, deliveryTransportNote, ...rest] = await Promise.all([
    getSpecialCuts(locale, occasion),
    getSiteSetting("delivery_transport_note"),
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

  const t = await getTranslations("nav");
  const breadcrumbItems = [
    { label: t("home"), href: "/" },
    { label: t("shop"), href: "/order" },
  ];

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
        deliveryTransportNote={deliveryTransportNote ?? undefined}
        breadcrumbItems={breadcrumbItems}
      />
    </div>
  );
}
