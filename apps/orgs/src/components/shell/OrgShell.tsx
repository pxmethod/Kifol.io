"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { OrgAvatar } from "./OrgAvatar";
import { OrgMobileNavModal } from "./OrgMobileNavModal";
import { OrgSidebar } from "./OrgSidebar";
import { OrgTopBar } from "./OrgTopBar";
import { OrgUserMenu } from "./OrgUserMenu";
import { TrialBanner } from "./TrialBanner";

export function OrgShell({
  children,
  orgName,
  orgLogoUrl,
  planTier,
  userLabel,
  isAdmin,
  trialDaysRemaining,
}: {
  children: React.ReactNode;
  orgName: string;
  orgLogoUrl?: string | null;
  planTier: "solo" | "team";
  userLabel: string;
  isAdmin: boolean;
  trialDaysRemaining?: number | null;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const showTrialBanner =
    trialDaysRemaining !== null && trialDaysRemaining !== undefined;

  return (
    <div className="flex min-h-screen flex-col bg-discovery-gray">
      {showTrialBanner && <TrialBanner daysRemaining={trialDaysRemaining} />}
      <div className="flex min-h-0 flex-1">
        <div className="hidden lg:block">
          <OrgSidebar isAdmin={isAdmin} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile: single consolidated header */}
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-discovery-gray/10 bg-white px-3 shadow-sm lg:hidden">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="shrink-0 rounded-lg p-2 text-discovery-grey hover:bg-discovery-beige-100"
              aria-label="Open menu"
              aria-expanded={mobileNavOpen}
            >
              <Menu className="h-5 w-5" />
            </button>
            <OrgAvatar
              name={orgName}
              logoUrl={orgLogoUrl}
              className="h-8 w-8 shrink-0"
            />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-discovery-black">
              {orgName}
            </span>
            <OrgUserMenu userLabel={userLabel} compact />
          </header>

          <OrgMobileNavModal
            open={mobileNavOpen}
            onClose={() => setMobileNavOpen(false)}
            isAdmin={isAdmin}
          />

          <OrgTopBar
            orgName={orgName}
            orgLogoUrl={orgLogoUrl}
            planTier={planTier}
            userLabel={userLabel}
          />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
