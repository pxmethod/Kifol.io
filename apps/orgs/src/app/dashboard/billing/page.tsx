import { redirect } from "next/navigation";
import { createClient } from "@kifolio/supabase/server";
import { MemberUsageBar } from "@/components/billing/MemberUsageBar";
import { DashboardCard } from "@/components/shell/DashboardCard";
import {
  DashboardPage,
  DashboardPageHeader,
} from "@/components/shell/DashboardPage";
import { getOrgContextForUser } from "@/lib/orgs/context";
import { resolveOrgBillingState } from "@/lib/orgs/billing";
import { getActiveMemberCount } from "@/lib/orgs/members";
import { getSubscriptionDetails } from "@/lib/orgs/stripe-subscription";
import { PLAN_DEFINITIONS, planTitle } from "@/lib/plans";
import { BillingCheckout } from "./BillingCheckout";
import { BillingCancelSection } from "./BillingCancelSection";

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const ctx = await getOrgContextForUser(user.id);
  if (!ctx) redirect("/login");
  if (ctx.member.role !== "admin") {
    redirect("/dashboard/overview");
  }

  const org = ctx.organization;
  const billing = resolveOrgBillingState(org);
  const memberCount = await getActiveMemberCount(org.id);
  const memberLimit = org.member_limit ?? PLAN_DEFINITIONS.starter.memberLimit;
  const subscription = await getSubscriptionDetails(org.stripe_subscription_id);

  const renewalLabel = subscription
    ? subscription.currentPeriodEnd.toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const isCanceled = org.subscription_status === "canceled";
  const cancelPending = subscription?.cancelAtPeriodEnd ?? false;

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Billing"
        description={
          billing.isOnFreeTrial
            ? "You are on a free trial. Subscribe anytime — billing starts when you choose a plan."
            : "Manage your subscription and payment method."
        }
      />

      {billing.isOnFreeTrial && billing.trialEndsAt && (
        <DashboardCard
          padding="default"
          className="border border-discovery-primary/20 bg-discovery-primary/5"
        >
          <p className="text-sm text-discovery-grey">
            <span className="font-medium text-discovery-primary">
              Free trial active.
            </span>{" "}
            {billing.trialDaysRemaining} day
            {billing.trialDaysRemaining === 1 ? "" : "s"} remaining (ends{" "}
            {new Date(billing.trialEndsAt).toLocaleDateString()}).
          </p>
        </DashboardCard>
      )}

      {cancelPending && renewalLabel && (
        <DashboardCard
          padding="default"
          className="border border-amber-200 bg-amber-50"
        >
          <p className="text-sm text-amber-800">
            Subscription ending {renewalLabel}. Your org stays active until
            then.
          </p>
        </DashboardCard>
      )}

      {isCanceled && (
        <DashboardCard
          padding="default"
          className="border border-red-200 bg-red-50"
        >
          <p className="text-sm text-red-800">
            Your subscription has ended. Reactivate below to restore access.
          </p>
        </DashboardCard>
      )}

      <DashboardCard>
        <h3 className="text-lg font-semibold text-discovery-black">
          Current plan
        </h3>
        <div className="mt-4 space-y-2 text-sm">
          <p className="text-discovery-black">
            <span className="font-medium">{planTitle(org.plan_tier)} plan</span>
            {billing.hasPaidSubscription && (
              <span className="text-discovery-grey">
                {" "}
                · {PLAN_DEFINITIONS[org.plan_tier].monthlyPrice}
              </span>
            )}
          </p>
          {renewalLabel && billing.hasPaidSubscription && !isCanceled && (
            <p className="text-discovery-grey">
              {cancelPending ? "Ends" : "Renews"} {renewalLabel}
            </p>
          )}
          <p className="text-discovery-grey">
            Up to {memberLimit} members · {memberCount} invited
          </p>
        </div>

        <div className="mt-6">
          <h4 className="mb-2 text-sm font-medium text-discovery-black">
            Member usage
          </h4>
          <MemberUsageBar used={memberCount} limit={memberLimit} tier={org.plan_tier} />
        </div>
      </DashboardCard>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-discovery-black">
          Change plan
        </h3>
        <BillingCheckout
          currentTier={org.plan_tier}
          hasPaidSubscription={billing.hasPaidSubscription}
          isCanceled={isCanceled}
        />
      </div>

      <DashboardCard>
        <BillingCancelSection
          canCancel={billing.hasPaidSubscription && !isCanceled && !cancelPending}
          periodEndLabel={renewalLabel}
        />
      </DashboardCard>
    </DashboardPage>
  );
}
