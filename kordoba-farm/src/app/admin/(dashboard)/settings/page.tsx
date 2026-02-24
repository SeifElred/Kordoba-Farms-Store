import { AdminSettingsClient } from "@/components/admin/AdminSettingsClient";

export default function AdminSettingsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-[#94a3b8]">WhatsApp link, delivery note (e.g. Lalamove), and order message template for cart.</p>
      </div>
      <AdminSettingsClient />
    </div>
  );
}
