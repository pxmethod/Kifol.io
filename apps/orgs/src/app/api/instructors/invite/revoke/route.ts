import { NextRequest, NextResponse } from "next/server";
import { revokeInstructorInvite } from "@/lib/orgs/invites";
import { requireAdminContext } from "@/lib/orgs/require-admin";

export async function POST(request: NextRequest) {
  const auth = await requireAdminContext();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const inviteId = typeof body.inviteId === "string" ? body.inviteId : "";

  const result = await revokeInstructorInvite(
    inviteId,
    auth.ctx.organization.id
  );

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
