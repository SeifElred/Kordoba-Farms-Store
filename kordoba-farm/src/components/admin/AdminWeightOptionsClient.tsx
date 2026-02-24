"use client";

import { useEffect, useState } from "react";
import { Pencil, Loader2, Trash2 } from "lucide-react";

type WeightOption = {
  id: string;
  label: string;
  price: number;
  sortOrder: number;
};

export function AdminWeightOptionsClient() {
  const [options, setOptions] = useState<WeightOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [editPrice, setEditPrice] = useState("");

  function fetchOptions() {
    fetch("/api/admin/content/weight-options")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setOptions(data);
      })
      .catch(() => {});
  }

  useEffect(() => {
    fetchOptions();
    setLoading(false);
  }, []);

  async function addOption() {
    const label = newLabel.trim();
    const price = Number(newPrice);
    if (!label || Number.isNaN(price) || price < 0) return;
    setSaving(true);
    const res = await fetch("/api/admin/content/weight-options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, price }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Failed to add");
      return;
    }
    setNewLabel("");
    setNewPrice("");
    fetchOptions();
  }

  function startEdit(w: WeightOption) {
    setEditing(w.id);
    setEditLabel(w.label);
    setEditPrice(String(w.price));
  }

  async function saveEdit() {
    if (!editing) return;
    const label = editLabel.trim();
    const price = Number(editPrice);
    if (!label || Number.isNaN(price) || price < 0) return;
    setSaving(true);
    const res = await fetch(`/api/admin/content/weight-options/${encodeURIComponent(editing)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, price }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Failed to save");
      return;
    }
    setEditing(null);
    fetchOptions();
  }

  async function remove(id: string) {
    if (!confirm("Remove this weight option? It will be disabled for all products that use it.")) return;
    setSaving(true);
    await fetch(`/api/admin/content/weight-options/${encodeURIComponent(id)}`, { method: "DELETE" });
    setSaving(false);
    fetchOptions();
  }

  const inputClass = "rounded-lg border border-[#334155] bg-[#0f172a] px-3 py-2 text-sm text-white focus:border-[#c8a951] focus:outline-none focus:ring-1 focus:ring-[#c8a951]";

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-[#334155] bg-[#1e293b] py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#94a3b8]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#334155] bg-[#1e293b] p-4">
        <h2 className="mb-3 text-sm font-medium text-[#94a3b8]">Add weight option</h2>
        <p className="mb-3 text-xs text-[#64748b]">Add a weight (e.g. &quot;12 kg&quot;) and its price. Then enable or disable it per product in Products.</p>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs text-[#94a3b8]">Label</label>
            <input className={inputClass + " w-32"} value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="e.g. 12 kg" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[#94a3b8]">Price (MYR)</label>
            <input type="number" step={0.01} className={inputClass + " w-28"} value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="0" />
          </div>
          <button type="button" onClick={addOption} disabled={saving || !newLabel.trim()} className="rounded-lg bg-[#0F3D2E] px-3 py-2 text-sm text-white hover:bg-[#14533a] disabled:opacity-50">
            {saving ? "Adding…" : "Add"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-[#334155] bg-[#1e293b] overflow-hidden">
        <div className="border-b border-[#334155] px-4 py-3">
          <h2 className="font-medium text-white">All weight options</h2>
          <p className="text-xs text-[#94a3b8]">These are the weights customers can select. Enable or disable them per product in Products.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#334155] text-left text-[#94a3b8]">
                <th className="p-4 font-medium">Label</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {options.map((w) => (
                <tr key={w.id} className="border-b border-[#334155] last:border-0">
                  {editing === w.id ? (
                    <>
                      <td className="p-4">
                        <input className={inputClass + " w-32"} value={editLabel} onChange={(e) => setEditLabel(e.target.value)} />
                      </td>
                      <td className="p-4">
                        <input type="number" step={0.01} className={inputClass + " w-28"} value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                      </td>
                      <td className="p-4 text-right">
                        <button type="button" onClick={saveEdit} disabled={saving} className="rounded-lg bg-[#0F3D2E] px-3 py-1.5 text-sm text-white hover:bg-[#14533a] disabled:opacity-50">Save</button>
                        <button type="button" onClick={() => setEditing(null)} className="ml-2 rounded-lg border border-[#334155] px-3 py-1.5 text-sm text-[#94a3b8] hover:bg-[#334155]">Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-4 text-white">{w.label}</td>
                      <td className="p-4 text-[#c8a951]">{w.price.toFixed(2)} MYR</td>
                      <td className="p-4 text-right">
                        <button type="button" onClick={() => startEdit(w)} className="rounded-lg border border-[#334155] p-1.5 text-[#94a3b8] hover:bg-[#334155] hover:text-white" aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => remove(w.id)} disabled={saving} className="ml-2 rounded-lg border border-[#334155] p-1.5 text-[#94a3b8] hover:bg-[#334155] hover:text-red-300 disabled:opacity-50" aria-label="Remove">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {options.length === 0 && <p className="p-8 text-center text-[#94a3b8]">No weight options yet. Add one above.</p>}
      </div>
    </div>
  );
}
