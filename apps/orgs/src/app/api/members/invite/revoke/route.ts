import { NextRequest, NextResponse } from "next/server";
import { revokeParentInvite } from "@/lib/orgs/parentInvites";
import { requireAdminContext } from "@/lib/orgs/require-admin";

export async function POST(request: NextRequest) {
  const auth = await requireAdminContext();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const inviteId = typeof body.inviteId === "string" ? body.inviteId : "";

  const result = await revokeParentInvite(inviteId, auth.ctx.organization.id);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
