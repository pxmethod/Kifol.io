import {
  CreditCard,
  GraduationCap,
  Home,
  Users,
  type LucideIcon,
} from "lucide-react";

export type OrgNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

export const ORG_NAV_ITEMS: OrgNavItem[] = [
  { label: "Home", href: "/dashboard/overview", icon: Home },
  { label: "Members", href: "/dashboard/members", icon: Users },
  { label: "Instructors", href: "/dashboard/instructors", icon: GraduationCap },
  {
    label: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
    adminOnly: true,
  },
];

export function getOrgNavItems(isAdmin: boolean): OrgNavItem[] {
  return ORG_NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);
}
