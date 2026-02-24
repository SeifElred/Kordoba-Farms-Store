"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Pencil, Loader2 } from "lucide-react";

const LOCALES = [
  { code: "en", label: "EN" },
  { code: "ar", label: "AR" },
  { code: "ms", label: "MS" },
  { code: "zh", label: "中文" },
] as const;

const OCCASIONS = [
  { key: "aqiqah", label: "Aqiqah" },
  { key: "qurban", label: "Qurban" },
  { key: "personal", label: "Personal" },
] as const;

type SpecialCut = {
  id: string;
  cutId: string;
  label: string;
  imageUrl: string;
  imageUrlByLocale?: string | null;
  videoUrl: string | null;
  sortOrder: number;
};

type SpecialCutForm = Omit<Partial<SpecialCut>, "imageUrlByLocale"> & { imageUrlByLocale?: Record<string, string> };

export function AdminSpecialCutsClient() {
  const [cuts, setCuts] = useState<SpecialCut[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<SpecialCutForm>({});

  function parseImageUrlByLocale(raw: string | null | undefined): Record<string, string> {
    if (!raw || typeof raw !== "string") return {};
    try {
      const o = JSON.parse(raw) as Record<string, string>;
      return o && typeof o === "object" ? o : {};
    } catch {
      return {};
    }
  }

  useEffect(() => {
    fetch("/api/admin/content/special-cuts")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCuts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function startEdit(c: SpecialCut) {
    setEditing(c.cutId);
    setForm({
      label: c.label,
      imageUrl: c.imageUrl,
      imageUrlByLocale: parseImageUrlByLocale(c.imageUrlByLocale),
      videoUrl: c.videoUrl ?? "",
      sortOrder: c.sortOrder,
    });
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    const data: Record<string, unknown> = { ...form, videoUrl: (form.videoUrl as string)?.trim() || null };
    if (data.imageUrlByLocale && Object.keys(data.imageUrlByLocale as Record<string, string>).length === 0) delete data.imageUrlByLocale;
    const res = await fetch("/api/admin/content/special-cuts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cutId: editing, data }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Failed to save");
      return;
    }
    const updated = await res.json();
    setCuts((prev) => prev.map((c) => (c.cutId === editing ? updated : c)));
    setEditing(null);
  }

  const inputClass =
    "w-full rounded-lg border border-[#334155] bg-[#0f172a] px-3 py-2 text-sm text-white focus:border-[#c8a951] focus:outline-none focus:ring-1 focus:ring-[#c8a951]";

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-[#334155] bg-[#1e293b] py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#94a3b8]" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#334155] bg-[#1e293b] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#334155] text-left text-[#94a3b8]">
              <th className="p-4 font-medium">Cut ID</th>
              <th className="p-4 font-medium">Label</th>
              <th className="p-4 font-medium">Image</th>
              <th className="p-4 font-medium">Video</th>
              <th className="p-4 font-medium">Order</th>
              <th className="p-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cuts.map((c) => (
              <tr key={c.id} className="border-b border-[#334155]">
                <td className="p-4 font-mono text-white">{c.cutId}</td>
                {editing === c.cutId ? (
                  <>
                    <td className="p-4">
                      <input className={inputClass} value={form.label ?? ""} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} placeholder="Label" />
                    </td>
                    <td className="p-4">
                      <div className="space-y-3">
                        <p className="text-xs text-[#94a3b8]">
                          Images per occasion & language (URL). Leave empty to use global image below.
                        </p>
                        <div className="space-y-3">
                          {OCCASIONS.map(({ key: occKey, label: occLabel }) => (
                            <div key={occKey} className="space-y-1">
                              <p className="text-xs font-medium text-[#e2e8f0]">{occLabel}</p>
                              <div className="flex flex-wrap gap-3">
                                {LOCALES.map(({ code, label }) => {
                                  const mapKey = `${occKey}:${code}`;
                                  const url = form.imageUrlByLocale?.[mapKey] ?? "";
                                  return (
                                    <div key={mapKey} className="flex flex-col items-start gap-1">
                                      <span className="text-[11px] text-[#64748b]">{label}</span>
                                      <input
                                        className={inputClass}
                                        value={url}
                                        onChange={(e) =>
                                          setForm((f) => ({
                                            ...f,
                                            imageUrlByLocale: {
                                              ...(f.imageUrlByLocale ?? {}),
                                              [mapKey]: e.target.value,
                                            },
                                          }))
                                        }
                                        placeholder="https://... or /uploads/..."
                                      />
                                      {url && (
                                        <Image
                                          src={url}
                                          alt=""
                                          width={64}
                                          height={64}
                                          unoptimized
                                          className="h-16 w-16 rounded-lg border border-[#334155] object-cover bg-[#0f172a]"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = "none";
                                          }}
                                        />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-[#64748b]">
                          Global image URL (fallback for all occasions & languages):
                        </p>
                        <input
                          className={inputClass}
                          value={form.imageUrl ?? ""}
                          onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                          placeholder="https://... or /uploads/..."
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <input className={inputClass} value={(form.videoUrl as string) ?? ""} onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))} placeholder="Video URL" />
                    </td>
                    <td className="p-4">
                      <input type="number" className={inputClass} value={form.sortOrder ?? 0} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
                    </td>
                    <td className="p-4 text-right">
                      <button type="button" onClick={save} disabled={saving} className="rounded-lg bg-[#0F3D2E] px-3 py-1.5 text-sm text-white hover:bg-[#14533a] disabled:opacity-50">
                        {saving ? "Saving…" : "Save"}
                      </button>
                      <button type="button" onClick={() => setEditing(null)} className="ml-2 rounded-lg border border-[#334155] px-3 py-1.5 text-sm text-[#94a3b8] hover:bg-[#334155]">
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-4 text-white">{c.label}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Image
                          src={c.imageUrl}
                          alt=""
                          width={56}
                          height={56}
                          unoptimized
                          className="h-14 w-14 rounded-lg border border-[#334155] object-cover bg-[#0f172a] shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                        <a href={c.imageUrl} target="_blank" rel="noopener noreferrer" className="text-[#c8a951] hover:underline truncate block max-w-[140px] text-xs">
                          Change in edit
                        </a>
                      </div>
                    </td>
                    <td className="p-4">{c.videoUrl ? <a href={c.videoUrl} target="_blank" rel="noopener noreferrer" className="text-[#c8a951] hover:underline truncate block max-w-[180px]">{c.videoUrl}</a> : <span className="text-[#64748b]">—</span>}</td>
                    <td className="p-4 text-white">{c.sortOrder}</td>
                    <td className="p-4 text-right">
                      <button type="button" onClick={() => startEdit(c)} className="rounded-lg border border-[#334155] p-1.5 text-[#94a3b8] hover:bg-[#334155] hover:text-white" aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {cuts.length === 0 && <div className="p-12 text-center text-[#94a3b8]">No special cuts. Run: npx tsx prisma/seed-content.ts</div>}
    </div>
  );
}
