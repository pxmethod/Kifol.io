import { createAdminClient } from "@kifolio/database";
import { createClient } from "@kifolio/supabase/server";
import type { Database } from "@kifolio/db-types";

export type PortfolioOrgConnection = {
  connectedAt: string;
  org: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    location: string | null;
  };
};

type ConnectionListRow = Pick<
  Database["public"]["Tables"]["portfolio_org_connections"]["Row"],
  "connected_at" | "org_id"
>;

type OrganizationRow = Pick<
  Database["public"]["Tables"]["organizations"]["Row"],
  "id" | "name" | "slug" | "logo_url" | "location"
>;

export async function getPortfolioOrgs(
  portfolioId: string
): Promise<PortfolioOrgConnection[]> {
  const supabase = await createClient();
  const { data: connections, error } = await supabase
    .from("portfolio_org_connections")
    .select("connected_at, org_id")
    .eq("portfolio_id", portfolioId)
    .eq("status", "connected")
    .order("connected_at", { ascending: true });

  if (error) {
    console.error("[getPortfolioOrgs]", error);
    return [];
  }

  const rows = (connections ?? []) as ConnectionListRow[];
  if (rows.length === 0) return [];

  const orgIds = [...new Set(rows.map((row) => row.org_id))];
  const admin = createAdminClient();
  const { data: orgs, error: orgError } = await admin
    .from("organizations")
    .select("id, name, slug, logo_url, location")
    .in("id", orgIds);

  if (orgError) {
    console.error("[getPortfolioOrgs] org lookup:", orgError);
    return [];
  }

  const orgById = new Map(
    ((orgs ?? []) as OrganizationRow[]).map((org) => [org.id, org])
  );

  return rows
    .map((row) => {
      const org = orgById.get(row.org_id);
      if (!org) return null;
      return {
        connectedAt: row.connected_at,
        org: {
          id: org.id,
          name: org.name,
          slug: org.slug,
          logoUrl: org.logo_url,
          location: org.location,
        },
      };
    })
    .filter((row): row is PortfolioOrgConnection => row !== null);
}
