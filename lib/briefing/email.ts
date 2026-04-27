import { Resend } from 'resend';
import { getNewsletterFrom, getNewsletterReplyTo } from './config';
import { getActiveSubscribers } from './posts';
import type { BriefingPost } from './types';

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderEmail(post: BriefingPost) {
  const sources = post.sources
    .map(
      (source) =>
        `<li><a href="${escapeHtml(source.url)}" style="color:#22d3ee">${escapeHtml(source.publisher)} - ${escapeHtml(source.title)}</a></li>`,
    )
    .join('');

  return `
    <div style="background:#050505;color:#f4f4f5;font-family:Inter,Arial,sans-serif;padding:32px">
      <div style="max-width:680px;margin:0 auto;border:1px solid #27272a;border-radius:28px;padding:32px;background:#09090b">
        <p style="color:#67e8f9;font-size:12px;font-weight:700;letter-spacing:.2em;text-transform:uppercase">ThigaoA.i Briefing</p>
        <h1 style="font-size:34px;line-height:1.05;margin:18px 0;color:#fff">${escapeHtml(post.title)}</h1>
        <p style="font-size:18px;line-height:1.6;color:#a1a1aa">${escapeHtml(post.dek)}</p>
        <hr style="border:none;border-top:1px solid #27272a;margin:28px 0" />
        <p style="font-size:16px;line-height:1.7;color:#d4d4d8">${escapeHtml(post.brief)}</p>
        <div style="border:1px solid #164e63;background:#08334455;border-radius:18px;padding:18px;margin:26px 0">
          <strong style="color:#cffafe">Take principal:</strong>
          <p style="margin:8px 0 0;color:#e4e4e7;line-height:1.6">${escapeHtml(post.takeaway)}</p>
        </div>
        <p style="color:#a1a1aa;font-weight:700">Fontes</p>
        <ul style="color:#a1a1aa;line-height:1.8">${sources}</ul>
      </div>
    </div>
  `;
}

export async function sendBriefingEmail(post: BriefingPost) {
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
  const html = renderEmail(post);
  const replyTo = getNewsletterReplyTo();
  const recipients = subscribers.slice(0, 100);

  const result = await resend.batch.send(
    recipients.map((subscriber) => ({
        from,
        to: subscriber.email,
        replyTo,
        subject: `${post.category}: ${post.title}`,
        html,
      })),
    { batchValidation: 'permissive' },
  );

  if (result.error) {
    return {
      sent: false,
      attempted: recipients.length,
      reason: result.error.message,
    };
  }

  return {
    sent: true,
    attempted: recipients.length,
    delivered: result.data?.data.length ?? 0,
    failed: result.data?.errors?.length ?? 0,
  };
}
