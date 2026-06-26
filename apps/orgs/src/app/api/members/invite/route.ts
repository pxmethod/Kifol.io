import { NextRequest, NextResponse } from "next/server";
import {
  createParentInvite,
  resendParentInvite,
} from "@/lib/orgs/parentInvites";
import { requireAdminContext } from "@/lib/orgs/require-admin";

export async function POST(request: NextRequest) {
  const auth = await requireAdminContext();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const email = typeof body.email === "string" ? body.email : "";
  const studentFirstName =
    typeof body.studentFirstName === "string" ? body.studentFirstName : "";
  const studentLastName =
    typeof body.studentLastName === "string" ? body.studentLastName : "";
  const personalNote =
    typeof body.personalNote === "string" ? body.personalNote : undefined;
  const resendExisting = body.resendExisting === true;
  const duplicateInviteId =
    typeof body.duplicateInviteId === "string"
      ? body.duplicateInviteId
      : undefined;

  if (resendExisting && duplicateInviteId) {
    const result = await resendParentInvite({
      inviteId: duplicateInviteId,
      orgId: auth.ctx.organization.id,
      orgName: auth.ctx.organization.name,
      orgLogo: auth.ctx.organization.logo_url,
    });
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({
      resent: true,
      message: `Invite resent to ${result.email} for ${result.studentName}`,
    });
  }

  const result = await createParentInvite({
    orgId: auth.ctx.organization.id,
    email,
    studentFirstName,
    studentLastName,
    personalNote,
    invitedBy: auth.userId,
    orgName: auth.ctx.organization.name,
    orgLogo: auth.ctx.organization.logo_url,
  });

  if ("error" in result) {
    const status = result.duplicateInviteId ? 409 : 400;
    return NextResponse.json(
      {
        error: result.error,
        duplicateInviteId: result.duplicateInviteId,
      },
      { status }
    );
  }

  return NextResponse.json({
    inviteId: result.inviteId,
    message: `Invite sent to ${result.email} for ${result.studentName}`,
  });
}
