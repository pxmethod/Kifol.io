import { createAdminClient } from "@kifolio/database";
import { createClient } from "@kifolio/supabase/server";
import type { Database } from "@kifolio/db-types";

export type PendingOrgInvite = {
  id: string;
  token: string;
  studentFirstName: string;
  studentLastName: string;
  orgNameSnapshot: string | null;
  orgLogoSnapshot: string | null;
  expiresAt: string;
  orgId: string;
};

type PendingInviteRow = Pick<
  Database["public"]["Tables"]["org_parent_invites"]["Row"],
  | "id"
  | "token"
  | "student_first_name"
  | "student_last_name"
  | "org_name_snapshot"
  | "org_logo_snapshot"
  | "expires_at"
  | "org_id"
>;

type ConnectionRow = Pick<
  Database["public"]["Tables"]["portfolio_org_connections"]["Row"],
  "portfolio_id" | "org_id"
>;

export async function getPendingOrgInvites(
  parentEmail: string
): Promise<PendingOrgInvite[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("org_parent_invites")
    .select(
      "id, token, student_first_name, student_last_name, org_name_snapshot, org_logo_snapshot, expires_at, org_id"
    )
    .eq("email", parentEmail.trim().toLowerCase())
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getPendingOrgInvites]", error);
    return [];
  }

  return ((data ?? []) as PendingInviteRow[]).map((row) => ({
    id: row.id,
    token: row.token,
    studentFirstName: row.student_first_name ?? "",
    studentLastName: row.student_last_name ?? "",
    orgNameSnapshot: row.org_name_snapshot,
    orgLogoSnapshot: row.org_logo_snapshot,
    expiresAt: row.expires_at,
    orgId: row.org_id,
  }));
}

export async function getConnectedOrgIdsForPortfolios(
  portfolioIds: string[]
): Promise<Map<string, Set<string>>> {
  if (portfolioIds.length === 0) return new Map();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("portfolio_org_connections")
    .select("portfolio_id, org_id")
    .in("portfolio_id", portfolioIds)
    .eq("status", "connected");

  if (error) {
    console.error("[getConnectedOrgIdsForPortfolios]", error);
    return new Map();
  }

  const map = new Map<string, Set<string>>();
  for (const row of (data ?? []) as ConnectionRow[]) {
    const existing = map.get(row.portfolio_id) ?? new Set<string>();
    existing.add(row.org_id);
    map.set(row.portfolio_id, existing);
  }
  return map;
}

/** Admin lookup for public invite landing page. */
export async function getParentInviteByToken(token: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("org_parent_invites")
    .select("*")
    .eq("token", token)
    .maybeSingle();
  return data;
}
