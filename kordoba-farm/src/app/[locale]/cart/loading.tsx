export default function CartLoading() {
  return (
    <div className="min-h-[50vh]" role="status" aria-label="Loading cart">
      <div className="mx-auto max-w-2xl animate-pulse space-y-6">
        <div className="h-10 w-48 rounded-lg bg-[var(--muted)]" />
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <div className="h-5 w-32 rounded bg-[var(--muted)]" />
          <div className="mt-4 h-24 rounded-lg bg-[var(--muted)]" />
          <div className="mt-4 h-24 rounded-lg bg-[var(--muted)]" />
        </div>
        <div className="h-12 w-full rounded-xl bg-[var(--muted)]" />
      </div>
    </div>
  );
}
