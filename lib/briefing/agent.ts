import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import type { BriefingDraftInput, BriefingSource, BriefingTag } from './types';

type FeedSource = {
  name: string;
  url: string;
  category: BriefingTag;
  reliability: number;
};

type SourceItem = BriefingSource & {
  category: BriefingTag;
  score: number;
  summary: string;
  provider: 'rss' | 'perplexity' | 'x';
};

type CollectionResult = {
  items: SourceItem[];
  notes: string[];
};

type PerplexitySearchResult = {
  title?: string;
  url?: string;
  date?: string;
  last_updated?: string;
  snippet?: string;
};

type DailyTheme = {
  label: string;
  category: BriefingTag;
  query: string;
  xQuery: string;
  keywords: string[];
  trustedDomains: string[];
};

const feedSources: FeedSource[] = [
  { name: 'OpenAI', url: 'https://openai.com/news/rss.xml', category: 'AI', reliability: 94 },
  { name: 'Google AI', url: 'https://blog.google/technology/ai/rss/', category: 'BigTech', reliability: 93 },
  { name: 'Google DeepMind', url: 'https://deepmind.google/blog/rss.xml', category: 'AI', reliability: 92 },
  { name: 'Anthropic', url: 'https://www.anthropic.com/news/rss.xml', category: 'AI', reliability: 92 },
  { name: 'Meta AI', url: 'https://ai.meta.com/blog/rss/', category: 'BigTech', reliability: 90 },
  { name: 'Microsoft AI', url: 'https://blogs.microsoft.com/ai/feed/', category: 'BigTech', reliability: 90 },
  { name: 'Mistral AI', url: 'https://mistral.ai/news/rss.xml', category: 'AI', reliability: 89 },
  { name: 'Hugging Face', url: 'https://huggingface.co/blog/feed.xml', category: 'AI', reliability: 88 },
  { name: 'LangChain', url: 'https://blog.langchain.com/rss/', category: 'Agents', reliability: 88 },
  { name: 'n8n', url: 'https://blog.n8n.io/rss/', category: 'Automacao', reliability: 86 },
  { name: 'GitHub Blog', url: 'https://github.blog/feed/', category: 'DevTools', reliability: 87 },
  { name: 'Vercel', url: 'https://vercel.com/blog/rss.xml', category: 'DevTools', reliability: 84 },
  { name: 'NVIDIA', url: 'https://blogs.nvidia.com/feed/', category: 'Hardware', reliability: 91 },
  { name: 'Cloudflare', url: 'https://blog.cloudflare.com/rss/', category: 'Infra', reliability: 88 },
  { name: 'Supabase', url: 'https://supabase.com/blog/rss.xml', category: 'Infra', reliability: 84 },
  { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', category: 'Startups', reliability: 78 },
  { name: 'MIT Technology Review AI', url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed/', category: 'AI', reliability: 80 },
  { name: 'VentureBeat AI', url: 'https://venturebeat.com/category/ai/feed/', category: 'Startups', reliability: 76 },
  { name: 'Hacker News AI', url: 'https://hnrss.org/newest?q=AI', category: 'DevTools', reliability: 72 },
];

const dailyThemes: DailyTheme[] = [
  {
    label: 'Domingo: ferramentas para comecar e criar',
    category: 'AI',
    query: 'fresh AI tools for beginners creators productivity and practical use this week',
    xQuery: '(AI tools OR new AI app OR creator AI OR productivity AI)',
    keywords: ['tool', 'creator', 'productivity', 'beginner', 'workflow', 'app'],
    trustedDomains: ['producthunt.com', 'techcrunch.com', 'theverge.com', 'huggingface.co', 'github.com'],
  },
  {
    label: 'Segunda: modelos, labs e big tech',
    category: 'BigTech',
    query: 'latest AI model launches and big tech AI announcements this week',
    xQuery: '(AI model OR model launch OR Google AI OR Meta AI OR Microsoft AI OR OpenAI OR Anthropic)',
    keywords: ['model', 'launch', 'benchmark', 'openai', 'google', 'meta', 'anthropic', 'microsoft'],
    trustedDomains: ['openai.com', 'anthropic.com', 'deepmind.google', 'ai.meta.com', 'blogs.microsoft.com', 'mistral.ai'],
  },
  {
    label: 'Terca: agentes autonomos e automacao',
    category: 'Agents',
    query:
      'latest autonomous AI agents workflows MCP agent tools automation Hermes Nous OpenClaw Claude Code ChatGPT agents this week',
    xQuery:
      '(AI agents OR autonomous agents OR MCP OR agent workflow OR OpenClaw OR Nous Hermes OR Claude Code OR ChatGPT Agent)',
    keywords: ['agent', 'agents', 'autonomous', 'mcp', 'workflow', 'automation', 'tool use', 'hermes', 'openclaw'],
    trustedDomains: ['langchain.com', 'n8n.io', 'github.com', 'anthropic.com', 'openai.com', 'vercel.com', 'nousresearch.com'],
  },
  {
    label: 'Quarta: devtools, coding e produto',
    category: 'DevTools',
    query: 'fresh AI coding devtools developer productivity product engineering news this week',
    xQuery: '(AI coding OR devtools OR GitHub Copilot OR Cursor OR Claude Code OR Codex OR developer AI)',
    keywords: ['coding', 'developer', 'devtools', 'copilot', 'codex', 'cursor', 'product'],
    trustedDomains: ['github.blog', 'vercel.com', 'cloudflare.com', 'openai.com', 'anthropic.com'],
  },
  {
    label: 'Quinta: open source e modelos internacionais',
    category: 'AI',
    query: 'latest open source AI models Chinese AI models Kimi DeepSeek Qwen Z.ai MiniMax this week',
    xQuery: '(open source AI OR DeepSeek OR Qwen OR Kimi OR MiniMax OR Z.ai OR GLM OR open weights)',
    keywords: ['open source', 'open weights', 'deepseek', 'qwen', 'kimi', 'minimax', 'z.ai', 'glm'],
    trustedDomains: ['huggingface.co', 'github.com', 'arxiv.org', 'deepseek.com', 'alibabacloud.com', 'moonshot.ai'],
  },
  {
    label: 'Sexta: negocio, startups e mercado',
    category: 'Startups',
    query: 'AI startups funding business adoption enterprise AI market news this week',
    xQuery: '(AI startup OR enterprise AI OR AI funding OR AI business OR AI adoption)',
    keywords: ['startup', 'funding', 'enterprise', 'business', 'market', 'adoption', 'revenue'],
    trustedDomains: ['techcrunch.com', 'theinformation.com', 'semianalysis.com', 'a16z.com', 'cbinsights.com'],
  },
  {
    label: 'Sabado: hardware, infra e seguranca',
    category: 'Hardware',
    query: 'latest AI hardware GPU infrastructure inference chips cloud security news this week',
    xQuery: '(AI hardware OR GPU OR inference OR AI infra OR AI security OR NVIDIA OR AMD)',
    keywords: ['gpu', 'hardware', 'inference', 'chip', 'infra', 'security', 'cloud'],
    trustedDomains: ['nvidia.com', 'amd.com', 'cloudflare.com', 'semianalysis.com', 'theregister.com'],
  },
];

const signalKeywords = [
  'agent',
  'agents',
  'ai',
  'automation',
  'model',
  'mcp',
  'llm',
  'workflow',
  'developer',
  'gpu',
  'hardware',
  'security',
  'open source',
  'langgraph',
  'evaluation',
  'tool',
  'api',
  'release',
  'launch',
  'research',
  'startup',
  'funding',
  'deepseek',
  'qwen',
  'kimi',
  'minimax',
  'z.ai',
  'hermes',
  'nous',
  'openclaw',
];

const AgentState = Annotation.Root({
  items: Annotation<SourceItem[]>({
    reducer: (_left, right) => right,
    default: () => [],
  }),
  ranked: Annotation<SourceItem[]>({
    reducer: (_left, right) => right,
    default: () => [],
  }),
  drafts: Annotation<BriefingDraftInput[]>({
    reducer: (_left, right) => right,
    default: () => [],
  }),
  notes: Annotation<string[]>({
    reducer: (left, right) => left.concat(right),
    default: () => [],
  }),
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
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function readTag(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? decodeXml(match[1]) : '';
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 72);
}

function getNewYorkDate() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).formatToParts(new Date());
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? '';

  return {
    label: `${value('year')}-${value('month')}-${value('day')}`,
    weekday: new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short' }).format(new Date()),
  };
}

function getDailyTheme() {
  const day = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })).getDay();

  return dailyThemes[day] ?? dailyThemes[0];
}

