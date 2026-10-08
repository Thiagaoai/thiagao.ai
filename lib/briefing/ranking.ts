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
  // No ceiling: reliabilities sit at 78–92, so a cap at 99 would make every item with two signal words tie.
  return Math.max(0, Math.round(score));
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
