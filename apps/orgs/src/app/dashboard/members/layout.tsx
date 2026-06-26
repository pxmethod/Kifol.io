import { ReactNode } from "react";
import {
  DashboardPage,
  DashboardPageHeader,
} from "@/components/shell/DashboardPage";

export default function MembersLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Members"
        description="View, manage and provide endorsements, recognition or promotions to members of your organization"
      />
      {children}
    </DashboardPage>
  );
}
