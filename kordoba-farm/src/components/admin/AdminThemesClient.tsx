"use client";

import { useEffect, useState } from "react";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ORDER_TEMPLATE_PRESETS } from "@/lib/order-template-presets";
import type { OrderTemplatePresetId } from "@/lib/order-template-presets";

type ThemeId = "default" | "ramadan" | "eid";

const THEMES: { id: ThemeId; label: string; description: string }[] = [
  { id: "default", label: "Default / Welcome", description: "Standard green & cream design" },
  { id: "ramadan", label: "Ramadan", description: "Night blues, gold accents – full Ramadan vibe" },
  { id: "eid", label: "Eid al-Adha", description: "Green & gold – festive Eid vibe" },
];

const TEMPLATE_KEYS: Record<ThemeId, string> = {
  default: "order_message_template",
  ramadan: "order_message_template_ramadan",
  eid: "order_message_template_eid",
};

const BANNER_KEYS: Record<ThemeId, string> = {
  default: "theme_banner_text_default",
  ramadan: "theme_banner_text_ramadan",
  eid: "theme_banner_text_eid",
};

const HERO_HEADING_KEYS: Record<ThemeId, string> = {
  default: "theme_hero_heading_default",
  ramadan: "theme_hero_heading_ramadan",
  eid: "theme_hero_heading_eid",
};

const HERO_SUBTITLE_KEYS: Record<ThemeId, string> = {
  default: "theme_hero_subtitle_default",
  ramadan: "theme_hero_subtitle_ramadan",
  eid: "theme_hero_subtitle_eid",
};

const PLACEHOLDERS =
  "{{name}}, {{phone}}, {{address}}, {{email}}, {{productLabel}}, {{priceRange}}, {{slaughterDate}}, {{distributionType}}, {{purpose}}, {{weightLine}}, {{specialCut}}, {{orderIncludes}}, {{videoProof}}, {{note}}";

type ThemeContent = {
  banner: string;
  heroHeading: string;
  heroSubtitle: string;
  orderTemplate: string;
};

