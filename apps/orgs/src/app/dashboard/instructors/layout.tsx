import { ReactNode } from "react";
import {
  DashboardPage,
  DashboardPageHeader,
} from "@/components/shell/DashboardPage";

export default function InstructorsLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Instructors"
        description="Verified staff who can write endorsements, promotions, and other achievements for your members."
      />
      {children}
    </DashboardPage>
  );
}
