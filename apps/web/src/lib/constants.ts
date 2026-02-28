// ============================================================
// Environment Variables — All references go through this file
// ============================================================

export const ENV = {
  API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
  STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
  FIREBASE_CONFIG: process.env.NEXT_PUBLIC_FIREBASE_CONFIG
    ? JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG)
    : null,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? 'http://localhost:3000',
} as const;

// ============================================================
// App Constants
// ============================================================

export const APP_NAME = 'ForgeItUp';
export const APP_TAGLINE = 'Generate Minecraft Mods in Seconds';
export const APP_URL = 'https://forgeitup.com';

export const GENERATION_POLL_INTERVAL = 2000; // ms
export const GENERATION_TIMEOUT = 120000; // 2 minutes
export const MAX_PROMPT_LENGTH = 4000;

export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  dashboard: '/dashboard',
  builder: '/builder',
  generations: '/generations',
  settings: '/settings',
  billing: '/billing',
  pricing: '/pricing',
  docs: '/docs',
} as const;

export const API_ROUTES = {
  generations: '/api/v1/generations',
  minecraft: '/api/v1/minecraft',
  billing: '/api/v1/billing',
  auth: '/api/v1/auth',
} as const;
