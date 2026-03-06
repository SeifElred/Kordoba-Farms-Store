import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ——— Price & date formatting ———
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

export function formatPriceRange(minPrice: number, maxPrice: number): string {
  if (minPrice === maxPrice) return formatPrice(minPrice)
  return `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`
}

export function getLocalDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function formatDate(isoOrDate: string | Date, locale?: string): string {
  try {
    const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate
    return d.toLocaleString(locale ?? undefined, { dateStyle: "short", timeStyle: "short" })
  } catch {
    return typeof isoOrDate === "string" ? isoOrDate : ""
  }
}

// ——— Product labels (sync fallback when no i18n) ———
const PRODUCT_LABELS: Record<string, string> = {
  half_sheep: "Half Sheep",
  half_goat: "Half Goat",
  whole_sheep: "Whole Sheep",
  whole_goat: "Whole Goat",
}
export function getProductLabel(productType: string): string {
  return PRODUCT_LABELS[productType] ?? productType
}

// ——— Product defaults (used by content.ts and sync getProductConfig) ———
export const PRODUCT_DEFAULTS: Record<
  string,
  { label: string; minPrice: number; maxPrice: number; imageUrl: string }
> = {
  half_sheep: { label: "Half Sheep", minPrice: 400, maxPrice: 800, imageUrl: "" },
  half_goat: { label: "Half Goat", minPrice: 350, maxPrice: 700, imageUrl: "" },
  whole_sheep: { label: "Whole Sheep", minPrice: 750, maxPrice: 2550, imageUrl: "" },
  whole_goat: { label: "Whole Goat", minPrice: 650, maxPrice: 2200, imageUrl: "" },
}

export type ProductConfig = {
  productType: string
  label: string
  minPrice: number
  maxPrice: number
  imageUrl: string
}

export function getProductConfig(productType: string): ProductConfig | null {
  const p = PRODUCT_DEFAULTS[productType]
  if (!p) return null
  return { productType, label: p.label, minPrice: p.minPrice, maxPrice: p.maxPrice, imageUrl: p.imageUrl }
}

// ——— Special cuts (fallback for OrderDetailsForm when no DB) ———
export type SpecialCutOption = { id: string; label: string; imageUrl: string; videoUrl?: string }

export const SPECIAL_CUTS: SpecialCutOption[] = [
  { id: "arabic_8", label: "تقطيع عربى 8 قطع", imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80" },
  { id: "arabic_4", label: "تقطيع عربى 4 قطع", imageUrl: "https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80" },
  { id: "arabic_half_length", label: "تقطيع عربى نص طول", imageUrl: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&q=80" },
  { id: "fridge_medium", label: "تقطيع ثلاجه (قطع متوسطة)", imageUrl: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&q=80" },
  { id: "salona_small", label: "تقطيع صالونه (قطع صغيرة)", imageUrl: "https://images.unsplash.com/photo-1615937691172-6119668cae97?w=400&q=80" },
  { id: "biryani_large", label: "تقطيع برياني (قطع كبيرة)", imageUrl: "https://images.unsplash.com/photo-1615937691172-6119668cae97?w=400&q=80" },
  { id: "hadrami_joints", label: "حضرمي مفاصل", imageUrl: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80" },
  { id: "maftah", label: "مفطح", imageUrl: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&q=80" },
]
