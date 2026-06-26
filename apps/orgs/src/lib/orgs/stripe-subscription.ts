import { getStripe } from "@/lib/stripe/server";

export type SubscriptionDetails = {
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  status: string;
};

export async function getSubscriptionDetails(
  subscriptionId: string | null
): Promise<SubscriptionDetails | null> {
  if (!subscriptionId) return null;

  try {
    const stripe = getStripe();
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    return {
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      status: sub.status,
    };
  } catch (error) {
    console.error("[stripe subscription]", error);
    return null;
  }
}
