import { redirect } from "next/navigation";

/** Redirect to new order wizard. */
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
