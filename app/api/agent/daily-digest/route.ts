import { NextResponse } from 'next/server';
import { runDailyBriefingAgent } from '@/lib/briefing/agent';
import { getSuccessfulAgentRunForToday, saveAgentDrafts } from '@/lib/briefing/posts';

export const runtime = 'nodejs';
export const maxDuration = 60;

function isAuthorized(request: Request) {
  const secret = process.env.AGENT_CRON_SECRET;
  if (!secret && process.env.NODE_ENV !== 'production') return true;
  if (!secret) return false;

  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const headerSecret = request.headers.get('x-agent-secret');

  return bearer === secret || headerSecret === secret;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Unauthorized.',
      },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { force?: boolean };
    const previousRun = body.force ? null : await getSuccessfulAgentRunForToday();

    if (previousRun) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: 'Daily briefing agent already ran successfully for today in America/New_York.',
        previousRun,
      });
    }

    const result = await runDailyBriefingAgent();
    const storage = await saveAgentDrafts(result.drafts, result.run);

    return NextResponse.json({
      ok: true,
      draftsCreated: result.drafts.length,
      storage,
      notes: result.run.notes,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Agent failed.';

    return NextResponse.json(
      {
        ok: false,
        message,
      },
      { status: 500 },
    );
  }
}
