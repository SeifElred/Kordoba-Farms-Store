import { getTranslations, setRequestLocale } from "next-intl/server";
import { getActiveThemeData } from "@/lib/content";
import { PurposeGrid } from "@/components/home/PurposeGrid";
import { HomeFAQ } from "@/components/home/HomeFAQ";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, theme] = await Promise.all([
    getTranslations("purpose"),
    getActiveThemeData(),
  ]);
  const heroHeading = theme.heroHeading?.trim() || t("title");
  const heroSubtitle = theme.heroSubtitle?.trim() || t("subtitle");

  return (
    <div>
      <div className="hero-strip -mx-4 rounded-b-2xl px-4 pb-8 pt-6 sm:-mx-6 sm:px-6 sm:pb-10 sm:pt-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="animate-in text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {heroHeading}
          </h1>
          <p className="animate-in animate-in-delay-1 mt-3 text-base leading-relaxed text-white/90 sm:text-lg">
            {heroSubtitle}
          </p>
        </div>
      </div>
      <section className="mx-auto max-w-2xl pt-6 sm:pt-8">
        <PurposeGrid />
      </section>
      <HomeFAQ />
    </div>
  );
}
