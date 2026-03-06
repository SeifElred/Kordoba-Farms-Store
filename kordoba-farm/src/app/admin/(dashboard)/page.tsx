import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Layers,
  Scissors,
  Scale,
  Palette,
  Settings,
  Languages,
  ShoppingBag,
  ArrowRight,
  Package,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";

export default async function AdminDashboardPage() {
  const ok = await isAdmin();
  if (!ok) redirect("/admin/login");

  const [
    productCount,
    specialCutsCount,
    weightOptionsCount,
    cartOrderTotal,
    cartOrderPaid,
    singleOrderTotal,
    recentCartOrders,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.specialCut.count(),
    prisma.weightOption.count(),
    prisma.cartOrder.count(),
    prisma.cartOrder.count({ where: { paymentStatus: "paid" } }),
    prisma.order.count(),
    prisma.cartOrder.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, totalCents: true, paymentStatus: true, createdAt: true },
    }),
  ]);

  const totalOrders = cartOrderTotal + singleOrderTotal;

  const links = [
    { href: "/admin/orders", label: "Orders", description: "View and manage all orders", icon: ShoppingBag, count: totalOrders },
    { href: "/admin/products", label: "Products", description: "Product types and price ranges", icon: Layers, count: productCount },
    { href: "/admin/special-cuts", label: "Special cuts", description: "Cut options for the order flow", icon: Scissors, count: specialCutsCount },
    { href: "/admin/weight-options", label: "Weight options", description: "Weights and prices per product", icon: Scale, count: weightOptionsCount },
    { href: "/admin/themes", label: "Themes", description: "Banner, hero, and message templates", icon: Palette },
    { href: "/admin/settings", label: "Settings", description: "WhatsApp, delivery, order template", icon: Settings },
    { href: "/admin/translations", label: "Translations", description: "Locale overrides", icon: Languages },
  ];

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8">
      <AdminPageHeader
        title="Dashboard"
        description="Overview of orders and catalog. Use the links below to manage content and settings."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Total orders</CardDescription>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {totalOrders}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Cart + single</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Cart orders paid</CardDescription>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {cartOrderPaid}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Online payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Products</CardDescription>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {productCount}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Product types</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Weight options</CardDescription>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {weightOptionsCount}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Enabled per product</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map(({ href, label, description, icon: Icon, count }) => (
          <Link key={href} href={href}>
            <Card className="h-full transition-colors hover:bg-muted/50 hover:border-primary/20">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-medium">{label}</CardTitle>
                    <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {count != null && (
                    <Badge variant="secondary" className="tabular-nums font-medium">
                      {count}
                    </Badge>
                  )}
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Recent orders</CardTitle>
            <CardDescription>Latest cart orders. Open an order to view details and update status.</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/orders">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentCartOrders.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No orders yet. Orders will appear here when customers place cart or WhatsApp orders.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="w-24 px-4 py-3 text-right font-medium text-muted-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentCartOrders.map((o) => (
                    <tr
                      key={o.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 font-medium">{o.name}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        RM {(o.totalCents / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={o.paymentStatus === "paid" ? "default" : "secondary"}
                          className="font-normal"
                        >
                          {o.paymentStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/orders/${o.id}`}>View</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
