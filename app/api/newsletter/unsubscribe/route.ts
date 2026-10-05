import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logNewsletterEvent, unsubscribeSubscriber } from '@/lib/briefing/posts';
import { verifyUnsubscribeToken } from '@/lib/briefing/unsubscribe';

export const runtime = 'nodejs';

const Schema = z.object({ email: z.email(), token: z.string().min(16).max(64) });

async function readBody(request: Request): Promise<Record<string, unknown>> {
  const type = request.headers.get('content-type') ?? '';
  if (type.includes('application/json')) return (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const form = await request.formData().catch(() => null);
  return form ? Object.fromEntries(form.entries()) : {};
}

// Behind Dokploy/Traefik request.url may carry the internal host, so prefer the forwarded headers.
function publicUrl(request: Request, path: string) {
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  if (forwardedHost) {
    const proto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() || 'https';
    return new URL(path, `${proto}://${forwardedHost}`);
  }
  return new URL(path, request.url);
}

// Deliberately not same-origin guarded: one-click unsubscribe (RFC 8058) is a cross-origin POST from the
// mail provider with body "List-Unsubscribe=One-Click"; email and token then come from the query string.
export async function POST(request: Request) {
  const url = new URL(request.url);
  const body = await readBody(request);
  const raw = {
    email: body.email ?? url.searchParams.get('email') ?? undefined,
    token: body.token ?? url.searchParams.get('token') ?? undefined,
  };
  const wantsHtml = (request.headers.get('accept') ?? '').includes('text/html');
  const redirect = (state: 'done' | 'invalid') => NextResponse.redirect(publicUrl(request, `/newsletter/sair?state=${state}`), 303);
  const parsed = Schema.safeParse(raw);
  if (!parsed.success || !verifyUnsubscribeToken(parsed.data.email, parsed.data.token)) {
    return wantsHtml ? redirect('invalid') : NextResponse.json({ ok: false, message: 'Invalid unsubscribe link.' }, { status: 400 });
  }
  const result = await unsubscribeSubscriber(parsed.data.email);
  await logNewsletterEvent({ eventType: 'unsubscribe', path: '/newsletter/sair', email: parsed.data.email, metadata: { updated: result.updated } });
  return wantsHtml ? redirect('done') : NextResponse.json({ ok: true, ...result });
}
