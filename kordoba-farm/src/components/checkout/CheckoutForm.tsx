"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { formatPriceRange } from "@/lib/utils";

const WHATSAPP_FALLBACK =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_WHATSAPP_LINK
    ? process.env.NEXT_PUBLIC_WHATSAPP_LINK
    : "https://wa.me/60123456789";

type OrderMessageParams = {
  name: string;
  phone: string;
  address: string;
  email?: string;
  productLabel: string;
  minPrice: number;
  maxPrice: number;
  slaughterDate: string;
  distributionType: string;
  purpose: string;
  purposeLabel: string;
  weightSelection: string;
  weightLabel?: string;
  specialCut: string;
  includeHead: boolean;
  includeStomach: boolean;
  includeIntestines: boolean;
  videoProof: boolean;
  note: string;
};

function buildOrderMessageParams(params: OrderMessageParams) {
  const {
    name,
    phone,
    address,
    email,
    productLabel,
    minPrice,
    maxPrice,
    slaughterDate,
    distributionType,
    weightSelection,
    weightLabel,
    specialCut,
    includeHead,
    includeStomach,
    includeIntestines,
    videoProof,
    note,
  } = params;

  const weightLine =
    weightLabel && weightLabel.trim()
      ? `Weight: ${weightLabel.trim()}`
      : weightSelection && weightSelection !== "as_is"
        ? `Weight: ${weightSelection === "range" ? "Weight range (contact us)" : weightSelection}`
        : "Weight: As is (standard)";
  const includes: string[] = [];
  if (includeHead) includes.push("Head");
  if (includeStomach) includes.push("Stomach");
  if (includeIntestines) includes.push("Intestines");
  const orderIncludes = includes.length ? includes.join(", ") : "—";

  return {
    name,
    phone,
    address: address || "",
    email: email ?? "",
    productLabel,
    minPrice: String(minPrice),
    maxPrice: String(maxPrice),
    priceRange: formatPriceRange(minPrice, maxPrice),
    slaughterDate: slaughterDate || "TBD",
    distributionType,
    purpose: params.purposeLabel,
    weightLine,
    weightSelection,
    specialCut: specialCut || "—",
    orderIncludes,
    videoProof: videoProof ? "Yes" : "No",
    note: note || "",
  };
}

function buildOrderMessage(params: OrderMessageParams): string {
  const map = buildOrderMessageParams(params);
  const lines = [
    "*New order – Kordoba Farms*",
    "",
    "*Customer*",
    `Name: ${map.name}`,
    `Phone: ${map.phone}`,
    `Address: ${map.address}`,
    ...(map.email ? [`Email: ${map.email}`] : []),
    "",
    "*Order*",
    `• Product: ${map.productLabel}`,
    `• Occasion: ${map.purpose}`,
    `• Slaughter date: ${map.slaughterDate}`,
    `• Distribution: ${map.distributionType}`,
    `• ${map.weightLine}`,
    `• Special cut: ${map.specialCut}`,
    `• Order includes: ${map.orderIncludes}`,
    `• Video proof: ${map.videoProof}`,
    ...(map.note ? [`• Note: ${map.note}`] : []),
    "",
    `*Total: ${map.priceRange} (based on final weight)*`,
  ];
  return lines.join("\n");
}

/** Replace {{placeholder}} in template with values from map. */
function applyOrderMessageTemplate(
  template: string,
  params: OrderMessageParams
): string {
  const map = buildOrderMessageParams(params);
  let out = template;
  for (const [key, value] of Object.entries(map)) {
    out = out.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value ?? ""));
  }
  return out;
}

type Props = {
  locale: string;
  productLabel: string;
  minPrice: number;
  maxPrice: number;
  slaughterDate: string;
  distributionType: string;
  videoProof: boolean;
  purpose: string;
  weightSelection: string;
  weightLabel?: string;
  specialCut: string;
  includeHead: boolean;
  includeStomach: boolean;
  includeIntestines: boolean;
  note: string;
  whatsappBase?: string | null;
  /** Custom template for WhatsApp order message. Use {{name}}, {{phone}}, {{address}}, {{email}}, {{productLabel}}, {{priceRange}}, {{slaughterDate}}, {{distributionType}}, {{purpose}}, {{weightLine}}, {{specialCut}}, {{orderIncludes}}, {{videoProof}}, {{note}}. If empty, default format is used. */
  orderMessageTemplate?: string | null;
};

export function CheckoutForm({
  locale,
  productLabel,
  minPrice,
  maxPrice,
  slaughterDate,
  distributionType,
  videoProof,
  purpose,
  weightSelection,
  weightLabel,
  specialCut,
  includeHead,
  includeStomach,
  includeIntestines,
  note,
  whatsappBase,
  orderMessageTemplate,
}: Props) {
  const whatsappUrl = (whatsappBase?.trim() || WHATSAPP_FALLBACK);
  const t = useTranslations("checkout");
  const tPurpose = useTranslations("purpose");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    country: "MY",
    language: locale,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const purposeKey = purpose || "qurban";
    const params = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      email: form.email.trim() || undefined,
      productLabel,
      minPrice,
      maxPrice,
      slaughterDate: slaughterDate || "TBD",
      distributionType,
      purpose: purposeKey,
      purposeLabel: tPurpose(purposeKey),
      weightSelection: weightSelection || "as_is",
      weightLabel: weightLabel ?? "",
      specialCut: specialCut || "",
      includeHead,
      includeStomach,
      includeIntestines,
      videoProof,
      note: note || "",
    };
    const message =
      orderMessageTemplate?.trim() && orderMessageTemplate.length > 0
        ? applyOrderMessageTemplate(orderMessageTemplate, params)
        : buildOrderMessage(params);
    const separator = whatsappUrl.includes("?") ? "&" : "?";
    const url = `${whatsappUrl}${separator}text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">
          {t("name")}
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
          {t("phone")}
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
          {t("address")}
        </label>
        <textarea
          required
          rows={3}
          className="input-base w-full min-h-[80px] resize-y"
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          placeholder={t("addressPlaceholder")}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--muted-foreground)]">
          {t("email")} <span className="text-xs">({t("optional")})</span>
        </label>
        <input
          type="email"
          className="input-base w-full"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
      </div>

      <div className="rounded-xl border-2 border-[var(--primary)]/20 bg-gradient-to-br from-[var(--primary)]/08 to-[var(--card)] p-4 shadow-sm">
        <p className="text-sm font-medium text-[var(--foreground)]">{productLabel}</p>
        <p className="mt-1 text-xl font-bold text-[var(--primary)]">
          {formatPriceRange(minPrice, maxPrice)}
        </p>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          {t("orderSummaryNote")}
        </p>
      </div>

      <button type="submit" className="btn-primary w-full">
        {t("sendToWhatsApp")}
      </button>
    </form>
  );
}
