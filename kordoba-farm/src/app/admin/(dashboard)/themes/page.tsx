import { AdminThemesClient } from "@/components/admin/AdminThemesClient";

export default function AdminThemesPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Themes</h1>
        <p className="mt-1 text-[#94a3b8]">
          Switch the whole site to a full design theme so visitors feel the vibe. Default = standard green & cream. Ramadan = night blues, gold accents, calm spiritual look. Eid = green & gold, festive celebratory look. Each theme also has its own banner, hero text, and WhatsApp order message.
        </p>
      </div>
      <AdminThemesClient />
    </div>
  );
}
