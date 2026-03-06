"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RefreshCw,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import type { OrderListItem } from "@/types/admin-orders";
import { AdminPageHeader } from "./AdminPageHeader";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "short",
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

const PAGE_SIZES = [25, 50, 100];

export function AdminOrdersClient() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState<string>("createdAt_desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (searchDebounced) params.set("q", searchDebounced);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    params.set("sort", sort);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    fetch(`/api/admin/orders?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setOrders(Array.isArray(data?.orders) ? data.orders : []);
        setTotalCount(Number(data?.totalCount) ?? 0);
      })
      .catch(() => {
        setOrders([]);
        setTotalCount(0);
      })
      .finally(() => setLoading(false));
  }, [typeFilter, statusFilter, searchDebounced, dateFrom, dateTo, sort, page, pageSize]);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [typeFilter, statusFilter, searchDebounced, dateFrom, dateTo, sort, pageSize]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  function exportCSV() {
    const headers = [
      "Type",
      "ID",
      "Name",
      "Email",
      "Phone",
      "Total",
      "Payment",
      "Extra",
      "Created",
    ];
    const rows = orders.map((o) => {
      const total = o.type === "cart" ? formatMYR(o.totalCents) : formatMYRPrice(o.totalPrice);
      const extra =
        o.type === "cart"
          ? `${o.itemCount} items · ${o.country} · ${o.locale}`
          : `${o.orderStatus} · ${o.purpose}`;
      return [
        o.type,
        o.id,
        o.name,
        o.email,
        o.phone,
        total,
        o.paymentStatus,
        extra,
        formatDate(o.createdAt),
      ];
    });
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded");
  }

  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <AdminPageHeader
          title="Orders"
          description={
            totalCount === 0
              ? "No orders yet. Cart and WhatsApp orders will appear here."
              : `Showing ${start}–${end} of ${totalCount} orders. Click a row or View to open details.`
          }
        />
        <Button
          variant="outline"
          size="sm"
          onClick={exportCSV}
          disabled={orders.length === 0}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/30 px-4 py-3">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, email, phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 bg-background"
            />
          </div>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-9 w-[130px] bg-background"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-9 w-[130px] bg-background"
          />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-9 w-[110px] bg-background">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="cart">Cart</SelectItem>
              <SelectItem value="single">Single</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[110px] bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="h-9 w-[120px] bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt_desc">Newest</SelectItem>
              <SelectItem value="createdAt_asc">Oldest</SelectItem>
            </SelectContent>
          </Select>
          <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
            <SelectTrigger className="h-9 w-[70px] bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => fetchOrders()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {loading ? (
          <div className="p-4">
            <Skeleton className="h-10 w-full" />
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="mt-2 h-12 w-full" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-medium text-foreground">No orders found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {(searchDebounced || dateFrom || dateTo || statusFilter !== "all")
                ? "Try clearing filters"
                : "Orders will appear here"}
            </p>
            {(searchDebounced || dateFrom || dateTo || statusFilter !== "all") && (
              <Button
                variant="link"
                className="mt-2 h-auto p-0 text-sm"
                onClick={() => {
                  setSearch("");
                  setDateFrom("");
                  setDateTo("");
                  setStatusFilter("all");
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Contact</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[100px]">Payment</TableHead>
                  <TableHead className="hidden lg:table-cell text-muted-foreground">Details</TableHead>
                  <TableHead className="text-right w-[120px]">Date</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow
                    key={`${o.type}-${o.id}`}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/admin/orders/${o.id}`)}
                  >
                    <TableCell>
                      {o.type === "cart" ? (
                        <Badge variant="secondary" className="font-normal">
                          Cart
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="font-normal">
                          Single
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{o.name}</div>
                      <div className="truncate text-xs text-muted-foreground max-w-[200px]">
                        {o.email}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {o.phone}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {o.type === "cart"
                        ? formatMYR(o.totalCents)
                        : formatMYRPrice(o.totalPrice)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          o.paymentStatus === "paid"
                            ? "default"
                            : o.paymentStatus === "failed"
                              ? "destructive"
                              : "secondary"
                        }
                        className="font-normal"
                      >
                        {o.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                      {o.type === "cart"
                        ? `${o.itemCount} items · ${o.locale}`
                        : `${o.orderStatus}`}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-xs tabular-nums">
                      {formatDate(o.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link href={`/admin/orders/${o.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}