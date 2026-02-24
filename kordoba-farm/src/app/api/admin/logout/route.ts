import { NextRequest, NextResponse } from "next/server";
import { getCookieName } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/admin/login", req.url));
  res.cookies.set(getCookieName(), "", { maxAge: 0, path: "/" });
  return res;
}
