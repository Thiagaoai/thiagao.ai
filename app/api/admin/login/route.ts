import { NextResponse } from 'next/server';
import { logNewsletterEvent } from '@/lib/briefing/posts';
import { verifyAdminCredentials } from '@/lib/briefing/admin-users';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const sessionToken = process.env.ADMIN_DASHBOARD_TOKEN || process.env.ADMIN_API_TOKEN;

  if (!sessionToken) {
    return NextResponse.json({ ok: false, message: 'Login is not configured.' }, { status: 500 });
  }

  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
  const email = body?.email?.trim() ?? '';
  const password = body?.password ?? '';

  if (!email || !password) {
    return NextResponse.json({ ok: false, message: 'Informe usuário e senha.' }, { status: 400 });
  }

  const verified = await verifyAdminCredentials(email, password);
  if (!verified.ok) {
    return NextResponse.json({ ok: false, message: 'Usuário ou senha inválidos.' }, { status: 401 });
  }

  await logNewsletterEvent({
    eventType: 'admin_login',
    path: '/admin/login',
    source: 'admin',
    email,
  });

  const response = NextResponse.json({ ok: true, redirectTo: '/admin/newsletter' });
  response.cookies.set('newsletter_admin_session', sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  });

  return response;
}
