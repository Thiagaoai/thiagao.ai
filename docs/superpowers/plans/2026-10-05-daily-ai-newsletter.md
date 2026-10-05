# Thiagao Ai Daily Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing daily briefing pipeline into a real daily AI-news edition (5–7 stories in pt-BR, written by an LLM from verified sources, no repeats, diversified), with a proper email, an edition page, one-click unsubscribe, and a cron that stays alive.

**Architecture:** Keep the LangGraph agent and the Supabase/Resend plumbing. Replace the template "synthesize" step with pure modules (`sources`, `dedupe`, `ranking`, `memory`, `writer`) plus an LLM call to an OpenAI-compatible endpoint (DeepSeek by default) whose output is validated with zod and falls back to a structured template. Editions get a structured `items` column, a page at `/newsletter/[slug]`, and a new email template.

**Tech Stack:** Next.js 16 (App Router, route handlers, `proxy.ts`), React 19, TypeScript, Tailwind 4, zod 4, `@langchain/langgraph`, `resend`, `@supabase/supabase-js`, `node:test` with `--experimental-strip-types`.

**Spec:** `docs/superpowers/specs/2026-10-05-daily-ai-newsletter-design.md`

**Conventions that matter here**

- Tests run with `npm test` (`node --experimental-strip-types --no-warnings --test "tests/**/*.test.mts"`). Node ESM resolves neither extensionless relative imports nor the `@/` alias, so every module a test loads (directly or transitively) must use **relative imports with the `.ts` extension** for values (`import { x } from './dedupe.ts'`) and must not import `./posts.ts`, `./supabase.ts` or `@/…` as values. `import type … from '@/…'` is fine (erased). `tsconfig.json` has `allowImportingTsExtensions: true`, so Next accepts the same imports. Existing example: `lib/typesafe/decision-mediation.ts`.
- Modules under test in this plan: `lib/briefing/{config,sources,dedupe,ranking,memory,writer,unsubscribe,edition,email-template,whatsapp}.ts`. `config.ts` has no imports; `email-template.ts` and `whatsapp.ts` currently import `./config` without extension — fix that when you touch them.
- Tests that fake the network set `globalThis.fetch` and restore it in `afterEach` (see `tests/jev.test.mts`).
- Portuguese user-facing strings use accents (newer files do; follow them).
- Brand name is `Thiagao Ai` (see `app/components/BrandMark.tsx`); the product name for the edition is `Thiagao Ai Daily`.
- Commit after each task. Never commit secrets. Do not touch `app/components/home/HomePage.tsx` beyond the single link change in Task 12 (another session edits that file).
- Run `npm run lint && npx tsc --noEmit -p tsconfig.json` before each commit of `app/` or `lib/` changes. Do not run `next build` while `next dev` is running (both use `.next`).
- Check the Next 16 docs in `node_modules/next/dist/docs/01-app/` before writing a page or route handler (`01-getting-started/03-layouts-and-pages.md`, `15-route-handlers.md`, `14-metadata-and-og-images.md`): `params`/`searchParams` are Promises.

---

## Chunk 1: Data model and pure modules

### Task 1: Types, migration, local demo DB, row mapping

**Files:**
- Modify: `lib/briefing/types.ts`
- Create: `supabase/migrations/009_daily_edition_items.sql`
- Modify: `lib/dev/local-db.ts:27-33` (`defaults`)
- Modify: `lib/briefing/posts.ts:14-30` (`BriefingRow`), `:65-96` (`toPost`, `toRow`)
- Modify: `lib/briefing/fallback.ts` (three posts), `app/api/admin/test-newsletter/route.ts:17-52` (test post)

- [ ] **Step 1: Extend the types**

In `lib/briefing/types.ts`, after `BriefingSource` add:

```ts
export type EditionItemKind = 'lead' | 'story' | 'tool';

export type EditionItem = {
  kind: EditionItemKind;
  title: string;
  summary: string;
  whyItMatters: string;
  category: BriefingTag;
  source: BriefingSource;
};
```

Add to `BriefingPost` (after `sources`):

```ts
  items: EditionItem[];
  subject: string | null;
  shareText: string | null;
```

Add `'unsubscribe'` to the `NewsletterEventInput['eventType']` union.

- [ ] **Step 2: Migration**

Create `supabase/migrations/009_daily_edition_items.sql`:

```sql
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
```

- [ ] **Step 3: Local demo DB defaults**

In `lib/dev/local-db.ts` `defaults()`, add before the final `return base;`:

```ts
  if (table === 'daily_digest_posts') return { ...base, status: 'draft', items: [], subject: null, share_text: null, published_at: null, updated_at: now };
```

- [ ] **Step 4: Row mapping**

In `lib/briefing/posts.ts`: add `items: EditionItem[] | null; subject: string | null; share_text: string | null;` to `BriefingRow`; in `toPost` add `items: row.items ?? [], subject: row.subject ?? null, shareText: row.share_text ?? null`; in `toRow` add `items: post.items, subject: post.subject, share_text: post.shareText`. Import the `EditionItem` type.

- [ ] **Step 5: Fix literal posts**

Add `items: [], subject: null, shareText: null,` to each post in `lib/briefing/fallback.ts` and to `getGpt55TestPost()` in `app/api/admin/test-newsletter/route.ts`.

- [ ] **Step 6: Type-check and test**

Run: `npx tsc --noEmit -p tsconfig.json && npm test`
Expected: no type errors; 36 tests pass.

- [ ] **Step 7: Commit**

```bash
git add lib/briefing/types.ts supabase/migrations/009_daily_edition_items.sql lib/dev/local-db.ts lib/briefing/posts.ts lib/briefing/fallback.ts app/api/admin/test-newsletter/route.ts
git commit -m "Add structured edition items to daily digest posts"
```

### Task 2: Source catalog and topic rules

**Files:**
- Create: `lib/briefing/sources.ts`
- Test: `tests/sources.test.mts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/sources.test.mts
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
  assert.equal(isLowSignal('OpenAI status: ChatGPT is down for some users'), true);
  assert.equal(isLowSignal('OpenAI releases new reasoning model'), false);
});

test('guessCategory maps keywords', () => {
  assert.equal(guessCategory('NVIDIA GPU inference chips'), 'Hardware');
  assert.equal(guessCategory('startup raises $40M series B'), 'Startups');
  assert.equal(guessCategory('plain news'), 'AI');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --no-warnings --test tests/sources.test.mts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `lib/briefing/sources.ts`**

```ts
import type { BriefingTag } from './types';

export type FeedSource = {
  name: string;
  url: string;
  category: BriefingTag;
  reliability: number;
  // General tech feeds: only items that mention AI are kept (see looksLikeAi).
  general?: boolean;
};

