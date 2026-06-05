"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getOrgNavItems } from "@/config/org-nav";
import { OrgLogo } from "./OrgLogo";

export function OrgSidebar({
  isAdmin,
  onNavigate,
}: {
  isAdmin: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = getOrgNavItems(isAdmin);

  return (
    <aside className="flex h-full w-60 flex-col border-r border-discovery-beige-100 bg-white">
      <div className="px-5 py-5">
        <Link href="/dashboard/overview" onClick={onNavigate}>
          <OrgLogo />
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const className = `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            active
              ? "bg-discovery-blue/10 text-discovery-blue"
              : "text-discovery-grey hover:bg-discovery-blue/10 hover:text-discovery-blue"
          }`;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={className}
              onClick={onNavigate}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
