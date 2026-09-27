import { isSameOriginRequest, safeEqual } from '@/lib/shared/request-guard';

// Always requires credentials, in every environment (no development bypass).
export function isAdminRequestAuthorized(request: Request) {
  const apiToken = process.env.ADMIN_API_TOKEN;
  const dashboardToken = process.env.ADMIN_DASHBOARD_TOKEN;

  const authorization = request.headers.get('authorization') ?? '';
  if (apiToken && /^Bearer\s+/i.test(authorization) && safeEqual(authorization.replace(/^Bearer\s+/i, ''), apiToken)) return true;
  if (!isSameOriginRequest(request)) return false;

  const cookies = request.headers.get('cookie') ?? '';
  const sessionCookie = cookies
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('newsletter_admin_session='))
    ?.split('=')
    .slice(1)
    .join('=');

  return Boolean(dashboardToken && sessionCookie && safeEqual(sessionCookie, dashboardToken));
}
