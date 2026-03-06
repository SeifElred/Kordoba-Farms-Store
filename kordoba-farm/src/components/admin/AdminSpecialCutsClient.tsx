"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Pencil, Loader2, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SpecialCut = {
  id: string;
  cutId: string;
  label: string;
  imageUrl: string;
  imageUrlByLocale?: string | null;
  videoUrl: string | null;
  sortOrder: number;
};

type SpecialCutForm = Partial<Omit<SpecialCut, "id" | "cutId" | "imageUrlByLocale">> & {
  imageUrlByLocale?: Record<string, string>;
};

export function AdminSpecialCutsClient() {
  const [cuts, setCuts] = useState<SpecialCut[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<SpecialCutForm>({});

  useEffect(() => {
    fetch("/api/admin/content/special-cuts")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCuts(data);
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
    const data: Record<string, unknown> = {
      ...form,
      videoUrl: (form.videoUrl as string)?.trim() || null,
    };
    if (form.imageUrlByLocale && Object.keys(form.imageUrlByLocale).length === 0) {
      delete (data as { imageUrlByLocale?: Record<string, string> }).imageUrlByLocale;
    }
    const res = await fetch("/api/admin/content/special-cuts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cutId: editing, data }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || "Failed to save");
      return;
    }
    const updated = await res.json();
    setCuts((prev) => prev.map((c) => (c.cutId === editing ? updated : c)));
    setEditing(null);
    toast.success("Saved");
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
          <CardTitle className="text-base">Special cuts</CardTitle>
          <CardDescription>
            Cut options shown in the order flow. Click Edit to open a detailed editor with previews.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cuts.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No special cuts. Run: npx tsx prisma/seed-content.ts
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-36">Cut ID</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead className="w-24">Media</TableHead>
                    <TableHead className="w-16">Order</TableHead>
                    <TableHead className="w-20 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cuts.map((c) => (
                    <TableRow
                      key={c.id}
                      className={editing === c.cutId ? "bg-muted/50" : ""}
                    >
                      <TableCell className="font-mono text-muted-foreground">{c.cutId}</TableCell>
                      <TableCell className="font-medium">{c.label}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Image
                            src={c.imageUrl}
                            alt=""
                            width={40}
                            height={40}
                            unoptimized
                            className="h-10 w-10 rounded-md border border-border object-cover bg-muted"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                          {c.videoUrl ? (
                            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                              video
                            </span>
                          ) : (
                            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                              —
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{c.sortOrder}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="icon"
                          variant={editing === c.cutId ? "secondary" : "ghost"}
                          className="h-8 w-8"
                          onClick={() => (editing === c.cutId ? setEditing(null) : startEdit(c))}
                          aria-label={editing === c.cutId ? "Close" : "Edit"}
                        >
                          {editing === c.cutId ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {editing && (
        <Card className="border-primary/20 shadow-md">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Edit special cut</CardTitle>
                <CardDescription className="mt-1 font-mono text-muted-foreground">{editing}</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setEditing(null)} className="shrink-0">
                <X className="h-4 w-4 mr-1" />
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Basics</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cut-label">Label</Label>
                  <Input
                    id="cut-label"
                    value={form.label ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                    placeholder="Label"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cut-order">Sort order</Label>
                  <Input
                    id="cut-order"
                    type="number"
                    className="w-24"
                    value={form.sortOrder ?? 0}
                    onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </section>

            <Separator />

            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Media</h3>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cut-image-default">Default image URL</Label>
                  <div className="flex flex-wrap items-start gap-3">
                    <Input
                      id="cut-image-default"
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
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cut-video">Video URL (optional)</Label>
                  <div className="flex items-start gap-2">
                    <Input
                      id="cut-video"
                      value={(form.videoUrl as string) ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
                      placeholder="https://..."
                    />
                    {(String((form.videoUrl as string) ?? "").trim() && (
                      <a
                        href={String(form.videoUrl).trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 items-center gap-1 rounded-md border border-input bg-background px-3 text-sm hover:bg-muted"
                        title="Open video"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open
                      </a>
                    )) || (
                      <span className="h-9 px-3 text-sm text-muted-foreground inline-flex items-center">—</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">
                  <strong>EN is reused for MS and ZH</strong> unless you set MS/ZH overrides below. Arabic is separate.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cut-img-en">EN (also MS & ZH unless overridden)</Label>
                  <div className="flex items-start gap-2">
                    <Input
                      id="cut-img-en"
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
                          imageUrlByLocale: { ...(f.imageUrlByLocale ?? {}), en: url, ms: url, zh: url },
                        }));
                      }}
                    >
                      Apply to MS/ZH
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cut-img-ar">AR</Label>
                  <Input
                    id="cut-img-ar"
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
                  Advanced locale overrides (optional)
                </summary>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cut-img-ms">MS (override)</Label>
                    <Input
                      id="cut-img-ms"
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
                    <Label htmlFor="cut-img-zh">ZH (override)</Label>
                    <Input
                      id="cut-img-zh"
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
              </details>
            </section>

            <div className="flex flex-wrap gap-2">
              <Button onClick={save} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
              <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
