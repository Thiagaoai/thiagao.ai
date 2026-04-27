import { NextResponse } from 'next/server';
import { sendBriefingEmail } from '@/lib/briefing/email';
import type { BriefingPost } from '@/lib/briefing/types';

export const runtime = 'nodejs';

function isAuthorized(request: Request) {
  const token = process.env.ADMIN_API_TOKEN;
  if (!token && process.env.NODE_ENV !== 'production') return true;
  if (!token) return false;

  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  return bearer === token;
}

function getGpt55TestPost(): BriefingPost {
  const now = new Date().toISOString();

  return {
    id: 'gpt-5-5-test',
    slug: 'gpt-5-5-openai-real-work',
    status: 'published',
    title: 'GPT-5.5: a OpenAI mira o trabalho real, não só respostas melhores',
    dek:
      'A nova geração foi apresentada como um modelo para programar, pesquisar, analisar dados, criar documentos e operar ferramentas com menos microgerenciamento.',
    brief:
      'A OpenAI publicou, em 23 de abril de 2026, o GPT-5.5, posicionando o modelo para tarefas complexas e fluxos de trabalho longos. O sinal importante para builders e operadores não é apenas mais inteligência em uma resposta isolada, mas a capacidade de entender uma tarefa mais cedo, usar ferramentas com mais consistência, verificar o próprio trabalho e continuar até entregar algo utilizável.',
    takeaway:
      'Teste o GPT-5.5 em tarefas reais: objetivo claro, ferramentas envolvidas, verificação do resultado e uma entrega que você conseguiria usar no negócio no mesmo dia.',
    category: 'AI',
    tags: ['AI', 'Agents', 'DevTools', 'Automacao'],
    sources: [
      {
        title: 'Introducing GPT-5.5',
        url: 'https://openai.com/index/introducing-gpt-5-5/',
        publisher: 'OpenAI',
        publishedAt: '2026-04-23T00:00:00.000Z',
      },
      {
        title: 'GPT-5.5 System Card',
        url: 'https://openai.com/index/gpt-5-5-system-card/',
        publisher: 'OpenAI',
        publishedAt: '2026-04-23T00:00:00.000Z',
      },
    ],
    relevanceScore: 98,
    readingMinutes: 4,
    publishedAt: now,
    createdAt: now,
  };
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Unauthorized.',
      },
      { status: 401 },
    );
  }

  try {
    const email = await sendBriefingEmail(getGpt55TestPost());

    return NextResponse.json({
      ok: email.sent,
      email,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Test newsletter failed.';

    return NextResponse.json(
      {
        ok: false,
        message,
      },
      { status: 500 },
    );
  }
}
