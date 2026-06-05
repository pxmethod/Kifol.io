import { DashboardCard } from "@/components/shell/DashboardCard";
import {
  DashboardPage,
  DashboardPageHeader,
} from "@/components/shell/DashboardPage";

export default function SettingsPlaceholderPage() {
  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Settings"
        description="Org profile, logo, and seal setup."
      />
      <DashboardCard padding="lg" className="text-center">
        <p className="text-discovery-grey">Coming in Phase 2.</p>
      </DashboardCard>
    </DashboardPage>
  );
}
