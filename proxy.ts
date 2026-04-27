import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

function isBasicAuthorized(authorization: string | null) {
  const user = process.env.ADMIN_DASHBOARD_USER;
  const password = process.env.ADMIN_DASHBOARD_PASSWORD;

  if (!user || !password || !authorization?.startsWith('Basic ')) {
    return false;
  }

  const decoded = atob(authorization.replace(/^Basic\s+/i, ''));
  const separatorIndex = decoded.indexOf(':');
  if (separatorIndex === -1) return false;

  return decoded.slice(0, separatorIndex) === user && decoded.slice(separatorIndex + 1) === password;
}

export function proxy(request: NextRequest) {
  const dashboardToken = process.env.ADMIN_DASHBOARD_TOKEN;
  const token = request.nextUrl.searchParams.get('token');

  if ((dashboardToken && token === dashboardToken) || isBasicAuthorized(request.headers.get('authorization'))) {
    return NextResponse.next();
  }

  return new NextResponse('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="ThigaoA.i Newsletter Admin", charset="UTF-8"',
    },
  });
}

export const config = {
  matcher: ['/admin/newsletter'],
};
