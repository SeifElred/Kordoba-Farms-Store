import { NextResponse } from "next/server";
import { z } from "zod";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import {
  getCartLinePrices,
  type CartLineItemPayload,
} from "@/lib/cart-price";

const checkoutEmailSchema = z.string().trim().email();

function isValidCheckoutPhone(phone: string) {
  const trimmed = phone.trim();
  if (!trimmed || !/^\+?[0-9\s\-()]+$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

const cartItemSchema = z.object({
  product: z.string().min(1),
  occasion: z.string().min(1),
  weightOptionId: z.string().uuid().optional(),
  weightSelection: z.string().optional(),
  weightLabel: z.string().optional(),
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
}).refine((d) => d.weightOptionId != null || (d.weightSelection != null && d.weightSelection !== ""), {
  message: "Either weightOptionId or weightSelection is required",
  path: ["weightOptionId"],
});

const bodySchema = z
  .object({
    channel: z.literal("whatsapp").optional(),
    name: z.string().max(200).optional(),
    email: z.string().max(500).optional(),
    phone: z.string().max(50).optional(),
    address: z.string().max(1000).optional(),
    country: z.string().max(10).optional(),
    locale: z.string().max(10).optional(),
    items: z.array(cartItemSchema).min(1).max(20),
  })
  .superRefine((data, ctx) => {
    const name = (data.name ?? "").trim();
    const email = (data.email ?? "").trim();
    const phone = (data.phone ?? "").trim();
    const address = (data.address ?? "").trim();

    if (data.channel !== "whatsapp") {
      if (name.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["name"],
          message: "Name is required",
        });
      }
      if (address.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["address"],
          message: "Address is required",
        });
      }
      if (email.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["email"],
          message: "Email is required",
        });
      } else if (!checkoutEmailSchema.safeParse(email).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["email"],
          message: "Please enter a valid email address",
        });
      }
      if (phone.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["phone"],
          message: "Phone is required",
        });
      } else if (!isValidCheckoutPhone(phone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["phone"],
          message: "Please enter a valid phone number",
        });
      }
      return;
    }

    if (email.length > 0 && !checkoutEmailSchema.safeParse(email).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["email"],
        message: "Please enter a valid email address",
      });
    }
    if (phone.length > 0 && !isValidCheckoutPhone(phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message: "Please enter a valid phone number",
      });
    }
  });

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const errorMessage =
        fieldErrors.email?.[0] ??
        fieldErrors.phone?.[0] ??
        fieldErrors.name?.[0] ??
        fieldErrors.address?.[0] ??
        parsed.error.issues[0]?.message ??
        "Invalid input";
      return NextResponse.json(
        { error: errorMessage, details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { channel, name, email, phone, address, country, locale, items } =
      parsed.data;

    const linePrices = await getCartLinePrices(items, prisma);
    const totalMYR = linePrices.reduce((total, price) => total + price, 0);
    if (totalMYR <= 0) {
      return NextResponse.json(
        { error: "Invalid cart: unable to compute total" },
        { status: 400 }
      );
    }

    const isWhatsApp = channel === "whatsapp";
    const nameVal =
      (isWhatsApp ? (name?.trim() || "WhatsApp order (pending details)") : name!) as string;
    const emailVal = (
      isWhatsApp
        ? (email?.trim() && email !== "" ? email : "whatsapp-pending@kordoba.farm")
        : email!
    ) as string;
    const phoneVal = (isWhatsApp ? (phone?.trim() || "—") : phone!) as string;
    const addressVal = isWhatsApp
      ? (address?.trim() || "To be confirmed via WhatsApp")
      : (address ?? null);

    const totalCents = Math.round(totalMYR * 100);
    const cartOrder = await prisma.cartOrder.create({
      data: {
        name: nameVal,
        email: emailVal,
        phone: phoneVal,
        address: addressVal,
        country: country ?? "MY",
        locale: locale ?? "en",
        totalCents,
        paymentStatus: "pending",
        items: items as unknown as object,
      },
    });

    if (isWhatsApp) {
      return NextResponse.json({ orderId: cartOrder.id });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const baseLocale = locale && /^[a-z]{2}$/.test(locale) ? locale : "en";

    if (stripeKey) {
      const stripe = new Stripe(stripeKey, {
        timeout: 15000,
      });
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
      const cartItems = items as CartLineItemPayload[];
      for (let index = 0; index < cartItems.length; index += 1) {
        const item = cartItems[index];
        const priceMYR = linePrices[index] ?? 0;
        lineItems.push({
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
        });
      }

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
    const message =
      e instanceof Error && e.message?.includes("timeout")
        ? "Payment request timed out. Please try again or order via WhatsApp."
        : "Checkout failed. Please try again or order via WhatsApp.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
