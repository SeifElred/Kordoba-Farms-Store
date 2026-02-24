import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  label: z.string().min(1),
  price: z.number().min(0),
  sortOrder: z.number().int().optional(),
});

export async function GET() {
  const ok = await isAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await prisma.weightOption.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const ok = await isAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const { label, price, sortOrder } = parsed.data;
  const count = await prisma.weightOption.count();
  const row = await prisma.weightOption.create({
    data: { label, price, sortOrder: sortOrder ?? count },
  });
  return NextResponse.json(row);
}
