import { createClient } from "@kifolio/supabase/server";
import { redirect } from "next/navigation";
import { GettingStartedChecklist } from "@/components/onboarding/GettingStartedChecklist";
import { BillingBanner } from "@/components/shell/BillingBanner";
import { DashboardCard } from "@/components/shell/DashboardCard";
import {
  DashboardPage,
  DashboardPageHeader,
} from "@/components/shell/DashboardPage";
import { getOrgContextForUser } from "@/lib/orgs/context";
import { resolveOrgBillingState } from "@/lib/orgs/billing";
import {
  isOnboardingComplete,
  resolveOnboardingChecklist,
  resolveOrgMemberDisplayName,
} from "@/lib/orgs/onboarding";

export default async function DashboardOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const ctx = await getOrgContextForUser(user.id);
  if (!ctx) redirect("/login");

  const { organization: org } = ctx;
  const billing = resolveOrgBillingState(org);
  const userName = resolveOrgMemberDisplayName(ctx.member, user);

  const [instructors, invites, parentInvites] = await Promise.all([
    supabase
      .from("org_members")
      .select("*", { count: "exact", head: true })
      .eq("org_id", org.id)
      .eq("role", "instructor")
      .eq("status", "active"),
    supabase
      .from("org_invites")
      .select("*", { count: "exact", head: true })
      .eq("org_id", org.id)
      .eq("status", "pending"),
    supabase
      .from("org_parent_invites")
      .select("*", { count: "exact", head: true })
      .eq("org_id", org.id),
  ]);

  const checklist = resolveOnboardingChecklist({
    organization: org,
    instructorCount: instructors.count ?? 0,
    pendingInviteCount: invites.count ?? 0,
    parentInviteCount: parentInvites.count ?? 0,
  });
  const onboardingComplete = isOnboardingComplete(checklist);

  const params = await searchParams;
  const checkoutNotice =
    params.checkout === "success"
      ? "Subscription updated successfully."
      : params.checkout === "canceled"
        ? "Checkout was canceled."
        : null;

  return (
    <DashboardPage>
      <DashboardPageHeader
        title={`Welcome, ${userName}`}
        description={
          onboardingComplete
            ? "Your organization is all set."
            : "Get your organization set up and ready to go"
        }
      />

      {checkoutNotice && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {checkoutNotice}
        </div>
      )}
      {onboardingComplete && <BillingBanner status={billing.bannerStatus} />}

      {onboardingComplete ? (
        <div className="grid gap-6 sm:grid-cols-2">
          <DashboardCard>
            <h3 className="text-lg font-semibold text-discovery-black">Members</h3>
            <p className="mt-2 text-sm text-discovery-grey">
              View pending invites and active members from the Members page.
            </p>
          </DashboardCard>
          <DashboardCard>
            <h3 className="text-lg font-semibold text-discovery-black">
              Achievements
            </h3>
            <p className="mt-2 text-sm text-discovery-grey">
              Endorsements and promotions will appear here in Phase 4.
            </p>
          </DashboardCard>
        </div>
      ) : (
        <GettingStartedChecklist items={checklist} />
      )}
    </DashboardPage>
  );
}
