import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderEditionEmail, renderEditionText } from '../lib/briefing/email-template.ts';
import type { BriefingPost } from '../lib/briefing/types.ts';

const post: BriefingPost = {
  id: '1', slug: 'daily-2026-10-05', status: 'published', title: 'GPT-6 em preview e Codestral aberto', dek: 'Dia de lançamentos.',
  brief: 'texto legado', takeaway: 'Teste uma coisa hoje.', category: 'AI', tags: ['AI', 'Daily'], sources: [], relevanceScore: 90, readingMinutes: 4,
  publishedAt: '2026-10-05T21:00:00Z', createdAt: '2026-10-05T21:00:00Z', subject: 'GPT-6 em preview', shareText: 'O dia em IA <hoje>',
  items: [
    { kind: 'lead', title: 'GPT-6 em preview', summary: 'A OpenAI liberou.', whyItMatters: 'Muda o teto.', category: 'AI', source: { title: 'Introducing GPT-6', url: 'https://openai.com/gpt6', publisher: 'OpenAI' } },
    { kind: 'tool', title: 'Cursor 3', summary: 'Roda testes.', whyItMatters: 'Teste hoje & veja.', category: 'DevTools', source: { title: 'Cursor 3', url: 'https://cursor.com/3', publisher: 'The Verge AI' } },
  ],
};

test('html email renders items, links, share row and unsubscribe', () => {
  const html = renderEditionEmail(post, { unsubscribeUrl: 'https://www.thiagao.io/newsletter/sair?email=a&token=b' });
  assert.match(html, /GPT-6 em preview/);
  assert.match(html, /Para testar hoje/);
  assert.match(html, /https:\/\/openai\.com\/gpt6/);
  assert.match(html, /utm_source=newsletter/);
  assert.match(html, /newsletter\/sair\?email=a&amp;token=b/);
  assert.match(html, /wa\.me/);
  assert.match(html, /Teste hoje &amp; veja/);
  assert.doesNotMatch(html, /O dia em IA <hoje>/);
});

test('text email lists items and posts without items fall back to brief', () => {
  const text = renderEditionText(post, { unsubscribeUrl: null });
  assert.match(text, /1\. GPT-6 em preview/);
  assert.match(text, /SAIR/);
  const legacy = renderEditionText({ ...post, items: [] }, { unsubscribeUrl: null });
  assert.match(legacy, /texto legado/);
  assert.match(renderEditionEmail({ ...post, items: [] }, { unsubscribeUrl: null }), /texto legado/);
});
