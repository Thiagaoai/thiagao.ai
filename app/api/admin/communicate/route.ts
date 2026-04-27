import { NextResponse } from 'next/server';
import { isAdminRequestAuthorized } from '@/lib/briefing/admin-request';
import { sendCustomNewsletterEmail } from '@/lib/briefing/email';

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
