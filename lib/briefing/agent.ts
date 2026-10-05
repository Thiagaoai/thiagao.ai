import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import type { EditionMemory } from './memory';
import { getRecentEditionMemory } from './posts';
import { selectPool, type Candidate } from './ranking';
import { feedSources, guessCategory, type FeedSource } from './sources';
import { composeDraftInput, writeEdition, type WriterResult } from './writer';
import type { AgentRunRecord, BriefingDraftInput } from './types';

type CollectionResult = {
  items: Candidate[];
  notes: string[];
};

type PerplexitySearchResult = {
  title?: string;
  url?: string;
  date?: string;
  last_updated?: string;
  snippet?: string;
};

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

function stripCdata(value: string) {
  return value.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();
}

function decodeXml(value: string) {
  return stripCdata(value)
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replace(/&#(?:x([0-9a-f]+)|(\d+));/gi, (entity, hex: string | undefined, decimal: string | undefined) => {
      const code = hex ? Number.parseInt(hex, 16) : Number(decimal);
      return Number.isInteger(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : entity;
    })
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function readTag(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? decodeXml(match[1]) : '';
}

function parseDate(value?: string | null) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function truncate(value: string, max = 420) {
  const clean = value.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 3).trim()}...` : clean;
}

function hostnameFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'fonte';
  }
}

async function fetchFeed(source: FeedSource): Promise<Candidate[]> {
  const response = await fetch(source.url, {
    headers: {
      'user-agent': 'ThiagaoAiBriefingBot/1.0 (+https://thiagao.io)',
    },
    next: { revalidate: 0 },
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`${source.name} feed returned ${response.status}`);
  }

  const xml = await response.text();
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? xml.match(/<entry[\s\S]*?<\/entry>/gi) ?? [];

  return itemBlocks.slice(0, 10).map((itemXml) => {
    const title = readTag(itemXml, 'title') || 'Untitled update';
    const url = readTag(itemXml, 'link') || itemXml.match(/<link[^>]+href="([^"]+)"/i)?.[1] || source.url;
    const summary = readTag(itemXml, 'description') || readTag(itemXml, 'summary') || readTag(itemXml, 'content') || title;
    const publishedAt = readTag(itemXml, 'pubDate') || readTag(itemXml, 'published') || readTag(itemXml, 'updated');

    return {
      title,
      url,
      publisher: source.name,
      publishedAt: parseDate(publishedAt),
      category: source.category,
      summary,
      provider: 'rss' as const,
      reliability: source.reliability,
      general: source.general,
      score: 0,
    };
  });
}

async function fetchPerplexity(): Promise<CollectionResult> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    return {
      items: [],
      notes: ['Perplexity skipped: PERPLEXITY_API_KEY is not configured.'],
    };
  }

  const response = await fetch('https://api.perplexity.ai/v1/sonar', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.PERPLEXITY_MODEL || 'sonar-pro',
      messages: [
        {
          role: 'system',
          content:
            'Você é um pesquisador de newsletter sobre inteligência artificial. Liste apenas fatos recentes e verificáveis, com fontes primárias (blogs oficiais, repositórios, papers, veículos confiáveis).',
        },
        {
          role: 'user',
          content:
            'Quais foram as notícias mais importantes de inteligência artificial nas últimas 24 horas? Inclua lançamentos de modelos e produtos, pesquisa com aplicação prática, open source, movimentos de mercado, regulação e ferramentas novas. Para cada uma, título claro e fonte.',
        },
      ],
      search_recency_filter: 'day',
      return_images: false,
      max_tokens: 900,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    return {
      items: [],
      notes: [`Perplexity returned ${response.status}.`],
    };
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
    search_results?: PerplexitySearchResult[];
    citations?: string[];
  };
  const answer = payload.choices?.[0]?.message?.content ?? '';
  const searchResults: PerplexitySearchResult[] = payload.search_results?.length
    ? payload.search_results
    : (payload.citations ?? []).map((url) => ({ title: url, url }));

  return {
    items: searchResults.slice(0, 8).flatMap((result): Candidate[] => {
      if (!result.url) return [];
      const title = result.title || result.url;
      const snippet = result.snippet ?? '';

      return [
        {
          title,
          url: result.url,
          publisher: hostnameFromUrl(result.url),
          publishedAt: parseDate(result.date || result.last_updated),
          category: guessCategory(`${title} ${snippet}`),
          summary: snippet || answer || title,
          provider: 'perplexity',
          reliability: 74,
          score: 0,
        },
      ];
    }),
    notes: [`Perplexity collected ${searchResults.length} search results from the last 24 hours.`],
  };
}

async function fetchXSignals(now: Date): Promise<CollectionResult> {
  const bearerToken = process.env.X_BEARER_TOKEN || process.env.TWITTER_BEARER_TOKEN;
  if (!bearerToken) {
    return {
      items: [],
      notes: ['X skipped: X_BEARER_TOKEN/TWITTER_BEARER_TOKEN is not configured.'],
    };
  }

  const startTime = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString().replace(/\.\d{3}Z$/, 'Z');
  const params = new URLSearchParams({
    query: '(AI OR LLM OR "open source model" OR agents OR OpenAI OR Anthropic OR Gemini OR DeepSeek) lang:en -is:retweet -is:reply',
    max_results: '10',
    start_time: startTime,
    expansions: 'author_id',
    'tweet.fields': 'author_id,created_at,lang,public_metrics',
    'user.fields': 'name,username,verified',
  });
  const response = await fetch(`https://api.x.com/2/tweets/search/recent?${params.toString()}`, {
    headers: {
      authorization: `Bearer ${bearerToken}`,
    },
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    return {
      items: [],
      notes: [`X returned ${response.status}.`],
    };
  }

  const payload = (await response.json()) as {
    data?: {
      id: string;
      text: string;
      author_id?: string;
      created_at?: string;
      public_metrics?: { like_count?: number; repost_count?: number; reply_count?: number; quote_count?: number };
    }[];
    includes?: { users?: { id: string; name: string; username: string }[] };
  };
  const users = new Map((payload.includes?.users ?? []).map((user) => [user.id, user]));
  const posts = payload.data ?? [];

  const items = posts.flatMap((post): Candidate[] => {
    const author = post.author_id ? users.get(post.author_id) : undefined;
    const username = author?.username;
    const metrics = post.public_metrics;
    const engagement =
      (metrics?.like_count ?? 0) + (metrics?.repost_count ?? 0) * 2 + (metrics?.reply_count ?? 0) + (metrics?.quote_count ?? 0);
    if (engagement < 50) return [];

    return [
      {
        title: truncate(post.text.replace(/\n/g, ' '), 120),
        url: username ? `https://x.com/${username}/status/${post.id}` : `https://x.com/i/web/status/${post.id}`,
        publisher: username ? `X @${username}` : 'X',
        publishedAt: parseDate(post.created_at),
        category: guessCategory(post.text),
        summary: `${truncate(post.text, 360)} Engagement score: ${engagement}.`,
        provider: 'x',
        reliability: 55,
        score: 0,
      },
    ];
  });

  return {
    items,
    notes: [`X collected ${posts.length} recent posts, kept ${items.length} with engagement >= 50.`],
  };
}

