import { AdminProductsClient } from "@/components/admin/AdminProductsClient";

export default function AdminProductsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Products</h1>
        <p className="mt-1 text-[#94a3b8]">Edit product types (½ Sheep, Whole Goat, etc.) — labels, price range, images</p>
      </div>
      <AdminProductsClient />
    </div>
  );
}
