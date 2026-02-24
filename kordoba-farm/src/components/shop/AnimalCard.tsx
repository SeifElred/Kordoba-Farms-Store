"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import type { Animal } from "@prisma/client";
import { formatPrice, getProductLabel } from "@/lib/utils";

const REMAINING_LOW = 3;

export function AnimalCard({
  animal,
  locale,
  occasion,
}: {
  animal: Animal;
  locale: string;
  occasion?: string;
}) {
  const t = useTranslations("shop");
  const total = animal.weight * animal.pricePerKg;
  const remaining = 5; // TODO: from Redis or DB when you have stock per animal
  const lowStock = remaining < REMAINING_LOW;
  const q = occasion ? `?occasion=${encodeURIComponent(occasion)}` : "";

  return (
    <article className="card-surface group overflow-hidden transition-colors hover:shadow-md">
      <Link href={`/${locale}/animal/${encodeURIComponent(animal.tagNumber)}${q}`} className="block">
        <div className="relative aspect-[4/3] bg-[var(--muted)]">
          <Image
            src={animal.imageUrl}
            alt={animal.tagNumber}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {lowStock && (
            <span className="absolute start-2 top-2 rounded bg-red-600 px-2 py-0.5 text-xs font-medium text-white">
              {t("lowStock", { count: remaining })}
            </span>
          )}
          <span className="absolute end-2 top-2 rounded bg-[var(--primary)] px-2 py-0.5 text-xs font-medium text-white">
            {animal.breed}
          </span>
        </div>
        <div className="p-4 bg-[var(--card)]">
          <p className="text-xs font-medium text-[var(--accent)]">
            {getProductLabel(animal.productType)}
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">
            Tag {animal.tagNumber} · {t("remaining", { count: remaining })}
          </p>
          <p className="mt-1 font-semibold text-[var(--foreground)]">
            {animal.weight} kg · {animal.gender}
          </p>
          <p className="mt-2 text-lg font-bold text-[var(--primary)]">
            {formatPrice(total)}
          </p>
          <span className="btn-primary mt-4 inline-flex w-full justify-center">
            {t("selectAnimal")}
          </span>
        </div>
      </Link>
    </article>
  );
}
