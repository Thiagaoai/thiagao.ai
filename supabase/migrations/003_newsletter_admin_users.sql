create table if not exists public.newsletter_admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  password_hash text not null,
  role text not null default 'admin' check (role in ('owner', 'admin')),
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists newsletter_admin_users_active_idx
  on public.newsletter_admin_users (is_active, created_at desc);
