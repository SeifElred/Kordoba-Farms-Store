import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { PRIORITY_SERVICE_AREAS, SEO_BASE_URL, SEO_GBP_URL, SEO_WHATSAPP_URL } from "@/lib/seo";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: {
    default: "Aqiqah & Qurban Malaysia | Goat & Sheep – Kordoba Farms",
    template: "%s | Kordoba Farms",
  },
  description:
    "Book Aqiqah and Qurban in Malaysia. Halal goat and sheep for Aqiqah, Qurban & personal meat. Delivery to Kuala Lumpur, Cheras, Ampang, Taman Melawati, Serdang, Sri Kembangan, Cyberjaya, Putrajaya. Traceable, Shariah-compliant.",
  keywords: [
    "aqiqah Malaysia",
    "qurban Malaysia",
    "korban Malaysia",
    "halal goat Malaysia",
    "halal sheep Malaysia",
    "book aqiqah",
    "book qurban",
    "Cheras",
    "Ampang",
    "Serdang",
    "Sri Kembangan",
    "Cyberjaya",
    "Putrajaya",
  ],
  openGraph: { type: "website", siteName: "Kordoba Farms" },
  twitter: { card: "summary_large_image" },
  metadataBase: new URL(SEO_BASE_URL),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerStore = headers();
  const locale = headerStore.get("x-locale") ?? "en";
  const dir = headerStore.get("x-dir") ?? (locale === "ar" ? "rtl" : "ltr");

  const sameAs = [SEO_GBP_URL].filter(Boolean);

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Kordoba Farms",
    alternateName: "KORDOBA AGROTECH SDN. BHD.",
    url: SEO_BASE_URL,
    description:
      "Kordoba Farms: Aqiqah and Qurban in Malaysia. Halal goat and sheep for Aqiqah, Qurban and personal meat. Delivery to Kuala Lumpur, Cheras, Ampang, Taman Melawati, Serdang, Sri Kembangan, Cyberjaya, Putrajaya.",
    areaServed: [
      { "@type": "Country", name: "Malaysia" },
      { "@type": "City", name: "Kuala Lumpur" },
      ...PRIORITY_SERVICE_AREAS.map((name) => ({ "@type": "City", name })),
    ],
    ...(sameAs.length ? { sameAs } : {}),
    ...(SEO_WHATSAPP_URL
      ? {
          contactPoint: [
            {
              "@type": "ContactPoint",
              contactType: "customer support",
              url: SEO_WHATSAPP_URL,
              availableLanguage: ["en", "ms", "ar", "zh"],
            },
          ],
        }
      : {}),
  };
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Kordoba Farms",
    url: SEO_BASE_URL,
    description: "Book Aqiqah and Qurban in Malaysia. Halal goat and sheep. Delivery to KL, Cheras, Ampang, Serdang, Sri Kembangan, Cyberjaya, Putrajaya.",
    inLanguage: ["en-MY", "ms-MY", "ar-MY", "zh-MY"],
  };
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "Kordoba Farms",
    parentOrganization: {
      "@type": "Organization",
      name: "KORDOBA AGROTECH SDN. BHD.",
    },
    url: SEO_BASE_URL,
    description: "Aqiqah and Qurban Malaysia. Goat and sheep for Aqiqah, Qurban and personal meat. Serving Cheras, Ampang, Taman Melawati, Serdang, Sri Kembangan, Cyberjaya, Putrajaya.",
    serviceArea: [
      { "@type": "AdministrativeArea", name: "Kuala Lumpur" },
      ...PRIORITY_SERVICE_AREAS.map((name) => ({
        "@type": "AdministrativeArea",
        name,
      })),
    ],
    areaServed: [
      { "@type": "Country", name: "Malaysia" },
      ...PRIORITY_SERVICE_AREAS.map((name) => ({ "@type": "City", name })),
    ],
    ...(sameAs.length ? { sameAs } : {}),
  };
  return (
    <html lang={locale} dir={dir} suppressHydrationWarning className="h-full" data-locale={locale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema),
          }}
        />
      </head>
      <body className="h-full min-h-[100dvh] min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        <div className="flex min-h-[100dvh] min-h-screen w-full max-w-[100vw] flex-col">
          {children}
        </div>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
