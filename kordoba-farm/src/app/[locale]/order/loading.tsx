export default function OrderPageLoading() {
  return (
    <div className="min-h-[60vh]" role="status" aria-label="Loading order">
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        <p className="text-sm text-[var(--muted-foreground)]">Loading order…</p>
      </div>
    </div>
  );
}
