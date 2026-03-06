import { AdminProductsClient } from "@/components/admin/AdminProductsClient";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminProductsPage() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <AdminPageHeader
        title="Products"
        description="Edit product types (½ Sheep, Whole Goat, etc.) — labels, price range, images"
      />
      <AdminProductsClient />
    </div>
  );
}
