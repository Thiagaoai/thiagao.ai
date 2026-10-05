import { createHmac, timingSafeEqual } from 'node:crypto';
import { getSiteUrl } from './config.ts';

function secret() {
  return process.env.NEWSLETTER_UNSUBSCRIBE_SECRET || process.env.AGENT_CRON_SECRET || '';
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function hasUnsubscribeSecret() {
  return Boolean(secret());
}

export function unsubscribeToken(email: string) {
  const key = secret();
  if (!key) return null;
  return createHmac('sha256', key).update(normalizeEmail(email)).digest('base64url').slice(0, 32);
}

export function verifyUnsubscribeToken(email: string, token: string) {
  const expected = unsubscribeToken(email);
  if (!expected || !token) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

// pageUrl: the human link in the footer. apiUrl: the List-Unsubscribe target; mail providers POST to it
// with the body "List-Unsubscribe=One-Click" (RFC 8058), so email and token travel in the query string.
export function buildUnsubscribeUrls(email: string) {
  const token = unsubscribeToken(email);
  if (!token) return null;
  const site = getSiteUrl().replace(/\/$/, '');
  const query = `email=${encodeURIComponent(normalizeEmail(email))}&token=${token}`;
  return { pageUrl: `${site}/newsletter/sair?${query}`, apiUrl: `${site}/api/newsletter/unsubscribe?${query}` };
}
