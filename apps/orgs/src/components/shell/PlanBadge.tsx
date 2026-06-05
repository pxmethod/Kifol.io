const colors = {
  solo: "bg-purple-100 text-purple-800",
  team: "bg-teal-100 text-teal-800",
};

export function PlanBadge({ tier }: { tier: "solo" | "team" }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[tier]}`}
    >
      {tier === "solo" ? "Solo" : "Team"}
    </span>
  );
}
