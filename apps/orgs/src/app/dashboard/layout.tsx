import { redirect } from "next/navigation";
import { createClient } from "@kifolio/supabase/server";
import { DashboardProviders } from "@/components/providers/DashboardProviders";
import { OrgShell } from "@/components/shell/OrgShell";
import { resolveOrgBillingState } from "@/lib/orgs/billing";
import { syncMemberLimitExceededAt } from "@/lib/orgs/members";
import { getOrgContextForUser } from "@/lib/orgs/context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const ctx = await getOrgContextForUser(user.id);
  if (!ctx) {
    redirect("/login?message=No organization found for this account. Please sign up for an org account.");
  }

  const isAdmin = ctx.member.role === "admin";
  const userLabel =
    ctx.member.display_name || user.email?.split("@")[0] || "User";
  const billing = resolveOrgBillingState(ctx.organization);
  const trialDaysRemaining = billing.isOnFreeTrial
    ? billing.trialDaysRemaining
    : null;

  const memberLimitState = isAdmin
    ? await syncMemberLimitExceededAt(ctx.organization.id, ctx.organization)
    : null;

  return (
    <DashboardProviders>
      <OrgShell
        orgName={ctx.organization.name}
        orgLogoUrl={ctx.organization.logo_url}
        planTier={ctx.organization.plan_tier}
        userLabel={userLabel}
        isAdmin={isAdmin}
        trialDaysRemaining={trialDaysRemaining}
        memberLimitState={
          memberLimitState?.isOverLimit ? memberLimitState : null
        }
      >
        {children}
      </OrgShell>
    </DashboardProviders>
  );
}
