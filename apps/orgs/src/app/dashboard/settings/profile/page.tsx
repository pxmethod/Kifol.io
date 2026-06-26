import { DashboardCard } from "@/components/shell/DashboardCard";
import { OrgProfileForm } from "@/components/settings/OrgProfileForm";
import { getOrgContextForUser } from "@/lib/orgs/context";
import { createClient } from "@kifolio/supabase/server";
import { redirect } from "next/navigation";

export default async function ProfileSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const ctx = await getOrgContextForUser(user.id);
  if (!ctx) redirect("/login");

  const org = ctx.organization;

  return (
    <DashboardCard padding="lg">
      <OrgProfileForm
        initial={{
          name: org.name,
          slug: org.slug,
          logoUrl: org.logo_url,
          location: org.location ?? "",
          about: org.about ?? "",
        }}
      />
    </DashboardCard>
  );
}
