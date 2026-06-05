import { createAdminClient } from "@kifolio/database";
import { createClient } from "@kifolio/supabase/server";
import { orgsAppPath } from "@kifolio/utils";
import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import { getOrgContextForUser } from "@/lib/orgs/context";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ctx = await getOrgContextForUser(user.id);
    if (!ctx || ctx.member.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const priceId = typeof body.priceId === "string" ? body.priceId : "";
    if (!priceId) {
      return NextResponse.json({ error: "priceId is required" }, { status: 400 });
    }

    const orgId = ctx.organization.id;
    const admin = createAdminClient();
    const org = ctx.organization;

    const stripe = getStripe();
    let customerId = org.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { org_id: orgId },
      });
      customerId = customer.id;
      await admin
        .from("organizations")
        .update({ stripe_customer_id: customerId })
        .eq("id", orgId);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${orgsAppPath("/dashboard/overview")}?checkout=success`,
      cancel_url: `${orgsAppPath("/dashboard/overview")}?checkout=canceled`,
      subscription_data: {
        metadata: { org_id: orgId },
      },
      metadata: { org_id: orgId },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[orgs checkout]", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
