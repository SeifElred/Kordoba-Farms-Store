import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

/** Redirect to new order wizard. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    pathname: "/choose-product",
    title: "Choose product",
    description: "Redirecting to order.",
    robots: { index: false, follow: false },
  });
}

export default async function ChooseProductPage({
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
