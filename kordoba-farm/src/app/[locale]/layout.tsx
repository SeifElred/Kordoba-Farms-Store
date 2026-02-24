import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getActiveThemeData, getSiteSetting } from "@/lib/content";
import { CartProvider } from "@/contexts/CartContext";
import { DirLangSync } from "@/components/DirLangSync";
import { LanguageOverlay } from "@/components/LanguageOverlay";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsappFloat } from "@/components/WhatsappFloat";
import { RamadanDecorations } from "@/components/RamadanDecorations";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "ar" | "en" | "ms" | "zh")) notFound();
  setRequestLocale(locale);
  const [messages, whatsappLink, themeData] = await Promise.all([
    getMessages(),
    getSiteSetting("whatsapp_link"),
    getActiveThemeData(),
  ]);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <NextIntlClientProvider messages={messages}>
        <DirLangSync />
        <LanguageOverlay />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <CartProvider>
            <div
              className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
              data-locale={locale}
              data-theme={themeData.themeId}
            >
              <RamadanDecorations themeId={themeData.themeId} />
              <Header bannerText={themeData.bannerText ?? undefined} />
              <main
                className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain touch-pan-y"
                style={{
                  paddingInlineStart: "max(1rem, var(--safe-left))",
                  paddingInlineEnd: "max(1rem, var(--safe-right))",
                  paddingBottom: "max(1rem, var(--safe-bottom))",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <div className="mx-auto w-full max-w-3xl min-w-0 px-4 pb-6 sm:px-6 sm:pb-8">
                  {children}
                </div>
              </main>
              <Footer />
            </div>
            <WhatsappFloat whatsappLink={whatsappLink ?? undefined} />
          </CartProvider>
        </div>
      </NextIntlClientProvider>
    </div>
  );
}
