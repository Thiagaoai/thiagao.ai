import { escapeXml, sendTwilioSms, twiml } from '@/lib/dockplus/twilio';
import { findRoute, logMissedCall, MISSED_DIAL_STATUSES, readVerifiedTwilioRequest } from '@/lib/dockplus/missed-call';

function xml(body: string) {
  return new Response(body, { headers: { 'Content-Type': 'text/xml; charset=utf-8' } });
}

// Dial action callback: if the owner did not pick up, text the caller back.
export async function POST(request: Request) {
  const verified = await readVerifiedTwilioRequest(request);
  if (!verified.ok) return new Response(verified.reason, { status: verified.status });

  const { params, env } = verified;
  const dialStatus = params.DialCallStatus ?? 'unknown';
  const route = findRoute(params.To);

  if (!route || !MISSED_DIAL_STATUSES.has(dialStatus) || !params.From) {
    return xml(twiml('<Hangup/>'));
  }

  const sms = await sendTwilioSms({
    accountSid: env.accountSid,
    authToken: env.authToken,
    from: route.twilioNumber,
    to: params.From,
    body: route.smsText,
  });

  await logMissedCall({
    twilioNumber: route.twilioNumber,
    caller: params.From,
    dialStatus,
    smsSent: sms.ok,
    smsSid: sms.ok ? sms.sid : undefined,
    error: sms.ok ? undefined : sms.error,
  });

  if (!sms.ok) console.error('[missed-call] SMS failed', sms.error);

  const spoken = sms.ok
    ? `Sorry we missed your call at ${route.businessName}. We just sent you a text message. Goodbye.`
    : `Sorry we missed your call at ${route.businessName}. Please try again shortly. Goodbye.`;
  return xml(twiml(`<Say>${escapeXml(spoken)}</Say><Hangup/>`));
}
