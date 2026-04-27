import { timingSafeEqual } from 'node:crypto';

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function isNewsletterAdminAuthorized({
  authorization,
  token,
}: {
  authorization?: string | null;
  token?: string | null;
}) {
  const dashboardToken = process.env.ADMIN_DASHBOARD_TOKEN;
  const apiToken = process.env.ADMIN_API_TOKEN;
  const user = process.env.ADMIN_DASHBOARD_USER;
  const password = process.env.ADMIN_DASHBOARD_PASSWORD;

  if (dashboardToken && token && safeEqual(token, dashboardToken)) {
    return true;
  }

  if (apiToken && authorization?.replace(/^Bearer\s+/i, '') === apiToken) {
    return true;
  }

  if (!user || !password || !authorization?.startsWith('Basic ')) {
    return false;
  }

  const decoded = Buffer.from(authorization.replace(/^Basic\s+/i, ''), 'base64').toString('utf8');
  const separatorIndex = decoded.indexOf(':');
  if (separatorIndex === -1) return false;

  const providedUser = decoded.slice(0, separatorIndex);
  const providedPassword = decoded.slice(separatorIndex + 1);

  return safeEqual(providedUser, user) && safeEqual(providedPassword, password);
}

export function unauthorizedNewsletterAdminResponse() {
  return new Response('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="ThigaoA.i Newsletter Admin", charset="UTF-8"',
    },
  });
}
