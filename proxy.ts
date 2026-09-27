import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { safeEqual } from '@/lib/shared/request-guard';

const ADMIN_PAGES = new Set(['/admin/newsletter', '/admin/farmz3d']);

function isBasicAuthorized(authorization: string | null) {
  const user = process.env.ADMIN_DASHBOARD_USER;
  const password = process.env.ADMIN_DASHBOARD_PASSWORD;

  if (!user || !password || !authorization?.startsWith('Basic ')) {
    return false;
  }

  let decoded: string;
  try {
    decoded = atob(authorization.replace(/^Basic\s+/i, ''));
  } catch {
    return false;
  }
  const separatorIndex = decoded.indexOf(':');
  if (separatorIndex === -1) return false;

  return safeEqual(decoded.slice(0, separatorIndex), user) && safeEqual(decoded.slice(separatorIndex + 1), password);
}

function guardAdmin(request: NextRequest) {
  const dashboardToken = process.env.ADMIN_DASHBOARD_TOKEN;
  const session = request.cookies.get('newsletter_admin_session')?.value;

  if ((dashboardToken && session && safeEqual(session, dashboardToken)) || isBasicAuthorized(request.headers.get('authorization'))) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/admin/login';
  loginUrl.search = '';
  return NextResponse.redirect(loginUrl);
}

// Hosts that serve the Farmz3D store at their root, e.g. FARMZ3D_HOSTS="farmz3d.com,www.farmz3d.com".
function storeHosts() {
  return new Set(
    (process.env.FARMZ3D_HOSTS ?? '')
      .split(',')
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean),
  );
}

// On the store domain: "/" shows the store, "/farmz3d" redirects to "/",
// and any other page belongs to the main site.
function routeStoreHost(request: NextRequest, host: string) {
  const { pathname, search } = request.nextUrl;

  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/farmz3d';
    return NextResponse.rewrite(url);
  }

  if (pathname === '/farmz3d' || pathname === '/farmz3d/') {
    // Build from the public host: behind the reverse proxy nextUrl may carry the internal one.
    const protocol = request.headers.get('x-forwarded-proto') ?? request.nextUrl.protocol.replace(':', '');
    return NextResponse.redirect(new URL(`/${search}`, `${protocol}://${host}`), 308);
  }

  const mainSite = process.env.FARMZ3D_MAIN_SITE_URL || 'https://www.thiagao.io';
  return NextResponse.redirect(new URL(`${pathname}${search}`, mainSite), 307);
}

export function proxy(request: NextRequest) {
  const host = (request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? '').split(':')[0].toLowerCase();
  if (host && storeHosts().has(host)) return routeStoreHost(request, host);

  if (ADMIN_PAGES.has(request.nextUrl.pathname)) return guardAdmin(request);

  return NextResponse.next();
}

export const config = {
  // Pages only: API routes, Next.js assets and files (anything with a dot) skip the proxy.
  matcher: ['/((?!api/|_next/|.*\\..*).*)'],
};
