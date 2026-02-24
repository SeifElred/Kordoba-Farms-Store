"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { ORDER_TEMPLATE_PRESETS } from "@/lib/order-template-presets";
import type { OrderTemplatePresetId } from "@/lib/order-template-presets";

const KNOWN_KEYS = [
  "cities",
  "whatsapp_link",
  "delivery_transport_note",
  "order_message_template",
  "animal_image_sheep",
  "animal_image_goat",
] as const;

const KEY_LABELS: Record<string, string> = {
  whatsapp_link: "WhatsApp link (used for “Complete order via WhatsApp” on cart)",
  delivery_transport_note: "Delivery note (e.g. “We use Lalamove for delivery” — shown in order step 5)",
  order_message_template: "Order message template (placeholders filled when customer completes via WhatsApp)",
  cities: "Cities (JSON array, optional — for city selector if used)",
  animal_image_sheep: "Sheep image URL (Step 2 – animal choice)",
  animal_image_goat: "Goat image URL (Step 2 – animal choice)",
};

const ORDER_MESSAGE_PLACEHOLDERS = "{{name}}, {{phone}}, {{address}}, {{email}}, {{productLabel}}, {{minPrice}}, {{maxPrice}}, {{priceRange}}, {{slaughterDate}}, {{distributionType}}, {{purpose}}, {{weightLine}}, {{weightSelection}}, {{specialCut}}, {{orderIncludes}}, {{videoProof}}, {{note}}";

export function AdminSettingsClient() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/content/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === "object") setSettings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function startEdit(key: string) {
    setEditing(key);
    setEditValue(settings[key] ?? "");
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    const res = await fetch("/api/admin/content/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: editing, value: editValue }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Failed to save");
      return;
    }
    setSettings((prev) => ({ ...prev, [editing]: editValue }));
    setEditing(null);
  }

  const inputClass = "w-full rounded-lg border border-[#334155] bg-[#0f172a] px-3 py-2 text-sm text-white focus:border-[#c8a951] focus:outline-none focus:ring-1 focus:ring-[#c8a951]";
  const labelClass = "mb-1 block text-sm font-medium text-[#94a3b8]";

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-[#334155] bg-[#1e293b] py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#94a3b8]" />
      </div>
    );
  }

  const keys: string[] = [...KNOWN_KEYS, ...Object.keys(settings).filter((k) => !KNOWN_KEYS.includes(k as (typeof KNOWN_KEYS)[number]))];

  return (
    <div className="max-w-2xl space-y-6">
      {keys.map((key) => (
        <div key={key} className="rounded-xl border border-[#334155] bg-[#1e293b] p-4">
          <label className={labelClass}>{KEY_LABELS[key] ?? key}</label>
          {editing === key ? (
            <div className="space-y-2">
              {key === "cities" ? (
                <textarea
                  className={inputClass + " min-h-[120px] font-mono text-xs"}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder='["City A", "City B"]'
                />
              ) : key === "order_message_template" ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-[#64748b]">Apply preset:</span>
                    <select
                      className="rounded-lg border border-[#334155] bg-[#0f172a] px-2 py-1.5 text-sm text-white focus:border-[#c8a951] focus:outline-none"
                      value=""
                      onChange={(e) => {
                        const id = e.target.value as OrderTemplatePresetId | "";
                        if (!id) return;
                        const preset = ORDER_TEMPLATE_PRESETS.find((p) => p.id === id);
                        if (preset) setEditValue(preset.template);
                        e.target.value = "";
                      }}
                    >
                      <option value="">— Choose preset —</option>
                      {ORDER_TEMPLATE_PRESETS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-[#64748b]">Then edit if needed and Save.</span>
                  </div>
                  <textarea
                    className={inputClass + " min-h-[200px] font-mono text-xs"}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder={"*New order*\nName: {{name}}\nPhone: {{phone}}\n..."}
                  />
                  <p className="text-xs text-[#64748b]">
                    Placeholders: {ORDER_MESSAGE_PLACEHOLDERS}. Leave empty to use default format.
                  </p>
                </div>
              ) : (
                <input
                  type="text"
                  className={inputClass}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder={
                    key === "whatsapp_link"
                      ? "https://wa.me/..."
                      : key === "delivery_transport_note"
                        ? "We use LalaMove for transportation."
                        : key === "animal_image_sheep" || key === "animal_image_goat"
                          ? "https://... (image URL for animal card)"
                          : "Value"
                  }
                />
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="rounded-lg bg-[#0F3D2E] px-3 py-1.5 text-sm text-white hover:bg-[#14533a] disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-lg border border-[#334155] px-3 py-1.5 text-sm text-[#94a3b8] hover:bg-[#334155]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-4">
              <pre className="flex-1 overflow-x-auto rounded bg-[#0f172a] p-3 text-xs text-[#94a3b8] whitespace-pre-wrap break-all">
                {settings[key] ?? "(not set)"}
              </pre>
              <button
                type="button"
                onClick={() => startEdit(key)}
                className="shrink-0 rounded-lg border border-[#334155] px-3 py-1.5 text-sm text-[#94a3b8] hover:bg-[#334155] hover:text-white"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      ))}
      {keys.length === 0 && (
        <div className="rounded-xl border border-[#334155] bg-[#1e293b] p-12 text-center text-[#94a3b8]">
          No settings. Run the content seed: npx tsx prisma/seed-content.ts
        </div>
      )}
    </div>
  );
}
