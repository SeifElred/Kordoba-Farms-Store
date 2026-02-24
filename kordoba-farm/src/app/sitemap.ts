import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://kordobafarm.com";
const LOCALES = ["ar", "en", "ms", "zh"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths: MetadataRoute.Sitemap = [];
  for (const locale of LOCALES) {
    staticPaths.push({ url: `${BASE}/${locale}`, lastModified: new Date(), changeFrequency: "daily", priority: 1 });
    staticPaths.push({ url: `${BASE}/${locale}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 });
    staticPaths.push({ url: `${BASE}/${locale}/live-farm`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 });
    staticPaths.push({ url: `${BASE}/${locale}/corporate`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 });
  }

  let animals: { tagNumber: string; updatedAt: Date }[] = [];
  try {
    animals = await prisma.animal.findMany({
      where: { status: "available" },
      select: { tagNumber: true, updatedAt: true },
    });
  } catch {
    // DB not connected
  }

  const animalPaths: MetadataRoute.Sitemap = animals.flatMap((a) =>
    LOCALES.map((locale) => ({
      url: `${BASE}/${locale}/animal/${encodeURIComponent(a.tagNumber)}`,
      lastModified: a.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
  );

  return [...staticPaths, ...animalPaths];
}
