import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const putSchema = z.object({
  weightOptionIds: z.array(z.string().min(1)),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ productType: string }> }
) {
  const ok = await isAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { productType } = await params;
  const rows = await prisma.productWeight.findMany({
    where: { productType },
    include: { weightOption: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(
    rows.map((r) => ({
      id: r.weightOption.id,
      label: r.weightOption.label,
      price: r.weightOption.price,
      sortOrder: r.sortOrder,
    }))
  );
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ productType: string }> }
) {
  const ok = await isAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { productType } = await params;
  const body = await req.json();
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const { weightOptionIds } = parsed.data;
  await prisma.productWeight.deleteMany({ where: { productType } });
  if (weightOptionIds.length > 0) {
    await prisma.productWeight.createMany({
      data: weightOptionIds.map((weightOptionId, i) => ({
        productType,
        weightOptionId,
        sortOrder: i,
      })),
    });
  }
  const rows = await prisma.productWeight.findMany({
    where: { productType },
    include: { weightOption: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(
    rows.map((r) => ({
      id: r.weightOption.id,
      label: r.weightOption.label,
      price: r.weightOption.price,
      sortOrder: r.sortOrder,
    }))
  );
}
