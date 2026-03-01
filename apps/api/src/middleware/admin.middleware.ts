import type { Request, Response, NextFunction } from 'express';

/**
 * Admin middleware — protects /api/v1/admin/* routes.
 *
 * Security design:
 * - Returns 404 (not 401/403) in ALL error cases so the route is
 *   undetectable from the outside in production.
 * - In production the route is invisible regardless of the secret.
 * - Accepts the secret via X-Admin-Secret header only (no query param
 *   to avoid accidental logging in server access logs).
 */
export function adminMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Completely hidden in production
  if (process.env.NODE_ENV === 'production') {
    res.status(404).json({ success: false, error: 'Not found', data: null });
    return;
  }

  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    res.status(404).json({ success: false, error: 'Not found', data: null });
    return;
  }

  const provided = req.headers['x-admin-secret'] as string | undefined;
  if (!provided || provided !== adminSecret) {
    res.status(404).json({ success: false, error: 'Not found', data: null });
    return;
  }

  next();
}
