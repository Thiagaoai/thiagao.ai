// tests/writer.test.mts
import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import type { Candidate } from '../lib/briefing/ranking.ts';
import {
  buildWriterMessages,
  composeDraftInput,
  fallbackEdition,
  parseEditionDraft,
  validateEditionDraft,
  writeEdition,
  type EditionDraft,
} from '../lib/briefing/writer.ts';

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
  delete process.env.DEEPSEEK_API_KEY;
  delete process.env.NEWSLETTER_WRITER_API_KEY;
});

const pool: Candidate[] = [
  { title: 'OpenAI releases GPT-6 preview', url: 'https://openai.com/gpt6', publisher: 'OpenAI', category: 'AI', summary: 'Preview for developers.', provider: 'rss', reliability: 92, score: 95, publishedAt: '2026-10-05T10:00:00Z' },
  { title: 'Mistral opens Codestral 3 weights', url: 'https://mistral.ai/codestral3', publisher: 'Mistral AI', category: 'AI', summary: 'Open weights.', provider: 'rss', reliability: 88, score: 90 },
  { title: 'NVIDIA Rubin GPUs ship to clouds', url: 'https://nvidia.com/rubin', publisher: 'NVIDIA', category: 'Hardware', summary: 'Shipping now.', provider: 'rss', reliability: 86, score: 85 },
  { title: 'n8n adds agent nodes', url: 'https://n8n.io/agents', publisher: 'n8n', category: 'Automacao', summary: 'New nodes.', provider: 'rss', reliability: 82, score: 80 },
  { title: 'Cursor 3 lets agents run tests', url: 'https://theverge.com/cursor-3', publisher: 'The Verge AI', category: 'DevTools', summary: 'Try it today.', provider: 'rss', reliability: 80, score: 78 },
  { title: 'ChatGPT gets group chats', url: 'https://techcrunch.com/groups', publisher: 'TechCrunch AI', category: 'BigTech', summary: 'Groups.', provider: 'rss', reliability: 78, score: 70 },
  { title: 'Brazil publishes AI bill draft', url: 'https://canaltech.com.br/ia', publisher: 'Canaltech', category: 'BigTech', summary: 'Regulation.', provider: 'rss', reliability: 68, score: 66 },
  { title: 'OpenAI pricing update', url: 'https://openai.com/pricing', publisher: 'openai.com', category: 'BigTech', summary: 'Via Perplexity.', provider: 'perplexity', reliability: 74, score: 60 },
  { title: 'Sam Altman says OpenAI will fund hardware startups', url: 'https://wired.com/altman-fund', publisher: 'Wired AI', category: 'Startups', summary: 'Funding.', provider: 'rss', reliability: 78, score: 58 },
];

const input = { dateLabel: 'segunda-feira, 5 de outubro de 2026', dateKey: '2026-10-05', pool, recentTitles: ['Claude 5 launches'], recentTopics: ['OpenAI/ChatGPT (3 de 5 edições)'] };

// Typed, otherwise `kind: 'lead'` widens to string and `npx tsc --noEmit` rejects every validateEditionDraft call below.
const goodDraft: EditionDraft = {
  headline: 'GPT-6 chega em preview e a Mistral abre o Codestral 3',
  subject: 'GPT-6 em preview, Codestral 3 aberto e GPUs Rubin',
  intro: 'Dia de lançamentos. A OpenAI mostrou o GPT-6 e a Mistral abriu pesos de um modelo de código.',
  items: [
    { candidate: 1, kind: 'lead', title: 'GPT-6 em preview', summary: 'A OpenAI liberou um preview do GPT-6 para desenvolvedores testarem.', whyItMatters: 'Muda o teto do que dá para automatizar.' },
    { candidate: 2, kind: 'story', title: 'Codestral 3 com pesos abertos', summary: 'A Mistral liberou os pesos do Codestral 3 para qualquer um rodar.', whyItMatters: 'Modelo de código que você pode rodar na sua máquina.' },
    { candidate: 3, kind: 'story', title: 'GPUs Rubin nas nuvens', summary: 'A NVIDIA começou a entregar as GPUs Rubin para os grandes provedores.', whyItMatters: 'Custo de inferência deve cair nos próximos meses.' },
    { candidate: 4, kind: 'story', title: 'n8n ganha nós de agente', summary: 'Novos nós para montar agentes dentro do n8n sem escrever código.', whyItMatters: 'Automação com agente para quem não programa.' },
    { candidate: 5, kind: 'tool', title: 'Cursor 3 roda testes sozinho', summary: 'O Cursor 3 deixa o agente rodar a suíte de testes e corrigir o que quebrar.', whyItMatters: 'Vale testar hoje no seu repositório.' },
  ],
  takeaway: 'Escolha uma novidade e faça um teste pequeno hoje.',
  shareText: 'GPT-6 em preview e Codestral 3 aberto: o dia em IA no Thiagao Ai Daily.',
};

