import { redirect } from "next/navigation";
import type { Database } from "@kifolio/db-types";
import { createClient } from "@kifolio/supabase/server";
import { MemberStatusBadge } from "@/components/members/MemberStatusBadge";
import {
  DashboardCard,
  DashboardCardHeader,
} from "@/components/shell/DashboardCard";
import {
  DashboardPage,
  DashboardPageHeader,
} from "@/components/shell/DashboardPage";
import { getOrgContextForUser } from "@/lib/orgs/context";

type InstructorRow = Pick<
  Database["public"]["Tables"]["org_members"]["Row"],
  "id" | "display_name" | "job_title" | "status" | "joined_at" | "invited_at"
>;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function InstructorsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const ctx = await getOrgContextForUser(user.id);
  if (!ctx) redirect("/login");

  const { data: instructors } = await supabase
    .from("org_members")
    .select("id, display_name, job_title, status, joined_at, invited_at")
    .eq("org_id", ctx.organization.id)
    .eq("role", "instructor")
    .order("joined_at", { ascending: false });

  const rows = (instructors ?? []) as InstructorRow[];
  const active = rows.filter((r) => r.status === "active");
  const inactive = rows.filter((r) => r.status !== "active");

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Instructors"
        description="Team members who can endorse and manage student achievements."
      />

      {rows.length === 0 ? (
        <DashboardCard padding="lg" className="text-center">
          <p className="text-discovery-grey">
            No instructors yet. Accepted invites will show up here.
          </p>
        </DashboardCard>
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <InstructorSection title="Active" rows={active} />
          )}
          {inactive.length > 0 && (
            <InstructorSection title="Inactive" rows={inactive} />
          )}
        </div>
      )}
    </DashboardPage>
  );
}

function InstructorSection({
  title,
  rows,
}: {
  title: string;
  rows: InstructorRow[];
}) {
  return (
    <DashboardCard padding="none">
      <DashboardCardHeader title={title} />
      <ul className="divide-y divide-gray-100">
        {rows.map((member) => (
          <li
            key={member.id}
            className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-medium text-discovery-black">
                {member.display_name ?? "Instructor"}
              </p>
              {member.job_title && (
                <p className="text-sm text-discovery-grey">{member.job_title}</p>
              )}
              <p className="text-sm text-discovery-grey">
                Joined {formatDate(member.joined_at)}
                {member.invited_at &&
                  ` · Invited ${formatDate(member.invited_at)}`}
              </p>
            </div>
            <MemberStatusBadge status={member.status} />
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
