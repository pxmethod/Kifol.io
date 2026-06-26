import { createAdminClient } from "@kifolio/database";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminContext } from "@/lib/orgs/require-admin";

export async function POST(request: NextRequest) {
  const auth = await requireAdminContext();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const memberId = typeof body.memberId === "string" ? body.memberId : "";

  if (memberId === auth.ctx.member.id) {
    return NextResponse.json(
      { error: "You cannot remove yourself." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("org_members")
    .update({ status: "removed" })
    .eq("id", memberId)
    .eq("org_id", auth.ctx.organization.id)
    .eq("role", "instructor")
    .eq("status", "active");

  if (error) {
    return NextResponse.json({ error: "Failed to remove instructor." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
