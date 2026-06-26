import {
  CreditCard,
  GraduationCap,
  Home,
  Settings,
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
  {
    label: "Instructors",
    href: "/dashboard/instructors",
    icon: GraduationCap,
  },
  { label: "Members", href: "/dashboard/members", icon: Users },
  {
    label: "Settings",
    href: "/dashboard/settings/profile",
    icon: Settings,
    adminOnly: true,
  },
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
