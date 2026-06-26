import { createClient } from "@kifolio/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { resendInstructorInvite } from "@/lib/orgs/invites";
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
  const inviteId = typeof body.inviteId === "string" ? body.inviteId : "";

  const result = await resendInstructorInvite({
    inviteId,
    orgId: auth.ctx.organization.id,
    orgName: auth.ctx.organization.name,
    orgLogo: auth.ctx.organization.logo_url,
    inviterName: resolveOrgMemberDisplayName(auth.ctx.member, user ?? {}),
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
