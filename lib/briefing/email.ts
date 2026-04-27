import { Resend } from 'resend';
import { getNewsletterFrom, getNewsletterReplyTo } from './config';
import { renderBriefingEmail, renderBriefingText } from './email-template';
import { getActiveSubscribers } from './posts';
import type { BriefingPost } from './types';

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
  const html = renderBriefingEmail(post);
  const text = renderBriefingText(post);
  const replyTo = getNewsletterReplyTo();
  const recipients = subscribers.slice(0, 100);

  const result = await resend.batch.send(
    recipients.map((subscriber) => ({
        from,
        to: subscriber.email,
        replyTo,
        subject: `${post.category}: ${post.title}`,
        html,
        text,
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
