import { NextResponse } from 'next/server';
import { isAdminRequestAuthorized } from '@/lib/briefing/admin-request';
import { sendCustomNewsletterEmail } from '@/lib/briefing/email';
import { renderCustomWhatsApp } from '@/lib/briefing/whatsapp';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    subject?: string;
    headline?: string;
    preheader?: string;
    html?: string;
    text?: string;
    cardImageUrl?: string;
    ctaLabel?: string;
    ctaUrl?: string;
    mode?: 'designer' | 'html';
  } | null;

  const subject = body?.subject?.trim() ?? '';
  const headline = body?.headline?.trim() ?? '';
  const preheader = body?.preheader?.trim() ?? '';
  const html = body?.html?.trim() ?? '';

  if (!subject || !headline || !preheader || !html) {
    return NextResponse.json({ ok: false, message: 'Preencha assunto, título, resumo e HTML.' }, { status: 400 });
  }

  const email = await sendCustomNewsletterEmail({
    subject,
    headline,
    preheader,
    html,
    text: body?.text,
    cardImageUrl: body?.cardImageUrl?.trim(),
    ctaLabel: body?.ctaLabel?.trim(),
    ctaUrl: body?.ctaUrl?.trim(),
    mode: body?.mode === 'html' ? 'html' : 'designer',
  });

  return NextResponse.json({
    ok: Boolean(email.sent),
    email,
    whatsapp: {
      text: renderCustomWhatsApp({
        headline,
        preheader,
        body: html,
        cardImageUrl: body?.cardImageUrl?.trim(),
        ctaUrl: body?.ctaUrl?.trim(),
      }),
    },
  });
}
