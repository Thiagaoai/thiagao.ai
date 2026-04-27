import { Resend } from 'resend';
import { getNewsletterFrom, getNewsletterReplyTo } from './config';
import { renderBriefingEmail, renderBriefingText } from './email-template';
import { getActiveSubscribers, logEmailSendEvents } from './posts';
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
  const subject = `${post.category}: ${post.title}`;

  const result = await resend.batch.send(
    recipients.map((subscriber) => ({
        from,
        to: subscriber.email,
        replyTo,
        subject,
        html,
        text,
      })),
    { batchValidation: 'permissive' },
  );

  if (result.error) {
    await logEmailSendEvents(
      recipients.map((subscriber) => ({
        postId: post.id,
        email: subscriber.email,
        subject,
        status: 'failed',
        campaign: post.slug,
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
        postId: post.id,
        email: subscriber.email,
        subject,
        status: error ? 'failed' : 'sent',
        providerId,
        campaign: post.slug,
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
