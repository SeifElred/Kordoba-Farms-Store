export default function OrderPageLoading() {
  return (
    <div className="min-h-[60vh] animate-pulse">
      <div className="hero-strip -mx-4 mb-6 rounded-b-2xl px-4 pb-8 pt-6 sm:-mx-6 sm:mb-8 sm:px-6 sm:pb-10 sm:pt-8">
        <div className="mx-auto max-w-2xl">
          <div className="h-6 w-40 rounded bg-white/30 sm:h-7" />
        </div>
      </div>
      <div className="mx-auto max-w-2xl space-y-6 px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="h-4 w-20 rounded bg-[var(--muted)]" />
          <div className="h-8 w-20 rounded-full bg-[var(--muted)]" />
        </div>

        {/* Step 2: Animal skeleton */}
        <div className="grid grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-2xl border-2 border-[var(--border)] bg-[var(--card)]"
            >
              <div className="relative aspect-[4/3] bg-[var(--muted)]" />
              <div className="p-4">
                <div className="h-4 w-24 rounded bg-[var(--muted)]" />
              </div>
            </div>
          ))}
        </div>

        {/* Step 3: Whole skeleton */}
        <div className="space-y-3">
          <div className="h-4 w-32 rounded bg-[var(--muted)]" />
          <div className="grid grid-cols-2 gap-4">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="flex flex-col overflow-hidden rounded-2xl border-2 border-[var(--border)] bg-[var(--card)]"
              >
                <div className="relative aspect-[4/3] bg-[var(--muted)]" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-24 rounded bg-[var(--muted)]" />
                  <div className="h-3 w-20 rounded bg-[var(--muted)]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Button skeleton */}
        <div className="h-11 w-full rounded-xl bg-[var(--muted)]" />
      </div>
    </div>
  );
}

