"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ExternalLink, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { ORDER_TEMPLATE_PRESETS } from "@/lib/order-template-presets";
import type { OrderTemplatePresetId } from "@/lib/order-template-presets";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const KNOWN_KEYS = [
  "cities",
  "whatsapp_link",
  "delivery_transport_note",
  "order_message_template",
  "animal_image_sheep",
  "animal_image_goat",
] as const;

const ORDER_MESSAGE_PLACEHOLDERS =
  "{{name}}, {{phone}}, {{address}}, {{email}}, {{productLabel}}, {{priceRange}}, {{slaughterDate}}, {{distributionType}}, {{purpose}}, {{weightLine}}, {{weightSelection}}, {{specialCut}}, {{orderIncludes}}, {{videoProof}}, {{note}}";

function isDirty(original: Record<string, string>, draft: Record<string, string>, key: string): boolean {
  return (draft[key] ?? "") !== (original[key] ?? "");
}

function safeParseCities(raw: string): { ok: boolean; count?: number; error?: string } {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return { ok: true, count: 0 };
  try {
    const v = JSON.parse(trimmed) as unknown;
    if (!Array.isArray(v)) return { ok: false, error: "Cities must be a JSON array." };
    const invalid = v.find((x) => typeof x !== "string");
    if (invalid != null) return { ok: false, error: "Cities array must contain only strings." };
    return { ok: true, count: v.length };
  } catch {
    return { ok: false, error: "Invalid JSON." };
  }
}

