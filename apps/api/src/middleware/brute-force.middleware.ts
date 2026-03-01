import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

/**
 * Strict rate limit for auth routes: 10 requests per 15 minutes per IP.
 * Returns 429 with a Retry-After header.
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again in 15 minutes.',
    data: null,
  },
  skipSuccessfulRequests: false,
});

/**
 * Progressive slow-down for auth routes.
 * After the 3rd request in a 1-minute window, each subsequent request is
 * delayed by an additional 200ms (capped at 2 seconds).
 */
export const authSlowDown = slowDown({
  windowMs: 60 * 1000, // 1 minute
  delayAfter: 3,
  delayMs: (used) => (used - 3) * 200,
  maxDelayMs: 2000,
});
