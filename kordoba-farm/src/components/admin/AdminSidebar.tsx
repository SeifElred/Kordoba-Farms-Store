"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Layers,
  Scissors,
  Languages,
  Settings,
  Palette,
  Scale,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";

const GROUPS = [
  {
    label: "Overview",
    links: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Commerce",
    links: [{ href: "/admin/orders", label: "Orders", icon: ShoppingBag }],
  },
  {
    label: "Catalog",
    links: [
      { href: "/admin/products", label: "Products", icon: Layers },
      { href: "/admin/special-cuts", label: "Special cuts", icon: Scissors },
      { href: "/admin/weight-options", label: "Weight options", icon: Scale },
    ],
  },
  {
    label: "Site",
    links: [
      { href: "/admin/themes", label: "Themes", icon: Palette },
      { href: "/admin/settings", label: "Settings", icon: Settings },
      { href: "/admin/translations", label: "Translations", icon: Languages },
    ],
  },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      <div className="flex h-16 shrink-0 items-center border-b border-border px-5">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">
            K
          </span>
          Kordoba Admin
        </Link>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        {GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.links.map(({ href, label, icon: Icon }) => {
                const active =
                  href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-4 w-4 shrink-0" />
                        {label}
                      </span>
                      <ChevronRight
                        className={`h-4 w-4 shrink-0 opacity-50 ${
                          active ? "text-primary" : ""
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-border p-4">
        <form action="/api/admin/logout" method="POST">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </form>
      </div>
    </>
  );
}
