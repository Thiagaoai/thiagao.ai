import { NextResponse } from 'next/server';
import { sendCustomNewsletterEmail } from '@/lib/briefing/email';

export const runtime = 'nodejs';

function isAuthorized(request: Request) {
  const token = process.env.ADMIN_API_TOKEN;
  if (!token && process.env.NODE_ENV !== 'production') return true;
  if (!token) return false;

  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  return bearer === token;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    subject?: string;
    headline?: string;
    preheader?: string;
    html?: string;
    text?: string;
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
  });

  return NextResponse.json({ ok: Boolean(email.sent), email });
}
