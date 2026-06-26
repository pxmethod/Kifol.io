import { redirect } from "next/navigation";
import type { Database } from "@kifolio/db-types";
import { createClient } from "@kifolio/supabase/server";
import { DashboardCard } from "@/components/shell/DashboardCard";
import {
  ParentManagement,
  type ParentInviteRow,
} from "@/components/members/ParentManagement";
import { getOrgContextForUser } from "@/lib/orgs/context";
import { getActiveMemberCount } from "@/lib/orgs/members";
import { resolveParentInviteDisplayStatus } from "@/lib/orgs/parentInvites";

type InviteRow = Pick<
  Database["public"]["Tables"]["org_parent_invites"]["Row"],
  | "id"
  | "email"
  | "student_first_name"
  | "student_last_name"
  | "status"
  | "expires_at"
  | "created_at"
>;

type ConnectionRow = Pick<
  Database["public"]["Tables"]["portfolio_org_connections"]["Row"],
  "invited_via" | "status"
>;

export default async function MembersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const ctx = await getOrgContextForUser(user.id);
  if (!ctx) redirect("/login");

  const isAdmin = ctx.member.role === "admin";
  const orgId = ctx.organization.id;

  const [invitesResult, connectionsResult, memberUsed] = await Promise.all([
    supabase
      .from("org_parent_invites")
      .select(
        "id, email, student_first_name, student_last_name, status, expires_at, created_at"
      )
      .eq("org_id", orgId)
      .order("created_at", { ascending: false }),
    supabase
      .from("portfolio_org_connections")
      .select("invited_via, status")
      .eq("org_id", orgId),
    getActiveMemberCount(orgId),
  ]);

  const invites = (invitesResult.data ?? []) as InviteRow[];
  const connections = (connectionsResult.data ?? []) as ConnectionRow[];

  const connectionByInvite = new Map<string, string>();
  for (const conn of connections) {
    if (conn.invited_via) {
      connectionByInvite.set(conn.invited_via, conn.status);
    }
  }

  const rows: ParentInviteRow[] = invites.map((invite) => ({
    id: invite.id,
    email: invite.email,
    studentFirstName: invite.student_first_name ?? "",
    studentLastName: invite.student_last_name ?? "",
    status: resolveParentInviteDisplayStatus({
      inviteStatus: invite.status,
      expiresAt: invite.expires_at,
      connectionStatus: connectionByInvite.get(invite.id),
    }),
    createdAt: invite.created_at,
  }));

  const memberLimit = ctx.organization.member_limit ?? 30;

  return (
    <DashboardCard padding="lg">
      <ParentManagement
        orgName={ctx.organization.name}
        planTier={ctx.organization.plan_tier ?? "starter"}
        isAdmin={isAdmin}
        memberUsed={memberUsed}
        memberLimit={memberLimit}
        invites={rows}
      />
    </DashboardCard>
  );
}
