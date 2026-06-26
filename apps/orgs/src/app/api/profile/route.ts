import { createAdminClient } from "@kifolio/database";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminContext } from "@/lib/orgs/require-admin";
import {
  isSlugAvailable,
  normalizeOrgSlug,
} from "@/lib/orgs/slug-available";

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminContext();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const slugInput = typeof body.slug === "string" ? body.slug.trim() : "";
  const location =
    typeof body.location === "string" ? body.location.trim() : null;
  const about = typeof body.about === "string" ? body.about.trim() : null;

  if (!name) {
    return NextResponse.json({ error: "Org name is required." }, { status: 400 });
  }

  if (about && about.length > 500) {
    return NextResponse.json(
      { error: "About must be 500 characters or fewer." },
      { status: 400 }
    );
  }

  const slug = normalizeOrgSlug(slugInput || name);
  if (!slug) {
    return NextResponse.json({ error: "Invalid slug." }, { status: 400 });
  }

  const orgId = auth.ctx.organization.id;
  const slugChanged = slug !== auth.ctx.organization.slug;

  if (slugChanged) {
    const available = await isSlugAvailable(slug, orgId);
    if (!available) {
      return NextResponse.json(
        { error: "This slug is already taken." },
        { status: 409 }
      );
    }
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("organizations")
    .update({
      name,
      slug,
      location: location || null,
      about: about || null,
    })
    .eq("id", orgId)
    .select("id, name, slug, logo_url, location, about, seal_template_id")
    .single();

  if (error) {
    console.error("[profile PATCH]", error);
    return NextResponse.json({ error: "Failed to save profile." }, { status: 500 });
  }

  return NextResponse.json({ organization: data });
}
