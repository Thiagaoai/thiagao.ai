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
