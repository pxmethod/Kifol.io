"use client";

import { OrgAvatar } from "./OrgAvatar";
import { OrgUserMenu } from "./OrgUserMenu";
import type { PlanTier } from "@/lib/plans";
import { PlanBadge } from "./PlanBadge";

/** Desktop header — hidden on mobile (see OrgShell mobile bar). */
export function OrgTopBar({
  orgName,
  orgLogoUrl,
  planTier,
  userLabel,
}: {
  orgName: string;
  orgLogoUrl?: string | null;
  planTier: PlanTier;
  userLabel: string;
}) {
  return (
    <header className="hidden h-14 shrink-0 items-center justify-between border-b border-discovery-beige-100 bg-white px-4 shadow-sm sm:px-6 lg:flex">
      <div className="flex min-w-0 items-center gap-3">
        <OrgAvatar name={orgName} logoUrl={orgLogoUrl} />
        <h1 className="truncate text-lg font-semibold text-discovery-black">
          {orgName}
        </h1>
        <PlanBadge tier={planTier} />
      </div>
      <OrgUserMenu userLabel={userLabel} />
    </header>
  );
}
