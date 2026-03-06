import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { buildPageMetadata, getCoreSeoKeywords, SEO_BASE_URL } from "@/lib/seo";
import { AnimalDetailClient } from "@/components/animal/AnimalDetailClient";

export default async function AnimalPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; tag: string }>;
  searchParams: Promise<{ occasion?: string }>;
}) {
  const { locale, tag } = await params;
  const { occasion } = await searchParams;
  setRequestLocale(locale);

  const animal = await prisma.animal.findUnique({
    where: { tagNumber: decodeURIComponent(tag), status: "available" },
  });
  if (!animal) notFound();

  const url = `${SEO_BASE_URL}/${locale}/animal/${encodeURIComponent(animal.tagNumber)}`;
  const price = animal.weight * animal.pricePerKg;
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${animal.breed} ${animal.tagNumber}`,
    description: `${animal.breed} (${animal.gender}, ${animal.age} months) – ${animal.weight}kg. Available for Aqiqah, Qurban and personal meat in Malaysia and Kuala Lumpur.`,
    category: animal.productType,
    sku: animal.tagNumber,
    image: [animal.imageUrl].filter(Boolean),
    brand: { "@type": "Brand", name: "Kordoba Farms" },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "MYR",
      price: Number.isFinite(price) ? price.toFixed(2) : undefined,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <AnimalDetailClient animal={animal} locale={locale} occasion={occasion} />
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; tag: string }>;
}): Promise<Metadata> {
  const { locale, tag } = await params;
  const animal = await prisma.animal.findUnique({
    where: { tagNumber: decodeURIComponent(tag) },
  });
  if (!animal) {
    return buildPageMetadata({
      locale,
      pathname: `/animal/${encodeURIComponent(tag)}`,
      title: locale === "ar" ? "الحيوان" : locale === "ms" ? "Haiwan" : locale === "zh" ? "动物" : "Animal",
      description:
        locale === "ar"
          ? "عرض تفاصيل الحيوان المتاح."
          : locale === "ms"
            ? "Lihat butiran haiwan yang tersedia."
            : locale === "zh"
              ? "查看可选牲畜详情。"
              : "View the available animal details.",
      keywords: getCoreSeoKeywords(locale),
      robots: { index: false, follow: false },
    });
  }

  const breedLabel =
    locale === "ar"
      ? `${animal.breed} متاح للأضاحي والعقيقة`
      : locale === "ms"
        ? `${animal.breed} untuk Korban dan Aqiqah`
        : locale === "zh"
          ? `${animal.breed}，适用于古尔邦与阿奇卡`
          : `${animal.breed} for Qurban and Aqiqah`;

  return buildPageMetadata({
    locale,
    pathname: `/animal/${encodeURIComponent(tag)}`,
    title: `${animal.breed} · ${animal.tagNumber} · ${animal.weight}kg`,
    description:
      locale === "ar"
        ? `${breedLabel}. رقم ${animal.tagNumber}. الوزن ${animal.weight} كجم مع خدمة في ماليزيا وكوالالمبور.`
        : locale === "ms"
          ? `${breedLabel}. Tag ${animal.tagNumber}. Berat ${animal.weight} kg dengan perkhidmatan di Malaysia dan Kuala Lumpur.`
          : locale === "zh"
            ? `${breedLabel}。编号 ${animal.tagNumber}，重量 ${animal.weight} 公斤，服务覆盖马来西亚与吉隆坡。`
            : `${breedLabel}. Tag ${animal.tagNumber}. ${animal.weight} kg with service across Malaysia and Kuala Lumpur.`,
    keywords: getCoreSeoKeywords(locale),
    robots: { index: false, follow: false },
  });
}
