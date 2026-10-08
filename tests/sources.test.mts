import assert from 'node:assert/strict';
import { test } from 'node:test';
import { feedSources, guessCategory, isLowSignal, looksLikeAi, matchTopics } from '../lib/briefing/sources.ts';

test('feed catalog has no duplicate urls and sane reliability', () => {
  const urls = feedSources.map((source) => source.url);
  assert.equal(new Set(urls).size, urls.length);
  for (const source of feedSources) assert.ok(source.reliability > 0 && source.reliability < 100, source.name);
});

test('matchTopics uses whole words', () => {
  assert.deepEqual(matchTopics('OpenAI ships Codex update').map((t) => t.name), ['openai']);
  assert.deepEqual(matchTopics('A metal company raises money').map((t) => t.name), []);
  assert.ok(matchTopics('Claude agents now read MCP servers').map((t) => t.name).includes('agents'));
});

test('looksLikeAi gates general feeds and isLowSignal catches noise', () => {
  assert.equal(looksLikeAi('Novo iPhone chega às lojas'), false);
  assert.equal(looksLikeAi('Google lança modelo Gemini para agentes'), true);
  assert.equal(looksLikeAi('Mais vendas no varejo'), false); // "ai" inside "mais" must not match
  assert.equal(looksLikeAi('Ele ia para casa quando choveu'), false); // the verb "ia" is not the acronym "IA"
  assert.equal(looksLikeAi('Nova lei de IA no Brasil'), true);
  assert.equal(isLowSignal('OpenAI status: ChatGPT is down for some users'), true);
  assert.equal(isLowSignal('OpenAI releases new reasoning model'), false);
});

test('guessCategory maps keywords', () => {
  assert.equal(guessCategory('NVIDIA GPU inference chips'), 'Hardware');
  assert.equal(guessCategory('startup raises $40M series B'), 'Startups');
  assert.equal(guessCategory('plain news'), 'AI');
});
