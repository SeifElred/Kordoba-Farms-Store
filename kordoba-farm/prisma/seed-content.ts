/**
 * Seed Products, SpecialCuts, Translations, and SiteSettings from current app defaults.
 * Run: npx tsx prisma/seed-content.ts
 * Or add to package.json: "seed:content": "tsx prisma/seed-content.ts"
 */
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const LOCALES = ["en", "ar", "ms", "zh"] as const;

function flatten(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flatten(value as Record<string, unknown>, fullKey));
    } else if (typeof value === "string") {
      result[fullKey] = value;
    }
  }
  return result;
}

const PRODUCTS = [
  { productType: "half_sheep", label: "½ Sheep", minPrice: 500, maxPrice: 700, imageUrl: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=600&q=80", sortOrder: 0 },
  { productType: "half_goat", label: "½ Goat", minPrice: 400, maxPrice: 600, imageUrl: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=600&q=80", sortOrder: 1 },
  { productType: "whole_sheep", label: "Whole Sheep", minPrice: 1000, maxPrice: 1400, imageUrl: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&q=80", sortOrder: 2 },
  { productType: "whole_goat", label: "Whole Goat", minPrice: 800, maxPrice: 1200, imageUrl: "https://images.unsplash.com/photo-1578645510387-c3e02018f305?w=600&q=80", sortOrder: 3 },
];

const SPECIAL_CUTS = [
  { cutId: "arabic_8", label: "تقطيع عربى 8 قطع", imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80", videoUrl: null, sortOrder: 0 },
  { cutId: "arabic_4", label: "تقطيع عربى 4 قطع", imageUrl: "https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80", videoUrl: null, sortOrder: 1 },
  { cutId: "arabic_half_length", label: "تقطيع عربى نص طول", imageUrl: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&q=80", videoUrl: null, sortOrder: 2 },
  { cutId: "fridge_medium", label: "تقطيع ثلاجه (قطع متوسطة)", imageUrl: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&q=80", videoUrl: null, sortOrder: 3 },
  { cutId: "full_ghozy", label: "غوزي كامل", imageUrl: "https://images.unsplash.com/photo-1615937691194-96f16275d74c?w=400&q=80", videoUrl: null, sortOrder: 4 },
  { cutId: "salona_small", label: "تقطيع صالونه(قطع صغيرة)", imageUrl: "https://images.unsplash.com/photo-1615937691172-6119668cae97?w=400&q=80", videoUrl: null, sortOrder: 5 },
  { cutId: "biryani_large", label: "تقطيع برياني(قطع كبيرة)", imageUrl: "https://images.unsplash.com/photo-1615937691172-6119668cae97?w=400&q=80", videoUrl: null, sortOrder: 6 },
  { cutId: "hadrami_joints", label: "حضرمي مفاصل", imageUrl: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80", videoUrl: null, sortOrder: 7 },
  { cutId: "awlaqi_joints", label: "عولقي مفاصل", imageUrl: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80", videoUrl: null, sortOrder: 8 },
  { cutId: "maftah", label: "مفطح", imageUrl: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&q=80", videoUrl: null, sortOrder: 9 },
];

const CITIES = [
  "Kuala Lumpur", "Shah Alam", "Petaling Jaya", "Johor Bahru", "Ipoh",
  "George Town", "Kuching", "Kota Kinabalu", "Alor Setar", "Kota Bharu",
  "Melaka", "Seremban", "Kuantan", "Kota Melaka", "Other",
];

async function main() {
  const messagesDir = path.join(process.cwd(), "src", "messages");
  for (const locale of LOCALES) {
    const filePath = path.join(messagesDir, `${locale}.json`);
    if (!fs.existsSync(filePath)) continue;
    const raw = fs.readFileSync(filePath, "utf-8");
    const json = JSON.parse(raw) as Record<string, unknown>;
    const flat = flatten(json);
    for (const [key, value] of Object.entries(flat)) {
      await prisma.translation.upsert({
        where: { locale_key: { locale, key } },
        create: { locale, key, value },
        update: { value },
      });
    }
    console.log(`Seeded ${Object.keys(flat).length} translations for ${locale}`);
  }

  for (const p of PRODUCTS) {
    await prisma.product.upsert({
      where: { productType: p.productType },
      create: p,
      // Do NOT override imageUrl on existing products; keep admin-updated images.
      update: { label: p.label, minPrice: p.minPrice, maxPrice: p.maxPrice, sortOrder: p.sortOrder },
    });
  }
  console.log(`Seeded ${PRODUCTS.length} products`);

  await prisma.specialCut.deleteMany({
    where: {
      cutId: {
        notIn: SPECIAL_CUTS.map((c) => c.cutId),
      },
    },
  });

  for (const c of SPECIAL_CUTS) {
    await prisma.specialCut.upsert({
      where: { cutId: c.cutId },
      create: { cutId: c.cutId, label: c.label, imageUrl: c.imageUrl, videoUrl: c.videoUrl, sortOrder: c.sortOrder },
      // Do NOT override imageUrl/videoUrl on existing cuts; keep admin-updated media.
      update: { label: c.label, sortOrder: c.sortOrder },
    });
  }
  console.log(`Seeded ${SPECIAL_CUTS.length} special cuts`);

  await prisma.siteSetting.upsert({
    where: { key: "cities" },
    create: { key: "cities", value: JSON.stringify(CITIES) },
    update: { value: JSON.stringify(CITIES) },
  });
  await prisma.siteSetting.upsert({
    where: { key: "whatsapp_link" },
    create: { key: "whatsapp_link", value: "https://wa.me/60123456789" },
    update: {},
  });
  await prisma.siteSetting.upsert({
    where: { key: "delivery_transport_note" },
    create: { key: "delivery_transport_note", value: "We use LalaMove for transportation." },
    update: {},
  });

  const DEFAULT_ORDER_MESSAGE_TEMPLATE = `*New order – Kordoba Farm*

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

*Total: {{priceRange}} (based on final weight)*`;

  await prisma.siteSetting.upsert({
    where: { key: "order_message_template" },
    create: { key: "order_message_template", value: DEFAULT_ORDER_MESSAGE_TEMPLATE },
    update: {},
  });

  await prisma.siteSetting.upsert({
    where: { key: "active_theme" },
    create: { key: "active_theme", value: "default" },
    update: {},
  });

  const RAMADAN_ORDER_TEMPLATE = `🌙 *Ramadan Mubarak – New order – Kordoba Farm*

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

*Total: {{priceRange}} (based on final weight)*
Barakallahu fikum.`;

  await prisma.siteSetting.upsert({
    where: { key: "order_message_template_ramadan" },
    create: { key: "order_message_template_ramadan", value: RAMADAN_ORDER_TEMPLATE },
    update: {},
  });

  const EID_ORDER_TEMPLATE = `🕌 *Eid Mubarak – New order – Kordoba Farm*

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

*Total: {{priceRange}} (based on final weight)*
Eid Mubarak!`;

  await prisma.siteSetting.upsert({
    where: { key: "order_message_template_eid" },
    create: { key: "order_message_template_eid", value: EID_ORDER_TEMPLATE },
    update: {},
  });

  const themeSiteKeys: { key: string; value: string }[] = [
    { key: "theme_banner_text_default", value: "" },
    { key: "theme_hero_heading_default", value: "" },
    { key: "theme_hero_subtitle_default", value: "" },
    { key: "theme_banner_text_ramadan", value: "Ramadan Mubarak – Barakallahu fikum" },
    { key: "theme_hero_heading_ramadan", value: "Ramadan Mubarak" },
    { key: "theme_hero_subtitle_ramadan", value: "Choose your occasion – we're here for your Qurban & Aqiqah needs." },
    { key: "theme_banner_text_eid", value: "Eid Mubarak – Order your Qurban with confidence" },
    { key: "theme_hero_heading_eid", value: "Eid Mubarak" },
    { key: "theme_hero_subtitle_eid", value: "Premium halal Qurban & Aqiqah – choose your animal." },
  ];
  for (const { key, value } of themeSiteKeys) {
    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value },
      update: {},
    });
  }

  console.log("Seeded site settings (cities, whatsapp_link, delivery_transport_note, order_message_template, active_theme, ramadan/eid templates, theme banner/hero)");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
