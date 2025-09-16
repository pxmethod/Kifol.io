import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe/config';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      console.error('Stripe not configured');
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('No Stripe signature found');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabase = await createClient();

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session, supabase);
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription, supabase);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription, supabase);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription, supabase);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice, supabase);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice, supabase);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any) {
  const userId = session.metadata?.userId;
  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;

  if (!userId || !subscriptionId || !customerId) {
    console.error('Missing userId, subscriptionId, or customerId in checkout session');
    return;
  }

  // Update user's subscription status and customer ID
  await supabase
    .from('users')
    .update({
      subscription_plan: 'premium',
      subscription_status: 'active',
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  console.log(`Checkout completed for user ${userId}, subscription ${subscriptionId}, customer ${customerId}`);
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, supabase: any) {
  // Get user by stripe_customer_id since subscription metadata doesn't have userId
  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', subscription.customer as string)
    .single();

  if (!userData) {
    console.error('User not found for customer:', subscription.customer);
    return;
  }

  // Update user's subscription details
  await supabase
    .from('users')
    .update({
      subscription_plan: 'premium',
      subscription_status: subscription.status,
      stripe_subscription_id: subscription.id,
      subscription_ends_at: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000).toISOString() : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', userData.id);

  console.log(`Subscription created for user ${userData.id}: ${subscription.id}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: any) {
  // Get user by stripe_customer_id since subscription metadata doesn't have userId
  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', subscription.customer as string)
    .single();

  if (!userData) {
    console.error('User not found for customer:', subscription.customer);
    return;
  }

  // Update user's subscription status
  await supabase
    .from('users')
    .update({
      subscription_status: subscription.status,
      subscription_ends_at: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000).toISOString() : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', userData.id);

  console.log(`Subscription updated for user ${userData.id}: ${subscription.id} - ${subscription.status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
  // Get user by stripe_customer_id since subscription metadata doesn't have userId
  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', subscription.customer as string)
    .single();

  if (!userData) {
    console.error('User not found for customer:', subscription.customer);
    return;
  }

  // Downgrade user to free plan
  await supabase
    .from('users')
    .update({
      subscription_plan: 'free',
      subscription_status: 'canceled',
      stripe_subscription_id: null,
      subscription_ends_at: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', userData.id);

  console.log(`Subscription deleted for user ${userData.id}: ${subscription.id}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice, supabase: any) {
  const subscriptionId = (invoice as any).subscription as string;
  
  if (!subscriptionId) {
    console.error('No subscription ID in invoice');
    return;
  }

  // Get user by subscription ID
  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (userData) {
    // Update subscription status to active
    await supabase
      .from('users')
      .update({
        subscription_status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', userData.id);

    console.log(`Payment succeeded for user ${userData.id}, subscription ${subscriptionId}`);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
  const subscriptionId = (invoice as any).subscription as string;
  
  if (!subscriptionId) {
    console.error('No subscription ID in invoice');
    return;
  }

  // Get user by subscription ID
  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (userData) {
    // Update subscription status to past_due
    await supabase
      .from('users')
      .update({
        subscription_status: 'past_due',
        updated_at: new Date().toISOString()
      })
      .eq('id', userData.id);

    console.log(`Payment failed for user ${userData.id}, subscription ${subscriptionId}`);
  }
}
