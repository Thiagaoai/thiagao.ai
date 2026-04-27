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
  const session = request.cookies.get('newsletter_admin_session')?.value;

  if (
    (dashboardToken && (token === dashboardToken || session === dashboardToken)) ||
    isBasicAuthorized(request.headers.get('authorization'))
  ) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/admin/login';
  loginUrl.search = '';
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/newsletter'],
};
