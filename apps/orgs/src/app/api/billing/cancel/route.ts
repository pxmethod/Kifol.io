import { NextRequest, NextResponse } from "next/server";
import { requireAdminContext } from "@/lib/orgs/require-admin";
import { getStripe } from "@/lib/stripe/server";

export async function POST(_request: NextRequest) {
  const auth = await requireAdminContext();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const subscriptionId = auth.ctx.organization.stripe_subscription_id;
  if (!subscriptionId) {
    return NextResponse.json(
      { error: "No active subscription to cancel." },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  const sub = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });

  return NextResponse.json({
    ok: true,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    periodEnd: new Date(sub.current_period_end * 1000).toISOString(),
  });
}
