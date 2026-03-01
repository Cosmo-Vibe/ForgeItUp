import type { PricingPlan } from '../types';

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: 'free',
    priceMonthly: 0,
    priceAnnual: 0,
    limits: {
      generationsPerMonth: 1,
      aiMode: false,
      exportFormats: ['.zip'],
      priorityQueue: false,
      apiAccess: false,
    },
    features: [
      '1 generation per month',
      'Basic .zip export',
      'Java & Bedrock support',
      'Community support',
    ],
  },
  {
    name: 'starter',
    priceMonthly: 4.99,
    priceAnnual: 39.99,
    limits: {
      generationsPerMonth: 20,
      aiMode: true,
      exportFormats: ['.zip', '.jar'],
      priorityQueue: false,
      apiAccess: true,
    },
    features: [
      '20 generations per month',
      'AI prompt mode',
      '.zip & .jar export',
      'All loaders & versions',
      'Generation history',
      '1 API key',
      'Email support',
    ],
  },
  {
    name: 'pro',
    priceMonthly: 12.99,
    priceAnnual: 99.99,
    limits: {
      generationsPerMonth: 100,
      aiMode: true,
      exportFormats: ['.zip', '.jar', '.mcaddon', '.mcpack', '.json'],
      priorityQueue: true,
      apiAccess: true,
    },
    features: [
      '100 generations per month',
      'AI prompt mode',
      'All export formats',
      'Priority queue',
      'Fork & remix generations',
      'Up to 3 API keys',
      'Priority support',
    ],
  },
  {
    name: 'team',
    priceMonthly: 29.99,
    priceAnnual: 249.99,
    limits: {
      generationsPerMonth: 'unlimited',
      aiMode: true,
      exportFormats: ['.zip', '.jar', '.mcaddon', '.mcpack', '.json', '.png'],
      priorityQueue: true,
      teamMembers: 5,
      apiAccess: true,
    },
    features: [
      'Unlimited generations',
      'AI prompt mode',
      'All export formats',
      'Priority queue',
      '5 team members',
      'API access',
      'Dedicated support',
    ],
  },
];

export const PLAN_LIMITS = {
  free: { generationsPerMonth: 1, rateLimit: 5, apiKeyLimit: 0 },
  starter: { generationsPerMonth: 20, rateLimit: 20, apiKeyLimit: 1 },
  pro: { generationsPerMonth: 100, rateLimit: 50, apiKeyLimit: 3 },
  team: { generationsPerMonth: Infinity, rateLimit: 200, apiKeyLimit: 10 },
};
