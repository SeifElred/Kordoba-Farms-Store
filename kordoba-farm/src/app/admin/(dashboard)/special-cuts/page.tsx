import { AdminSpecialCutsClient } from "@/components/admin/AdminSpecialCutsClient";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminSpecialCutsPage() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <AdminPageHeader
        title="Special Cuts"
        description="Edit special cut options (Leg, Shoulder, etc.) — labels, images, videos"
      />
      <AdminSpecialCutsClient />
    </div>
  );
}
