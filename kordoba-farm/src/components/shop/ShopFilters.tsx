"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";

const PRODUCT_OPTIONS = [
  { value: "", label: "All products" },
  { value: "half_goat", label: "Half Goat" },
  { value: "half_sheep", label: "Half Sheep" },
  { value: "whole_goat", label: "Whole Goat" },
  { value: "whole_sheep", label: "Whole Sheep" },
];

type SearchParams = {
  purpose?: string;
  product?: string;
  breed?: string;
  min?: string;
  max?: string;
  gender?: string;
  ready?: string;
};

export function ShopFilters({ searchParams }: { searchParams: SearchParams }) {
  const t = useTranslations("shop");
  const router = useRouter();
  const pathname = usePathname();

  function update(key: string, value: string | undefined) {
    const u = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    if (value) u.set(key, value);
    else u.delete(key);
    const q = u.toString();
    router.push(pathname + (q ? "?" + q : ""));
  }

  return (
    <div className="space-y-6 rounded-xl border border-[var(--border)] bg-white p-4">
      <h2 className="font-semibold text-[var(--foreground)]">{t("filters")}</h2>
      <div>
        <label className="mb-1 block text-sm text-[var(--muted-foreground)]">Product</label>
        <select
          className="input-base w-full"
          value={searchParams.product ?? ""}
          onChange={(e) => update("product", e.target.value || undefined)}
        >
          {PRODUCT_OPTIONS.map((o) => (
            <option key={o.value || "all"} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm text-[var(--muted-foreground)]">{t("breed")}</label>
        <select
          className="input-base w-full"
          value={searchParams.breed ?? ""}
          onChange={(e) => update("breed", e.target.value || undefined)}
        >
          <option value="">All</option>
          <option value="dorper">Dorper</option>
          <option value="boer">Boer</option>
          <option value="blackhead">Blackhead Persian</option>
          <option value="kampung">Kampung</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm text-[var(--muted-foreground)]">{t("weight")}</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            className="input-base"
            value={searchParams.min ?? ""}
            onChange={(e) => update("min", e.target.value || undefined)}
          />
          <input
            type="number"
            placeholder="Max"
            className="input-base"
            value={searchParams.max ?? ""}
            onChange={(e) => update("max", e.target.value || undefined)}
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm text-[var(--muted-foreground)]">{t("gender")}</label>
        <select
          className="input-base w-full"
          value={searchParams.gender ?? ""}
          onChange={(e) => update("gender", e.target.value || undefined)}
        >
          <option value="">All</option>
          <option value="male">{t("male")}</option>
          <option value="female">{t("female")}</option>
        </select>
      </div>
    </div>
  );
}