function getAgeInDays(publishedAt?: string) {
  if (!publishedAt) return 3;
  const timestamp = new Date(publishedAt).getTime();
  if (Number.isNaN(timestamp)) return 7;

  return Math.max(0, (Date.now() - timestamp) / 86_400_000);
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

function scoreItem(item: Pick<SourceItem, 'title' | 'summary' | 'category' | 'publishedAt' | 'provider' | 'publisher'>, theme: DailyTheme) {
  const text = `${item.title} ${item.summary}`.toLowerCase();
  const signalScore = signalKeywords.reduce((score, keyword) => {
    return text.includes(keyword) ? score + 7 : score;
  }, 42);
  const themeScore = theme.keywords.reduce((score, keyword) => {
    return text.includes(keyword.toLowerCase()) ? score + 10 : score;
  }, item.category === theme.category ? 18 : 0);
  const freshnessScore = Math.max(0, 22 - Math.floor(getAgeInDays(item.publishedAt) * 3));
  const providerScore = item.provider === 'perplexity' ? 12 : item.provider === 'x' ? 7 : 0;
  const sourcePenalty = item.publisher === 'OpenAI' && theme.category !== 'AI' && theme.category !== 'BigTech' ? -18 : 0;

  return Math.max(0, Math.min(99, signalScore + themeScore + freshnessScore + providerScore + sourcePenalty));
}

async function fetchFeed(source: FeedSource): Promise<SourceItem[]> {
  const response = await fetch(source.url, {
    headers: {
      'user-agent': 'ThigaoAiBriefingBot/1.0 (+https://thiagao.io)',
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`${source.name} feed returned ${response.status}`);
  }

  const xml = await response.text();
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? xml.match(/<entry[\s\S]*?<\/entry>/gi) ?? [];

  return itemBlocks.slice(0, 8).map((itemXml) => {
    const title = readTag(itemXml, 'title') || 'Untitled update';
    const url = readTag(itemXml, 'link') || itemXml.match(/<link[^>]+href="([^"]+)"/i)?.[1] || source.url;
    const summary = readTag(itemXml, 'description') || readTag(itemXml, 'summary') || readTag(itemXml, 'content') || title;
    const publishedAt = readTag(itemXml, 'pubDate') || readTag(itemXml, 'published') || readTag(itemXml, 'updated');
    const base = {
      title,
      url,
      publisher: source.name,
      publishedAt: parseDate(publishedAt),
      category: source.category,
      summary,
      provider: 'rss' as const,
    };

    return {
      ...base,
      score: Math.min(99, source.reliability),
    };
  });
}

async function fetchPerplexity(theme: DailyTheme): Promise<CollectionResult> {
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
            'Voce e um pesquisador de newsletter. Busque somente novidades recentes, verificaveis e relevantes. Prefira fontes primarias, docs oficiais, blogs de empresas, repositorios, papers e veiculos de tecnologia confiaveis.',
        },
        {
          role: 'user',
          content: `Encontre ate 6 novidades frescas para hoje sobre: ${theme.query}. Para cada uma, priorize titulo claro, fonte confiavel e por que importa para pessoas e negocios.`,
        },
      ],
      search_domain_filter: theme.trustedDomains.slice(0, 10),
      search_recency_filter: 'week',
      return_images: false,
      max_tokens: 800,
    }),
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
    items: searchResults.slice(0, 8).flatMap((result) => {
      if (!result.url) return [];
      const title = result.title || result.url;
      const summary = result.snippet || answer || title;

      return [
        {
          title,
          url: result.url,
          publisher: `Perplexity: ${hostnameFromUrl(result.url)}`,
          publishedAt: parseDate(result.date || result.last_updated),
          category: theme.category,
          summary,
          score: 0,
          provider: 'perplexity' as const,
        },
      ];
    }),
    notes: [`Perplexity collected ${searchResults.length} search results for ${theme.label}.`],
  };
}

