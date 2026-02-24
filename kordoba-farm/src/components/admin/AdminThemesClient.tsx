"use client";

import { useEffect, useState } from "react";
import { Loader2, Check } from "lucide-react";
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
    if (res.ok) setActiveTheme(theme);
    else {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Failed to save");
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
        alert(d.error || "Failed to save");
        break;
      }
    }
    setSavingContent(null);
  }

  const inputClass =
    "w-full rounded-lg border border-[#334155] bg-[#0f172a] px-3 py-2 text-sm text-white font-mono focus:border-[#c8a951] focus:outline-none focus:ring-1 focus:ring-[#c8a951]";

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-[#334155] bg-[#1e293b] py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#94a3b8]" />
      </div>
    );
  }

  const activeThemeLabel = THEMES.find((t) => t.id === activeTheme)?.label ?? activeTheme;

  return (
    <div className="space-y-8">
      {/* Current theme – very visible */}
      <div className="rounded-xl border-2 border-[#c8a951] bg-[#c8a951]/10 px-5 py-4">
        <p className="text-sm font-medium uppercase tracking-wider text-[#c8a951]">Current theme</p>
        <p className="mt-1 text-2xl font-bold text-white">{activeThemeLabel}</p>
        <p className="mt-1 text-sm text-[#94a3b8]">This theme is live site-wide: full design (colors, background, vibe), banner, hero text, and WhatsApp order message.</p>
      </div>

      {/* Active theme selector */}
      <section className="rounded-xl border border-[#334155] bg-[#1e293b] p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#94a3b8]">
          Choose active theme
        </h2>
        <p className="mb-4 text-sm text-[#94a3b8]">
          Click a theme to make it active. The whole site switches to that design (colors, backgrounds, feel) plus its banner and hero text.
        </p>
        <div className="flex flex-wrap gap-3">
          {THEMES.map((t) => {
            const isActive = activeTheme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActive(t.id)}
                disabled={savingTheme}
                className={`relative rounded-xl border-2 px-4 py-3 text-left transition-colors disabled:opacity-50 ${
                  isActive
                    ? "border-[#c8a951] bg-[#c8a951]/10 text-white"
                    : "border-[#334155] bg-[#0f172a] text-[#94a3b8] hover:border-[#475569] hover:text-white"
                }`}
              >
                {isActive && (
                  <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-[#c8a951] px-2 py-0.5 text-xs font-semibold text-[#0f172a]">
                    <Check className="h-3 w-3" /> Active
                  </span>
                )}
                <span className="block font-medium">{t.label}</span>
                <span className="mt-0.5 block text-xs opacity-80">
                  {t.description}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Per-theme: banner, hero, order message */}
      <div className="space-y-6">
        {THEMES.map((t) => (
          <section
            key={t.id}
            className="rounded-xl border border-[#334155] bg-[#1e293b] p-5"
          >
            <h2 className="mb-4 text-lg font-semibold text-white">
              {t.label} – Banner & hero text (design is automatic)
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#94a3b8]">Banner (top of every page)</label>
                <input
                  type="text"
                  className={inputClass}
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
              <div>
                <label className="mb-1 block text-sm font-medium text-[#94a3b8]">Hero heading (main pages)</label>
                <input
                  type="text"
                  className={inputClass}
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
              <div>
                <label className="mb-1 block text-sm font-medium text-[#94a3b8]">Hero subtitle</label>
                <input
                  type="text"
                  className={inputClass}
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
              <div>
                <label className="mb-1 block text-sm font-medium text-[#94a3b8]">Order message template (WhatsApp)</label>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-[#64748b]">Apply preset:</span>
                  <select
                    className="rounded-lg border border-[#334155] bg-[#0f172a] px-2 py-1.5 text-sm text-white focus:border-[#c8a951] focus:outline-none"
                    value=""
                    onChange={(e) => {
                      const id = e.target.value as OrderTemplatePresetId | "";
                      if (!id) return;
                      const preset = ORDER_TEMPLATE_PRESETS.find((p) => p.id === id);
                      if (preset) {
                        setContent((prev) => ({
                          ...prev,
                          [t.id]: { ...prev[t.id], orderTemplate: preset.template },
                        }));
                      }
                      e.target.value = "";
                    }}
                  >
                    <option value="">— Choose preset —</option>
                    {ORDER_TEMPLATE_PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-[#64748b]">Then edit below if needed and Save.</span>
                </div>
                <textarea
                  className={inputClass + " min-h-[160px]"}
                  value={content[t.id].orderTemplate}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      [t.id]: { ...prev[t.id], orderTemplate: e.target.value },
                    }))
                  }
                  placeholder={`*New order*\nName: {{name}}\n...`}
                />
                <p className="mt-1 text-xs text-[#64748b]">Placeholders: {PLACEHOLDERS}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => saveThemeContent(t.id)}
              disabled={savingContent === t.id}
              className="mt-4 rounded-lg bg-[#0F3D2E] px-3 py-1.5 text-sm text-white hover:bg-[#14533a] disabled:opacity-50"
            >
              {savingContent === t.id ? "Saving…" : "Save " + t.label}
            </button>
          </section>
        ))}
      </div>
    </div>
  );
}
