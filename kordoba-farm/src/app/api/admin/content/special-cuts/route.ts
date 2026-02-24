import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  label: z.string().min(1).optional(),
  imageUrl: z.string().optional(), // fallback; can be URL or /uploads/...
  imageUrlByLocale: z.record(z.string(), z.string()).optional(), // { en: "/uploads/...", ar: "/uploads/..." }
  videoUrl: z.string().url().optional().nullable(),
  sortOrder: z.number().int().optional(),
});

export async function GET() {
  const ok = await isAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const cuts = await prisma.specialCut.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(cuts);
}

export async function PATCH(req: NextRequest) {
  const ok = await isAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = z.object({ cutId: z.string().min(1), data: updateSchema }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const { cutId, data } = parsed.data;
  const cut = await prisma.specialCut.update({
    where: { cutId },
    data: {
      ...(data.label != null && { label: data.label }),
      ...(data.imageUrl != null && { imageUrl: data.imageUrl }),
      ...(data.imageUrlByLocale !== undefined && { imageUrlByLocale: JSON.stringify(data.imageUrlByLocale) }),
      ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl }),
      ...(data.sortOrder != null && { sortOrder: data.sortOrder }),
    },
  });
  return NextResponse.json(cut);
}
