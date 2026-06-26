import { createClient } from "@kifolio/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { acceptInstructorInvite } from "@/lib/orgs/invites";
import { resolveOrgMemberDisplayName } from "@/lib/orgs/onboarding";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const token = typeof body.token === "string" ? body.token : "";

  const result = await acceptInstructorInvite({
    token,
    userId: user.id,
    userEmail: user.email,
    displayNameFallback: resolveOrgMemberDisplayName(
      { display_name: null },
      user
    ),
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, orgId: result.orgId });
}
