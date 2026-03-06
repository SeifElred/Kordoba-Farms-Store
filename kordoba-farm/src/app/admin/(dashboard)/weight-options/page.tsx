import { AdminWeightOptionsClient } from "@/components/admin/AdminWeightOptionsClient";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminWeightOptionsPage() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <AdminPageHeader
        title="Weight options"
        description="Add weights and prices here. Then enable or disable them per product in Products."
      />
      <AdminWeightOptionsClient />
    </div>
  );
}
