"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const locales = [
  { code: "en", label: "EN" },
  { code: "ar", label: "AR" },
  { code: "ms", label: "MS" },
  { code: "zh", label: "中文" },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onSelect(next: string) {
    if (next === locale) return;
    const segments = pathname.split("/").filter(Boolean);
    const localeCodes = ["en", "ar", "ms", "zh"];
    const pathSegments =
      segments[0] && localeCodes.includes(segments[0])
        ? [next, ...segments.slice(1)]
        : [next, ...segments];
    const basePath = `/${pathSegments.filter(Boolean).join("/")}`;
    const search = searchParams.toString();
    const newPath = search ? `${basePath}?${search}` : basePath;
    startTransition(() => {
      router.push(newPath, { scroll: false });
    });
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] p-0.5">
      {locales.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          disabled={isPending}
          onClick={() => onSelect(code)}
          className={`rounded-md px-2 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 ${
            locale === code
              ? "bg-[var(--primary)] text-white"
              : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
