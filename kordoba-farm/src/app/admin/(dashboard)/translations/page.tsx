import { AdminTranslationsClient } from "@/components/admin/AdminTranslationsClient";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminTranslationsPage() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <AdminPageHeader
        title="Translations"
        description="Override copy per locale (en, ar, ms, zh). Values here override the JSON messages. Keys use dot notation (e.g. purpose.qurban)."
      />
      <AdminTranslationsClient />
    </div>
  );
}
