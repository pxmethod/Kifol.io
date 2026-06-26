import { redirect } from "next/navigation";
import type { Database } from "@kifolio/db-types";
import { createClient } from "@kifolio/supabase/server";
import { InstructorManagement } from "@/components/instructors/InstructorManagement";
import { DashboardCard } from "@/components/shell/DashboardCard";
import { getOrgContextForUser } from "@/lib/orgs/context";
import { resolveOrgMemberDisplayName } from "@/lib/orgs/onboarding";

type StaffRow = Pick<
  Database["public"]["Tables"]["org_members"]["Row"],
  "id" | "user_id" | "role" | "display_name" | "job_title" | "photo_url" | "status"
>;

type InviteRow = Pick<
  Database["public"]["Tables"]["org_invites"]["Row"],
  "id" | "email" | "created_at" | "status"
>;

function formatInviteSent(iso: string, nowMs: number) {
  const days = Math.floor(
    (nowMs - new Date(iso).getTime()) / (24 * 60 * 60 * 1000)
  );
  if (days === 0) return "Sent today";
  if (days === 1) return "Sent 1 day ago";
  return `Sent ${days} days ago`;
}

export default async function InstructorsPage() {
  const nowMs = new Date().getTime();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const ctx = await getOrgContextForUser(user.id);
  if (!ctx) redirect("/login");

  const isAdmin = ctx.member.role === "admin";

  const [staffResult, invitesResult] = await Promise.all([
    supabase
      .from("org_members")
      .select("id, user_id, role, display_name, job_title, photo_url, status")
      .eq("org_id", ctx.organization.id)
      .eq("status", "active")
      .order("joined_at", { ascending: true }),
    supabase
      .from("org_invites")
      .select("id, email, created_at, status")
      .eq("org_id", ctx.organization.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
  ]);

  const staff = (staffResult.data ?? []) as StaffRow[];
  const pendingInvites = (invitesResult.data ?? []) as InviteRow[];

  const instructors = staff.map((member) => ({
    id: member.id,
    displayName:
      member.display_name?.trim() ||
      (member.user_id === user.id
        ? resolveOrgMemberDisplayName(member, user)
        : "Team member"),
    jobTitle: member.job_title,
    photoUrl: member.photo_url,
    role: member.role,
    isCurrentUser: member.user_id === user.id,
  }));

  return (
    <DashboardCard padding="lg">
      <InstructorManagement
        orgName={ctx.organization.name}
        isAdmin={isAdmin}
        instructors={instructors}
        pendingInvites={pendingInvites.map((invite) => ({
          id: invite.id,
          email: invite.email,
          sentLabel: formatInviteSent(invite.created_at, nowMs),
        }))}
      />
    </DashboardCard>
  );
}
