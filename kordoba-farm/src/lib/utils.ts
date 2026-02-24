import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency = "MYR"): string {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPriceRange(minPrice: number, maxPrice: number, currency = "MYR"): string {
  if (minPrice === maxPrice) return formatPrice(minPrice, currency);
  return `${formatPrice(minPrice, currency)} – ${formatPrice(maxPrice, currency)}`;
}

export function formatDate(date: Date | string, locale = "en"): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
  }).format(new Date(date));
}

/** Local date as YYYY-MM-DD for date inputs (avoids UTC offset issues). */
export function getLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const PRODUCT_LABELS: Record<string, string> = {
  half_goat: "½ Goat",
  half_sheep: "½ Sheep",
  whole_goat: "Whole Goat",
  whole_sheep: "Whole Sheep",
};

export function getProductLabel(productType: string): string {
  return PRODUCT_LABELS[productType] ?? productType;
}

/** Price range (from weight variations) and image per product type. Replace with your own ranges and assets. */
export const PRODUCT_DEFAULTS: Record<
  string,
  { label: string; minPrice: number; maxPrice: number; imageUrl: string }
> = {
  half_sheep: {
    label: "½ Sheep",
    minPrice: 500,
    maxPrice: 700,
    imageUrl: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=600&q=80",
  },
  half_goat: {
    label: "½ Goat",
    minPrice: 400,
    maxPrice: 600,
    imageUrl: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=600&q=80",
  },
  whole_sheep: {
    label: "Whole Sheep",
    minPrice: 1000,
    maxPrice: 1400,
    imageUrl: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&q=80",
  },
  whole_goat: {
    label: "Whole Goat",
    minPrice: 800,
    maxPrice: 1200,
    imageUrl: "https://images.unsplash.com/photo-1578645510387-c3e02018f305?w=600&q=80",
  },
};

export function getProductConfig(
  productType: string
): { label: string; minPrice: number; maxPrice: number; imageUrl: string } | null {
  return PRODUCT_DEFAULTS[productType] ?? null;
}

/** Special cut options: image + optional YouTube video. Replace with your own assets and video URLs. */
export type SpecialCutOption = {
  id: string;
  label: string;
  imageUrl: string;
  videoUrl?: string;
};

export const SPECIAL_CUTS: SpecialCutOption[] = [
  {
    id: "leg",
    label: "Leg cut",
    imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "shoulder",
    label: "Shoulder cut",
    imageUrl: "https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "rack",
    label: "Rack / ribs",
    imageUrl: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&q=80",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "whole",
    label: "Whole (no cut)",
    imageUrl: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&q=80",
  },
];
