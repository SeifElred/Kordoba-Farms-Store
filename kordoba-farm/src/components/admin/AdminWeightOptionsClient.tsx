"use client";

import { useEffect, useState } from "react";
import { Pencil, Loader2, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
type WeightOption = {
  id: string;
  label: string;
  price: number;
  sortOrder: number;
  occasionScope?: string | null;
};

export function AdminWeightOptionsClient() {
  const [options, setOptions] = useState<WeightOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newOccasionScope, setNewOccasionScope] = useState<string>("");
  const [editLabel, setEditLabel] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editOccasionScope, setEditOccasionScope] = useState<string>("");

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
    if (!label || Number.isNaN(price) || price < 0) {
      toast.error("Enter a valid label and price (≥ 0)");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/admin/content/weight-options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label,
        price,
        occasionScope: newOccasionScope === "qurban_aqiqah" || newOccasionScope === "personal" ? newOccasionScope : undefined,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || "Failed to add");
      return;
    }
    setNewLabel("");
    setNewPrice("");
    setNewOccasionScope("");
    fetchOptions();
    toast.success("Weight option added");
  }

  function startEdit(w: WeightOption) {
    setEditing(w.id);
    setEditLabel(w.label);
    setEditPrice(String(w.price));
    setEditOccasionScope(w.occasionScope ?? "");
  }

  async function saveEdit() {
    if (!editing) return;
    const label = editLabel.trim();
    const price = Number(editPrice);
    if (!label || Number.isNaN(price) || price < 0) {
      toast.error("Enter a valid label and price (≥ 0)");
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/admin/content/weight-options/${encodeURIComponent(editing)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label,
        price,
        occasionScope: editOccasionScope === "qurban_aqiqah" || editOccasionScope === "personal" ? editOccasionScope : null,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || "Failed to save");
      return;
    }
    setEditing(null);
    fetchOptions();
    toast.success("Saved");
  }

  async function remove(id: string) {
    if (!confirm("Remove this weight option? It will be disabled for all products that use it.")) return;
    setSaving(true);
    await fetch(`/api/admin/content/weight-options/${encodeURIComponent(id)}`, { method: "DELETE" });
    setSaving(false);
    fetchOptions();
    toast.success("Weight option removed");
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add weight option</CardTitle>
          <CardDescription>Label (e.g. 12 kg) and price in MYR. Enable per product in Products.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-label">Label</Label>
              <Input
                id="new-label"
                className="w-40"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g. 28-30 kg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-price">Price (MYR)</Label>
              <Input
                id="new-price"
                type="number"
                step={0.01}
                className="w-28"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-scope">Occasion</Label>
              <select
                id="new-scope"
                className="flex h-9 w-36 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                value={newOccasionScope}
                onChange={(e) => setNewOccasionScope(e.target.value)}
              >
                <option value="">—</option>
                <option value="qurban_aqiqah">Qurban / Aqiqah</option>
                <option value="personal">Personal</option>
              </select>
            </div>
            <Button onClick={addOption} disabled={saving || !newLabel.trim()} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              {saving ? "Adding…" : "Add"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All weight options</CardTitle>
          <CardDescription>Edit or remove. Changes apply to products that use these options.</CardDescription>
        </CardHeader>
        <CardContent>
          {options.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No weight options yet. Add one above.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Label</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Occasion</TableHead>
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {options.map((w) => (
                    <TableRow key={w.id}>
                      {editing === w.id ? (
                        <>
                          <TableCell>
                            <Input
                              className="w-40"
                              value={editLabel}
                              onChange={(e) => setEditLabel(e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step={0.01}
                              className="w-28"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <select
                              className="flex h-9 w-36 rounded-md border border-input bg-transparent px-2 text-sm"
                              value={editOccasionScope}
                              onChange={(e) => setEditOccasionScope(e.target.value)}
                            >
                              <option value="">—</option>
                              <option value="qurban_aqiqah">Qurban / Aqiqah</option>
                              <option value="personal">Personal</option>
                            </select>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" onClick={saveEdit} disabled={saving}>
                                {saving ? "…" : "Save"}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditing(null)}>
                                Cancel
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="font-medium">{w.label}</TableCell>
                          <TableCell className="tabular-nums text-muted-foreground">RM {w.price.toFixed(2)}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {w.occasionScope === "qurban_aqiqah" ? "Qurban / Aqiqah" : w.occasionScope === "personal" ? "Personal" : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(w)} aria-label="Edit">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => remove(w.id)} disabled={saving} aria-label="Remove">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

