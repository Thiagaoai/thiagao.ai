import type { BriefingStatus } from './types';

export type DailyEdition = { slug: string; status: BriefingStatus };

export type DailyAction =
  | { kind: 'create'; slug: string }
  | { kind: 'publish-and-send'; slug: string }
  | { kind: 'resend'; slug: string }
  | { kind: 'skip'; slug: string; reason: string };

// What the daily run should do, given every edition already created for the New York day
// (newest first) and which of their slugs already have a sent email. The campaign key of an
// edition is always its slug, so a forced edition and the regular one never share a key.
export function decideDailyAction({
  dateKey,
  editions,
  sentSlugs,
  force,
  hhmm,
}: {
  dateKey: string;
  editions: DailyEdition[];
  sentSlugs: Set<string>;
  force: boolean;
  hhmm: string;
}): DailyAction {
  if (force) return { kind: 'create', slug: `daily-${dateKey}-${hhmm}` };
  if (editions.length === 0) return { kind: 'create', slug: `daily-${dateKey}` };

  const unsent = editions.find((edition) => edition.status === 'published' && !sentSlugs.has(edition.slug));
  if (unsent) return { kind: 'resend', slug: unsent.slug };

  const stranded = editions.find((edition) => edition.status === 'draft');
  if (stranded) return { kind: 'publish-and-send', slug: stranded.slug };

  const handled = editions[0];
  return {
    kind: 'skip',
    slug: handled.slug,
    reason: `Edition ${handled.slug} was already ${handled.status === 'archived' ? 'archived' : 'sent'}.`,
  };
}
