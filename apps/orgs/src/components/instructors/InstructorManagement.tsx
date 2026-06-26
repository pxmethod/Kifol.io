"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@kifolio/ui";
import { InstructorStatusBadge } from "@/components/instructors/InstructorStatusBadge";
import { ModalOverlay } from "@/components/shell/ModalOverlay";
import { orgsApi } from "@/lib/paths";

type InstructorRow = {
  id: string;
  displayName: string;
  jobTitle: string | null;
  photoUrl: string | null;
  role: "admin" | "instructor";
  isCurrentUser: boolean;
};

type PendingInvite = {
  id: string;
  email: string;
  sentLabel: string;
};

type InstructorTableRow = {
  id: string;
  rowType: "member" | "invite";
  name: string;
  jobTitle: string;
  status: "admin" | "active" | "pending";
  canRemove: boolean;
  inviteId?: string;
  memberId?: string;
  sentLabel?: string;
};

type FilterOption = "all" | "active" | "admin" | "pending";

const FILTER_SELECT_CLASS =
  "h-10 appearance-none rounded-lg border border-gray-300 bg-white bg-[length:1rem] bg-[position:right_10px_center] bg-no-repeat py-2 pl-3 pr-10 text-sm text-discovery-black";

const FILTER_SELECT_CHEVRON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`;

export function InstructorManagement({
  orgName,
  isAdmin,
  instructors,
  pendingInvites,
}: {
  orgName: string;
  isAdmin: boolean;
  instructors: InstructorRow[];
  pendingInvites: PendingInvite[];
}) {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<InstructorRow | null>(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [filter, setFilter] = useState<FilterOption>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const tableRows = useMemo((): InstructorTableRow[] => {
    const memberRows: InstructorTableRow[] = instructors.map((member) => ({
      id: member.id,
      rowType: "member",
      name:
        member.isCurrentUser && member.role === "admin"
          ? `${member.displayName} (you)`
          : member.displayName,
      jobTitle: member.jobTitle || "Instructor",
      status: member.role === "admin" ? "admin" : "active",
      canRemove:
        isAdmin &&
        member.role === "instructor" &&
        !member.isCurrentUser,
      memberId: member.id,
    }));

    const inviteRows: InstructorTableRow[] = pendingInvites.map((invite) => ({
      id: invite.id,
      rowType: "invite",
      name: invite.email,
      jobTitle: "—",
      status: "pending",
      canRemove: false,
      inviteId: invite.id,
      sentLabel: invite.sentLabel,
    }));

    return [...memberRows, ...inviteRows];
  }, [instructors, pendingInvites, isAdmin]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tableRows.filter((row) => {
      if (filter === "active" && row.status !== "active") return false;
      if (filter === "admin" && row.status !== "admin") return false;
      if (filter === "pending" && row.status !== "pending") return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.jobTitle.toLowerCase().includes(q) ||
        row.sentLabel?.toLowerCase().includes(q)
      );
    });
  }, [tableRows, filter, search]);

  const inviteInstructor = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(orgsApi("/api/instructors/invite"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, displayName, jobTitle }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send invite.");
        return;
      }
      setInviteOpen(false);
      setEmail("");
      setDisplayName("");
      setJobTitle("");
      setSuccess("Invite sent.");
      router.refresh();
    } catch {
      setError("Failed to send invite. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resendInvite = async (inviteId: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setOpenMenuId(null);
    try {
      const res = await fetch(orgsApi("/api/instructors/invite/resend"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ inviteId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to resend invite.");
        return;
      }
      setSuccess("Invite resent.");
      router.refresh();
    } catch {
      setError("Failed to resend invite.");
    } finally {
      setLoading(false);
    }
  };

  const revokeInvite = async (inviteId: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setOpenMenuId(null);
    try {
      const res = await fetch(orgsApi("/api/instructors/invite/revoke"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ inviteId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to revoke invite.");
        return;
      }
      setSuccess("Invite revoked.");
      router.refresh();
    } catch {
      setError("Failed to revoke invite.");
    } finally {
      setLoading(false);
    }
  };

  const removeInstructor = async (memberId: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(orgsApi("/api/instructors/remove"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ memberId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to remove.");
        return;
      }
      setRemoveTarget(null);
      setSuccess("Instructor removed.");
      router.refresh();
    } catch {
      setError("Failed to remove instructor.");
    } finally {
      setLoading(false);
    }
  };

  const openRemoveModal = (memberId: string) => {
    const member = instructors.find((row) => row.id === memberId);
    if (member) {
      setOpenMenuId(null);
      setRemoveTarget(member);
    }
  };

  const rowHasActions = (row: InstructorTableRow) =>
    isAdmin &&
    (row.rowType === "invite" || row.canRemove);

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p>{error}</p>
        </div>
      )}
      {success && (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {success}
        </p>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-discovery-black">
            Displaying {filteredRows.length}{" "}
            {filteredRows.length === 1 ? "instructor" : "instructors"}
          </h3>
        </div>
        {isAdmin && (
          <Button
            type="button"
            variant="discovery"
            className="shrink-0 self-start"
            onClick={() => {
              setError(null);
              setInviteOpen(true);
            }}
          >
            + Invite instructor
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm text-discovery-grey">
          Filter
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterOption)}
            className={FILTER_SELECT_CLASS}
            style={{ backgroundImage: FILTER_SELECT_CHEVRON }}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="admin">Admin</option>
            <option value="pending">Pending</option>
          </select>
        </label>
        <Input
          type="search"
          placeholder="Search by name or job title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 min-h-10 py-2 sm:ml-auto sm:max-w-xs"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-discovery-beige-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-discovery-grey">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-discovery-grey">
                Job title
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-discovery-grey">
                Status
              </th>
              {isAdmin && (
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-discovery-grey">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredRows.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3 text-sm font-medium text-discovery-black">
                  <div>{row.name}</div>
                  {row.sentLabel && (
                    <div className="mt-0.5 text-xs font-normal text-discovery-grey">
                      {row.sentLabel}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-discovery-grey">
                  {row.jobTitle}
                </td>
                <td className="px-4 py-3">
                  <InstructorStatusBadge status={row.status} />
                </td>
                {isAdmin && (
                  <td className="relative px-4 py-3 text-right">
                    {rowHasActions(row) ? (
                      <>
                        <button
                          type="button"
                          className="rounded-lg px-2 py-1 text-discovery-grey hover:bg-discovery-beige-100"
                          aria-label="Row actions"
                          onClick={() =>
                            setOpenMenuId((current) =>
                              current === row.id ? null : row.id
                            )
                          }
                        >
                          •••
                        </button>
                        {openMenuId === row.id && (
                          <div className="absolute right-4 top-10 z-10 min-w-[160px] rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
                            {row.rowType === "invite" && row.inviteId && (
                              <>
                                <button
                                  type="button"
                                  className="block w-full px-4 py-2 text-left text-sm hover:bg-discovery-beige-50"
                                  onClick={() => void resendInvite(row.inviteId!)}
                                >
                                  Resend invite
                                </button>
                                <button
                                  type="button"
                                  className="block w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50"
                                  onClick={() => void revokeInvite(row.inviteId!)}
                                >
                                  Revoke
                                </button>
                              </>
                            )}
                            {row.canRemove && row.memberId && (
                              <button
                                type="button"
                                className="block w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50"
                                onClick={() => openRemoveModal(row.memberId!)}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    ) : null}
                  </td>
                )}
              </tr>
            ))}
            {filteredRows.length === 0 && (
              <tr>
                <td
                  colSpan={isAdmin ? 4 : 3}
                  className="px-4 py-10 text-center text-sm text-discovery-grey"
                >
                  No instructors yet.
                  {isAdmin && " Invite your first instructor to get started."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!isAdmin && (
        <p className="text-sm text-discovery-grey">
          Only org admins can send and manage instructor invites.
        </p>
      )}

      <ModalOverlay
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        label="Invite instructor"
      >
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-discovery-black">
            Invite instructor
          </h3>
          <p className="mt-1 text-sm text-discovery-grey">
            Send an invite to join {orgName} as verified staff.
          </p>
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-sm font-medium text-discovery-grey">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-discovery-grey">
                Display name (optional)
              </label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-discovery-grey">
                Job title (optional)
              </label>
              <Input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Head Coach"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setInviteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="discovery"
              disabled={loading || !email.trim()}
              onClick={() => void inviteInstructor()}
            >
              {loading ? "Sending..." : "Send invite"}
            </Button>
          </div>
        </div>
      </ModalOverlay>

      <ModalOverlay
        open={removeTarget !== null}
        onClose={() => setRemoveTarget(null)}
        label={
          removeTarget
            ? `Remove ${removeTarget.displayName}`
            : "Remove instructor"
        }
      >
        {removeTarget && (
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-discovery-black">
              Remove {removeTarget.displayName}?
            </h3>
            <p className="mt-2 text-sm text-discovery-grey">
              They will lose access to this org immediately.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setRemoveTarget(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="discovery"
                className="bg-red-600 hover:bg-red-700"
                disabled={loading}
                onClick={() => void removeInstructor(removeTarget.id)}
              >
                Remove
              </Button>
            </div>
          </div>
        )}
      </ModalOverlay>
    </div>
  );
}
