import { createAdminClient } from "@kifolio/database";

export async function getActiveSeatCount(orgId: string): Promise<number> {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from("org_members")
    .select("*", { count: "exact", head: true })
    .eq("org_id", orgId)
    .eq("status", "active");

  if (error) {
    console.error("[seats] count error:", error);
    return 0;
  }
  return count ?? 0;
}

export async function canAddSeat(orgId: string): Promise<boolean> {
  const supabase = createAdminClient();
  const [count, orgResult] = await Promise.all([
    getActiveSeatCount(orgId),
    supabase.from("organizations").select("seat_limit").eq("id", orgId).single(),
  ]);

  const seatLimit = orgResult.data?.seat_limit ?? 1;
  return count < seatLimit;
}
