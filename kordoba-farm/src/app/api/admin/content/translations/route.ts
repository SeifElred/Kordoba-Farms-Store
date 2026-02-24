import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const locales = ["en", "ar", "ms", "zh"] as const;

export async function GET(req: NextRequest) {
  const ok = await isAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get("locale") ?? "en";
  if (!locales.includes(locale as (typeof locales)[number])) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }
  const q = searchParams.get("q") ?? "";
  const translations = await prisma.translation.findMany({
    where: {
      locale,
      ...(q && { key: { contains: q } }),
    },
    orderBy: { key: "asc" },
  });
  return NextResponse.json(translations);
}

const upsertSchema = z.object({
  locale: z.enum(locales),
  key: z.string().min(1),
  value: z.string(),
});

export async function PATCH(req: NextRequest) {
  const ok = await isAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = upsertSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const { locale, key, value } = parsed.data;
  const row = await prisma.translation.upsert({
    where: { locale_key: { locale, key } },
    create: { locale, key, value },
    update: { value },
  });
  return NextResponse.json(row);
}
