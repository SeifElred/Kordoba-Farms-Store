import { NextResponse } from "next/server";
import { setAdminCookie, getCookieName } from "@/lib/admin-auth";

export async function POST(req: Request) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 500 });
  }
  const body = await req.json();
  const given = body.password ?? "";
  if (given !== password) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  const token = await setAdminCookie();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(getCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  return res;
}
