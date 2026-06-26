import { createClient } from "@kifolio/supabase/server";
import { getOrgContextForUser, type OrgMemberContext } from "./context";

type AdminResult =
  | { ok: true; ctx: OrgMemberContext; userId: string }
  | { ok: false; error: string; status: number };

export async function requireAdminContext(): Promise<AdminResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Unauthorized", status: 401 };
  }

  const ctx = await getOrgContextForUser(user.id);
  if (!ctx) {
    return { ok: false, error: "Unauthorized", status: 401 };
  }

  if (ctx.member.role !== "admin") {
    return { ok: false, error: "Forbidden", status: 403 };
  }

  return { ok: true, ctx, userId: user.id };
}
