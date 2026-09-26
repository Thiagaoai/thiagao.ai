import { escapeXml, twiml } from '@/lib/dockplus/twilio';
import { findRoute, readVerifiedTwilioRequest } from '@/lib/dockplus/missed-call';

function xml(body: string, status = 200) {
  return new Response(body, { status, headers: { 'Content-Type': 'text/xml; charset=utf-8' } });
}

// Twilio "A call comes in" webhook: forward the call to the owner, then hand the
// result to /status via the Dial action.
export async function POST(request: Request) {
  const verified = await readVerifiedTwilioRequest(request);
  if (!verified.ok) return new Response(verified.reason, { status: verified.status });

  const route = findRoute(verified.params.To);
  if (!route) {
    console.error('[missed-call] no route for number', verified.params.To);
    return xml(twiml('<Say>Sorry, this number is not configured yet. Goodbye.</Say><Hangup/>'));
  }

  const action = escapeXml(`${verified.env.baseUrl}/api/dockplus/missed-call/status`);
  return xml(
    twiml(
      `<Dial timeout="${route.dialTimeoutSeconds}" action="${action}" method="POST">${escapeXml(route.forwardTo)}</Dial>`,
    ),
  );
}
