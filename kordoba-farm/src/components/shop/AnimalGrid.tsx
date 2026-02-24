import { prisma } from "@/lib/prisma";
import { AnimalCard } from "./AnimalCard";

type SearchParams = {
  purpose?: string;
  product?: string;
  occasion?: string;
  breed?: string;
  min?: string;
  max?: string;
  gender?: string;
  ready?: string;
};

export async function AnimalGrid({
  searchParams,
  locale,
}: {
  searchParams: SearchParams;
  locale: string;
}) {
  const where: {
    status: string;
    productType?: string;
    breed?: { contains: string };
    gender?: string;
    weight?: { gte?: number; lte?: number };
  } = { status: "available" };
  if (searchParams.product) where.productType = searchParams.product;
  if (searchParams.breed) where.breed = { contains: searchParams.breed };
  if (searchParams.gender) where.gender = searchParams.gender.toLowerCase();
  if (searchParams.min || searchParams.max) {
    where.weight = {};
    if (searchParams.min) where.weight.gte = parseFloat(searchParams.min);
    if (searchParams.max) where.weight.lte = parseFloat(searchParams.max);
  }

  let animals: Awaited<ReturnType<typeof prisma.animal.findMany>> = [];
  try {
    animals = await prisma.animal.findMany({
      where,
      orderBy: { readyDate: "asc" },
      take: 50,
    });
  } catch {
    // DB not connected or empty
  }

  if (animals.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-12 text-center text-[var(--muted-foreground)]">
        No animals match your filters. Try adjusting the filters.
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {animals.map((animal) => (
        <AnimalCard key={animal.id} animal={animal} locale={locale} occasion={searchParams.occasion} />
      ))}
    </div>
  );
}
