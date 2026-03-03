/**
 * Server-side cart line price. Must match OrderWizard bands so checkout total is consistent.
 * Used by /api/checkout/cart to avoid trusting client-submitted prices.
 */
const QURBAN_AQIQAH_BANDS: { id: string; price: number }[] = [
  { id: "whole_28_30", price: 1020 },
  { id: "whole_31_33", price: 1120 },
  { id: "whole_34_36", price: 1250 },
  { id: "whole_37_40", price: 1350 },
  { id: "whole_41_45", price: 1500 },
  { id: "whole_46_50", price: 1675 },
  { id: "whole_51_55", price: 1850 },
  { id: "whole_56_60", price: 1950 },
  { id: "whole_61_65", price: 2050 },
  { id: "whole_66_70", price: 2200 },
  { id: "whole_71_75", price: 2400 },
  { id: "whole_76_80", price: 2550 },
];

const PERSONAL_BANDS: { id: string; price: number }[] = [
  { id: "personal_17_20", price: 750 },
  { id: "personal_21_26", price: 825 },
  { id: "personal_28_30", price: 1000 },
  { id: "personal_31_33", price: 1120 },
  { id: "personal_34_36", price: 1220 },
  { id: "personal_37_40", price: 1320 },
];

export type CartLineItemPayload = {
  product: string;
  occasion: string;
  weightSelection: string;
  specialCutId: string;
  specialCutLabel: string;
  slaughterDate: string;
  distribution: string;
  videoProof: boolean;
  includeHead: boolean;
  includeStomach: boolean;
  includeIntestines: boolean;
  note: string;
  productLabel: string;
};

/**
 * Returns price in MYR for a cart line item. Uses fixed bands for whole carcass; otherwise 0 (invalid).
 */
export function getCartLinePrice(item: CartLineItemPayload): number {
  const isWhole =
    item.product === "whole_sheep" || item.product === "whole_goat";
  if (!isWhole || !item.weightSelection) return 0;
  const bands =
    item.occasion === "personal" ? PERSONAL_BANDS : QURBAN_AQIQAH_BANDS;
  const band = bands.find((b) => b.id === item.weightSelection);
  return band ? band.price : 0;
}

export function getCartTotalMYR(items: CartLineItemPayload[]): number {
  return items.reduce((sum, item) => sum + getCartLinePrice(item), 0);
}
