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
  /\b(ai|a\.i\.|intelig[eê]ncia artificial|artificial intelligence|llms?|gpt|chatgpt|openai|anthropic|claude|gemini|deepseek|qwen|kimi|mistral|llama|copilot|agents?|agentes?|agentic|machine learning|aprendizado de m[aá]quina|modelos? de linguagem|language models?|transformers?|diffusion|rag|mcp|codex|midjourney|sora|veo|nvidia|gpus?|inference|infer[eê]ncia|fine-?tun\w*|open[- ]weights?|rob[oô]s?|robots?|robotics|chatbots?|prompts?)\b/i;

// "IA" is the Portuguese acronym, but lowercase "ia" is a common verb form ("ele ia"), so it is matched case-sensitively.
const PT_ACRONYM = /\bIA\b/;

export function looksLikeAi(text: string) {
  return AI_PATTERN.test(text) || PT_ACRONYM.test(text);
}

const LOW_SIGNAL_PATTERN =
  /\b(outage|is down|are down|status page|not working|incident report|we'?re hiring|job opening|webinar|sponsored|giveaway|black friday|cupom|promo[cç][aã]o|desconto|\[fixed\]|live stream|livestream)\b/i;

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
