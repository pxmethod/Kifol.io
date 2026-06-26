import { createAdminClient } from "@kifolio/database";
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { planFromStripePriceId } from "@/lib/stripe/plans";

export const runtime = "nodejs";

async function updateOrgFromSubscription(
  orgId: string,
  sub: Stripe.Subscription
) {
  const priceId = sub.items.data[0]?.price.id;
  const plan = priceId
    ? planFromStripePriceId(priceId)
    : { tier: "starter" as const, memberLimit: 30 };

  const admin = createAdminClient();
  await admin
    .from("organizations")
    .update({
      stripe_subscription_id: sub.id,
      stripe_price_id: priceId ?? null,
      plan_tier: plan.tier,
      member_limit: plan.memberLimit,
      member_limit_exceeded_at: null,
      subscription_status: sub.status as
        | "incomplete"
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "unpaid",
      trial_ends_at: sub.trial_end
        ? new Date(sub.trial_end * 1000).toISOString()
        : null,
    })
    .eq("id", orgId);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return new NextResponse("Webhook not configured", { status: 500 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return new NextResponse("Webhook signature verification failed", {
      status: 400,
    });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const orgId = sub.metadata?.org_id;
        if (!orgId) break;
        await updateOrgFromSubscription(orgId, sub);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const orgId = sub.metadata?.org_id;
        if (!orgId) break;
        const admin = createAdminClient();
        await admin
          .from("organizations")
          .update({
            subscription_status: "canceled",
            plan_tier: "starter",
            member_limit: 30,
            member_limit_exceeded_at: null,
            stripe_subscription_id: null,
          })
          .eq("id", orgId);
        break;
      }
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orgId = session.metadata?.org_id;
        if (!orgId || !session.subscription) break;
        const sub = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        await updateOrgFromSubscription(orgId, sub);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("[stripe webhook]", event.type, error);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }

  return new NextResponse("ok", { status: 200 });
}
