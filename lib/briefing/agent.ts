import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import type { BriefingDraftInput, BriefingSource, BriefingTag } from './types';

type FeedSource = {
  name: string;
  url: string;
  category: BriefingTag;
};

type SourceItem = BriefingSource & {
  category: BriefingTag;
  score: number;
  summary: string;
};

const feedSources: FeedSource[] = [
  { name: 'OpenAI', url: 'https://openai.com/news/rss.xml', category: 'AI' },
  { name: 'Google AI', url: 'https://blog.google/technology/ai/rss/', category: 'BigTech' },
  { name: 'Anthropic', url: 'https://www.anthropic.com/news/rss.xml', category: 'AI' },
  { name: 'LangChain', url: 'https://blog.langchain.com/rss/', category: 'Agents' },
  { name: 'n8n', url: 'https://blog.n8n.io/rss/', category: 'Automacao' },
  { name: 'NVIDIA', url: 'https://blogs.nvidia.com/feed/', category: 'Hardware' },
  { name: 'Cloudflare', url: 'https://blog.cloudflare.com/rss/', category: 'Infra' },
  { name: 'Hacker News AI', url: 'https://hnrss.org/newest?q=AI', category: 'DevTools' },
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

function scoreItem(item: Pick<SourceItem, 'title' | 'summary'>) {
  const text = `${item.title} ${item.summary}`.toLowerCase();
  const keywordScore = signalKeywords.reduce((score, keyword) => {
    return text.includes(keyword) ? score + 7 : score;
  }, 42);

  return Math.min(99, keywordScore);
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
      publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
      category: source.category,
      summary,
    };

    return {
      ...base,
      score: scoreItem(base),
    };
  });
}

function groupIntoDrafts(items: SourceItem[]) {
  const topItems = items
    .sort((a, b) => b.score - a.score)
    .filter((item, index, arr) => arr.findIndex((candidate) => candidate.url === item.url) === index)
    .slice(0, 5);

  return topItems.slice(0, 3).map((item, index): BriefingDraftInput => {
    const title = index === 0 ? `O sinal principal: ${item.title}` : item.title;
    const tags = Array.from(
      new Set([
        item.category,
        ...signalKeywords.filter((keyword) => `${item.title} ${item.summary}`.toLowerCase().includes(keyword)).slice(0, 4),
      ]),
    );

    return {
      slug: `${slugify(title)}-${new Date().toISOString().slice(0, 10)}`,
      title,
      dek: `Curadoria ${item.publisher}: por que isso importa para builders de IA, automacao e software.`,
      brief:
        item.summary.length > 420
          ? `${item.summary.slice(0, 417).trim()}...`
          : item.summary,
      takeaway:
        'Use este sinal para procurar uma aplicacao pratica: agente com tools, automacao de processo, conteudo tecnico ou oferta customizada para negocios reais.',
      category: item.category,
      tags,
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
}

const collect = async () => {
  const settled = await Promise.allSettled(feedSources.map(fetchFeed));
  const items = settled.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
  const failures = settled
    .map((result, index) => ({ result, source: feedSources[index] }))
    .filter(({ result }) => result.status === 'rejected')
    .map(({ result, source }) => `${source.name}: ${(result as PromiseRejectedResult).reason}`);

  return {
    items,
    notes: [`Collected ${items.length} feed items.`, ...failures],
  };
};

const rank = async (state: typeof AgentState.State) => {
  const ranked = [...state.items].sort((a, b) => b.score - a.score).slice(0, 12);

  return {
    ranked,
    notes: [`Ranked ${ranked.length} source items by relevance.`],
  };
};

const synthesize = async (state: typeof AgentState.State) => {
  const drafts = groupIntoDrafts(state.ranked);

  return {
    drafts,
    notes: [`Created ${drafts.length} human-review drafts.`],
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
