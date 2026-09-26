import { Resend } from 'resend';
import { z } from 'zod';
import { getNewsletterFrom } from '@/lib/briefing/config';
import { getSupabaseAdmin } from '@/lib/briefing/supabase';
import { escapeHtml, senderWithName } from '@/lib/shared/request-guard';
import type { ReviewClient } from './review-clients';

export const ReviewInputSchema = z
  .object({
    clientSlug: z.string().trim().min(1).max(80),
    rating: z.number().int().min(1).max(5),
    name: z.string().trim().max(120).optional(),
    contact: z.string().trim().max(200).optional(),
    message: z.string().trim().max(2000).optional(),
  })
  .refine((input) => input.rating >= 4 || (input.message?.length ?? 0) >= 3, {
    message: 'Please tell us what happened so we can make it right.',
    path: ['message'],
  });

export type ReviewInput = z.infer<typeof ReviewInputSchema>;

export async function recordReviewEvent(input: ReviewInput) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { stored: false, error: 'Supabase not configured.' };

  const { error } = await supabase.from('dockplus_review_events').insert({
    client_slug: input.clientSlug,
    rating: input.rating,
    outcome: input.rating >= 4 ? 'google_redirect' : 'private_feedback',
    name: input.name || null,
    contact: input.contact || null,
    message: input.message || null,
  });

  return error ? { stored: false, error: error.message } : { stored: true };
}

export async function sendFeedbackAlert(client: ReviewClient, input: ReviewInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = client.notifyEmail || process.env.DOCKPLUS_ALERT_EMAIL;
  if (!apiKey || !to) return { emailed: false, error: 'RESEND_API_KEY and a notify email are required.' };

  const lines = [
    ['Business', client.businessName],
    ['Rating', `${input.rating} / 5`],
    ['Name', input.name || '—'],
    ['Contact', input.contact || '—'],
    ['Message', input.message || '—'],
  ];

  const result = await new Resend(apiKey).emails.send({
    from: senderWithName('DockPlus Reviews', getNewsletterFrom()),
    to,
    subject: `⚠️ ${input.rating}-star private feedback for ${client.businessName}`,
    html: `<p style="font-family:Arial,sans-serif">A customer left private feedback instead of a public review. Reach out today.</p><ul style="font-family:Arial,sans-serif">${lines
      .map(([label, value]) => `<li><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</li>`)
      .join('')}</ul>`,
    text: lines.map(([label, value]) => `${label}: ${value}`).join('\n'),
  });

  return result.error ? { emailed: false, error: result.error.message } : { emailed: true };
}
