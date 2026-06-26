import { OrgAvatar } from "@/components/shared/OrgAvatar";
import type { PortfolioOrgConnection } from "@/lib/orgs/portfolioConnections";

function formatConnectedDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function OrgConnectionsList({
  connections,
}: {
  connections: PortfolioOrgConnection[];
}) {
  if (connections.length === 0) return null;

  return (
    <section aria-labelledby="orgs-heading" className="mt-8">
      <h2
        id="orgs-heading"
        className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500"
      >
        Organizations
      </h2>
      <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200">
        {connections.map(({ connectedAt, org }) => (
          <li
            key={org.id}
            className="flex items-center gap-4 bg-white px-4 py-3"
          >
            <OrgAvatar logo={org.logoUrl} name={org.name} size={40} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">
                {org.name}
              </p>
              <p className="text-xs text-gray-500">
                {org.location && `${org.location} · `}
                Connected {formatConnectedDate(connectedAt)}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-gray-400">
        Organizations can create endorsements for your child. You&apos;ll
        approve each one first.
      </p>
    </section>
  );
}
