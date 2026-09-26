import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/briefing/supabase';
import { isValidTwilioSignature } from './twilio';

const E164 = z.string().regex(/^\+[1-9]\d{7,14}$/, 'Phone numbers must be E.164, e.g. +15085550100');

const RouteSchema = z.object({
  twilioNumber: E164,
  forwardTo: E164,
  businessName: z.string().min(1).max(120),
  smsText: z.string().min(1).max(600),
  // Keep this shorter than the owner's voicemail pickup time, otherwise voicemail
  // "answers" the call and no text is sent.
  dialTimeoutSeconds: z.number().int().min(5).max(60).default(18),
});

export type MissedCallRoute = z.infer<typeof RouteSchema>;

export const MISSED_DIAL_STATUSES = new Set(['no-answer', 'busy', 'failed', 'canceled']);

export function getMissedCallRoutes(): MissedCallRoute[] {
  const raw = process.env.MISSED_CALL_ROUTES;
  if (!raw) return [];
  try {
    return z.array(RouteSchema).parse(JSON.parse(raw));
  } catch (error) {
    console.error('[missed-call] MISSED_CALL_ROUTES is invalid', error);
    return [];
  }
}

export function findRoute(twilioNumber: string | undefined) {
  if (!twilioNumber) return null;
  return getMissedCallRoutes().find((route) => route.twilioNumber === twilioNumber) ?? null;
}

export function getTwilioEnv() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const baseUrl = process.env.TWILIO_WEBHOOK_BASE_URL?.replace(/\/+$/, '');
  if (!accountSid || !authToken || !baseUrl) return null;
  return { accountSid, authToken, baseUrl };
}

// Parses a Twilio webhook and validates its signature against the public URL Twilio called.
export async function readVerifiedTwilioRequest(request: Request) {
  const env = getTwilioEnv();
  if (!env) return { ok: false as const, status: 503, reason: 'Twilio env vars are not configured.' };

  const form = await request.formData();
  const params: Record<string, string> = {};
  form.forEach((value, key) => {
    if (typeof value === 'string') params[key] = value;
  });

  const { pathname, search } = new URL(request.url);
  const publicUrl = `${env.baseUrl}${pathname}${search}`;
  if (!isValidTwilioSignature(env.authToken, publicUrl, params, request.headers.get('x-twilio-signature'))) {
    return { ok: false as const, status: 403, reason: 'Invalid Twilio signature.' };
  }

  return { ok: true as const, env, params };
}

export async function logMissedCall(entry: {
  twilioNumber: string;
  caller: string;
  dialStatus: string;
  smsSent: boolean;
  smsSid?: string;
  error?: string;
}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  const { error } = await supabase.from('dockplus_missed_calls').insert({
    twilio_number: entry.twilioNumber,
    caller: entry.caller,
    dial_status: entry.dialStatus,
    sms_sent: entry.smsSent,
    sms_sid: entry.smsSid ?? null,
    error: entry.error ?? null,
  });
  if (error) console.error('[missed-call] log failed', error.message);
}
