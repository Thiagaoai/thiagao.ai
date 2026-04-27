import { NextResponse } from 'next/server';
import { deactivateAdminUser, listAdminUsers, upsertAdminUser } from '@/lib/briefing/admin-users';

export const runtime = 'nodejs';

function isAuthorized(request: Request) {
  const token = process.env.ADMIN_API_TOKEN;
  if (!token && process.env.NODE_ENV !== 'production') return true;
  if (!token) return false;

  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  return bearer === token;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 });
  }

  const admins = await listAdminUsers();
  return NextResponse.json({ ok: true, ...admins });
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    action?: string;
    email?: string;
    name?: string;
    password?: string;
    role?: 'owner' | 'admin';
  } | null;

  if (!body?.email) {
    return NextResponse.json({ ok: false, message: 'Informe o email do admin.' }, { status: 400 });
  }

  if (body.action === 'deactivate') {
    await deactivateAdminUser(body.email);
    return NextResponse.json({ ok: true });
  }

  if (!body.password || body.password.length < 8) {
    return NextResponse.json({ ok: false, message: 'A senha precisa ter pelo menos 8 caracteres.' }, { status: 400 });
  }

  await upsertAdminUser({
    email: body.email,
    name: body.name ?? body.email,
    password: body.password,
    role: body.role === 'owner' ? 'owner' : 'admin',
  });

  return NextResponse.json({ ok: true });
}
