import { NextResponse } from "next/server";
import { z } from "zod";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import {
  getCartLinePrice,
  getCartTotalMYR,
  type CartLineItemPayload,
} from "@/lib/cart-price";

const cartItemSchema = z.object({
  product: z.string().min(1),
  occasion: z.string().min(1),
  weightSelection: z.string(),
  specialCutId: z.string(),
  specialCutLabel: z.string(),
  slaughterDate: z.string(),
  distribution: z.string(),
  videoProof: z.boolean(),
  includeHead: z.boolean(),
  includeStomach: z.boolean(),
  includeIntestines: z.boolean(),
  note: z.string(),
  productLabel: z.string(),
});

const bodySchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().min(1).max(50),
  address: z.string().max(1000).optional(),
  country: z.string().max(10).optional(),
  locale: z.string().max(10).optional(),
  items: z.array(cartItemSchema).min(1).max(20),
});

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { name, email, phone, address, country, locale, items } =
      parsed.data;

    const totalMYR = getCartTotalMYR(items);
    if (totalMYR <= 0) {
      return NextResponse.json(
        { error: "Invalid cart: unable to compute total" },
        { status: 400 }
      );
    }

    const totalCents = Math.round(totalMYR * 100);
    const cartOrder = await prisma.cartOrder.create({
      data: {
        name,
        email,
        phone,
        address: address ?? null,
        country: country ?? "MY",
        locale: locale ?? "en",
        totalCents,
        paymentStatus: "pending",
        items: items as unknown as object,
      },
    });

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const baseLocale = locale && /^[a-z]{2}$/.test(locale) ? locale : "en";

    if (stripeKey) {
      const stripe = new Stripe(stripeKey, {
        apiVersion: "2026-01-28.clover",
      });
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
        items.map((item: CartLineItemPayload) => {
          const priceMYR = getCartLinePrice(item);
          return {
            price_data: {
              currency: "myr",
              product_data: {
                name: item.productLabel,
                description: [
                  item.slaughterDate && `Slaughter: ${item.slaughterDate}`,
                  item.specialCutLabel && `Cut: ${item.specialCutLabel}`,
                ]
                  .filter(Boolean)
                  .join(" · ") || "Halal order",
              },
              unit_amount: Math.round(priceMYR * 100),
            },
            quantity: 1,
          };
        });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card", "fpx"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${appUrl}/${baseLocale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/${baseLocale}/checkout`,
        client_reference_id: cartOrder.id,
        metadata: { cartOrderId: cartOrder.id },
        customer_email: email,
      });

      return NextResponse.json({
        url: session.url,
        orderId: cartOrder.id,
      });
    }

    return NextResponse.json({
      orderId: cartOrder.id,
      message:
        "Order created. Set STRIPE_SECRET_KEY and NEXT_PUBLIC_APP_URL for online payment.",
    });
  } catch (e) {
    console.error("Cart checkout error:", e);
    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}
