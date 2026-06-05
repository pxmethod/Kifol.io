"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";
import { useOrgAuth } from "@/contexts/OrgAuthContext";

export function OrgUserMenu({
  userLabel,
  compact = false,
}: {
  userLabel: string;
  /** On mobile header: avatar + chevron only */
  compact?: boolean;
}) {
  const router = useRouter();
  const { signOut } = useOrgAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await signOut();
    router.push("/login");
    router.refresh();
  };

  const initial = userLabel.charAt(0).toUpperCase();

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-sm text-discovery-grey hover:bg-discovery-beige-100 sm:gap-2 sm:px-2 sm:py-1.5"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
      >
        {!compact && (
          <span className="hidden max-w-[8rem] truncate sm:inline md:max-w-[12rem]">
            {userLabel}
          </span>
        )}
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-discovery-orange text-sm font-medium text-white">
          {initial}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0" />
      </button>
      {open && (
        <div
          className="absolute right-0 z-[60] mt-1 w-48 rounded-lg border border-discovery-beige-300 bg-white py-1 shadow-lg"
          role="menu"
        >
          {compact && (
            <p className="border-b border-discovery-beige-100 px-4 py-2 text-sm font-medium text-discovery-black truncate">
              {userLabel}
            </p>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-discovery-grey hover:bg-discovery-beige-100"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
