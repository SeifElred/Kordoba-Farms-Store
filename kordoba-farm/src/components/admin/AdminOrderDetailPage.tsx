"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { AdminPageHeader } from "./AdminPageHeader";
import { toast } from "sonner";
import type { CartOrderDetail, SingleOrderDetail } from "@/types/admin-orders";
import { CartOrderDetailView, SingleOrderDetailView } from "./AdminOrderDetailViews";

export function AdminOrderDetailPage({ id }: { id: string }) {
  const [order, setOrder] = useState<CartOrderDetail | SingleOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setNotFound(false);
    fetch(`/api/admin/orders/${encodeURIComponent(id)}`)
      .then((r) => {
        if (r.status === 404) {
          setNotFound(true);
          setOrder(null);
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data?.type) setOrder(data as CartOrderDetail | SingleOrderDetail);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  async function updateOrderStatus(
    orderId: string,
    payload: { paymentStatus?: string; orderStatus?: string }
  ) {
    const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(data.error ?? "Failed to update");
      return;
    }
    toast.success("Order updated");
    if (order && order.id === orderId) {
      if (order.type === "cart" && payload.paymentStatus) {
        setOrder({ ...order, paymentStatus: payload.paymentStatus });
      }
      if (order.type === "single") {
        setOrder({
          ...order,
          ...(payload.paymentStatus && { paymentStatus: payload.paymentStatus }),
          ...(payload.orderStatus && { orderStatus: payload.orderStatus }),
        });
      }
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <AdminPageHeader
        title={order ? `Order ${order.type === "cart" ? "Cart" : "Single"} · ${order.id.slice(0, 8)}…` : "Order"}
        description={
          order
            ? "View and update payment or order status."
            : loading
              ? "Loading…"
              : undefined
        }
        backHref="/admin/orders"
      />

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {notFound && !loading && (
        <div className="rounded-lg border border-border bg-card px-6 py-12 text-center">
          <p className="font-medium text-foreground">Order not found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            The order may have been deleted or the ID is invalid.
          </p>
          <Button variant="outline" size="sm" className="mt-4" asChild>
            <Link href="/admin/orders">Back to orders</Link>
          </Button>
        </div>
      )}

      {order && !loading && order.type === "cart" && (
        <CartOrderDetailView
          order={order}
          onUpdateStatus={(paymentStatus) =>
            updateOrderStatus(order.id, { paymentStatus })
          }
        />
      )}

      {order && !loading && order.type === "single" && (
        <SingleOrderDetailView
          order={order}
          onUpdateStatus={(payload) => updateOrderStatus(order.id, payload)}
        />
      )}
    </div>
  );
}
