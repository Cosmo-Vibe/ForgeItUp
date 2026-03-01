import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { PRICING_PLANS, PLAN_LIMITS, subscribeSchema } from '@forgeitup/shared';
import { supabaseAdmin } from '../db/supabase.client';
import { successResponse, errorResponse } from '../utils/response';
import { logger } from '../utils/logger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '') as any;

// Stripe Price IDs (configure in Stripe Dashboard)
const STRIPE_PRICE_IDS: Record<string, Record<string, string>> = {
  starter: {
    monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY ?? '',
    annual: process.env.STRIPE_PRICE_STARTER_ANNUAL ?? '',
  },
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? '',
    annual: process.env.STRIPE_PRICE_PRO_ANNUAL ?? '',
  },
  team: {
    monthly: process.env.STRIPE_PRICE_TEAM_MONTHLY ?? '',
    annual: process.env.STRIPE_PRICE_TEAM_ANNUAL ?? '',
  },
};

export const billingController = {
  getPlans(_req: Request, res: Response): void {
    successResponse(res, PRICING_PLANS);
  },

  async subscribe(req: Request, res: Response): Promise<void> {
    const result = subscribeSchema.safeParse(req.body);
    if (!result.success) {
      errorResponse(res, result.error.errors[0]?.message ?? 'Invalid input', 422);
      return;
    }

    const { tier, interval, successUrl, cancelUrl } = result.data;
    const userId = req.user!.id;
    const userEmail = req.user!.email;

    // Get or create Stripe customer
    let stripeCustomerId: string | null = null;

    const { data: userRecord } = await supabaseAdmin
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (userRecord?.stripe_customer_id) {
      stripeCustomerId = userRecord.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId },
      });
      stripeCustomerId = customer.id;

      await supabaseAdmin
        .from('users')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', userId);
    }

    const priceId = STRIPE_PRICE_IDS[tier]?.[interval];
    if (!priceId) {
      errorResponse(res, 'Invalid plan configuration', 400);
      return;
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId ?? undefined,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url:
        successUrl ?? `${process.env.FRONTEND_URL}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl ?? `${process.env.FRONTEND_URL}/billing?cancelled=true`,
      metadata: { userId, tier, interval },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    });

    successResponse(res, { url: session.url, sessionId: session.id });
  },

  async getPortalUrl(req: Request, res: Response): Promise<void> {
    const { data: userRecord } = await supabaseAdmin
      .from('users')
      .select('stripe_customer_id')
      .eq('id', req.user!.id)
      .single();

    if (!userRecord?.stripe_customer_id) {
      errorResponse(res, 'No billing account found. Please subscribe first.', 404);
      return;
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: userRecord.stripe_customer_id,
      return_url: `${process.env.FRONTEND_URL}/billing`,
    });

    successResponse(res, { url: session.url });
  },

  async getUsage(req: Request, res: Response): Promise<void> {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('subscription_tier, generations_this_month')
      .eq('id', req.user!.id)
      .single();

    if (!user) {
      errorResponse(res, 'User not found', 404);
      return;
    }

    const tier = user.subscription_tier as keyof typeof PLAN_LIMITS;
    const limit = PLAN_LIMITS[tier]?.generationsPerMonth ?? 1;

    successResponse(res, {
      tier,
      generationsThisMonth: user.generations_this_month,
      generationsLimit: limit === Infinity ? null : limit,
      percentageUsed:
        limit === Infinity ? 0 : Math.round((user.generations_this_month / limit) * 100),
    });
  },
};
