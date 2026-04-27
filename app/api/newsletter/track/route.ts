import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logNewsletterEvent } from '@/lib/briefing/posts';

const TrackSchema = z.object({
  eventType: z.enum([
    'page_view',
    'cta_click',
    'subscribe_success',
    'subscribe_blocked',
    'chat_question',
    'admin_login',
  ]),
  path: z.string().max(240).optional(),
  source: z.string().max(80).optional(),
  email: z.email().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const WINDOW_MS = 60 * 1000;
const MAX_EVENTS_PER_WINDOW = 30;
const eventRate = new Map<string, { count: number; resetAt: number }>();

function getIp(request: Request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown-ip'
  );
}

function isRateLimited(key: string) {
  const now = Date.now();
  const current = eventRate.get(key);

  if (!current || current.resetAt <= now) {
    eventRate.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  current.count += 1;
  eventRate.set(key, current);
  return current.count > MAX_EVENTS_PER_WINDOW;
}

export async function POST(request: Request) {
  try {
    const key = getIp(request);

    if (isRateLimited(key)) {
      return NextResponse.json({ ok: true, stored: false });
    }

    const body = TrackSchema.parse(await request.json());
    const result = await logNewsletterEvent(body);

    return NextResponse.json({ ok: true, ...result });
  } catch {
    return NextResponse.json({ ok: true, stored: false });
  }
}
