import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logNewsletterEvent, subscribeToBriefing } from '@/lib/briefing/posts';

const SubscribeSchema = z.object({
  email: z.email(),
  source: z.string().min(1).max(80).optional(),
  company: z.string().max(120).optional(),
  website: z.string().max(120).optional(),
  startedAt: z.number().optional(),
});

const WINDOW_MS = 60 * 60 * 1000;
const MAX_IP_ATTEMPTS = 8;
const MAX_EMAIL_ATTEMPTS = 3;
const MIN_FORM_TIME_MS = 2200;
const attempts = new Map<string, { count: number; resetAt: number }>();

function getIp(request: Request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown-ip'
  );
}

function bumpAttempt(key: string, max: number) {
  const now = Date.now();
  const current = attempts.get(key);

  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  current.count += 1;
  attempts.set(key, current);
  return current.count > max;
}

export async function POST(request: Request) {
  try {
    const body = SubscribeSchema.parse(await request.json());
    const normalizedEmail = body.email.trim().toLowerCase();
    const isHoneypotFilled = Boolean(body.company?.trim() || body.website?.trim());
    const isTooFast = body.startedAt ? Date.now() - body.startedAt < MIN_FORM_TIME_MS : false;
    const ip = getIp(request);
    const limitedByIp = bumpAttempt(`ip:${ip}`, MAX_IP_ATTEMPTS);
    const limitedByEmail = bumpAttempt(`email:${normalizedEmail}`, MAX_EMAIL_ATTEMPTS);

    if (isHoneypotFilled || isTooFast || limitedByIp || limitedByEmail) {
      await logNewsletterEvent({
        eventType: 'subscribe_blocked',
        path: '/newsletter',
        source: body.source,
        email: normalizedEmail,
        metadata: {
          honeypot: isHoneypotFilled,
          tooFast: isTooFast,
          limitedByIp,
          limitedByEmail,
        },
      });

      return NextResponse.json({
        ok: true,
        stored: false,
        email: normalizedEmail,
      });
    }

    const result = await subscribeToBriefing(body);
    await logNewsletterEvent({
      eventType: 'subscribe_success',
      path: '/newsletter',
      source: body.source,
      email: normalizedEmail,
    });

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request.';

    return NextResponse.json(
      {
        ok: false,
        message,
      },
      { status: 400 },
    );
  }
}
