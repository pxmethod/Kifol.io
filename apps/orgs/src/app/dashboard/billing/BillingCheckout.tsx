"use client";

import { useState } from "react";
import { Button } from "@kifolio/ui";
import { DashboardCard } from "@/components/shell/DashboardCard";
import { orgsApi } from "@/lib/paths";

const PLANS = [
  {
    tier: "solo" as const,
    title: "Solo",
    description: "1 seat — you are the admin and instructor.",
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_SOLO_MONTHLY,
    annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_SOLO_ANNUAL,
    monthlyLabel: "$9.99/mo",
    annualLabel: "$105/yr",
  },
  {
    tier: "team" as const,
    title: "Team",
    description: "Up to 10 seats including admin.",
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM_MONTHLY,
    annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM_ANNUAL,
    monthlyLabel: "$19.99/mo",
    annualLabel: "$220/yr",
  },
];

export function BillingCheckout({
  currentTier,
}: {
  currentTier: "solo" | "team";
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async (priceId: string | undefined) => {
    if (!priceId) {
      setError(
        "Stripe price is not configured. Add NEXT_PUBLIC_STRIPE_PRICE_* env vars."
      );
      return;
    }
    setLoadingId(priceId);
    setError(null);
    try {
      const res = await fetch(orgsApi("/api/checkout"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Checkout failed");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Checkout failed. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {PLANS.map((plan) => (
        <DashboardCard
          key={plan.tier}
          className={
            currentTier === plan.tier ? "ring-2 ring-discovery-primary" : undefined
          }
        >
          <h3 className="text-lg font-semibold text-discovery-black">
            {plan.title}
            {currentTier === plan.tier && (
              <span className="ml-2 text-sm font-normal text-discovery-primary">
                (current)
              </span>
            )}
          </h3>
          <p className="mt-1 text-sm text-discovery-grey">{plan.description}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              type="button"
              variant="discovery"
              disabled={loadingId !== null}
              onClick={() => startCheckout(plan.monthly)}
            >
              {loadingId === plan.monthly
                ? "Loading..."
                : `Subscribe ${plan.monthlyLabel}`}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={loadingId !== null}
              onClick={() => startCheckout(plan.annual)}
            >
              {loadingId === plan.annual
                ? "Loading..."
                : `Subscribe ${plan.annualLabel}`}
            </Button>
          </div>
        </DashboardCard>
      ))}
    </div>
  );
}
