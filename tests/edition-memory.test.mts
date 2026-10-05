import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildRecentMemory } from '../lib/briefing/memory.ts';
import type { BriefingPost } from '../lib/briefing/types.ts';

function post(slug: string, title: string, items: { title: string; url: string }[]): BriefingPost {
  return {
    id: slug, slug, status: 'published', title, dek: '', brief: '', takeaway: '', category: 'AI', tags: [],
    sources: items.map((item) => ({ title: item.title, url: item.url, publisher: 'x' })),
    relevanceScore: 0, readingMinutes: 2, publishedAt: '2026-10-01T00:00:00Z', createdAt: '2026-10-01T00:00:00Z',
    items: items.map((item) => ({ kind: 'story', title: item.title, summary: '', whyItMatters: '', category: 'AI', source: { title: item.title, url: item.url, publisher: 'x' } })),
    subject: null, shareText: null,
  };
}

test('buildRecentMemory collects urls, titles and per-edition topic counts', () => {
  const memory = buildRecentMemory([
    post('a', 'OpenAI day', [{ title: 'OpenAI ships GPT-6', url: 'https://www.openai.com/gpt6?utm_source=x' }]),
    post('b', 'Quiet day', [{ title: 'OpenAI pricing drops', url: 'https://openai.com/pricing' }, { title: 'NVIDIA GPU news', url: 'https://nvidia.com/a' }]),
  ]);
  assert.ok(memory.urls.has('https://openai.com/gpt6'));
  assert.ok(memory.titles.includes('OpenAI ships GPT-6'));
  assert.equal(memory.topicCounts.get('openai'), 2);
  assert.equal(memory.topicCounts.get('nvidia'), 1);
  assert.ok(memory.recentTopics[0].startsWith('OpenAI/ChatGPT (2 de 2'));
  assert.deepEqual(memory.recentTitles, ['OpenAI ships GPT-6', 'OpenAI pricing drops', 'NVIDIA GPU news']);
});
