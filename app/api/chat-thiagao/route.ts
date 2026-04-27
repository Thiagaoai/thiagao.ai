import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPublishedBriefings, logNewsletterEvent } from '@/lib/briefing/posts';

const DAILY_LIMIT = 10;
const REQUEST_WINDOW_MS = 24 * 60 * 60 * 1000;

type RateEntry = {
  count: number;
  resetAt: number;
};

type DeepSeekResponse = {
  choices?: {
    message?: {
      content?: string | null;
    };
  }[];
};

const rateLimit = new Map<string, RateEntry>();

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(1200),
});

const ChatRequestSchema = z.object({
  sessionId: z.string().min(8).max(80).optional(),
  messages: z.array(ChatMessageSchema).min(1).max(10),
});

function getDayKey() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
  }).format(new Date());
}

function getTodayLabel() {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/New_York',
    dateStyle: 'long',
  }).format(new Date());
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function isUsPresidentQuestion(value: string) {
  const normalized = normalizeText(value);
  return (
    normalized.includes('presidente') &&
    /\b(eua|usa|estados unidos|united states|u\.s\.|america)\b/.test(normalized)
  );
}

function getGuardedCurrentAnswer(messages: z.infer<typeof ChatMessageSchema>[]) {
  const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user');

  if (!lastUserMessage) {
    return null;
  }

  if (isUsPresidentQuestion(lastUserMessage.content)) {
    return `Em ${getTodayLabel()}, o presidente dos Estados Unidos é Donald J. Trump, o 47º presidente. Cargos públicos podem mudar, então confirme informações políticas atuais em fontes oficiais como whitehouse.gov antes de publicar ou tomar decisão.`;
  }

  const normalized = normalizeText(lastUserMessage.content);
  const asksForCurrentFact =
    /\b(atual|hoje|agora|recente|ultimo|ultima|latest|current|preco|cotacao|ceo|presidente|primeiro ministro|governador|prefeito)\b/.test(
      normalized,
    ) || /^quem e (o|a) atual\b/.test(normalized);

  if (!asksForCurrentFact) {
    return null;
  }

  return `Eu não vou cravar esse dado como fato atual sem uma fonte recente. Para evitar fake news, confira em uma fonte oficial ou cole aqui o link/notícia que eu te ajudo a interpretar. Se for cargo público, preço, CEO, lei, lançamento ou notícia de hoje, a checagem externa é obrigatória.`;
}

function getClientKey(request: NextRequest, sessionId?: string) {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = forwardedFor || request.headers.get('x-real-ip') || 'unknown-ip';
  const session = sessionId || request.headers.get('x-thiagao-chat-session') || 'no-session';
  return `${getDayKey()}:${ip}:${session}`;
}

function getRateStatus(key: string) {
  const now = Date.now();
  const current = rateLimit.get(key);

  if (!current || current.resetAt <= now) {
    const fresh = { count: 0, resetAt: now + REQUEST_WINDOW_MS };
    rateLimit.set(key, fresh);
    return fresh;
  }

  return current;
}

function incrementRate(key: string) {
  const current = getRateStatus(key);
  current.count += 1;
  rateLimit.set(key, current);
  return current;
}

export async function POST(request: NextRequest) {
  try {
    const body = ChatRequestSchema.parse(await request.json());
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Chat do Thiagao ainda precisa ser configurado no servidor.',
        },
        { status: 503 },
      );
    }

    const clientKey = getClientKey(request, body.sessionId);
    const currentRate = getRateStatus(clientKey);

    if (currentRate.count >= DAILY_LIMIT) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Limite de 10 perguntas atingido. Volte amanhã para continuar.',
          remaining: 0,
        },
        { status: 429 },
      );
    }

    const recentMessages = body.messages.slice(-8);
    const guardedAnswer = getGuardedCurrentAnswer(recentMessages);

    if (guardedAnswer) {
      const updatedRate = incrementRate(clientKey);
      await logNewsletterEvent({
        eventType: 'chat_question',
        path: '/newsletter#chat-thiagao',
        source: 'chat-guarded',
        metadata: { guarded: true },
      });

      return NextResponse.json({
        ok: true,
        answer: guardedAnswer,
        remaining: Math.max(DAILY_LIMIT - updatedRate.count, 0),
      });
    }

    const { posts } = await getPublishedBriefings({ limit: 6 });
    const briefingContext = posts
      .slice(0, 6)
      .map(
        (post, index) =>
          `${index + 1}. ${post.title} | Categoria: ${post.category} | Resumo: ${post.dek} | Take: ${post.takeaway}`,
      )
      .join('\n');

    const providerResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.THIAGAO_CHAT_MODEL || 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `Voce e o Chat do Thiagao, assistente da newsletter ThigaoA.i. Data atual do servidor: ${getTodayLabel()} no fuso America/New_York. Responda em portugues do Brasil, direto, util e com tom de mentor pragmatico. Explique IA, big tech, ferramentas, automacao e os briefings do site. Nao invente fatos ou fontes; quando nao souber, diga isso e sugira um caminho pratico. Para fatos atuais ou volateis, como politica, cargos publicos, precos, leis, lancamentos e noticias, nao responda com certeza se nao houver contexto confiavel; diga para confirmar em fonte oficial. Responda em ate 160 palavras.`,
          },
          {
            role: 'system',
            content: briefingContext
              ? `Contexto das edicoes recentes:\n${briefingContext}`
              : 'Ainda nao ha edicoes publicadas no contexto. Responda usando conhecimento geral e deixe claro quando for uma sugestao.',
          },
          ...recentMessages,
        ],
        temperature: 0.55,
        max_tokens: 420,
        stream: false,
      }),
    });

    if (!providerResponse.ok) {
      return NextResponse.json(
        {
          ok: false,
          message: `DeepSeek respondeu com erro ${providerResponse.status}.`,
        },
        { status: 502 },
      );
    }

    const data = (await providerResponse.json()) as DeepSeekResponse;
    const answer = data.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      return NextResponse.json(
        {
          ok: false,
          message: 'DeepSeek nao retornou uma resposta valida.',
        },
        { status: 502 },
      );
    }

    const updatedRate = incrementRate(clientKey);
    await logNewsletterEvent({
      eventType: 'chat_question',
      path: '/newsletter#chat-thiagao',
      source: 'chat',
      metadata: { guarded: false },
    });

    return NextResponse.json({
      ok: true,
      answer,
      remaining: Math.max(DAILY_LIMIT - updatedRate.count, 0),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Pergunta invalida.';

    return NextResponse.json(
      {
        ok: false,
        message,
      },
      { status: 400 },
    );
  }
}
