import { fallbackBriefings } from './fallback';
import { getSupabaseAdmin } from './supabase';
import type {
  AgentRunRecord,
  BriefingDraftInput,
  BriefingPost,
  NewsletterAgentRun,
  NewsletterEmailLog,
  NewsletterEventInput,
  NewsletterSubscriber,
  SubscriberInput,
} from './types';

type BriefingRow = {
  id: string;
  slug: string;
  status: BriefingPost['status'];
  title: string;
  dek: string;
  brief: string;
  takeaway: string;
  category: BriefingPost['category'];
  tags: string[];
  sources: BriefingPost['sources'];
  relevance_score: number;
  reading_minutes: number;
  published_at: string | null;
  created_at: string;
};

type SubscriberRow = {
  email: string;
};

type SubscriberAdminRow = {
  email: string;
  status: NewsletterSubscriber['status'];
  source: string;
  created_at: string;
  updated_at: string;
};

type AgentRunRow = {
  id: string;
  status: NewsletterAgentRun['status'];
  started_at: string;
  finished_at: string;
  source_count: number;
  draft_count: number;
  notes: string[];
  error: string | null;
  created_at: string;
};

type EmailLogRow = {
  id: string;
  email: string;
  subject: string;
  status: NewsletterEmailLog['status'];
  provider: string;
  provider_id: string | null;
  campaign: string | null;
  error: string | null;
  created_at: string;
};

function toPost(row: BriefingRow): BriefingPost {
  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    title: row.title,
    dek: row.dek,
    brief: row.brief,
    takeaway: row.takeaway,
    category: row.category,
    tags: row.tags ?? [],
    sources: row.sources ?? [],
    relevanceScore: row.relevance_score,
    readingMinutes: row.reading_minutes,
    publishedAt: row.published_at,
    createdAt: row.created_at,
  };
}

function toRow(post: BriefingDraftInput) {
  return {
    slug: post.slug,
    status: post.status ?? 'draft',
    title: post.title,
    dek: post.dek,
    brief: post.brief,
    takeaway: post.takeaway,
    category: post.category,
    tags: post.tags,
    sources: post.sources,
    relevance_score: post.relevanceScore,
    reading_minutes: post.readingMinutes,
  };
}

function toSubscriber(row: SubscriberAdminRow): NewsletterSubscriber {
  return {
    email: row.email,
    status: row.status,
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toAgentRun(row: AgentRunRow): NewsletterAgentRun {
  return {
    id: row.id,
    status: row.status,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    sourceCount: row.source_count,
    draftCount: row.draft_count,
    notes: row.notes ?? [],
    error: row.error,
    createdAt: row.created_at,
  };
}

function toEmailLog(row: EmailLogRow): NewsletterEmailLog {
  return {
    id: row.id,
    email: row.email,
    subject: row.subject,
    status: row.status,
    provider: row.provider,
    providerId: row.provider_id,
    campaign: row.campaign,
    error: row.error,
    createdAt: row.created_at,
  };
}

export async function getPublishedBriefings({
  limit = 12,
  tag,
}: {
  limit?: number;
  tag?: string;
} = {}) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return {
      posts: fallbackBriefings.filter((post) => !tag || post.tags.includes(tag) || post.category === tag).slice(0, limit),
      source: 'fallback' as const,
    };
  }

  let query = supabase
    .from('daily_digest_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (tag) {
    query = query.contains('tags', [tag]);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to load published briefings', error);
    return {
      posts: fallbackBriefings.filter((post) => !tag || post.tags.includes(tag) || post.category === tag).slice(0, limit),
      source: 'fallback' as const,
    };
  }

  return {
    posts: (data as BriefingRow[]).map(toPost),
    source: 'supabase' as const,
  };
}

export async function getDraftBriefings({ limit = 20 }: { limit?: number } = {}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { posts: [] as BriefingPost[], source: 'not-configured' as const };

  const { data, error } = await supabase
    .from('daily_digest_posts')
    .select('*')
    .eq('status', 'draft')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return {
    posts: (data as BriefingRow[]).map(toPost),
    source: 'supabase' as const,
  };
}

