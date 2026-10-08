import assert from 'node:assert/strict';
import { test } from 'node:test';
import { dedupeCandidates, emptyMemory, isRepeat, normalizeUrl, titleSimilarity, titleTokens } from '../lib/briefing/dedupe.ts';

test('normalizeUrl strips tracking, www, hash and trailing slash', () => {
  assert.equal(normalizeUrl('http://www.Example.com/post/?utm_source=x&ref=y#top'), 'https://example.com/post');
  assert.equal(normalizeUrl('https://example.com/?b=2&a=1'), 'https://example.com/?a=1&b=2');
  assert.equal(normalizeUrl('https://example.com/a?b=2&a=1'), 'https://example.com/a?a=1&b=2');
  assert.equal(normalizeUrl('not a url'), 'not a url');
});

test('titleTokens drops stopwords and accents', () => {
  assert.deepEqual([...titleTokens('A OpenAI lança o novo modelo para agentes')].sort(), ['agentes', 'lanca', 'modelo', 'openai']);
});

test('titleSimilarity is an overlap coefficient with a minimum size', () => {
  assert.ok(titleSimilarity('OpenAI launches Sora 3 video model', 'Sora 3 is here: the new OpenAI video model') >= 0.6);
  assert.equal(titleSimilarity('GPT update', 'GPT update codex'), 0);
  assert.equal(titleSimilarity('GPT update', 'GPT update'), 1);
});

test('isRepeat matches by normalized url or similar title', () => {
  const memory = emptyMemory();
  memory.urls.add(normalizeUrl('https://openai.com/index/sora-3/'));
  memory.titles.push('OpenAI launches Sora 3 video model');
  assert.equal(isRepeat({ url: 'https://www.openai.com/index/sora-3?utm_source=rss', title: 'x' }, memory), true);
  assert.equal(isRepeat({ url: 'https://other.com/a', title: 'Sora 3 video model launched by OpenAI' }, memory), true);
  assert.equal(isRepeat({ url: 'https://other.com/b', title: 'Mistral releases Codestral 3' }, memory), false);
});

test('dedupeCandidates keeps the most reliable duplicate', () => {
  const kept = dedupeCandidates([
    { url: 'https://a.com/x', title: 'Anthropic ships Claude 5 for agents', reliability: 70 },
    { url: 'https://www.a.com/x/', title: 'Anthropic ships Claude 5 for agents', reliability: 90 },
    { url: 'https://b.com/y', title: 'Claude 5 ships for agents, says Anthropic', reliability: 80 },
    { url: 'https://c.com/z', title: 'NVIDIA opens new GPU cloud', reliability: 60 },
  ]);
  assert.deepEqual(kept.map((item) => item.reliability), [90, 60]);
});
