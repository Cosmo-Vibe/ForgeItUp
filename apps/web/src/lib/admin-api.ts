/**
 * Admin API client — reads the admin secret from the browser cookie
 * and attaches it as X-Admin-Secret to every request.
 */

const ADMIN_COOKIE = 'admin_secret';

function getSecret(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp(`(?:^|; )${ADMIN_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
}

export async function adminFetch(path: string, init?: RequestInit) {
  const secret = getSecret();
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  return fetch(`${base}/api/v1/admin${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Secret': secret,
      ...(init?.headers ?? {}),
    },
  });
}
