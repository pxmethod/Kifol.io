import { DashboardCard } from "@/components/shell/DashboardCard";
import { SealBuilderForm } from "@/components/settings/SealBuilderForm";
import { isSealTemplateId } from "@/config/sealTemplates";
import { getOrgContextForUser } from "@/lib/orgs/context";
import { createClient } from "@kifolio/supabase/server";
import { redirect } from "next/navigation";

export default async function SealSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const ctx = await getOrgContextForUser(user.id);
  if (!ctx) redirect("/login");

  const org = ctx.organization;
  const initialTemplateId =
    org.seal_template_id && isSealTemplateId(org.seal_template_id)
      ? org.seal_template_id
      : null;

  return (
    <DashboardCard padding="lg">
      <SealBuilderForm
        orgName={org.name}
        logoUrl={org.logo_url}
        initialTemplateId={initialTemplateId}
      />
    </DashboardCard>
  );
}
