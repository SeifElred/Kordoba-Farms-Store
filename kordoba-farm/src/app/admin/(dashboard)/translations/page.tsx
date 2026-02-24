import { AdminTranslationsClient } from "@/components/admin/AdminTranslationsClient";

export default function AdminTranslationsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Translations</h1>
        <p className="mt-1 text-[#94a3b8]">Override copy per locale (en, ar, ms, zh). Values here override the JSON messages. Keys use dot notation (e.g. purpose.qurban).</p>
      </div>
      <AdminTranslationsClient />
    </div>
  );
}
