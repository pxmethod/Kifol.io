import { planTitle, type PlanTier } from "@/lib/plans";

const colors: Record<PlanTier, string> = {
  starter: "bg-purple-100 text-purple-800",
  growth: "bg-teal-100 text-teal-800",
  studio: "bg-blue-100 text-blue-800",
};

export function PlanBadge({ tier }: { tier: PlanTier }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[tier]}`}
    >
      {planTitle(tier)}
    </span>
  );
}
