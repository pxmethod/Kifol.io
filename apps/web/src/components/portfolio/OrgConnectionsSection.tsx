"use client";

import { useEffect, useState } from "react";
import type { PortfolioOrgConnection } from "@/lib/orgs/portfolioConnections";
import { OrgConnectionsList } from "@/components/portfolio/OrgConnectionsList";
import LoadingSpinner from "@/components/LoadingSpinner";

export function OrgConnectionsSection({
  portfolioId,
}: {
  portfolioId: string;
}) {
  const [connections, setConnections] = useState<PortfolioOrgConnection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/orgs/portfolio/${portfolioId}/connections`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setConnections(data.connections ?? []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [portfolioId]);

  if (loading) {
    return (
      <div className="mt-8 flex justify-center py-6">
        <LoadingSpinner size="sm" label="Loading organizations..." />
      </div>
    );
  }

  return <OrgConnectionsList connections={connections} />;
}
