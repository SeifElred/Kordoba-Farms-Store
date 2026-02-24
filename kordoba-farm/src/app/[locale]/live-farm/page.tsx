import { setRequestLocale } from "next-intl/server";

export default async function LiveFarmPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-2xl py-12 sm:py-16">
      <h1 className="text-3xl font-bold text-[var(--primary)]">
        Live Farm Experience
      </h1>
      <p className="mt-2 text-lg text-[var(--muted-foreground)]">
        Transparency from farm to table. See how we raise your animal.
      </p>

      <section className="mt-12 grid gap-12 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Drone & Farm Tour</h2>
          <p className="mt-2 text-[var(--muted-foreground)]">
            Aerial and on-ground views of our facilities. Open pastures, clean housing, and full traceability.
          </p>
          <div className="mt-4 aspect-video rounded-lg bg-[var(--muted)]" />
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Biosecurity</h2>
          <p className="mt-2 text-[var(--muted-foreground)]">
            Controlled access, health checks, and quarantine protocols to keep our livestock and your family safe.
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Feeding Program</h2>
          <p className="mt-2 text-[var(--muted-foreground)]">
            Nutritionally balanced feed, clean water, and natural grazing where applicable.
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Veterinary Supervision</h2>
          <p className="mt-2 text-[var(--muted-foreground)]">
            Regular health monitoring and veterinary care. Health certificates for every animal.
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm md:col-span-2">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Halal Compliance</h2>
          <p className="mt-2 text-[var(--muted-foreground)]">
            Shariah-compliant slaughter, certification, and full chain of custody. We work with certified authorities for Qurban and Aqiqah.
          </p>
        </div>
      </section>
    </div>
  );
}
