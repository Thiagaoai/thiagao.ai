import { NextResponse } from 'next/server';
import { getReviewClient } from '@/lib/dockplus/review-clients';
import { recordReviewEvent, ReviewInputSchema, sendFeedbackAlert } from '@/lib/dockplus/reviews';
import { getClientIp, isRateLimited } from '@/lib/shared/request-guard';

const MAX_EVENTS_PER_IP_PER_HOUR = 20;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = ReviewInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: parsed.error.issues[0]?.message ?? 'Invalid input.' }, { status: 400 });
  }

  const input = parsed.data;
  const client = getReviewClient(input.clientSlug);
  if (!client) {
    return NextResponse.json({ ok: false, message: 'Unknown business.' }, { status: 404 });
  }

  if (isRateLimited(`reviews:${getClientIp(request)}`, MAX_EVENTS_PER_IP_PER_HOUR)) {
    return NextResponse.json({ ok: false, message: 'Too many submissions. Please try again later.' }, { status: 429 });
  }

  const store = await recordReviewEvent(input);
  if (!store.stored) console.error('[reviews] event not stored', { slug: client.slug, error: store.error });

  if (input.rating >= 4) {
    return NextResponse.json({ ok: true, outcome: 'google_redirect', redirectUrl: client.googleReviewUrl, stored: store.stored });
  }

  const alert = await sendFeedbackAlert(client, input);
  if (!alert.emailed) console.error('[reviews] feedback alert not sent', { slug: client.slug, error: alert.error });

  // Private feedback must reach the owner somewhere; the demo client is exempt.
  if (!store.stored && !alert.emailed && client.slug !== 'demo') {
    return NextResponse.json({ ok: false, message: 'We could not send your feedback. Please try again.' }, { status: 503 });
  }

  return NextResponse.json({ ok: true, outcome: 'private_feedback', stored: store.stored, emailed: alert.emailed });
}
