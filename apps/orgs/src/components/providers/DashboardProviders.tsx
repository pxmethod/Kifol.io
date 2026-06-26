"use client";

import { OrgAuthProvider } from "@/contexts/OrgAuthContext";

/**
 * Re-wraps OrgAuthProvider for dashboard routes. A server layout sits between
 * the root provider and shell client components, which breaks context in
 * Next.js 16 — this restores it for OrgUserMenu and other dashboard hooks.
 */
export function DashboardProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OrgAuthProvider>{children}</OrgAuthProvider>;
}
