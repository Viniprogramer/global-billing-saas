import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/src/lib/db';
import { stripe } from '@/src/lib/stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Missing STRIPE_SECRET_KEY' }, { status: 500 });
  }

  if (!webhookSecret) {
    return NextResponse.json({ error: 'Missing STRIPE_WEBHOOK_SECRET' }, { status: 500 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const payload = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
    const subscription = event.data.object as Stripe.Subscription;
    const tenantId = subscription.metadata.tenantId;
    const firstItem = subscription.items.data[0];
    const periodEndUnix = firstItem?.current_period_end;
    const currentPeriodEnd = periodEndUnix ? new Date(periodEndUnix * 1000) : new Date();

    if (tenantId) {
      await db.subscription.upsert({
        where: { tenantId },
        update: {
          status: subscription.status,
          stripePriceId: (subscription.items.data[0]?.price.id ?? 'unknown').toString(),
          currentPeriodEnd,
        },
        create: {
          tenantId,
          status: subscription.status,
          stripePriceId: (subscription.items.data[0]?.price.id ?? 'unknown').toString(),
          stripeCustomerId: subscription.customer.toString(),
          currentPeriodEnd,
        },
      });
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    const tenantId = subscription.metadata.tenantId;

    if (tenantId) {
      await db.subscription.updateMany({
        where: { tenantId },
        data: {
          status: 'canceled',
          currentPeriodEnd: new Date(),
        },
      });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
