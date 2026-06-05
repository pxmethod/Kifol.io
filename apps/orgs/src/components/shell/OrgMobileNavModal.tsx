"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { getOrgNavItems } from "@/config/org-nav";
import { OrgLogo } from "./OrgLogo";

export function OrgMobileNavModal({
  open,
  onClose,
  isAdmin,
}: {
  open: boolean;
  onClose: () => void;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const items = getOrgNavItems(isAdmin);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-sm max-h-[min(24rem,calc(100vh-4rem))] overflow-y-auto rounded-xl border border-discovery-beige-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-discovery-beige-100 px-4 py-3">
          <OrgLogo className="h-8 w-auto" />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-discovery-grey hover:bg-discovery-beige-100"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-2">
          <ul className="space-y-1">
            {items.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                      active
                        ? "bg-discovery-blue/10 text-discovery-blue"
                        : "text-discovery-grey hover:bg-discovery-blue/10 hover:text-discovery-blue"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
