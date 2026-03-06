import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  const firstSeg = request.nextUrl.pathname.split("/").filter(Boolean)[0];
  const locale = routing.locales.includes(firstSeg as "ar" | "en" | "ms" | "zh")
    ? firstSeg
    : routing.defaultLocale;
  const dir = locale === "ar" ? "rtl" : "ltr";

  response.headers.set("x-locale", locale);
  response.headers.set("x-dir", dir);
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|admin|.*\\..*).*)"],
};
