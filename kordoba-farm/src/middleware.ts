import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
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

  // Pass locale to server so root layout can set <html lang dir> (request headers are visible in RSC; response headers are not)
  if (response.status >= 300 && response.status < 400) {
    return response;
  }
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", locale);
  requestHeaders.set("x-dir", dir);
  const next = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.forEach((value, key) => next.headers.set(key, value));
  return next;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|admin|.*\\..*).*)"],
};
