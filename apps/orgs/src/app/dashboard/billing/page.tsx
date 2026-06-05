import { redirect } from "next/navigation";
import { createClient } from "@kifolio/supabase/server";
import { DashboardCard } from "@/components/shell/DashboardCard";
import {
  DashboardPage,
  DashboardPageHeader,
} from "@/components/shell/DashboardPage";
import { getOrgContextForUser } from "@/lib/orgs/context";
import { resolveOrgBillingState } from "@/lib/orgs/billing";
import { BillingCheckout } from "./BillingCheckout";

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
            <span className="font-medium text-discovery-primary">Free trial active.</span>{" "}
            {billing.trialDaysRemaining} day
            {billing.trialDaysRemaining === 1 ? "" : "s"} remaining (ends{" "}
            {new Date(billing.trialEndsAt).toLocaleDateString()}).
          </p>
        </DashboardCard>
      )}

      <DashboardCard>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-discovery-grey">Status</dt>
            <dd className="font-medium text-discovery-black">
              {billing.displayStatus}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-discovery-grey">Plan</dt>
            <dd className="font-medium capitalize text-discovery-black">
              {org.plan_tier}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-discovery-grey">Seats</dt>
            <dd className="font-medium text-discovery-black">{org.seat_limit}</dd>
          </div>
        </dl>
      </DashboardCard>

      <BillingCheckout currentTier={org.plan_tier} />
    </DashboardPage>
  );
}
