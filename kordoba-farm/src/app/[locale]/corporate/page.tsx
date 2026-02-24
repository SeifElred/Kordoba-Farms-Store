import { setRequestLocale } from "next-intl/server";

export default async function CorporatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-2xl py-12 sm:py-16">
      <h1 className="text-3xl font-bold text-[var(--primary)]">
        Kordoba Agrotech Sdn. Bhd.
      </h1>
      <p className="mt-2 text-lg text-[var(--muted-foreground)]">
        Parent company of Kordoba Farms. Premium agrotech and livestock in Southeast Asia.
      </p>

      <section className="mt-12 space-y-10">
        <div>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Vision</h2>
          <p className="mt-2 text-[var(--muted-foreground)]">
            To be the most trusted name in halal livestock and Qurban & Aqiqah solutions across the region, combining tradition with technology.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Mission</h2>
          <p className="mt-2 text-[var(--muted-foreground)]">
            Deliver traceable, premium-quality livestock with seamless digital experience, veterinary oversight, and full Shariah compliance.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Infrastructure</h2>
          <p className="mt-2 text-[var(--muted-foreground)]">
            Modern farm facilities, cold chain, and distribution partnerships to ensure your order reaches you in perfect condition.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">International Experience</h2>
          <p className="mt-2 text-[var(--muted-foreground)]">
            Serving customers in Malaysia, Singapore, Brunei, and beyond. Corporate and institutional Qurban programs available.
          </p>
        </div>
      </section>
    </div>
  );
}
