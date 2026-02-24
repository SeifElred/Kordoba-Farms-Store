/**
 * Ready-to-use WhatsApp order message templates.
 * Use placeholder keys: {{name}}, {{phone}}, {{address}}, {{email}}, {{productLabel}},
 * {{priceRange}}, {{slaughterDate}}, {{distributionType}}, {{purpose}}, {{weightLine}},
 * {{specialCut}}, {{orderIncludes}}, {{videoProof}}, {{note}}
 */

export type OrderTemplatePresetId = "professional" | "friendly" | "ramadan" | "eid" | "minimal";

export type OrderTemplatePreset = {
  id: OrderTemplatePresetId;
  /** Display name (English); use nameKey for translated name when available */
  name: string;
  nameKey: string;
  template: string;
};

export const ORDER_TEMPLATE_PRESETS: OrderTemplatePreset[] = [
  {
    id: "professional",
    name: "Professional",
    nameKey: "admin.orderTemplatePresets.professional",
    template: `*New order – Kordoba Farms*

*Customer details*
Name: {{name}}
Phone: {{phone}}
Address: {{address}}
Email: {{email}}

*Order summary*
• Product: {{productLabel}}
• Occasion: {{purpose}}
• Slaughter date: {{slaughterDate}}
• Distribution: {{distributionType}}
• {{weightLine}}
• Special cut: {{specialCut}}
• Order includes: {{orderIncludes}}
• Video proof: {{videoProof}}
• Note: {{note}}

*Total: {{priceRange}}* (based on final weight)

Thank you for your order. We will confirm shortly.`,
  },
  {
    id: "friendly",
    name: "Friendly",
    nameKey: "admin.orderTemplatePresets.friendly",
    template: `Assalamualaikum! 👋

*New order from {{name}}*

📞 {{phone}}
📍 {{address}}
📧 {{email}}

*What they ordered*
{{productLabel}} · {{purpose}}
Slaughter: {{slaughterDate}}
Delivery: {{distributionType}}
{{weightLine}}
Cut: {{specialCut}}
Extras: {{orderIncludes}}
Video proof: {{videoProof}}
Note: {{note}}

💰 *Total: {{priceRange}}* (final weight may vary)

Jazakallah khair – we'll be in touch!`,
  },
  {
    id: "ramadan",
    name: "Ramadan",
    nameKey: "admin.orderTemplatePresets.ramadan",
    template: `🌙 *Ramadan Mubarak – New order – Kordoba Farms*

*Customer*
Name: {{name}}
Phone: {{phone}}
Address: {{address}}
Email: {{email}}

*Order*
• Product: {{productLabel}}
• Occasion: {{purpose}}
• Slaughter date: {{slaughterDate}}
• Distribution: {{distributionType}}
• {{weightLine}}
• Special cut: {{specialCut}}
• Order includes: {{orderIncludes}}
• Video proof: {{videoProof}}
• Note: {{note}}

*Total: {{priceRange}}* (based on final weight)

Barakallahu fikum. We will confirm your order shortly.`,
  },
  {
    id: "eid",
    name: "Eid al-Adha",
    nameKey: "admin.orderTemplatePresets.eid",
    template: `🕌 *Eid Mubarak – New order – Kordoba Farms*

*Customer*
Name: {{name}}
Phone: {{phone}}
Address: {{address}}
Email: {{email}}

*Order*
• Product: {{productLabel}}
• Occasion: {{purpose}}
• Slaughter date: {{slaughterDate}}
• Distribution: {{distributionType}}
• {{weightLine}}
• Special cut: {{specialCut}}
• Order includes: {{orderIncludes}}
• Video proof: {{videoProof}}
• Note: {{note}}

*Total: {{priceRange}}* (based on final weight)

Eid Mubarak! We will confirm your Qurban order shortly.`,
  },
  {
    id: "minimal",
    name: "Minimal",
    nameKey: "admin.orderTemplatePresets.minimal",
    template: `*Order – Kordoba Farms*

{{name}} · {{phone}}
{{address}}
{{email}}

{{productLabel}} · {{purpose}}
{{slaughterDate}} · {{distributionType}}
{{weightLine}} · {{specialCut}}
{{orderIncludes}} · Video: {{videoProof}}
{{note}}

*Total: {{priceRange}}*`,
  },
];

/** Get preset by id. */
export function getOrderTemplatePreset(id: OrderTemplatePresetId): OrderTemplatePreset | undefined {
  return ORDER_TEMPLATE_PRESETS.find((p) => p.id === id);
}
