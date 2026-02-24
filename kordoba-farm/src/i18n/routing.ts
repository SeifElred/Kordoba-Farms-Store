import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ar", "en", "ms", "zh"],
  defaultLocale: "en",
  localePrefix: "always",
  pathnames: {
    "/": "/",
    "/choose-product": "/choose-product",
    "/order-details": "/order-details",
    "/cart": "/cart",
    "/shop": "/shop",
    "/animal/[tag]": "/animal/[tag]",
    "/checkout": "/checkout",
    "/dashboard": "/dashboard",
    "/live-farm": "/live-farm",
    "/corporate": "/corporate",
    "/admin": "/admin",
  },
});
