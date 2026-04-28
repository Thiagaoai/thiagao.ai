import { NextResponse } from 'next/server';
import { runDailyBriefingAgent } from '@/lib/briefing/agent';
import { sendBriefingEmail } from '@/lib/briefing/email';
import { hasSentCampaign, publishBriefingPost, saveAgentDrafts } from '@/lib/briefing/posts';

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

function getNewYorkDateKey() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? '';

  return `${value('year')}-${value('month')}-${value('day')}`;
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
    const campaign = `daily-${getNewYorkDateKey()}`;
    const alreadySent = body.force ? false : await hasSentCampaign(campaign);

    if (alreadySent) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: 'Daily briefing was already sent today in America/New_York.',
        campaign,
      });
    }

    const result = await runDailyBriefingAgent();
    const storage = await saveAgentDrafts(result.drafts, result.run);
    const storedDrafts = 'drafts' in storage && Array.isArray(storage.drafts) ? storage.drafts : [];
    const primaryDraft = storedDrafts[0] ?? null;

    if (!primaryDraft) {
      return NextResponse.json(
        {
          ok: false,
          message: 'No briefing draft was created, so no email was sent.',
          draftsCreated: result.drafts.length,
          storage,
          notes: result.run.notes,
        },
        { status: 500 },
      );
    }

    const post = await publishBriefingPost(primaryDraft.id);
    const email = await sendBriefingEmail(post, { campaign });

    return NextResponse.json(
      {
        ok: Boolean(email.sent),
        campaign,
        draftsCreated: result.drafts.length,
        publishedPost: post,
        email,
        storage,
        notes: result.run.notes,
      },
      { status: email.sent ? 200 : 500 },
    );
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
