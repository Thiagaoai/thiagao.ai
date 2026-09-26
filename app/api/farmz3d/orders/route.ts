import { NextResponse } from 'next/server';
import { z } from 'zod';
import { OrderInputSchema } from '@/lib/farmz3d/catalog';
import { getFarmz3dConfigStatus, saveOrder, sendOrderEmails } from '@/lib/farmz3d/orders';
import { getClientIp, isRateLimited } from '@/lib/shared/request-guard';

const MIN_FORM_TIME_MS = 3000;
const MAX_ORDERS_PER_IP_PER_HOUR = 10;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = OrderInputSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      { ok: false, message: issue?.message ?? 'Invalid order.', field: issue?.path.join('.'), issues: z.flattenError(parsed.error).fieldErrors },
      { status: 400 },
    );
  }

  const order = parsed.data;
  const isBot = Boolean(order.company?.trim()) || (order.startedAt ? Date.now() - order.startedAt < MIN_FORM_TIME_MS : false);
  if (isBot) {
    return NextResponse.json({ ok: true, orderNumber: null });
  }

  if (isRateLimited(`farmz3d:${getClientIp(request)}`, MAX_ORDERS_PER_IP_PER_HOUR)) {
    return NextResponse.json({ ok: false, message: 'Too many orders from this connection. Please try again later.' }, { status: 429 });
  }

  const config = getFarmz3dConfigStatus();
  if (!config.database && !config.email) {
    return NextResponse.json(
      { ok: false, message: 'Online ordering is not available right now. Please contact us directly.' },
      { status: 503 },
    );
  }

  try {
    const { saved, stored, storeError } = await saveOrder(order);
    const email = config.email ? await sendOrderEmails(order, saved) : { emailed: false as const, error: 'Email not configured.' };

    if (!stored && !email.emailed) {
      console.error('[farmz3d] order not persisted', { storeError, emailError: email.error });
      return NextResponse.json(
        { ok: false, message: 'We could not record your order. Please try again or contact us directly.' },
        { status: 503 },
      );
    }

    if (!stored) console.error('[farmz3d] order emailed but not stored', { storeError });
    if (!email.emailed && config.email) console.error('[farmz3d] order stored but email failed', { error: email.error });

    return NextResponse.json({
      ok: true,
      orderNumber: saved.orderNumber,
      estimatedTotalCents: saved.estimatedTotalCents,
      stored,
      emailed: email.emailed,
    });
  } catch (error) {
    console.error('[farmz3d] order failed', error);
    return NextResponse.json({ ok: false, message: 'Unexpected error. Please try again.' }, { status: 500 });
  }
}
