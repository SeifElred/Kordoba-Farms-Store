"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
      toast.error(d.error || "Failed to save");
      return;
    }
    setTranslations((prev) => prev.map((t) => (t.key === editing ? { ...t, value: editValue } : t)));
    setEditing(null);
    toast.success("Translation saved");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Translations</CardTitle>
          <CardDescription>Override copy per locale. Select locale and search by key, then edit and save.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={locale} onValueChange={setLocale}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCALES.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-1 min-w-[200px] gap-2">
              <Input
                placeholder="Search keys…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doSearch()}
                className="max-w-sm"
              />
              <Button type="button" variant="outline" size="icon" onClick={doSearch} aria-label="Search">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : translations.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No translations. Run: npx tsx prisma/seed-content.ts
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="sticky top-0 bg-muted/95 backdrop-blur">
                    <TableHead className="font-medium">Key</TableHead>
                    <TableHead className="font-medium">Value</TableHead>
                    <TableHead className="w-20 text-right font-medium">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {translations.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-muted-foreground align-top whitespace-nowrap">
                        {t.key}
                      </TableCell>
                      {editing === t.key ? (
                        <TableCell colSpan={2} className="align-top">
                          <div className="flex gap-2">
                            <textarea
                              className="min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              rows={2}
                            />
                            <div className="flex flex-col gap-1 shrink-0">
                              <Button size="sm" onClick={save} disabled={saving}>
                                {saving ? "…" : "Save"}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditing(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      ) : (
                        <>
                          <TableCell className="align-top break-words max-w-md">{t.value}</TableCell>
                          <TableCell className="text-right align-top">
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(t)} aria-label="Edit">
                              <Pencil className="h-4 w-4" />
                            </Button>
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
