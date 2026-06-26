"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@kifolio/ui";
import {
  ALL_PLANS,
  PLAN_DEFINITIONS,
  type BillingInterval,
  type PlanDefinition,
  type PlanTier,
} from "@/lib/plans";
import { orgsApi } from "@/lib/paths";

const TIER_ORDER: Record<PlanTier, number> = {
  starter: 0,
  growth: 1,
  studio: 2,
};

const STRIPE_PRICE_IDS: Record<
  PlanTier,
  { monthly?: string; annual?: string }
> = {
  starter: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY,
    annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_ANNUAL,
  },
  growth: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH_MONTHLY,
    annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH_ANNUAL,
  },
  studio: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_STUDIO_MONTHLY,
    annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_STUDIO_ANNUAL,
  },
};

export function BillingCheckout({
  currentTier,
  hasPaidSubscription,
  isCanceled,
}: {
  currentTier: PlanTier;
  hasPaidSubscription: boolean;
  isCanceled: boolean;
}) {
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openPortal = async () => {
    setLoadingId("portal");
    setError(null);
    try {
      const res = await fetch(orgsApi("/api/billing/portal"), {
        method: "POST",
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not open billing portal.");
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch {
      setError("Could not open billing portal.");
    } finally {
      setLoadingId(null);
    }
  };

  const startCheckout = async (priceId: string | undefined, targetTier: PlanTier) => {
    if (!priceId) {
      setError(
        "Stripe price is not configured. Add NEXT_PUBLIC_STRIPE_PRICE_* env vars."
      );
      return;
    }

    if (
      hasPaidSubscription &&
      TIER_ORDER[targetTier] < TIER_ORDER[currentTier]
    ) {
      const check = await fetch(orgsApi("/api/billing/downgrade-check"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ targetTier }),
      });
      const checkData = await check.json();
      if (!checkData.allowed) {
        setError(checkData.reason || "Cannot downgrade to this plan.");
        return;
      }
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
      if (data.url) window.location.href = data.url;
    } catch {
      setError("Checkout failed. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {hasPaidSubscription && !isCanceled && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="secondary"
            disabled={loadingId !== null}
            onClick={() => void openPortal()}
          >
            {loadingId === "portal" ? "Loading..." : "Manage billing →"}
          </Button>
        </div>
      )}

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setInterval("monthly")}
          className={`rounded-pill px-4 py-2 text-sm font-medium transition-colors ${
            interval === "monthly"
              ? "bg-discovery-black text-white"
              : "bg-white text-discovery-grey hover:bg-discovery-beige-100"
          }`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setInterval("annual")}
          className={`rounded-pill px-4 py-2 text-sm font-medium transition-colors ${
            interval === "annual"
              ? "bg-discovery-black text-white"
              : "bg-white text-discovery-grey hover:bg-discovery-beige-100"
          }`}
        >
          Annual
        </button>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {ALL_PLANS.map((plan) => (
          <PlanCard
            key={plan.tier}
            plan={plan}
            interval={interval}
            currentTier={currentTier}
            hasPaidSubscription={hasPaidSubscription}
            isCanceled={isCanceled}
            loadingId={loadingId}
            onSubscribe={startCheckout}
            onManagePortal={openPortal}
          />
        ))}
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  interval,
  currentTier,
  hasPaidSubscription,
  isCanceled,
  loadingId,
  onSubscribe,
  onManagePortal,
}: {
  plan: PlanDefinition;
  interval: BillingInterval;
  currentTier: PlanTier;
  hasPaidSubscription: boolean;
  isCanceled: boolean;
  loadingId: string | null;
  onSubscribe: (priceId: string | undefined, targetTier: PlanTier) => void;
  onManagePortal: () => void;
}) {
  const priceIds = STRIPE_PRICE_IDS[plan.tier];
  const priceId =
    interval === "monthly" ? priceIds.monthly : priceIds.annual;
  const displayPrice =
    interval === "monthly" ? plan.monthlyPrice : plan.annualPrice;
  const billingNote =
    interval === "annual"
      ? `${plan.annualTotal} · ${plan.annualSavings}`
      : plan.billingNote;

  const isCurrent = currentTier === plan.tier && hasPaidSubscription && !isCanceled;
  const tierDelta = TIER_ORDER[plan.tier] - TIER_ORDER[currentTier];

  let actionLabel = "Subscribe";
  if (isCanceled) {
    actionLabel = `Reactivate · ${plan.title}`;
  } else if (isCurrent) {
    actionLabel = "Current";
  } else if (hasPaidSubscription) {
    actionLabel = tierDelta > 0 ? "Upgrade" : tierDelta < 0 ? "Downgrade" : "Switch";
  }

  const handleClick = () => {
    if (isCurrent) return;
    if (hasPaidSubscription && !isCanceled && tierDelta === 0) {
      void onManagePortal();
      return;
    }
    void onSubscribe(priceId, plan.tier);
  };

  return (
    <div
      className={`relative flex flex-col rounded-xl border bg-white p-6 shadow-sm ${
        plan.popular
          ? "border-discovery-blue ring-2 ring-discovery-blue"
          : "border-discovery-beige-200"
      } ${isCurrent ? "ring-2 ring-discovery-primary" : ""}`}
    >
      {plan.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-pill bg-discovery-blue px-3 py-0.5 text-xs font-semibold text-white">
          Most popular
        </span>
      )}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-discovery-black">
          {plan.title}
          {isCurrent && (
            <span className="ml-2 text-sm font-normal text-discovery-primary">
              ✓
            </span>
          )}
        </h3>
        <p className="text-sm text-discovery-grey">
          Up to {plan.memberLimit} members
        </p>
      </div>

      <div className="mb-6">
        <p className="text-3xl font-semibold text-discovery-black">
          {displayPrice}
        </p>
        <p className="mt-1 text-sm text-discovery-grey">{billingNote}</p>
      </div>

      <ul className="mb-6 flex-1 space-y-2">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2 text-sm text-discovery-grey"
          >
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-discovery-green" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        type="button"
        variant={plan.popular ? "discovery" : "secondary"}
        className="w-full"
        disabled={loadingId !== null || isCurrent}
        onClick={handleClick}
      >
        {loadingId === priceId ? "Loading..." : actionLabel}
      </Button>
    </div>
  );
}

export function formatPlanPrice(tier: PlanTier, interval: BillingInterval = "monthly") {
  const plan = PLAN_DEFINITIONS[tier];
  return interval === "monthly" ? plan.monthlyPrice : plan.annualPrice;
}
