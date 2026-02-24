import { redirect } from "next/navigation";

/** Order details are now in the order wizard. Redirect to order. */
export default async function OrderDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ product?: string; occasion?: string }>;
}) {
  const { locale } = await params;
  const { occasion } = await searchParams;
  const qs = new URLSearchParams();
  if (occasion) qs.set("occasion", occasion);
  redirect(`/${locale}/order${qs.toString() ? `?${qs.toString()}` : ""}`);
}
