import { createAdminClient } from "@kifolio/database";
import { generateSlug } from "./slug";

export function normalizeOrgSlug(input: string): string {
  return generateSlug(input);
}

export async function isSlugAvailable(
  slug: string,
  excludeOrgId: string
): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("organizations")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return true;
  return data.id === excludeOrgId;
}
