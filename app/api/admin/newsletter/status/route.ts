import { NextResponse } from 'next/server';
import { getBriefingConfigStatus } from '@/lib/briefing/config';

function isAuthorized(request: Request) {
  const token = process.env.ADMIN_API_TOKEN;
  if (!token && process.env.NODE_ENV !== 'production') return true;
  if (!token) return false;

  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  return bearer === token;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Unauthorized.',
      },
      { status: 401 },
    );
  }

  return NextResponse.json({
    ok: true,
    ...getBriefingConfigStatus(),
  });
}
