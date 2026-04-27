create table if not exists public.newsletter_email_logs (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.daily_digest_posts(id) on delete set null,
  email text not null,
  subject text not null,
  status text not null check (status in ('sent', 'failed', 'skipped')),
  provider text not null default 'resend',
  provider_id text,
  campaign text,
  error text,
  created_at timestamptz not null default now()
);

create index if not exists newsletter_email_logs_created_at_idx
  on public.newsletter_email_logs (created_at desc);

create index if not exists newsletter_email_logs_status_created_at_idx
  on public.newsletter_email_logs (status, created_at desc);

create index if not exists newsletter_email_logs_email_idx
  on public.newsletter_email_logs (email);

alter table public.newsletter_email_logs enable row level security;
