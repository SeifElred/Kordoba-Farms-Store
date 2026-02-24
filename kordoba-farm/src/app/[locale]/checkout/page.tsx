import { redirect } from "next/navigation";

/** Checkout is now done from cart via WhatsApp. Redirect to cart. */
export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/cart`);
}
