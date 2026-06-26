import { createClient } from "@kifolio/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { createInstructorInvite } from "@/lib/orgs/invites";
import { requireAdminContext } from "@/lib/orgs/require-admin";
import { resolveOrgMemberDisplayName } from "@/lib/orgs/onboarding";

export async function POST(request: NextRequest) {
  const auth = await requireAdminContext();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const body = await request.json();
  const email = typeof body.email === "string" ? body.email : "";
  const displayName =
    typeof body.displayName === "string" ? body.displayName : undefined;
  const jobTitle =
    typeof body.jobTitle === "string" ? body.jobTitle : undefined;

  const result = await createInstructorInvite({
    orgId: auth.ctx.organization.id,
    email,
    displayName,
    jobTitle,
    invitedBy: auth.userId,
    orgName: auth.ctx.organization.name,
    orgLogo: auth.ctx.organization.logo_url,
    inviterName: resolveOrgMemberDisplayName(auth.ctx.member, user ?? {}),
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ inviteId: result.inviteId });
}