export function AdminThemesClient() {
  const [activeTheme, setActiveTheme] = useState<ThemeId>("default");
  const [content, setContent] = useState<Record<ThemeId, ThemeContent>>({
    default: { banner: "", heroHeading: "", heroSubtitle: "", orderTemplate: "" },
    ramadan: { banner: "", heroHeading: "", heroSubtitle: "", orderTemplate: "" },
    eid: { banner: "", heroHeading: "", heroSubtitle: "", orderTemplate: "" },
  });
  const [loading, setLoading] = useState(true);
  const [savingTheme, setSavingTheme] = useState(false);
  const [savingContent, setSavingContent] = useState<ThemeId | null>(null);

  useEffect(() => {
    fetch("/api/admin/content/settings")
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        if (data && typeof data === "object") {
          const active = (data.active_theme as ThemeId) || "default";
          setActiveTheme(
            ["default", "ramadan", "eid"].includes(active) ? active : "default"
          );
          const get = (key: string) => data[key] ?? "";
          setContent({
            default: {
              banner: get("theme_banner_text_default"),
              heroHeading: get("theme_hero_heading_default"),
              heroSubtitle: get("theme_hero_subtitle_default"),
              orderTemplate: get("order_message_template"),
            },
            ramadan: {
              banner: get("theme_banner_text_ramadan"),
              heroHeading: get("theme_hero_heading_ramadan"),
              heroSubtitle: get("theme_hero_subtitle_ramadan"),
              orderTemplate: get("order_message_template_ramadan"),
            },
            eid: {
              banner: get("theme_banner_text_eid"),
              heroHeading: get("theme_hero_heading_eid"),
              heroSubtitle: get("theme_hero_subtitle_eid"),
              orderTemplate: get("order_message_template_eid"),
            },
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function setActive(theme: ThemeId) {
    setSavingTheme(true);
    const res = await fetch("/api/admin/content/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "active_theme", value: theme }),
    });
    setSavingTheme(false);
    if (res.ok) {
      setActiveTheme(theme);
      toast.success("Theme updated");
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || "Failed to save");
    }
  }

  async function saveThemeContent(theme: ThemeId) {
    setSavingContent(theme);
    const c = content[theme];
    const updates: { key: string; value: string }[] = [
      { key: BANNER_KEYS[theme], value: c.banner ?? "" },
      { key: HERO_HEADING_KEYS[theme], value: c.heroHeading ?? "" },
      { key: HERO_SUBTITLE_KEYS[theme], value: c.heroSubtitle ?? "" },
      { key: TEMPLATE_KEYS[theme], value: c.orderTemplate ?? "" },
    ];
    for (const { key, value } of updates) {
      const res = await fetch("/api/admin/content/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error || "Failed to save");
        break;
      }
    }
    setSavingContent(null);
    toast.success("Theme content saved");
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

  const activeThemeLabel = THEMES.find((t) => t.id === activeTheme)?.label ?? activeTheme;

  return (
    <div className="space-y-6">
      <Card className="border-primary/40 bg-primary/5">
        <CardContent className="pt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Current theme</p>
          <p className="mt-1 text-xl font-bold">{activeThemeLabel}</p>
          <p className="mt-1 text-sm text-muted-foreground">Live site-wide: design, banner, hero text, and WhatsApp order message.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Choose active theme</CardTitle>
          <CardDescription>Click a theme to make it active. The whole site switches to that design.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {THEMES.map((t) => {
              const isActive = activeTheme === t.id;
              return (
                <Button
                  key={t.id}
                  type="button"
                  variant={isActive ? "default" : "outline"}
                  className="relative h-auto flex-col items-start gap-0.5 px-4 py-3 text-left"
                  onClick={() => setActive(t.id)}
                  disabled={savingTheme}
                >
                  {isActive && (
                    <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-background/20 px-2 py-0.5 text-xs font-medium">
                      <Check className="h-3 w-3" /> Active
                    </span>
                  )}
                  <span className="font-medium">{t.label}</span>
                  <span className="text-xs opacity-90">{t.description}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {THEMES.map((t) => (
        <Card key={t.id}>
          <CardHeader>
            <CardTitle className="text-base">{t.label} – Banner & hero</CardTitle>
            <CardDescription>Banner text, hero heading/subtitle, and WhatsApp order message for this theme.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Banner (top of every page)</Label>
              <Input
                value={content[t.id].banner}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    [t.id]: { ...prev[t.id], banner: e.target.value },
                  }))
                }
                placeholder="e.g. Ramadan Mubarak – Free delivery on orders above RM500"
              />
            </div>
            <div className="space-y-2">
              <Label>Hero heading</Label>
              <Input
                value={content[t.id].heroHeading}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    [t.id]: { ...prev[t.id], heroHeading: e.target.value },
                  }))
                }
                placeholder="e.g. Choose your occasion"
              />
            </div>
            <div className="space-y-2">
              <Label>Hero subtitle</Label>
              <Input
                value={content[t.id].heroSubtitle}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    [t.id]: { ...prev[t.id], heroSubtitle: e.target.value },
                  }))
                }
                placeholder="e.g. What brings you here?"
              />
            </div>
            <div className="space-y-2">
              <Label>Order message template (WhatsApp)</Label>
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  onValueChange={(id: OrderTemplatePresetId) => {
                    const preset = ORDER_TEMPLATE_PRESETS.find((p) => p.id === id);
                    if (preset) {
                      setContent((prev) => ({
                        ...prev,
                        [t.id]: { ...prev[t.id], orderTemplate: preset.template },
                      }));
                    }
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Apply preset…" />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_TEMPLATE_PRESETS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground">Then edit below and Save.</span>
              </div>
              <textarea
                className="min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={content[t.id].orderTemplate}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    [t.id]: { ...prev[t.id], orderTemplate: e.target.value },
                  }))
                }
                placeholder={`*New order*\nName: {{name}}\n...`}
              />
              <p className="text-xs text-muted-foreground">Placeholders: {PLACEHOLDERS}</p>
            </div>
            <Button
              onClick={() => saveThemeContent(t.id)}
              disabled={savingContent === t.id}
              size="sm"
            >
              {savingContent === t.id ? "Saving…" : "Save " + t.label}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
