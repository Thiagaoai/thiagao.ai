import { fallbackBriefings } from './fallback';
import { getSupabaseAdmin } from './supabase';
import type { AgentRunRecord, BriefingDraftInput, BriefingPost, SubscriberInput } from './types';

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
