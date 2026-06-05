import type { Database } from "@kifolio/db-types";

type OrganizationRow = Database["public"]["Tables"]["organizations"]["Row"];

/** Default free trial length for new org signups (override via ORG_TRIAL_DAYS). */
export const ORG_TRIAL_DAYS = Math.max(
  1,
  Number(process.env.ORG_TRIAL_DAYS ?? 14) || 14
);

export function getOrgTrialEndsAt(from: Date = new Date()): string {
  const end = new Date(from);
  end.setUTCDate(end.getUTCDate() + ORG_TRIAL_DAYS);
  return end.toISOString();
}

export type OrgBillingBannerStatus =
  | "none"
  | "trial_expired"
  | "incomplete"
  | "past_due"
  | "canceled"
  | "unpaid";

export type OrgBillingState = {
  /** Whether org has an active paid Stripe subscription */
  hasPaidSubscription: boolean;
  /** Free trial (no payment yet) is currently active */
  isOnFreeTrial: boolean;
  /** Free trial ended and no paid subscription */
  isTrialExpired: boolean;
  trialEndsAt: string | null;
  trialDaysRemaining: number | null;
  bannerStatus: OrgBillingBannerStatus;
  /** Human-readable status for billing page */
  displayStatus: string;
};

function hasActivePaidSubscription(org: Pick<
  OrganizationRow,
  "stripe_subscription_id" | "subscription_status"
>): boolean {
  return (
    Boolean(org.stripe_subscription_id) &&
    org.subscription_status === "active"
  );
}

function trialEndMs(org: Pick<OrganizationRow, "trial_ends_at">): number | null {
  if (!org.trial_ends_at) return null;
  const ms = new Date(org.trial_ends_at).getTime();
  return Number.isNaN(ms) ? null : ms;
}

export function resolveOrgBillingState(
  org: Pick<
    OrganizationRow,
    "subscription_status" | "trial_ends_at" | "stripe_subscription_id"
  >
): OrgBillingState {
  const now = Date.now();
  const status = org.subscription_status ?? "incomplete";
  const paid = hasActivePaidSubscription(org);
  const endMs = trialEndMs(org);
  const onFreeTrial =
    !paid && endMs !== null && endMs > now;
  const trialExpired =
    !paid && endMs !== null && endMs <= now;

  const trialDaysRemaining =
    onFreeTrial && endMs !== null
      ? Math.max(1, Math.ceil((endMs - now) / (24 * 60 * 60 * 1000)))
      : null;

  let bannerStatus: OrgBillingBannerStatus = "none";
  if (paid) {
    bannerStatus = "none";
  } else if (onFreeTrial) {
    bannerStatus = "none";
  } else if (trialExpired) {
    bannerStatus = "trial_expired";
  } else if (status === "past_due") {
    bannerStatus = "past_due";
  } else if (status === "canceled") {
    bannerStatus = "canceled";
  } else if (status === "unpaid") {
    bannerStatus = "unpaid";
  } else if (status === "incomplete" || status === "trialing") {
    bannerStatus = "incomplete";
  }

  let displayStatus = "Subscription required";
  if (paid) {
    displayStatus = "Active subscription";
  } else if (onFreeTrial) {
    displayStatus = `Free trial · ${trialDaysRemaining} day${trialDaysRemaining === 1 ? "" : "s"} left`;
  } else if (trialExpired) {
    displayStatus = "Free trial ended";
  } else if (status === "trialing") {
    displayStatus = "Trialing";
  } else {
    displayStatus = status.replace("_", " ");
  }

  return {
    hasPaidSubscription: paid,
    isOnFreeTrial: onFreeTrial,
    isTrialExpired: trialExpired,
    trialEndsAt: org.trial_ends_at,
    trialDaysRemaining,
    bannerStatus,
    displayStatus,
  };
}