// All feeds checked on 2026-10-05: HTTP 200 with items from the last days.
// Dead on that date and therefore removed: Anthropic, Meta AI, blogs.microsoft.com/ai,
// mistral.ai/news/rss.xml, blog.langchain.com, VentureBeat (429), xAI, Cursor.
export const feedSources: FeedSource[] = [
  { name: 'OpenAI', url: 'https://openai.com/news/rss.xml', category: 'AI', reliability: 92 },
  { name: 'Google AI', url: 'https://blog.google/technology/ai/rss/', category: 'BigTech', reliability: 90 },
  { name: 'Google DeepMind', url: 'https://deepmind.google/blog/rss.xml', category: 'AI', reliability: 90 },
  { name: 'Mistral AI', url: 'https://mistral.ai/rss.xml', category: 'AI', reliability: 88 },
  { name: 'Hugging Face', url: 'https://huggingface.co/blog/feed.xml', category: 'AI', reliability: 86 },
  { name: 'Microsoft AI', url: 'https://news.microsoft.com/source/topics/ai/feed/', category: 'BigTech', reliability: 86 },
  { name: 'Apple Machine Learning', url: 'https://machinelearning.apple.com/rss.xml', category: 'BigTech', reliability: 84 },
  { name: 'NVIDIA', url: 'https://blogs.nvidia.com/feed/', category: 'Hardware', reliability: 86 },
  { name: 'AWS Machine Learning', url: 'https://aws.amazon.com/blogs/machine-learning/feed/', category: 'Infra', reliability: 78 },
  { name: 'Simon Willison', url: 'https://simonwillison.net/atom/everything/', category: 'DevTools', reliability: 86 },
  { name: 'Interconnects', url: 'https://www.interconnects.ai/feed', category: 'AI', reliability: 82 },
  { name: 'Import AI', url: 'https://importai.substack.com/feed', category: 'AI', reliability: 82 },
  { name: 'Latent Space', url: 'https://www.latent.space/feed', category: 'Agents', reliability: 80 },
  { name: 'The Decoder', url: 'https://the-decoder.com/feed/', category: 'AI', reliability: 78 },
  { name: 'MIT Technology Review', url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed/', category: 'AI', reliability: 82 },
  { name: 'Ars Technica AI', url: 'https://arstechnica.com/ai/feed/', category: 'BigTech', reliability: 82 },
  { name: 'The Verge AI', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', category: 'BigTech', reliability: 80 },
  { name: 'Wired AI', url: 'https://www.wired.com/feed/tag/ai/latest/rss', category: 'Startups', reliability: 78 },
  { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', category: 'Startups', reliability: 78 },
  { name: 'GitHub Blog', url: 'https://github.blog/feed/', category: 'DevTools', reliability: 84, general: true },
  { name: 'Vercel', url: 'https://vercel.com/blog/rss.xml', category: 'DevTools', reliability: 80, general: true },
  { name: 'Cloudflare', url: 'https://blog.cloudflare.com/rss/', category: 'Infra', reliability: 84, general: true },
  { name: 'Supabase', url: 'https://supabase.com/blog/rss.xml', category: 'Infra', reliability: 78, general: true },
  { name: 'n8n', url: 'https://blog.n8n.io/rss/', category: 'Automacao', reliability: 82, general: true },
  { name: 'Product Hunt AI', url: 'https://www.producthunt.com/feed?category=artificial-intelligence', category: 'DevTools', reliability: 66 },
  { name: 'Tecnoblog', url: 'https://tecnoblog.net/feed/', category: 'BigTech', reliability: 72, general: true },
  { name: 'Canaltech', url: 'https://canaltech.com.br/rss/', category: 'BigTech', reliability: 68, general: true },
  { name: 'arXiv cs.AI', url: 'https://rss.arxiv.org/rss/cs.AI', category: 'AI', reliability: 58 },
  { name: 'Hacker News AI', url: 'https://hnrss.org/newest?q=AI', category: 'DevTools', reliability: 60 },
];

export type TopicRule = { name: string; label: string; pattern: RegExp };

export const topicRules: TopicRule[] = [
  { name: 'openai', label: 'OpenAI/ChatGPT', pattern: /\b(openai|chatgpt|gpt-?\d[\w.]*|codex|sora|sam altman)\b/i },
  { name: 'anthropic', label: 'Anthropic/Claude', pattern: /\b(anthropic|claude)\b/i },
  { name: 'google', label: 'Google/Gemini/DeepMind', pattern: /\b(google|gemini|deepmind|veo|nano banana)\b/i },
  { name: 'meta', label: 'Meta/Llama', pattern: /\b(meta ai|meta platforms|llama|zuckerberg)\b/i },
  { name: 'microsoft', label: 'Microsoft/Copilot', pattern: /\b(microsoft|copilot|azure)\b/i },
  { name: 'apple', label: 'Apple', pattern: /\b(apple|siri)\b/i },
  { name: 'nvidia', label: 'NVIDIA/GPU', pattern: /\b(nvidia|gpus?|blackwell|cuda|jensen huang)\b/i },
  { name: 'chinese-models', label: 'DeepSeek/Kimi/Qwen/MiniMax', pattern: /\b(deepseek|kimi|qwen|minimax|z\.ai|glm|moonshot|alibaba|baidu)\b/i },
  { name: 'xai', label: 'xAI/Grok', pattern: /\b(xai|grok)\b/i },
  { name: 'agents', label: 'Agentes', pattern: /\b(agents?|agentic|agentes?|mcp|openclaw|hermes)\b/i },
];

export function matchTopics(text: string) {
  return topicRules.filter((rule) => rule.pattern.test(text));
}

const AI_PATTERN =
  /\b(ai|ia|a\.i\.|intelig[eê]ncia artificial|artificial intelligence|llms?|gpt|chatgpt|openai|anthropic|claude|gemini|deepseek|qwen|kimi|mistral|llama|copilot|agents?|agentes?|agentic|machine learning|aprendizado de m[aá]quina|modelos? de linguagem|language models?|transformers?|diffusion|rag|mcp|codex|cursor|midjourney|sora|veo|nvidia|gpus?|inference|infer[eê]ncia|fine-?tun\w*|open[- ]weights?|rob[oô]s?|robots?|robotics|chatbots?|prompts?)\b/i;

export function looksLikeAi(text: string) {
  return AI_PATTERN.test(text);
}

const LOW_SIGNAL_PATTERN =
  /\b(outage|is down|are down|status page|not working|incident report|we'?re hiring|hiring|job opening|webinar|sponsored|giveaway|black friday|cupom|promo[cç][aã]o|desconto|\[fixed\]|live stream|livestream)\b/i;

export function isLowSignal(text: string) {
  return LOW_SIGNAL_PATTERN.test(text);
}

const CATEGORY_HINTS: [RegExp, BriefingTag][] = [
  [/\b(gpu|gpus|chip|chips|hardware|inference|data ?center|tpu|semicondutor\w*|semiconductor\w*)\b/i, 'Hardware'],
  [/\b(agents?|agentic|agentes?|mcp|autonomous|aut[oô]nom\w*)\b/i, 'Agents'],
  [/\b(startup|funding|raises|series [a-d]|valuation|acquisition|acquires|ipo|revenue|investid\w*|aporte|rodada)\b/i, 'Startups'],
  [/\b(developer\w*|devtools?|coding|code|ide|sdk|api|github|open[- ]source|programa\w*)\b/i, 'DevTools'],
  [/\b(cloud|infra\w*|kubernetes|serverless|database|postgres|cdn|edge)\b/i, 'Infra'],
  [/\b(automation|automa[cç][aã]o|workflow|n8n|zapier|make\.com|no-?code)\b/i, 'Automacao'],
  [/\b(google|meta|microsoft|apple|amazon|aws|nvidia|samsung)\b/i, 'BigTech'],
];

export function guessCategory(text: string): BriefingTag {
  for (const [pattern, category] of CATEGORY_HINTS) if (pattern.test(text)) return category;
  return 'AI';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --no-warnings --test tests/sources.test.mts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/briefing/sources.ts tests/sources.test.mts
git commit -m "Add verified feed catalog, topic rules and relevance gates"
```

### Task 3: Dedupe module

**Files:**
- Create: `lib/briefing/dedupe.ts`
- Test: `tests/dedupe.test.mts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/dedupe.test.mts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --no-warnings --test tests/dedupe.test.mts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `lib/briefing/dedupe.ts`**

```ts
// Pure helpers that keep the daily edition from repeating itself: URL normalization,
// title similarity and the memory of what recent editions already covered.

export type RecentMemory = {
  urls: Set<string>;
  titles: string[];
  // Topic name (see sources.topicRules) -> number of recent editions it appeared in.
  topicCounts: Map<string, number>;
};

export function emptyMemory(): RecentMemory {
  return { urls: new Set(), titles: [], topicCounts: new Map() };
}

const TRACKING_PARAM = /^(utm_|fbclid|gclid|mc_cid|mc_eid|igshid|ref$|ref_|source$)/i;

export function normalizeUrl(input: string) {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return input.trim();
  }
  for (const key of Array.from(url.searchParams.keys())) {
    if (TRACKING_PARAM.test(key)) url.searchParams.delete(key);
  }
  url.searchParams.sort();
  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  const pathname = url.pathname.replace(/\/+$/, '');
  const query = url.searchParams.toString();
  const base = `https://${host}${pathname}`;
  return query ? `${base}${pathname ? '' : '/'}?${query}` : base;
}

const STOPWORDS = new Set(
  'a o os as de do da dos das e em no na nos nas um uma uns umas para por com que se ao aos the an of to in on for and or with is are at by from its it this that new how why what vs your you we our mais novo nova novos novas como sobre agora ja já seu sua seus suas sem mas ate até here'.split(
    ' ',
  ),
);

export function titleTokens(title: string) {
  return new Set(
    title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .split(' ')
      .filter((token) => token.length >= 3 && !STOPWORDS.has(token)),
  );
}

// Overlap coefficient (|A ∩ B| / min(|A|, |B|)). Very short titles only count when identical.
export function titleSimilarity(a: string, b: string) {
  const left = titleTokens(a);
  const right = titleTokens(b);
  if (left.size === 0 || right.size === 0) return 0;
  let shared = 0;
  for (const token of left) if (right.has(token)) shared += 1;
  const smallest = Math.min(left.size, right.size);
  if (smallest < 3) return shared === left.size && shared === right.size ? 1 : 0;
  return shared / smallest;
}

export function isRepeat(candidate: { url: string; title: string }, memory: RecentMemory, threshold = 0.6) {
  if (memory.urls.has(normalizeUrl(candidate.url))) return true;
  return memory.titles.some((title) => titleSimilarity(title, candidate.title) >= threshold);
}

export function dedupeCandidates<T extends { url: string; title: string; reliability: number }>(items: T[], threshold = 0.6) {
  const kept: T[] = [];
  const seenUrls = new Set<string>();
  for (const item of [...items].sort((a, b) => b.reliability - a.reliability)) {
    const url = normalizeUrl(item.url);
    if (seenUrls.has(url)) continue;
    if (kept.some((other) => titleSimilarity(other.title, item.title) >= threshold)) continue;
    seenUrls.add(url);
    kept.push(item);
  }
  return kept;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --no-warnings --test tests/dedupe.test.mts`
Expected: PASS (5 tests). If the Sora similarity assertion fails, check that "here"/"new" are stopwords (they are in the list above).

- [ ] **Step 5: Commit**

```bash
git add lib/briefing/dedupe.ts tests/dedupe.test.mts
git commit -m "Add url and title dedupe helpers for the daily edition"
```

### Task 4: Ranking module

**Files:**
- Create: `lib/briefing/ranking.ts`
- Test: `tests/ranking.test.mts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/ranking.test.mts
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
  const recent = Array.from({ length: 9 }, (_, index) =>
    candidate({ title: `Fresh AI launch number ${index} by lab ${index}`, host: `lab${index}.com`, publishedAt: hoursAgo(index + 1) }),
  );
  const old = candidate({ title: 'Old AI research result', host: 'old.com', publishedAt: hoursAgo(100) });
  const wide = selectPool([...recent.slice(0, 3), old], memory, now);
  assert.equal(wide.window, '7d');
  assert.ok(wide.pool.some((item) => item.title === old.title));
  const tight = selectPool([...recent, old], memory, now);
  assert.equal(tight.window, '48h');
  assert.ok(!tight.pool.some((item) => item.title === old.title));
  // nine near-identical titles collapse to one, so the window must widen even though 9 > minPool
  const clones = Array.from({ length: 9 }, (_, index) => candidate({ title: 'Same story about agents everywhere', host: `clone${index}.com` }));
  assert.equal(selectPool([...clones, old], memory, now).window, '7d');
});

test('selectPool applies relevance gate, repeats, source and openai caps', () => {
  const memory = emptyMemory();
  memory.urls.add(normalizeUrl('https://example.com/seen'));
  const items = [
    candidate({ title: 'Novo iPhone chega às lojas', publisher: 'Tecnoblog', general: true }),
    candidate({ title: 'Already covered story about agents', url: 'https://www.example.com/seen/' }),
    ...Array.from({ length: 4 }, (_, index) => candidate({ title: `OpenAI news ${index} GPT`, host: `outlet${index}.com` })),
    ...Array.from({ length: 3 }, (_, index) => candidate({ title: `Hacker News thread ${index} on AI`, publisher: 'Hacker News AI', host: `hn${index}.com` })),
    ...Array.from({ length: 3 }, (_, index) => candidate({ title: `Cloudflare AI post ${index}`, publisher: 'Cloudflare', host: 'blog.cloudflare.com' })),
  ];
  const { pool } = selectPool(items, memory, now, { minPool: 1 });
  assert.ok(!pool.some((item) => item.title.includes('iPhone')));
  assert.ok(!pool.some((item) => item.title.includes('Already covered')));
  assert.equal(pool.filter((item) => item.title.startsWith('OpenAI news')).length, 3);
  assert.equal(pool.filter((item) => item.publisher === 'Hacker News AI').length, 1);
  assert.equal(pool.filter((item) => item.publisher === 'Cloudflare').length, 2);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --no-warnings --test tests/ranking.test.mts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `lib/briefing/ranking.ts`**

```ts
import { dedupeCandidates, isRepeat, type RecentMemory } from './dedupe.ts';
import { isLowSignal, looksLikeAi, matchTopics } from './sources.ts';
import type { BriefingSource, BriefingTag } from './types';

export type Candidate = BriefingSource & {
  category: BriefingTag;
  summary: string;
  provider: 'rss' | 'perplexity' | 'x';
  reliability: number;
  score: number;
  general?: boolean;
};

const HOUR = 3_600_000;

export function ageHours(candidate: Pick<Candidate, 'publishedAt' | 'provider'>, now: Date) {
  if (!candidate.publishedAt) return candidate.provider === 'perplexity' ? 36 : 72;
  const timestamp = Date.parse(candidate.publishedAt);
  if (Number.isNaN(timestamp)) return 168;
  return Math.max(0, (now.getTime() - timestamp) / HOUR);
}

// Hostname of the article: the key for "one item per source" rules, so the OpenAI feed and
// a Perplexity hit on openai.com count as the same source.
export function sourceKey(candidate: Pick<Candidate, 'url'>) {
  try {
    return new URL(candidate.url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return candidate.url.toLowerCase();
  }
}

const SIGNAL_PATTERN =
  /\b(launch\w*|releas\w*|announc\w*|introduc\w*|open[- ]sourc\w*|open[- ]weights?|models?|benchmark\w*|agents?|api|sdk|funding|acqui\w*|regulat\w*|lan[cç]a\w*|anuncia\w*|free|gratuito|pricing|pre[cç]o)\b/gi;

function textOf(candidate: Pick<Candidate, 'title' | 'summary'>) {
  return `${candidate.title} ${candidate.summary}`;
}

export function scoreCandidate(candidate: Candidate, memory: RecentMemory, now: Date) {
  const text = textOf(candidate);
  let score = candidate.reliability;
  score += Math.min(21, (text.match(SIGNAL_PATTERN) ?? []).length * 7);
  const age = ageHours(candidate, now);
  score += age <= 24 ? 20 : age <= 48 ? 14 : age <= 168 ? Math.max(0, 10 - Math.floor(age / 24)) : 0;
  for (const topic of matchTopics(text)) {
    const count = memory.topicCounts.get(topic.name) ?? 0;
    score -= count >= 4 ? 70 : count === 3 ? 50 : count === 2 ? 30 : count === 1 ? 12 : 0;
  }
  if (isLowSignal(text)) score -= 40;
  if (candidate.provider === 'x' || /hacker news|arxiv/i.test(candidate.publisher)) score -= 15;
  return Math.max(0, Math.min(99, Math.round(score)));
}

export type PoolResult = { pool: Candidate[]; window: '48h' | '7d'; notes: string[] };

function isSingleItemSource(candidate: Candidate) {
  return candidate.provider === 'x' || /hacker news/i.test(candidate.publisher);
}

export function selectPool(
  candidates: Candidate[],
  memory: RecentMemory,
  now: Date,
  { minPool = 8, maxPool = 24 }: { minPool?: number; maxPool?: number } = {},
): PoolResult {
  const relevant = candidates.filter((candidate) => !candidate.general || looksLikeAi(textOf(candidate)));

  const prepare = (maxAgeHours: number) => {
    const fresh = relevant.filter((candidate) => ageHours(candidate, now) <= maxAgeHours);
    const unique = dedupeCandidates(fresh);
    const novel = unique.filter((candidate) => !isRepeat(candidate, memory));
    return { fresh, unique, novel };
  };

  let window: PoolResult['window'] = '48h';
  let prepared = prepare(48);
  if (prepared.novel.length < minPool) {
    window = '7d';
    prepared = prepare(168);
  }

  const scored = prepared.novel
    .map((candidate) => ({ ...candidate, score: scoreCandidate(candidate, memory, now) }))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score);

  const pool: Candidate[] = [];
  const perSource = new Map<string, number>();
  let openai = 0;
  for (const candidate of scored) {
    const key = isSingleItemSource(candidate) ? `publisher:${candidate.publisher}` : sourceKey(candidate);
    const cap = isSingleItemSource(candidate) ? 1 : 2;
    if ((perSource.get(key) ?? 0) >= cap) continue;
    const aboutOpenAi = matchTopics(textOf(candidate)).some((topic) => topic.name === 'openai');
    if (aboutOpenAi && openai >= 3) continue;
    pool.push(candidate);
    perSource.set(key, (perSource.get(key) ?? 0) + 1);
    if (aboutOpenAi) openai += 1;
    if (pool.length >= maxPool) break;
  }

  return {
    pool,
    window,
    notes: [
      `Candidate window ${window}: ${candidates.length} collected, ${relevant.length} about AI, ${prepared.fresh.length} fresh, ${prepared.unique.length} unique, ${prepared.novel.length} not covered recently, pool ${pool.length}.`,
    ],
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --no-warnings --test tests/ranking.test.mts`
Expected: PASS (5 tests). If `tired <= other - 40` is off by a few points, adjust the penalty table in the code, not the test.

- [ ] **Step 5: Commit**

```bash
git add lib/briefing/ranking.ts tests/ranking.test.mts
git commit -m "Add freshness, diversity and repeat-aware candidate ranking"
```

### Task 5: Writer module (prompt, schema, validation, fallback, LLM call)

**Files:**
- Create: `lib/briefing/writer.ts`
- Test: `tests/writer.test.mts`

- [ ] **Step 1: Write the failing test**

```ts
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
  { title: 'OpenAI pricing update', url: 'https://openai.com/pricing', publisher: 'openai.com', category: 'AI', summary: 'Via Perplexity.', provider: 'perplexity', reliability: 74, score: 60 },
];

const input = { dateLabel: 'segunda-feira, 5 de outubro de 2026', dateKey: '2026-10-05', pool, recentTitles: ['Claude 5 launches'], recentTopics: ['OpenAI/ChatGPT (3 de 5 edições)'] };

const goodDraft = {
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
  assert.equal(tooFew.ok, false); // pool has 8 candidates, so 5 items are required
  assert.equal(validateEditionDraft({ ...goodDraft, items: goodDraft.items.slice(0, 4) }, pool.slice(0, 6)).ok, true);
  const dup = validateEditionDraft({ ...goodDraft, items: [goodDraft.items[0], { ...goodDraft.items[1], candidate: 1 }, ...goodDraft.items.slice(2)] }, pool);
  assert.equal(dup.ok, false);
  const outOfRange = validateEditionDraft({ ...goodDraft, items: [...goodDraft.items.slice(0, 4), { ...goodDraft.items[4], candidate: 99 }] }, pool);
  assert.equal(outOfRange.ok, false);
  const sameHost = validateEditionDraft({ ...goodDraft, items: [...goodDraft.items.slice(0, 4), { ...goodDraft.items[4], candidate: 8, kind: 'story' }] }, pool);
  assert.equal(sameHost.ok, false); // candidates 1 and 8 are both openai.com
  const tooMuchOpenAi = validateEditionDraft({ ...goodDraft, items: [...goodDraft.items.slice(0, 3), { ...goodDraft.items[3], candidate: 6, kind: 'story' }, { ...goodDraft.items[4], candidate: 8, kind: 'story' }] }, pool);
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --no-warnings --test tests/writer.test.mts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `lib/briefing/writer.ts`**

```ts
import { z } from 'zod';
import { sourceKey, type Candidate } from './ranking.ts';
import { matchTopics } from './sources.ts';
import type { BriefingDraftInput, BriefingTag, EditionItem } from './types';

export type WriterInput = {
  dateLabel: string; // "segunda-feira, 5 de outubro de 2026"
  dateKey: string; // "2026-10-05" (America/New_York)
  pool: Candidate[];
  recentTitles: string[];
  recentTopics: string[];
};

export type EditionDraft = z.infer<typeof EditionDraftSchema>;

export type Edition = {
  headline: string;
  subject: string;
  intro: string;
  takeaway: string;
  shareText: string;
  items: EditionItem[];
  chosen: Candidate[];
};

export type WriterResult = { mode: 'llm' | 'fallback'; edition: Edition; notes: string[] };

const MAX_ITEMS = 7;

const ItemDraftSchema = z.object({
  candidate: z.number().int().min(1),
  kind: z.enum(['lead', 'story', 'tool']),
  title: z.string().trim().min(8).max(110),
  summary: z.string().trim().min(40).max(700),
  whyItMatters: z.string().trim().min(10).max(260),
});

export const EditionDraftSchema = z.object({
  headline: z.string().trim().min(10).max(90),
  subject: z.string().trim().min(8).max(80),
  intro: z.string().trim().min(40).max(700),
  items: z.array(ItemDraftSchema).min(1).max(MAX_ITEMS),
  takeaway: z.string().trim().min(20).max(400),
  shareText: z.string().trim().min(20).max(200),
});

// 5 stories when there is enough to choose from, otherwise as many as the pool allows (up to 4).
export function minimumItems(poolSize: number) {
  return poolSize >= 8 ? 5 : Math.min(4, poolSize);
}

const SYSTEM_PROMPT = `Você é o editor do Thiagao Ai Daily, uma newsletter diária em português do Brasil sobre inteligência artificial, escrita para curiosos, criadores de conteúdo, devs e empreendedores.

Tom: direto, humano, com opinião leve e útil. Zero hype, zero clickbait, sem emojis, sem palavras como "revolucionário", "game changer" ou "incrível". Frases curtas. Explique siglas na primeira vez.

Sua tarefa: a partir dos candidatos numerados que o usuário enviar, montar a edição de hoje.

Regras de seleção (obrigatórias):
- Escolha entre 5 e 7 candidatos (4 só se houver poucos candidatos bons).
- O primeiro item é a manchete do dia, com kind "lead". Os demais usam "story". Use kind "tool" em exatamente um item quando houver uma ferramenta, app ou recurso que o leitor consegue testar hoje; se não houver, não use "tool".
- Cada item vem de um candidato diferente e de um site diferente.
- No máximo 2 itens por categoria e no máximo 2 itens sobre OpenAI/ChatGPT.
- Varie os temas: modelos, open source, agentes, ferramentas, negócios, hardware, regulação, pesquisa com uso prático, Brasil.
- Não repita nem reaproveite assuntos da lista "já cobertos" e evite os "tópicos saturados", salvo fato realmente novo.
- Pule: queda de serviço, vagas, webinars, patrocinados, listas genéricas, opinião sem fato novo, posts rasos.
- Prefira: lançamentos, pesquisa com aplicação clara, open source, movimentos de mercado, regulação, ferramentas testáveis.

Regras de escrita (obrigatórias):
- Cite candidatos apenas pelo número em "candidate". Não invente fatos, números ou nomes além do que está no trecho; se o trecho for curto, escreva menos.
- title: título em português, até 110 caracteres, específico.
- summary: 2 a 3 frases que contam o que aconteceu.
- whyItMatters: 1 frase dizendo o que muda para o leitor (dev, criador ou negócio), não genérica.
- headline: até 80 caracteres, junta o fio do dia. subject: até 70 caracteres, específico, serve de assunto do email, sem "Edição de hoje".
- intro: 2 a 3 frases com o fio condutor do dia, como se fosse você falando com o leitor.
- takeaway: 1 a 2 frases acionáveis, o que fazer com isso hoje.
- shareText: 1 frase de até 180 caracteres para alguém compartilhar no WhatsApp ou X.

Responda SOMENTE com JSON válido, sem comentários, neste formato:
{"headline":"...","subject":"...","intro":"...","items":[{"candidate":1,"kind":"lead","title":"...","summary":"...","whyItMatters":"..."}],"takeaway":"...","shareText":"..."}`;

function truncate(value: string, max: number) {
  const clean = value.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

export function buildWriterMessages(input: WriterInput) {
  const candidates = input.pool
    .map((candidate, index) => {
      const date = candidate.publishedAt ? candidate.publishedAt.slice(0, 10) : 'data desconhecida';
      return `[${index + 1}] ${candidate.publisher} · ${candidate.category} · ${date} · ${candidate.provider}\n${truncate(candidate.title, 160)}\n${truncate(candidate.summary || candidate.title, 400)}`;
    })
    .join('\n\n');
  const avoid = input.recentTitles.length ? input.recentTitles.map((title) => `- ${title}`).join('\n') : '- (nenhum)';
  const saturated = input.recentTopics.length ? input.recentTopics.map((topic) => `- ${topic}`).join('\n') : '- (nenhum)';

  return [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    {
      role: 'user' as const,
      content: `Data de hoje: ${input.dateLabel}.\n\nCandidatos de hoje (use o número em "candidate"):\n\n${candidates}\n\nJá cobertos nos últimos 14 dias (não repita o assunto):\n${avoid}\n\nTópicos saturados nas últimas edições:\n${saturated}\n\nMonte a edição e responda só com o JSON.`,
    },
  ];
}

export function parseEditionDraft(content: string): { ok: true; draft: EditionDraft } | { ok: false; errors: string[] } {
  const stripped = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = stripped.indexOf('{');
  const end = stripped.lastIndexOf('}');
  if (start === -1 || end === -1) return { ok: false, errors: ['no JSON object in the answer'] };
  let json: unknown;
  try {
    json = JSON.parse(stripped.slice(start, end + 1));
  } catch (error) {
    return { ok: false, errors: [`invalid JSON: ${error instanceof Error ? error.message : 'parse error'}`] };
  }
  const parsed = EditionDraftSchema.safeParse(json);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`) };
  }
  return { ok: true, draft: parsed.data };
}

function isAboutOpenAi(candidate: Candidate) {
  return matchTopics(`${candidate.title} ${candidate.summary}`).some((topic) => topic.name === 'openai');
}

function toItem(candidate: Candidate, kind: EditionItem['kind'], title: string, summary: string, whyItMatters: string): EditionItem {
  return {
    kind,
    title,
    summary,
    whyItMatters,
    category: candidate.category,
    source: { title: candidate.title, url: candidate.url, publisher: candidate.publisher, publishedAt: candidate.publishedAt },
  };
}

export function validateEditionDraft(
  draft: EditionDraft,
  pool: Candidate[],
): { ok: true; items: EditionItem[]; chosen: Candidate[] } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const seen = new Set<number>();
  const sources = new Set<string>();
  const perCategory = new Map<BriefingTag, number>();
  let openai = 0;
  let tools = 0;
  const items: EditionItem[] = [];
  const chosen: Candidate[] = [];

  const required = minimumItems(pool.length);
  if (draft.items.length < required) errors.push(`at least ${required} items are required (got ${draft.items.length})`);

  draft.items.forEach((item, index) => {
    if (item.candidate > pool.length) errors.push(`item ${index + 1}: candidate ${item.candidate} does not exist (pool has ${pool.length})`);
    if (seen.has(item.candidate)) errors.push(`item ${index + 1}: candidate ${item.candidate} used twice`);
    seen.add(item.candidate);
    if (index === 0 && item.kind !== 'lead') errors.push('item 1 must have kind "lead"');
    if (index > 0 && item.kind === 'lead') errors.push(`item ${index + 1}: only the first item can be "lead"`);
    if (item.kind === 'tool') tools += 1;
    const candidate = pool[item.candidate - 1];
    if (!candidate) return;
    const key = sourceKey(candidate);
    if (sources.has(key)) errors.push(`item ${index + 1}: source ${key} used twice`);
    sources.add(key);
    perCategory.set(candidate.category, (perCategory.get(candidate.category) ?? 0) + 1);
    if (isAboutOpenAi(candidate)) openai += 1;
    items.push(toItem(candidate, item.kind, item.title, item.summary, item.whyItMatters));
    chosen.push(candidate);
  });

  if (tools > 1) errors.push('at most one item can have kind "tool"');
  for (const [category, count] of perCategory) if (count > 2) errors.push(`more than 2 items in category ${category}`);
  if (openai > 2) errors.push('more than 2 items about OpenAI/ChatGPT');

  return errors.length ? { ok: false, errors } : { ok: true, items, chosen };
}

export function fallbackEdition(input: WriterInput): Edition {
  const items: EditionItem[] = [];
  const chosen: Candidate[] = [];
  const sources = new Set<string>();
  const perCategory = new Map<BriefingTag, number>();
  let openai = 0;
  for (const candidate of input.pool) {
    if (items.length >= 5) break;
    const key = sourceKey(candidate);
    if (sources.has(key)) continue;
    if ((perCategory.get(candidate.category) ?? 0) >= 2) continue;
    const aboutOpenAi = isAboutOpenAi(candidate);
    if (aboutOpenAi && openai >= 2) continue;
    sources.add(key);
    perCategory.set(candidate.category, (perCategory.get(candidate.category) ?? 0) + 1);
    if (aboutOpenAi) openai += 1;
    items.push(
      toItem(
        candidate,
        items.length === 0 ? 'lead' : 'story',
        truncate(candidate.title, 110),
        truncate(candidate.summary || candidate.title, 320),
        'Fonte verificável: abra, confira e decida se muda seu stack, seu conteúdo ou seu negócio.',
      ),
    );
    chosen.push(candidate);
  }
  const first = items[0]?.title ?? 'as novidades do dia';
  return {
    headline: truncate(`O que aconteceu em IA hoje: ${first}`, 90),
    subject: truncate(`IA hoje: ${first}`, 80),
    intro: 'Edição montada automaticamente a partir das fontes do dia. Os resumos vêm direto das fontes originais, então alguns estão em inglês. Abra os links para o contexto completo.',
    takeaway: 'Abra as fontes, escolha uma novidade e transforme em um teste pequeno ainda hoje.',
    shareText: truncate(`O dia em IA, direto das fontes: ${first}. Thiagao Ai Daily.`, 200),
    items,
    chosen,
  };
}

function readingMinutes(edition: Edition) {
  const words = [edition.intro, edition.takeaway, ...edition.items.flatMap((item) => [item.title, item.summary, item.whyItMatters])]
    .join(' ')
    .split(/\s+/).length;
  return Math.max(2, Math.ceil(words / 180));
}

export function composeDraftInput(edition: Edition, input: WriterInput, mode: WriterResult['mode']): BriefingDraftInput {
  const categories = Array.from(new Set(edition.items.map((item) => item.category)));
  const averageScore = edition.chosen.length
    ? Math.round(edition.chosen.reduce((total, candidate) => total + candidate.score, 0) / edition.chosen.length)
    : 0;
  const brief = [
    edition.intro,
    ...edition.items.map(
      (item, index) =>
        `${index + 1}. ${item.title}\n${item.summary}\nPor que importa: ${item.whyItMatters}\nFonte: ${item.source.publisher} — ${item.source.url}`,
    ),
    `Take do dia: ${edition.takeaway}`,
  ].join('\n\n');

  return {
    slug: `daily-${input.dateKey}`,
    title: edition.headline,
    dek: edition.intro,
    brief,
    takeaway: edition.takeaway,
    category: edition.items[0]?.category ?? 'AI',
    tags: [...categories, 'Daily', ...(mode === 'fallback' ? ['Auto'] : [])],
    sources: edition.items.map((item) => item.source),
    relevanceScore: averageScore,
    readingMinutes: readingMinutes(edition),
    items: edition.items,
    subject: edition.subject,
    shareText: edition.shareText,
  };
}

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

async function requestCompletion(messages: ChatMessage[], apiKey: string) {
  const baseUrl = (process.env.NEWSLETTER_WRITER_BASE_URL || 'https://api.deepseek.com').replace(/\/+$/, '');
  const model = process.env.NEWSLETTER_WRITER_MODEL || 'deepseek-chat';
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model, messages, temperature: 0.6, max_tokens: 2500, response_format: { type: 'json_object' }, stream: false }),
      signal: AbortSignal.timeout(90_000),
    });
    if (!response.ok) return { ok: false as const, status: response.status, error: `HTTP ${response.status}` };
    const payload = (await response.json()) as { choices?: { message?: { content?: string | null } }[] };
    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content) return { ok: false as const, status: response.status, error: 'empty answer' };
    return { ok: true as const, content, model };
  } catch (error) {
    return { ok: false as const, status: null, error: error instanceof Error ? error.message : 'request failed' };
  }
}

export async function writeEdition(input: WriterInput): Promise<WriterResult> {
  const apiKey = process.env.NEWSLETTER_WRITER_API_KEY || process.env.DEEPSEEK_API_KEY;
  const notes: string[] = [];
  if (input.pool.length === 0) return { mode: 'fallback', edition: fallbackEdition(input), notes: ['Writer skipped: empty candidate pool.'] };
  if (!apiKey) {
    return { mode: 'fallback', edition: fallbackEdition(input), notes: ['Writer skipped: NEWSLETTER_WRITER_API_KEY/DEEPSEEK_API_KEY is not configured.'] };
  }

  const messages: ChatMessage[] = buildWriterMessages(input);
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const result = await requestCompletion(messages, apiKey);
    if (!result.ok) {
      notes.push(`Writer attempt ${attempt} failed: ${result.error}.`);
      if (result.status === 401 || result.status === 403) break;
      continue;
    }
    const parsed = parseEditionDraft(result.content);
    const validated = parsed.ok ? validateEditionDraft(parsed.draft, input.pool) : parsed;
    if (parsed.ok && validated.ok) {
      return {
        mode: 'llm',
        edition: { ...parsed.draft, items: validated.items, chosen: validated.chosen },
        notes: [...notes, `Writer ok with ${result.model} on attempt ${attempt}.`],
      };
    }
    const errors = validated.ok ? [] : validated.errors;
    notes.push(`Writer attempt ${attempt} rejected: ${errors.join('; ')}.`);
    messages.push(
      { role: 'assistant', content: result.content },
      { role: 'user', content: `O JSON anterior violou estas regras: ${errors.join('; ')}. Gere a edição de novo respeitando todas as regras e responda só com o JSON.` },
    );
  }
  return { mode: 'fallback', edition: fallbackEdition(input), notes: [...notes, 'Writer fell back to the template edition.'] };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --no-warnings --test tests/writer.test.mts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/briefing/writer.ts tests/writer.test.mts
git commit -m "Add the LLM edition writer with validation and template fallback"
```

---

## Chunk 2: Agent, persistence, routes, email

### Task 6: Recent-edition memory and posts queries

**Files:**
- Create: `lib/briefing/memory.ts`
- Modify: `lib/briefing/posts.ts`
- Test: `tests/edition-memory.test.mts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/edition-memory.test.mts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --no-warnings --test tests/edition-memory.test.mts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `lib/briefing/memory.ts`**

```ts
import { emptyMemory, normalizeUrl, type RecentMemory } from './dedupe.ts';
import { matchTopics, topicRules } from './sources.ts';
import type { BriefingPost } from './types';

export type EditionMemory = RecentMemory & { recentTitles: string[]; recentTopics: string[] };

function postText(post: BriefingPost) {
  return [post.title, post.dek, post.takeaway, ...post.items.map((item) => `${item.title} ${item.summary}`), ...post.sources.map((source) => source.title)].join(' ');
}

// posts: newest first. URL/title memory uses all of them; topic counts only the newest `topicEditions`.
export function buildRecentMemory(posts: BriefingPost[], { topicEditions = 5 } = {}): EditionMemory {
  const memory = emptyMemory();
  for (const post of posts) {
    for (const source of post.sources) memory.urls.add(normalizeUrl(source.url));
    for (const item of post.items) {
      memory.urls.add(normalizeUrl(item.source.url));
      memory.titles.push(item.title);
    }
    memory.titles.push(post.title);
  }
  const window = posts.slice(0, topicEditions);
  for (const post of window) {
    for (const topic of new Set(matchTopics(postText(post)).map((rule) => rule.name))) {
      memory.topicCounts.set(topic, (memory.topicCounts.get(topic) ?? 0) + 1);
    }
  }
  const recentTopics = Array.from(memory.topicCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .filter(([, count]) => count >= 2)
    .map(([name, count]) => `${topicRules.find((rule) => rule.name === name)?.label ?? name} (${count} de ${window.length} edições)`);
  const recentTitles = posts.flatMap((post) => post.items.map((item) => item.title)).slice(0, 40);
  return { ...memory, recentTitles, recentTopics };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --no-warnings --test tests/edition-memory.test.mts`
Expected: PASS.

- [ ] **Step 5: Add the Supabase-backed functions to `lib/briefing/posts.ts`**

`posts.ts` is not loaded by tests, so it may keep its extensionless imports. Add imports: `import { buildRecentMemory, type EditionMemory } from './memory';` and the `BriefingPost` type.

```ts
export async function getPublishedBriefingBySlug(slug: string) {
  const fromFallback = () => fallbackBriefings.find((post) => post.slug === slug) ?? null;
  const supabase = getSupabaseAdmin();
  if (!supabase) return fromFallback();
  const { data, error } = await supabase.from('daily_digest_posts').select('*').eq('slug', slug).eq('status', 'published').maybeSingle();
  if (error) {
    console.error('Failed to load briefing by slug', error);
    return fromFallback();
  }
  return data ? toPost(data as BriefingRow) : null;
}

type EditionLink = { slug: string; title: string } | null;

export async function getAdjacentEditions(post: BriefingPost): Promise<{ previous: EditionLink; next: EditionLink }> {
  const supabase = getSupabaseAdmin();
  if (!post.publishedAt) return { previous: null, next: null };
  if (!supabase) {
    const ordered = [...fallbackBriefings].sort((a, b) => (a.publishedAt ?? '').localeCompare(b.publishedAt ?? ''));
    const index = ordered.findIndex((item) => item.slug === post.slug);
    return { previous: ordered[index - 1] ?? null, next: ordered[index + 1] ?? null };
  }
  const [previous, next] = await Promise.all([
    supabase.from('daily_digest_posts').select('slug,title').eq('status', 'published').lt('published_at', post.publishedAt).order('published_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('daily_digest_posts').select('slug,title').eq('status', 'published').gt('published_at', post.publishedAt).order('published_at', { ascending: true }).limit(1).maybeSingle(),
  ]);
  return { previous: (previous.data as EditionLink) ?? null, next: (next.data as EditionLink) ?? null };
}

// Every edition created for a New York day: `daily-<date>` plus any forced `daily-<date>-hhmm`.
export async function findEditionsForDate(dateKey: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [] as BriefingPost[];
  const { data, error } = await supabase
    .from('daily_digest_posts')
    .select('*')
    .like('slug', `daily-${dateKey}%`)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as BriefingRow[]).map(toPost).filter((post) => post.slug === `daily-${dateKey}` || post.slug.startsWith(`daily-${dateKey}-`));
}

export async function getRecentEditionMemory({ days = 14 }: { days?: number } = {}): Promise<EditionMemory & { note: string }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ...buildRecentMemory([]), note: 'Recent edition memory skipped: Supabase is not configured.' };
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const { data, error } = await supabase
    .from('daily_digest_posts')
    .select('*')
    .eq('status', 'published')
    .gte('published_at', since)
    .order('published_at', { ascending: false })
    .limit(60);
  if (error) return { ...buildRecentMemory([]), note: `Recent edition memory skipped: ${error.message}.` };
  const posts = (data as BriefingRow[]).map(toPost);
  const memory = buildRecentMemory(posts);
  return { ...memory, note: `Recent edition memory: ${posts.length} editions, ${memory.urls.size} urls, saturated topics: ${memory.recentTopics.join(', ') || 'none'}.` };
}

export async function unsubscribeSubscriber(email: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { updated: false, reason: 'Supabase is not configured yet.' };
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .update({ status: 'unsubscribed', updated_at: new Date().toISOString() })
    .eq('email', email.trim().toLowerCase())
    .select('email');
  if (error) throw new Error(error.message);
  return { updated: Boolean(data?.length) };
}
```

Replace `getActiveSubscribers` with a paginated version:

```ts
export async function getActiveSubscribers() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [] as SubscriberRow[];
  const pageSize = 1000;
  const rows: SubscriberRow[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1);
    if (error) throw new Error(error.message);
    rows.push(...((data ?? []) as SubscriberRow[]));
    if (!data || data.length < pageSize) break;
  }
  return rows;
}
```

Note: the local demo DB (`lib/dev/local-db.ts`) must support `like` and `range`. Check `matches()`/the request parser; `like` uses PostgREST syntax `slug=like.daily-2026-10-05*` and `range` is sent as the `Range` header (`0-999`). If either is missing, add minimal support (pattern `*` → `.*` regex for `like`; honour `Range` header by slicing) and cover it in `tests/local-db.test.mts`.

- [ ] **Step 6: Type-check, run all tests, commit**

Run: `npx tsc --noEmit -p tsconfig.json && npm test`
Expected: pass.

```bash
git add lib/briefing/memory.ts lib/briefing/posts.ts lib/dev/local-db.ts tests/edition-memory.test.mts tests/local-db.test.mts
git commit -m "Add edition queries, recent-edition memory and unsubscribe storage"
```

### Task 7: Rewrite the agent

**Files:**
- Rewrite: `lib/briefing/agent.ts`

- [ ] **Step 1: Replace the module**

Keep from the current file: `stripCdata`, `decodeXml`, `readTag`, `parseDate`, `truncate`, `hostnameFromUrl`. Remove everything about themes, keyword lists, topic memory, scoring, `rankItems`, `groupIntoDrafts`, `collectTags`, `signalLine`, `providerLabel`.

```ts
import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import type { EditionMemory } from './memory';
import { getRecentEditionMemory } from './posts';
import { selectPool, type Candidate } from './ranking';
import { feedSources, guessCategory, type FeedSource } from './sources';
import { composeDraftInput, writeEdition, type WriterResult } from './writer';
import type { AgentRunRecord, BriefingDraftInput } from './types';

export function getNewYorkDateKey(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${value('year')}-${value('month')}-${value('day')}`;
}

export function getNewYorkDateLabel(now = new Date()) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/New_York', dateStyle: 'full' }).format(now);
}

const AgentState = Annotation.Root({
  now: Annotation<string>({ reducer: (_left, right) => right, default: () => new Date().toISOString() }),
  dateKey: Annotation<string>({ reducer: (_left, right) => right, default: () => getNewYorkDateKey() }),
  items: Annotation<Candidate[]>({ reducer: (_left, right) => right, default: () => [] }),
  pool: Annotation<Candidate[]>({ reducer: (_left, right) => right, default: () => [] }),
  memory: Annotation<EditionMemory | null>({ reducer: (_left, right) => right, default: () => null }),
  writer: Annotation<WriterResult['mode']>({ reducer: (_left, right) => right, default: () => 'fallback' }),
  draft: Annotation<BriefingDraftInput | null>({ reducer: (_left, right) => right, default: () => null }),
  notes: Annotation<string[]>({ reducer: (left, right) => left.concat(right), default: () => [] }),
});
```

`fetchFeed(source: FeedSource): Promise<Candidate[]>` — as today but: slice to 10 items, `reliability: source.reliability`, `general: source.general`, `score: 0`, `provider: 'rss'`, Atom `<link href>` kept.

`fetchPerplexity()`:
- system: "Você é um pesquisador de newsletter sobre inteligência artificial. Liste apenas fatos recentes e verificáveis, com fontes primárias (blogs oficiais, repositórios, papers, veículos confiáveis)."
- user: "Quais foram as notícias mais importantes de inteligência artificial nas últimas 24 horas? Inclua lançamentos de modelos e produtos, pesquisa com aplicação prática, open source, movimentos de mercado, regulação e ferramentas novas. Para cada uma, título claro e fonte."
- `search_recency_filter: 'day'`, no `search_domain_filter`, `max_tokens: 900`. Keep the endpoint `https://api.perplexity.ai/v1/sonar` (documented) and the `search_results`/`citations` mapping.
- Each result → `{ title, url, publisher: hostnameFromUrl(url), publishedAt: parseDate(date || last_updated), category: guessCategory(title + snippet), summary: snippet || answer || title, provider: 'perplexity', reliability: 74, score: 0 }`.

`fetchXSignals()`: 48h window; query `(AI OR LLM OR "open source model" OR agents OR OpenAI OR Anthropic OR Gemini OR DeepSeek) lang:en -is:retweet -is:reply`; keep only posts with engagement ≥ 50; `reliability: 55`, `score: 0`, `category: guessCategory(text)`.

Nodes:

```ts
const collect = async () => {
  const [perplexity, x, feeds] = await Promise.all([fetchPerplexity(), fetchXSignals(), Promise.allSettled(feedSources.map(fetchFeed))]);
  const feedItems = feeds.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
  const failures = feeds
    .map((result, index) => ({ result, source: feedSources[index] }))
    .filter(({ result }) => result.status === 'rejected')
    .map(({ result, source }) => `${source.name}: ${(result as PromiseRejectedResult).reason}`);
  return {
    items: [...perplexity.items, ...x.items, ...feedItems],
    notes: [...perplexity.notes, ...x.notes, `RSS collected ${feedItems.length} items from ${feedSources.length - failures.length}/${feedSources.length} feeds.`, ...failures],
  };
};

const rank = async (state: typeof AgentState.State) => {
  const memory = await getRecentEditionMemory();
  const { pool, window, notes } = selectPool(state.items, memory, new Date(state.now));
  return { pool, memory, notes: [memory.note, ...notes, `Window ${window}.`] };
};

const write = async (state: typeof AgentState.State) => {
  if (state.pool.length === 0) return { draft: null, writer: 'fallback' as const, notes: ['No candidates after ranking; no edition created.'] };
  const input = {
    dateLabel: getNewYorkDateLabel(new Date(state.now)),
    dateKey: state.dateKey,
    pool: state.pool,
    recentTitles: state.memory?.recentTitles ?? [],
    recentTopics: state.memory?.recentTopics ?? [],
  };
  const result = await writeEdition(input);
  if (result.edition.items.length < 3) {
    return { draft: null, writer: result.mode, notes: [...result.notes, `Only ${result.edition.items.length} items; too thin to publish.`] };
  }
  const draft = composeDraftInput(result.edition, input, result.mode);
  return { draft, writer: result.mode, notes: [...result.notes, `Edition has ${draft.items.length} items (${result.mode}).`] };
};
```

```ts
const graph = new StateGraph(AgentState)
  .addNode('collect', collect).addNode('rank', rank).addNode('write', write)
  .addEdge(START, 'collect').addEdge('collect', 'rank').addEdge('rank', 'write').addEdge('write', END)
  .compile();

export async function runDailyBriefingAgent({ now = new Date(), slug }: { now?: Date; slug?: string } = {}) {
  const startedAt = new Date().toISOString();
  const result = await graph.invoke({ now: now.toISOString(), dateKey: getNewYorkDateKey(now) });
  const draft = result.draft && slug ? { ...result.draft, slug } : result.draft;
  const run: AgentRunRecord = {
    status: 'success',
    startedAt,
    finishedAt: new Date().toISOString(),
    sourceCount: result.items.length,
    draftCount: draft ? 1 : 0,
    notes: [...result.notes, `Writer mode: ${result.writer}.`],
  };
  return { draft, writer: result.writer, run };
}
```

- [ ] **Step 2: Type-check and lint**

Run: `npx tsc --noEmit -p tsconfig.json && npm run lint`
Expected: the only errors are in `app/api/agent/daily-digest/route.ts` (it still reads `result.drafts`); Task 8 fixes it. Commit both together.

### Task 8: Daily digest route: one edition per day, resend when unsent

**Files:**
- Rewrite: `app/api/agent/daily-digest/route.ts`

- [ ] **Step 1: Implement**

```ts
import { NextResponse } from 'next/server';
import { getNewYorkDateKey, runDailyBriefingAgent } from '@/lib/briefing/agent';
import { isAdminRequestAuthorized } from '@/lib/briefing/admin-request';
import { sendBriefingEmail } from '@/lib/briefing/email';
import { findEditionsForDate, hasSentCampaign, publishBriefingPost, saveAgentDrafts } from '@/lib/briefing/posts';
import { safeEqual } from '@/lib/shared/request-guard';

export const runtime = 'nodejs';
// No-op on the Dokploy container, but documents the budget: feeds + writer (≤ 2 × 90 s) + batched sends.
export const maxDuration = 300;

function isCronAuthorized(request: Request) {
  const secret = process.env.AGENT_CRON_SECRET;
  if (!secret && process.env.NODE_ENV !== 'production') return true;
  if (!secret) return false;
  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  const header = request.headers.get('x-agent-secret') ?? '';
  return safeEqual(bearer, secret) || safeEqual(header, secret);
}

function emailStatus(email: { sent: boolean; skipped?: boolean }) {
  return email.sent || email.skipped ? 200 : 502;
}

export async function POST(request: Request) {
  if (!isCronAuthorized(request) && !isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const body = (await request.json().catch(() => ({}))) as { force?: boolean; dryRun?: boolean };
    const now = new Date();
    const dateKey = getNewYorkDateKey(now);
    const campaign = `daily-${dateKey}`;

    if (body.dryRun) {
      const result = await runDailyBriefingAgent({ now });
      return NextResponse.json({ ok: true, dryRun: true, campaign, writer: result.writer, draft: result.draft, run: result.run });
    }

    if (!body.force) {
      const existing = await findEditionsForDate(dateKey);
      const published = existing.find((post) => post.status === 'published');
      if (published) {
        if (await hasSentCampaign(published.slug)) {
          return NextResponse.json({ ok: true, skipped: true, reason: `Edition ${published.slug} was already sent.`, campaign: published.slug });
        }
        // Published earlier (for example the writer ran but Resend failed): send it now instead of writing a second edition.
        const email = await sendBriefingEmail(published, { campaign: published.slug });
        return NextResponse.json({ ok: emailStatus(email) === 200, resent: true, campaign: published.slug, post: published, email }, { status: emailStatus(email) });
      }
      if (existing.length > 0) {
        return NextResponse.json({ ok: true, skipped: true, reason: `Edition ${existing[0].slug} exists as a draft; publish it from the admin.`, campaign });
      }
    }

    // `force` always writes a new edition and emails every active subscriber again.
    const slug = body.force ? `${campaign}-${now.toISOString().slice(11, 16).replace(':', '')}` : campaign;
    const result = await runDailyBriefingAgent({ now, slug });
    if (!result.draft) {
      return NextResponse.json({ ok: false, message: "No edition could be built from today's sources.", notes: result.run.notes }, { status: 500 });
    }
    const storage = await saveAgentDrafts([result.draft], result.run);
    const stored = 'drafts' in storage ? storage.drafts?.[0] : undefined;
    if (!stored) {
      return NextResponse.json({ ok: false, message: 'Edition was not stored.', storage, notes: result.run.notes }, { status: 500 });
    }
    const post = await publishBriefingPost(stored.id);
    const email = await sendBriefingEmail(post, { campaign: slug });
    const status = emailStatus(email);
    return NextResponse.json({ ok: status === 200, campaign: slug, writer: result.writer, post, email, notes: result.run.notes }, { status });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Agent failed.' }, { status: 500 });
  }
}
```

`sendBriefingEmail` returns `skipped: true` when there is no API key or no subscribers (Task 10). Until Task 10 lands, add `skipped?: boolean` to its return type so this compiles, or do Tasks 8 and 10 in one go.

- [ ] **Step 2: Type-check, lint, test, commit**

Run: `npx tsc --noEmit -p tsconfig.json && npm run lint && npm test`

```bash
git add lib/briefing/agent.ts app/api/agent/daily-digest/route.ts
git commit -m "Rewrite the daily agent around ranking and the LLM writer; one edition per day"
```

### Task 9: Unsubscribe (token, API, page)

**Files:**
- Create: `lib/briefing/unsubscribe.ts`, `app/api/newsletter/unsubscribe/route.ts`, `app/newsletter/sair/page.tsx`
- Test: `tests/unsubscribe.test.mts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unsubscribe.test.mts
import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { buildUnsubscribeUrls, unsubscribeToken, verifyUnsubscribeToken } from '../lib/briefing/unsubscribe.ts';

afterEach(() => {
  delete process.env.NEWSLETTER_UNSUBSCRIBE_SECRET;
  delete process.env.AGENT_CRON_SECRET;
});

test('token round-trips and is case/space insensitive on the email', () => {
  process.env.NEWSLETTER_UNSUBSCRIBE_SECRET = 'secret';
  const token = unsubscribeToken(' Ana@Example.com ');
  assert.ok(token && token.length >= 24);
  assert.equal(verifyUnsubscribeToken('ana@example.com', token!), true);
  assert.equal(verifyUnsubscribeToken('ana@example.com', token!.slice(1)), false);
  assert.equal(verifyUnsubscribeToken('bob@example.com', token!), false);
});

test('falls back to AGENT_CRON_SECRET and returns null without any secret', () => {
  assert.equal(unsubscribeToken('a@b.c'), null);
  assert.equal(buildUnsubscribeUrls('a@b.c'), null);
  process.env.AGENT_CRON_SECRET = 'cron';
  const urls = buildUnsubscribeUrls('a@b.c')!;
  assert.match(urls.pageUrl, /\/newsletter\/sair\?email=a%40b\.c&token=/);
  assert.match(urls.apiUrl, /\/api\/newsletter\/unsubscribe\?email=a%40b\.c&token=/);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --experimental-strip-types --no-warnings --test tests/unsubscribe.test.mts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `lib/briefing/unsubscribe.ts`**

```ts
import { createHmac, timingSafeEqual } from 'node:crypto';
import { getSiteUrl } from './config.ts';

function secret() {
  return process.env.NEWSLETTER_UNSUBSCRIBE_SECRET || process.env.AGENT_CRON_SECRET || '';
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function unsubscribeToken(email: string) {
  const key = secret();
  if (!key) return null;
  return createHmac('sha256', key).update(normalizeEmail(email)).digest('base64url').slice(0, 32);
}

export function verifyUnsubscribeToken(email: string, token: string) {
  const expected = unsubscribeToken(email);
  if (!expected || !token) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

// pageUrl: the human link in the footer. apiUrl: the List-Unsubscribe target; mail providers POST to it
// with the body "List-Unsubscribe=One-Click" (RFC 8058), so email and token travel in the query string.
export function buildUnsubscribeUrls(email: string) {
  const token = unsubscribeToken(email);
  if (!token) return null;
  const site = getSiteUrl().replace(/\/$/, '');
  const query = `email=${encodeURIComponent(normalizeEmail(email))}&token=${token}`;
  return { pageUrl: `${site}/newsletter/sair?${query}`, apiUrl: `${site}/api/newsletter/unsubscribe?${query}` };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types --no-warnings --test tests/unsubscribe.test.mts`
Expected: PASS.

- [ ] **Step 5: API route `app/api/newsletter/unsubscribe/route.ts`**

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logNewsletterEvent, unsubscribeSubscriber } from '@/lib/briefing/posts';
import { verifyUnsubscribeToken } from '@/lib/briefing/unsubscribe';

export const runtime = 'nodejs';

const Schema = z.object({ email: z.email(), token: z.string().min(16).max(64) });

async function readBody(request: Request): Promise<Record<string, unknown>> {
  const type = request.headers.get('content-type') ?? '';
  if (type.includes('application/json')) return (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const form = await request.formData().catch(() => null);
  return form ? Object.fromEntries(form.entries()) : {};
}

// Deliberately not same-origin guarded: one-click unsubscribe (RFC 8058) is a cross-origin POST from the
// mail provider with body "List-Unsubscribe=One-Click"; email and token then come from the query string.
export async function POST(request: Request) {
  const url = new URL(request.url);
  const body = await readBody(request);
  const raw = {
    email: body.email ?? url.searchParams.get('email') ?? undefined,
    token: body.token ?? url.searchParams.get('token') ?? undefined,
  };
  const wantsHtml = (request.headers.get('accept') ?? '').includes('text/html');
  const redirect = (state: 'done' | 'invalid') => NextResponse.redirect(new URL(`/newsletter/sair?state=${state}`, request.url), 303);
  const parsed = Schema.safeParse(raw);
  if (!parsed.success || !verifyUnsubscribeToken(parsed.data.email, parsed.data.token)) {
    return wantsHtml ? redirect('invalid') : NextResponse.json({ ok: false, message: 'Invalid unsubscribe link.' }, { status: 400 });
  }
  const result = await unsubscribeSubscriber(parsed.data.email);
  await logNewsletterEvent({ eventType: 'unsubscribe', path: '/newsletter/sair', email: parsed.data.email, metadata: { updated: result.updated } });
  return wantsHtml ? redirect('done') : NextResponse.json({ ok: true, ...result });
}
```

`request.url` behind the Dokploy proxy may carry the internal host; build the redirect from `x-forwarded-host`/`x-forwarded-proto` when present (see `proxy.ts` `routeStoreHost` for the pattern) and fall back to `request.url`.

- [ ] **Step 6: Page `app/newsletter/sair/page.tsx`**

Server component. Reads `searchParams` (`email`, `token`, `state`; it is a Promise). Dark layout like `app/newsletter/obrigado/page.tsx` (same nav with `BrandMark`, same radial background). States:
- `state=done`: "Pronto, você saiu da lista." + link "Voltar para a newsletter" + "Mudou de ideia? Assine de novo quando quiser."
- `state=invalid` or missing email/token: "Esse link de descadastro não é válido. Responda qualquer edição com SAIR que eu removo você."
- otherwise: shows the email and a plain `<form method="post" action="/api/newsletter/unsubscribe">` with hidden `email` and `token` inputs and a button "Confirmar descadastro". (`form-action 'self'` in the CSP allows it; the API answers 303.)

Metadata: `title: 'Sair da newsletter - Thiagao Ai Daily'`, `robots: { index: false, follow: false }`.

- [ ] **Step 7: Lint, test, commit**

```bash
git add lib/briefing/unsubscribe.ts app/api/newsletter/unsubscribe/route.ts app/newsletter/sair/page.tsx tests/unsubscribe.test.mts
git commit -m "Add signed one-click unsubscribe with a confirmation page"
```

### Task 10: Edition email, chunked sending, WhatsApp text

**Files:**
- Create: `lib/briefing/edition.ts`
- Rewrite: `lib/briefing/email-template.ts`
- Modify: `lib/briefing/email.ts` (`sendBriefingEmail`; also fix the `/newslatter` default in `sendCustomNewsletterEmail` to `/newsletter`)
- Modify: `lib/briefing/whatsapp.ts` (`renderBriefingWhatsApp`; import `./config.ts`)
- Test: `tests/email-template.test.mts`, `tests/whatsapp.test.mts`

- [ ] **Step 1: `lib/briefing/edition.ts`**

```ts
import { getSiteUrl } from './config.ts';
import type { BriefingPost } from './types';

export function editionPath(post: Pick<BriefingPost, 'slug'>) {
  return `/newsletter/${post.slug}`;
}

export function editionUrl(post: Pick<BriefingPost, 'slug'>, utm?: { source: string; medium: string; campaign?: string }) {
  const url = new URL(editionPath(post), getSiteUrl());
  if (utm) {
    url.searchParams.set('utm_source', utm.source);
    url.searchParams.set('utm_medium', utm.medium);
    url.searchParams.set('utm_campaign', utm.campaign ?? post.slug);
  }
  return url.toString();
}

export function shareLinks(post: Pick<BriefingPost, 'slug' | 'title' | 'shareText'>, medium = 'share') {
  const url = editionUrl(post, { source: 'share', medium });
  const text = post.shareText ?? post.title;
  return {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
    x: `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    url,
  };
}

export function formatEditionDate(iso: string | null, style: 'full' | 'short' = 'full') {
  if (!iso) return '';
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/New_York', dateStyle: style === 'full' ? 'full' : 'medium' }).format(new Date(iso));
}
```

- [ ] **Step 2: Write the failing tests**

```ts
// tests/email-template.test.mts
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
```

```ts
// tests/whatsapp.test.mts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderBriefingWhatsApp } from '../lib/briefing/whatsapp.ts';
import type { BriefingPost } from '../lib/briefing/types.ts';
// copy the same `post` fixture as in tests/email-template.test.mts (keep the tests independent)

test('whatsapp text lists items with the edition link', () => {
  const text = renderBriefingWhatsApp(post);
  assert.match(text, /\*Thiagao Ai Daily\*/);
  assert.match(text, /1\. \*GPT-6 em preview\*/);
  assert.match(text, /\/newsletter\/daily-2026-10-05/);
});
```

- [ ] **Step 3: Run both to verify they fail**, then **Step 4: Implement `email-template.ts`**

Imports: `import { getSiteUrl } from './config.ts'; import { editionUrl, formatEditionDate, shareLinks } from './edition.ts';`.

Export `escapeHtml`, `renderEditionEmail(post, { unsubscribeUrl }: { unsubscribeUrl: string | null })` and `renderEditionText(post, { unsubscribeUrl })`. Delete `renderBriefingEmail`/`renderBriefingText` (only `email.ts` used them).

HTML (tables, inline styles, dark palette `#030405/#08090d`, cyan accents as today, max-width 680px):
1. Preheader: `post.dek`.
2. Header: logo (`${site}/brand/thigaoai-logo-512.png`), "THIAGAO AI DAILY", date line `formatEditionDate(post.publishedAt)`, headline `post.title`, intro `post.dek`.
3. Items: for each item, a block with number + category pill, title (22px), summary paragraph, "Por que importa:" line in cyan, link "Ler na fonte · {publisher}" (`source.url`). The `tool` item gets the label "Para testar hoje" above its title and a cyan border.
4. "Take do dia" box with `post.takeaway`.
5. Share row: "Gostou? Manda para alguém que acompanha IA." + three buttons from `shareLinks(post, 'email')` (WhatsApp, X, LinkedIn) + "Ler no site" → `editionUrl(post, { source: 'newsletter', medium: 'email' })`.
6. Footer: "Você recebe o Thiagao Ai Daily porque assinou em thiagao.io. Responda este email para falar com o Thiago." + when `unsubscribeUrl` → `<a href="${escapeHtml(unsubscribeUrl)}">Sair da lista</a>`; else "Para sair, responda com SAIR."
7. When `post.items.length === 0`: render `renderRichText(post.brief)` instead of the items block (legacy posts).

Every dynamic string goes through `escapeHtml` (including `shareText` inside share URLs, which are already URL-encoded, and the unsubscribe URL).

Text version: header, date, headline, intro, `N. title` / summary / `Por que importa: …` / `Fonte: url`, take, "Ler no site: url", share hint, unsubscribe line (url or "Para sair, responda com SAIR").

- [ ] **Step 5: Update `sendBriefingEmail` in `lib/briefing/email.ts`**

Imports: `renderEditionEmail`, `renderEditionText`, `escapeHtml` from `./email-template`; `buildUnsubscribeUrls`, `unsubscribeToken` from `./unsubscribe`.

```ts
const UNSUB_PLACEHOLDER = '%%UNSUBSCRIBE_URL%%';

export type BriefingEmailResult = {
  sent: boolean;
  skipped: boolean;
  attempted: number;
  delivered: number;
  failed: number;
  reason?: string;
};

export async function sendBriefingEmail(post: BriefingPost, options: { campaign?: string } = {}): Promise<BriefingEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, skipped: true, attempted: 0, delivered: 0, failed: 0, reason: 'RESEND_API_KEY is required.' };
  const subscribers = await getActiveSubscribers();
  if (subscribers.length === 0) return { sent: false, skipped: true, attempted: 0, delivered: 0, failed: 0, reason: 'No active subscribers yet.' };

  const resend = new Resend(apiKey);
  const from = getNewsletterFrom();
  const replyTo = getNewsletterReplyTo();
  const subject = post.subject?.trim() || post.title;
  const campaign = options.campaign ?? post.slug;
  const hasTokens = Boolean(unsubscribeToken('probe@example.com'));
  // Render once; the per-recipient unsubscribe link is substituted below.
  const html = renderEditionEmail(post, { unsubscribeUrl: hasTokens ? UNSUB_PLACEHOLDER : null });
  const text = renderEditionText(post, { unsubscribeUrl: hasTokens ? UNSUB_PLACEHOLDER : null });

  let attempted = 0;
  let delivered = 0;
  let failed = 0;
  const failures: string[] = [];
  for (let start = 0; start < subscribers.length; start += 100) {
    const chunk = subscribers.slice(start, start + 100);
    const messages = chunk.map((subscriber) => {
      const urls = buildUnsubscribeUrls(subscriber.email);
      return {
        from,
        to: subscriber.email,
        replyTo,
        subject,
        html: urls ? html.replaceAll(UNSUB_PLACEHOLDER, escapeHtml(urls.pageUrl)) : html,
        text: urls ? text.replaceAll(UNSUB_PLACEHOLDER, urls.pageUrl) : text,
        headers: urls ? { 'List-Unsubscribe': `<${urls.apiUrl}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } : undefined,
      };
    });
    const result = await resend.batch.send(messages, { batchValidation: 'permissive' });
    attempted += chunk.length;
    if (result.error) {
      failed += chunk.length;
      failures.push(result.error.message);
      await logEmailSendEvents(chunk.map((subscriber) => ({ postId: post.id, email: subscriber.email, subject, status: 'failed', campaign, error: result.error?.message ?? 'Resend batch failed.' })));
      continue;
    }
    const errors = new Map((result.data?.errors ?? []).map((error) => [error.index, error.message]));
    const ids = result.data?.data ?? [];
    let okIndex = 0;
    await logEmailSendEvents(
      chunk.map((subscriber, index) => {
        const error = errors.get(index);
        return { postId: post.id, email: subscriber.email, subject, status: error ? 'failed' : 'sent', providerId: error ? null : ids[okIndex++]?.id ?? null, campaign, error: error ?? null };
      }),
    );
    delivered += ids.length;
    failed += errors.size;
  }
  const sent = delivered > 0;
  return { sent, skipped: false, attempted, delivered, failed, reason: sent ? undefined : failures[0] ?? 'Resend accepted nothing.' };
}
```

`escapeHtml` on the page URL turns `&` into `&amp;` (the test checks it); the `List-Unsubscribe` header keeps the raw API URL.

- [ ] **Step 6: `renderBriefingWhatsApp` with items**

Change the import to `./config.ts` and add `import { editionUrl, formatEditionDate } from './edition.ts';`. When `post.items.length > 0`:

```
*Thiagao Ai Daily* · {formatEditionDate(publishedAt, 'short')}
*{title}*

{dek}

1. *{item.title}* — {item.whyItMatters}
2. ...

*Take do dia:* {takeaway}

Edição completa: {editionUrl(post, { source: 'whatsapp', medium: 'group' })}
Grupo Solocodando: {groupUrl or hint}
```

Otherwise keep the current format but link `editionUrl(post)` instead of `/newslatter?tag=`.

- [ ] **Step 7: Run tests, lint, type-check; commit**

```bash
git add lib/briefing/edition.ts lib/briefing/email-template.ts lib/briefing/email.ts lib/briefing/whatsapp.ts tests/email-template.test.mts tests/whatsapp.test.mts
git commit -m "Render the daily edition email with share and unsubscribe; send in batches"
```

---

## Chunk 3: Site, admin, scheduling, docs

### Task 11: Edition page `/newsletter/[slug]`

**Files:**
- Create: `app/newsletter/[slug]/page.tsx`, `app/newsletter/[slug]/ShareButtons.tsx`, `app/newsletter/EditionItems.tsx`, `app/components/SocialIcons.tsx`
- Modify: `app/briefing/page.tsx:44-80` (move `XIcon`, `InstagramIcon`, `FacebookIcon`, `LinkedinIcon` into `SocialIcons.tsx` and import them)

- [ ] **Step 1: `app/components/SocialIcons.tsx`**

Move the four icon components out of `app/briefing/page.tsx` unchanged and export them; update the imports in `app/briefing/page.tsx`.

- [ ] **Step 2: `app/newsletter/EditionItems.tsx`** (server component, no hooks)

Props: `{ post: BriefingPost; compact?: boolean }`. Renders `<ol>` of `post.items`:
- compact (used on `/newsletter` featured card): number, category pill, title as `<Link href={`/newsletter/${post.slug}#item-${n}`}>`, one-line `whyItMatters` in zinc-400.
- full: `<li id="item-N" className="scroll-mt-28">` with number + pill (+ "Para testar hoje" label for `tool`), `<h2>` title, summary, "Por que importa" callout (`border-l-2 border-cyan-300/60 pl-4`), and `<a href={source.url} target="_blank" rel="noreferrer">Ler na fonte · {publisher}</a>`.
- When `post.items.length === 0`, render `post.brief` split on blank lines as paragraphs (legacy).

Tailwind follows `app/briefing/page.tsx` (rounded-[26px] cards, `border-zinc-800`, `bg-zinc-950/70`, cyan accents, `style={{ fontFamily: 'var(--font-display)' }}` on display headings).

- [ ] **Step 3: `app/newsletter/[slug]/ShareButtons.tsx`** (`'use client'`)

Props: `{ links: { whatsapp: string; x: string; linkedin: string; url: string } }`. Buttons: WhatsApp, X, LinkedIn (anchors, `target="_blank" rel="noreferrer"`) and "Copiar link" (`navigator.clipboard.writeText(url)` inside try/catch, shows "Copiado" for 2 s via `useState` + `setTimeout`). Use `MessageCircle` from lucide for WhatsApp and `XIcon`/`LinkedinIcon` from `SocialIcons`.

- [ ] **Step 4: `app/newsletter/[slug]/page.tsx`**

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { BrandMark } from '../../components/BrandMark';
import SubscribeForm from '../../briefing/SubscribeForm';
import EditionItems from '../EditionItems';
import ShareButtons from './ShareButtons';
import { formatEditionDate, shareLinks } from '@/lib/briefing/edition';
import { getAdjacentEditions, getPublishedBriefingBySlug } from '@/lib/briefing/posts';

export const revalidate = 1800;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBriefingBySlug(slug);
  if (!post) return { title: 'Edição não encontrada - Thiagao Ai Daily' };
  return {
    title: `${post.title} - Thiagao Ai Daily`,
    description: post.dek,
    alternates: { canonical: `/newsletter/${post.slug}` },
    openGraph: { type: 'article', title: post.title, description: post.dek, url: `/newsletter/${post.slug}`, publishedTime: post.publishedAt ?? undefined, images: ['/og/home.jpg'] },
    twitter: { card: 'summary_large_image', title: post.title, description: post.dek, images: ['/og/home.jpg'] },
  };
}

export default async function EditionPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedBriefingBySlug(slug);
  if (!post) notFound();
  const { previous, next } = await getAdjacentEditions(post);
  const links = shareLinks(post, 'page');
  return (
    <main className="min-h-screen bg-black text-white">
      {/* nav: BrandMark + "Thiagao Ai" (Link "/"), right: Link "/newsletter#briefings" "Todas as edições", anchor "#assinar" "Assinar" */}
      {/* header: pill "Thiagao Ai Daily · {formatEditionDate(post.publishedAt)}", h1 post.title (font-display), p post.dek, meta "{post.readingMinutes} min · {post.items.length} notícias" */}
      {/* <ShareButtons links={links} /> */}
      {/* <EditionItems post={post} /> */}
      {/* "Take do dia" card: post.takeaway */}
      {/* second share row + "Encaminhe para alguém que acompanha IA." */}
      {/* prev/next: Link to /newsletter/{previous.slug} (ArrowLeft + title) and /newsletter/{next.slug} (title + ArrowRight) when present */}
      {/* <section id="assinar"> short pitch + <SubscribeForm source="edition-page" /> */}
    </main>
  );
}
```

Fill the JSX following the classes used in `app/newsletter/obrigado/page.tsx` for nav/background and `app/briefing/page.tsx` for cards.

- [ ] **Step 5: Verify locally**

Start the dev server (without `LOCAL_DEMO_DB`, so the bundled fallback posts are served): `npm run dev` in the background, then:

```bash
curl -s http://localhost:3002/newsletter/agentic-ops-briefing | grep -c "Take do dia"   # expect 1
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3002/newsletter/nope          # expect 404
```

- [ ] **Step 6: Lint, type-check, commit**

```bash
git add app/newsletter app/components/SocialIcons.tsx app/briefing/page.tsx
git commit -m "Add the edition page with share buttons and prev/next navigation"
```

### Task 12: Newsletter page, home link, sitemap

**Files:**
- Modify: `app/briefing/page.tsx` (featured block ~L667-700, archive cards ~L703-719, "Dias anteriores" ~L829-856, `recurringCadence` L197-222 and its box ~L862-892)
- Modify: `app/components/home/HomePage.tsx` (the single `href={`/newsletter#${post.slug}`}`)
- Modify: `app/sitemap.ts`

- [ ] **Step 1: Featured block**

Replace the `featured.brief` paragraph with `<EditionItems post={featured} compact />` followed by `<Link href={`/newsletter/${featured.slug}`}>Ler a edição completa →</Link>`. Add the date (`formatEditionDate(featured.publishedAt)`) next to the category pill. Keep the right-hand "Take principal" card.

- [ ] **Step 2: Archive cards and "Dias anteriores"**

Wrap each archive `<article>` in `<Link href={`/newsletter/${post.slug}`} className="block">` (keep the inner markup; change "Ler briefing" to "Ler edição"). Same for the "Dias anteriores" entries.

- [ ] **Step 3: Replace the weekly cadence box**

`recurringCadence` becomes:

```ts
const editionAnatomy = [
  { label: 'Manchete', title: 'O fato do dia', text: 'A notícia que puxa a edição, com contexto e fonte.' },
  { label: 'Notícias', title: '5 a 7 histórias, fontes diferentes', text: 'Modelos, open source, agentes, ferramentas, mercado, hardware e regulação. Nunca só ChatGPT.' },
  { label: 'Para testar hoje', title: 'Uma ferramenta', text: 'Algo que você consegue abrir e experimentar no mesmo dia.' },
  { label: 'Take do dia', title: 'O que fazer com isso', text: 'Uma ou duas frases acionáveis para dev, criador ou negócio.' },
  { label: 'Compartilhar', title: 'Pronto para encaminhar', text: 'Link da edição e texto curto para WhatsApp, X e LinkedIn.' },
];
```

Box heading: "Recorrência diária" / "O que vem em cada edição." Replace `item.day` with `item.label`.

- [ ] **Step 4: Home link and sitemap**

`HomePage.tsx`: `href={`/newsletter#${post.slug}`}` → `href={`/newsletter/${post.slug}`}`. Nothing else in that file.

`app/sitemap.ts` (keep the existing four entries and the `https://thiagao.io` base, which matches `metadataBase` in `app/layout.tsx`):

```ts
import type { MetadataRoute } from 'next';
import { getPublishedBriefings } from '@/lib/briefing/posts';

const siteUrl = 'https://thiagao.io';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { posts } = await getPublishedBriefings({ limit: 60 });
  return [
    /* the four existing entries unchanged */,
    ...posts.map((post) => ({
      url: `${siteUrl}/newsletter/${post.slug}`,
      lastModified: new Date(post.publishedAt ?? post.createdAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
```

- [ ] **Step 5: Lint, type-check, commit**

```bash
git add app/briefing/page.tsx app/components/home/HomePage.tsx app/sitemap.ts
git commit -m "Link editions from the newsletter page, home and sitemap"
```

### Task 13: Admin controls for today's edition

**Files:**
- Modify: `app/admin/newsletter/AdminNewsletterClient.tsx`

- [ ] **Step 1: Add state and handler**

```ts
const [editionBusy, setEditionBusy] = useState<'preview' | 'send' | null>(null);
const [editionResult, setEditionResult] = useState('');

async function runEdition(mode: 'preview' | 'send') {
  if (mode === 'send' && !window.confirm('Isso cria uma edição nova agora e envia o email para TODOS os assinantes ativos, mesmo que a edição de hoje já tenha saído. Continuar?')) return;
  setEditionBusy(mode);
  setEditionResult('');
  try {
    const response = await fetch('/api/agent/daily-digest', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(mode === 'preview' ? { dryRun: true } : { force: true }),
    });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.message ?? data.email?.reason ?? 'Falhou.');
    const draft = data.draft ?? data.post;
    const lines = [
      `Redator: ${data.writer}`,
      `Manchete: ${draft?.title ?? '-'}`,
      `Assunto: ${draft?.subject ?? '-'}`,
      ...((draft?.items ?? []) as { title: string; source: { publisher: string } }[]).map((item, index) => `${index + 1}. ${item.title} (${item.source.publisher})`),
      ...(data.email ? [`Email: ${data.email.sent ? `${data.email.delivered} enviados` : data.email.reason}`] : []),
      '',
      ...((data.notes ?? data.run?.notes ?? []) as string[]),
    ];
    setEditionResult(lines.join('\n'));
    if (mode === 'send') router.refresh();
  } catch (error) {
    setEditionResult(error instanceof Error ? error.message : 'Falhou.');
  } finally {
    setEditionBusy(null);
  }
}
```

(`router` already exists in the component if it uses `useRouter`; otherwise add it.)

- [ ] **Step 2: Add the section** above the drafts list: heading "Edição de hoje", helper text "A pré-visualização roda o coletor e o redator (uma chamada ao DeepSeek) sem gravar nada.", two buttons ("Pré-visualizar", "Gerar, publicar e enviar agora"), and a `<pre className="whitespace-pre-wrap …">` with `editionResult`. In each draft card show `draft.subject` (when present) and `${draft.items.length} notícias`.

- [ ] **Step 3: Lint, commit**

```bash
git add app/admin/newsletter/AdminNewsletterClient.tsx
git commit -m "Let the admin preview or trigger today's edition"
```

### Task 14: Workflow keepalive, config status, docs

**Files:**
- Modify: `.github/workflows/daily-briefing.yml`, `lib/briefing/config.ts`, `docs/newsletter-briefing.md`, `README.md` (Newsletter paragraph)

- [ ] **Step 1: Workflow**

Full file:

```yaml
name: Daily Thiagao Ai Edition

on:
  workflow_dispatch:
    inputs:
      dry_run:
        description: Run the agent without saving, publishing, or sending email.
        required: false
        type: boolean
        default: false
      force:
        description: Create and send a new edition even if today's already went out (emails everyone again).
        required: false
        type: boolean
        default: false
  schedule:
    # GitHub cron runs in UTC. This runs around 5 PM New York across DST.
    # The agent endpoint is idempotent for the New York day (and resends an unsent
    # edition), so the duplicated hour is safe.
    - cron: '0 21,22 * * *'

permissions:
  contents: read
  actions: write

jobs:
  publish-and-send:
    runs-on: ubuntu-latest
    steps:
      - name: Check New York time
        id: time
        run: |
          HOUR=$(TZ=America/New_York date +%H)
          SHOULD_RUN=false
          if [ "${{ github.event_name }}" = "workflow_dispatch" ]; then
            SHOULD_RUN=true
          elif [ "$HOUR" -ge 17 ] && [ "$HOUR" -le 23 ]; then
            SHOULD_RUN=true
          fi
          echo "should_run=$SHOULD_RUN" >> "$GITHUB_OUTPUT"
          echo "New York hour: $HOUR / should run: $SHOULD_RUN"

      - name: Call the edition agent
        if: steps.time.outputs.should_run == 'true'
        run: |
          DRY_RUN="${{ inputs.dry_run || false }}"
          FORCE="${{ inputs.force || false }}"
          curl --fail-with-body --max-time 300 -X POST "${{ secrets.BRIEFING_AGENT_URL }}" \
            -H "Authorization: Bearer ${{ secrets.AGENT_CRON_SECRET }}" \
            -H "Content-Type: application/json" \
            --data "{\"force\":$FORCE,\"dryRun\":$DRY_RUN}"

      # GitHub disables cron workflows after 60 days without repository activity
      # (this one was disabled that way on 2026-06-29). Re-enabling it on every run resets the clock.
      - name: Keep the schedule enabled
        if: always()
        uses: gautamkrishnar/keepalive-workflow@v2
        with:
          use_api: true
```

- [ ] **Step 2: Config status**

In `getBriefingConfigStatus()` add checks `writerApiKey: Boolean(process.env.NEWSLETTER_WRITER_API_KEY || process.env.DEEPSEEK_API_KEY)` and `unsubscribeSecret: Boolean(process.env.NEWSLETTER_UNSUBSCRIBE_SECRET || process.env.AGENT_CRON_SECRET)`, plus `ready.writer` and `ready.unsubscribe`.

- [ ] **Step 3: Docs**

Rewrite `docs/newsletter-briefing.md`: what an edition is; the pipeline (collect → dedupe → rank → write → publish → send); env vars (existing + new); migration 009; how the writer falls back; how to test locally (`LOCAL_DEMO_DB=1 npm run dev`, then `curl -X POST localhost:3002/api/agent/daily-digest -H 'content-type: application/json' -d '{"dryRun":true}'`); admin buttons; unsubscribe; cron re-enable (`gh workflow enable daily-briefing.yml`) and the keepalive; manual steps (Supabase restore, Dokploy vars, merge). Replace `/newslatter` with `/newsletter`. Update the README "Newsletter" paragraph to say "edição diária" and link the doc.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/daily-briefing.yml lib/briefing/config.ts docs/newsletter-briefing.md README.md
git commit -m "Keep the daily cron alive and document the new edition pipeline"
```

### Task 15: End-to-end verification

- [ ] **Step 1:** `npm run check` (lint + tests + build). Expected: all green. Stop any running `next dev` first.
- [ ] **Step 2:** With no LLM key: `LOCAL_DEMO_DB=1 npm run dev` (background) then `curl -s -X POST localhost:3002/api/agent/daily-digest -H 'content-type: application/json' -d '{"dryRun":true}' | head -c 3000`. Expected: `"writer":"fallback"`, a draft with ≥ 3 items from distinct hosts, notes listing the window and any feed failures.
- [ ] **Step 3:** `curl -s -X POST localhost:3002/api/agent/daily-digest -H 'content-type: application/json' -d '{}'` → creates and publishes `daily-<today>` in `.data/local-db.json` (email `skipped: true`, no Resend key); a second call returns `skipped: true` (because `hasSentCampaign` is false it would try to resend, and with no key returns `skipped` → confirm the response says `resent: true` with `email.skipped: true`). Then `curl -s http://localhost:3002/newsletter/daily-<today> | grep -c "Take do dia"` → `1`, and `curl -s http://localhost:3002/newsletter | grep -c "Ler a edição completa"` → `1`.
- [ ] **Step 4:** `.data/` is git-ignored (check `.gitignore`); leave the local row in place or delete it, either is fine.
- [ ] **Step 5:** Push the branch and open a PR whose body carries the spec's section 14 as the "after merge" checklist.
