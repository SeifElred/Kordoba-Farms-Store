"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Loader2, Search } from "lucide-react";

const LOCALES = ["en", "ar", "ms", "zh"] as const;

type Translation = {
  id: string;
  locale: string;
  key: string;
  value: string;
};

export function AdminTranslationsClient() {
  const [locale, setLocale] = useState<string>("en");
  const [query, setQuery] = useState("");
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchTranslations = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ locale });
    if (query) params.set("q", query);
    fetch(`/api/admin/content/translations?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setTranslations(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [locale, query]);

  useEffect(() => {
    fetchTranslations();
  }, [fetchTranslations]);

  function doSearch() {
    fetchTranslations();
  }

  function startEdit(t: Translation) {
    setEditing(t.key);
    setEditValue(t.value);
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    const res = await fetch("/api/admin/content/translations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale, key: editing, value: editValue }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Failed to save");
      return;
    }
    setTranslations((prev) => prev.map((t) => (t.key === editing ? { ...t, value: editValue } : t)));
    setEditing(null);
  }

  const inputClass = "w-full rounded-lg border border-[#334155] bg-[#0f172a] px-3 py-2 text-sm text-white focus:border-[#c8a951] focus:outline-none focus:ring-1 focus:ring-[#c8a951]";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select value={locale} onChange={(e) => setLocale(e.target.value)} className="rounded-lg border border-[#334155] bg-[#1e293b] px-3 py-2 text-sm text-white focus:border-[#c8a951] focus:outline-none">
          {LOCALES.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <div className="flex flex-1 min-w-[200px] gap-2">
          <input type="text" placeholder="Search keys..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doSearch()} className={inputClass} />
          <button type="button" onClick={doSearch} className="rounded-lg border border-[#334155] bg-[#1e293b] px-3 py-2 text-[#94a3b8] hover:bg-[#334155] hover:text-white" aria-label="Search">
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-[#334155] bg-[#1e293b] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#94a3b8]" />
          </div>
        ) : (
          <div className="max-h-[70vh] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[#1e293b] border-b border-[#334155]">
                <tr className="text-left text-[#94a3b8]">
                  <th className="p-4 font-medium">Key</th>
                  <th className="p-4 font-medium">Value</th>
                  <th className="p-4 w-24 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {translations.map((t) => (
                  <tr key={t.id} className="border-b border-[#334155]">
                    <td className="p-4 font-mono text-[#94a3b8] align-top whitespace-nowrap">{t.key}</td>
                    {editing === t.key ? (
                      <td className="p-4" colSpan={2}>
                        <div className="flex gap-2">
                          <textarea className={inputClass + " min-h-[60px]"} value={editValue} onChange={(e) => setEditValue(e.target.value)} rows={2} />
                          <div className="flex flex-col gap-1">
                            <button type="button" onClick={save} disabled={saving} className="rounded-lg bg-[#0F3D2E] px-3 py-1.5 text-sm text-white hover:bg-[#14533a] disabled:opacity-50">{saving ? "…" : "Save"}</button>
                            <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-[#334155] px-3 py-1.5 text-sm text-[#94a3b8] hover:bg-[#334155]">Cancel</button>
                          </div>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td className="p-4 text-white align-top break-words max-w-md">{t.value}</td>
                        <td className="p-4 text-right align-top">
                          <button type="button" onClick={() => startEdit(t)} className="rounded-lg border border-[#334155] p-1.5 text-[#94a3b8] hover:bg-[#334155] hover:text-white" aria-label="Edit">
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
        )}
        {!loading && translations.length === 0 && <div className="p-12 text-center text-[#94a3b8]">No translations. Run: npx tsx prisma/seed-content.ts</div>}
      </div>
    </div>
  );
}
