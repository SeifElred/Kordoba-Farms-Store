import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

/** Shop is no longer used: only 4 product types, no per-animal selection. Redirect to choose product. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    pathname: "/shop",
    title: "Shop",
    description: "Redirecting to order.",
    robots: { index: false, follow: false },
  });
}

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ occasion?: string }>;
}) {
  const { locale } = await params;
  const { occasion } = await searchParams;
  redirect(`/${locale}/order${occasion ? `?occasion=${occasion}` : ""}`);
}
