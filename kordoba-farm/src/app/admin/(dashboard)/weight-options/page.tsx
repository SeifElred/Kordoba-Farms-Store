import { AdminWeightOptionsClient } from "@/components/admin/AdminWeightOptionsClient";

export default function AdminWeightOptionsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Weight options</h1>
        <p className="mt-1 text-[#94a3b8]">Add weights and prices here. Then enable or disable them per product in Products.</p>
      </div>
      <AdminWeightOptionsClient />
    </div>
  );
}
