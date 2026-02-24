import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
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

  return <AnimalDetailClient animal={animal} locale={locale} occasion={occasion} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; tag: string }>;
}) {
  const { tag } = await params;
  const animal = await prisma.animal.findUnique({
    where: { tagNumber: decodeURIComponent(tag) },
  });
  if (!animal) return { title: "Animal" };
  return {
    title: `${animal.breed} · ${animal.tagNumber} · ${animal.weight}kg`,
    description: `Premium ${animal.breed} for Qurban & Aqiqah. Tag ${animal.tagNumber}. ${animal.weight} kg.`,
  };
}
