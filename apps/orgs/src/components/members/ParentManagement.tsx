"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@kifolio/ui";
import { ModalOverlay } from "@/components/shell/ModalOverlay";
import { ParentInviteStatusBadge } from "@/components/members/ParentInviteStatusBadge";
import { orgsApi } from "@/lib/paths";
import type { ParentInviteRowStatus } from "@/lib/orgs/parentInvites";

export type ParentInviteRow = {
  id: string;
  email: string;
  studentFirstName: string;
  studentLastName: string;
  status: ParentInviteRowStatus;
  createdAt: string;
};

type FilterOption = "all" | ParentInviteRowStatus;

export function ParentManagement({
  orgName,
  planTier,
  isAdmin,
  memberUsed,
  memberLimit,
  invites,
}: {
  orgName: string;
  planTier: string;
  isAdmin: boolean;
  memberUsed: number;
  memberLimit: number;
  invites: ParentInviteRow[];
}) {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<ParentInviteRow | null>(
    null
  );
  const [duplicateInviteId, setDuplicateInviteId] = useState<string | null>(
    null
  );
  const [studentFirstName, setStudentFirstName] = useState("");
  const [studentLastName, setStudentLastName] = useState("");
  const [email, setEmail] = useState("");
  const [personalNote, setPersonalNote] = useState("");
  const [filter, setFilter] = useState<FilterOption>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredInvites = useMemo(() => {
    const q = search.trim().toLowerCase();
    return invites.filter((row) => {
      if (filter !== "all" && row.status !== filter) return false;
      if (!q) return true;
      const student = `${row.studentFirstName} ${row.studentLastName}`.toLowerCase();
      return student.includes(q) || row.email.toLowerCase().includes(q);
    });
  }, [invites, filter, search]);

  const resetInviteForm = () => {
    setStudentFirstName("");
    setStudentLastName("");
    setEmail("");
    setPersonalNote("");
    setDuplicateInviteId(null);
  };

  const sendInvite = async (resendExisting = false) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(orgsApi("/api/members/invite"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          email,
          studentFirstName,
          studentLastName,
          personalNote,
          resendExisting,
          duplicateInviteId: duplicateInviteId ?? undefined,
        }),
      });
      const data = await res.json();
      if (res.status === 409 && data.duplicateInviteId) {
        setDuplicateInviteId(data.duplicateInviteId);
        setError(
          "A pending invite already exists for this student. Resend the existing invite instead?"
        );
        return;
      }
      if (!res.ok) {
        setError(data.error || "Failed to send invite.");
        return;
      }
      setInviteOpen(false);
      resetInviteForm();
      setSuccess(data.message || "Invite sent.");
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
      const res = await fetch(orgsApi("/api/members/invite/resend"), {
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
      setSuccess(data.message || "Invite resent.");
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
    try {
      const res = await fetch(orgsApi("/api/members/invite/revoke"), {
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
      setRevokeTarget(null);
      setSuccess("Invite revoked.");
      router.refresh();
    } catch {
      setError("Failed to revoke invite.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p>{error}</p>
          {duplicateInviteId && (
            <Button
              type="button"
              variant="secondary"
              className="mt-3"
              disabled={loading}
              onClick={() => void sendInvite(true)}
            >
              Resend existing invite
            </Button>
          )}
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
            Displaying {filteredInvites.length}{" "}
            {filteredInvites.length === 1 ? "member" : "members"}
          </h3>
        </div>
        {isAdmin && (
          <Button
            type="button"
            variant="discovery"
            className="shrink-0 self-start"
            onClick={() => {
              resetInviteForm();
              setError(null);
              setInviteOpen(true);
            }}
          >
            + Invite parent
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm text-discovery-grey">
          Filter
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterOption)}
            className="h-10 appearance-none rounded-lg border border-gray-300 bg-white bg-[length:1rem] bg-[position:right_10px_center] bg-no-repeat py-2 pl-3 pr-10 text-sm text-discovery-black"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            }}
          >
            <option value="all">All</option>
            <option value="connected">Connected</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
            <option value="disconnected">Disconnected</option>
          </select>
        </label>
        <Input
          type="search"
          placeholder="Search by student or email"
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
                Student
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-discovery-grey">
                Parent email
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
            {filteredInvites.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3 text-sm font-medium text-discovery-black">
                  {row.studentFirstName} {row.studentLastName}
                </td>
                <td className="px-4 py-3 text-sm text-discovery-grey">
                  {row.email}
                </td>
                <td className="px-4 py-3">
                  <ParentInviteStatusBadge status={row.status} />
                </td>
                {isAdmin && (
                  <td className="relative px-4 py-3 text-right">
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
                        {(row.status === "pending" ||
                          row.status === "expired") && (
                          <button
                            type="button"
                            className="block w-full px-4 py-2 text-left text-sm hover:bg-discovery-beige-50"
                            onClick={() => void resendInvite(row.id)}
                          >
                            Resend invite
                          </button>
                        )}
                        {row.status === "pending" && (
                          <button
                            type="button"
                            className="block w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setOpenMenuId(null);
                              setRevokeTarget(row);
                            }}
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {filteredInvites.length === 0 && (
              <tr>
                <td
                  colSpan={isAdmin ? 4 : 3}
                  className="px-4 py-10 text-center text-sm text-discovery-grey"
                >
                  No parent invites yet.
                  {isAdmin && " Invite your first parent to get started."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!isAdmin && (
        <p className="text-sm text-discovery-grey">
          Only org admins can send and manage parent invites.
        </p>
      )}

      <ModalOverlay
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        label="Invite parent"
      >
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-discovery-black">
            Invite parent
          </h3>
          <p className="mt-1 text-sm text-discovery-grey">
            Send an invite to connect a child&apos;s portfolio to {orgName}.
          </p>
          <div className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-discovery-grey">
                  Student first name
                </label>
                <Input
                  value={studentFirstName}
                  onChange={(e) => setStudentFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-discovery-grey">
                  Student last name
                </label>
                <Input
                  value={studentLastName}
                  onChange={(e) => setStudentLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-discovery-grey">
                Parent email
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
                Personal note (optional)
              </label>
              <textarea
                value={personalNote}
                onChange={(e) =>
                  setPersonalNote(e.target.value.slice(0, 200))
                }
                maxLength={200}
                rows={3}
                className="mt-1 w-full rounded-lg border border-discovery-beige-200 px-3 py-2 text-sm"
                placeholder="Add a short note for the parent"
              />
              <p className="mt-1 text-xs text-discovery-grey">
                {personalNote.length}/200
              </p>
            </div>
          </div>
          {memberUsed >= memberLimit && (
            <p className="mt-4 text-sm text-red-700">
              You&apos;ve reached your member limit.{" "}
              <Link
                href="/dashboard/billing"
                className="font-medium underline"
              >
                Upgrade your plan
              </Link>{" "}
              to invite more parents.
            </p>
          )}
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
              disabled={
                loading ||
                !email.trim() ||
                !studentFirstName.trim() ||
                !studentLastName.trim() ||
                memberUsed >= memberLimit
              }
              onClick={() => void sendInvite(false)}
            >
              {loading ? "Sending..." : "Send invite"}
            </Button>
          </div>
        </div>
      </ModalOverlay>

      <ModalOverlay
        open={revokeTarget !== null}
        onClose={() => setRevokeTarget(null)}
        label="Revoke invite"
      >
        {revokeTarget && (
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-discovery-black">
              Revoke invite?
            </h3>
            <p className="mt-2 text-sm text-discovery-grey">
              Revoke invite for {revokeTarget.email}? They won&apos;t be able to
              use this link.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setRevokeTarget(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="discovery"
                className="bg-red-600 hover:bg-red-700"
                disabled={loading}
                onClick={() => void revokeInvite(revokeTarget.id)}
              >
                Revoke
              </Button>
            </div>
          </div>
        )}
      </ModalOverlay>
    </div>
  );
}
