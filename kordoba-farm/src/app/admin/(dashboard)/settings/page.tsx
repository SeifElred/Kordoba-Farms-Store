import { AdminSettingsClient } from "@/components/admin/AdminSettingsClient";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <AdminPageHeader
        title="Settings"
        description="WhatsApp link, delivery note (e.g. Lalamove), and order message template for cart."
      />
      <AdminSettingsClient />
    </div>
  );
}
