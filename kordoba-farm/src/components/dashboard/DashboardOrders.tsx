"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import type { Order, Animal } from "@prisma/client";
import { formatPrice, formatDate } from "@/lib/utils";

type OrderWithAnimal = Order & { animal: Animal };

const statusKey: Record<string, string> = {
  reserved: "reserved",
  scheduled: "scheduled",
  slaughtered: "slaughtered",
  processing: "processing",
  completed: "completed",
};

export function DashboardOrders({
  orders,
  locale,
}: {
  orders: OrderWithAnimal[];
  locale: string;
}) {
  const t = useTranslations("dashboard");

  if (orders.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-8 text-center text-[var(--muted-foreground)]">
        No orders yet. <Link href={`/${locale}/shop`} className="text-[var(--primary)] underline">Browse animals</Link>.
      </div>
    );
  }

  return (
    <ul className="mt-6 space-y-4">
      {orders.map((order) => (
        <li
          key={order.id}
          className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-medium">{order.animal.breed} · Tag {order.animal.tagNumber}</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {formatDate(order.createdAt, locale)} · {formatPrice(order.totalPrice)}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-0.5 text-xs font-medium ${
                order.orderStatus === "completed"
                  ? "bg-green-100 text-green-800"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)]"
              }`}
            >
              {t(statusKey[order.orderStatus] ?? order.orderStatus)}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {order.certificateUrl && (
              <a
                href={order.certificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[var(--primary)] underline"
              >
                {t("downloadCert")}
              </a>
            )}
            {order.videoProofUrl && (
              <a
                href={order.videoProofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[var(--primary)] underline"
              >
                {t("downloadVideo")}
              </a>
            )}
            <Link
              href={`/${locale}/shop?purpose=qurban`}
              className="text-sm text-[var(--primary)] underline"
            >
              {t("reorder")}
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
