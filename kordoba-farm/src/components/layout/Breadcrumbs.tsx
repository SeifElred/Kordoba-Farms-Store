"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const pathname = usePathname();
  const basePath = pathname.split("/").slice(0, 2).join("/") || "/en";

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex flex-wrap items-center gap-1 text-sm text-[var(--muted-foreground)]", className)}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        const href = item.href != null ? (item.href.startsWith("/") ? item.href : `${basePath}${item.href}`) : undefined;
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-4 w-4 shrink-0 opacity-60 rtl:rotate-180" aria-hidden />}
            {href && !isLast ? (
              <Link href={href} className="rounded-[var(--radius)] px-0.5 transition-colors hover:text-[var(--foreground)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-medium text-[var(--foreground)]" : undefined}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
