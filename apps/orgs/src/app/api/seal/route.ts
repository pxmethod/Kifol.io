import { createAdminClient } from "@kifolio/database";
import { NextRequest, NextResponse } from "next/server";
import { isSealTemplateId } from "@/config/sealTemplates";
import { requireAdminContext } from "@/lib/orgs/require-admin";

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminContext();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const templateId =
    typeof body.sealTemplateId === "string" ? body.sealTemplateId : "";

  if (!isSealTemplateId(templateId)) {
    return NextResponse.json(
      { error: "Invalid verified badge template." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("organizations")
    .update({ seal_template_id: templateId })
    .eq("id", auth.ctx.organization.id)
    .select("seal_template_id")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to save verified badge." },
      { status: 500 }
    );
  }

  return NextResponse.json({ sealTemplateId: data.seal_template_id });
}
