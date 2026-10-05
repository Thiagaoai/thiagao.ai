import { Resend } from 'resend';
import { getNewsletterFrom, getNewsletterReplyTo } from './config';
import { escapeHtml, renderEditionEmail, renderEditionText } from './email-template';
import { getActiveSubscribers, logEmailSendEvents } from './posts';
import type { BriefingPost } from './types';
import { buildUnsubscribeUrls, hasUnsubscribeSecret } from './unsubscribe';

const UNSUB_PLACEHOLDER = '%%UNSUBSCRIBE_URL%%';

export type BriefingEmailResult = {
  sent: boolean;
  skipped: boolean;
  attempted: number;
  delivered: number;
  failed: number;
  reason?: string;
};

export async function sendBriefingEmail(post: BriefingPost, options: { campaign?: string } = {}): Promise<BriefingEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, skipped: true, attempted: 0, delivered: 0, failed: 0, reason: 'RESEND_API_KEY is required.' };
  // Bulk-sender rules (Gmail, Yahoo) require one-click unsubscribe, and nothing handles a "SAIR" reply, so a
  // production send without the secret is a configuration error, not a degraded mode.
  if (!hasUnsubscribeSecret() && process.env.NODE_ENV === 'production') {
    return {
      sent: false,
      skipped: false,
      attempted: 0,
      delivered: 0,
      failed: 0,
      reason: 'NEWSLETTER_UNSUBSCRIBE_SECRET (or AGENT_CRON_SECRET) is required to send with one-click unsubscribe.',
    };
  }
  const subscribers = await getActiveSubscribers();
  if (subscribers.length === 0) return { sent: false, skipped: true, attempted: 0, delivered: 0, failed: 0, reason: 'No active subscribers yet.' };

  const resend = new Resend(apiKey);
  const from = getNewsletterFrom();
  const replyTo = getNewsletterReplyTo();
  const subject = post.subject?.trim() || post.title;
  const campaign = options.campaign ?? post.slug;
  const hasTokens = hasUnsubscribeSecret();
  // Render once; the per-recipient unsubscribe link is substituted below.
  const html = renderEditionEmail(post, { unsubscribeUrl: hasTokens ? UNSUB_PLACEHOLDER : null });
  const text = renderEditionText(post, { unsubscribeUrl: hasTokens ? UNSUB_PLACEHOLDER : null });

  let attempted = 0;
  let delivered = 0;
  let failed = 0;
  const failures: string[] = [];
  for (let start = 0; start < subscribers.length; start += 100) {
    const chunk = subscribers.slice(start, start + 100);
    const messages = chunk.map((subscriber) => {
      const urls = buildUnsubscribeUrls(subscriber.email);
      return {
        from,
        to: subscriber.email,
        replyTo,
        subject,
        html: urls ? html.replaceAll(UNSUB_PLACEHOLDER, escapeHtml(urls.pageUrl)) : html,
        text: urls ? text.replaceAll(UNSUB_PLACEHOLDER, urls.pageUrl) : text,
        headers: urls ? { 'List-Unsubscribe': `<${urls.apiUrl}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } : undefined,
      };
    });
    const result = await resend.batch.send(messages, { batchValidation: 'permissive' });
    attempted += chunk.length;
    if (result.error) {
      failed += chunk.length;
      failures.push(result.error.message);
      await logEmailSendEvents(chunk.map((subscriber) => ({ postId: post.id, email: subscriber.email, subject, status: 'failed', campaign, error: result.error?.message ?? 'Resend batch failed.' })));
      continue;
    }
    const errors = new Map((result.data?.errors ?? []).map((error) => [error.index, error.message]));
    const ids = result.data?.data ?? [];
    let okIndex = 0;
    await logEmailSendEvents(
      chunk.map((subscriber, index) => {
        const error = errors.get(index);
        return { postId: post.id, email: subscriber.email, subject, status: error ? 'failed' : 'sent', providerId: error ? null : ids[okIndex++]?.id ?? null, campaign, error: error ?? null };
      }),
    );
    delivered += ids.length;
    failed += errors.size;
  }
  const sent = delivered > 0;
  return { sent, skipped: false, attempted, delivered, failed, reason: sent ? undefined : failures[0] ?? 'Resend accepted nothing.' };
}

export async function sendCustomNewsletterEmail({
  subject,
  headline,
  preheader,
  html,
  text,
  cardImageUrl,
  ctaLabel = 'Abrir briefing no site',
  ctaUrl = 'https://thiagao.io/newsletter',
  mode = 'designer',
}: {
  subject: string;
  headline: string;
  preheader: string;
  html: string;
  text?: string;
  cardImageUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  mode?: 'designer' | 'html';
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = getNewsletterFrom();

  if (!apiKey) {
    return {
      sent: false,
      reason: 'RESEND_API_KEY is required.',
    };
  }

  const subscribers = await getActiveSubscribers();
  if (subscribers.length === 0) {
    return {
      sent: false,
      reason: 'No active subscribers yet.',
    };
  }

  const resend = new Resend(apiKey);
  const replyTo = getNewsletterReplyTo();
  const recipients = subscribers.slice(0, 100);
  const campaign = `manual-${Date.now()}`;
  const safeCtaUrl = ctaUrl || 'https://thiagao.io/newsletter';
  const safeCtaLabel = ctaLabel || 'Abrir briefing no site';
  const imageBlock = cardImageUrl
    ? `<tr>
              <td style="padding:0 30px 26px;">
                <img src="${cardImageUrl}" alt="${headline}" style="display:block;width:100%;max-width:620px;border-radius:24px;border:1px solid rgba(255,255,255,.12);" />
              </td>
            </tr>`
    : '';
  const wrappedHtml =
    mode === 'html'
      ? html
      : `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;background:#050505;color:#f7f7f7;font-family:Inter,Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;color:transparent">${preheader}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#050505;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;border:1px solid rgba(255,255,255,.12);border-radius:28px;overflow:hidden;background:#0b0f14;">
            <tr>
              <td style="padding:34px 30px 20px;">
                <img src="https://thiagao.io/brand/thigaoai-logo.png" width="74" height="74" alt="Thiagao Ai" style="display:block;border-radius:18px;margin-bottom:22px;" />
                <div style="font-size:12px;text-transform:uppercase;letter-spacing:.22em;color:#67e8f9;font-weight:800;">Thiagao Ai Breaking Briefing</div>
                <h1 style="margin:14px 0 0;font-size:34px;line-height:1.05;color:#ffffff;">${headline}</h1>
                <p style="margin:16px 0 0;font-size:16px;line-height:1.7;color:#a1a1aa;">${preheader}</p>
              </td>
            </tr>
            ${imageBlock}
            <tr>
              <td style="padding:0 30px 34px;color:#e5e7eb;font-size:16px;line-height:1.75;">
                ${html}
                <p style="margin:28px 0 0;">
                  <a href="${safeCtaUrl}" style="display:inline-block;background:#ffffff;color:#050505;text-decoration:none;font-weight:900;border-radius:999px;padding:13px 18px;">${safeCtaLabel}</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const result = await resend.batch.send(
    recipients.map((subscriber) => ({
      from,
      to: subscriber.email,
      replyTo,
      subject,
      html: wrappedHtml,
      text: text || `${headline}\n\n${preheader}`,
    })),
    { batchValidation: 'permissive' },
  );

  if (result.error) {
    await logEmailSendEvents(
      recipients.map((subscriber) => ({
        email: subscriber.email,
        subject,
        status: 'failed',
        campaign,
        error: result.error?.message ?? 'Resend batch failed.',
      })),
    );

    return {
      sent: false,
      attempted: recipients.length,
      reason: result.error.message,
    };
  }

  const errors = new Map((result.data?.errors ?? []).map((error) => [error.index, error.message]));
  const sentIds = result.data?.data ?? [];
  let successIndex = 0;

  await logEmailSendEvents(
    recipients.map((subscriber, index) => {
      const error = errors.get(index);
      const providerId = error ? null : sentIds[successIndex++]?.id ?? null;

      return {
        email: subscriber.email,
        subject,
        status: error ? 'failed' : 'sent',
        providerId,
        campaign,
        error: error ?? null,
      };
    }),
  );

  return {
    sent: true,
    attempted: recipients.length,
    delivered: result.data?.data.length ?? 0,
    failed: result.data?.errors?.length ?? 0,
  };
}
