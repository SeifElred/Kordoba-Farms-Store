import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Layers, Scissors, Scale, Palette, Settings, Languages } from "lucide-react";

export default async function AdminDashboardPage() {
  const ok = await isAdmin();
  if (!ok) redirect("/admin/login");

  const [productCount, specialCutsCount, weightOptionsCount] = await Promise.all([
    prisma.product.count(),
    prisma.specialCut.count(),
    prisma.weightOption.count(),
  ]);

  const links = [
    { href: "/admin/products", label: "Products", description: "Product types (½ Sheep, Whole Goat, etc.) and price ranges", icon: Layers, count: productCount },
    { href: "/admin/special-cuts", label: "Special cuts", description: "Cut options shown in the order flow (leg, shoulder, whole)", icon: Scissors, count: specialCutsCount },
    { href: "/admin/weight-options", label: "Weight options", description: "Weights and prices; enable/disable per product in Products", icon: Scale, count: weightOptionsCount },
    { href: "/admin/themes", label: "Themes", description: "Banner, hero text, and order message template", icon: Palette },
    { href: "/admin/settings", label: "Settings", description: "WhatsApp link, delivery note, order message template", icon: Settings },
    { href: "/admin/translations", label: "Translations", description: "Override copy per locale (DB overrides JSON)", icon: Languages },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-[#94a3b8]">Manage content for the order flow and site</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map(({ href, label, description, icon: Icon, count }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col rounded-xl border border-[#334155] bg-[#1e293b] p-5 transition-colors hover:border-[#475569] hover:bg-[#334155]/50"
          >
            <div className="flex items-center justify-between gap-2">
              <Icon className="h-6 w-6 text-[#c8a951]" aria-hidden />
              {count != null && (
                <span className="text-sm font-medium text-[#94a3b8]">{count}</span>
              )}
            </div>
            <h2 className="mt-2 font-semibold text-white">{label}</h2>
            <p className="mt-1 text-sm text-[#94a3b8]">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
