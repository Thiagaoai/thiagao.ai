import assert from 'node:assert/strict';
import { test } from 'node:test';
import { emptyMemory, normalizeUrl } from '../lib/briefing/dedupe.ts';
import { ageHours, scoreCandidate, selectPool, sourceKey, type Candidate } from '../lib/briefing/ranking.ts';

const now = new Date('2026-10-05T21:00:00Z');
const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 3_600_000).toISOString();

function candidate(overrides: Partial<Candidate> & { title: string; host?: string }): Candidate {
  const { host = 'example.com', ...rest } = overrides;
  return {
    url: `https://${host}/${overrides.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    publisher: 'Example',
    publishedAt: hoursAgo(5),
    category: 'AI',
    summary: '',
    provider: 'rss',
    reliability: 80,
    score: 0,
    ...rest,
  };
}

test('ageHours handles missing and invalid dates', () => {
  assert.equal(ageHours(candidate({ title: 'a', publishedAt: undefined }), now), 72);
  assert.equal(ageHours(candidate({ title: 'a', publishedAt: undefined, provider: 'perplexity' }), now), 36);
  assert.equal(ageHours(candidate({ title: 'a', publishedAt: 'nonsense' }), now), 168);
  assert.equal(ageHours(candidate({ title: 'a', publishedAt: hoursAgo(10) }), now), 10);
});

test('sourceKey is the hostname without www', () => {
  assert.equal(sourceKey(candidate({ title: 'a', host: 'www.OpenAI.com' })), 'openai.com');
  assert.equal(sourceKey({ ...candidate({ title: 'a' }), url: 'garbage' }), 'garbage');
});

test('scoreCandidate rewards fresh signal and penalizes repeated topics and noise', () => {
  const memory = emptyMemory();
  const fresh = scoreCandidate(candidate({ title: 'Mistral releases open source model' }), memory, now);
  const stale = scoreCandidate(candidate({ title: 'Mistral releases open source model', publishedAt: hoursAgo(120) }), memory, now);
  assert.ok(fresh > stale);
  memory.topicCounts.set('openai', 3);
  const tired = scoreCandidate(candidate({ title: 'OpenAI releases new model' }), memory, now);
  const other = scoreCandidate(candidate({ title: 'Mistral releases new model' }), memory, now);
  assert.ok(tired <= other - 40, `${tired} vs ${other}`);
  assert.ok(scoreCandidate(candidate({ title: 'ChatGPT is down: outage hits users' }), memory, now) < tired);
});

test('selectPool widens the window only when the deduped 48h pool is small', () => {
  const memory = emptyMemory();
  const recentTitles = [
    'Mistral opens Codestral weights for coding agents',
    'NVIDIA ships Rubin GPUs to cloud providers',
    'Hugging Face adds inference endpoints for robotics',
    'DeepSeek publishes V4 technical report',
    'Google DeepMind demos Gemini for science labs',
    'Apple research explains on-device speech models',
    'Brazil regulator drafts rules for automated hiring',
    'Supabase launches vector search tier',
    'Latent Space interviews the Cursor team',
  ];
  // Titles must share fewer than 60% of their tokens, otherwise dedupeCandidates collapses them.
  const recent = recentTitles.map((title, index) => candidate({ title, host: `lab${index}.com`, publishedAt: hoursAgo(index + 1) }));
  const old = candidate({ title: 'Old research result on protein folding', host: 'old.com', publishedAt: hoursAgo(100) });
  const wide = selectPool([...recent.slice(0, 3), old], memory, now);
  assert.equal(wide.window, '7d');
  assert.ok(wide.pool.some((item) => item.title === old.title));
  const tight = selectPool([...recent, old], memory, now);
  assert.equal(tight.window, '48h');
  assert.ok(!tight.pool.some((item) => item.title === old.title));
  // Nine near-identical titles collapse to one in dedupe, so the window must widen even though 9 > minPool.
  const clones = Array.from({ length: 9 }, (_, index) => candidate({ title: 'Same story about agents everywhere', host: `clone${index}.com` }));
  assert.equal(selectPool([...clones, old], memory, now).window, '7d');
});

test('selectPool applies relevance gate, repeats, source and openai caps', () => {
  const memory = emptyMemory();
  memory.urls.add(normalizeUrl('https://example.com/seen'));
  const openai = ['OpenAI releases GPT-6 preview', 'ChatGPT adds group chats for teams', 'Sam Altman outlines OpenAI compute plans', 'Codex agent now runs tests in the cloud'];
  const hackerNews = ['Show HN: local photo tagger with a small vision model', 'Ask HN: best open models for coding?', 'Why I stopped paying for AI assistants'];
  const cloudflare = ['Cloudflare launches AI gateway caching', 'Workers AI adds Mistral models', 'How we built an agent sandbox at Cloudflare'];
  const items = [
    candidate({ title: 'Novo iPhone chega às lojas', publisher: 'Tecnoblog', general: true }),
    candidate({ title: 'Already covered story about agents', url: 'https://www.example.com/seen/' }),
    ...openai.map((title, index) => candidate({ title, host: `outlet${index}.com` })),
    ...hackerNews.map((title, index) => candidate({ title, publisher: 'Hacker News AI', host: `hn${index}.com` })),
    ...cloudflare.map((title) => candidate({ title, publisher: 'Cloudflare', host: 'blog.cloudflare.com' })),
  ];
  const { pool } = selectPool(items, memory, now, { minPool: 1 });
  assert.ok(!pool.some((item) => item.title.includes('iPhone')));
  assert.ok(!pool.some((item) => item.title.includes('Already covered')));
  assert.equal(pool.filter((item) => item.url.includes('outlet')).length, 3); // four OpenAI stories, cap 3
  assert.equal(pool.filter((item) => item.publisher === 'Hacker News AI').length, 1);
  assert.equal(pool.filter((item) => item.publisher === 'Cloudflare').length, 2);
});
