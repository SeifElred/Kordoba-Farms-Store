"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import type { CartLineItem } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/utils";
import { Lock, ShieldCheck, CreditCard } from "lucide-react";

type CartPayloadItem = {
  product: string;
  occasion: string;
  weightSelection: string;
  specialCutId: string;
  specialCutLabel: string;
  slaughterDate: string;
  distribution: string;
  videoProof: boolean;
  includeHead: boolean;
  includeStomach: boolean;
  includeIntestines: boolean;
  note: string;
  productLabel: string;
};

function cartToPayload(items: CartLineItem[]): CartPayloadItem[] {
  return items.map((item) => ({
    product: item.product,
    occasion: item.occasion,
    weightSelection: item.weightSelection,
    specialCutId: item.specialCutId,
    specialCutLabel: item.specialCutLabel,
    slaughterDate: item.slaughterDate,
    distribution: item.distribution,
    videoProof: item.videoProof,
    includeHead: item.includeHead,
    includeStomach: item.includeStomach,
    includeIntestines: item.includeIntestines,
    note: item.note ?? "",
    productLabel: item.productLabel,
  }));
}

export function CheckoutPageClient({
  locale,
  purposeLabels,
}: {
  locale: string;
  purposeLabels: Record<string, string>;
}) {
  const t = useTranslations("checkout");
  const { items, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    country: "MY",
  });

  const totalMYR = items.reduce((sum, i) => sum + i.minPrice, 0);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (items.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim() || undefined,
          country: form.country,
          locale,
          items: cartToPayload(items),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Checkout failed");
        setLoading(false);
        return;
      }
      if (data.url) {
        clearCart();
        window.location.href = data.url;
        return;
      }
      setError(data.message ?? "Payment not configured");
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-sm">
        <p className="text-[var(--muted-foreground)]">{t("emptyCart")}</p>
        <a
          href={`/${locale}/cart`}
          className="mt-4 inline-block text-sm font-medium text-[var(--primary)] hover:underline"
        >
          {t("backToCart")}
        </a>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <form onSubmit={handlePay} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
              {t("name")} *
            </label>
            <input
              type="text"
              required
              className="input-base w-full"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
              {t("email")} *
            </label>
            <input
              type="email"
              required
              className="input-base w-full"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
              {t("phone")} *
            </label>
            <input
              type="tel"
              required
              className="input-base w-full"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
              {t("address")} <span className="text-xs text-[var(--muted-foreground)]">({t("optional")})</span>
            </label>
            <textarea
              rows={3}
              className="input-base w-full min-h-[80px] resize-y"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder={t("addressPlaceholder")}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 px-4 py-3 text-sm text-[var(--muted-foreground)]">
            <Lock className="h-5 w-5 shrink-0 text-[var(--primary)]" aria-hidden />
            <span>{t("securePayment")}</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex w-full items-center justify-center gap-2"
          >
            {loading ? (
              <span>{t("processing")}</span>
            ) : (
              <>
                <CreditCard className="h-5 w-5" aria-hidden />
                {t("payNow")}
              </>
            )}
          </button>
        </form>
      </div>

      <div className="lg:col-span-2">
        <div className="sticky top-24 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            {t("orderSummary")}
          </h2>
          <ul className="mt-4 space-y-3 border-t border-[var(--border)] pt-4">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between gap-2 text-sm">
                <span className="min-w-0 truncate text-[var(--foreground)]">
                  {purposeLabels[item.occasion] ?? item.occasion} · {item.productLabel}
                </span>
                <span className="shrink-0 font-medium text-[var(--primary)]">
                  {formatPrice(item.minPrice)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex justify-between border-t border-[var(--border)] pt-4 text-lg font-bold text-[var(--foreground)]">
            <span>{t("total")}</span>
            <span className="text-[var(--primary)]">{formatPrice(totalMYR)}</span>
          </p>
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-[var(--muted)]/30 px-3 py-2 text-xs text-[var(--muted-foreground)]">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden />
            <span>{t("secureNote")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
