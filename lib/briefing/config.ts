export const DEFAULT_NEWSLETTER_FROM = 'ThigaoA.i Briefing <dockplus@dockplusai.com>';
export const DEFAULT_NEWSLETTER_REPLY_TO = 'dockplus@dockplusai.com';

export function getNewsletterFrom() {
  return process.env.NEWSLETTER_FROM || DEFAULT_NEWSLETTER_FROM;
}

export function getNewsletterReplyTo() {
  return process.env.NEWSLETTER_REPLY_TO || DEFAULT_NEWSLETTER_REPLY_TO;
}

export function getBriefingConfigStatus() {
  const checks = {
    supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    resendApiKey: Boolean(process.env.RESEND_API_KEY),
    agentCronSecret: Boolean(process.env.AGENT_CRON_SECRET),
    adminApiToken: Boolean(process.env.ADMIN_API_TOKEN),
    adminDashboardToken: Boolean(process.env.ADMIN_DASHBOARD_TOKEN),
    langSmithApiKey: Boolean(process.env.LANGSMITH_API_KEY),
    langSmithTracing: process.env.LANGSMITH_TRACING === 'true',
  };

  return {
    checks,
    ready: {
      database: checks.supabaseUrl && checks.supabaseServiceRole,
      email: checks.resendApiKey,
      agent: checks.agentCronSecret,
      admin: checks.adminApiToken && checks.adminDashboardToken,
      tracing: checks.langSmithApiKey && checks.langSmithTracing,
    },
    sender: {
      from: getNewsletterFrom(),
      replyTo: getNewsletterReplyTo(),
    },
  };
}