async function fetchXSignals(theme: DailyTheme): Promise<CollectionResult> {
  const bearerToken = process.env.X_BEARER_TOKEN || process.env.TWITTER_BEARER_TOKEN;
  if (!bearerToken) {
    return {
      items: [],
      notes: ['X skipped: X_BEARER_TOKEN/TWITTER_BEARER_TOKEN is not configured.'],
    };
  }

  const startTime = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().replace(/\.\d{3}Z$/, 'Z');
  const params = new URLSearchParams({
    query: `${theme.xQuery} lang:en -is:retweet`,
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

  return {
    items: posts.map((post) => {
      const author = post.author_id ? users.get(post.author_id) : undefined;
      const username = author?.username;
      const metrics = post.public_metrics;
      const engagement =
        (metrics?.like_count ?? 0) + (metrics?.repost_count ?? 0) * 2 + (metrics?.reply_count ?? 0) + (metrics?.quote_count ?? 0);
      const title = truncate(post.text.replace(/\n/g, ' '), 120);

      return {
        title,
        url: username ? `https://x.com/${username}/status/${post.id}` : `https://x.com/i/web/status/${post.id}`,
        publisher: username ? `X @${username}` : 'X',
        publishedAt: parseDate(post.created_at),
        category: theme.category,
        summary: `${truncate(post.text, 360)} Engagement score: ${engagement}.`,
        score: Math.min(99, 48 + Math.floor(Math.log10(Math.max(1, engagement)) * 12)),
        provider: 'x' as const,
      };
    }),
    notes: [`X collected ${posts.length} recent posts for ${theme.label}.`],
  };
}

function rankItems(items: SourceItem[], theme: DailyTheme) {
  const deduped = items.filter((item, index, arr) => {
    const urlKey = item.url.replace(/#.*$/, '').replace(/\?.*$/, '');
    return arr.findIndex((candidate) => candidate.url.replace(/#.*$/, '').replace(/\?.*$/, '') === urlKey) === index;
  });
  const freshEnough = deduped.filter((item) => item.provider !== 'rss' || getAgeInDays(item.publishedAt) <= 21);
  const candidates = freshEnough.length >= 5 ? freshEnough : deduped;
  const scored = candidates
    .map((item) => ({
      ...item,
      score: Math.max(item.score, scoreItem(item, theme)),
    }))
    .sort((a, b) => b.score - a.score);
  const publisherCounts = new Map<string, number>();
  const ranked: SourceItem[] = [];

  for (const item of scored) {
    const maxPerPublisher = item.publisher.includes('OpenAI') ? 1 : 2;
    const current = publisherCounts.get(item.publisher) ?? 0;
    if (current >= maxPerPublisher) continue;

    ranked.push(item);
    publisherCounts.set(item.publisher, current + 1);
    if (ranked.length >= 12) break;
  }

  return ranked;
}

function providerLabel(item: SourceItem) {
  if (item.provider === 'perplexity') return 'pesquisa Perplexity com fontes';
  if (item.provider === 'x') return 'sinal recente do X/Twitter';
  return `fonte RSS ${item.publisher}`;
}

function signalLine(item: SourceItem, index: number) {
  const verificationNote =
    item.provider === 'x'
      ? ' Use como sinal social e confirme em fonte primaria antes de tomar decisao.'
      : ' Fonte verificavel incluida para checagem.';

  return `${index + 1}. ${item.title} - ${truncate(item.summary, 260)} Fonte: ${item.publisher}.${verificationNote}`;
}

function collectTags(items: SourceItem[], theme: DailyTheme) {
  return Array.from(
    new Set([
      theme.category,
      ...items.map((item) => item.category),
      'WeeklyNews',
      ...signalKeywords
        .filter((keyword) => items.some((item) => `${item.title} ${item.summary}`.toLowerCase().includes(keyword)))
        .slice(0, 5),
    ]),
  );
}

function groupIntoDrafts(items: SourceItem[], theme: DailyTheme) {
  const topItems = items
    .sort((a, b) => b.score - a.score)
    .filter((item, index, arr) => arr.findIndex((candidate) => candidate.url === item.url) === index)
    .slice(0, 6);

  if (topItems.length === 0) return [];

  const date = getNewYorkDate().label;
  const themeName = theme.label.split(':')[0];
  const averageScore = Math.round(topItems.reduce((total, item) => total + item.score, 0) / topItems.length);
  const primaryDraft: BriefingDraftInput = {
    slug: `weekly-news-${slugify(theme.label)}-${date}`,
    title: `${themeName}: radar fresco de IA e big tech`,
    dek: `Weekly News com rotatividade diaria: ${theme.label}. Curadoria combinando fontes oficiais, RSS confiavel, Perplexity e sinais do X/Twitter quando disponiveis.`,
    brief: [
      `Hoje a pauta roda em torno de ${theme.query}. O objetivo e fugir do ciclo "so ChatGPT" e abrir o radar para labs, open source, agentes, devtools, mercado e infra.`,
      ...topItems.map(signalLine),
      'Observacao editorial: posts do X/Twitter entram como sinal de tendencia, nao como fonte final. Para fatos sensiveis, valide sempre nas fontes primarias listadas.',
    ].join('\n\n'),
    takeaway:
      'A corrida de IA esta menos sobre um unico modelo vencedor e mais sobre quem entrega solucao completa: pesquisa, agente, automacao, produto e impacto real para pessoas e negocios.',
    category: theme.category,
    tags: collectTags(topItems, theme),
    sources: topItems.map((item) => ({
      title: item.title,
      url: item.url,
      publisher: item.publisher,
      publishedAt: item.publishedAt,
    })),
    relevanceScore: averageScore,
    readingMinutes: 5,
  };

  const supportingDrafts = topItems.slice(0, 2).map((item, index): BriefingDraftInput => {
    const title = index === 0 ? `${theme.label.split(':')[0]}: ${item.title}` : item.title;

    return {
      slug: `${slugify(title)}-${date}`,
      title,
      dek: `Radar ${theme.label}. Curadoria via ${providerLabel(item)}.`,
      brief: truncate(
        `${item.summary} Tema do dia: ${theme.query}. O objetivo e trazer novidade fresca, contexto e fonte verificavel sem depender de um unico laboratorio.`,
      ),
      takeaway:
        'Cheque a fonte principal, identifique se isso muda seu stack, conteudo ou negocio, e transforme o sinal em um teste pequeno ainda hoje.',
      category: item.category,
      tags: collectTags([item], theme),
      sources: [
        {
          title: item.title,
          url: item.url,
          publisher: item.publisher,
          publishedAt: item.publishedAt,
        },
      ],
      relevanceScore: item.score,
      readingMinutes: 3 + index,
    };
  });

  return [primaryDraft, ...supportingDrafts];
}

const collect = async () => {
  const theme = getDailyTheme();
  const orderedFeeds = [
    ...feedSources.filter((source) => source.category === theme.category),
    ...feedSources.filter((source) => source.category !== theme.category),
  ];
  const [perplexity, x, feedResults] = await Promise.all([
    fetchPerplexity(theme),
    fetchXSignals(theme),
    Promise.allSettled(orderedFeeds.map(fetchFeed)),
  ]);
  const feedItems = feedResults.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
  const failures = feedResults
    .map((result, index) => ({ result, source: orderedFeeds[index] }))
    .filter(({ result }) => result.status === 'rejected')
    .map(({ result, source }) => `${source?.name ?? 'RSS'}: ${(result as PromiseRejectedResult).reason}`);
  const items = [...perplexity.items, ...x.items, ...feedItems];

  return {
    items,
    notes: [
      `Theme: ${theme.label}.`,
      ...perplexity.notes,
      ...x.notes,
      `RSS collected ${feedItems.length} feed items.`,
      ...failures,
    ],
  };
};

const rank = async (state: typeof AgentState.State) => {
  const theme = getDailyTheme();
  const ranked = rankItems(state.items, theme);

  return {
    ranked,
    notes: [`Ranked ${ranked.length} source items by relevance.`],
  };
};

const synthesize = async (state: typeof AgentState.State) => {
  const theme = getDailyTheme();
  const drafts = groupIntoDrafts(state.ranked, theme);

  return {
    drafts,
    notes: [`Created ${drafts.length} auto-send candidates for ${theme.label}.`],
  };
};

const graph = new StateGraph(AgentState)
  .addNode('collect', collect)
  .addNode('rank', rank)
  .addNode('synthesize', synthesize)
  .addEdge(START, 'collect')
  .addEdge('collect', 'rank')
  .addEdge('rank', 'synthesize')
  .addEdge('synthesize', END)
  .compile();

export async function runDailyBriefingAgent() {
  const startedAt = new Date().toISOString();
  const result = await graph.invoke({});
  const finishedAt = new Date().toISOString();

  return {
    drafts: result.drafts,
    run: {
      status: 'success' as const,
      startedAt,
      finishedAt,
      sourceCount: result.items.length,
      draftCount: result.drafts.length,
      notes: result.notes,
    },
  };
}
