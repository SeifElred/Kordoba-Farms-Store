"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Pencil, Loader2, X } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";

const OCCASIONS = [
  { key: "aqiqah", label: "Aqiqah" },
  { key: "qurban", label: "Qurban" },
  { key: "personal", label: "Personal" },
] as const;

type Product = {
  id: string;
  productType: string;
  label: string;
  enabled?: boolean;
  imageUrl: string;
  imageUrlByLocale?: string | null;
  sortOrder: number;
  minPrice?: number;
  maxPrice?: number;
};

type ProductForm = Omit<Partial<Product>, "imageUrlByLocale"> & { imageUrlByLocale?: Record<string, string> };

type GlobalWeightOption = { id: string; label: string; price: number; sortOrder: number; occasionScope?: string | null };

function productOccasionBadge(productType: string): string {
  if (productType === "half_sheep" || productType === "half_goat") return "Personal only";
  return "Qurban, Aqiqah, Personal";
}

export function AdminProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProductForm>({});
  const [globalWeightOptions, setGlobalWeightOptions] = useState<GlobalWeightOption[]>([]);
  const [enabledWeightIds, setEnabledWeightIds] = useState<string[]>([]);
  const [savingWeights, setSavingWeights] = useState(false);

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
      enabled: p.enabled ?? true,
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
      toast.error(d.error || "Failed to save weights");
      return;
    }
    const data = await res.json();
    setEnabledWeightIds(Array.isArray(data) ? data.map((w: { id: string }) => w.id) : []);
    toast.success("Weights saved");
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
      toast.error(d.error || "Failed to save");
      return;
    }
    const updated = await res.json();
    setProducts((prev) => prev.map((p) => (p.productType === editing ? updated : p)));
    setEditing(null);
    toast.success("Product saved");
  }

  const editingProduct = editing ? products.find((p) => p.productType === editing) : null;
  const qurbanWeights = globalWeightOptions.filter((w) => w.occasionScope === "qurban_aqiqah");
  const personalWeights = globalWeightOptions.filter((w) => w.occasionScope === "personal");

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No products. Run the content seed: npx tsx prisma/seed-content.ts
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Products</CardTitle>
          <CardDescription>
            Edit label, images, and weight options. Click Edit to open the editor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Type</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-40">Occasion</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead className="w-16">Order</TableHead>
                  <TableHead className="w-20 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow
                    key={p.id}
                    className={editing === p.productType ? "bg-muted/50" : ""}
                  >
                    <TableCell className="font-mono text-muted-foreground">{p.productType}</TableCell>
                    <TableCell className="font-medium">{p.label}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          (p.enabled ?? true)
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {(p.enabled ?? true) ? "Enabled" : "Disabled"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{productOccasionBadge(p.productType)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Image
                          src={p.imageUrl}
                          alt=""
                          width={48}
                          height={48}
                          unoptimized
                          className="h-12 w-12 rounded-lg border border-border object-cover bg-muted shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                        <a
                          href={p.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline truncate max-w-[100px]"
                        >
                          View
                        </a>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.sortOrder}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant={editing === p.productType ? "secondary" : "ghost"}
                        className="h-8 w-8"
                        onClick={() => (editing === p.productType ? setEditing(null) : startEdit(p))}
                        aria-label={editing === p.productType ? "Close" : "Edit"}
                      >
                        {editing === p.productType ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {editing && editingProduct && (
        <Card className="border-primary/20 shadow-md">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Edit product</CardTitle>
                <CardDescription className="mt-1 font-mono text-muted-foreground">{editing}</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setEditing(null)} className="shrink-0">
                <X className="h-4 w-4 mr-1" />
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Basics */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Basics</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-label">Label</Label>
                  <Input
                    id="edit-label"
                    value={form.label ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                    placeholder="e.g. Whole Sheep"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-sort">Sort order</Label>
                  <Input
                    id="edit-sort"
                    type="number"
                    className="w-24"
                    value={form.sortOrder ?? 0}
                    onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={(form.enabled ?? true) ? "default" : "outline"}
                      onClick={() => setForm((f) => ({ ...f, enabled: true }))}
                    >
                      Enabled
                    </Button>
                    <Button
                      type="button"
                      variant={(form.enabled ?? true) ? "outline" : "default"}
                      onClick={() => setForm((f) => ({ ...f, enabled: false }))}
                    >
                      Disabled
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Disabled products stay in admin, but customers will not see them until you enable them again.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Image */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Image</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-image">Default image URL</Label>
                  <div className="flex flex-wrap items-start gap-3">
                    <Input
                      id="edit-image"
                      className="max-w-md"
                      value={form.imageUrl ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                      placeholder="https://... or /uploads/..."
                    />
                    {(form.imageUrl ?? "").trim() && (
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                        <Image
                          src={form.imageUrl!}
                          alt=""
                          fill
                          unoptimized
                          className="object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="rounded-lg border border-border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">
                      <strong>EN is reused for MS and ZH</strong> unless you set MS/ZH overrides below. Arabic is separate.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="img-en">EN (also MS & ZH unless overridden)</Label>
                      <div className="flex items-start gap-2">
                        <Input
                          id="img-en"
                          value={form.imageUrlByLocale?.en ?? ""}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              imageUrlByLocale: { ...(f.imageUrlByLocale ?? {}), en: e.target.value },
                            }))
                          }
                          placeholder="URL"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="shrink-0"
                          onClick={() => {
                            const url = (form.imageUrlByLocale?.en ?? "").trim();
                            if (!url) return;
                            setForm((f) => ({
                              ...f,
                              imageUrlByLocale: {
                                ...(f.imageUrlByLocale ?? {}),
                                en: url,
                                ms: url,
                                zh: url,
                              },
                            }));
                          }}
                        >
                          Apply to MS/ZH
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="img-ar">AR</Label>
                      <Input
                        id="img-ar"
                        value={form.imageUrlByLocale?.ar ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            imageUrlByLocale: { ...(f.imageUrlByLocale ?? {}), ar: e.target.value },
                          }))
                        }
                        placeholder="URL"
                      />
                    </div>
                  </div>

                  <details className="rounded-lg border border-border bg-card p-3">
                    <summary className="cursor-pointer select-none text-sm font-medium text-foreground">
                      Advanced overrides (optional)
                    </summary>
                    <div className="mt-3 space-y-6">
                      <div className="space-y-3">
                        <p className="text-xs font-medium text-muted-foreground">Per-locale overrides</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="img-ms">MS (override)</Label>
                            <Input
                              id="img-ms"
                              value={form.imageUrlByLocale?.ms ?? ""}
                              onChange={(e) =>
                                setForm((f) => ({
                                  ...f,
                                  imageUrlByLocale: { ...(f.imageUrlByLocale ?? {}), ms: e.target.value },
                                }))
                              }
                              placeholder="URL"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="img-zh">ZH (override)</Label>
                            <Input
                              id="img-zh"
                              value={form.imageUrlByLocale?.zh ?? ""}
                              onChange={(e) =>
                                setForm((f) => ({
                                  ...f,
                                  imageUrlByLocale: { ...(f.imageUrlByLocale ?? {}), zh: e.target.value },
                                }))
                              }
                              placeholder="URL"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-xs font-medium text-muted-foreground">
                          Per-occasion overrides (whole products only). Half products only support Personal.
                        </p>
                        <div className="grid gap-3">
                          {(editing === "half_sheep" || editing === "half_goat"
                            ? OCCASIONS.filter((o) => o.key === "personal")
                            : OCCASIONS
                          ).map(({ key: occKey, label: occLabel }) => {
                            const keyEn = `${occKey}:en`;
                            const keyAr = `${occKey}:ar`;
                            const keyMs = `${occKey}:ms`;
                            const keyZh = `${occKey}:zh`;
                            return (
                              <div key={occKey} className="rounded-lg border border-border bg-muted/20 p-3">
                                <p className="text-sm font-medium text-foreground">{occLabel}</p>
                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label>EN (also MS & ZH unless overridden)</Label>
                                    <div className="flex items-start gap-2">
                                      <Input
                                        value={form.imageUrlByLocale?.[keyEn] ?? ""}
                                        onChange={(e) =>
                                          setForm((f) => ({
                                            ...f,
                                            imageUrlByLocale: {
                                              ...(f.imageUrlByLocale ?? {}),
                                              [keyEn]: e.target.value,
                                            },
                                          }))
                                        }
                                        placeholder="URL"
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="shrink-0"
                                        onClick={() => {
                                          const url = (form.imageUrlByLocale?.[keyEn] ?? "").trim();
                                          if (!url) return;
                                          setForm((f) => ({
                                            ...f,
                                            imageUrlByLocale: {
                                              ...(f.imageUrlByLocale ?? {}),
                                              [keyEn]: url,
                                              [keyMs]: url,
                                              [keyZh]: url,
                                            },
                                          }));
                                        }}
                                      >
                                        Apply to MS/ZH
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>AR</Label>
                                    <Input
                                      value={form.imageUrlByLocale?.[keyAr] ?? ""}
                                      onChange={(e) =>
                                        setForm((f) => ({
                                          ...f,
                                          imageUrlByLocale: {
                                            ...(f.imageUrlByLocale ?? {}),
                                            [keyAr]: e.target.value,
                                          },
                                        }))
                                      }
                                      placeholder="URL"
                                    />
                                  </div>
                                </div>
                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label>MS (override)</Label>
                                    <Input
                                      value={form.imageUrlByLocale?.[keyMs] ?? ""}
                                      onChange={(e) =>
                                        setForm((f) => ({
                                          ...f,
                                          imageUrlByLocale: {
                                            ...(f.imageUrlByLocale ?? {}),
                                            [keyMs]: e.target.value,
                                          },
                                        }))
                                      }
                                      placeholder="URL"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>ZH (override)</Label>
                                    <Input
                                      value={form.imageUrlByLocale?.[keyZh] ?? ""}
                                      onChange={(e) =>
                                        setForm((f) => ({
                                          ...f,
                                          imageUrlByLocale: {
                                            ...(f.imageUrlByLocale ?? {}),
                                            [keyZh]: e.target.value,
                                          },
                                        }))
                                      }
                                      placeholder="URL"
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
              <Button onClick={save} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save product"
                )}
              </Button>
            </section>

            <Separator />

            {/* Weight options */}
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold text-foreground">Weight options</h3>
                <Button size="sm" onClick={saveWeights} disabled={savingWeights}>
                  {savingWeights ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Save weights"
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enable which weight bands are available for this product. Manage options in <strong>Weight options</strong>.
              </p>
              {globalWeightOptions.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                  No weight options yet. Add them in <strong>Weight options</strong> first.
                </p>
              ) : (
                <div className="space-y-6">
                  {qurbanWeights.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium text-muted-foreground">Qurban / Aqiqah</p>
                      <div className="flex flex-wrap gap-2">
                        {qurbanWeights.map((w) => {
                          const enabled = enabledWeightIds.includes(w.id);
                          return (
                            <label
                              key={w.id}
                              className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-sm transition-colors hover:bg-muted/50 has-[:checked]:border-primary/50 has-[:checked]:bg-primary/5"
                            >
                              <input
                                type="checkbox"
                                checked={enabled}
                                onChange={() => toggleWeightForProduct(w.id)}
                                className="h-4 w-4 rounded border-input"
                              />
                              <span>{w.label}</span>
                              <span className="text-muted-foreground">RM {w.price.toFixed(0)}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {personalWeights.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium text-muted-foreground">Personal</p>
                      <div className="flex flex-wrap gap-2">
                        {personalWeights.map((w) => {
                          const enabled = enabledWeightIds.includes(w.id);
                          return (
                            <label
                              key={w.id}
                              className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-sm transition-colors hover:bg-muted/50 has-[:checked]:border-primary/50 has-[:checked]:bg-primary/5"
                            >
                              <input
                                type="checkbox"
                                checked={enabled}
                                onChange={() => toggleWeightForProduct(w.id)}
                                className="h-4 w-4 rounded border-input"
                              />
                              <span>{w.label}</span>
                              <span className="text-muted-foreground">RM {w.price.toFixed(0)}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