export async function subscribeToBriefing({ email, source = 'briefing-ab' }: SubscriberInput) {
  const normalizedEmail = email.trim().toLowerCase();
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return {
      stored: false,
      email: normalizedEmail,
      reason: 'Supabase is not configured yet.',
    };
  }

  const { error } = await supabase.from('newsletter_subscribers').upsert(
    {
      email: normalizedEmail,
      source,
      status: 'active',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'email' },
  );

  if (error) throw new Error(error.message);

  return {
    stored: true,
    email: normalizedEmail,
  };
}

export async function logNewsletterEvent(event: NewsletterEventInput) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { stored: false };

  const { error } = await supabase.from('newsletter_events').insert({
    event_type: event.eventType,
    path: event.path ?? null,
    source: event.source ?? null,
    email: event.email?.trim().toLowerCase() ?? null,
    metadata: event.metadata ?? {},
  });

  if (error) {
    return { stored: false, error: error.message };
  }

  return { stored: true };
}

export async function saveAgentDrafts(posts: BriefingDraftInput[], run: AgentRunRecord) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return {
      stored: false,
      draftCount: posts.length,
      reason: 'Supabase is not configured yet.',
    };
  }

  const { data, error } = await supabase
    .from('daily_digest_posts')
    .insert(posts.map(toRow))
    .select('*');

  if (error) throw new Error(error.message);

  const { error: runError } = await supabase.from('agent_runs').insert({
    status: run.status,
    started_at: run.startedAt,
    finished_at: run.finishedAt,
    source_count: run.sourceCount,
    draft_count: run.draftCount,
    notes: run.notes,
    error: run.error ?? null,
  });

  if (runError) throw new Error(runError.message);

  return {
    stored: true,
    draftCount: data?.length ?? posts.length,
    drafts: (data as BriefingRow[] | null)?.map(toPost) ?? [],
  };
}

function getTimeZoneParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);

  return {
    year: value('year'),
    month: value('month'),
    day: value('day'),
    hour: value('hour'),
    minute: value('minute'),
    second: value('second'),
  };
}

function zonedTimeToUtc({
  year,
  month,
  day,
  hour = 0,
  minute = 0,
  second = 0,
  timeZone,
}: {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  second?: number;
  timeZone: string;
}) {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second);
  const zonedGuess = getTimeZoneParts(new Date(utcGuess), timeZone);
  const zonedGuessAsUtc = Date.UTC(
    zonedGuess.year,
    zonedGuess.month - 1,
    zonedGuess.day,
    zonedGuess.hour,
    zonedGuess.minute,
    zonedGuess.second,
  );

  return new Date(utcGuess - (zonedGuessAsUtc - utcGuess));
}

export async function getSuccessfulAgentRunForToday(timeZone = 'America/New_York') {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const today = getTimeZoneParts(new Date(), timeZone);
  const tomorrowUtcDate = new Date(Date.UTC(today.year, today.month - 1, today.day + 1));
  const tomorrow = {
    year: tomorrowUtcDate.getUTCFullYear(),
    month: tomorrowUtcDate.getUTCMonth() + 1,
    day: tomorrowUtcDate.getUTCDate(),
  };
  const start = zonedTimeToUtc({ ...today, hour: 0, minute: 0, second: 0, timeZone });
  const end = zonedTimeToUtc({ ...tomorrow, hour: 0, minute: 0, second: 0, timeZone });

  const { data, error } = await supabase
    .from('agent_runs')
    .select('*')
    .eq('status', 'success')
    .gte('created_at', start.toISOString())
    .lt('created_at', end.toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return toAgentRun(data as AgentRunRow);
}

export async function publishBriefingPost(id: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('Supabase is not configured yet.');

  const { data, error } = await supabase
    .from('daily_digest_posts')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);

  return toPost(data as BriefingRow);
}

export async function getActiveSubscribers() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [] as SubscriberRow[];

  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('email')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []) as SubscriberRow[];
}

