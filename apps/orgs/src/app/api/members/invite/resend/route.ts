import { NextRequest, NextResponse } from "next/server";
import { resendParentInvite } from "@/lib/orgs/parentInvites";
import { requireAdminContext } from "@/lib/orgs/require-admin";

export async function POST(request: NextRequest) {
  const auth = await requireAdminContext();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const inviteId = typeof body.inviteId === "string" ? body.inviteId : "";

  const result = await resendParentInvite({
    inviteId,
    orgId: auth.ctx.organization.id,
    orgName: auth.ctx.organization.name,
    orgLogo: auth.ctx.organization.logo_url,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    message: `Invite resent to ${result.email} for ${result.studentName}`,
  });
}
