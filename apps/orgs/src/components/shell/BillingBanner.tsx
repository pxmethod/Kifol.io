import Link from "next/link";
import type { OrgBillingBannerStatus } from "@/lib/orgs/billing";

export function BillingBanner({ status }: { status: OrgBillingBannerStatus }) {
  if (status === "none") return null;

  const messages: Record<Exclude<OrgBillingBannerStatus, "none">, string> = {
    trial_expired:
      "Your 14-day free trial has ended. Choose a subscription plan to keep using Kifolio for Orgs.",
    incomplete: "Complete your billing setup to unlock all features.",
    past_due:
      "Your payment is past due. Update your payment method to continue.",
    canceled:
      "Your subscription has ended. Reactivate to continue using Kifolio for Orgs.",
    unpaid:
      "Your subscription payment failed. Please update billing to continue.",
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-amber-800">{messages[status]}</p>
      <Link
        href="/dashboard/billing"
        className="text-sm font-medium text-amber-900 underline"
      >
        Go to billing →
      </Link>
    </div>
  );
}
