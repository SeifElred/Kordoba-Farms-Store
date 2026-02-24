import { AdminSpecialCutsClient } from "@/components/admin/AdminSpecialCutsClient";

export default function AdminSpecialCutsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Special Cuts</h1>
        <p className="mt-1 text-[#94a3b8]">Edit special cut options (Leg, Shoulder, etc.) — labels, images, videos</p>
      </div>
      <AdminSpecialCutsClient />
    </div>
  );
}
