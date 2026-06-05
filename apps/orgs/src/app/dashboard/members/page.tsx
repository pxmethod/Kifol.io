import { redirect } from "next/navigation";
import type { Database } from "@kifolio/db-types";
import { createClient } from "@kifolio/supabase/server";
import { InviteStatusBadge } from "@/components/members/InviteStatusBadge";
import {
  DashboardCard,
  DashboardCardHeader,
} from "@/components/shell/DashboardCard";
import {
  DashboardPage,
  DashboardPageHeader,
} from "@/components/shell/DashboardPage";
import { getOrgContextForUser } from "@/lib/orgs/context";

type OrgInviteRow = Pick<
  Database["public"]["Tables"]["org_invites"]["Row"],
  "id" | "email" | "status" | "created_at" | "expires_at"
>;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function MembersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const ctx = await getOrgContextForUser(user.id);
  if (!ctx) redirect("/login");

  const isAdmin = ctx.member.role === "admin";

  if (!isAdmin) {
    return (
      <DashboardPage>
        <DashboardPageHeader
          title="Members"
          description="Instructor invites sent from your organization."
        />
        <DashboardCard padding="lg" className="text-center">
          <p className="text-discovery-grey">
            Only organization admins can view and manage invites.
          </p>
        </DashboardCard>
      </DashboardPage>
    );
  }

  const { data: invites } = await supabase
    .from("org_invites")
    .select("id, email, status, created_at, expires_at")
    .eq("org_id", ctx.organization.id)
    .order("created_at", { ascending: false });

  const rows = (invites ?? []) as OrgInviteRow[];
  const pending = rows.filter((r) => r.status === "pending");
  const active = rows.filter((r) => r.status === "accepted");
  const other = rows.filter(
    (r) => r.status !== "pending" && r.status !== "accepted"
  );

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Members"
        description="Instructor invites sent from your organization — active, pending, and past."
      />

      {rows.length === 0 ? (
        <DashboardCard padding="lg" className="text-center">
          <p className="text-discovery-grey">
            No invites yet. When you invite instructors, they will appear here.
          </p>
        </DashboardCard>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <InviteSection
              title="Pending"
              description="Invites sent and awaiting acceptance."
              rows={pending}
            />
          )}
          {active.length > 0 && (
            <InviteSection
              title="Active"
              description="Invites that have been accepted."
              rows={active}
            />
          )}
          {other.length > 0 && (
            <InviteSection
              title="Other"
              description="Expired or revoked invites."
              rows={other}
            />
          )}
        </div>
      )}
    </DashboardPage>
  );
}

function InviteSection({
  title,
  description,
  rows,
}: {
  title: string;
  description: string;
  rows: OrgInviteRow[];
}) {
  return (
    <DashboardCard padding="none">
      <DashboardCardHeader title={title} description={description} />
      <ul className="divide-y divide-gray-100">
        {rows.map((invite) => (
          <li
            key={invite.id}
            className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-discovery-black">
                {invite.email}
              </p>
              <p className="text-sm text-discovery-grey">
                Sent {formatDate(invite.created_at)}
                {invite.status === "pending" &&
                  ` · Expires ${formatDate(invite.expires_at)}`}
              </p>
            </div>
            <InviteStatusBadge status={invite.status} />
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
