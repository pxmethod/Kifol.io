import { createAdminClient } from "@kifolio/database";
import type { Database } from "@kifolio/db-types";

type OrganizationRow = Database["public"]["Tables"]["organizations"]["Row"];

/** Days after exceeding member cap before upgrade prompts intensify (never hard-blocked). */
export const MEMBER_LIMIT_GRACE_DAYS = 7;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Active parent invites: accepted or pending. Archived/removed/expired/revoked do not count. */
export async function getActiveMemberCount(orgId: string): Promise<number> {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from("org_parent_invites")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId)
    .in("status", ["pending", "accepted"]);

  if (error) {
    console.error("[members] count error:", error);
    return 0;
  }
  return count ?? 0;
}

export type MemberLimitState = {
  memberCount: number;
  memberLimit: number | null;
  isOverLimit: boolean;
  isUnlimited: boolean;
  /** True during the first 7 days after exceeding the cap */
  inGracePeriod: boolean;
  graceDaysRemaining: number | null;
  /** Show upgrade prompt after grace period ends */
  showUpgradePrompt: boolean;
};

export function resolveMemberLimitState(input: {
  memberCount: number;
  memberLimit: number | null;
  memberLimitExceededAt: string | null;
}): MemberLimitState {
  const isUnlimited = input.memberLimit === null;
  const isOverLimit =
    !isUnlimited &&
    input.memberLimit !== null &&
    input.memberCount > input.memberLimit;

  if (!isOverLimit) {
    return {
      memberCount: input.memberCount,
      memberLimit: input.memberLimit,
      isOverLimit: false,
      isUnlimited,
      inGracePeriod: false,
      graceDaysRemaining: null,
      showUpgradePrompt: false,
    };
  }

  const exceededMs = input.memberLimitExceededAt
    ? new Date(input.memberLimitExceededAt).getTime()
    : null;
  const now = Date.now();

  let inGracePeriod = true;
  let graceDaysRemaining: number | null = MEMBER_LIMIT_GRACE_DAYS;

  if (exceededMs !== null && !Number.isNaN(exceededMs)) {
    const elapsedDays = (now - exceededMs) / MS_PER_DAY;
    inGracePeriod = elapsedDays < MEMBER_LIMIT_GRACE_DAYS;
    graceDaysRemaining = inGracePeriod
      ? Math.max(1, Math.ceil(MEMBER_LIMIT_GRACE_DAYS - elapsedDays))
      : null;
  }

  return {
    memberCount: input.memberCount,
    memberLimit: input.memberLimit,
    isOverLimit: true,
    isUnlimited,
    inGracePeriod,
    graceDaysRemaining,
    showUpgradePrompt: !inGracePeriod,
  };
}

/** Keep member_limit_exceeded_at in sync with current member count. */
export async function syncMemberLimitExceededAt(
  orgId: string,
  org: Pick<
    OrganizationRow,
    "member_limit" | "member_limit_exceeded_at" | "plan_tier"
  >
): Promise<MemberLimitState> {
  const memberCount = await getActiveMemberCount(orgId);
  const state = resolveMemberLimitState({
    memberCount,
    memberLimit: org.member_limit,
    memberLimitExceededAt: org.member_limit_exceeded_at,
  });

  const admin = createAdminClient();
  const now = new Date().toISOString();

  if (state.isOverLimit && !org.member_limit_exceeded_at) {
    await admin
      .from("organizations")
      .update({ member_limit_exceeded_at: now })
      .eq("id", orgId);
    return resolveMemberLimitState({
      memberCount,
      memberLimit: org.member_limit,
      memberLimitExceededAt: now,
    });
  }

  if (!state.isOverLimit && org.member_limit_exceeded_at) {
    await admin
      .from("organizations")
      .update({ member_limit_exceeded_at: null })
      .eq("id", orgId);
  }

  return state;
}

export async function canInviteMember(orgId: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  reason?: string;
}> {
  const admin = createAdminClient();
  const current = await getActiveMemberCount(orgId);

  const { data: org } = await admin
    .from("organizations")
    .select("member_limit, plan_tier, member_limit_exceeded_at")
    .eq("id", orgId)
    .single();

  const limit = org?.member_limit ?? 30;

  if (current >= limit) {
    return {
      allowed: false,
      current,
      limit,
      reason: `You've reached your ${limit}-member limit on the ${org?.plan_tier ?? "starter"} plan.`,
    };
  }

  const state = resolveMemberLimitState({
    memberCount: current,
    memberLimit: org?.member_limit ?? limit,
    memberLimitExceededAt: org?.member_limit_exceeded_at ?? null,
  });

  if (state.isOverLimit && state.showUpgradePrompt) {
    return {
      allowed: false,
      current,
      limit,
      reason:
        "Your member count exceeds your plan limit. Upgrade or remove members to invite more.",
    };
  }

  return { allowed: true, current, limit };
}

const TARGET_LIMITS: Record<string, number> = {
  starter: 30,
  growth: 75,
  studio: 150,
};

export async function canDowngradeTo(
  orgId: string,
  targetTier: string
): Promise<{ allowed: boolean; reason?: string }> {
  const targetLimit = TARGET_LIMITS[targetTier];
  if (targetLimit === undefined) {
    return { allowed: false, reason: "Invalid plan tier." };
  }

  const current = await getActiveMemberCount(orgId);

  if (current > targetLimit) {
    return {
      allowed: false,
      reason: `You have ${current} active members. The ${targetTier} plan supports up to ${targetLimit}. Remove ${current - targetLimit} member(s) before downgrading.`,
    };
  }

  return { allowed: true };
}
