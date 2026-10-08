alter table public.daily_digest_posts
  add column if not exists items jsonb not null default '[]'::jsonb,
  add column if not exists subject text,
  add column if not exists share_text text;

alter table public.newsletter_events drop constraint if exists newsletter_events_event_type_check;
alter table public.newsletter_events
  add constraint newsletter_events_event_type_check check (
    event_type in (
      'page_view',
      'cta_click',
      'subscribe_success',
      'subscribe_blocked',
      'chat_question',
      'admin_login',
      'unsubscribe'
    )
  );
