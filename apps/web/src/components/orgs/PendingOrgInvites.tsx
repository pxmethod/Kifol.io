"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OrgAvatar } from "@/components/shared/OrgAvatar";
import type { PendingOrgInvite } from "@/lib/orgs/pendingInvites";

type PortfolioOption = {
  id: string;
  childName: string;
  photoUrl: string | null;
  connectedOrgIds: string[];
};

const DISMISS_KEY = "org-invite-dismissed";

function readDismissed(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(DISMISS_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function writeDismissed(ids: Set<string>) {
  sessionStorage.setItem(DISMISS_KEY, JSON.stringify(Array.from(ids)));
}

export function PendingOrgInvites({
  onAccepted,
}: {
  onAccepted?: (message: string) => void;
}) {
  const router = useRouter();
  const [invites, setInvites] = useState<PendingOrgInvite[]>([]);
  const [portfolios, setPortfolios] = useState<PortfolioOption[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [loadingInviteId, setLoadingInviteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/orgs/parent-invites/pending");
    if (!res.ok) return;
    const data = await res.json();
    setInvites(data.invites ?? []);
    setPortfolios(data.portfolios ?? []);
  }, []);

  useEffect(() => {
    setDismissed(readDismissed());
    void load();
  }, [load]);

  const visibleInvites = useMemo(
    () => invites.filter((invite) => !dismissed.has(invite.id)),
    [invites, dismissed]
  );

  const dismiss = (inviteId: string) => {
    const next = new Set(dismissed);
    next.add(inviteId);
    setDismissed(next);
    writeDismissed(next);
  };

  const acceptInvite = async (invite: PendingOrgInvite, portfolioId: string) => {
    setLoadingInviteId(invite.id);
    setError(null);
    setOpenDropdownId(null);
    try {
      const res = await fetch("/api/orgs/parent-invites/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteToken: invite.token,
          portfolioId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to accept invite.");
        return;
      }
      onAccepted?.(
        data.message ||
          `${data.childName} is now connected to ${data.orgName}`
      );
      setInvites((current) => current.filter((row) => row.id !== invite.id));
      router.refresh();
    } catch {
      setError("Failed to accept invite.");
    } finally {
      setLoadingInviteId(null);
    }
  };

  if (visibleInvites.length === 0 && !error) return null;

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {visibleInvites.map((invite) => {
        const orgName = invite.orgNameSnapshot ?? "Organization";
        const studentName =
          `${invite.studentFirstName} ${invite.studentLastName}`.trim();
        const portfolioOptions = portfolios.map((portfolio) => ({
          ...portfolio,
          alreadyConnected: portfolio.connectedOrgIds.includes(invite.orgId),
        }));

        return (
          <div
            key={invite.id}
            className="rounded-xl border border-discovery-beige-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <OrgAvatar
                  logo={invite.orgLogoSnapshot}
                  name={orgName}
                  size={40}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-discovery-black">
                    {orgName} has added {studentName} as a member.
                  </p>
                  <p className="mt-1 text-sm text-discovery-grey">
                    Choose a portfolio to accept the invite.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    disabled={loadingInviteId === invite.id}
                    onClick={() =>
                      setOpenDropdownId((current) =>
                        current === invite.id ? null : invite.id
                      )
                    }
                    className="rounded-pill border border-discovery-beige-200 bg-white px-4 py-2 text-sm font-medium text-discovery-black hover:bg-discovery-beige-50"
                  >
                    Choose portfolio ▾
                  </button>
                  {openDropdownId === invite.id && (
                    <div className="absolute right-0 top-full z-20 mt-2 min-w-[220px] rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
                      {portfolioOptions.map((portfolio) => (
                        <button
                          key={portfolio.id}
                          type="button"
                          disabled={
                            portfolio.alreadyConnected ||
                            loadingInviteId === invite.id
                          }
                          onClick={() =>
                            void acceptInvite(invite, portfolio.id)
                          }
                          className="block w-full px-4 py-2 text-left text-sm hover:bg-discovery-beige-50 disabled:cursor-not-allowed disabled:text-discovery-grey"
                        >
                          {portfolio.childName}
                          {portfolio.alreadyConnected && (
                            <span className="ml-2 text-discovery-grey">
                              Already connected ✓
                            </span>
                          )}
                        </button>
                      ))}
                      <Link
                        href={`/create?returnTo=${encodeURIComponent("/dashboard")}`}
                        className="block px-4 py-2 text-sm text-discovery-orange hover:bg-discovery-beige-50"
                        onClick={() => setOpenDropdownId(null)}
                      >
                        + Create new portfolio
                      </Link>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(invite.id)}
                  className="px-3 py-2 text-sm text-discovery-grey hover:text-discovery-black"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
