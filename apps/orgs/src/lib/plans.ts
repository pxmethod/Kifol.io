export type PlanTier = "starter" | "growth" | "studio";

export type BillingInterval = "monthly" | "annual";

export type PlanDefinition = {
  tier: PlanTier;
  title: string;
  subtitle: string;
  memberLimit: number;
  popular?: boolean;
  monthlyPrice: string;
  annualPrice: string;
  annualTotal: string;
  annualSavings: string;
  billingNote: string;
  features: string[];
};

export const PLAN_TIERS: PlanTier[] = ["starter", "growth", "studio"];

export const PLAN_DEFINITIONS: Record<PlanTier, PlanDefinition> = {
  starter: {
    tier: "starter",
    title: "Starter",
    subtitle: "Up to 30 members",
    memberLimit: 30,
    monthlyPrice: "$14.99/mo",
    annualPrice: "$13.25/mo",
    annualTotal: "$159/yr",
    annualSavings: "save $21",
    billingNote: "Billed monthly",
    features: [
      "Up to 30 parent invites",
      "Unlimited instructors",
      "Verified badge + profile",
      "Endorsements & shoutouts",
      "Parent approval flow",
    ],
  },
  growth: {
    tier: "growth",
    title: "Growth",
    subtitle: "Up to 75 members",
    memberLimit: 75,
    popular: true,
    monthlyPrice: "$29.99/mo",
    annualPrice: "$26.58/mo",
    annualTotal: "$319/yr",
    annualSavings: "save $41",
    billingNote: "Billed monthly",
    features: [
      "Up to 75 parent invites",
      "Unlimited instructors",
      "Everything in Starter",
      "Promotions (rank/level)",
      "Priority email support",
    ],
  },
  studio: {
    tier: "studio",
    title: "Studio",
    subtitle: "Up to 150 members",
    memberLimit: 150,
    monthlyPrice: "$49.99/mo",
    annualPrice: "$44.25/mo",
    annualTotal: "$531/yr",
    annualSavings: "save $69",
    billingNote: "Billed monthly",
    features: [
      "Up to 150 parent invites",
      "Unlimited instructors",
      "Everything in Growth",
      "Custom verified badge colors",
      "Dedicated onboarding",
    ],
  },
};

export const ALL_PLANS: PlanDefinition[] = [
  PLAN_DEFINITIONS.starter,
  PLAN_DEFINITIONS.growth,
  PLAN_DEFINITIONS.studio,
];

export function memberLimitForTier(tier: PlanTier): number {
  return PLAN_DEFINITIONS[tier].memberLimit;
}

export function planTitle(tier: PlanTier): string {
  return PLAN_DEFINITIONS[tier].title;
}
