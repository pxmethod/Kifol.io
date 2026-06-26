"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard/settings/profile", label: "Profile" },
  { href: "/dashboard/settings/seal", label: "Verified Badge" },
] as const;

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b border-gray-200">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              active
                ? "border-discovery-primary text-discovery-primary"
                : "border-transparent text-discovery-grey hover:text-discovery-black"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
