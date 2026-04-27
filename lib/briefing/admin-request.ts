export function isAdminRequestAuthorized(request: Request) {
  const apiToken = process.env.ADMIN_API_TOKEN;
  const dashboardToken = process.env.ADMIN_DASHBOARD_TOKEN;

  if (!apiToken && !dashboardToken && process.env.NODE_ENV !== 'production') return true;

  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (apiToken && bearer === apiToken) return true;

  const cookies = request.headers.get('cookie') ?? '';
  const sessionCookie = cookies
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('newsletter_admin_session='))
    ?.split('=')
    .slice(1)
    .join('=');

  return Boolean(dashboardToken && sessionCookie === dashboardToken);
}
