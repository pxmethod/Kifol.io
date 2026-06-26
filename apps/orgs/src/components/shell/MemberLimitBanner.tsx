import Link from "next/link";
import type { MemberLimitState } from "@/lib/orgs/members";

export function MemberLimitBanner({ state }: { state: MemberLimitState }) {
  if (!state.isOverLimit) return null;

  if (state.inGracePeriod) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-blue-900">
          You have {state.memberCount} active members on a{" "}
          {state.memberLimit}-member plan. You have{" "}
          <span className="font-medium">
            {state.graceDaysRemaining} day
            {state.graceDaysRemaining === 1 ? "" : "s"}
          </span>{" "}
          to upgrade — your org will not be blocked.
        </p>
        <Link
          href="/dashboard/billing"
          className="shrink-0 text-sm font-medium text-blue-900 underline"
        >
          View plans →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-amber-900">
        You have {state.memberCount} active members but your plan includes{" "}
        {state.memberLimit}. Please upgrade to keep growing — your org will not
        be blocked.
      </p>
      <Link
        href="/dashboard/billing"
        className="shrink-0 text-sm font-medium text-amber-900 underline"
      >
        Upgrade plan →
      </Link>
    </div>
  );
}
