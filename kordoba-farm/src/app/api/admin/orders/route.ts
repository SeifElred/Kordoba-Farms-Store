import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import type { OrderListItem } from "@/types/admin-orders";

export const dynamic = "force-dynamic";

const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(23, 59, 59, 999);
  return x;
}

export async function GET(req: NextRequest) {
  const ok = await isAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // "cart" | "single" | null (all)
  const status = searchParams.get("status"); // payment status filter
  const q = searchParams.get("q")?.trim() ?? "";
  const dateFrom = searchParams.get("dateFrom")?.trim();
  const dateTo = searchParams.get("dateTo")?.trim();
  const sort = searchParams.get("sort") || "createdAt_desc";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize")) || 25));
  const sortOrder = sort === "createdAt_asc" ? ("asc" as const) : ("desc" as const);
  const orderBy = { createdAt: sortOrder };

  const buildCartWhere = (): Prisma.CartOrderWhereInput => {
    const where: Prisma.CartOrderWhereInput = {};
    if (status && PAYMENT_STATUSES.includes(status as (typeof PAYMENT_STATUSES)[number])) {
      where.paymentStatus = status;
    }
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = startOfDay(new Date(dateFrom));
      if (dateTo) where.createdAt.lte = endOfDay(new Date(dateTo));
    }
    if (q.length >= 2) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
      ];
    }
    return where;
  };

  const buildOrderWhere = (): Prisma.OrderWhereInput => {
    const where: Prisma.OrderWhereInput = {};
    if (status && PAYMENT_STATUSES.includes(status as (typeof PAYMENT_STATUSES)[number])) {
      where.paymentStatus = status;
    }
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = startOfDay(new Date(dateFrom));
      if (dateTo) where.createdAt.lte = endOfDay(new Date(dateTo));
    }
    if (q.length >= 2) {
      where.user = {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
        ],
      };
    }
    return where;
  };

  if (type === "cart") {
    const [totalCount, cartOrders] = await Promise.all([
      prisma.cartOrder.count({ where: buildCartWhere() }),
      prisma.cartOrder.findMany({
        where: buildCartWhere(),
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          country: true,
          locale: true,
          totalCents: true,
          paymentStatus: true,
          createdAt: true,
          items: true,
        },
      }),
    ]);
    const list: OrderListItem[] = cartOrders.map((o) => ({
      type: "cart",
      id: o.id,
      name: o.name,
      email: o.email,
      phone: o.phone,
      address: o.address,
      country: o.country,
      locale: o.locale,
      totalCents: o.totalCents,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt.toISOString(),
      itemCount: Array.isArray(o.items) ? (o.items as unknown[]).length : 0,
    }));
    return NextResponse.json({ orders: list, totalCount });
  }

  if (type === "single") {
    const [totalCount, singleOrders] = await Promise.all([
      prisma.order.count({ where: buildOrderWhere() }),
      prisma.order.findMany({
        where: buildOrderWhere(),
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { user: { select: { name: true, email: true, phone: true } } },
      }),
    ]);
    const list: OrderListItem[] = singleOrders.map((o) => ({
      type: "single",
      id: o.id,
      name: o.user.name,
      email: o.user.email,
      phone: o.user.phone,
      totalPrice: o.totalPrice,
      paymentStatus: o.paymentStatus,
      orderStatus: o.orderStatus,
      createdAt: o.createdAt.toISOString(),
      purpose: o.purpose,
    }));
    return NextResponse.json({ orders: list, totalCount });
  }

  // type === "all": merge both, sort, paginate in memory (cap total fetch)
  const maxFetch = 500;
  const [cartOrders, singleOrders, cartCount, singleCount] = await Promise.all([
    prisma.cartOrder.findMany({
      where: buildCartWhere(),
      orderBy,
      take: maxFetch,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        country: true,
        locale: true,
        totalCents: true,
        paymentStatus: true,
        createdAt: true,
        items: true,
      },
    }),
    prisma.order.findMany({
      where: buildOrderWhere(),
      orderBy,
      take: maxFetch,
      include: { user: { select: { name: true, email: true, phone: true } } },
    }),
    prisma.cartOrder.count({ where: buildCartWhere() }),
    prisma.order.count({ where: buildOrderWhere() }),
  ]);

  const cartList: OrderListItem[] = cartOrders.map((o) => ({
    type: "cart",
    id: o.id,
    name: o.name,
    email: o.email,
    phone: o.phone,
    address: o.address,
    country: o.country,
    locale: o.locale,
    totalCents: o.totalCents,
    paymentStatus: o.paymentStatus,
    createdAt: o.createdAt.toISOString(),
    itemCount: Array.isArray(o.items) ? (o.items as unknown[]).length : 0,
  }));
  const singleList: OrderListItem[] = singleOrders.map((o) => ({
    type: "single",
    id: o.id,
    name: o.user.name,
    email: o.user.email,
    phone: o.user.phone,
    totalPrice: o.totalPrice,
    paymentStatus: o.paymentStatus,
    orderStatus: o.orderStatus,
    createdAt: o.createdAt.toISOString(),
    purpose: o.purpose,
  }));

  const combined = [...cartList, ...singleList].sort(
    (a, b) =>
      sort === "createdAt_asc"
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const totalCount = cartCount + singleCount;
  const start = (page - 1) * pageSize;
  const orders = combined.slice(start, start + pageSize);

  return NextResponse.json({ orders, totalCount });
}