export function AdminSettingsClient() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/admin/content/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === "object") {
          setSettings(data);
          setDraft(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function saveKey(key: string) {
    setSaving(true);
    const res = await fetch("/api/admin/content/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: draft[key] ?? "" }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || "Failed to save");
      return;
    }
    setSettings((prev) => ({ ...prev, [key]: draft[key] ?? "" }));
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

  const keys: string[] = [
    ...KNOWN_KEYS,
    ...Object.keys(settings).filter(
      (k) => !KNOWN_KEYS.includes(k as (typeof KNOWN_KEYS)[number])
    ),
  ];

  const citiesValidation = safeParseCities(draft.cities ?? "");
  const anyDirty = keys.some((k) => isDirty(settings, draft, k));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Site settings</CardTitle>
              <CardDescription>
                Update operational settings used across the order flow and admin.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {anyDirty ? <Badge variant="secondary">Unsaved changes</Badge> : <Badge variant="outline">Up to date</Badge>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="whatsapp" className="w-full">
            <TabsList className="flex flex-wrap justify-start">
              <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
              <TabsTrigger value="delivery">Delivery</TabsTrigger>
              <TabsTrigger value="template">Order template</TabsTrigger>
              <TabsTrigger value="animals">Animal images</TabsTrigger>
              <TabsTrigger value="cities">Cities</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="whatsapp" className="mt-4">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-sm">WhatsApp</CardTitle>
                  <CardDescription>Used for “Complete order via WhatsApp”.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp_link">WhatsApp link</Label>
                    <div className="flex flex-wrap items-start gap-2">
                      <Input
                        id="whatsapp_link"
                        value={draft.whatsapp_link ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, whatsapp_link: e.target.value }))}
                        placeholder="https://wa.me/..."
                      />
                      {(draft.whatsapp_link ?? "").trim() ? (
                        <a
                          className="inline-flex h-9 items-center gap-1 rounded-md border border-input bg-background px-3 text-sm hover:bg-muted"
                          href={(draft.whatsapp_link ?? "").trim()}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open
                        </a>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => saveKey("whatsapp_link")}
                      disabled={saving || !isDirty(settings, draft, "whatsapp_link")}
                      className="gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                    {!isDirty(settings, draft, "whatsapp_link") && (
                      <span className="text-xs text-muted-foreground">No changes</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="delivery" className="mt-4">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-sm">Delivery</CardTitle>
                  <CardDescription>Shown in step 5 under delivery options.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="delivery_transport_note">Delivery transport note</Label>
                    <Input
                      id="delivery_transport_note"
                      value={draft.delivery_transport_note ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, delivery_transport_note: e.target.value }))}
                      placeholder="We use LalaMove for transportation."
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => saveKey("delivery_transport_note")}
                      disabled={saving || !isDirty(settings, draft, "delivery_transport_note")}
                      className="gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="template" className="mt-4">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-sm">Order message template</CardTitle>
                  <CardDescription>
                    Used when customer completes via WhatsApp. You can apply a preset then customize.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">Preset</span>
                    <Select
                      onValueChange={(id: OrderTemplatePresetId) => {
                        const preset = ORDER_TEMPLATE_PRESETS.find((p) => p.id === id);
                        if (preset) setDraft((d) => ({ ...d, order_message_template: preset.template }));
                      }}
                    >
                      <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="— Choose preset —" />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_TEMPLATE_PRESETS.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground">Apply, edit, then save.</span>
                  </div>

                  <textarea
                    className="min-h-[260px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={draft.order_message_template ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, order_message_template: e.target.value }))}
                    placeholder={"*New order*\nName: {{name}}\nPhone: {{phone}}\n..."}
                  />
                  <div className="rounded-lg border border-border bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground">
                      Placeholders: {ORDER_MESSAGE_PLACEHOLDERS}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => saveKey("order_message_template")}
                      disabled={saving || !isDirty(settings, draft, "order_message_template")}
                      className="gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="animals" className="mt-4">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-sm">Animal images</CardTitle>
                  <CardDescription>Used on step 2 (sheep/goat selection).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {(["animal_image_sheep", "animal_image_goat"] as const).map((k) => {
                    const label = k === "animal_image_sheep" ? "Sheep image URL" : "Goat image URL";
                    const url = (draft[k] ?? "").trim();
                    return (
                      <div key={k} className="space-y-3">
                        <Label htmlFor={k}>{label}</Label>
                        <div className="flex flex-wrap items-start gap-3">
                          <Input
                            id={k}
                            value={draft[k] ?? ""}
                            onChange={(e) => setDraft((d) => ({ ...d, [k]: e.target.value }))}
                            placeholder="https://... (image URL)"
                          />
                          {url ? (
                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                              <Image
                                src={url}
                                alt=""
                                fill
                                unoptimized
                                className="object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            </div>
                          ) : (
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-xs text-muted-foreground">
                              —
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => saveKey(k)}
                            disabled={saving || !isDirty(settings, draft, k)}
                            className="gap-2"
                          >
                            <Save className="h-4 w-4" />
                            Save
                          </Button>
                        </div>
                        <Separator />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cities" className="mt-4">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-sm">Cities</CardTitle>
                  <CardDescription>Optional. JSON array of city names.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <textarea
                    className="min-h-[220px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={draft.cities ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, cities: e.target.value }))}
                    placeholder='["Kuala Lumpur", "Shah Alam", "Other"]'
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    {citiesValidation.ok ? (
                      <Badge variant="secondary">
                        Valid JSON{typeof citiesValidation.count === "number" ? ` · ${citiesValidation.count} cities` : ""}
                      </Badge>
                    ) : (
                      <Badge variant="destructive">{citiesValidation.error}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => saveKey("cities")}
                      disabled={saving || !isDirty(settings, draft, "cities") || !citiesValidation.ok}
                      className="gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="mt-4">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-sm">Advanced</CardTitle>
                  <CardDescription>Raw key/value editor for uncommon settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {keys
                    .filter((k) => !KNOWN_KEYS.includes(k as (typeof KNOWN_KEYS)[number]))
                    .length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No additional settings.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {keys
                        .filter((k) => !KNOWN_KEYS.includes(k as (typeof KNOWN_KEYS)[number]))
                        .map((k) => (
                          <div key={k} className="rounded-lg border border-border bg-muted/20 p-3">
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <span className="font-mono text-xs text-muted-foreground">{k}</span>
                              {isDirty(settings, draft, k) ? (
                                <Badge variant="secondary">changed</Badge>
                              ) : (
                                <Badge variant="outline">saved</Badge>
                              )}
                            </div>
                            <Input
                              value={draft[k] ?? ""}
                              onChange={(e) => setDraft((d) => ({ ...d, [k]: e.target.value }))}
                              placeholder="Value"
                            />
                            <div className="mt-2">
                              <Button
                                size="sm"
                                onClick={() => saveKey(k)}
                                disabled={saving || !isDirty(settings, draft, k)}
                                className="gap-2"
                              >
                                <Save className="h-4 w-4" />
                                Save
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
