import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { getNewYorkDateKey, runDailyBriefingAgent } from '@/lib/briefing/agent';
import { isAdminRequestAuthorized } from '@/lib/briefing/admin-request';
import { decideDailyAction } from '@/lib/briefing/daily-action';
import { sendBriefingEmail } from '@/lib/briefing/email';
import { findEditionsForDate, hasSentCampaign, publishBriefingPost, saveAgentDrafts } from '@/lib/briefing/posts';
import type { BriefingPost } from '@/lib/briefing/types';
import { safeEqual } from '@/lib/shared/request-guard';

export const runtime = 'nodejs';
// No-op on the Dokploy container, but documents the budget: feeds + writer (≤ 2 × 90 s) + batched sends.
export const maxDuration = 300;

function isCronAuthorized(request: Request) {
  const secret = process.env.AGENT_CRON_SECRET;
  if (!secret && process.env.NODE_ENV !== 'production') return true;
  if (!secret) return false;
  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  const header = request.headers.get('x-agent-secret') ?? '';
  return safeEqual(bearer, secret) || safeEqual(header, secret);
}

// `skipped` is optional so this compiles against the current `sendBriefingEmail` too (Task 10 adds the field).
function statusFor(email: { sent: boolean; skipped?: boolean }) {
  return email.sent || email.skipped ? 200 : 502;
}

// The newsletter page, the home cards and every edition page (prev/next links) show the new edition.
function refreshPages() {
  revalidatePath('/');
  revalidatePath('/newsletter');
  revalidatePath('/newsletter/[slug]', 'page');
}

async function sendAndRespond(post: BriefingPost, extra: Record<string, unknown>) {
  const email = await sendBriefingEmail(post, { campaign: post.slug });
  const status = statusFor(email);
  return NextResponse.json({ ok: status === 200, campaign: post.slug, post, email, ...extra }, { status });
}

export async function POST(request: Request) {
  if (!isCronAuthorized(request) && !isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const body = (await request.json().catch(() => ({}))) as { force?: boolean; dryRun?: boolean };
    const now = new Date();
    const dateKey = getNewYorkDateKey(now);

    if (body.dryRun) {
      const result = await runDailyBriefingAgent({ now });
      return NextResponse.json({ ok: true, dryRun: true, campaign: `daily-${dateKey}`, writer: result.writer, draft: result.draft, run: result.run });
    }

    const editions = body.force ? [] : await findEditionsForDate(dateKey);
    const sentSlugs = new Set<string>();
    for (const edition of editions) if (await hasSentCampaign(edition.slug)) sentSlugs.add(edition.slug);
    const action = decideDailyAction({
      dateKey,
      editions,
      sentSlugs,
      force: Boolean(body.force),
      hhmm: now.toISOString().slice(11, 16).replace(':', ''),
    });

    if (action.kind === 'skip') {
      return NextResponse.json({ ok: true, skipped: true, reason: action.reason, campaign: action.slug });
    }
    if (action.kind === 'resend') {
      const post = editions.find((edition) => edition.slug === action.slug)!;
      return sendAndRespond(post, { resent: true });
    }
    if (action.kind === 'publish-and-send') {
      const stranded = editions.find((edition) => edition.slug === action.slug)!;
      const post = await publishBriefingPost(stranded.id);
      refreshPages();
      return sendAndRespond(post, { recovered: true });
    }

    const result = await runDailyBriefingAgent({ now, slug: action.slug });
    if (!result.draft) {
      return NextResponse.json({ ok: false, message: "No edition could be built from today's sources.", notes: result.run.notes }, { status: 500 });
    }
    const storage = await saveAgentDrafts([result.draft], result.run);
    const stored = 'drafts' in storage ? storage.drafts?.[0] : undefined;
    if (!stored) {
      return NextResponse.json({ ok: false, message: 'Edition was not stored.', storage, notes: result.run.notes }, { status: 500 });
    }
    const post = await publishBriefingPost(stored.id);
    refreshPages();
    return sendAndRespond(post, { writer: result.writer, notes: result.run.notes });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Agent failed.' }, { status: 500 });
  }
}
