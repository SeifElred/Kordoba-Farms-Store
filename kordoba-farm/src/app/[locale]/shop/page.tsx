import { redirect } from "next/navigation";

/** Shop is no longer used: only 4 product types, no per-animal selection. Redirect to choose product. */
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
