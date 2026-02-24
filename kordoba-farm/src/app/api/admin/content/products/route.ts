import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  label: z.string().min(1).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  imageUrl: z.string().optional(), // fallback; can be URL or /uploads/...
  imageUrlByLocale: z.record(z.string(), z.string()).optional(), // { en: "/uploads/...", ar: "/uploads/..." }
  sortOrder: z.number().int().optional(),
});

export async function GET() {
  const ok = await isAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const products = await prisma.product.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(products);
}

export async function PATCH(req: NextRequest) {
  const ok = await isAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = z.object({ productType: z.string().min(1), data: updateSchema }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const { productType, data } = parsed.data;
  const product = await prisma.product.update({
    where: { productType },
    data: {
      ...(data.label != null && { label: data.label }),
      ...(data.minPrice != null && { minPrice: data.minPrice }),
      ...(data.maxPrice != null && { maxPrice: data.maxPrice }),
      ...(data.imageUrl != null && { imageUrl: data.imageUrl }),
      ...(data.imageUrlByLocale !== undefined && { imageUrlByLocale: JSON.stringify(data.imageUrlByLocale) }),
      ...(data.sortOrder != null && { sortOrder: data.sortOrder }),
    },
  });
  return NextResponse.json(product);
}
