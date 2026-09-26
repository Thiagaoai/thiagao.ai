const WINDOW_MS = 60 * 60 * 1000;
const attempts = new Map<string, { count: number; resetAt: number }>();

export function getClientIp(request: Request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown-ip'
  );
}

// In-memory, per-instance limiter (same approach as the newsletter subscribe route).
export function isRateLimited(key: string, max: number) {
  const now = Date.now();
  const current = attempts.get(key);

  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > max;
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Reuse the verified sender address (from NEWSLETTER_FROM) under another display name.
export function senderWithName(displayName: string, configuredFrom: string) {
  const address = configuredFrom.match(/<([^>]+)>/)?.[1] ?? configuredFrom.trim();
  return `${displayName} <${address}>`;
}
