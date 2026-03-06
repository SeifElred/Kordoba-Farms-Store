/**
 * Server-side cart line price. Prefers DB lookup by weightOptionId; falls back to legacy band ids.
 * Used by /api/checkout/cart to avoid trusting client-submitted prices.
 */
import type { PrismaClient } from "@prisma/client";

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
  /** DB WeightOption id (preferred); price resolved from DB */
  weightOptionId?: string;
  /** Legacy band id (e.g. whole_28_30); used when weightOptionId missing */
  weightSelection?: string;
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

function getLegacyCartLinePrice(item: CartLineItemPayload): number {
  const isWhole =
    item.product === "whole_sheep" || item.product === "whole_goat";
  const sel = item.weightSelection;
  if (!isWhole || !sel) return 0;
  const bands =
    item.occasion === "personal" ? PERSONAL_BANDS : QURBAN_AQIQAH_BANDS;
  const band = bands.find((b) => b.id === sel);
  return band ? band.price : 0;
}

export async function getCartLinePrices(
  items: CartLineItemPayload[],
  prisma: PrismaClient
): Promise<number[]> {
  const uniqueWeightOptionIds = Array.from(
    new Set(
      items
        .map((item) => item.weightOptionId)
        .filter((id): id is string => typeof id === "string" && id.length > 0)
    )
  );

  const weightOptionPriceMap =
    uniqueWeightOptionIds.length > 0
      ? new Map(
          (
            await prisma.weightOption.findMany({
              where: { id: { in: uniqueWeightOptionIds } },
              select: { id: true, price: true },
            })
          ).map((option) => [option.id, option.price])
        )
      : new Map<string, number>();

  return items.map((item) => {
    if (item.weightOptionId) {
      const dbPrice = weightOptionPriceMap.get(item.weightOptionId);
      if (dbPrice != null) return dbPrice;
    }
    return getLegacyCartLinePrice(item);
  });
}

/**
 * Returns price in MYR for a cart line item. Uses DB when weightOptionId present; else legacy bands.
 */
export async function getCartLinePrice(
  item: CartLineItemPayload,
  prisma: PrismaClient
): Promise<number> {
  const [price] = await getCartLinePrices([item], prisma);
  return price ?? 0;
}

export async function getCartTotalMYR(
  items: CartLineItemPayload[],
  prisma: PrismaClient
): Promise<number> {
  const prices = await getCartLinePrices(items, prisma);
  return prices.reduce((total, price) => total + price, 0);
}