export async function logEmailSendEvents(
  events: {
    postId?: string;
    email: string;
    subject: string;
    status: NewsletterEmailLog['status'];
    providerId?: string | null;
    campaign?: string | null;
    error?: string | null;
  }[],
) {
  const supabase = getSupabaseAdmin();
  if (!supabase || events.length === 0) return { stored: false, count: 0 };

  const { error } = await supabase.from('newsletter_email_logs').insert(
    events.map((event) => ({
      post_id: event.postId && event.postId !== 'gpt-5-5-test' ? event.postId : null,
      email: event.email,
      subject: event.subject,
      status: event.status,
      provider: 'resend',
      provider_id: event.providerId ?? null,
      campaign: event.campaign ?? null,
      error: event.error ?? null,
    })),
  );

  if (error) {
    console.error('Failed to store newsletter email logs', error);
    return { stored: false, count: 0, error: error.message };
  }

  return { stored: true, count: events.length };
}

export async function hasSentCampaign(campaign: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const { count, error } = await supabase
    .from('newsletter_email_logs')
    .select('*', { count: 'exact', head: true })
    .eq('campaign', campaign)
    .eq('status', 'sent');

  if (error) throw new Error(error.message);

  return Boolean(count && count > 0);
}

async function countRows(table: string, filters: Record<string, string> = {}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return 0;

  let query = supabase.from(table).select('*', { count: 'exact', head: true });
  Object.entries(filters).forEach(([key, value]) => {
    query = query.eq(key, value);
  });

  const { count, error } = await query;
  if (error) return 0;

  return count ?? 0;
}

export async function getNewsletterAdminOverview() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      metrics: {
        subscribers: 0,
        activeSubscribers: 0,
        pageViews: 0,
        ctaClicks: 0,
        blockedSubscribes: 0,
        drafts: 0,
        published: 0,
        sentEmails: 0,
        failedEmails: 0,
      },
      subscribers: [] as NewsletterSubscriber[],
      posts: [] as BriefingPost[],
      agentRuns: [] as NewsletterAgentRun[],
      emailLogs: [] as NewsletterEmailLog[],
      emailLogReady: false,
    };
  }

  const [
    subscribersCount,
    activeSubscribersCount,
    pageViewsCount,
    ctaClicksCount,
    blockedSubscribesCount,
    draftsCount,
    publishedCount,
    sentEmailsCount,
    failedEmailsCount,
    subscribersResult,
    postsResult,
    agentRunsResult,
    emailLogsResult,
  ] = await Promise.all([
    countRows('newsletter_subscribers'),
    countRows('newsletter_subscribers', { status: 'active' }),
    countRows('newsletter_events', { event_type: 'page_view' }),
    countRows('newsletter_events', { event_type: 'cta_click' }),
    countRows('newsletter_events', { event_type: 'subscribe_blocked' }),
    countRows('daily_digest_posts', { status: 'draft' }),
    countRows('daily_digest_posts', { status: 'published' }),
    countRows('newsletter_email_logs', { status: 'sent' }),
    countRows('newsletter_email_logs', { status: 'failed' }),
    supabase
      .from('newsletter_subscribers')
      .select('email,status,source,created_at,updated_at')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('daily_digest_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('agent_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30),
    supabase
      .from('newsletter_email_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100),
  ]);

  const emailLogReady = !emailLogsResult.error;

  return {
    metrics: {
      subscribers: subscribersCount,
      activeSubscribers: activeSubscribersCount,
      pageViews: pageViewsCount,
      ctaClicks: ctaClicksCount,
      blockedSubscribes: blockedSubscribesCount,
      drafts: draftsCount,
      published: publishedCount,
      sentEmails: sentEmailsCount,
      failedEmails: failedEmailsCount,
    },
    subscribers: ((subscribersResult.data ?? []) as SubscriberAdminRow[]).map(toSubscriber),
    posts: ((postsResult.data ?? []) as BriefingRow[]).map(toPost),
    agentRuns: ((agentRunsResult.data ?? []) as AgentRunRow[]).map(toAgentRun),
    emailLogs: emailLogReady ? ((emailLogsResult.data ?? []) as EmailLogRow[]).map(toEmailLog) : [],
    emailLogReady,
  };
}
