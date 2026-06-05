import Link from "next/link";

export function TrialBanner({ daysRemaining }: { daysRemaining: number }) {
  return (
    <div className="flex w-full items-center justify-between gap-4 bg-discovery-blue px-4 py-2.5 text-sm font-medium text-white sm:px-6">
      <p className="shrink-0">
        Free trial · {daysRemaining} day{daysRemaining === 1 ? "" : "s"} remaining
      </p>
      <Link
        href="/dashboard/billing"
        className="shrink-0 text-sm font-medium text-white underline-offset-2 hover:underline"
      >
        View plans
      </Link>
    </div>
  );
}
