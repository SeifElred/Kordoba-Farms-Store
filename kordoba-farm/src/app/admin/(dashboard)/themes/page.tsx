import { AdminThemesClient } from "@/components/admin/AdminThemesClient";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminThemesPage() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <AdminPageHeader
        title="Themes"
        description="Switch the whole site to a full design theme. Default = green & cream. Ramadan = night blues, gold. Eid = green & gold. Each theme has its own banner, hero text, and WhatsApp order message."
      />
      <AdminThemesClient />
    </div>
  );
}
