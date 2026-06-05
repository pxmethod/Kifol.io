import { createAdminClient } from "@kifolio/database";
import { generateSlug } from "./slug";

export async function resolveUniqueSlug(baseName: string): Promise<string> {
  const supabase = createAdminClient();
  let slug = generateSlug(baseName);
  if (!slug) slug = "org";

  let candidate = slug;
  let n = 2;

  while (true) {
    const { data } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (!data) return candidate;
    candidate = `${slug}-${n}`;
    n += 1;
  }
}
