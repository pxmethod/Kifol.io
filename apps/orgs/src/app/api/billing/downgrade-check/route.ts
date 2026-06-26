import { NextRequest, NextResponse } from "next/server";
import { canDowngradeTo } from "@/lib/orgs/members";
import { requireAdminContext } from "@/lib/orgs/require-admin";
import type { PlanTier } from "@/lib/plans";

export async function POST(request: NextRequest) {
  const auth = await requireAdminContext();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const targetTier =
    typeof body.targetTier === "string" ? body.targetTier : "";

  const validTiers: PlanTier[] = ["starter", "growth", "studio"];
  if (!validTiers.includes(targetTier as PlanTier)) {
    return NextResponse.json({ error: "Invalid plan tier." }, { status: 400 });
  }

  const result = await canDowngradeTo(auth.ctx.organization.id, targetTier);

  return NextResponse.json(result);
}
