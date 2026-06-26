import { createAdminClient } from "@kifolio/database";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminContext } from "@/lib/orgs/require-admin";
import { uploadOrgLogo } from "@/lib/orgs/storage";

export async function POST(request: NextRequest) {
  const auth = await requireAdminContext();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Logo file is required." }, { status: 400 });
  }

  try {
    const logoUrl = await uploadOrgLogo(auth.ctx.organization.id, file);
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("organizations")
      .update({ logo_url: logoUrl })
      .eq("id", auth.ctx.organization.id)
      .select("logo_url")
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to save logo." }, { status: 500 });
    }

    return NextResponse.json({ logoUrl: data.logo_url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 400 }
    );
  }
}
