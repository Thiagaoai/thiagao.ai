import assert from 'node:assert/strict';
import { test } from 'node:test';
import { decideDailyAction } from '../lib/briefing/daily-action.ts';

const dateKey = '2026-10-05';
const published = (slug: string) => ({ slug, status: 'published' as const });
const draft = (slug: string) => ({ slug, status: 'draft' as const });

test('creates the daily edition when nothing exists', () => {
  assert.deepEqual(decideDailyAction({ dateKey, editions: [], sentSlugs: new Set(), force: false, hhmm: '1700' }), { kind: 'create', slug: 'daily-2026-10-05' });
});

test('force always creates a suffixed edition', () => {
  const action = decideDailyAction({ dateKey, editions: [published('daily-2026-10-05')], sentSlugs: new Set(['daily-2026-10-05']), force: true, hhmm: '1830' });
  assert.deepEqual(action, { kind: 'create', slug: 'daily-2026-10-05-1830' });
});

test('skips when every published edition of the day was sent', () => {
  const action = decideDailyAction({ dateKey, editions: [published('daily-2026-10-05-1830'), published('daily-2026-10-05')], sentSlugs: new Set(['daily-2026-10-05', 'daily-2026-10-05-1830']), force: false, hhmm: '2200' });
  assert.equal(action.kind, 'skip');
});

test('resends the newest published edition that was never sent', () => {
  const action = decideDailyAction({ dateKey, editions: [published('daily-2026-10-05-1830'), published('daily-2026-10-05')], sentSlugs: new Set(['daily-2026-10-05']), force: false, hhmm: '2200' });
  assert.deepEqual(action, { kind: 'resend', slug: 'daily-2026-10-05-1830' });
});

test('publishes and sends a stranded draft instead of writing a second edition', () => {
  const action = decideDailyAction({ dateKey, editions: [draft('daily-2026-10-05')], sentSlugs: new Set(), force: false, hhmm: '2200' });
  assert.deepEqual(action, { kind: 'publish-and-send', slug: 'daily-2026-10-05' });
});

test('archived editions count as handled', () => {
  const action = decideDailyAction({ dateKey, editions: [{ slug: 'daily-2026-10-05', status: 'archived' }], sentSlugs: new Set(), force: false, hhmm: '2200' });
  assert.equal(action.kind, 'skip');
});