test('buildWriterMessages numbers candidates and lists what to avoid', () => {
  const messages = buildWriterMessages(input);
  assert.equal(messages[0].role, 'system');
  assert.match(messages[0].content, /JSON/);
  assert.match(messages[1].content, /\[1\] OpenAI/);
  assert.match(messages[1].content, /\[7\] Canaltech/);
  assert.match(messages[1].content, /Claude 5 launches/);
  assert.match(messages[1].content, /OpenAI\/ChatGPT \(3 de 5/);
});

test('parseEditionDraft accepts fenced json and rejects garbage', () => {
  assert.equal(parseEditionDraft('```json\n' + JSON.stringify(goodDraft) + '\n```').ok, true);
  assert.equal(parseEditionDraft('not json').ok, false);
  assert.equal(parseEditionDraft(JSON.stringify({ ...goodDraft, items: 'nope' })).ok, false);
});

test('validateEditionDraft enforces the editorial caps', () => {
  const ok = validateEditionDraft(goodDraft, pool);
  assert.equal(ok.ok, true);
  if (ok.ok) {
    assert.equal(ok.items[0].kind, 'lead');
    assert.equal(ok.items[0].source.url, 'https://openai.com/gpt6');
    assert.equal(ok.items[0].category, 'AI');
  }
  const tooFew = validateEditionDraft({ ...goodDraft, items: goodDraft.items.slice(0, 4) }, pool);
  assert.equal(tooFew.ok, false); // pool has 9 candidates, so 5 items are required
  assert.equal(validateEditionDraft({ ...goodDraft, items: goodDraft.items.slice(0, 4) }, pool.slice(0, 6)).ok, true);
  const dup = validateEditionDraft({ ...goodDraft, items: [goodDraft.items[0], { ...goodDraft.items[1], candidate: 1 }, ...goodDraft.items.slice(2)] }, pool);
  assert.equal(dup.ok, false);
  const outOfRange = validateEditionDraft({ ...goodDraft, items: [...goodDraft.items.slice(0, 4), { ...goodDraft.items[4], candidate: 99 }] }, pool);
  assert.equal(outOfRange.ok, false);
  const sameHost = validateEditionDraft({ ...goodDraft, items: [...goodDraft.items.slice(0, 4), { ...goodDraft.items[4], candidate: 8, kind: 'story' }] }, pool);
  assert.equal(sameHost.ok, false); // candidates 1 and 8 are both openai.com (8 is BigTech, so only the source rule trips)
  // candidates 1, 6 and 9 are all about OpenAI but come from three hosts and three categories: only the OpenAI cap trips
  const tooMuchOpenAi = validateEditionDraft({ ...goodDraft, items: [...goodDraft.items.slice(0, 3), { ...goodDraft.items[3], candidate: 6, kind: 'story' }, { ...goodDraft.items[4], candidate: 9, kind: 'story' }] }, pool);
  assert.equal(tooMuchOpenAi.ok, false);
  const notLeadFirst = validateEditionDraft({ ...goodDraft, items: [{ ...goodDraft.items[0], kind: 'story' }, ...goodDraft.items.slice(1)] }, pool);
  assert.equal(notLeadFirst.ok, false);
});

test('fallbackEdition respects caps and composeDraftInput builds the row', () => {
  const edition = fallbackEdition(input);
  assert.ok(edition.items.length >= 3 && edition.items.length <= 7);
  assert.equal(edition.items[0].kind, 'lead');
  assert.equal(new Set(edition.items.map((item) => new URL(item.source.url).hostname)).size, edition.items.length);
  const draft = composeDraftInput(edition, input, 'fallback');
  assert.equal(draft.slug, 'daily-2026-10-05');
  assert.equal(draft.items.length, edition.items.length);
  assert.ok(draft.tags.includes('Daily'));
  assert.ok(draft.brief.includes(edition.items[0].title));
  assert.ok(draft.readingMinutes >= 2);
});

test('writeEdition returns llm mode on a valid answer and falls back after two bad ones', async () => {
  process.env.DEEPSEEK_API_KEY = 'test';
  let calls = 0;
  globalThis.fetch = (async () => {
    calls += 1;
    return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(goodDraft) } }] }), { status: 200 });
  }) as typeof fetch;
  const result = await writeEdition(input);
  assert.equal(result.mode, 'llm');
  assert.equal(calls, 1);

  calls = 0;
  globalThis.fetch = (async () => {
    calls += 1;
    return new Response(JSON.stringify({ choices: [{ message: { content: '{"headline":"x"}' } }] }), { status: 200 });
  }) as typeof fetch;
  const fallback = await writeEdition(input);
  assert.equal(fallback.mode, 'fallback');
  assert.equal(calls, 2);
});

test('writeEdition falls back without a key and does not call fetch', async () => {
  globalThis.fetch = (async () => {
    throw new Error('should not be called');
  }) as typeof fetch;
  const result = await writeEdition(input);
  assert.equal(result.mode, 'fallback');
  assert.ok(result.notes.some((note) => /key/i.test(note)));
});
