export function MemberUsageBar({
  used,
  limit,
}: {
  used: number;
  limit: number;
  tier?: string;
}) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const nearCap = pct >= 80;
  const atCap = used >= limit;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-discovery-grey">
          {used} of {limit} members
        </span>
        {nearCap && !atCap && (
          <span className="font-medium text-amber-600">Almost at your limit</span>
        )}
        {atCap && (
          <span className="font-medium text-red-600">
            At limit — upgrade to invite more
          </span>
        )}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all ${
            atCap ? "bg-red-500" : nearCap ? "bg-amber-400" : "bg-teal-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
