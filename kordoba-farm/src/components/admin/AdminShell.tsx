import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { AdminSidebar } from "./AdminSidebar";

export default async function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const ok = await isAdmin();
  if (!ok) redirect("/admin/login");

  return (
    <div className="flex h-screen overflow-hidden bg-muted/40">
      <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-card shadow-sm">
        <AdminSidebar />
      </aside>
      <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-background">
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
