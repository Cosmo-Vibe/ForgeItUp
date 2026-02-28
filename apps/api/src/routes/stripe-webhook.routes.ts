import { Router } from 'express';
import Stripe from 'stripe';
import { supabaseAdmin } from '../db/supabase.client';
import { successResponse, errorResponse } from '../utils/response';
import { logger } from '../utils/logger';
import type { Request, Response } from 'express';

export const stripeWebhookRouter = Router();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '') as any;

stripeWebhookRouter.post('/', async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    errorResponse(res, 'Missing webhook signature', 400);
    return;
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, signature, webhookSecret);
  } catch (err) {
    logger.warn({ err }, 'Invalid Stripe webhook signature');
    errorResponse(res, 'Invalid webhook signature', 400);
    return;
  }

  logger.info({ type: event.type }, 'Stripe webhook received');

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        logger.debug({ type: event.type }, 'Unhandled webhook event');
    }

    successResponse(res, { received: true });
  } catch (err) {
    logger.error(err, 'Webhook handler error');
    errorResponse(res, 'Webhook handler failed', 500);
  }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier;

  if (!userId || !tier) return;

  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

  await supabaseAdmin
    .from('users')
    .update({
      subscription_tier: tier,
      subscription_status: 'active',
      stripe_customer_id: session.customer as string,
    })
    .eq('id', userId);

  await supabaseAdmin.from('subscriptions').upsert({
    user_id: userId,
    stripe_subscription_id: subscription.id,
    tier,
    status: 'active',
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
  });

  logger.info({ userId, tier }, 'Subscription activated');
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  const customerId = subscription.customer as string;

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!user) return;

  const priceId = subscription.items.data[0]?.price.id;
  const status = subscription.status === 'active' ? 'active' : 'inactive';

  await supabaseAdmin
    .from('subscriptions')
    .update({
      status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq('stripe_subscription_id', subscription.id);

  await supabaseAdmin
    .from('users')
    .update({ subscription_status: status })
    .eq('id', user.id);

  logger.info({ userId: user.id, status, priceId }, 'Subscription updated');
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  const customerId = subscription.customer as string;

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!user) return;

  await supabaseAdmin
    .from('users')
    .update({ subscription_tier: 'free', subscription_status: 'cancelled' })
    .eq('id', user.id);

  await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('stripe_subscription_id', subscription.id);

  logger.info({ userId: user.id }, 'Subscription cancelled, downgraded to free');
}

async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const customerId = invoice.customer as string;
  logger.warn({ customerId }, 'Payment failed for customer');
  // TODO: Send email notification to user
}
