import { createClient } from "@kifolio/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { acceptParentInvite } from "@/lib/orgs/acceptParentInvite";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const inviteToken =
    typeof body.inviteToken === "string" ? body.inviteToken.trim() : "";
  const portfolioId =
    typeof body.portfolioId === "string" ? body.portfolioId.trim() : "";

  if (!inviteToken || !portfolioId) {
    return NextResponse.json(
      { error: "Invite token and portfolio are required." },
      { status: 400 }
    );
  }

  const result = await acceptParentInvite({
    inviteToken,
    portfolioId,
    userId: user.id,
    userEmail: user.email,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    childName: result.childName,
    orgName: result.orgName,
    message: `${result.childName} is now connected to ${result.orgName}`,
  });
}
