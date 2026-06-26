import { redirect } from "next/navigation";
import { createClient } from "@kifolio/supabase/server";
import { SettingsNav } from "@/components/settings/SettingsNav";
import {
  DashboardPage,
  DashboardPageHeader,
} from "@/components/shell/DashboardPage";
import { getOrgContextForUser } from "@/lib/orgs/context";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const ctx = await getOrgContextForUser(user.id);
  if (!ctx) redirect("/login");

  if (ctx.member.role !== "admin") {
    redirect("/dashboard/overview");
  }

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Settings"
        description="Set up your org profile, logo, and verified badge."
      />
      <SettingsNav />
      <div className="mt-6">{children}</div>
    </DashboardPage>
  );
}
