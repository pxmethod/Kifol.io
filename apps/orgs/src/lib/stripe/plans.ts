import {
  memberLimitForTier,
  type PlanTier,
} from "@/lib/plans";

export type { PlanTier };

export type PlanFromPrice = {
  tier: PlanTier;
  memberLimit: number;
};

export function planFromStripePriceId(priceId: string): PlanFromPrice {
  const map: Record<string, PlanFromPrice> = {};

  const pairs: [string | undefined, PlanTier][] = [
    [process.env.STRIPE_PRICE_STARTER_MONTHLY, "starter"],
    [process.env.STRIPE_PRICE_STARTER_ANNUAL, "starter"],
    [process.env.STRIPE_PRICE_GROWTH_MONTHLY, "growth"],
    [process.env.STRIPE_PRICE_GROWTH_ANNUAL, "growth"],
    [process.env.STRIPE_PRICE_STUDIO_MONTHLY, "studio"],
    [process.env.STRIPE_PRICE_STUDIO_ANNUAL, "studio"],
  ];

  for (const [id, tier] of pairs) {
    if (id) {
      map[id] = { tier, memberLimit: memberLimitForTier(tier) };
    }
  }

  return map[priceId] ?? { tier: "starter", memberLimit: 30 };
}

export const STRIPE_PRICES = {
  starterMonthly: () => process.env.STRIPE_PRICE_STARTER_MONTHLY,
  starterAnnual: () => process.env.STRIPE_PRICE_STARTER_ANNUAL,
  growthMonthly: () => process.env.STRIPE_PRICE_GROWTH_MONTHLY,
  growthAnnual: () => process.env.STRIPE_PRICE_GROWTH_ANNUAL,
  studioMonthly: () => process.env.STRIPE_PRICE_STUDIO_MONTHLY,
  studioAnnual: () => process.env.STRIPE_PRICE_STUDIO_ANNUAL,
} as const;
