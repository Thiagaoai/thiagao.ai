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
      .replace(/[\u0300-\u036f]/g, '')
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
