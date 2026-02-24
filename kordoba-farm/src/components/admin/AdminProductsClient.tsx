"use client";

import { useEffect, useState, useRef } from "react";
import React from "react";
import { Pencil, Loader2, Upload } from "lucide-react";

const LOCALES = [
  { code: "en", label: "EN" },
  { code: "ar", label: "AR" },
  { code: "ms", label: "MS" },
  { code: "zh", label: "中文" },
] as const;

type Product = {
  id: string;
  productType: string;
  label: string;
  minPrice: number;
  maxPrice: number;
  imageUrl: string;
  imageUrlByLocale?: string | null;
  sortOrder: number;
};

type GlobalWeightOption = { id: string; label: string; price: number; sortOrder: number };

export function AdminProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Product> & { imageUrlByLocale?: Record<string, string> }>({});
  const [globalWeightOptions, setGlobalWeightOptions] = useState<GlobalWeightOption[]>([]);
  const [enabledWeightIds, setEnabledWeightIds] = useState<string[]>([]);
  const [savingWeights, setSavingWeights] = useState(false);
  const [uploadingLocale, setUploadingLocale] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    fetch("/api/admin/content/products")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function parseImageUrlByLocale(raw: string | null | undefined): Record<string, string> {
  if (!raw || typeof raw !== "string") return {};
  try {
    const o = JSON.parse(raw) as Record<string, string>;
    return o && typeof o === "object" ? o : {};
  } catch {
    return {};
  }
}

  async function startEdit(p: Product) {
    setEditing(p.productType);
    setForm({
      label: p.label,
      minPrice: p.minPrice,
      maxPrice: p.maxPrice,
      imageUrl: p.imageUrl,
      imageUrlByLocale: parseImageUrlByLocale(p.imageUrlByLocale),
      sortOrder: p.sortOrder,
    });
    const [globalRes, enabledRes] = await Promise.all([
      fetch("/api/admin/content/weight-options"),
      fetch(`/api/admin/content/products/${encodeURIComponent(p.productType)}/weights`),
    ]);
    const globalData = await globalRes.json().catch(() => []);
    const enabledData = await enabledRes.json().catch(() => []);
    setGlobalWeightOptions(Array.isArray(globalData) ? globalData : []);
    setEnabledWeightIds(Array.isArray(enabledData) ? enabledData.map((w: { id: string }) => w.id) : []);
  }

  function toggleWeightForProduct(weightId: string) {
    setEnabledWeightIds((prev) =>
      prev.includes(weightId) ? prev.filter((id) => id !== weightId) : [...prev, weightId]
    );
  }

  async function saveWeights() {
    if (!editing) return;
    setSavingWeights(true);
    const res = await fetch(`/api/admin/content/products/${encodeURIComponent(editing)}/weights`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weightOptionIds: enabledWeightIds }),
    });
    setSavingWeights(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Failed to save weights");
      return;
    }
    const data = await res.json();
    setEnabledWeightIds(Array.isArray(data) ? data.map((w: { id: string }) => w.id) : []);
  }

  async function handleImageUpload(locale: string, file: File) {
    setUploadingLocale(locale);
    const fd = new FormData();
    fd.set("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    setUploadingLocale(null);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Upload failed");
      return;
    }
    const { url } = await res.json();
    if (url) {
      setForm((f) => ({
        ...f,
        imageUrlByLocale: { ...(f.imageUrlByLocale ?? {}), [locale]: url },
      }));
    }
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    const payload = { ...form };
    if (payload.imageUrlByLocale && Object.keys(payload.imageUrlByLocale).length === 0) delete payload.imageUrlByLocale;
    const res = await fetch("/api/admin/content/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productType: editing, data: payload }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Failed to save");
      return;
    }
    const updated = await res.json();
    setProducts((prev) => prev.map((p) => (p.productType === editing ? updated : p)));
    setEditing(null);
  }

  const inputClass = "w-full rounded-lg border border-[#334155] bg-[#0f172a] px-3 py-2 text-sm text-white focus:border-[#c8a951] focus:outline-none focus:ring-1 focus:ring-[#c8a951]";

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
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Label</th>
              <th className="p-4 font-medium">Min / Max price</th>
              <th className="p-4 font-medium">Image</th>
              <th className="p-4 font-medium">Order</th>
              <th className="p-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <React.Fragment key={p.id}>
              <tr className="border-b border-[#334155]">
                <td className="p-4 font-mono text-white">{p.productType}</td>
                {editing === p.productType ? (
                  <>
                    <td className="p-4">
                      <input
                        className={inputClass}
                        value={form.label ?? ""}
                        onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                        placeholder="Label"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step={0.01}
                          className={inputClass}
                          value={form.minPrice ?? ""}
                          onChange={(e) => setForm((f) => ({ ...f, minPrice: Number(e.target.value) }))}
                          placeholder="Min"
                        />
                        <input
                          type="number"
                          step={0.01}
                          className={inputClass}
                          value={form.maxPrice ?? ""}
                          onChange={(e) => setForm((f) => ({ ...f, maxPrice: Number(e.target.value) }))}
                          placeholder="Max"
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-2">
                        <p className="text-xs text-[#94a3b8]">Images per language (upload; fallback below)</p>
                        <div className="flex flex-wrap gap-3">
                          {LOCALES.map(({ code, label }) => {
                            const url = form.imageUrlByLocale?.[code] ?? "";
                            return (
                              <div key={code} className="flex flex-col items-start gap-1">
                                <span className="text-xs text-[#64748b]">{label}</span>
                                <input
                                  ref={(el) => { fileInputRefs.current[code] = el; }}
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp,image/gif"
                                  className="hidden"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleImageUpload(code, f);
                                    e.target.value = "";
                                  }}
                                />
                                {url ? (
                                  <div className="relative">
                                    <img src={url} alt="" className="h-16 w-16 rounded-lg border border-[#334155] object-cover bg-[#0f172a]" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                    <button
                                      type="button"
                                      onClick={() => setForm((f) => ({ ...f, imageUrlByLocale: { ...(f.imageUrlByLocale ?? {}), [code]: "" } }))}
                                      className="absolute -top-1 -right-1 rounded-full bg-[#334155] p-0.5 text-[#94a3b8] hover:bg-red-600 hover:text-white text-xs"
                                      aria-label="Remove"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={uploadingLocale !== null}
                                    onClick={() => fileInputRefs.current[code]?.click()}
                                    className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-[#334155] bg-[#0f172a] text-[#64748b] hover:border-[#c8a951] hover:text-[#c8a951] disabled:opacity-50"
                                  >
                                    {uploadingLocale === code ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-xs text-[#64748b]">Fallback image (if no locale set):</p>
                        <input
                          className={inputClass}
                          value={form.imageUrl ?? ""}
                          onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                          placeholder="/uploads/... or URL (used when locale has no image)"
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <input
                        type="number"
                        className={inputClass}
                        value={form.sortOrder ?? 0}
                        onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                      />
                    </td>
                    <td className="p-4 text-right">
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
                        className="ml-2 rounded-lg border border-[#334155] px-3 py-1.5 text-sm text-[#94a3b8] hover:bg-[#334155]"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-4 text-white">{p.label}</td>
                    <td className="p-4 text-white">{p.minPrice} / {p.maxPrice}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt=""
                          className="h-14 w-14 rounded-lg border border-[#334155] object-cover bg-[#0f172a] shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                        <a href={p.imageUrl} target="_blank" rel="noopener noreferrer" className="text-[#c8a951] hover:underline truncate block max-w-[140px] text-xs">
                          Change in edit
                        </a>
                      </div>
                    </td>
                    <td className="p-4 text-white">{p.sortOrder}</td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => startEdit(p)}
                        className="rounded-lg border border-[#334155] p-1.5 text-[#94a3b8] hover:bg-[#334155] hover:text-white"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </td>
                  </>
                )}
              </tr>
              {editing === p.productType && (
                <tr className="border-b border-[#334155] bg-[#0f172a]/60">
                  <td colSpan={6} className="p-4">
                    <div className="rounded-lg border border-[#334155] bg-[#1e293b] p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-[#94a3b8]">Weights customers can select (enable/disable from Weight options)</span>
                        <button type="button" onClick={saveWeights} disabled={savingWeights} className="rounded-lg bg-[#0F3D2E] px-2 py-1.5 text-xs text-white hover:bg-[#14533a] disabled:opacity-50">
                          {savingWeights ? "Saving…" : "Save"}
                        </button>
                      </div>
                      {globalWeightOptions.length === 0 ? (
                        <p className="text-xs text-[#64748b]">No weight options yet. Add them in <strong>Weight options</strong> first, then enable them here.</p>
                      ) : (
                        <div className="flex flex-wrap gap-3">
                          {globalWeightOptions.map((w) => {
                            const enabled = enabledWeightIds.includes(w.id);
                            return (
                              <label key={w.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#334155] px-3 py-2 hover:bg-[#334155]/50">
                                <input
                                  type="checkbox"
                                  checked={enabled}
                                  onChange={() => toggleWeightForProduct(w.id)}
                                  className="h-4 w-4 rounded border-[#334155]"
                                />
                                <span className="text-sm text-white">{w.label}</span>
                                <span className="text-xs text-[#c8a951]">{w.price.toFixed(2)} MYR</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {products.length === 0 && (
        <div className="p-12 text-center text-[#94a3b8]">No products. Run the content seed: npx tsx prisma/seed-content.ts</div>
      )}
    </div>
  );
}