function errorMessage(reason: unknown) {
  return reason instanceof Error ? reason.message : String(reason);
}

// A collector that throws (network, DNS, timeout, bad JSON) becomes a note; the run continues with the other sources.
function settledCollection(label: string, result: PromiseSettledResult<CollectionResult>): CollectionResult {
  return result.status === 'fulfilled' ? result.value : { items: [], notes: [`${label} failed: ${errorMessage(result.reason)}.`] };
}

const collect = async (state: typeof AgentState.State) => {
  const [perplexityResult, xResult, feeds] = await Promise.all([
    Promise.allSettled([fetchPerplexity()]).then(([result]) => result),
    Promise.allSettled([fetchXSignals(new Date(state.now))]).then(([result]) => result),
    Promise.allSettled(feedSources.map(fetchFeed)),
  ]);
  const perplexity = settledCollection('Perplexity', perplexityResult);
  const x = settledCollection('X', xResult);
  const feedItems = feeds.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
  const failures = feeds
    .map((result, index) => ({ result, source: feedSources[index] }))
    .filter(({ result }) => result.status === 'rejected')
    .map(({ result, source }) => `${source.name}: ${(result as PromiseRejectedResult).reason}`);
  return {
    items: [...perplexity.items, ...x.items, ...feedItems],
    notes: [
      ...perplexity.notes,
      ...x.notes,
      `RSS collected ${feedItems.length} items from ${feedSources.length - failures.length}/${feedSources.length} feeds.`,
      ...failures,
    ],
  };
};

const rank = async (state: typeof AgentState.State) => {
  const memory = await getRecentEditionMemory();
  const { pool, notes } = selectPool(state.items, memory, new Date(state.now));
  return { pool, memory, notes: [memory.note, ...notes] };
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

const graph = new StateGraph(AgentState)
  .addNode('collect', collect)
  .addNode('rank', rank)
  .addNode('write', write)
  .addEdge(START, 'collect')
  .addEdge('collect', 'rank')
  .addEdge('rank', 'write')
  .addEdge('write', END)
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
