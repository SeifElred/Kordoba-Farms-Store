import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import type { CartOrderDetail, SingleOrderDetail } from "@/types/admin-orders";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ok = await isAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const cart = await prisma.cartOrder.findUnique({
    where: { id },
  });
  if (cart) {
    const out: CartOrderDetail = {
      type: "cart",
      id: cart.id,
      name: cart.name,
      email: cart.email,
      phone: cart.phone,
      address: cart.address,
      country: cart.country,
      locale: cart.locale,
      totalCents: cart.totalCents,
      paymentStatus: cart.paymentStatus,
      stripeSessionId: cart.stripeSessionId,
      stripePaymentId: cart.stripePaymentId,
      items: cart.items,
      createdAt: cart.createdAt.toISOString(),
      updatedAt: cart.updatedAt.toISOString(),
    };
    return NextResponse.json(out as CartOrderDetail);
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true, country: true } },
      animal: { select: { tagNumber: true, productType: true, weight: true, status: true } },
    },
  });
  if (order) {
    const out: SingleOrderDetail = {
      type: "single",
      id: order.id,
      userId: order.userId,
      animalId: order.animalId,
      purpose: order.purpose,
      city: order.city,
      slaughterDate: order.slaughterDate.toISOString(),
      distributionType: order.distributionType,
      totalPrice: order.totalPrice,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      certificateUrl: order.certificateUrl,
      videoProofUrl: order.videoProofUrl,
      nameTag: order.nameTag,
      videoProofOpt: order.videoProofOpt,
      weightSelection: order.weightSelection,
      specialCut: order.specialCut,
      includeHead: order.includeHead,
      includeStomach: order.includeStomach,
      includeIntestines: order.includeIntestines,
      note: order.note,
      stripePaymentId: order.stripePaymentId,
      createdAt: order.createdAt.toISOString(),
      user: order.user,
      animal: order.animal ?? undefined,
    };
    return NextResponse.json(out as SingleOrderDetail);
  }

  return NextResponse.json({ error: "Order not found" }, { status: 404 });
}

const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;
const ORDER_STATUSES = ["reserved", "scheduled", "slaughtered", "processing", "completed"] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ok = await isAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  let body: { paymentStatus?: string; orderStatus?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const cart = await prisma.cartOrder.findUnique({ where: { id } });
  if (cart) {
    const paymentStatus = body.paymentStatus?.trim();
    if (!paymentStatus || !PAYMENT_STATUSES.includes(paymentStatus as (typeof PAYMENT_STATUSES)[number])) {
      return NextResponse.json({ error: "Invalid paymentStatus for cart order" }, { status: 400 });
    }
    await prisma.cartOrder.update({
      where: { id },
      data: { paymentStatus },
    });
    return NextResponse.json({ ok: true, type: "cart", paymentStatus });
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (order) {
    const updates: { paymentStatus?: string; orderStatus?: string } = {};
    const paymentStatus = body.paymentStatus?.trim();
    const orderStatus = body.orderStatus?.trim();
    if (paymentStatus && PAYMENT_STATUSES.includes(paymentStatus as (typeof PAYMENT_STATUSES)[number])) {
      updates.paymentStatus = paymentStatus;
    }
    if (orderStatus && ORDER_STATUSES.includes(orderStatus as (typeof ORDER_STATUSES)[number])) {
      updates.orderStatus = orderStatus;
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Provide paymentStatus and/or orderStatus" }, { status: 400 });
    }
    await prisma.order.update({
      where: { id },
      data: updates,
    });
    return NextResponse.json({ ok: true, type: "single", ...updates });
  }

  return NextResponse.json({ error: "Order not found" }, { status: 404 });
}
