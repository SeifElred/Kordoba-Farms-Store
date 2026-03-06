"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, ExternalLink, Printer } from "lucide-react";
import { toast } from "sonner";
import { getWeightBandDisplayLabel } from "@/lib/weight-bands";
import type { CartOrderDetail, SingleOrderDetail } from "@/types/admin-orders";

const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;
const ORDER_STATUSES = ["reserved", "scheduled", "slaughtered", "processing", "completed"] as const;

type CartItem = {
  product?: string;
  productLabel?: string;
  occasion?: string;
  weightSelection?: string;
  specialCutId?: string;
  specialCutLabel?: string;
  slaughterDate?: string;
  distribution?: string;
  videoProof?: boolean;
  includeHead?: boolean;
  includeStomach?: boolean;
  includeIntestines?: boolean;
  note?: string;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function formatMYR(cents: number) {
  return `RM ${(cents / 100).toFixed(2)}`;
}

function formatMYRPrice(price: number) {
  return `RM ${price.toFixed(2)}`;
}

function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text).then(
    () => toast.success(`${label} copied`),
    () => toast.error("Failed to copy")
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-2 rounded border border-border bg-muted/20 px-4 py-3 text-sm">
        {children}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  copyable,
  href,
}: {
  label: string;
  value: React.ReactNode;
  copyable?: boolean;
  href?: string;
}) {
  if (value == null || value === "" || (typeof value === "string" && value === "—")) return null;
  const str = typeof value === "string" ? value : "";
  const canCopy = copyable && str.length > 0;

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="ml-2 text-foreground">
          {href ? (
            <a
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="underline underline-offset-2 hover:text-primary break-all"
            >
              {value}
            </a>
          ) : (
            <span className="break-words">{value}</span>
          )}
        </span>
      </div>
      {canCopy && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={() => copyToClipboard(str, label)}
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

export function CartOrderDetailView({
  order,
  onUpdateStatus,
}: {
  order: CartOrderDetail;
  onUpdateStatus?: (paymentStatus: string) => void;
}) {
  const items = (order.items as CartItem[]) ?? [];
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [saving, setSaving] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded border border-border bg-muted/10 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">Cart · {items.length} item{items.length !== 1 ? "s" : ""}</span>
          <span className="text-sm font-semibold tabular-nums">{formatMYR(order.totalCents)}</span>
          <Badge variant={order.paymentStatus === "paid" ? "default" : "secondary"}>
            {order.paymentStatus}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
          </Button>
          {onUpdateStatus && (
            <>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger className="h-8 w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                className="h-8"
                disabled={saving || paymentStatus === order.paymentStatus}
                onClick={() => {
                  setSaving(true);
                  onUpdateStatus(paymentStatus);
                  setSaving(false);
                }}
              >
                {saving ? "…" : "Save"}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Section title="Order">
          <Row label="ID" value={order.id} copyable />
          <Row label="Created" value={formatDate(order.createdAt)} />
          <Row label="Updated" value={formatDate(order.updatedAt)} />
          <Row label="Locale" value={order.locale} />
        </Section>
        <Section title="Customer">
          <Row label="Name" value={order.name} copyable />
          <Row label="Email" value={order.email} copyable href={`mailto:${order.email}`} />
          <Row label="Phone" value={order.phone} copyable href={`tel:${order.phone}`} />
          <Row label="Address" value={order.address ?? "—"} copyable />
          <Row label="Country" value={order.country} />
        </Section>
      </div>

      <Section title="Payment">
        <Row label="Total" value={formatMYR(order.totalCents)} />
        {order.stripeSessionId && (
          <Row
            label="Stripe"
            value={
              <a
                href={`https://dashboard.stripe.com/test/checkout/sessions/${order.stripeSessionId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1"
              >
                Session <ExternalLink className="h-3 w-3" />
              </a>
            }
          />
        )}
        {order.stripePaymentId && (
          <Row
            label="Payment ID"
            value={
              <a
                href={`https://dashboard.stripe.com/test/payments/${order.stripePaymentId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1"
              >
                View <ExternalLink className="h-3 w-3" />
              </a>
            }
          />
        )}
      </Section>

      <div>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Items ({items.length})
        </h3>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="rounded border border-border bg-card px-4 py-3 text-sm"
            >
              <div className="font-medium text-foreground">
                {i + 1}. {item.productLabel ?? item.product ?? "—"}
              </div>
              <div className="mt-2 grid gap-1 text-muted-foreground sm:grid-cols-2">
                <Row label="Occasion" value={item.occasion} />
                <Row
                  label="Weight"
                  value={
                    item.weightSelection
                      ? getWeightBandDisplayLabel(
                          item.weightSelection,
                          item.occasion ?? "qurban",
                          order.locale
                        ) || item.weightSelection
                      : "—"
                  }
                />
                <Row label="Slaughter" value={item.slaughterDate} />
                <Row label="Distribution" value={item.distribution} />
                <Row label="Cut" value={item.specialCutLabel ?? item.specialCutId} />
                <Row label="Video proof" value={item.videoProof === true ? "Yes" : item.videoProof === false ? "No" : "—"} />
                <div className="sm:col-span-2">
                  <Row
                    label="Includes"
                    value={
                      [item.includeHead && "Head", item.includeStomach && "Stomach", item.includeIntestines && "Intestines"]
                        .filter(Boolean)
                        .join(", ") || "None"
                    }
                  />
                </div>
                {item.note?.trim() && <Row label="Note" value={item.note.trim()} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SingleOrderDetailView({
  order,
  onUpdateStatus,
}: {
  order: SingleOrderDetail;
  onUpdateStatus?: (payload: { paymentStatus?: string; orderStatus?: string }) => void;
}) {
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [orderStatus, setOrderStatus] = useState(order.orderStatus);
  const [saving, setSaving] = useState(false);

  const includes = [
    order.includeHead && "Head",
    order.includeStomach && "Stomach",
    order.includeIntestines && "Intestines",
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded border border-border bg-muted/10 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">Single order</span>
          <span className="text-sm font-semibold tabular-nums">{formatMYRPrice(order.totalPrice)}</span>
          <Badge variant={order.paymentStatus === "paid" ? "default" : "secondary"}>{order.paymentStatus}</Badge>
          <Badge variant="outline">{order.orderStatus}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
          </Button>
          {onUpdateStatus && (
            <>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger className="h-8 w-[90px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={orderStatus} onValueChange={setOrderStatus}>
                <SelectTrigger className="h-8 w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                className="h-8"
                disabled={
                  saving ||
                  (paymentStatus === order.paymentStatus && orderStatus === order.orderStatus)
                }
                onClick={() => {
                  setSaving(true);
                  onUpdateStatus({ paymentStatus, orderStatus });
                  setSaving(false);
                }}
              >
                {saving ? "…" : "Save"}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Section title="Order">
          <Row label="ID" value={order.id} copyable />
          <Row label="User ID" value={order.userId} copyable />
          <Row label="Animal ID" value={order.animalId} copyable />
          <Row label="Created" value={formatDate(order.createdAt)} />
        </Section>
        <Section title="Customer">
          <Row label="Name" value={order.user.name} copyable />
          <Row label="Email" value={order.user.email} copyable href={`mailto:${order.user.email}`} />
          <Row label="Phone" value={order.user.phone} copyable href={`tel:${order.user.phone}`} />
          <Row label="Country" value={order.user.country} />
        </Section>
      </div>

      <Section title="Details">
        <Row label="Purpose" value={order.purpose} />
        <Row label="City" value={order.city ?? "—"} />
        <Row label="Slaughter date" value={order.slaughterDate.slice(0, 10)} />
        <Row label="Distribution" value={order.distributionType} />
        <Row label="Total" value={formatMYRPrice(order.totalPrice)} />
        <Row label="Name tag" value={order.nameTag ?? "—"} />
        <Row
        label="Weight"
        value={
          order.weightSelection
            ? getWeightBandDisplayLabel(
                order.weightSelection,
                order.purpose,
                "en"
              ) || order.weightSelection
            : "—"
        }
      />
        <Row label="Special cut" value={order.specialCut ?? "—"} />
        <Row label="Video proof" value={order.videoProofOpt ? "Yes" : "No"} />
        <Row label="Includes" value={includes.length ? includes.join(", ") : "None"} />
        {order.note?.trim() && <Row label="Note" value={order.note.trim()} />}
      </Section>

      {(order.stripePaymentId || order.certificateUrl || order.videoProofUrl) && (
        <Section title="Stripe & attachments">
          {order.stripePaymentId && (
            <Row
              label="Stripe"
              value={
                <a
                  href={`https://dashboard.stripe.com/test/payments/${order.stripePaymentId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1"
                >
                  View payment <ExternalLink className="h-3 w-3" />
                </a>
              }
            />
          )}
          {order.certificateUrl && (
            <Row
              label="Certificate"
              value={
                <a href={order.certificateUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">
                  Open <ExternalLink className="h-3 w-3" />
                </a>
              }
            />
          )}
          {order.videoProofUrl && (
            <Row
              label="Video proof"
              value={
                <a href={order.videoProofUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">
                  Open <ExternalLink className="h-3 w-3" />
                </a>
              }
            />
          )}
        </Section>
      )}

      {order.animal && (
        <Section title="Animal">
          <Row label="Tag" value={order.animal.tagNumber} copyable />
          <Row label="Type" value={order.animal.productType} />
          <Row label="Weight (kg)" value={String(order.animal.weight)} />
          <Row label="Status" value={order.animal.status} />
        </Section>
      )}
    </div>
  );
}
