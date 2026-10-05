import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderBriefingWhatsApp } from '../lib/briefing/whatsapp.ts';
import type { BriefingPost } from '../lib/briefing/types.ts';

const post: BriefingPost = {
  id: '1', slug: 'daily-2026-10-05', status: 'published', title: 'GPT-6 em preview e Codestral aberto', dek: 'Dia de lançamentos.',
  brief: 'texto legado', takeaway: 'Teste uma coisa hoje.', category: 'AI', tags: ['AI', 'Daily'], sources: [], relevanceScore: 90, readingMinutes: 4,
  publishedAt: '2026-10-05T21:00:00Z', createdAt: '2026-10-05T21:00:00Z', subject: 'GPT-6 em preview', shareText: 'O dia em IA hoje',
  items: [
    { kind: 'lead', title: 'GPT-6 em preview', summary: 'A OpenAI liberou.', whyItMatters: 'Muda o teto.', category: 'AI', source: { title: 'Introducing GPT-6', url: 'https://openai.com/gpt6', publisher: 'OpenAI' } },
    { kind: 'tool', title: 'Cursor 3', summary: 'Roda testes.', whyItMatters: 'Teste hoje.', category: 'DevTools', source: { title: 'Cursor 3', url: 'https://cursor.com/3', publisher: 'The Verge AI' } },
  ],
};

test('whatsapp text lists items with the edition link', () => {
  const text = renderBriefingWhatsApp(post);
  assert.match(text, /\*Thiagao Ai Daily\*/);
  assert.match(text, /1\. \*GPT-6 em preview\*/);
  assert.match(text, /\/newsletter\/daily-2026-10-05/);
});
