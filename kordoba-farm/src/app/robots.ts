import { MetadataRoute } from "next";
import { SEO_BASE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api",
          "/ar/shop",
          "/en/shop",
          "/ms/shop",
          "/zh/shop",
          "/ar/choose-product",
          "/en/choose-product",
          "/ms/choose-product",
          "/zh/choose-product",
          "/ar/cart",
          "/en/cart",
          "/ms/cart",
          "/zh/cart",
          "/ar/checkout",
          "/en/checkout",
          "/ms/checkout",
          "/zh/checkout",
          "/ar/checkout/success",
          "/en/checkout/success",
          "/ms/checkout/success",
          "/zh/checkout/success",
          "/ar/dashboard",
          "/en/dashboard",
          "/ms/dashboard",
          "/zh/dashboard",
        ],
      },
    ],
    sitemap: `${SEO_BASE_URL}/sitemap.xml`,
    host: SEO_BASE_URL,
  };
}
