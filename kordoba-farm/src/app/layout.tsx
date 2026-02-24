import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Kordoba Farms | Premium Qurban & Aqiqah", template: "%s | Kordoba Farms" },
  description:
    "Premium halal livestock for Qurban, Aqiqah, and personal consumption. Traceable, certified, delivered. Malaysia & Southeast Asia.",
  openGraph: { type: "website" },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://kordobafarm.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const localeScript = `
    (function(){
      var seg = document.location.pathname.split('/').filter(Boolean);
      var locale = (seg[0] && ['ar','en','ms','zh'].indexOf(seg[0])>=0) ? seg[0] : 'en';
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.setAttribute('data-locale', locale);
    })();
  `;
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        <script dangerouslySetInnerHTML={{ __html: localeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Kordoba Farms",
              alternateName: "Kordoba Agrotech Sdn. Bhd.",
              url: process.env.NEXT_PUBLIC_APP_URL ?? "https://kordobafarm.com",
              description: "Premium halal livestock for Qurban, Aqiqah, and personal consumption. Malaysia & Southeast Asia.",
            }),
          }}
        />
      </head>
      <body className="h-full min-h-[100dvh] min-h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)] antialiased">
        <div className="flex h-full min-h-[100dvh] min-h-screen w-full max-w-[100vw] flex-col overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
