create table if not exists public.newsletter_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (
    event_type in (
      'page_view',
      'cta_click',
      'subscribe_success',
      'subscribe_blocked',
      'chat_question',
      'admin_login'
    )
  ),
  path text,
  source text,
  email text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists newsletter_events_type_created_at_idx
  on public.newsletter_events (event_type, created_at desc);

create index if not exists newsletter_events_created_at_idx
  on public.newsletter_events (created_at desc);

alter table public.newsletter_events enable row level security;
