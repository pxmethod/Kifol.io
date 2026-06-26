import { NextRequest, NextResponse } from "next/server";
import { orgsAppPath } from "@/lib/paths";
import { requireAdminContext } from "@/lib/orgs/require-admin";
import { getStripe } from "@/lib/stripe/server";

export async function POST(_request: NextRequest) {
  const auth = await requireAdminContext();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const customerId = auth.ctx.organization.stripe_customer_id;
  if (!customerId) {
    return NextResponse.json(
      { error: "No billing account found. Subscribe to a plan first." },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: orgsAppPath("/dashboard/billing"),
  });

  return NextResponse.json({ url: session.url });
}
