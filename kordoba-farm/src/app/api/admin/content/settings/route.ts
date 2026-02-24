import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const ok = await isAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await prisma.siteSetting.findMany({ orderBy: { key: "asc" } });
  const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return NextResponse.json(settings);
}

const updateSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});

export async function PATCH(req: NextRequest) {
  const ok = await isAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const { key, value } = parsed.data;
  await prisma.siteSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
  return NextResponse.json({ ok: true });
}
