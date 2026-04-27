import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPublishedBriefings } from '@/lib/briefing/posts';

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
          message: 'Chat do Thiagao ainda precisa da chave DEEPSEEK_API_KEY no servidor.',
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
            content:
              'Voce e o Chat do Thiagao, assistente da newsletter ThigaoA.i. Responda em portugues do Brasil, direto, util e com tom de mentor pragmatico. Explique IA, big tech, ferramentas, automacao e os briefings do site. Nao invente fatos ou fontes; quando nao souber, diga isso e sugira um caminho pratico. Responda em ate 160 palavras.',
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
      const text = await providerResponse.text();
      return NextResponse.json(
        {
          ok: false,
          message: `DeepSeek respondeu com erro ${providerResponse.status}.`,
          detail: text.slice(0, 240),
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
