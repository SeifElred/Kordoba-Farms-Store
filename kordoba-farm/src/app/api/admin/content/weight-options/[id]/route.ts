import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  label: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ok = await isAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;
  const row = await prisma.weightOption.update({
    where: { id },
    data: {
      ...(data.label != null && { label: data.label }),
      ...(data.price != null && { price: data.price }),
      ...(data.sortOrder != null && { sortOrder: data.sortOrder }),
    },
  });
  return NextResponse.json(row);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ok = await isAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.weightOption.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
