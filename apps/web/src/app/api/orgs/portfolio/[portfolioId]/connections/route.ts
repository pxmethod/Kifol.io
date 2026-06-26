import { createClient } from "@kifolio/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getPortfolioOrgs } from "@/lib/orgs/portfolioConnections";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  const { portfolioId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("id")
    .eq("id", portfolioId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!portfolio) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const connections = await getPortfolioOrgs(portfolioId);
  return NextResponse.json({ connections });
}
