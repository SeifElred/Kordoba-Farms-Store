import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import Link from "next/link";
import { LayoutDashboard, LogOut, Layers, Scissors, Languages, Settings, Palette, Scale } from "lucide-react";

export default async function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const ok = await isAdmin();
  if (!ok) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r border-[#334155] bg-[#1e293b]">
        <div className="flex h-16 items-center border-b border-[#334155] px-5">
          <Link href="/admin" className="text-lg font-bold text-white">
            Kordoba Admin
          </Link>
        </div>
        <nav className="flex-1 space-y-0.5 p-3">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#94a3b8] transition-colors hover:bg-[#334155] hover:text-white"
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
          <Link
            href="/admin/products"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#94a3b8] transition-colors hover:bg-[#334155] hover:text-white"
          >
            <Layers className="h-5 w-5" />
            Products
          </Link>
          <Link
            href="/admin/special-cuts"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#94a3b8] transition-colors hover:bg-[#334155] hover:text-white"
          >
            <Scissors className="h-5 w-5" />
            Special Cuts
          </Link>
          <Link
            href="/admin/weight-options"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#94a3b8] transition-colors hover:bg-[#334155] hover:text-white"
          >
            <Scale className="h-5 w-5" />
            Weight options
          </Link>
          <Link
            href="/admin/translations"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#94a3b8] transition-colors hover:bg-[#334155] hover:text-white"
          >
            <Languages className="h-5 w-5" />
            Translations
          </Link>
          <Link
            href="/admin/themes"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#94a3b8] transition-colors hover:bg-[#334155] hover:text-white"
          >
            <Palette className="h-5 w-5" />
            Themes
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#94a3b8] transition-colors hover:bg-[#334155] hover:text-white"
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
        </nav>
        <div className="border-t border-[#334155] p-3">
          <form action="/api/admin/logout" method="POST">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#94a3b8] transition-colors hover:bg-[#334155] hover:text-red-300"
            >
              <LogOut className="h-5 w-5" />
              Sign out
            </button>
          </form>
        </div>
      </aside>
      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
