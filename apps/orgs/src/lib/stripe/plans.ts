export type PlanTier = "solo" | "team";

export type PlanFromPrice = {
  tier: PlanTier;
  seats: number;
};

export function planFromStripePriceId(priceId: string): PlanFromPrice {
  const map: Record<string, PlanFromPrice> = {};

  const soloMonthly = process.env.STRIPE_PRICE_SOLO_MONTHLY;
  const soloAnnual = process.env.STRIPE_PRICE_SOLO_ANNUAL;
  const teamMonthly = process.env.STRIPE_PRICE_TEAM_MONTHLY;
  const teamAnnual = process.env.STRIPE_PRICE_TEAM_ANNUAL;

  if (soloMonthly) map[soloMonthly] = { tier: "solo", seats: 1 };
  if (soloAnnual) map[soloAnnual] = { tier: "solo", seats: 1 };
  if (teamMonthly) map[teamMonthly] = { tier: "team", seats: 10 };
  if (teamAnnual) map[teamAnnual] = { tier: "team", seats: 10 };

  return map[priceId] ?? { tier: "solo", seats: 1 };
}

export const STRIPE_PRICES = {
  soloMonthly: () => process.env.STRIPE_PRICE_SOLO_MONTHLY,
  soloAnnual: () => process.env.STRIPE_PRICE_SOLO_ANNUAL,
  teamMonthly: () => process.env.STRIPE_PRICE_TEAM_MONTHLY,
  teamAnnual: () => process.env.STRIPE_PRICE_TEAM_ANNUAL,
} as const;
