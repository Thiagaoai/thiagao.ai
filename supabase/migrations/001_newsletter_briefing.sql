create extension if not exists pgcrypto;

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'active' check (status in ('active', 'unsubscribed', 'bounced')),
  source text not null default 'briefing',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_digest_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  title text not null,
  dek text not null,
  brief text not null,
  takeaway text not null,
  category text not null,
  tags text[] not null default '{}',
  sources jsonb not null default '[]'::jsonb,
  relevance_score integer not null default 0 check (relevance_score >= 0 and relevance_score <= 100),
  reading_minutes integer not null default 3 check (reading_minutes > 0),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null unique,
  category text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  status text not null check (status in ('success', 'error')),
  started_at timestamptz not null,
  finished_at timestamptz not null,
  source_count integer not null default 0,
  draft_count integer not null default 0,
  notes text[] not null default '{}',
  error text,
  created_at timestamptz not null default now()
);

create index if not exists daily_digest_posts_status_published_at_idx
  on public.daily_digest_posts (status, published_at desc);

create index if not exists daily_digest_posts_tags_idx
  on public.daily_digest_posts using gin (tags);

alter table public.newsletter_subscribers enable row level security;
alter table public.daily_digest_posts enable row level security;
alter table public.content_sources enable row level security;
alter table public.agent_runs enable row level security;

drop policy if exists "Published posts are readable" on public.daily_digest_posts;
create policy "Published posts are readable"
  on public.daily_digest_posts
  for select
  using (status = 'published');

insert into public.content_sources (name, url, category) values
  ('OpenAI', 'https://openai.com/news/rss.xml', 'AI'),
  ('Google AI', 'https://blog.google/technology/ai/rss/', 'BigTech'),
  ('Anthropic', 'https://www.anthropic.com/news/rss.xml', 'AI'),
  ('LangChain', 'https://blog.langchain.com/rss/', 'Agents'),
  ('n8n', 'https://blog.n8n.io/rss/', 'Automacao'),
  ('NVIDIA', 'https://blogs.nvidia.com/feed/', 'Hardware'),
  ('Cloudflare', 'https://blog.cloudflare.com/rss/', 'Infra'),
  ('Hacker News AI', 'https://hnrss.org/newest?q=AI', 'DevTools')
on conflict (url) do nothing;
