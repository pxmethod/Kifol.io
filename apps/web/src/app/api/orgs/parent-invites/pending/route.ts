import { createClient } from "@kifolio/supabase/server";
import { NextResponse } from "next/server";
import type { Database } from "@kifolio/db-types";
import {
  getConnectedOrgIdsForPortfolios,
  getPendingOrgInvites,
} from "@/lib/orgs/pendingInvites";

type PortfolioListRow = Pick<
  Database["public"]["Tables"]["portfolios"]["Row"],
  "id" | "child_name" | "photo_url"
>;

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invites = await getPendingOrgInvites(user.email);

  const { data: portfolios } = await supabase
    .from("portfolios")
    .select("id, child_name, photo_url")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const portfolioRows = (portfolios ?? []) as PortfolioListRow[];
  const portfolioIds = portfolioRows.map((p) => p.id);
  const connectedByPortfolio = await getConnectedOrgIdsForPortfolios(
    portfolioIds
  );

  return NextResponse.json({
    invites,
    portfolios: portfolioRows.map((p) => ({
      id: p.id,
      childName: p.child_name,
      photoUrl: p.photo_url,
      connectedOrgIds: Array.from(connectedByPortfolio.get(p.id) ?? []),
    })),
  });
}
