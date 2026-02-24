import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  country: z.string().min(1),
  language: z.string(),
  animalId: z.string().uuid(),
  tagNumber: z.string(),
  purpose: z.string(),
  city: z.string().optional(),
  slaughterDate: z.string(),
  distributionType: z.string(),
  nameTag: z.string().optional(),
  videoProof: z.boolean(),
  weightSelection: z.string().optional(),
  specialCut: z.string().optional(),
  includeHead: z.boolean().optional(),
  includeStomach: z.boolean().optional(),
  includeIntestines: z.boolean().optional(),
  note: z.string().optional(),
  totalPrice: z.number().positive(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const animal = await prisma.animal.findUnique({
      where: { id: data.animalId, status: "available" },
    });
    if (!animal) {
      return NextResponse.json({ error: "Animal no longer available" }, { status: 409 });
    }

    let user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          country: data.country,
          language: data.language,
        },
      });
    }

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        animalId: animal.id,
        purpose: data.purpose,
        city: data.city ?? undefined,
        slaughterDate: new Date(data.slaughterDate),
        distributionType: data.distributionType,
        totalPrice: data.totalPrice,
        paymentStatus: "pending",
        orderStatus: "reserved",
        nameTag: data.nameTag,
        videoProofOpt: data.videoProof,
        weightSelection: data.weightSelection ?? undefined,
        specialCut: data.specialCut ?? undefined,
        includeHead: data.includeHead ?? false,
        includeStomach: data.includeStomach ?? false,
        includeIntestines: data.includeIntestines ?? false,
        note: data.note ?? undefined,
      },
    });

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (stripeKey) {
      const stripe = new Stripe(stripeKey, { apiVersion: "2026-01-28.clover" });
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card", "fpx"],
        line_items: [
          {
            price_data: {
              currency: "myr",
              product_data: {
                name: `${animal.breed} · Tag ${animal.tagNumber}`,
                description: `Qurban / Aqiqah · ${animal.weight} kg · Slaughter: ${data.slaughterDate}`,
                images: animal.imageUrl ? [animal.imageUrl] : undefined,
              },
              unit_amount: Math.round(data.totalPrice * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/en/dashboard?order=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/en/checkout?animal=${encodeURIComponent(animal.tagNumber)}`,
        client_reference_id: order.id,
        metadata: { orderId: order.id },
      });
      return NextResponse.json({ url: session.url, orderId: order.id });
    }

    return NextResponse.json({
      orderId: order.id,
      message: "Order created. Configure Stripe for payment.",
    });
  } catch (e) {
    console.error("Checkout error:", e);
    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}
