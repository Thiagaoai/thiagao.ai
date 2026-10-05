import { NextResponse } from 'next/server';
import { safeEqual } from '@/lib/shared/request-guard';
import { getBriefingConfigStatus } from '@/lib/briefing/config';

function isAuthorized(request: Request) {
  const token = process.env.ADMIN_API_TOKEN;
  if (!token) return false;

  const authorization = request.headers.get('authorization') ?? '';
  return /^Bearer\s+/i.test(authorization) && safeEqual(authorization.replace(/^Bearer\s+/i, ''), token);
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
