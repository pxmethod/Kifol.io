import { createClient } from "@kifolio/supabase/server";
import type { Database } from "@kifolio/db-types";

export type OrgMemberContext = {
  member: Database["public"]["Tables"]["org_members"]["Row"];
  organization: Database["public"]["Tables"]["organizations"]["Row"];
};

export async function getOrgContextForUser(
  userId: string
): Promise<OrgMemberContext | null> {
  const supabase = await createClient();
  const { data: member, error: memberError } = await supabase
    .from("org_members")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (memberError || !member) return null;

  const memberRow = member as Database["public"]["Tables"]["org_members"]["Row"];

  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", memberRow.org_id)
    .single();

  if (orgError || !organization) return null;

  return {
    member: memberRow,
    organization: organization as Database["public"]["Tables"]["organizations"]["Row"],
  };
}
