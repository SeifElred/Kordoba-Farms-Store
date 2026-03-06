"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import type { CartLineItem } from "@/contexts/CartContext";
import { formatPrice, formatPriceRange } from "@/lib/utils";
import { getFlagEmoji, COUNTRY_DIAL_LIST } from "@/lib/country-dial";
import { Lock, ShieldCheck, CreditCard, MessageCircle } from "lucide-react";
import { toast } from "sonner";

const WHATSAPP_FALLBACK = process.env.NEXT_PUBLIC_WHATSAPP_LINK ?? "https://wa.me/60123456789";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_ALLOWED_REGEX = /^[0-9\s\-()]+$/;

function normalizeLocalPhoneInput(phone: string) {
  return phone.replace(/\D/g, "").slice(0, 15);
}

function isValidLocalPhone(phone: string) {
  const trimmed = normalizeLocalPhoneInput(phone);
  if (!trimmed || !PHONE_ALLOWED_REGEX.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 6 && digits.length <= 15;
}

type CartPayloadItem = {
  product: string;
  occasion: string;
  weightOptionId?: string;
  weightSelection?: string;
  weightLabel?: string;
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
    ...(item.weightOptionId && { weightOptionId: item.weightOptionId }),
    weightSelection: item.weightSelection || undefined,
    weightLabel: item.weightLabel || undefined,
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
  intentWhatsapp = false,
  whatsappLink,
}: {
  locale: string;
  purposeLabels: Record<string, string>;
  intentWhatsapp?: boolean;
  whatsappLink?: string | null;
}) {
  const t = useTranslations("checkout");
  const tProduct = useTranslations("product");
  const tOrder = useTranslations("orderDetails");
  const { items, clearCart } = useCart();

  const productLabels: Record<string, string> = {
    whole_sheep: tProduct("whole_sheep"),
    whole_goat: tProduct("whole_goat"),
    half_sheep: tProduct("half_sheep"),
    half_goat: tProduct("half_goat"),
  };
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

  const distLabels: Record<string, string> = {
    delivery: tOrder("delivery"),
    pickup: tOrder("pickup"),
    donate: tOrder("donate"),
  };

  async function handleSendWhatsApp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (items.length === 0) return;
    if (!form.name.trim() || !form.address.trim()) {
      setError(t("addressRequired"));
      return;
    }
    if (!form.phone.trim()) {
      setError(t("phoneRequired"));
      return;
    }
    if (!isValidLocalPhone(form.phone)) {
      setError(t("invalidPhone"));
      return;
    }
    if (form.email.trim() && !EMAIL_REGEX.test(form.email.trim())) {
      setError(t("invalidEmail"));
      return;
    }
    const countryMeta =
      COUNTRY_DIAL_LIST.find((c) => c.code === form.country) ??
      COUNTRY_DIAL_LIST.find((c) => c.code === "MY")!;
    const normalizedPhone = normalizeLocalPhoneInput(form.phone);
    const phoneWithDial = `${countryMeta.dial} ${normalizedPhone}`;
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "whatsapp",
          name: form.name.trim(),
          email: (form.email?.trim() || "").trim() || undefined,
          phone: phoneWithDial,
          address: form.address.trim(),
          country: form.country,
          locale,
          items: cartToPayload(items),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not create order. Please try again.");
        setLoading(false);
        return;
      }
      const lines = [
        "*New order – Kordoba Farms*",
        "",
        "*Customer*",
        `Name: ${form.name.trim()}`,
        `Phone: ${phoneWithDial}`,
        `Address: ${form.address.trim()}`,
        ...(form.email?.trim() ? [`Email: ${form.email.trim()}`] : []),
        "",
        `*Items (${items.length})*`,
        ...items.flatMap((item, i) => {
          const purpose = purposeLabels[item.occasion] ?? item.occasion;
          const dist = distLabels[item.distribution] ?? item.distribution;
          const productName = productLabels[item.product] ?? item.productLabel;
          return [
            "",
            `*${i + 1}. ${productName}*`,
            `Occasion: ${purpose}`,
            `Slaughter: ${item.slaughterDate || "TBD"}`,
            `Distribution: ${dist}`,
            `Cut: ${item.specialCutLabel || "—"}`,
            `Price: ${formatPriceRange(item.minPrice, item.maxPrice)}`,
          ];
        }),
      ];
      const message = lines.join("\n");
      const base = (whatsappLink?.trim() || WHATSAPP_FALLBACK).replace(/\/$/, "");
      const url = `${base}${base.includes("?") ? "&" : "?"}text=${encodeURIComponent(message)}`;
      window.open(url, "_blank", "noopener,noreferrer");
      clearCart();
      toast.success("Order created. We'll confirm via WhatsApp.");
      window.location.href = `/${locale}/cart`;
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (items.length === 0) return;
    if (!form.name.trim() || !form.address.trim()) {
      setError(t("addressRequired"));
      return;
    }
    if (!form.phone.trim()) {
      setError(t("phoneRequired"));
      return;
    }
    if (!form.email.trim()) {
      setError(t("emailRequired"));
      return;
    }
    if (!isValidLocalPhone(form.phone)) {
      setError(t("invalidPhone"));
      return;
    }
    if (!EMAIL_REGEX.test(form.email.trim())) {
      setError(t("invalidEmail"));
      return;
    }
    const countryMeta =
      COUNTRY_DIAL_LIST.find((c) => c.code === form.country) ??
      COUNTRY_DIAL_LIST.find((c) => c.code === "MY")!;
    const normalizedPhone = normalizeLocalPhoneInput(form.phone);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: `${countryMeta.dial} ${normalizedPhone}`,
          address: form.address.trim(),
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
        <form onSubmit={intentWhatsapp ? handleSendWhatsApp : handlePay} className="space-y-4">
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
              {t("email")}
              {!intentWhatsapp ? " *" : ""}
            </label>
            <input
              type="email"
              required={!intentWhatsapp}
              className="input-base w-full"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
              {t("phone")} *
            </label>
            <div className="flex gap-2" dir="ltr">
              <select
                className="input-base w-32 shrink-0 text-left"
                value={form.country}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    country: e.target.value,
                  }))
                }
              >
                {COUNTRY_DIAL_LIST.map((c) => (
                  <option key={c.code} value={c.code}>
                    {getFlagEmoji(c.code)} {c.dial}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                required
                className="input-base w-full text-left"
                dir="ltr"
                inputMode="tel"
                autoComplete="tel-national"
                maxLength={15}
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    phone: normalizeLocalPhoneInput(e.target.value),
                  }))
                }
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
              {t("address")} *
            </label>
            <textarea
              rows={3}
              required
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

          {!intentWhatsapp && (
            <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 px-4 py-3 text-sm text-[var(--muted-foreground)]">
              <Lock className="h-5 w-5 shrink-0 text-[var(--primary)]" aria-hidden />
              <span>{t("securePayment")}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex w-full items-center justify-center gap-2"
          >
            {loading ? (
              <span>{t("processing")}</span>
            ) : intentWhatsapp ? (
              <>
                <MessageCircle className="h-5 w-5" aria-hidden />
                {t("sendToWhatsApp")}
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" aria-hidden />
                {t("payNow")}
              </>
            )}
          </button>
          {intentWhatsapp && (
            <p className="text-center">
              <Link href={`/${locale}/checkout`} className="text-sm text-[var(--primary)] hover:underline">
                {t("payNow")} instead
              </Link>
            </p>
          )}
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
                  {purposeLabels[item.occasion] ?? item.occasion} · {productLabels[item.product] ?? item.productLabel}
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
