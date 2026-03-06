export default function CheckoutLoading() {
  return (
    <div className="min-h-[50vh]" role="status" aria-label="Loading checkout">
      <div className="mx-auto max-w-4xl animate-pulse space-y-8 px-4 sm:px-6">
        <div className="h-10 w-56 rounded-lg bg-[var(--muted)]" />
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-3">
            <div className="h-12 rounded-lg bg-[var(--muted)]" />
            <div className="h-12 rounded-lg bg-[var(--muted)]" />
            <div className="h-12 rounded-lg bg-[var(--muted)]" />
            <div className="h-24 rounded-lg bg-[var(--muted)]" />
            <div className="h-12 w-3/4 rounded-lg bg-[var(--muted)]" />
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 lg:col-span-2">
            <div className="h-6 w-32 rounded bg-[var(--muted)]" />
            <div className="mt-4 h-20 rounded bg-[var(--muted)]" />
            <div className="mt-4 h-20 rounded bg-[var(--muted)]" />
            <div className="mt-4 h-10 rounded bg-[var(--muted)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
